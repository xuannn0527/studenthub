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
          animation: fadeIn 0.25s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* 👈 左側邊欄 (Sidebar) */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "24px 20px",
          flexShrink: 0,
          boxShadow: "2px 0 12px rgba(0,0,0,0.03)",
          zIndex: 20,
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "18px", paddingLeft: "4px" }}>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "21px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            🎓 StudentHub
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>個人化學業專注儀表板</p>
        </div>

        {/* 🌟 雙模式切換開關 (Dual Mode Toggle) */}
        <div
          style={{
            marginBottom: "20px",
            padding: "4px",
            backgroundColor: "#f1f5f9",
            borderRadius: "12px",
            display: "flex",
            gap: "4px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => handleSetViewMode("desktop")}
            style={{
              flex: 1,
              padding: "8px 0",
              border: "none",
              borderRadius: "8px",
              backgroundColor: viewMode === "desktop" ? "#ffffff" : "transparent",
              color: viewMode === "desktop" ? "#0f172a" : "#64748b",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: viewMode === "desktop" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
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
              border: "none",
              borderRadius: "8px",
              backgroundColor: viewMode === "island" ? "#0284c7" : "transparent",
              color: viewMode === "island" ? "#ffffff" : "#64748b",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              boxShadow: viewMode === "island" ? "0 2px 8px rgba(2, 132, 199, 0.35)" : "none",
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
                backgroundColor: activeTab === "timetable" ? "#eff6ff" : "transparent",
                color: activeTab === "timetable" ? "#2563eb" : "#475569",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
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
                backgroundColor: activeTab === "pomodoro" ? "#fef2f2" : "transparent",
                color: activeTab === "pomodoro" ? "#ef4444" : "#475569",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
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
                backgroundColor: activeTab === "assignments" ? "#ecfdf5" : "transparent",
                color: activeTab === "assignments" ? "#10b981" : "#475569",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
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
                backgroundColor: activeTab === "pet" ? "#fff7ed" : "transparent",
                color: activeTab === "pet" ? "#ea580c" : "#475569",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
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
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "12px",
                color: "#0369a1",
                lineHeight: "1.5",
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
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
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
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <span style={{ fontSize: "22px" }}>🏝️</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800" }}>探索守護獸島</div>
              <div style={{ fontSize: "10px", opacity: 0.85 }}>進入島嶼修煉與討伐 ➔</div>
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