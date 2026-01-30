import React from "react";
import { useState,useEffect } from "react";
import "../../../Css/Cards/User/UserInProgress.css"

export default function UserQuesinProgress(){
    const [ques,setQues]=useState<any[]>([]);
    useEffect(()=>{
        const fetchQuesinPrgress=async()=>{
            const token = localStorage.getItem("token");
            const resp = await fetch("http://localhost:8000/users/userinprogress", {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
        const data = await resp.json();
        setQues(data.questions);

      }
        }
        fetchQuesinPrgress();
    },[]);
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