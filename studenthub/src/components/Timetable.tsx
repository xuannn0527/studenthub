import React, { useState, useRef, useMemo } from "react";
import html2canvas from "html2canvas";

export interface Course {
  id: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number;
  classroom: string;
}

const DAYS: Array<Course["day"]> = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_LABELS: Record<Course["day"], string> = { Mon: "週一", Tue: "週二", Wed: "週三", Thu: "週四", Fri: "週五" };
const MOBILE_DAY_LABELS: Record<Course["day"], string> = { Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI" };

const PERIOD_TIMES: Record<number, string> = {
  1: "08:10-09:00", 2: "09:10-10:00", 3: "10:10-11:00", 4: "11:10-12:00",
  5: "13:40-14:30", 6: "14:40-15:30", 7: "15:40-16:30", 8: "16:40-17:30"
};
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255";
};

export default function Timetable() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("hub_courses");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState<Course["day"]>("Mon");
  const [period, setPeriod] = useState<number>(1);
  const [editTargetIds, setEditTargetIds] = useState<string[] | null>(null);

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem("hub_bg_image") || null);
  const [cardColor, setCardColor] = useState(() => localStorage.getItem("hub_card_color") || "#ffffff");
  const [cardOpacity, setCardOpacity] = useState(() => parseFloat(localStorage.getItem("hub_card_opacity") || "0.45"));
  const [textColor, setTextColor] = useState(() => localStorage.getItem("hub_text_color") || "#1f2937");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const mergedCourses = useMemo(() => {
    const merged: Array<{ name: string; classroom: string; day: string; startPeriod: number; span: number; ids: string[] }> = [];
    for (const d of DAYS) {
      const dayCourses = courses.filter((c) => c.day === d).sort((a, b) => a.period - b.period);
      let current: any = null;
      for (const c of dayCourses) {
        if (!current) {
          current = { name: c.name, classroom: c.classroom, day: c.day, startPeriod: c.period, span: 1, ids: [c.id] };
        } else {
          if (current.name === c.name && current.classroom === c.classroom && current.startPeriod + current.span === c.period) {
            current.span += 1;
            current.ids.push(c.id);
          } else {
            merged.push(current);
            current = { name: c.name, classroom: c.classroom, day: c.day, startPeriod: c.period, span: 1, ids: [c.id] };
          }
        }
      }
      if (current) merged.push(current);
    }
    return merged;
  }, [courses]);

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTargetIds) {
      const updated = courses.map((c) => editTargetIds.includes(c.id) ? { ...c, name, classroom } : c);
      setCourses(updated);
      localStorage.setItem("hub_courses", JSON.stringify(updated));
      setEditTargetIds(null);
    } else {
      const exists = courses.some((c) => c.day === day && c.period === period);
      if (exists) {
        alert("此時段已經有排定課程！");
        return;
      }
      const updated = [...courses, { id: Date.now().toString(), name, classroom, day, period }];
      setCourses(updated);
      localStorage.setItem("hub_courses", JSON.stringify(updated));
    }
    setName("");
    setClassroom("");
  };

  const handleDelete = (idsToDelete: string[]) => {
    const updated = courses.filter((c) => !idsToDelete.includes(c.id));
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    if (editTargetIds && idsToDelete.includes(editTargetIds[0])) {
      setEditTargetIds(null);
      setName("");
      setClassroom("");
    }
  };

  const handleEditClick = (mc: any) => {
    if (!isManageMode) return;
    setName(mc.name);
    setClassroom(mc.classroom);
    setEditTargetIds(mc.ids);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n').map(l => l.trim());
    const newCourses: Course[] = [];
    const dayMap: Record<string, Course["day"]> = { "一": "Mon", "二": "Tue", "三": "Wed", "四": "Thu", "五": "Fri" };

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(一|二|三|四|五)\s+全\s+D?(\d)-D?(\d)\s+([A-Za-z0-9]+)/);
      if (match) {
        const start = parseInt(match[2], 10);
        const end = parseInt(match[3], 10);
        let courseName = "未知課程";
        if (i > 0 && lines[i - 1] && !lines[i - 1].includes("必") && !lines[i - 1].includes("選")) courseName = lines[i - 1];
        else if (i > 2 && lines[i - 2] && !lines[i - 2].includes("必")) courseName = lines[i - 2];
        for (let p = start; p <= end; p++) {
          if (p >= 1 && p <= 8) {
            newCourses.push({ id: `imp-${Date.now()}-${p}-${Math.random().toString(36).substring(2)}`, name: courseName, day: dayMap[match[1]], period: p, classroom: match[4] });
          }
        }
      }
    }
    if (newCourses.length === 0) return alert("無法解析，請確認格式。");
    const updated = [...courses, ...newCourses];
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    setImportText("");
    setShowImport(false);
    alert(`🎉 成功匯入 ${newCourses.length} 節課程！`);
  };

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    try {
      const originalBorder = exportRef.current.style.border;
      const originalBorderRadius = exportRef.current.style.borderRadius;
      const originalBoxShadow = exportRef.current.style.boxShadow;

      exportRef.current.style.border = "none";
      exportRef.current.style.borderRadius = "0px";
      exportRef.current.style.boxShadow = "none";

      const canvas = await html2canvas(exportRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: bgImage ? null : "#ffffff",
      });

      exportRef.current.style.border = originalBorder;
      exportRef.current.style.borderRadius = originalBorderRadius;
      exportRef.current.style.boxShadow = originalBoxShadow;

      const link = document.createElement("a");
      link.download = "MyTimetable_Wallpaper.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      alert("匯出圖片失敗，請確定背景圖片是否支援 CORS (建議上傳本機圖片)。");
    }
  };

  const updateSettings = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === "hub_card_color") setCardColor(value);
    if (key === "hub_card_opacity") setCardOpacity(parseFloat(value));
    if (key === "hub_text_color") setTextColor(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          localStorage.setItem("hub_bg_image", reader.result as string);
          setBgImage(reader.result as string);
        } catch {
          alert("圖片檔案過大 (建議 2MB 以下)。");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* 整合操作面板 (雙層設計) */}
      <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* 上半層：課程資料管理 */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          
          {/* 左側表單 */}
          <form onSubmit={handleSaveCourse} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
            <input type="text" placeholder="✨ 課程名稱" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", flex: 1, minWidth: "120px", outline: "none", fontSize: "13px" }} />
            <input type="text" placeholder="📍 教室" value={classroom} onChange={(e) => setClassroom(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "80px", outline: "none", fontSize: "13px" }} />
            
            {!editTargetIds && (
              <>
                <select value={day} onChange={(e) => setDay(e.target.value as Course["day"])} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "#fff", cursor: "pointer", fontSize: "13px" }}>
                  {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                </select>
                <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", backgroundColor: "#fff", cursor: "pointer", fontSize: "13px" }}>
                  {PERIODS.map((p) => <option key={p} value={p}>第 {p} 節</option>)}
                </select>
              </>
            )}

            <button type="submit" style={{ padding: "8px 16px", backgroundColor: editTargetIds ? "#10b981" : "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", boxShadow: "0 2px 4px rgba(59,130,246,0.2)" }}>
              {editTargetIds ? "💾 儲存修改" : "➕ 新增"}
            </button>
            
            {editTargetIds && (
              <button type="button" onClick={() => { setEditTargetIds(null); setName(""); setClassroom(""); }} style={{ padding: "8px 12px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                取消
              </button>
            )}
          </form>

          {/* 右側管理功能 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setIsManageMode(!isManageMode)} style={{ padding: "8px 14px", backgroundColor: isManageMode ? "#fee2e2" : "#f1f5f9", color: isManageMode ? "#ef4444" : "#475569", border: isManageMode ? "1px solid #fca5a5" : "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              {isManageMode ? "✅ 完成編輯" : "✏️ 編輯 / 刪除"}
            </button>
            <button onClick={() => setShowImport(!showImport)} style={{ padding: "8px 14px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              📋 智慧匯入
            </button>
          </div>
        </div>

        {/* 優雅的分隔線 */}
        <div style={{ height: "1px", backgroundColor: "#e2e8f0", width: "100%" }}></div>

        {/* 下半層：外觀與輸出 */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ padding: "8px 14px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              🎨 顏色設定
            </button>
            
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
            {bgImage ? (
              <button onClick={() => { localStorage.removeItem("hub_bg_image"); setBgImage(null); }} style={{ padding: "8px 14px", backgroundColor: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                ✕ 移除背景
              </button>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: "8px 14px", backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                🖼️ 自訂桌布背景
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => setIsMobileView(!isMobileView)} style={{ padding: "8px 16px", backgroundColor: isMobileView ? "#1e293b" : "#e2e8f0", color: isMobileView ? "#fff" : "#334155", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              {isMobileView ? "💻 切回網頁版" : "📱 預覽手機 9:16"}
            </button>
            <button onClick={handleExportImage} style={{ padding: "8px 18px", backgroundColor: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px", boxShadow: "0 2px 6px rgba(245,158,11,0.3)" }}>
              📸 匯出桌布圖片
            </button>
          </div>
        </div>
      </div>

      {/* 外觀設定展開區塊 */}
      {showSettings && (
        <div style={{ padding: "16px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}>卡片顏色：</span>
            <input type="color" value={cardColor} onChange={(e) => updateSettings("hub_card_color", e.target.value)} style={{ border: "none", cursor: "pointer", width: "30px", height: "30px", padding: 0, borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}>字體顏色：</span>
            <input type="color" value={textColor} onChange={(e) => updateSettings("hub_text_color", e.target.value)} style={{ border: "none", cursor: "pointer", width: "30px", height: "30px", padding: 0, borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "200px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#475569" }}>卡片透明度 ({cardOpacity})：</span>
            <input type="range" min="0.1" max="1" step="0.05" value={cardOpacity} onChange={(e) => updateSettings("hub_card_opacity", e.target.value)} style={{ flex: 1, cursor: "pointer" }} />
          </div>
        </div>
      )}

      {/* 匯入清單展開區塊 */}
      {showImport && (
        <div style={{ padding: "16px", backgroundColor: "#f0fdf4", border: "1px dashed #4ade80", borderRadius: "12px" }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#166534", fontWeight: "600" }}>請將選課系統的【已選課程】清單完整複製並貼上至下方：</p>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={4} placeholder="請直接從選課系統複製整段文字並貼上..." style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "12px", fontSize: "13px", resize: "vertical", outline: "none" }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleImport} style={{ padding: "8px 24px", backgroundColor: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
              🚀 開始解析並匯入
            </button>
          </div>
        </div>
      )}

      {/* --- 以下是課表顯示區域 (完全保留您的手機版精密微調) --- */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div 
          ref={exportRef}
          style={{ 
            width: isMobileView ? "375px" : "100%", 
            height: isMobileView ? "812px" : "auto", 
            backgroundColor: bgImage ? "#000" : "#ffffff",
            backgroundImage: bgImage ? `url(${bgImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "16px", 
            border: isMobileView ? "8px solid #1e293b" : "1px solid #e2e8f0", 
            boxShadow: isMobileView ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)" : "none",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ 
            paddingTop: isMobileView ? "240px" : "16px", 
            paddingLeft: "12px", 
            paddingRight: "12px", 
            paddingBottom: isMobileView ? "90px" : "24px", 
            height: "100%",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: isMobileView ? "45px repeat(5, 1fr)" : "50px repeat(5, 1fr)",
            gridTemplateRows: `auto repeat(${PERIODS.length}, 1fr)`,
            gap: isMobileView ? "4px 6px" : "10px 8px"
          }}>
            
            <div style={{ gridColumn: 1, gridRow: 1 }}></div>
            
            {DAYS.map((d, index) => (
              <div key={d} style={{ gridColumn: index + 2, gridRow: 1, fontWeight: "600", fontSize: isMobileView ? "10px" : "13px", color: bgImage ? "#f8fafc" : "#334155", textAlign: "center", textShadow: bgImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none", letterSpacing: "1px" }}>
                {isMobileView ? MOBILE_DAY_LABELS[d] : DAY_LABELS[d]}
              </div>
            ))}

            {PERIODS.map((p, pIndex) => (
              <div key={`period-${p}`} style={{ gridColumn: 1, gridRow: pIndex + 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: bgImage ? "#e2e8f0" : "#94a3b8", textShadow: bgImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none", minHeight: isMobileView ? "38px" : "56px" }}>
                <span style={{ fontSize: isMobileView ? "11px" : "12px", fontWeight: "600", lineHeight: 1 }}>
                  {isMobileView ? p : `第 ${p} 節`}
                </span>
                {isMobileView && (
                  <span style={{ fontSize: "7px", opacity: 0.9, marginTop: "1px", letterSpacing: "-0.5px", textAlign: "center", lineHeight: 1 }}>
                    {PERIOD_TIMES[p].replace("-", "\n")}
                  </span>
                )}
              </div>
            ))}

            {mergedCourses.map((mc, idx) => {
              const dayIndex = DAYS.indexOf(mc.day as Course["day"]);
              const customBg = `rgba(${hexToRgb(cardColor)}, ${cardOpacity})`;
              const cardBorder = bgImage ? "none" : `1px solid rgba(${hexToRgb(cardColor)}, 1)`;
              const shadow = bgImage ? "none" : "0 2px 4px rgba(0,0,0,0.05)";

              return (
                <div 
                  key={`merged-${idx}`} 
                  onClick={() => isManageMode && handleEditClick(mc)} 
                  style={{ 
                    gridColumn: dayIndex + 2, 
                    gridRow: `${mc.startPeriod + 1} / span ${mc.span}`, 
                    background: customBg,
                    backdropFilter: "blur(12px)", 
                    WebkitBackdropFilter: "blur(12px)", 
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: shadow,
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    position: "relative",
                    cursor: isManageMode ? "pointer" : "default",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: isMobileView ? "10px" : "13px", fontWeight: "700", color: textColor, lineHeight: "1.2", marginBottom: "1px", textAlign: "center", padding: "0 2px" }}>
                    {mc.name}
                  </span>
                  <span style={{ fontSize: isMobileView ? "8px" : "10px", color: textColor, opacity: 0.85, fontWeight: "600", marginTop: "1px", textAlign: "center" }}>
                    {mc.classroom}
                  </span>
                  
                  {isManageMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(mc.ids); }} 
                      style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", backgroundColor: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", zIndex: 10 }}
                      title="刪除"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}