import { useState, useEffect, type MouseEvent } from "react";
import type { TodoItem, FocusRecord } from "./pomodoro/pomodoroTypes";
import PomodoroAddModal from "./pomodoro/PomodoroAddModal";
import PomodoroStats from "./pomodoro/PomodoroStats";
import PomodoroFullScreen from "./pomodoro/PomodoroFullScreen";

export type { TodoItem, FocusRecord };

export default function PomodoroTimer() {
  const [activeTab, setActiveTab] = useState<"todo" | "stats">("todo");
  const [filterType, setFilterType] = useState<"all" | "timer" | "habit" | "target">("all");

  // 待辦事項資料
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem("hub_pomodoro_todos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: "1", title: "英文多益單字複習", type: "timer", timingType: "countdown", durationMinutes: 25 },
      { id: "2", title: "微積分題庫練習", type: "timer", timingType: "countup", durationMinutes: 0 },
      { id: "3", title: "晨間閱讀 30 分鐘", type: "habit", timingType: "countdown", durationMinutes: 30, habitFrequency: "daily", habitTargetAmount: 30, habitUnit: "minutes" },
      { id: "4", title: "期末演算法總複習", type: "target", timingType: "countdown", durationMinutes: 30, targetDeadline: "2026-11-20", targetTotalAmount: 1200, targetCurrentAmount: 240, targetUnit: "minutes" },
      { id: "5", title: "健康飲水打卡", type: "habit", timingType: "none", durationMinutes: 0, habitFrequency: "daily", habitTargetAmount: 8, habitUnit: "times" },
    ];
  });

  // 專注紀錄
  const [records, setRecords] = useState<FocusRecord[]>(() => {
    const saved = localStorage.getItem("hub_pomodoro_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      { id: "r1", todoId: "1", todoTitle: "英文多益單字複習", durationMinutes: 25, timestamp: "2026-10-22", timeStr: "14:30" },
      { id: "r2", todoId: "2", todoTitle: "微積分題庫練習", durationMinutes: 40, timestamp: "2026-10-23", timeStr: "10:15" },
    ];
  });

  // 當前正在全螢幕沉浸專注的項目
  const [activeTodo, setActiveTodo] = useState<TodoItem | null>(null);

  // Modal 顯示控制
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // 全域廣播：通知 FocusPet 寵物專注狀態
  useEffect(() => {
    if (activeTodo) {
      window.dispatchEvent(
        new CustomEvent("hub_focus_state_change", {
          detail: { isFocusing: true, todoTitle: activeTodo.title },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent("hub_focus_state_change", {
          detail: { isFocusing: false, todoTitle: "" },
        })
      );
    }
  }, [activeTodo]);

  // 持久化儲存
  useEffect(() => {
    localStorage.setItem("hub_pomodoro_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("hub_pomodoro_records", JSON.stringify(records));
  }, [records]);

  // 開始專注 / 打卡
  const handleStartFocus = (todo: TodoItem) => {
    if (todo.timingType === "none") {
      // 不計時打卡直接結算
      handleRecordCompleted(todo.durationMinutes || 15, todo);
      return;
    }
    // 直接進入瀏覽器原生全螢幕
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setActiveTodo(todo);
  };

  // 結算專注時間並累加記錄與寵物獎勵
  const handleRecordCompleted = (actualMins: number, targetItem?: TodoItem) => {
    const item = targetItem || activeTodo;
    if (!item) return;

    const mins = Math.max(1, actualMins);
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // 若為定目標類型，累加 targetCurrentAmount
    if (item.type === "target") {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? { ...t, targetCurrentAmount: (t.targetCurrentAmount || 0) + mins }
            : t
        )
      );
    }

    const newRecord: FocusRecord = {
      id: Date.now().toString(),
      todoId: item.id,
      todoTitle: item.title,
      durationMinutes: mins,
      timestamp: dateStr,
      timeStr,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // 發送寵物經驗與金幣獎勵事件
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", {
        detail: {
          exp: Math.min(mins, 60),
          coins: 10 + Math.floor(mins / 5),
        },
      })
    );

    if (item.timingType === "none") {
      alert(`🎉 已完成【${item.title}】打卡！獲得寵物經驗值與獎勵！`);
    }
  };

  // 新增待辦
  const handleAddTodo = (newTodo: TodoItem) => {
    setTodos((prev) => [newTodo, ...prev]);
  };

  // 刪除待辦
  const handleDeleteTodo = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("確定要刪除此待辦事項嗎？")) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // 清除統計紀錄
  const handleClearRecords = () => {
    if (window.confirm("確定要清空所有專注歷史紀錄嗎？此動作無法復原。")) {
      setRecords([]);
    }
  };

  // 篩選過後的待辦清單
  const filteredTodos = todos.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1060px",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* 🌟 1. 全螢幕沉浸專注模式 (PomodoroFullScreen) */}
      {activeTodo && (
        <PomodoroFullScreen
          todo={activeTodo}
          onExit={() => setActiveTodo(null)}
          onRecordCompleted={(actualMinutes) => handleRecordCompleted(actualMinutes)}
        />
      )}

      {/* 🌟 2. 頂部導航列與狀態切換 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "18px 26px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
              fontWeight: "800",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🍅</span>
            <span>番茄沉浸專注</span>
          </h2>

          <div
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              padding: "4px",
              borderRadius: "12px",
            }}
          >
            <button
              onClick={() => setActiveTab("todo")}
              style={{
                padding: "7px 18px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: activeTab === "todo" ? "#ffffff" : "transparent",
                color: activeTab === "todo" ? "#1e293b" : "#64748b",
                boxShadow: activeTab === "todo" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s",
              }}
            >
              📋 待辦與目標 ({todos.length})
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              style={{
                padding: "7px 18px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: activeTab === "stats" ? "#ffffff" : "transparent",
                color: activeTab === "stats" ? "#1e293b" : "#64748b",
                boxShadow: activeTab === "stats" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s",
              }}
            >
              📊 數據統計分析
            </button>
          </div>
        </div>

        {activeTab === "todo" && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: "10px 22px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 0.1s",
            }}
          >
            <span>＋</span> 新增待辦 / 目標
          </button>
        )}
      </div>

      {/* 🌟 3. 主內容區：待辦事項清單 或 數據統計分析 */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        }}
      >
        {activeTab === "todo" ? (
          <div>
            {/* 分類篩選標籤 */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              {[
                { id: "all", label: "全部事項", count: todos.length },
                { id: "timer", label: "🍅 普通番茄", count: todos.filter((t) => t.type === "timer").length },
                { id: "habit", label: "🌱 養習慣", count: todos.filter((t) => t.type === "habit").length },
                { id: "target", label: "🎯 定目標", count: todos.filter((t) => t.type === "target").length },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as any)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: filterType === filter.id ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    backgroundColor: filterType === filter.id ? "#eff6ff" : "#f8fafc",
                    color: filterType === filter.id ? "#2563eb" : "#64748b",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* 待辦項目卡片列表 */}
            {filteredTodos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                目前此類別無事項，點擊右上角「＋ 新增待辦 / 目標」開始建立吧！
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))",
                  gap: "16px",
                }}
              >
                {filteredTodos.map((todo) => {
                  const targetPercent =
                    todo.type === "target" && todo.targetTotalAmount
                      ? Math.min(
                          100,
                          Math.round(((todo.targetCurrentAmount || 0) / todo.targetTotalAmount) * 100)
                        )
                      : 0;

                  return (
                    <div
                      key={todo.id}
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "14px",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>
                            {todo.title}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color:
                                todo.type === "habit"
                                  ? "#059669"
                                  : todo.type === "target"
                                  ? "#d97706"
                                  : "#2563eb",
                              backgroundColor:
                                todo.type === "habit"
                                  ? "#ecfdf5"
                                  : todo.type === "target"
                                  ? "#fffbeb"
                                  : "#eff6ff",
                              padding: "2px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {todo.type === "habit" ? "養習慣" : todo.type === "target" ? "定目標" : "普通番茄"}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: "600",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <span>
                            {todo.timingType === "countdown"
                              ? `⏱ 倒計時 · ${todo.durationMinutes} 分鐘`
                              : todo.timingType === "countup"
                              ? "📈 正向計時 (自由累加)"
                              : "✓ 不計時 (按鍵打卡)"}
                          </span>

                          {todo.type === "habit" && (
                            <span style={{ color: "#059669" }}>
                              🌱 目標：
                              {todo.habitFrequency === "daily"
                                ? "每日"
                                : todo.habitFrequency === "weekly"
                                ? "每週"
                                : "每月"}
                              完成 {todo.habitTargetAmount} {todo.habitUnit === "minutes" ? "分鐘" : "次"}
                            </span>
                          )}

                          {todo.type === "target" && (
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", color: "#d97706", marginBottom: "4px" }}>
                                <span>截止日期：{todo.targetDeadline || "無"}</span>
                                <span>
                                  進度：{todo.targetCurrentAmount || 0} / {todo.targetTotalAmount || 0} 分 ({targetPercent}%)
                                </span>
                              </div>
                              <div
                                style={{
                                  height: "6px",
                                  backgroundColor: "#e2e8f0",
                                  borderRadius: "4px",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${targetPercent}%`,
                                    backgroundColor: "#d97706",
                                    borderRadius: "4px",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                          onClick={() => handleStartFocus(todo)}
                          style={{
                            padding: "9px 18px",
                            backgroundColor: todo.timingType === "none" ? "#10b981" : "#1e293b",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            whiteSpace: "nowrap",
                            transition: "background-color 0.15s",
                          }}
                        >
                          {todo.timingType === "none" ? "✓ 一鍵打卡" : "▶ 開始專注"}
                        </button>
                        <button
                          onClick={(e) => handleDeleteTodo(todo.id, e)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#cbd5e1",
                            fontSize: "16px",
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: "6px",
                          }}
                          title="刪除待辦"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <PomodoroStats
            records={records}
            onClearRecords={handleClearRecords}
          />
        )}
      </div>

      {/* 新增待辦與目標 Modal */}
      <PomodoroAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />
    </div>
  );
}