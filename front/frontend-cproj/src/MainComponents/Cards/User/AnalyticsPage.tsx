import { useEffect, useState, useCallback } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import "../../../Css/Cards/User/Analytics.css";

/* ============================================================
   INTERFACES
   ============================================================ */
interface ActivityDay {
    date: string;    // "2025-01-15"
    count: number;   // reviews that day
}

interface TimelinePoint {
    date: string;    // "Jan", "Feb" etc
    completed: number;
    reviewed: number;
}

interface TopicStat {
    topic: string;
    done: number;
    learning: number;
    revise: number;
}

interface AnalyticsData {
    activity: ActivityDay[];
    timeline: TimelinePoint[];
    topics: TopicStat[];
    summary: {
        totalSolved: number;
        currentStreak: number;
        longestStreak: number;
        totalReviews: number;
    };
}

const EMPTY: AnalyticsData = {
    activity: [],
    timeline: [],
    topics: [],
    summary: { totalSolved: 0, currentStreak: 0, longestStreak: 0, totalReviews: 0 },
};

/* ============================================================
   HEATMAP HELPERS
   ============================================================ */
function getHeatColor(count: number): string {
    if (count === 0) return "var(--heat-0)";
    if (count <= 2)  return "var(--heat-1)";
    if (count <= 4)  return "var(--heat-2)";
    if (count <= 6)  return "var(--heat-3)";
    return "var(--heat-4)";
}

function groupByWeek(days: ActivityDay[]): ActivityDay[][] {
    const weeks: ActivityDay[][] = [];
    let week: ActivityDay[] = [];
    days.forEach((d, i) => {
        week.push(d);
        if (week.length === 7 || i === days.length - 1) {
            weeks.push(week);
            week = [];
        }
    });
    return weeks;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS   = ["","Mon","","Wed","","Fri",""];

/* ============================================================
   TOOLTIPS
   ============================================================ */
function LineTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="chart-tooltip-row">
                    <span>{p.name}</span>
                    <span>{p.value}</span>
                </p>
            ))}
        </div>
    );
}

function BarTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.fill }} className="chart-tooltip-row">
                    <span>{p.name}</span>
                    <span>{p.value}</span>
                </p>
            ))}
        </div>
    );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [hoverDate, setHoverDate] = useState<{
        date: string; count: number; x: number; y: number;
    } | null>(null);

    // ── Wire up your endpoint here ──────────────────────────────
    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch("http://localhost:8000/analysis/data", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
                const d = await resp.json();
                setData(d);
            }
        } catch (err) {
            console.error("Analytics fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, []);
    // ────────────────────────────────────────────────────────────

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    const weeks = groupByWeek(data.activity);

    const monthPositions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
        if (!week[0]) return;
        const month = new Date(week[0].date).getMonth();
        if (month !== lastMonth) {
            monthPositions.push({ label: MONTH_LABELS[month], col: wi });
            lastMonth = month;
        }
    });

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="loading-spinner" />
                <p>Loading Analytics...</p>
            </div>
        );
    }

    return (
        <div className="analytics-page">

            {/* ---- HEADER ---- */}
            <header className="analytics-header">
                <h1 className="analytics-title">Analytics</h1>
                <p className="analytics-sub">Your problem-solving journey at a glance.</p>
            </header>

            {/* ---- SUMMARY CARDS ---- */}
            <div className="summary-grid">
                <div className="summary-card">
                    <span className="summary-icon" style={{ color: "var(--accent-green)" }}>✓</span>
                    <div>
                        <span className="summary-label">Problems Solved</span>
                        <span className="summary-value">{data.summary.totalSolved}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-icon" style={{ color: "var(--accent-amber)" }}>🔥</span>
                    <div>
                        <span className="summary-label">Current Streak</span>
                        <span className="summary-value">{data.summary.currentStreak} days</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-icon" style={{ color: "var(--accent-violet)" }}>⚡</span>
                    <div>
                        <span className="summary-label">Longest Streak</span>
                        <span className="summary-value">{data.summary.longestStreak} days</span>
                    </div>
                </div>
                <div className="summary-card">
                    <span className="summary-icon" style={{ color: "var(--accent-blue)" }}>⟳</span>
                    <div>
                        <span className="summary-label">Total Reviews</span>
                        <span className="summary-value">{data.summary.totalReviews}</span>
                    </div>
                </div>
            </div>

            {/* ---- ACTIVITY HEATMAP ---- */}
            <section className="analytics-section">
                <div className="section-header">
                    <h3>Activity Heatmap</h3>
                </div>
                <div className="chart-card">
                    {data.activity.length === 0 ? (
                        <p className="chart-empty">No activity data yet.</p>
                    ) : (
                        <>
                            <div className="heatmap-wrapper">
                                <div className="heatmap-day-labels">
                                    {DAY_LABELS.map((d, i) => (
                                        <span key={i} className="heatmap-day-label">{d}</span>
                                    ))}
                                </div>
                                <div className="heatmap-right">
                                    <div className="heatmap-month-row"
                                         style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
                                        {weeks.map((_, wi) => {
                                            const mp = monthPositions.find(m => m.col === wi);
                                            return (
                                                <span key={wi} className="heatmap-month-label">
                          {mp ? mp.label : ""}
                        </span>
                                            );
                                        })}
                                    </div>
                                    <div className="heatmap-grid"
                                         style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
                                        {weeks.map((week, wi) =>
                                            week.map((day, di) => (
                                                <div
                                                    key={`${wi}-${di}`}
                                                    className="heatmap-cell"
                                                    style={{ background: getHeatColor(day.count) }}
                                                    onMouseEnter={(e) => {
                                                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                                                        setHoverDate({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                                                    }}
                                                    onMouseLeave={() => setHoverDate(null)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {hoverDate && (
                                <div className="heatmap-tooltip"
                                     style={{ top: hoverDate.y - 44, left: hoverDate.x - 40 }}>
                                    <strong>{hoverDate.count}</strong>
                                    {hoverDate.count === 1 ? " review" : " reviews"}
                                    <span>{hoverDate.date}</span>
                                </div>
                            )}

                            <div className="heatmap-legend">
                                <span className="heatmap-legend-label">Less</span>
                                {[0, 1, 2, 3, 4].map(l => (
                                    <div key={l} className="heatmap-cell"
                                         style={{ background: getHeatColor(l * 2) }} />
                                ))}
                                <span className="heatmap-legend-label">More</span>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ---- LINE CHART ---- */}
            <section className="analytics-section">
                <div className="section-header">
                    <h3>Progress Over Time</h3>
                </div>
                <div className="chart-card">
                    {data.timeline.length === 0 ? (
                        <p className="chart-empty">No timeline data yet.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={data.timeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="lineGradBlue" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#63b3ed" />
                                            <stop offset="100%" stopColor="#9f7aea" />
                                        </linearGradient>
                                        <linearGradient id="lineGradGreen" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#68d391" />
                                            <stop offset="100%" stopColor="#63b3ed" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(99,179,237,0.07)" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="date"
                                           tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "DM Sans" }}
                                           axisLine={false} tickLine={false} />
                                    <YAxis
                                        tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "DM Sans" }}
                                        axisLine={false} tickLine={false} />
                                    <Tooltip content={<LineTooltip />} />
                                    <Line type="monotone" dataKey="completed" name="Completed"
                                          stroke="url(#lineGradBlue)" strokeWidth={2.5}
                                          dot={{ r: 4, fill: "#63b3ed", strokeWidth: 0 }}
                                          activeDot={{ r: 6, fill: "#63b3ed", strokeWidth: 2, stroke: "#0d1525" }} />
                                    <Line type="monotone" dataKey="reviewed" name="Reviewed"
                                          stroke="url(#lineGradGreen)" strokeWidth={2.5} strokeDasharray="6 3"
                                          dot={{ r: 4, fill: "#68d391", strokeWidth: 0 }}
                                          activeDot={{ r: 6, fill: "#68d391", strokeWidth: 2, stroke: "#0d1525" }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                <div className="chart-legend-item">
                                    <div className="chart-legend-line" style={{ background: "#63b3ed" }} />
                                    <span>Completed</span>
                                </div>
                                <div className="chart-legend-item">
                                    <div className="chart-legend-line dashed" style={{ background: "#68d391" }} />
                                    <span>Reviewed</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ---- BAR CHART ---- */}
            <section className="analytics-section">
                <div className="section-header">
                    <h3>Topic Mastery</h3>
                </div>
                <div className="chart-card">
                    {data.topics.length === 0 ? (
                        <p className="chart-empty">No topic data yet.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.topics}
                                          margin={{ top: 10, right: 20, left: -20, bottom: 40 }}
                                          barSize={18} barGap={3}>
                                    <CartesianGrid stroke="rgba(99,179,237,0.07)" strokeDasharray="4 4" vertical={false} />
                                    <XAxis dataKey="topic"
                                           tick={{ fill: "#6b7fa3", fontSize: 10, fontFamily: "DM Sans" }}
                                           axisLine={false} tickLine={false}
                                           angle={-35} textAnchor="end" interval={0} />
                                    <YAxis
                                        tick={{ fill: "#6b7fa3", fontSize: 11, fontFamily: "DM Sans" }}
                                        axisLine={false} tickLine={false} />
                                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(99,179,237,0.04)" }} />
                                    <Bar dataKey="done"     name="Done"     fill="#68d391" radius={[4,4,0,0]} />
                                    <Bar dataKey="revise"   name="Revise"   fill="#9f7aea" radius={[4,4,0,0]} />
                                    <Bar dataKey="learning" name="Learning" fill="#f6ad55" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                <div className="chart-legend-item">
                                    <div className="chart-legend-dot" style={{ background: "#68d391" }} />
                                    <span>Done</span>
                                </div>
                                <div className="chart-legend-item">
                                    <div className="chart-legend-dot" style={{ background: "#9f7aea" }} />
                                    <span>Revise</span>
                                </div>
                                <div className="chart-legend-item">
                                    <div className="chart-legend-dot" style={{ background: "#f6ad55" }} />
                                    <span>Learning</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

        </div>
    );
}