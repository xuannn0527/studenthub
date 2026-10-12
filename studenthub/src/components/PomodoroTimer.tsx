import React, { useState, useEffect, useRef } from "react";
// 🌟 使用 import type 符合 verbatimModuleSyntax 規範
import type { TodoItem, FocusRecord } from "./pomodoro/pomodoroTypes";
import PomodoroAddModal from "./pomodoro/PomodoroAddModal";

export type { TodoItem, FocusRecord };

export default function PomodoroTimer() {
  const [activeTab, setActiveTab] = useState<"todo" | "stats">("todo");

  // 待辦事項資料
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem("hub_pomodoro_todos");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "1", title: "英文複習", type: "timer", timingType: "countdown", durationMinutes: 25 },
      { id: "2", title: "數學複習", type: "timer", timingType: "countup", durationMinutes: 0 },
      { id: "3", title: "每天背單字", type: "habit", timingType: "countdown", durationMinutes: 20, habitFrequency: "daily", habitTargetAmount: 60, habitUnit: "minutes" },
      { id: "4", title: "多益衝刺 30 小時", type: "target", timingType: "countdown", durationMinutes: 30, targetDeadline: "2026-11-15", targetTotalAmount: 1800, targetCurrentAmount: 240, targetUnit: "minutes" },
      { id: "5", title: "歷史複習", type: "timer", timingType: "countdown", durationMinutes: 25 },
    ];
  });

  // 專注紀錄
  const [records, setRecords] = useState<FocusRecord[]>(() => {
    const saved = localStorage.getItem("hub_pomodoro_records");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: "r1", todoId: "1", todoTitle: "英文複習", durationMinutes: 25, timestamp: "2026-10-10", timeStr: "14:30" },
      { id: "r2", todoId: "2", todoTitle: "數學複習", durationMinutes: 40, timestamp: "2026-10-11", timeStr: "16:10" },
    ];
  });

  // 計時狀態
  const [activeTodo, setActiveTodo] = useState<TodoItem | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");

  // Modal 顯示控制
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  // 通知 FocusPet 寵物專注狀態
  useEffect(() => {
    if (activeTodo && !isPaused && mode === "focus") {
      window.dispatchEvent(
        new CustomEvent("hub_focus_state_change", {
          detail: { isFocusing: true, todoTitle: activeTodo.title }
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("hub_focus_state_change", {
          detail: { isFocusing: false, todoTitle: "" }
        })
      );
    }
  }, [activeTodo, isPaused, mode]);

  // 持久化儲存
  useEffect(() => {
    localStorage.setItem("hub_pomodoro_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("hub_pomodoro_records", JSON.stringify(records));
  }, [records]);

  // 計時核心邏輯
  useEffect(() => {
    let timer: number | null = null;

    if (activeTodo && !isPaused) {
      timer = window.setInterval(() => {
        setSeconds((prev) => {
          if (mode === "break") {
            if (prev <= 1) {
              audioRef.current?.play().catch(() => {});
              alert("☕ 休息時間結束，準備開始下一個專注吧！");
              setActiveTodo(null);
              setMode("focus");
              return 0;
            }
            return prev - 1;
          }

          if (activeTodo.timingType === "countdown") {
            if (prev <= 1) {
              handleCompleteFocus(activeTodo.durationMinutes);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTodo, isPaused, mode]);

  // 開始專注 / 打卡
  const handleStartFocus = (todo: TodoItem) => {
    if (todo.timingType === "none") {
      handleCompleteFocus(todo.durationMinutes || 15, todo);
      return;
    }

    setActiveTodo(todo);
    setMode("focus");
    setIsPaused(false);
    if (todo.timingType === "countdown") {
      setSeconds(todo.durationMinutes * 60);
    } else {
      setSeconds(0);
    }
  };

  // 完成專注結算
  const handleCompleteFocus = (durMins: number, targetItem?: TodoItem) => {
    const item = targetItem || activeTodo;
    if (!item) return;

    audioRef.current?.play().catch(() => {});
    const actualMins = Math.max(1, durMins);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (item.type === "target") {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? { ...t, targetCurrentAmount: (t.targetCurrentAmount || 0) + actualMins }
            : t
        )
      );
    }

    const newRecord: FocusRecord = {
      id: Date.now().toString(),
      todoId: item.id,
      todoTitle: item.title,
      durationMinutes: actualMins,
      timestamp: dateStr,
      timeStr
    };

    setRecords((prev) => [newRecord, ...prev]);

    // 發送守護獸獎勵事件
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", { detail: { exp: Math.min(actualMins, 50), coins: 10 } })
    );

    if (item.timingType !== "none") {
      if (window.confirm(`🎉 恭喜完成【${item.title}】專注 (${actualMins}分鐘)！已獲得獎勵！是否開啟 5 分鐘短暫休息？`)) {
        setMode("break");
        setSeconds(5 * 60);
        setIsPaused(false);
      } else {
        setActiveTodo(null);
      }
    } else {
      alert(`🎉 已完成【${item.title}】打卡！獲得守護獸獎勵！`);
    }
  };

  // 新增待辦
  const handleAddTodo = (newTodo: TodoItem) => {
    setTodos((prev) => [newTodo, ...prev]);
  };

  // 刪除待辦
  const handleDeleteTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("確定要刪除此待辦事項嗎？")) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // 格式化時間
  const formatSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 統計數據算式
  const totalMinutes = records.reduce((acc, r) => acc + r.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemMins = totalMinutes % 60;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.timestamp === todayStr);
  const todayMinutes = todayRecords.reduce((acc, r) => acc + r.durationMinutes, 0);

  // 近 7 日圖表數據
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayMins = records
      .filter((r) => r.timestamp === dateStr)
      .reduce((acc, r) => acc + r.durationMinutes, 0);
    return { dateStr, dayLabel, dayMins };
  });

  const maxDayMins = Math.max(...past7Days.map((d) => d.dayMins), 60);

  return (
    <div style={{
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    }}>

      {/* 卡片一：頁籤列 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "20px 28px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🍅</span> 番茄專注儀表板
          </h2>

          <div style={{
            display: "flex",
            backgroundColor: "#f1f5f9",
            padding: "4px",
            borderRadius: "12px"
          }}>
            <button
              onClick={() => setActiveTab("todo")}
              style={{
                padding: "6px 18px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: activeTab === "todo" ? "#ffffff" : "transparent",
                color: activeTab === "todo" ? "#1e293b" : "#64748b",
                boxShadow: activeTab === "todo" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s"
              }}
            >
              📋 待辦事項 ({todos.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              style={{
                padding: "6px 18px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: activeTab === "stats" ? "#ffffff" : "transparent",
                color: activeTab === "stats" ? "#1e293b" : "#64748b",
                boxShadow: activeTab === "stats" ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s"
              }}
            >
              📊 數據統計
            </button>
          </div>
        </div>

        {activeTab === "todo" && !activeTodo && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: "9px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ＋ 新增待辦
          </button>
        )}
      </div>

      {/* 卡片二：內容區 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "24px 28px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
      }}>

        {activeTodo ? (
          <div style={{
            padding: "40px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: mode === "break" ? "#f0fdf4" : "#fafaf9",
            borderRadius: "16px",
            border: "1px solid",
            borderColor: mode === "break" ? "#bbf7d0" : "#e7e5e4"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: "800",
                color: mode === "break" ? "#16a34a" : "#2563eb",
                backgroundColor: mode === "break" ? "#dcfce7" : "#eff6ff",
                padding: "3px 10px",
                borderRadius: "12px",
                letterSpacing: "0.5px"
              }}>
                {mode === "break" ? "☕ SHORT BREAK 休息中" : activeTodo.timingType === "countdown" ? "⏱ 倒計時專注" : "⏱ 正向計時專注"}
              </span>
            </div>

            <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: "4px 0 24px 0" }}>
              {mode === "break" ? "放鬆一下，喝口水吧！" : activeTodo.title}
            </h3>

            <div style={{
              fontSize: "84px",
              fontWeight: "800",
              fontFamily: "monospace, sans-serif",
              color: mode === "break" ? "#16a34a" : "#1e293b",
              lineHeight: 1,
              marginBottom: "36px",
              letterSpacing: "2px"
            }}>
              {formatSeconds(seconds)}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  padding: "10px 28px",
                  backgroundColor: isPaused ? "#16a34a" : "#334155",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                {isPaused ? "▶ 繼續" : "❚❚ 暫停"}
              </button>

              {mode === "focus" && activeTodo.timingType === "countup" && (
                <button
                  onClick={() => handleCompleteFocus(Math.floor(seconds / 60))}
                  style={{
                    padding: "10px 28px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  ✓ 完成專注
                </button>
              )}

              <button
                onClick={() => {
                  if (window.confirm("確定要結束/放棄本次計時嗎？")) {
                    setActiveTodo(null);
                  }
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  border: "1px solid #fca5a5",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                ✕ 結束
              </button>
            </div>
          </div>
        ) : activeTab === "todo" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: "16px"
          }}>
            {todos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ flex: 1, paddingRight: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
                      {todo.title}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: todo.type === "habit" ? "#059669" : todo.type === "target" ? "#d97706" : "#2563eb",
                      backgroundColor: todo.type === "habit" ? "#ecfdf5" : todo.type === "target" ? "#fffbeb" : "#eff6ff",
                      padding: "2px 6px",
                      borderRadius: "6px"
                    }}>
                      {todo.type === "habit" ? "養習慣" : todo.type === "target" ? "定目標" : "普通番茄"}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span>
                      {todo.timingType === "countdown" ? `倒計時 · ${todo.durationMinutes} 分鐘` : todo.timingType === "countup" ? "正向計時 (自由累加)" : "不計時 (按鍵打卡)"}
                    </span>

                    {todo.type === "habit" && (
                      <span style={{ color: "#059669" }}>
                        目標：{todo.habitFrequency === "daily" ? "每天" : todo.habitFrequency === "weekly" ? "每週" : "每月"}完成 {todo.habitTargetAmount} {todo.habitUnit === "minutes" ? "分鐘" : "次"}
                      </span>
                    )}

                    {todo.type === "target" && (
                      <span style={{ color: "#d97706" }}>
                        截止：{todo.targetDeadline || "無"} · 已完成 {todo.targetCurrentAmount || 0} / {todo.targetTotalAmount || 0} 分鐘
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => handleStartFocus(todo)}
                    style={{
                      padding: "8px 20px",
                      backgroundColor: todo.timingType === "none" ? "#16a34a" : "#334155",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
                    }}
                  >
                    {todo.timingType === "none" ? "打卡" : "開始"}
                  </button>
                  <button
                    onClick={(e) => handleDeleteTodo(todo.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#cbd5e1",
                      fontSize: "16px",
                      cursor: "pointer",
                      padding: "4px"
                    }}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "14px" }}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700", marginBottom: "16px" }}>
                  📈 累計專注數據
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>總次數</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>{records.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>總時長</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
                      {totalHours}<span style={{ fontSize: "11px" }}>時</span>{totalRemMins}<span style={{ fontSize: "11px" }}>分</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>平均時長</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
                      {Math.round(totalMinutes / Math.max(1, records.length))}<span style={{ fontSize: "11px" }}>分</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "14px" }}>
                <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700", marginBottom: "16px" }}>
                  📅 今日專注表現 ({todayStr})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>今日次數</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b", marginTop: "4px" }}>{todayRecords.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>今日專注</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
                      {todayMinutes}<span style={{ fontSize: "11px" }}>分鐘</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>達標率</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                      {todayMinutes >= 60 ? "100%" : `${Math.round((todayMinutes / 60) * 100)}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 7 日直條圖（修正原本標籤語法與 justifyBetween 屬性） */}
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "14px" }}>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700", marginBottom: "20px" }}>
                📊 近 7 日專注時長分佈 (分鐘)
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "140px", gap: "16px", padding: "0 10px" }}>
                {past7Days.map((day, idx) => {
                  const heightPercent = Math.min(100, Math.max(8, (day.dayMins / maxDayMins) * 100));
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: day.dayMins > 0 ? "#2563eb" : "#cbd5e1", marginBottom: "6px" }}>
                        {day.dayMins}m
                      </span>
                        <div style={{
                        width: "100%",
                        maxWidth: "36px",
                        height: `${heightPercent}%`,
                        backgroundColor: day.dayMins > 0 ? "#3b82f6" : "#e2e8f0",
                        borderRadius: "6px 6px 0 0",
                        transition: "height 0.3s ease"
                      }} />
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontWeight: "600" }}>
                        {day.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <PomodoroAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />

    </div>
  );
}