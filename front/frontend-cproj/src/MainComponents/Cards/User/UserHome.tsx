import { useEffect, useState, useCallback } from "react";
import "../../../Css/Cards/User/UserProfile.css";
import UserQuesinProgress from "./UserQuesinProg";
import UserDefaultQues from "./UserDefaultQues";
import StatusSelector from "./StatusSelector";
import AnalyticsPage from "./AnalyticsPage";
interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

function PlannerInfoModal({ open, onClose }: InfoModalProps) {
  if (!open) return null;
  return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card info-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-x" onClick={onClose}>✕</button>
          <h2 className="modal-title">Spaced Repetition Engine 🧠</h2>
          <p className="modal-subtitle">How your revision schedule is calculated:</p>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label learning">Learning</span>
              <span className="info-desc">Struggling? Schedules for <strong>Tomorrow</strong>.</span>
            </div>
            <div className="info-row">
              <span className="info-label revise">Revise</span>
              <span className="info-desc">Getting there! Schedules for <strong>3 Days later</strong>.</span>
            </div>
            <div className="info-row">
              <span className="info-label done">Done</span>
              <span className="info-desc">Mastered! Progression: <strong>8d → 16d → 60d</strong>.</span>
            </div>
          </div>
          <div className="info-footer">
            <p>🔥 <strong>Streak:</strong> Solving a question 3x in a row unlocks point bonuses!</p>
          </div>
        </div>
      </div>
  );
}
/* ============================================================
   CONFIRM MODAL
   ============================================================ */
interface ConfirmModalProps {
  open: boolean;
  onConfirm: (yes: boolean) => void;
}

function ConfirmModal({ open, onConfirm }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onConfirm(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onConfirm]);

  if (!open) return null;

  return (
      <div className="modal-backdrop" onClick={() => onConfirm(false)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-icon">🧠</div>
          <h2 className="modal-title">Independent Solve?</h2>
          <p className="modal-body">
            Did you figure this out <strong>without hints or solutions</strong>?
            <br />
            Earn <span className="modal-points">+10 points</span> for solving it on your own.
          </p>
          <div className="modal-actions">
            <button className="modal-btn modal-btn-no" onClick={() => onConfirm(false)}>
              Used hints
            </button>
            <button className="modal-btn modal-btn-yes" onClick={() => onConfirm(true)}>
              Yes, solved it! 🎉
            </button>
          </div>
        </div>
      </div>
  );
}

/* ============================================================
   INTERFACES
   ============================================================ */
interface Question {
  qid: number;
  qname: string;
  qpattern: string;
  link: string;
  status?: string;
  success_streak?: number;
}

type RevisionQuestion = {
  qid: number;
  qname: string;
  qpattern: string;
  status: "learning" | "revise" | "done";
  link?: string;
};

interface UserDashboardData {
  user: { name: string; email: string };
  stats: { completedQuestions: number; QuestionsInLearning: number };
}

interface PendingStatus {
  qid: number;
  status: string;
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function UserHome() {
  const [user, setUser] = useState<UserDashboardData | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [practiceTopic, setPracticeTopic] = useState("");
  const [todayQuestion, setTodayQuestion] = useState<Question | null>(null);
  const [todayStatus, setTodayStatus] = useState("learning");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [revData, setRevData] = useState<RevisionQuestion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PendingStatus | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  /* ---------------- MIDNIGHT RELOAD ---------------- */
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const timer = setTimeout(() => window.location.reload(), midnight.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- SCROLL HANDLER ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 60) setShowTopBar(true);
      else if (y > lastScrollY + 8) setShowTopBar(false);
      else if (y < lastScrollY - 8) setShowTopBar(true);
      setLastScrollY(y);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  /* ---------------- DATA FETCHING ---------------- */
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [userResp, topicResp, todayResp, revResp] = await Promise.all([
        fetch("https://dsaanalysis-backend.onrender.com/users/userhome", { headers }),
        fetch("https://dsaanalysis-backend.onrender.com/questions/topics", { headers }),
        fetch("https://dsaanalysis-backend.onrender.com/questions/today", { headers }),
        fetch("https://dsaanalysis-backend.onrender.com/questions/revision", { headers }),
      ]);
      if (userResp.ok) setUser(await userResp.json());
      if (topicResp.ok) {
        const d = await topicResp.json();
        setAvailableTopics(d.topics || []);
      }
      if (todayResp.ok) {
        const d = await todayResp.json();
        const q = d.question ?? null;
        setTodayQuestion(q);
        setTodayStatus(q?.status ?? "learning");
      }
      if (revResp.ok) {
        const d = await revResp.json();
        setRevData(d.revisionQues || []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  /* ---------------- STATUS HANDLERS ---------------- */
  const submitStatusUpdate = async (qid: number, status: string, solvedIndependently: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://dsaanalysis-backend.onrender.com/questions/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ qid, status, solvedIndependently }),
      });
      if (resp.ok) setRefreshTrigger((p) => p + 1);
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleStatusUpdate = (qid: number, newStatus: string) => {
    if (newStatus === "done" || newStatus === "revise") {
      setPendingStatus({ qid, status: newStatus });
      setModalOpen(true);
    } else {
      submitStatusUpdate(qid, newStatus, false);
    }
  };

  const handleModalConfirm = (solvedIndependently: boolean) => {
    setModalOpen(false);
    if (pendingStatus) {
      submitStatusUpdate(pendingStatus.qid, pendingStatus.status, solvedIndependently);
      setPendingStatus(null);
    }
  };

  /* ---------------- START PRACTICE ---------------- */
  const handleStartPractice = async () => {
    if (!practiceTopic) return;
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://dsaanalysis-backend.onrender.com/questions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: practiceTopic }),
      });
      if (resp.ok) {
        setPracticeTopic("");
        setRefreshTrigger((p) => p + 1);
      } else {
        const err = await resp.json().catch(() => ({}));
        console.error("Start practice failed:", resp.status, err);
      }
    } catch (err) {
      console.error("Start Error:", err);
    }
  };

  /* ---------------- NAV HELPERS ---------------- */
  const openTopics = () => { setShowLeft(!showLeft); setShowRight(false); setShowAnalytics(false); };
  const openProgress = () => { setShowRight(!showRight); setShowLeft(false); setShowAnalytics(false); };
  const openAnalytics = () => { setShowAnalytics(!showAnalytics); setShowLeft(false); setShowRight(false); };

  if (!user)
    return (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading Dashboard...</p>
        </div>
    );

  const learningList = revData.filter((q) => q.status === "learning");
  const reviseList   = revData.filter((q) => q.status === "revise");

  return (

      <div className="dashboard">
        {/* ---- MODAL ---- */}
        <ConfirmModal open={modalOpen} onConfirm={handleModalConfirm} />
        <PlannerInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
        {/* ---- SCRIM (panels only) ---- */}
        {(showLeft || showRight) && (
            <div className="scrim" onClick={() => { setShowLeft(false); setShowRight(false); }} />
        )}
        <button className="info-trigger" onClick={() => setInfoOpen(true)} title="How it works">i</button>
        {/* ---- TOP NAV ---- */}
        <nav className={`topBar${showTopBar ? "" : " hidden"}`}>
          <button className={`panelBtn${showLeft ? " active" : ""}`} onClick={openTopics}>
            {showLeft ? "✕ Close" : "Topics"}
          </button>
          <button className={`panelBtn${showRight ? " active" : ""}`} onClick={openProgress}>
            {showRight ? "✕ Close" : "Progress"}
          </button>
          <button className={`panelBtn${showAnalytics ? " active" : ""}`} onClick={openAnalytics}>
            {showAnalytics ? "✕ Dashboard" : "Analytics"}
          </button>
        </nav>

        {/* ---- ANALYTICS PAGE (full swap) ---- */}
        {showAnalytics ? (
            <AnalyticsPage />
        ) : (
            /* ---- MAIN DASHBOARD ---- */
            <main className={`mainContent${showLeft || showRight ? " blurred" : ""}`}>

              {/* WELCOME */}
              <header className="welcome-header">
                <h1 className="welcome-text">
                  Welcome back, <span>{user.user?.name}</span>
                </h1>
                <p className="welcome-sub">Here is your spaced-repetition plan for today.</p>
              </header>

              {/* STATS */}
              <div className="stats-container">
                <div className="stat-card">
                  <span className="stat-icon green">✓</span>
                  <div className="stat-info">
                    <span className="stat-label">Total Completed</span>
                    <span className="stat-value">{user.stats?.completedQuestions ?? 0}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon blue">⟳</span>
                  <div className="stat-info">
                    <span className="stat-label">In Learning</span>
                    <span className="stat-value">{user.stats?.QuestionsInLearning ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* ---- TODAY'S TASK ---- */}
              <section className="dashboard-section">
                <div className="section-header"><h3>Daily Focus</h3></div>
                <div className="todayQuestionWrapper card">
                  {!todayQuestion ? (
                      <div className="inputfield">
                        <span className="inputLabel">Assign Today's Question</span>
                        <div className="inputBox">
                          <select value={practiceTopic} onChange={(e) => setPracticeTopic(e.target.value)}>
                            <option value="">Select a Topic</option>
                            {availableTopics.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button onClick={handleStartPractice} disabled={!practiceTopic} className="btn-primary">
                            Generate →
                          </button>
                        </div>
                        <p className="inputHint">Pick a pattern you want to master today.</p>
                      </div>
                  ) : (
                      <div className="today-ques-content">
                        <div className="ques-info-group">
                          <h3>
                            {todayQuestion.qname}
                            {(todayQuestion.success_streak ?? 0) >= 3 && (
                                <span className="badge-streak">🔥 {todayQuestion.success_streak} Streak</span>
                            )}
                          </h3>
                          <p className="pattern-label">{todayQuestion.qpattern}</p>
                        </div>
                        <div className="question-actions">
                          {todayQuestion.link && (
                              <a className="openBtn" href={todayQuestion.link} target="_blank" rel="noreferrer">
                                Solve Now ↗
                              </a>
                          )}
                          <StatusSelector
                              qid={todayQuestion.qid}
                              status={todayStatus}
                              onStatusChange={(s) => handleStatusUpdate(todayQuestion.qid, s)}
                          />
                        </div>
                      </div>
                  )}
                </div>
              </section>

              {/* ---- DUAL TODO SPLIT ---- */}
              <section className="dashboard-section">
                <div className="section-header"><h3>Scheduled Revisions</h3></div>
                <div className="todo-split">

                  {/* LEFT — Learning */}
                  <div className="todo-col card">
                    <div className="todo-col-header">
                      <span className="todo-col-dot learning-dot" />
                      <h4>Learning</h4>
                      <span className="todo-col-count">{learningList.length}</span>
                    </div>
                    {learningList.length === 0 ? (
                        <p className="emptytext">No active learning questions.</p>
                    ) : (
                        <div className="rev-list">
                          {learningList.map((q) => (
                              <div className="rev-item" key={q.qid}>
                                <span className="rev-item-name">{q.qname}</span>
                                <div className="rev-item-right">
                                  {q.link && <a className="iconBtn" href={q.link} target="_blank" rel="noreferrer">↗</a>}
                                  <StatusSelector
                                      qid={q.qid}
                                      status={q.status}
                                      onStatusChange={(s) => handleStatusUpdate(q.qid, s)}
                                  />
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                  <div className="todo-divider" />

                  {/* RIGHT — Revision */}
                  <div className="todo-col card">
                    <div className="todo-col-header">
                      <span className="todo-col-dot revise-dot" />
                      <h4>Revision</h4>
                      <span className="todo-col-count">{reviseList.length}</span>
                    </div>
                    {reviseList.length === 0 ? (
                        <p className="emptytext">Revision queue is empty!</p>
                    ) : (
                        <div className="rev-list">
                          {reviseList.map((q) => (
                              <div className="rev-item" key={q.qid}>
                                <span className="rev-item-name">{q.qname}</span>
                                <div className="rev-item-right">
                                  {q.link && <a className="iconBtn" href={q.link} target="_blank" rel="noreferrer">↗</a>}
                                  <StatusSelector
                                      qid={q.qid}
                                      status={q.status}
                                      onStatusChange={(s) => handleStatusUpdate(q.qid, s)}
                                  />
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                </div>
              </section>

            </main>
        )}

        {/* ---- SIDE PANELS (only shown on dashboard, not analytics) ---- */}
        {!showAnalytics && (
            <>
              <aside className={`leftPanel${showLeft ? " open" : ""}`}>
                <UserDefaultQues onStatusChange={() => setRefreshTrigger((p) => p + 1)} />
              </aside>
              <aside className={`rightPanel${showRight ? " open" : ""}`}>
                <UserQuesinProgress triggerRefresh={refreshTrigger} />
              </aside>
            </>
        )}
      </div>
  );
}