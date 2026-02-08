import React, { useEffect, useState } from "react";
import "../../../Css/Cards/User/UserProfile.css";
import UserQuesinProgress from "./UserQuesinProg";
import UserDefaultQues from "./UserDefaultQues";
import CompletedQues from "./CompletedQues";
import StatusSelector from "./StatusSelector";

type RevisionQuestion = {
  qid: number;
  qname: string;
  qpattern: string;
  status: "learning" | "revise";
  link?: string;
};

export default function UserHome() {
  const [user, setUser] = useState<any>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Scroll state for hiding/showing top bar
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // refresh signal
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // daily practice
  const [practiceTopic, setPracticeTopic] = useState<string>("");
  const [todayQuestion, setTodayQuestion] = useState<any>(null);
  const [todayStatus, setTodayStatus] = useState("learning");

  // dropdown topics
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  
  // revision data
  const [revData, setRevData] = useState<RevisionQuestion[]>([]);
  
  // rev todo collapse/nocollapse
  const [showRev, setShowRev] = useState(false);
/* ---------------- MIDNIGHT AUTO-RELOAD ---------------- */
useEffect(() => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );

  const timeUntilMidnight = midnight.getTime() - now.getTime();

  const timer = setTimeout(() => {
    window.location.reload();
  }, timeUntilMidnight);

  return () => clearTimeout(timer);
}, []);
  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        // Near top - always show
        setShowTopBar(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide
        setShowTopBar(false);
      } else {
        // Scrolling up - show
        setShowTopBar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

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
          setAvailableTopics(data.topics || []);
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      }
    };

    fetchTopics();
  }, []);

  /* ---------------- FETCH DASHBOARD ---------------- */
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/users/userhome", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    handleRevData();
    fetchTodayQuestion();
  }, [refreshTrigger]);

  /* ---------------- UI HELPERS ---------------- */
  const closeAll = () => {
    setShowLeft(false);
    setShowRight(false);
  };

  /* ---------------- STATUS CHANGE ---------------- */
  const handleStatusChange = async () => {
    await fetchDashboardData();
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTodayStatusChange = async (newStatus: string) => {
    setTodayStatus(newStatus);
    await handleStatusChange();
  };

  const handleRevData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:8000/questions/revision", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        throw new Error("Failed to fetch revision data");
      }
      const data = await resp.json();
      setRevData(data.revisionQues);
    } catch (err) {
      console.error("Failed to get revision data", err);
      setRevData([]);
    }
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
        const question = data.question;

        const normalizedQuestion = {
          ...question,
          qid: question.qid,
        };

        // setTodayQuestion(normalizedQuestion);
        await fetchTodayQuestion();
        setTodayStatus("learning");
      } else {
        console.error("Failed to start practice:", resp.status);
      }
    } catch (err) {
      console.error("Failed to start daily practice", err);
    }
  };
  const fetchTodayQuestion = async () => {
  try {
    const token = localStorage.getItem("token");
    const resp = await fetch("http://localhost:8000/questions/today", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) throw new Error("Failed to fetch today question");

    const data = await resp.json();
    setTodayQuestion(data.question); // may be null
  } catch (err) {
    console.error("Failed to fetch today question", err);
    setTodayQuestion(null);
  }
};

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      {(showLeft || showRight) && <div className="scrim" onClick={closeAll} />}

      {/* ---------------- TOP BAR (Scroll-aware) ---------------- */}
      <div className={`topBar ${showTopBar ? "visible" : "hidden"}`}>
        <button className="panelBtn" onClick={() => setShowLeft((p) => !p)}>
          {showLeft ? "" : "All Questions"}
        </button>
        <button className="panelBtn" onClick={() => setShowRight((p) => !p)}>
          {showRight ? "" : "In Progress"}
        </button>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className={`mainContent ${showLeft || showRight ? "blurred" : ""}`}>
        <h1 className="welcome-text">
          Welcome back, {user.user?.name || "User"}
        </h1>

        <div className="stats">
          <h2>
            Completed Total Number of Ques:{" "}
            {user.stats?.completedQuestions ?? 0}
          </h2>
          <h2>Learning: {user.stats?.QuestionsInLearning ?? 0}</h2>
        </div>

        {/* ---------------- COMPLETED QUESTIONS ---------------- */}
        <div className="todaysQues">
          <CompletedQues triggerRefresh={refreshTrigger} />
        </div>

        {/* ---------------- DAILY PRACTICE ---------------- */}
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
          <div className="todayQuestionWrapper">
            <div className="todayQuestionCard">
              <h3>Today's Question</h3>

              <table className="todayQuestionTable">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <a
                        href={todayQuestion.link}
                        target="_blank"
                        rel="noreferrer"
                        className="openBtn"
                      >
                        {todayQuestion.qname}
                      </a>
                    </td>

                    <td>
                      {todayQuestion.qid ? (
                        <StatusSelector
                          qid={todayQuestion.qid}
                          status={todayStatus}
                          onStatusChange={handleTodayStatusChange}
                        />
                      ) : (
                        <span style={{ color: "red" }}>qid missing</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------REVISION TODO------------- */}
        {!showRev && (
          <div className="revtodo">
            <h3>Revision Todo</h3>
            {revData.length === 0 ? (
              <p className="emptytext">No revision questions for now!</p>
            ) : (
              <table className="revTable">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Pattern</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  {revData.map((q) => (
                    <tr key={q.qid}>
                      <td>
                        <a
                          href={q.link}
                          target="_blank"
                          rel="noreferrer"
                          className="openBtn"
                        >
                          {q.qname}
                        </a>
                      </td>

                      <td>{q.qpattern}</td>

                      <td>
                        <StatusSelector
                          qid={q.qid}
                          status={q.status}
                          onStatusChange={handleStatusChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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