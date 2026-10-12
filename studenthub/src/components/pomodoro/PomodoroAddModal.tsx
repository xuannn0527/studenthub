import { useState } from "react";
import type { TodoItem } from "./pomodoroTypes";

interface PomodoroAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: TodoItem) => void;
}

export default function PomodoroAddModal({ isOpen, onClose, onAdd }: PomodoroAddModalProps) {
  const [newTitle, setNewTitle] = useState<string>("");
  const [newType, setNewType] = useState<"timer" | "habit" | "target">("timer");
  const [newTimingType, setNewTimingType] = useState<"countdown" | "countup" | "none">("countdown");
  const [newDuration, setNewDuration] = useState<number>(25);

  // 養習慣欄位
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [habitTargetAmount, setHabitTargetAmount] = useState<number>(30);
  const [habitUnit, setHabitUnit] = useState<"minutes" | "times">("minutes");

  // 定目標欄位
  const [targetDeadline, setTargetDeadline] = useState<string>("2026-11-30");
  const [targetTotalAmount, setTargetTotalAmount] = useState<number>(600);
  const [targetUnit, setTargetUnit] = useState<"minutes" | "times">("minutes");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!newTitle.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      type: newType,
      timingType: newTimingType,
      durationMinutes: newTimingType === "countdown" ? newDuration : 0,

      habitFrequency: newType === "habit" ? habitFrequency : undefined,
      habitTargetAmount: newType === "habit" ? habitTargetAmount : undefined,
      habitUnit: newType === "habit" ? habitUnit : undefined,

      targetDeadline: newType === "target" ? targetDeadline : undefined,
      targetTotalAmount: newType === "target" ? targetTotalAmount : undefined,
      targetCurrentAmount: newType === "target" ? 0 : undefined,
      targetUnit: newType === "target" ? targetUnit : undefined,
    };

    onAdd(newItem);
    setNewTitle("");
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        color: "#1e293b",
        width: "440px",
        maxWidth: "90vw",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        {/* 頂部控制列 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
            {newType === "habit" ? "添加習慣養成" : newType === "target" ? "添加目標" : "添加待辦"}
          </h3>
          <button onClick={handleSubmit} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: "#2563eb", fontWeight: "700" }}>✓</button>
        </div>

        {/* 三模式切換按鈕 */}
        <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "10px", marginBottom: "18px" }}>
          <button onClick={() => setNewType("timer")} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", backgroundColor: newType === "timer" ? "#ffffff" : "transparent", color: newType === "timer" ? "#1e293b" : "#64748b" }}>普通番茄鐘</button>
          <button onClick={() => setNewType("habit")} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", backgroundColor: newType === "habit" ? "#ffffff" : "transparent", color: newType === "habit" ? "#1e293b" : "#64748b" }}>養習慣</button>
          <button onClick={() => setNewType("target")} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", backgroundColor: newType === "target" ? "#ffffff" : "transparent", color: newType === "target" ? "#1e293b" : "#64748b" }}>定目標</button>
        </div>

        {/* 事項名稱輸入框 */}
        <input
          type="text"
          placeholder="請輸入事項名稱"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            fontSize: "13px",
            outline: "none",
            marginBottom: "16px",
            boxSizing: "border-box"
          }}
        />

        {/* 養習慣選單 */}
        {newType === "habit" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569", fontWeight: "600" }}>我想</span>
              <select
                value={habitFrequency}
                onChange={(e) => setHabitFrequency(e.target.value as any)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "700" }}
              >
                <option value="daily">每天 ▼</option>
                <option value="weekly">每週 ▼</option>
                <option value="monthly">每月 ▼</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569", fontWeight: "600" }}>完成</span>
              <input
                type="number"
                value={habitTargetAmount}
                onChange={(e) => setHabitTargetAmount(Number(e.target.value))}
                style={{ width: "80px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center" }}
              />
              <select
                value={habitUnit}
                onChange={(e) => setHabitUnit(e.target.value as any)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "700" }}
              >
                <option value="minutes">分鐘 ▼</option>
                <option value="times">次 ▼</option>
              </select>
            </div>
          </div>
        )}

        {/* 定目標選單 */}
        {newType === "target" && (
          <div style={{ backgroundColor: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569", fontWeight: "600" }}>我想在</span>
              <input
                type="date"
                value={targetDeadline}
                onChange={(e) => setTargetDeadline(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "700" }}
              />
              <span style={{ color: "#475569", fontWeight: "600" }}>之前</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#475569", fontWeight: "600" }}>一共完成</span>
              <input
                type="number"
                value={targetTotalAmount}
                onChange={(e) => setTargetTotalAmount(Number(e.target.value))}
                style={{ width: "90px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center" }}
              />
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value as any)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: "700" }}
              >
                <option value="minutes">分鐘 ▼</option>
                <option value="times">次 ▼</option>
              </select>
            </div>
          </div>
        )}

        {/* 專注方式選擇 */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", marginBottom: "8px" }}>
            設置單次專注的時長：
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button onClick={() => setNewTimingType("countdown")} style={{ flex: 1, padding: "8px 0", border: "1px solid", borderColor: newTimingType === "countdown" ? "#2563eb" : "#cbd5e1", backgroundColor: newTimingType === "countdown" ? "#eff6ff" : "#fff", color: newTimingType === "countdown" ? "#2563eb" : "#64748b", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>倒計時</button>
            <button onClick={() => setNewTimingType("countup")} style={{ flex: 1, padding: "8px 0", border: "1px solid", borderColor: newTimingType === "countup" ? "#2563eb" : "#cbd5e1", backgroundColor: newTimingType === "countup" ? "#eff6ff" : "#fff", color: newTimingType === "countup" ? "#2563eb" : "#64748b", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>正向計時</button>
            <button onClick={() => setNewTimingType("none")} style={{ flex: 1, padding: "8px 0", border: "1px solid", borderColor: newTimingType === "none" ? "#2563eb" : "#cbd5e1", backgroundColor: newTimingType === "none" ? "#eff6ff" : "#fff", color: newTimingType === "none" ? "#2563eb" : "#64748b", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>不計時</button>
          </div>

          {newTimingType === "countdown" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                <span>倒計時長</span>
                <span style={{ color: "#2563eb", fontWeight: "700" }}>{newDuration} 分鐘</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>取消</button>
          <button onClick={handleSubmit} style={{ padding: "8px 24px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>確認新增</button>
        </div>
      </div>
    </div>
  );
}