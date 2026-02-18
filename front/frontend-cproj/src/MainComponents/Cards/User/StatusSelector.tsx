import React from "react";
interface Props {
  qid: number;
  status: string;
  onStatusChange: (newStatus: string) => void;
}
export default function StatusSelector({ qid, status, onStatusChange }: Props) {
  const updateStatus = async (newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `https://dsaanalysis-backend.onrender.com/progress/status/${qid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (resp.ok) {
        onStatusChange(newStatus);
      } else {
        console.error("Failed to update status:", resp.status);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  return (
    <select
      className={`statusSelect ${status ?? "not_started"}`}
      value={status ?? "not_started"}
      onChange={(e) => updateStatus(e.target.value)}
    >
      <option value="not_started">Not started</option>
      <option value="learning">Learning</option>
      <option value="done">Done</option>
      <option value="revise">Revise</option>
    </select>
  );
}