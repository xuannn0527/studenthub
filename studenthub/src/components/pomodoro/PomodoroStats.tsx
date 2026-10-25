import type { FocusRecord } from "./pomodoroTypes";

interface PomodoroStatsProps {
  records: FocusRecord[];
  onClearRecords?: () => void;
}

export default function PomodoroStats({ records, onClearRecords }: PomodoroStatsProps) {
  // 1. 累計專注指標
  const totalCount = records.length;
  const totalMinutes = records.reduce((acc, r) => acc + r.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemMins = totalMinutes % 60;
  const avgMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;

  // 2. 今日專注表現
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.timestamp === todayStr);
  const todayCount = todayRecords.length;
  const todayMinutes = todayRecords.reduce((acc, r) => acc + r.durationMinutes, 0);
  const targetDailyGoal = 60; // 每日 60 分鐘目標
  const goalRate = Math.min(100, Math.round((todayMinutes / targetDailyGoal) * 100));

  // 3. 近 7 日時長直條圖
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayName = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayMins = records
      .filter((r) => r.timestamp === dateStr)
      .reduce((acc, r) => acc + r.durationMinutes, 0);
    return { dateStr, dayLabel: `${dayLabel} (${dayName})`, dayMins, isToday: dateStr === todayStr };
  });

  const maxDayMins = Math.max(...past7Days.map((d) => d.dayMins), 60);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "#ffffff" }}>
      {/* 頂部指標區塊：累計指標與今日表現 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
        {/* 卡片 1: 累計專注指標 */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "22px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📈</span> 累計專注指標
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>歷史累積</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center", gap: "8px" }}>
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>總次數</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
                {totalCount} <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>次</span>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>總時長</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#38bdf8", marginTop: "4px", textShadow: "0 0 10px rgba(56, 189, 248, 0.4)" }}>
                {totalHours}
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>h </span>
                {totalRemMins}
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }}>m</span>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>平均每次</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#34d399", marginTop: "4px", textShadow: "0 0 10px rgba(52, 211, 153, 0.4)" }}>
                {avgMinutes} <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>分</span>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片 2: 今日專注表現 */}
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "22px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📅</span> 今日專注表現
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>{todayStr}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center", gap: "8px" }}>
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>今日次數</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
                {todayCount} <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>次</span>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>今日專注</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#fbbf24", marginTop: "4px", textShadow: "0 0 10px rgba(251, 191, 36, 0.4)" }}>
                {todayMinutes} <span style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8" }}>分</span>
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", padding: "14px 8px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>60分達成率</div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: goalRate >= 100 ? "#34d399" : "#38bdf8", marginTop: "4px", textShadow: goalRate >= 100 ? "0 0 10px rgba(52, 211, 153, 0.4)" : "0 0 10px rgba(56, 189, 248, 0.4)" }}>
                {goalRate}%
              </div>
            </div>
          </div>

          {/* 今日 60 分鐘進度條 */}
          <div style={{ marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>
              <span>每日目標 (60分鐘)</span>
              <span>{todayMinutes} / 60 分</span>
            </div>
            <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.12)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${goalRate}%`,
                  background: goalRate >= 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #0284c7, #38bdf8)",
                  borderRadius: "4px",
                  boxShadow: goalRate >= 100 ? "0 0 8px #34d399" : "0 0 8px #38bdf8",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 近 7 日時長直條圖 */}
      <div
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📊</span> 近 7 日專注時長直條圖
          </span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>單位：分鐘 (m)</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "180px",
            gap: "12px",
            padding: "0 8px 10px 8px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {past7Days.map((day, idx) => {
            const heightPercent = Math.min(100, Math.max(8, (day.dayMins / maxDayMins) * 100));
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                {/* 柱頂數值 */}
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: day.isToday ? "#38bdf8" : day.dayMins > 0 ? "#e2e8f0" : "#64748b",
                    marginBottom: "8px",
                    textShadow: day.isToday ? "0 0 8px rgba(56, 189, 248, 0.6)" : "none",
                  }}
                >
                  {day.dayMins}m
                </span>

                {/* 柱條主體 */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: "44px",
                    height: `${heightPercent}%`,
                    background: day.isToday
                      ? "linear-gradient(180deg, #38bdf8, #2563eb)"
                      : day.dayMins > 0
                      ? "linear-gradient(180deg, #60a5fa, #1d4ed8)"
                      : "rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px 8px 0 0",
                    transition: "height 0.4s ease, background-color 0.2s",
                    boxShadow: day.isToday ? "0 0 14px rgba(56, 189, 248, 0.5)" : "none",
                  }}
                />

                {/* 柱底日期 */}
                <span
                  style={{
                    fontSize: "11px",
                    color: day.isToday ? "#38bdf8" : "#94a3b8",
                    marginTop: "10px",
                    fontWeight: day.isToday ? "800" : "600",
                    textAlign: "center",
                  }}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最近專注紀錄明細清單 */}
      {records.length > 0 && (
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "20px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
              🕒 最近專注紀錄 (近 10 筆)
            </span>
            {onClearRecords && (
              <button
                onClick={onClearRecords}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                清除紀錄
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {records.slice(0, 10).map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "rgba(15, 23, 42, 0.65)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#38bdf8", fontWeight: "700" }}>✓</span>
                  <span style={{ fontWeight: "700", color: "#f8fafc" }}>{r.todoTitle}</span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {r.timestamp} {r.timeStr}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "12px",
                  }}
                >
                  +{r.durationMinutes} 分鐘
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
