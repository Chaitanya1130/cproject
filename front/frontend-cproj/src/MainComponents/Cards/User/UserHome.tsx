import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserProfile.css"
import { useNavigate } from "react-router-dom";
import UserQuesinProgress from "./UserQuesinProg";
export default function UserHome() {
    const nav=useNavigate();
    const [user, setUser] = useState<any>(null);
    const[progress,setprogress]=useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/users/userhome", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (resp.ok) {
        setUser(await resp.json());
      }
    };

    fetchDashboardData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h1 className="welcome-text">
        Welcome back, {user.user?.name || "User"}
      </h1>

      <div className="stats">
        <h2>Completed: {user.stats?.completedQuestions ?? 0}</h2>
        <h2>Learning: {user.stats?.QuestionsInLearning ?? 0}</h2>
      </div>
      <div className="ContinueLearning">
        <button type="button" onClick={() => setprogress(!progress)}>
          {progress ? "Hide progress" : "Click here to see the problems in progress"}
        </button>      
        </div>
        {progress && <UserQuesinProgress />}
    </div>
    
  );
}
