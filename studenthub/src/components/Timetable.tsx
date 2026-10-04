import React, { useState, useRef, useMemo, useEffect } from "react";
import html2canvas from "html2canvas";
import ImportModal from "./ImportModal"; // 🌟 引入新抽離的彈窗元件

export interface Course {
  id: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number; // 1~8 為正常節次，9 為中午 12:40-13:30
  classroom: string;
}

const DAYS: Array<Course["day"]> = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_LABELS: Record<Course["day"], string> = { Mon: "週一", Tue: "週二", Wed: "週三", Thu: "週四", Fri: "週五" };
const MOBILE_DAY_LABELS: Record<Course["day"], string> = { Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI" };

const PERIOD_TIMES: Record<number, { label: string; time: string; isNoon?: boolean }> = {
  1: { label: "1", time: "08:10-09:00" },
  2: { label: "2", time: "09:10-10:00" },
  3: { label: "3", time: "10:10-11:00" },
  4: { label: "4", time: "11:10-12:00" },
  9: { label: "", time: "12:40-13:30", isNoon: true },
  5: { label: "5", time: "13:40-14:30" },
  6: { label: "6", time: "14:40-15:30" },
  7: { label: "7", time: "15:40-16:30" },
  8: { label: "8", time: "16:40-17:30" },
};

const PERIOD_KEYS = [1, 2, 3, 4, 9, 5, 6, 7, 8];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255";
};

const Icons = {
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  monitor: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  smartphone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  import: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <polyline points="9 15 12 18 15 15"></polyline>
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  edit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  palette: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
    </svg>
  ),
  image: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  move: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 9 2 12 5 15"></polyline>
      <polyline points="9 5 12 2 15 5"></polyline>
      <polyline points="15 19 12 22 9 19"></polyline>
      <polyline points="19 9 22 12 19 15"></polyline>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="12" y1="2" x2="12" y2="22"></line>
    </svg>
  )
};

export default function Timetable() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("hub_courses");
    if (!saved) return [];
    try {
      const parsed: Course[] = JSON.parse(saved);
      const uniqueMap = new Map<string, Course>();
      parsed.forEach((c) => {
        uniqueMap.set(`${c.day}-${c.period}`, c);
      });
      return Array.from(uniqueMap.values());
    } catch {
      return [];
    }
  });
  
  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState<Course["day"]>("Mon");
  const [period, setPeriod] = useState<number>(1);
  const [editTargetIds, setEditTargetIds] = useState<string[] | null>(null);

  // 控制彈窗狀態
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem("hub_bg_image") || null);
  const [bgPosX, setBgPosX] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_pos_x");
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [bgPosY, setBgPosY] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_pos_y");
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [bgZoom, setBgZoom] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_zoom");
    return saved !== null ? parseInt(saved, 10) : 100;
  });
  
  const [cardColor, setCardColor] = useState(() => {
    const savedColor = localStorage.getItem("hub_card_color");
    const hasBg = localStorage.getItem("hub_bg_image");
    if (savedColor) return savedColor;
    return hasBg ? "#ffffff" : "#bfdbfe";
  });

  const [cardOpacity, setCardOpacity] = useState(() => {
    const saved = localStorage.getItem("hub_card_opacity");
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [textColor, setTextColor] = useState(() => localStorage.getItem("hub_text_color") || "#000000");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const containerHeight = previewContainerRef.current.clientHeight;
      const targetHeight = isMobileView ? 812 : 720;
      const availableHeight = containerHeight - 30;
      if (availableHeight < targetHeight) {
        setScaleFactor(Math.max(0.5, availableHeight / targetHeight));
      } else {
        setScaleFactor(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isMobileView]);

  const mergedCourses = useMemo(() => {
    const merged: Array<{ name: string; classroom: string; day: string; startPeriodKeyIndex: number; span: number; ids: string[] }> = [];
    for (const d of DAYS) {
      const dayCourses = courses.filter((c) => c.day === d);
      dayCourses.sort((a, b) => PERIOD_KEYS.indexOf(a.period) - PERIOD_KEYS.indexOf(b.period));
      
      let current: any = null;
      for (const c of dayCourses) {
        const pKeyIndex = PERIOD_KEYS.indexOf(c.period);
        if (!current) {
          current = { name: c.name, classroom: c.classroom, day: c.day, startPeriodKeyIndex: pKeyIndex, span: 1, ids: [c.id] };
        } else {
          if (current.name === c.name && current.classroom === c.classroom && current.startPeriodKeyIndex + current.span === pKeyIndex) {
            current.span += 1;
            current.ids.push(c.id);
          } else {
            merged.push(current);
            current = { name: c.name, classroom: c.classroom, day: c.day, startPeriodKeyIndex: pKeyIndex, span: 1, ids: [c.id] };
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
  };

  // 接收彈窗解析出來的新課程
  const handleImportSuccess = (newCourses: Course[]) => {
    const courseMap = new Map<string, Course>();
    courses.forEach((c) => courseMap.set(`${c.day}-${c.period}`, c));
    newCourses.forEach((c) => courseMap.set(`${c.day}-${c.period}`, c));

    const updated = Array.from(courseMap.values());
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    alert(`🎉 匯入完成！已自動濾除重複堂次，課表已完美合併。`);
  };

  const handleClearAll = () => {
    if (window.confirm("確定要清空目前課表上的所有課程嗎？")) {
      setCourses([]);
      localStorage.setItem("hub_courses", JSON.stringify([]));
      setEditTargetIds(null);
      setName("");
      setClassroom("");
    }
  };

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    try {
      const originalTransform = exportRef.current.style.transform;
      const originalBorder = exportRef.current.style.border;
      const originalBorderRadius = exportRef.current.style.borderRadius;
      const originalBoxShadow = exportRef.current.style.boxShadow;

      exportRef.current.style.transform = "none";
      exportRef.current.style.border = "none";
      exportRef.current.style.borderRadius = "0px";
      exportRef.current.style.boxShadow = "none";

      const canvas = await html2canvas(exportRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: bgImage ? null : "#ffffff",
      });

      exportRef.current.style.transform = originalTransform;
      exportRef.current.style.border = originalBorder;
      exportRef.current.style.borderRadius = originalBorderRadius;
      exportRef.current.style.boxShadow = originalBoxShadow;

      const link = document.createElement("a");
      link.download = isMobileView ? "MyTimetable_Mobile_Wallpaper.png" : "MyTimetable_3-4_Wallpaper.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("匯出圖片失敗，請確定背景圖片是否支援 CORS。");
    }
  };

  const updateSettings = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === "hub_card_color") setCardColor(value);
    if (key === "hub_card_opacity") setCardOpacity(parseFloat(value));
    if (key === "hub_text_color") setTextColor(value);
  };

  const updateBgPos = (x: number, y: number, zoom: number) => {
    setBgPosX(x);
    setBgPosY(y);
    setBgZoom(zoom);
    localStorage.setItem("hub_bg_pos_x", String(x));
    localStorage.setItem("hub_bg_pos_y", String(y));
    localStorage.setItem("hub_bg_zoom", String(zoom));
  };

  const handleResetBgPos = () => {
    updateBgPos(50, 50, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Str = reader.result as string;
          localStorage.setItem("hub_bg_image", base64Str);
          setBgImage(base64Str);
          setCardColor("#ffffff");
          localStorage.setItem("hub_card_color", "#ffffff");
          handleResetBgPos();
        } catch {
          alert("圖片檔案過大 (建議 2MB 以下)。");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    localStorage.removeItem("hub_bg_image");
    setBgImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setCardColor("#bfdbfe");
    localStorage.setItem("hub_card_color", "#bfdbfe");
    handleResetBgPos();
  };

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "center", height: "100%", width: "100%", boxSizing: "border-box", overflow: "hidden", position: "relative" }}>
      
      {/* 🌟 彈窗元件：已移至獨立檔案 */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* 🌟 左側：課表預覽主體 */}
      <div 
        ref={previewContainerRef}
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          flex: 1, 
          height: "100%", 
          overflow: "hidden" 
        }}
      >
        <div 
          ref={exportRef}
          style={{ 
            width: isMobileView ? "375px" : "540px", 
            height: isMobileView ? "812px" : "720px", 
            backgroundColor: bgImage ? "#000" : "#ffffff",
            backgroundImage: bgImage ? `url(${bgImage})` : "none",
            backgroundSize: bgImage ? (bgZoom === 100 ? "cover" : `${bgZoom}% auto`) : "cover",
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundRepeat: "no-repeat",
            borderRadius: "16px", 
            border: isMobileView ? "8px solid #1e293b" : "1px solid #e2e8f0", 
            boxShadow: isMobileView ? "0 20px 25px -5px rgba(0, 0, 0, 0.15)" : "0 4px 20px rgba(0, 0, 0, 0.06)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            transform: `scale(${scaleFactor})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease, background-position 0.1s ease-out"
          }}
        >
          <div style={{ 
            paddingTop: isMobileView ? "200px" : "50px", 
            paddingLeft: "16px", 
            paddingRight: "16px", 
            paddingBottom: isMobileView ? "90px" : "20px", 
            height: "100%",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "50px repeat(5, 1fr)",
            gridTemplateRows: `auto repeat(${PERIOD_KEYS.length}, 1fr)`,
            gap: isMobileView ? "3px 6px" : "5px 7px"
          }}>
            
            <div style={{ gridColumn: 1, gridRow: 1 }}></div>
            
            {DAYS.map((d, index) => (
              <div key={d} style={{ gridColumn: index + 2, gridRow: 1, fontWeight: "600", fontSize: isMobileView ? "10px" : "12px", color: bgImage ? "#f8fafc" : "#334155", textAlign: "center", textShadow: bgImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none", letterSpacing: "1px" }}>
                {isMobileView ? MOBILE_DAY_LABELS[d] : DAY_LABELS[d]}
              </div>
            ))}

            {PERIOD_KEYS.map((pKey, pIndex) => {
              const info = PERIOD_TIMES[pKey];
              return (
                <div key={`period-${pKey}`} style={{ gridColumn: 1, gridRow: pIndex + 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: bgImage ? "#e2e8f0" : "#94a3b8", textShadow: bgImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none", minHeight: isMobileView ? "30px" : "40px" }}>
                  <span style={{ fontSize: isMobileView ? "10px" : "11px", fontWeight: "600", lineHeight: 1 }}>
                    {info.label}
                  </span>
                  <span style={{ fontSize: isMobileView ? "6.5px" : "7.5px", opacity: 0.9, marginTop: "1px", letterSpacing: "-0.5px", textAlign: "center", lineHeight: 1 }}>
                    {info.time.replace("-", "\n")}
                  </span>
                </div>
              );
            })}

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
                    gridRow: `${mc.startPeriodKeyIndex + 2} / span ${mc.span}`, 
                    background: customBg,
                    backdropFilter: "blur(12px)", 
                    WebkitBackdropFilter: "blur(12px)", 
                    borderRadius: "8px",
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
                  <span style={{ fontSize: isMobileView ? "9.5px" : "11px", fontWeight: "700", color: textColor, lineHeight: "1.2", marginBottom: "1px", textAlign: "center", padding: "0 2px" }}>
                    {mc.name}
                  </span>
                  <span style={{ fontSize: isMobileView ? "7.5px" : "9.5px", color: textColor, opacity: 0.85, fontWeight: "600", marginTop: "1px", textAlign: "center" }}>
                    {mc.classroom}
                  </span>
                  
                  {isManageMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(mc.ids); }} 
                      style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", backgroundColor: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontSize: "11px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", zIndex: 10 }}
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

      {/* 🌟 右側：精緻現代控制面板 */}
      <div style={{ width: "420px", backgroundColor: "#ffffff", padding: "18px 22px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0, boxSizing: "border-box" }}>
        
        {/* 標題列 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
          <span style={{ color: "#475569" }}>{Icons.settings}</span>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b", letterSpacing: "0.2px" }}>
            課表與外觀設定
          </h3>
        </div>

        {/* 模式切換 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button 
            onClick={() => setIsMobileView(false)} 
            style={{ padding: "8px 10px", backgroundColor: !isMobileView ? "#2563eb" : "#f8fafc", color: !isMobileView ? "#fff" : "#64748b", border: "1px solid", borderColor: !isMobileView ? "#2563eb" : "#e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s" }}
          >
            {Icons.monitor} 3:4 網頁
          </button>
          <button 
            onClick={() => setIsMobileView(true)} 
            style={{ padding: "8px 10px", backgroundColor: isMobileView ? "#1e293b" : "#f8fafc", color: isMobileView ? "#fff" : "#64748b", border: "1px solid", borderColor: isMobileView ? "#1e293b" : "#e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s" }}
          >
            {Icons.smartphone} 9:16 手機
          </button>
        </div>

        {/* 智慧匯入按鈕 */}
        <button 
          onClick={() => setIsImportModalOpen(true)} 
          style={{ 
            width: "100%",
            padding: "8px 10px", 
            backgroundColor: "#f0fdf4", 
            color: "#16a34a", 
            border: "1px solid #bbf7d0", 
            borderRadius: "8px", 
            fontWeight: "600", 
            cursor: "pointer", 
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.15s"
          }}
        >
          {Icons.import} 智慧匯入選課清單
        </button>

        <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

        {/* 手動排課表單 */}
        <form onSubmit={handleSaveCourse} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", gap: "5px" }}>
              {Icons.plus} {editTargetIds ? "編輯選定課程" : "排定課程"}
            </span>
            {editTargetIds && (
              <button type="button" onClick={() => { setEditTargetIds(null); setName(""); setClassroom(""); }} style={{ fontSize: "11px", color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: "600" }}>
                取消編輯
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "6px" }}>
            <input type="text" placeholder="課程名稱" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px" }} />
            <input type="text" placeholder="教室 (如 BS440)" value={classroom} onChange={(e) => setClassroom(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px" }} />
          </div>
          
          {!editTargetIds && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <select value={day} onChange={(e) => setDay(e.target.value as Course["day"])} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px" }}>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
              <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px" }}>
                {PERIOD_KEYS.map((pKey) => (
                  <option key={pKey} value={pKey}>
                    {pKey === 9 ? "中午" : `第 ${pKey} 節`}
                  </option>
                ))}
              </select>
              <button type="submit" style={{ padding: "6px 10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
                新增
              </button>
            </div>
          )}

          {editTargetIds && (
            <button type="submit" style={{ padding: "6px 10px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {Icons.check} 儲存修改
            </button>
          )}
        </form>

        {/* 編輯 / 刪除與清空控制 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <button onClick={() => setIsManageMode(!isManageMode)} style={{ padding: "6px 10px", backgroundColor: isManageMode ? "#fee2e2" : "#f8fafc", color: isManageMode ? "#ef4444" : "#475569", border: "1px solid", borderColor: isManageMode ? "#fca5a5" : "#e2e8f0", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            {Icons.edit} {isManageMode ? "結束管理" : "管理課程"}
          </button>
          <button onClick={handleClearAll} style={{ padding: "6px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            {Icons.trash} 清空課表
          </button>
        </div>

        <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

        {/* 外觀風格設定 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
            {Icons.palette} 外觀風格
          </span>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>卡片色彩</span>
              <input type="color" value={cardColor} onChange={(e) => updateSettings("hub_card_color", e.target.value)} style={{ border: "none", width: "20px", height: "20px", cursor: "pointer", borderRadius: "4px" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>文字色彩</span>
              <input type="color" value={textColor} onChange={(e) => updateSettings("hub_text_color", e.target.value)} style={{ border: "none", width: "20px", height: "20px", cursor: "pointer", borderRadius: "4px" }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>透明度 {cardOpacity}</span>
            <input type="range" min="0.1" max="1" step="0.05" value={cardOpacity} onChange={(e) => updateSettings("hub_card_opacity", e.target.value)} style={{ flex: 1, cursor: "pointer" }} />
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
          {bgImage ? (
            <button onClick={handleRemoveImage} style={{ padding: "5px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px" }}>
              移除背景圖
            </button>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "6px 10px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              {Icons.image} 上傳背景桌布
            </button>
          )}

          {/* 背景桌布位置與縮放控制 */}
          {bgImage && (
            <div style={{ backgroundColor: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
                  {Icons.move} 桌布位置微調
                </span>
                <button onClick={handleResetBgPos} style={{ border: "none", background: "none", fontSize: "10px", color: "#2563eb", cursor: "pointer", fontWeight: "600" }}>
                  重置置中
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>水平 (X)</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={bgPosX} 
                  onChange={(e) => updateBgPos(Number(e.target.value), bgPosY, bgZoom)} 
                  style={{ flex: 1, cursor: "pointer" }} 
                />
                <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgPosX}%</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>垂直 (Y)</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={bgPosY} 
                  onChange={(e) => updateBgPos(bgPosX, Number(e.target.value), bgZoom)} 
                  style={{ flex: 1, cursor: "pointer" }} 
                />
                <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgPosY}%</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>縮放比</span>
                <input 
                  type="range" 
                  min="100" 
                  max="200" 
                  step="5"
                  value={bgZoom} 
                  onChange={(e) => updateBgPos(bgPosX, bgPosY, Number(e.target.value))} 
                  style={{ flex: 1, cursor: "pointer" }} 
                />
                <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgZoom}%</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

        {/* 匯出桌布圖片按鈕 */}
        <button 
          onClick={handleExportImage} 
          style={{ 
            padding: "9px", 
            backgroundColor: "#ea580c", 
            color: "#ffffff", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "700", 
            cursor: "pointer", 
            fontSize: "13px", 
            boxShadow: "0 2px 6px rgba(234,88,12,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.15s"
          }}
        >
          {Icons.download} 匯出桌布圖片
        </button>

      </div>
    </div>
  );
}