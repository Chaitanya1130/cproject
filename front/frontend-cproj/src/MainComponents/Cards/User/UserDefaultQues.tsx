import React, { useMemo } from "react";
import { useState,useEffect } from "react";

import '../../../Css/Cards/User/DefaultQues.css'

export default function UserDefaultQues(){
    const [ques,setQues]=useState<any[]>([]);
    useEffect(()=>{
            const fetchQuesinPrgress=async()=>{
                const token = localStorage.getItem("token");
                const resp = await fetch("http://localhost:8000/questions/getallques", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resp.ok) {
            const data = await resp.json();
            console.log("API response:", data);
            setQues(data.questions);
    
          }
            }
            fetchQuesinPrgress();
        },[]);
        // const groupQues:any={};
        // ques.forEach((q)=>{
        //     const pattern=q.qpattern||'Others';
        //     if(!groupQues[pattern]){
        //         groupQues[pattern]=[];
        //     }
        //     groupQues[pattern].push(q);
        // })
        //using useMemo to cache the already present questions
        const groupQues=useMemo(()=>{
          const res:any={};
          ques.forEach((q)=>{
            const pattern=q.qpattern||'Others';
            if(!res[pattern]){
              res[pattern]=[];
            }
            res[pattern].push(q);
          });
          return res;
        },[ques])
   return (
  <div className="displayQues">
    <h2 className="sectionTitle">All Questions</h2>

    {/* 1. Loop through the patterns (e.g., 'Two Pointers', 'Sliding Window') */}
    {Object.keys(groupQues).map((pattern) => (
      <div key={pattern} className="patternSection">
        <h3 className="patternHeader">{pattern}</h3>
        
        <div className="quesTable">
          <div className="quesRow header">
            <span className="problemName">Problem Name</span>
            <span className="problemTopic">Topic</span>
            <span>Action</span>
          </div>

          {/* 2. Loop through only the questions belonging to THIS pattern */}
          {groupQues[pattern].map((q: any) => (
            <div className="quesRow" key={q.qid}>
              <span className="problemName">{q.qname}</span>
              <span className="pattern">{q.qpattern}</span>
              <span>
                <a href={q.link} target="_blank" rel="noreferrer" className="openBtn">
                  Open
                </a>
              </span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

}