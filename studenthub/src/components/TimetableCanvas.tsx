import { forwardRef } from "react";

export interface Course {
  id: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number;
  classroom: string;
}

export const DAYS: Array<Course["day"]> = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const DAY_LABELS: Record<Course["day"], string> = { Mon: "週一", Tue: "週二", Wed: "週三", Thu: "週四", Fri: "週五" };
export const MOBILE_DAY_LABELS: Record<Course["day"], string> = { Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU", Fri: "FRI" };

export const PERIOD_TIMES: Record<number, { label: string; time: string; isNoon?: boolean }> = {
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

export const PERIOD_KEYS = [1, 2, 3, 4, 9, 5, 6, 7, 8];

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "255, 255, 255";
};

interface TimetableCanvasProps {
  isMobileView: boolean;
  bgImage: string | null;
  bgPosX: number;
  bgPosY: number;
  bgZoom: number;
  cardColor: string;
  cardOpacity: number;
  textColor: string;
  scaleFactor: number;
  isManageMode: boolean;
  mergedCourses: Array<{ name: string; classroom: string; day: string; startPeriodKeyIndex: number; span: number; ids: string[] }>;
  onEditClick: (mc: any) => void;
  onDeleteCourse: (ids: string[]) => void;
}

export const TimetableCanvas = forwardRef<HTMLDivElement, TimetableCanvasProps>(
  (
    {
      isMobileView,
      bgImage,
      bgPosX,
      bgPosY,
      bgZoom,
      cardColor,
      cardOpacity,
      textColor,
      scaleFactor,
      isManageMode,
      mergedCourses,
      onEditClick,
      onDeleteCourse
    },
    ref
  ) => {
    // 智慧文字陰影：有背景桌布時給予微柔光，確保無論底色多複雜都不影響閱讀
    const textShadowStyle = bgImage 
      ? (textColor === "#ffffff" ? "0 1px 3px rgba(0,0,0,0.8)" : "0 1px 2px rgba(255,255,255,0.7)") 
      : "none";

    return (
      <div 
        ref={ref}
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
          
          {/* 🌟 頂部星期標籤：連動文字色彩 (textColor) */}
          {DAYS.map((d, index) => (
            <div 
              key={d} 
              style={{ 
                gridColumn: index + 2, 
                gridRow: 1, 
                fontWeight: "700", 
                fontSize: isMobileView ? "11px" : "12px", 
                color: textColor, // 連動調整
                textAlign: "center", 
                textShadow: textShadowStyle,
                letterSpacing: "1px",
                opacity: 0.95
              }}
            >
              {isMobileView ? MOBILE_DAY_LABELS[d] : DAY_LABELS[d]}
            </div>
          ))}

          {/* 🌟 左側節次與時間：連動文字色彩 (textColor) */}
          {PERIOD_KEYS.map((pKey, pIndex) => {
            const info = PERIOD_TIMES[pKey];
            return (
              <div 
                key={`period-${pKey}`} 
                style={{ 
                  gridColumn: 1, 
                  gridRow: pIndex + 2, 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: textColor, // 連動調整
                  textShadow: textShadowStyle,
                  minHeight: isMobileView ? "30px" : "40px",
                  opacity: 0.9
                }}
              >
                <span style={{ fontSize: isMobileView ? "10px" : "11px", fontWeight: "700", lineHeight: 1 }}>
                  {info.label}
                </span>
                <span style={{ fontSize: isMobileView ? "6.5px" : "7.5px", opacity: 0.85, marginTop: "1px", letterSpacing: "-0.5px", textAlign: "center", lineHeight: 1, fontWeight: "600" }}>
                  {info.time.replace("-", "\n")}
                </span>
              </div>
            );
          })}

          {/* 課程卡片 */}
          {mergedCourses.map((mc, idx) => {
            const dayIndex = DAYS.indexOf(mc.day as Course["day"]);
            const customBg = `rgba(${hexToRgb(cardColor)}, ${cardOpacity})`;
            const cardBorder = bgImage ? "none" : `1px solid rgba(${hexToRgb(cardColor)}, 1)`;
            const shadow = bgImage ? "none" : "0 2px 4px rgba(0,0,0,0.05)";

            return (
              <div 
                key={`merged-${idx}`} 
                onClick={() => isManageMode && onEditClick(mc)} 
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
                    onClick={(e) => { e.stopPropagation(); onDeleteCourse(mc.ids); }} 
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
    );
  }
);
TimetableCanvas.displayName = "TimetableCanvas";