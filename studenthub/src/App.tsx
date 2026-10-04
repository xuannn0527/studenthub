import { useState } from "react";
import Timetable from "./components/Timetable";
import AssignmentTracker from "./components/AssignmentTracker";
import PomodoroTimer from "./components/PomodoroTimer";
import FocusPet from "./components/FocusPet";
import PetWorkshop from "./components/PetWorkshop"; // 🌟 引入任務與餵食頁面

type Tab = "timetable" | "pomodoro" | "assignments" | "pet";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("timetable");

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "sans-serif", overflow: "hidden", position: "relative" }}>
      
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        .fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* 👈 左側邊欄 (Sidebar) */}
      <aside style={{ width: "240px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "20px", flexShrink: 0, boxShadow: "2px 0 12px rgba(0,0,0,0.03)", zIndex: 10, height: "100vh", boxSizing: "border-box" }}>
        
        <div style={{ marginBottom: "24px", paddingLeft: "4px" }}>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            🎓 StudentHub
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>個人化學業專注儀表板</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("timetable")}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              backgroundColor: activeTab === "timetable" ? "#eff6ff" : "transparent",
              color: activeTab === "timetable" ? "#2563eb" : "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "all 0.2s ease"
            }}
          >
            📅 我的課表
          </button>

          <button
            onClick={() => setActiveTab("pomodoro")}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              backgroundColor: activeTab === "pomodoro" ? "#fef2f2" : "transparent",
              color: activeTab === "pomodoro" ? "#ef4444" : "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "all 0.2s ease"
            }}
          >
            🍅 專注番茄鐘
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              backgroundColor: activeTab === "assignments" ? "#ecfdf5" : "transparent",
              color: activeTab === "assignments" ? "#10b981" : "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "all 0.2s ease"
            }}
          >
            📝 作業與待辦
          </button>

          {/* 🌟 新增第 4 個功能：任務與餵食工坊 */}
          <button
            onClick={() => setActiveTab("pet")}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              backgroundColor: activeTab === "pet" ? "#fff7ed" : "transparent",
              color: activeTab === "pet" ? "#ea580c" : "#475569",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              transition: "all 0.2s ease"
            }}
          >
            🐾 守護獸任務
          </button>
        </nav>
      </aside>

      {/* 👉 右側主要內容區 */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        
        {activeTab === "timetable" && (
          <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Timetable />
          </section>
        )}

        {activeTab === "pomodoro" && (
          <section className="fade-in" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "600px", backgroundColor: "#ffffff", padding: "40px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 32px 0", fontSize: "24px", textAlign: "center", color: "#1e293b" }}>專注番茄鐘</h2>
              <PomodoroTimer />
            </div>
          </section>
        )}

        {activeTab === "assignments" && (
          <section className="fade-in" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: "800px", backgroundColor: "#ffffff", padding: "40px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", color: "#1e293b", textAlign: "center" }}>作業與待辦管理</h2>
              <AssignmentTracker />
            </div>
          </section>
        )}

        {/* 🌟 守護獸任務與餵食專屬頁面 */}
        {activeTab === "pet" && (
          <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <PetWorkshop />
          </section>
        )}

      </main>

      {/* 全域自主散步桌寵 (常駐螢幕) */}
      <FocusPet />

    </div>
  );
}