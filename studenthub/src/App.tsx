import { useState, useEffect } from "react";
import Timetable from "./components/Timetable";
import AssignmentTracker from "./components/AssignmentTracker";
import PomodoroTimer from "./components/PomodoroTimer";
import FocusPet from "./components/FocusPet";
import PetWorkshop from "./components/PetWorkshop";
import GuardianIsland from "./components/island/GuardianIsland";

type Tab = "timetable" | "pomodoro" | "assignments" | "pet";
type ViewMode = "desktop" | "island";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("timetable");
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("hub_view_mode") as ViewMode) || "desktop";
  });

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("hub_view_mode", mode);
    window.dispatchEvent(new CustomEvent("hub_view_mode_changed", { detail: { mode } }));
  };

  useEffect(() => {
    const handleSyncMode = (e: any) => {
      if (e.detail?.mode && (e.detail.mode === "desktop" || e.detail.mode === "island")) {
        setViewMode(e.detail.mode);
      }
    };
    window.addEventListener("hub_view_mode_changed", handleSyncMode);
    return () => window.removeEventListener("hub_view_mode_changed", handleSyncMode);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0b132b",
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0) 65%),
          radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0) 60%),
          linear-gradient(180deg, #0c1a30 0%, #172554 45%, #0f172a 100%)
        `,
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        .fade-in {
          animation: fadeIn 0.25s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
        /* 科技風自訂捲軸 */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.6);
        }
      `}</style>

      {/* 👈 左側邊欄 (Sidebar) - 深色系科技風格 */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "rgba(11, 19, 43, 0.88)",
          backdropFilter: "blur(16px)",
          borderRight: "1.5px solid rgba(56, 189, 248, 0.18)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 20px",
          flexShrink: 0,
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          zIndex: 20,
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "18px", paddingLeft: "4px" }}>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "21px",
              fontWeight: "900",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              letterSpacing: "-0.3px",
              textShadow: "0 0 12px rgba(56, 189, 248, 0.5)",
            }}
          >
            🎓 StudentHub
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>個人化學業專注儀表板</p>
        </div>

        {/* 🌟 雙模式切換開關 (Dual Mode Toggle) */}
        <div
          style={{
            marginBottom: "20px",
            padding: "4px",
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            gap: "4px",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          <button
            onClick={() => handleSetViewMode("desktop")}
            style={{
              flex: 1,
              padding: "8px 0",
              border: viewMode === "desktop" ? "1px solid rgba(56, 189, 248, 0.4)" : "none",
              borderRadius: "8px",
              background: viewMode === "desktop" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
              color: viewMode === "desktop" ? "#ffffff" : "#94a3b8",
              fontWeight: "800",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: viewMode === "desktop" ? "0 2px 10px rgba(2, 132, 199, 0.45)" : "none",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span>🖥️</span> 桌面模式
          </button>
          <button
            onClick={() => handleSetViewMode("island")}
            style={{
              flex: 1,
              padding: "8px 0",
              border: viewMode === "island" ? "1px solid rgba(6, 182, 212, 0.4)" : "none",
              borderRadius: "8px",
              background: viewMode === "island" ? "linear-gradient(135deg, #06b6d4, #0284c7)" : "transparent",
              color: viewMode === "island" ? "#ffffff" : "#94a3b8",
              fontWeight: "800",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: viewMode === "island" ? "0 2px 10px rgba(6, 182, 212, 0.45)" : "none",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <span>🏝️</span> 守護獸島
          </button>
        </div>

        {/* 桌面模式主功能選單 */}
        {viewMode === "desktop" ? (
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("timetable")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                backgroundColor: activeTab === "timetable" ? "rgba(56, 189, 248, 0.15)" : "transparent",
                color: activeTab === "timetable" ? "#38bdf8" : "#94a3b8",
                border: activeTab === "timetable" ? "1px solid rgba(56, 189, 248, 0.45)" : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: activeTab === "timetable" ? "0 0 14px rgba(56, 189, 248, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              📅 我的課表
            </button>

            <button
              onClick={() => setActiveTab("pomodoro")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                backgroundColor: activeTab === "pomodoro" ? "rgba(239, 68, 68, 0.15)" : "transparent",
                color: activeTab === "pomodoro" ? "#f87171" : "#94a3b8",
                border: activeTab === "pomodoro" ? "1px solid rgba(239, 68, 68, 0.45)" : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: activeTab === "pomodoro" ? "0 0 14px rgba(239, 68, 68, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              🍅 專注番茄鐘
            </button>

            <button
              onClick={() => setActiveTab("assignments")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                backgroundColor: activeTab === "assignments" ? "rgba(16, 185, 129, 0.15)" : "transparent",
                color: activeTab === "assignments" ? "#34d399" : "#94a3b8",
                border: activeTab === "assignments" ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: activeTab === "assignments" ? "0 0 14px rgba(16, 185, 129, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              📝 作業與待辦
            </button>

            <button
              onClick={() => setActiveTab("pet")}
              style={{
                padding: "12px 16px",
                textAlign: "left",
                backgroundColor: activeTab === "pet" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === "pet" ? "#fbbf24" : "#94a3b8",
                border: activeTab === "pet" ? "1px solid rgba(245, 158, 11, 0.45)" : "1px solid transparent",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: activeTab === "pet" ? "0 0 14px rgba(245, 158, 11, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              🐾 守護獸任務
            </button>
          </nav>
        ) : (
          /* 守護獸島模式下的側欄專屬快捷資訊 */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "12px",
                color: "#93c5fd",
                lineHeight: "1.5",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ fontWeight: "800", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🌴</span> 守護獸島探索中
              </div>
              守護獸已在島嶼中央漫遊！點擊中央寵物可互動摸摸，右側告示板可即時展開作業討伐！
            </div>

            <button
              onClick={() => handleSetViewMode("desktop")}
              style={{
                marginTop: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
            >
              <span>↩️</span> 返回桌面工作區
            </button>
          </div>
        )}

        {/* 底部探索島嶼彩蛋小按鈕（僅在桌面模式顯示） */}
        {viewMode === "desktop" && (
          <div
            onClick={() => handleSetViewMode("island")}
            style={{
              marginTop: "auto",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(2, 132, 199, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)",
              border: "1.5px solid rgba(56, 189, 248, 0.4)",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 16px rgba(2, 132, 199, 0.25)",
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
            }}
          >
            <span style={{ fontSize: "22px" }}>🏝️</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#e0f2fe" }}>探索守護獸島</div>
              <div style={{ fontSize: "10px", color: "#93c5fd" }}>進入島嶼修煉與討伐 ➔</div>
            </div>
          </div>
        )}
      </aside>

      {/* 👉 右側主要內容區 */}
      <main
        style={{
          flex: 1,
          height: "100vh",
          overflowY: viewMode === "island" ? "hidden" : "auto",
          padding: viewMode === "island" ? "0" : "24px 32px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {viewMode === "island" ? (
          /* 🏝️ 守護獸島全新場景視圖 */
          <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <GuardianIsland
              onReturnToDesktop={() => handleSetViewMode("desktop")}
            />
          </section>
        ) : (
          /* 🖥️ 組員設計的桌面模式四大分頁（100% 完整保留） */
          <>
            {activeTab === "timetable" && (
              <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <Timetable />
              </section>
            )}

            {activeTab === "pomodoro" && (
              <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <PomodoroTimer />
              </section>
            )}

            {/* 作業與待辦區塊：獨立平鋪 */}
            {activeTab === "assignments" && (
              <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <AssignmentTracker />
              </section>
            )}

            {activeTab === "pet" && (
              <section className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <PetWorkshop />
              </section>
            )}
          </>
        )}
      </main>

      {/* 全域自主散步桌寵（進入島嶼時自動隱藏，返回桌面時自動恢復） */}
      <FocusPet />

    </div>
  );
}