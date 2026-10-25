import { useState } from "react";

export interface Course {
  id: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number;
  classroom: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newCourses: Course[]) => void;
}

const IGNORE_PATTERNS = [
  /^英-/, /^全英語/, /^EMI/, /^跨領域/, /^遠距/, /^數位/, /^微學程/,
  /^\d+(\.\d+)?$/, 
  /^(必|選)$/,      
  /^D?\d{5,}/,      
  /^(資管|企管|資工|會計|統資|貿金|管院|應美|中文|英文|西文|日文|哲學|社資)[一二三四甲乙丙丁]?/
];

const DAY_MAP: Record<string, Course["day"]> = {
  "一": "Mon",
  "二": "Tue",
  "三": "Wed",
  "四": "Thu",
  "五": "Fri"
};

export default function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [importText, setImportText] = useState("");

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').map(l => l.trim());
    const parsedCourses: Course[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/(一|二|三|四|五)\s+全\s+D?(\d)-D?(\d)\s+([A-Za-z0-9]+)/);
      if (match) {
        const dayZh = match[1];
        const start = parseInt(match[2], 10);
        const end = parseInt(match[3], 10);
        const classroom = match[4];

        let courseName = "未知課程";

        for (let j = i - 1; j >= 0 && j >= i - 6; j--) {
          const prev = lines[j];
          if (!prev) continue;
          
          const isIgnored = IGNORE_PATTERNS.some(regex => regex.test(prev));
          if (!isIgnored && !prev.includes("點選") && !prev.includes("已選課程")) {
            courseName = prev;
            break;
          }
        }

        for (let p = start; p <= end; p++) {
          if ((p >= 1 && p <= 8) || p === 9) {
            parsedCourses.push({
              id: `imp-${Date.now()}-${p}-${Math.random().toString(36).substring(2, 6)}`,
              name: courseName,
              day: DAY_MAP[dayZh],
              period: p,
              classroom: classroom
            });
          }
        }
      }
    }

    if (parsedCourses.length === 0) {
      alert("無法解析，請確認是否完整複製了選課清單文字。");
      return;
    }

    onImportSuccess(parsedCourses);
    setImportText("");
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(10, 15, 30, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "680px",
          maxWidth: "92vw",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          borderRadius: "24px",
          border: "1.5px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          color: "#ffffff",
          animation: "modalFadeIn 0.2s ease-out"
        }}
      >
        {/* 頂部標題列 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#34d399", display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <polyline points="9 15 12 18 15 15"></polyline>
              </svg>
            </span>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
              智慧匯入選課清單
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "8px",
              transition: "background-color 0.15s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 提示引導文字 */}
        <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
          前往學校選課系統複製【已選課程清單】並直接貼在下方，系統將自動解析星期、堂次、課程與教室名稱：
        </p>

        {/* 🌟 放大加高的文字輸入框 */}
        <textarea 
          value={importText} 
          onChange={(e) => setImportText(e.target.value)} 
          rows={11} 
          placeholder="在此直接貼上選課清單純文字內容 (Ctrl+V)..." 
          style={{ 
            width: "100%", 
            padding: "16px", 
            borderRadius: "14px", 
            border: "1.5px solid rgba(255, 255, 255, 0.15)", 
            fontSize: "13px", 
            lineHeight: "1.6",
            resize: "vertical", 
            boxSizing: "border-box",
            outline: "none",
            fontFamily: "inherit",
            backgroundColor: "rgba(30, 41, 59, 0.8)",
            color: "#ffffff",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#38bdf8")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)")}
        />

        {/* 底部動作按鈕 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "4px" }}>
          <button 
            onClick={onClose} 
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#cbd5e1",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            取消
          </button>
          <button 
            onClick={handleParseAndImport} 
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 0 14px rgba(16, 185, 129, 0.4)",
              transition: "transform 0.1s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            確認解析匯入
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}