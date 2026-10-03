import Timetable from "./components/Timetable";
import AssignmentTracker from "./components/AssignmentTracker";
import PomodoroTimer from "./components/PomodoroTimer";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* 頂部工作台標頭 */}
        <header style={{ backgroundColor: "#ffffff", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>StudentHub 學業專注儀表板</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>個人化純本地端工作台（離線可用、自動持久化）</p>
        </header>

        {/* 雙欄排版 */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
          
          {/* 左欄：週課表 */}
          <section style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "16px" }}>週課表管理</h2>
            <Timetable />
          </section>

          {/* 右欄：番茄鐘 + 作業追蹤 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <section style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>專注番茄鐘</h2>
              <PomodoroTimer />
            </section>

            <section style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>作業與待辦管理</h2>
              <AssignmentTracker />
            </section>
          </div>

        </div>

      </div>
    </div>
  );
}