import React, { useMemo, useState, useEffect } from "react";
import "../../../Css/Cards/User/DefaultQues.css";

// Fixes: 'onStatusChange' does not exist on type 'IntrinsicAttributes'
interface Props {
  onStatusChange: () => void;
}

export default function UserDefaultQues({ onStatusChange }: Props) {
  const [ques, setQues] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchQues = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/questions/getallques", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setQues(data.questions);
      }
    };
    fetchQues();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const map: Record<number, string> = {};
        data.progress.forEach((p: any) => { map[p.qid] = p.status; });
        setProgressMap(map);
      }
    };
    fetchProgress();
  }, []);

  const groupQues = useMemo(() => {
    const res: any = {};
    ques.forEach((q) => {
      const pattern = q.qpattern || "Others";
      if (!res[pattern]) res[pattern] = [];
      res[pattern].push(q);
    });
    return res;
  }, [ques]);

  const updateStatus = async (qid: number, status: string) => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`http://localhost:8000/progress/status/${qid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (resp.ok) {
      setProgressMap((prev) => ({ ...prev, [qid]: status }));
      onStatusChange(); // Tell parent to update dashboard counts
    }
  };

  const handleOpen = async (qid: number, link: string) => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`http://localhost:8000/progress/open/${qid}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (resp.ok) {
      setProgressMap((prev) => ({ ...prev, [qid]: prev[qid] ?? "learning" }));
      onStatusChange(); // Tell parent to update dashboard counts
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="displayQues">
      <h2 className="sectionTitle">All Questions</h2>
      {Object.keys(groupQues).map((pattern) => (
        <div key={pattern} className="patternSection">
          <h3 className="patternHeader">{pattern}</h3>
          <div className="quesTable">
            <div className="quesRow header">
              <span className="problemName">Problem Name</span>
              <span>Topic</span>
              <span>Action</span>
              <span>Status</span>
            </div>
            {groupQues[pattern].map((q: any) => (
              <div className="quesRow" key={q.qid}>
                <span className="problemName">{q.qname}</span>
                <span>{q.qpattern}</span>
                <span>
                  <button type="button" className="openBtn" onClick={() => handleOpen(q.qid, q.link)}>Open</button>
                </span>
                <span>
                  <select
                    className={`statusSelect ${progressMap[q.qid] ?? "not_started"}`}
                    value={progressMap[q.qid] ?? "not_started"}
                    onChange={(e) => updateStatus(q.qid, e.target.value)}
                  >
                    <option value="not_started">Not started</option>
                    <option value="learning">Learning</option>
                    <option value="done">Done</option>
                    <option value="revise">Revise</option>
                  </select>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}