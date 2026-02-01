import { useEffect, useState } from "react";
import { getSummary, getTimeline } from "../api/analytics";
import TimelineChart from "../components/TimelineChart";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, t] = await Promise.all([getSummary(), getTimeline(30)]);
        setSummary(s.data);
        setTimeline(t.data);
        console.log("timeline payload:", t.data);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Failed to load");
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h1>Dashboard</h1>
        <p style={{ color: "tomato" }}>Error: {error}</p>
      </div>
    );
  }

  if (!summary || !timeline) {
    return (
      <div style={{ padding: 24, color: "white" }}>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "white", fontFamily: "Arial" }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ opacity: 0.7 }}>Total</div>
          <div style={{ fontSize: 28 }}>{summary.total_applications}</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ opacity: 0.7 }}>Interview Rate</div>
          <div style={{ fontSize: 28 }}>
            {(summary.interview_rate * 100).toFixed(1)}%
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ opacity: 0.7 }}>Applied last 7 days</div>
          <div style={{ fontSize: 28 }}>{summary.applied_last_7_days}</div>
        </div>
      </div>

      <h2 style={{ marginTop: 28 }}>Timeline (last {timeline.days} days)</h2>

      {/* Guard + fallback */}
      {Array.isArray(timeline.series) ? (
        <TimelineChart data={timeline.series} />
      ) : (
        <div className="card" style={{ padding: 16 }}>
          timeline.series is not an array
        </div>
      )}
    </div>
  );
}
