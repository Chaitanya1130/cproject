import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserProfile.css";
import UserQuesinProgress from "./UserQuesinProg";
import UserDefaultQues from "./UserDefaultQues";
import CompletedQues from "./CompletedQues";
import StatusSelector from "./StatusSelector";

export default function UserHome() {
  const [user, setUser] = useState<any>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // refresh signal
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // daily practice
  const [practiceTopic, setPracticeTopic] = useState("");
  const [todayQuestion, setTodayQuestion] = useState<any>(null);
  const [todayStatus, setTodayStatus] = useState("learning");

  // dropdown topics
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  /* ---------------- FETCH TOPICS ---------------- */
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetch("http://localhost:8000/questions/topics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resp.ok) {
          const data = await resp.json();
          console.log("📚 Topics data:", data);
          setAvailableTopics(data.topics || []);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      }
    };

    fetchTopics();
  }, []);

  /* ---------------- DASHBOARD DATA ---------------- */
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/users/userhome", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setUser(await resp.json());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const closeAll = () => {
    setShowLeft(false);
    setShowRight(false);
  };

  /* ---------------- STATUS CHANGE SIGNAL ---------------- */
  const handleStatusChange = async () => {
    console.log("🔄 Status changed, refreshing dashboard...");
    await fetchDashboardData();
    
    // Wait for database sync
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setRefreshTrigger((prev) => prev + 1);
  };

  /* ---------------- TODAY'S QUESTION STATUS CHANGE ---------------- */
  const handleTodayStatusChange = async (newStatus: string) => {
    console.log("📝 Today's question status changing to:", newStatus);
    setTodayStatus(newStatus);
    await handleStatusChange();
  };

  /* ---------------- START PRACTICE ---------------- */
  const handleStartPractice = async () => {
    try {
      const token = localStorage.getItem("token");

      const resp = await fetch("http://localhost:8000/questions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: practiceTopic }),
      });

      if (resp.ok) {
        const data = await resp.json();
        console.log("🎯 Received question data:", data);
        
        // CRITICAL: Log to see what fields are available
        console.log("Question object:", data.question);
        console.log("qid:", data.question?.qid);
        console.log("id:", data.question?.id);
        
        // Check all possible qid field names
        const question = data.question;
        const questionId = question.qid || question.id || question.question_id;
        
        if (!questionId) {
          console.error("❌ No qid found in question object!", question);
          alert("Error: Question ID not found. Please check backend response.");
          return;
        }
        
        // Ensure qid is set correctly
        const normalizedQuestion = {
          ...question,
          qid: questionId  // Make sure qid exists
        };
        
        console.log("✅ Normalized question:", normalizedQuestion);
        setTodayQuestion(normalizedQuestion);
        setTodayStatus("learning");
      } else {
        console.error("Failed to start practice:", resp.status);
      }
    } catch (err) {
      console.error("Failed to start daily practice", err);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {(showLeft || showRight) && <div className="scrim" onClick={closeAll} />}

      {/* ---------------- TOP BAR ---------------- */}
      <div className="topBar">
        <button className="panelBtn" onClick={() => setShowLeft((p) => !p)}>
          {showLeft ? "X" : "All Questions"}
        </button>
        <button className="panelBtn" onClick={() => setShowRight((p) => !p)}>
          {showRight ? "X" : "In Progress"}
        </button>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className={`mainContent ${showLeft || showRight ? "blurred" : ""}`}>
        <h1 className="welcome-text">
          Welcome back, {user.user?.name || "User"}
        </h1>

        <div className="stats">
          <h2>Completed: {user.stats?.completedQuestions ?? 0}</h2>
          <h2>Learning: {user.stats?.QuestionsInLearning ?? 0}</h2>
        </div>

        {/* Completed Topics */}
        <div className="todaysQues">
          <CompletedQues triggerRefresh={refreshTrigger} />
        </div>

        {/* ---------------- DAILY PRACTICE SELECT ---------------- */}
        {!todayQuestion && (
          <div className="inputfield">
            <p className="inputLabel">What do you want to practice?</p>

            <div className="inputBox">
              <select
                value={practiceTopic}
                onChange={(e) => setPracticeTopic(e.target.value)}
              >
                <option value="">Select a topic</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>

              <button disabled={!practiceTopic} onClick={handleStartPractice}>
                Start
              </button>
            </div>

            <p className="inputHint">
              You'll get one question per day from this topic
            </p>
          </div>
        )}

        {/* ---------------- TODAY'S QUESTION ---------------- */}
        {todayQuestion && (
          <div className="todayQuestionCard">
            <h3>Today's Question</h3>

            <a
              href={todayQuestion.link}
              target="_blank"
              rel="noreferrer"
              className="openBtn"
            >
              {todayQuestion.qname}
            </a>

            {/* Debug: Show qid */}
            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '8px' }}>
            </p>

            {todayQuestion.qid ? (
              <StatusSelector
                qid={todayQuestion.qid}
                status={todayStatus}
                onStatusChange={handleTodayStatusChange}
              />
            ) : (
              <p style={{ color: 'red' }}>Error: Cannot update status - qid missing</p>
            )}
          </div>
        )}
      </div>

      {/* ---------------- PANELS ---------------- */}
      {showLeft && (
        <div className="leftPanel">
          <UserDefaultQues onStatusChange={handleStatusChange} />
        </div>
      )}

      {showRight && (
        <div className="rightPanel">
          <UserQuesinProgress triggerRefresh={refreshTrigger} />
        </div>
      )}
    </div>
  );
}