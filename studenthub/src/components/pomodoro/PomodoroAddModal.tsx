import { useState, type FormEvent } from "react";
import type { TodoItem } from "./pomodoroTypes";

interface PomodoroAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: TodoItem) => void;
}

export default function PomodoroAddModal({ isOpen, onClose, onAdd }: PomodoroAddModalProps) {
  const [taskType, setTaskType] = useState<"timer" | "habit" | "target">("timer");
  const [title, setTitle] = useState<string>("");
  const [timingType, setTimingType] = useState<"countdown" | "countup" | "none">("countdown");
  const [durationMinutes, setDurationMinutes] = useState<number>(25);

  // 養習慣欄位
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [habitTargetAmount, setHabitTargetAmount] = useState<number>(30);
  const [habitUnit, setHabitUnit] = useState<"minutes" | "times">("minutes");

  // 定目標欄位
  const [targetDeadline, setTargetDeadline] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [targetTotalAmount, setTargetTotalAmount] = useState<number>(600); // 總目標分鐘數

  if (!isOpen) return null;

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert("請填寫事項名稱！");
      return;
    }

    const newItem: TodoItem = {
      id: Date.now().toString(),
      title: title.trim(),
      type: taskType,
      timingType,
      durationMinutes: timingType === "countdown" ? durationMinutes : 0,

      // 養習慣專屬欄位
      habitFrequency: taskType === "habit" ? habitFrequency : undefined,
      habitTargetAmount: taskType === "habit" ? habitTargetAmount : undefined,
      habitUnit: taskType === "habit" ? habitUnit : undefined,

      // 定目標專屬欄位
      targetDeadline: taskType === "target" ? targetDeadline : undefined,
      targetTotalAmount: taskType === "target" ? targetTotalAmount : undefined,
      targetCurrentAmount: taskType === "target" ? 0 : undefined,
      targetUnit: taskType === "target" ? "minutes" : undefined,
    };

    onAdd(newItem);
    setTitle("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          width: "480px",
          maxWidth: "100%",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          color: "#1e293b",
          boxSizing: "border-box",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部標題與關閉按鈕 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
              ✨ 新增待辦與專注目標
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
              設定專注時長、習慣培養或長期里程碑
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* 1. 三種任務類型切換 Tab */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "6px",
            backgroundColor: "#f1f5f9",
            padding: "5px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => setTaskType("timer")}
            style={{
              padding: "9px 0",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: taskType === "timer" ? "#ffffff" : "transparent",
              color: taskType === "timer" ? "#2563eb" : "#64748b",
              boxShadow: taskType === "timer" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}
          >
            🍅 普通番茄
          </button>
          <button
            type="button"
            onClick={() => setTaskType("habit")}
            style={{
              padding: "9px 0",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: taskType === "habit" ? "#ffffff" : "transparent",
              color: taskType === "habit" ? "#059669" : "#64748b",
              boxShadow: taskType === "habit" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}
          >
            🌱 養習慣
          </button>
          <button
            type="button"
            onClick={() => setTaskType("target")}
            style={{
              padding: "9px 0",
              border: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: taskType === "target" ? "#ffffff" : "transparent",
              color: taskType === "target" ? "#d97706" : "#64748b",
              boxShadow: taskType === "target" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s",
            }}
          >
            🎯 定目標
          </button>
        </div>

        {/* 2. 事項名稱輸入框 */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
            事項名稱
          </label>
          <input
            type="text"
            placeholder={
              taskType === "timer"
                ? "例：線性代數期中複習"
                : taskType === "habit"
                ? "例：每日早讀背單字"
                : "例：多益衝刺 30 小時目標"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 3. 養習慣專屬設定 */}
        {taskType === "habit" && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>🌱 習慣養成目標設定</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>週期頻率：</span>
              <select
                value={habitFrequency}
                onChange={(e) => setHabitFrequency(e.target.value as any)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #86efac",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                <option value="daily">每日</option>
                <option value="weekly">每週</option>
                <option value="monthly">每月</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>目標額度：</span>
              <input
                type="number"
                min="1"
                value={habitTargetAmount}
                onChange={(e) => setHabitTargetAmount(Number(e.target.value))}
                style={{
                  width: "80px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #86efac",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              />
              <select
                value={habitUnit}
                onChange={(e) => setHabitUnit(e.target.value as any)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #86efac",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                <option value="minutes">分鐘</option>
                <option value="times">次數</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. 定目標專屬設定 */}
        {taskType === "target" && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#92400e" }}>🎯 長期目標設定</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>截止日期：</span>
              <input
                type="date"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #fcd34d",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>總目標分鐘：</span>
              <input
                type="number"
                min="10"
                step="30"
                value={targetTotalAmount}
                onChange={(e) => setTargetTotalAmount(Number(e.target.value))}
                style={{
                  width: "100px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #fcd34d",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              />
              <span style={{ fontSize: "12px", color: "#b45309" }}>
                ({Math.floor(targetTotalAmount / 60)} 小時 {targetTotalAmount % 60} 分鐘)
              </span>
            </div>
          </div>
        )}

        {/* 5. 三種計時機制選擇 */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
            單次計時機制
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => setTimingType("countdown")}
              style={{
                padding: "10px 0",
                border: "1px solid",
                borderColor: timingType === "countdown" ? "#2563eb" : "#cbd5e1",
                backgroundColor: timingType === "countdown" ? "#eff6ff" : "#ffffff",
                color: timingType === "countdown" ? "#2563eb" : "#64748b",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ⏱ 倒計時
            </button>
            <button
              type="button"
              onClick={() => setTimingType("countup")}
              style={{
                padding: "10px 0",
                border: "1px solid",
                borderColor: timingType === "countup" ? "#2563eb" : "#cbd5e1",
                backgroundColor: timingType === "countup" ? "#eff6ff" : "#ffffff",
                color: timingType === "countup" ? "#2563eb" : "#64748b",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📈 正向計時
            </button>
            <button
              type="button"
              onClick={() => setTimingType("none")}
              style={{
                padding: "10px 0",
                border: "1px solid",
                borderColor: timingType === "none" ? "#2563eb" : "#cbd5e1",
                backgroundColor: timingType === "none" ? "#eff6ff" : "#ffffff",
                color: timingType === "none" ? "#2563eb" : "#64748b",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              ✓ 不計時打卡
            </button>
          </div>

          {/* 倒計時分鐘滑桿與快捷鍵 */}
          {timingType === "countdown" && (
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>單次專注分鐘</span>
                <span style={{ fontSize: "16px", color: "#2563eb", fontWeight: "800" }}>{durationMinutes} 分鐘</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer", accentColor: "#2563eb" }}
              />
              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                {[15, 25, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    style={{
                      flex: 1,
                      padding: "4px 0",
                      fontSize: "11px",
                      fontWeight: "700",
                      borderRadius: "6px",
                      border: durationMinutes === m ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      backgroundColor: durationMinutes === m ? "#2563eb" : "#ffffff",
                      color: durationMinutes === m ? "#ffffff" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "10px 28px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
          >
            確認新增
          </button>
        </div>
      </div>
    </div>
  );
}