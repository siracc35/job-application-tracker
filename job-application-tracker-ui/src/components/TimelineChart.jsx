import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function TimelineChart({ data }) {
  if (!Array.isArray(data)) return null;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>
        Applications over time
      </div>

      {/* SABİT HEIGHT WRAPPER */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="date"
              interval={4}   // her 5. etiketi gösterir
              tick={{ fill: "rgba(231,234,240,0.7)", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(231,234,240,0.7)", fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                background: "#0f1318",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
