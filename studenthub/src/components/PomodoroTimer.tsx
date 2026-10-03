import { useState, useEffect } from "react";

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomos, setPomos] = useState<number>(() => {
    const saved = localStorage.getItem("hub_today_pomos");
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      const next = pomos + 1;
      setPomos(next);
      localStorage.setItem("hub_today_pomos", JSON.stringify(next));
      alert("🎉 番茄鐘完成！獲得一顆番茄！");
      setTimeLeft(25 * 60);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, pomos]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ef4444" }}>🍅 今日累計：{pomos} 顆</span>
        <button
          onClick={() => { setIsRunning(false); setTimeLeft(5); }}
          style={{ fontSize: "11px", backgroundColor: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", padding: "3px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          ⚡ Demo 快速測 (5秒)
        </button>
      </div>

      <div style={{ fontSize: "44px", fontWeight: "bold", color: "#1e293b", margin: "10px 0" }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{ padding: "6px 20px", backgroundColor: isRunning ? "#ef4444" : "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
        >
          {isRunning ? "暫停" : "開始"}
        </button>
        <button
          onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
          style={{ padding: "6px 14px", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer" }}
        >
          重置
        </button>
      </div>
    </div>
  );
}