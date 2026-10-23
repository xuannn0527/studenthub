import React from "react";
import type { AssignmentItem } from "./assignmentTypes";
import { getColorTheme, extractDateOnly } from "./assignmentTypes";

interface AssignmentCalendarProps {
  currentYear: number;
  currentMonth: number;
  selectedDate: string;
  todayStr: string;
  assignments: AssignmentItem[];
  isWrapText: boolean;
  onSelectDate: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToday: () => void;
  onToggleWrap: () => void;
}

export const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  todayStr,
  assignments,
  isWrapText,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToday,
  onToggleWrap,
}) => {
  // 日曆格點計算 (週一到週日)
  const calendarDays = (() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // 上個月填補
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevM + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr: `${prevY}-${mStr}-${dStr}`,
        isCurrentMonth: false,
      });
    }

    // 當月
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(currentMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr: `${currentYear}-${mStr}-${dStr}`,
        isCurrentMonth: true,
      });
    }

    // 下個月填補至 35 格
    const remaining = 35 - days.length;
    for (let d = 1; d <= Math.max(0, remaining); d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextM + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      days.push({
        dayNumber: d,
        dateStr: `${nextY}-${mStr}-${dStr}`,
        isCurrentMonth: false,
      });
    }

    return days;
  })();

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "24px 20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* 日曆頂部導航 (大數字月份，如截圖所示) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "44px", fontWeight: "900", color: "#0f172a", lineHeight: 1, letterSpacing: "-1px" }}>
            {currentMonth + 1}
          </span>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8" }}>
            {currentYear} 年
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onGoToday}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1.5px solid #0f172a",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span>⤺</span> TODAY
          </button>

          <button
            onClick={onPrevMonth}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="上個月"
          >
            ‹
          </button>
          <button
            onClick={onNextMonth}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="下個月"
          >
            ›
          </button>

          <button
            onClick={onToggleWrap}
            style={{
              padding: "5px 10px",
              borderRadius: "14px",
              border: isWrapText ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
              backgroundColor: isWrapText ? "#eff6ff" : "#ffffff",
              color: isWrapText ? "#2563eb" : "#475569",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
            }}
            title="點擊切換：單行截斷 (省略號) 或 自動換行顯示全部"
          >
            {isWrapText ? "🔤 換行顯示" : "🔤 單行截斷"}
          </button>
        </div>
      </div>

      {/* 星期標頭 (六、日淡藍色) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          marginBottom: "12px",
          fontSize: "13px",
          fontWeight: "700",
        }}
      >
        <div style={{ color: "#94a3b8" }}>一</div>
        <div style={{ color: "#94a3b8" }}>二</div>
        <div style={{ color: "#94a3b8" }}>三</div>
        <div style={{ color: "#94a3b8" }}>四</div>
        <div style={{ color: "#94a3b8" }}>五</div>
        <div style={{ color: "#38bdf8" }}>六</div>
        <div style={{ color: "#38bdf8" }}>日</div>
      </div>

      {/* 日曆網格 (每格高度 96px，寬敞舒展) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
        }}
      >
        {calendarDays.map((item, idx) => {
          const isSelected = selectedDate === item.dateStr;
          const isToday = todayStr === item.dateStr;
          const isWeekend = idx % 7 === 5 || idx % 7 === 6;

          // 日曆上顯示所有項目（包含已完成的，完成的劃掉保留）
          const dayTasks = assignments.filter((t) => extractDateOnly(t.dueDate) === item.dateStr);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                height: "96px",
                maxHeight: "96px",
                borderRadius: "12px",
                padding: "6px 4px 8px 4px",
                cursor: "pointer",
                backgroundColor: isSelected ? "#27272a" : isToday ? "#f0fdf4" : "transparent",
                color: isSelected
                  ? "#ffffff"
                  : !item.isCurrentMonth
                  ? "#cbd5e1"
                  : isWeekend
                  ? "#38bdf8"
                  : "#1e293b",
                border: isToday && !isSelected ? "2px solid #22c55e" : "1px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: isSelected || isToday ? "800" : "600", marginBottom: "4px", flexShrink: 0 }}>
                {item.dayNumber}
              </span>

              {/* 標籤小條：最多只顯示最上面兩個 */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  flexShrink: 0,
                }}
              >
                {dayTasks.slice(0, 2).map((t) => {
                  const colorObj = getColorTheme(t.color);
                  return (
                    <div
                      key={t.id}
                      style={{
                        fontSize: "10.5px",
                        letterSpacing: "-0.2px",
                        fontWeight: "700",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.22)" : colorObj.tagBg,
                        color: isSelected ? "#ffffff" : colorObj.tagText,
                        borderLeft: `3px solid ${colorObj.bar}`,
                        whiteSpace: isWrapText ? "normal" : "nowrap",
                        wordBreak: isWrapText ? "break-all" : "normal",
                        lineHeight: isWrapText ? "1.2" : "1.25",
                        overflow: "hidden",
                        textOverflow: isWrapText ? "clip" : "ellipsis",
                        display: isWrapText ? "-webkit-box" : "block",
                        WebkitLineClamp: isWrapText ? 2 : 1,
                        WebkitBoxOrient: "vertical",
                        opacity: t.completed ? 0.45 : 1,
                        textDecoration: t.completed ? "line-through" : "none",
                      }}
                      title={t.title + (t.completed ? " (已完成)" : "")}
                    >
                      {t.title}
                    </div>
                  );
                })}
              </div>

              {/* 超過兩個項目時，在底部置中顯示 +1 / +N */}
              {dayTasks.length > 2 && (
                <div
                  style={{
                    marginTop: "auto",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: isSelected ? "#ffffff" : "#64748b",
                    textAlign: "center",
                    lineHeight: 1,
                    paddingTop: "2px",
                    flexShrink: 0,
                  }}
                >
                  +{dayTasks.length - 2}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 行事曆底線提示 */}
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748b" }}>
        <span>💡 已完成的事項會劃掉保留在日曆上</span>
        {selectedDate && (
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            選取：{selectedDate}
          </span>
        )}
      </div>
    </div>
  );
};
