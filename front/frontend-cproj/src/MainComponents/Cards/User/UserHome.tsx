import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserProfile.css";
import UserQuesinProgress from "./UserQuesinProg";
import UserDefaultQues from "./UserDefaultQues";

export default function UserHome() {
  const [user, setUser] = useState<any>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/users/userhome", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.ok) {
        setUser(await resp.json());
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to close everything
  const closeAll = () => {
    setShowLeft(false);
    setShowRight(false);
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {/* Background click-catcher to close panels */}
      {(showLeft || showRight) && <div className="scrim" onClick={closeAll} />}

      {/* ================= TOP BAR ================= */}
      <div className="topBar">
        <button className="panelBtn" onClick={() => setShowLeft(p => !p)}>
          {showLeft ? "Close All" : "All Questions"}
        </button>

        <button className="panelBtn" onClick={() => setShowRight(p => !p)}>
          {showRight ? "Close Progress" : "In Progress"}
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className={`mainContent ${showLeft || showRight ? "blurred" : ""}`}>
        <h1 className="welcome-text">
          Welcome back, {user.user?.name || "User"}
        </h1>

        <div className="stats">
          <h2>Completed: {user.stats?.completedQuestions ?? 0}</h2>
          <h2>Learning: {user.stats?.QuestionsInLearning ?? 0}</h2>
        </div>
      </div>

      {/* ================= PANELS (FIXED WIDTHS) ================= */}
      {showLeft && (
        <div className="leftPanel">
          <UserDefaultQues />
        </div>
      )}

      {showRight && (
        <div className="rightPanel">
          <UserQuesinProgress />
        </div>
      )}
    </div>
  );
}