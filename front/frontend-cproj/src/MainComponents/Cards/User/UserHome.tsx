import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserProfile.css";
import UserQuesinProgress from "./UserQuesinProg";
import UserDefaultQues from "./UserDefaultQues";

export default function UserHome() {
  const [user, setUser] = useState<any>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  // This function acts as the "Signal" to update everything
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const resp = await fetch("http://localhost:8000/users/userhome", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      setUser(await resp.json());
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const closeAll = () => {
    setShowLeft(false);
    setShowRight(false);
  };

  // Updated handler that refreshes both dashboard stats AND the in-progress panel
  const handleStatusChange = async () => {
    await fetchDashboardData(); // Update stats
    setRefreshTrigger(prev => prev + 1); // Trigger In Progress panel refresh
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {(showLeft || showRight) && <div className="scrim" onClick={closeAll} />}

      <div className="topBar">
        <button className="panelBtn" onClick={() => setShowLeft(p => !p)}>
          {showLeft ? "X" : "All Questions"}
        </button>
        <button className="panelBtn" onClick={() => setShowRight(p => !p)}>
          {showRight ? "X" : "In Progress"}
        </button>
      </div>

      <div className={`mainContent ${showLeft || showRight ? "blurred" : ""}`}>
        <h1 className="welcome-text">
          Welcome back, {user.user?.name || "User"}
        </h1>
        <div className="stats">
          <h2>Completed: {user.stats?.completedQuestions ?? 0}</h2>
          <h2>Learning: {user.stats?.QuestionsInLearning ?? 0}</h2>
        </div>
      </div>

      {/* Pass the updated handler to UserDefaultQues */}
      {showLeft && (
        <div className="leftPanel">
          <UserDefaultQues onStatusChange={handleStatusChange} />
        </div>
      )}

      {/* Pass the refresh trigger to UserQuesinProgress */}
      {showRight && (
        <div className="rightPanel">
          <UserQuesinProgress triggerRefresh={refreshTrigger} />
        </div>
      )}
    </div>
  );
}