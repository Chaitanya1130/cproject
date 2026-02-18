import { useMemo, useState, useEffect } from "react";
import "../../../Css/Cards/User/DefaultQues.css";

interface Question {
  qid: number;
  qname: string;
  qpattern: string;
  link: string;
}

interface Props {
  onStatusChange: () => void;
}

export default function UserDefaultQues({ onStatusChange }: Props) {
  const [ques, setQues] = useState<Question[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, string>>({});

  /* ---- Fetch all questions ---- */
  useEffect(() => {
    const fetchQues = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://dsaanalysis-backend.onrender.com/questions/getallques", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setQues(data.questions as Question[]);
      }
    };
    fetchQues();
  }, []);

  /* ---- Fetch user progress ---- */
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://dsaanalysis-backend.onrender.com/progress", {
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

  /* ---- Group by pattern ---- */
  const groupQues = useMemo(() => {
    const res: Record<string, Question[]> = {};
    ques.forEach((q) => {
      const pattern = q.qpattern || "Others";
      if (!res[pattern]) res[pattern] = [];
      res[pattern].push(q);
    });
    return res;
  }, [ques]);

  /* ---- Handlers ---- */
  const updateStatus = async (qid: number, status: string) => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`https://dsaanalysis-backend.onrender.com/progress/status/${qid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (resp.ok) {
      setProgressMap((prev) => ({ ...prev, [qid]: status }));
      onStatusChange();
    }
  };

  const handleOpen = async (qid: number, link: string) => {
    const token = localStorage.getItem("token");
    const resp = await fetch(`https://dsaanalysis-backend.onrender.com/progress/open/${qid}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      setProgressMap((prev) => ({ ...prev, [qid]: prev[qid] ?? "learning" }));
      onStatusChange();
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
            {/* Header row */}
            <div className="quesRow header">
              <span>Problem</span>
              <span>Pattern</span>
              <span>Link</span>
              <span>Status</span>
            </div>

            {/* Data rows */}
            {groupQues[pattern].map((q) => (
              <div className="quesRow" key={q.qid}>
                <span className="problemName">{q.qname}</span>
                <span>{q.qpattern}</span>
                <span>
                  <button
                    type="button"
                    className="openBtn"
                    onClick={() => handleOpen(q.qid, q.link)}
                  >
                    Open ↗
                  </button>
                </span>
                <span>
                  <select
                    className={`statusSelect ${progressMap[q.qid] ?? "not_started"}`}
                    value={progressMap[q.qid] ?? "not_started"}
                    onChange={(e) => updateStatus(q.qid, e.target.value)}
                  >
                    <option value="not_started">Not Started</option>
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