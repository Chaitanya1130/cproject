import { useEffect, useState } from "react";
import '../../../Css/Cards/User/CompletedQues.css';
interface Props {
  triggerRefresh: number;
}
export default function CompletedQues({ triggerRefresh }: Props) {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchCompletedTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const timestamp = Date.now();
      const resp = await fetch(
        `https://dsaanalysis-backend.onrender.com/progress/getCompletedtopicnames?_t=${timestamp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const patterns: string[] = [];
        if (Array.isArray(data.topics)) {
          for (const item of data.topics) {
            if (typeof item === "string") {
              patterns.push(item);
            } else if (item?.qpattern) {
              patterns.push(item.qpattern);
            }
          }
        }
        setTopics(patterns);
      }
    } catch (err) {
      console.error("Error fetching completed topics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    if (triggerRefresh > 0) setIsRefreshing(true);
    fetchCompletedTopics();
  }, [triggerRefresh]);
  if (loading && triggerRefresh === 0) {
    return <div className="completed-topics-card"><h3 className="completed-topics-title">Loading...</h3></div>;
  }
  return (
    <div className="completed-topics-card">
      <h3 className="completed-topics-title">
        Completed Topics
        {isRefreshing && <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.7 }}>🔄</span>}
      </h3>
      {topics.length === 0 ? (
        <p className="completed-topics-empty">No topics fully completed yet</p>
      ) : (
        <div className="completed-topics-list">
          {topics.map((topic, index) => (
            <span key={index} className="completed-topic-chip">{topic}</span>
          ))}
        </div>
      )}
    </div>
  );
}