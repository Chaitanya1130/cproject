import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserInProgress.css";

interface Props {
  onStatusChange?: () => void;
  triggerRefresh?: number; // Add this prop to trigger re-fetches
}

export default function UserQuesinProgress({ onStatusChange, triggerRefresh }: Props) {
  const [ques, setQues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuesinProgress = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/users/userinprogress", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setQues(data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch questions in progress:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on mount AND whenever triggerRefresh changes
  useEffect(() => {
    fetchQuesinProgress();
  }, [triggerRefresh]);

  if (loading) {
    return (
      <div className="displayQues">
        <h2>In Progress</h2>
        <p>Loading...</p>
      </div>
    );
  }

  let content;
  if (ques.length === 0) {
    content = <p>No questions in the learning state</p>;
  } else {
    content = (
      <table className="quesTable">
        <thead>
          <tr>
            <th>Problem Name</th>
            <th>Pattern/Topic</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {ques.map((q) => (
            <tr key={q.qid}>
              <td className="qName">{q.qname}</td>
              <td className="qPattern">{q.qpattern}</td>
              <td>
                <a href={q.link} target="_blank" rel="noreferrer" className="qLink">
                  Open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="displayQues">
      <h2>In Progress</h2>
      {content}
    </div>
  );
}