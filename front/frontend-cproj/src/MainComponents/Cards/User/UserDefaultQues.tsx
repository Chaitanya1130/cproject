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

// eslint-disable-next-line no-empty-pattern
export default function UserDefaultQues({ }: Props) {
  const [ques, setQues] = useState<Question[]>([]);

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

  const groupQues = useMemo(() => {
    const res: Record<string, Question[]> = {};
    ques.forEach((q) => {
      const pattern = q.qpattern || "Others";
      if (!res[pattern]) res[pattern] = [];
      res[pattern].push(q);
    });
    return res;
  }, [ques]);

  const handleOpen = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
      <div className="displayQues">
        <h2 className="sectionTitle">All Questions</h2>

        {Object.keys(groupQues).map((pattern) => (
            <div key={pattern} className="patternSection">
              <h3 className="patternHeader">
                <span className="patternDot" />
                {pattern}
                <span className="patternCount">{groupQues[pattern].length}</span>
              </h3>

              <div className="quesGrid">
                {groupQues[pattern].map((q) => (
                    <div className="quesCard" key={q.qid}>
                      <span className="quesName">{q.qname}</span>
                      <button
                          type="button"
                          className="openBtn"
                          onClick={() => handleOpen(q.link)}
                      >
                        Open ↗
                      </button>
                    </div>
                ))}
              </div>
            </div>
        ))}
      </div>
  );
}