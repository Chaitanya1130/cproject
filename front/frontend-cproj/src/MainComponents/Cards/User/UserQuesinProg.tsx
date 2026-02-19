import  { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserInProgress.css";

interface Question {
  qid: number;
  qname: string;
  qpattern: string;
  link: string;
}

interface Props {
  onStatusChange?: () => void;
  triggerRefresh?: number;
}

export default function UserQuesinProgress({ triggerRefresh }: Props) {
  const [ques, setQues] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuesinProgress = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://dsaanalysis-backend.onrender.com/users/userinprogress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setQues(data.questions ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch questions in progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuesinProgress();
  }, [triggerRefresh]);

  return (
      <div className="displayQues">
        <h2>In Progress</h2>

        {loading ? (
            <p>Loading...</p>
        ) : ques.length === 0 ? (
            <p>No questions in the learning state.</p>
        ) : (
            <table className="quesTable">
              <thead>
              <tr>
                <th>Problem</th>
                <th>Pattern</th>
                <th>Link</th>
              </tr>
              </thead>
              <tbody>
              {ques.map((q) => (
                  <tr key={q.qid}>
                    <td className="qName">{q.qname}</td>
                    <td className="qPattern">{q.qpattern}</td>
                    <td>
                      <a
                          href={q.link}
                          target="_blank"
                          rel="noreferrer"
                          className="qLink"
                      >
                        Open ↗
                      </a>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}
      </div>
  );
}