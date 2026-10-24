import React, { useState } from "react";
import type { AssignmentItem } from "./assignmentTypes";
import { getColorTheme, extractDateOnly, getWeekDays } from "./assignmentTypes";

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
  // 檢視模式：月視圖 (month) vs 週視圖 (week)
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // 週視圖基準日期 (預設跟隨 selectedDate 或 todayStr)
  const [weekBaseDate, setWeekBaseDate] = useState<string>(selectedDate || todayStr);

  // 切換週視圖的上週 / 下週
  const handlePrevWeek = () => {
    const [y, m, d] = (weekBaseDate || todayStr).split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - 7);
    const nextStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    setWeekBaseDate(nextStr);
    onSelectDate(nextStr);
  };

  const handleNextWeek = () => {
    const [y, m, d] = (weekBaseDate || todayStr).split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 7);
    const nextStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    setWeekBaseDate(nextStr);
    onSelectDate(nextStr);
  };

  // 當前週的 7 天資料
  const currentWeekDays = getWeekDays(weekBaseDate || selectedDate || todayStr);

  // 日曆格點計算 (月視圖，週一到週日)
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
      {/* 日曆頂部導航 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          {viewMode === "month" ? (
            <>
              <span style={{ fontSize: "44px", fontWeight: "900", color: "#0f172a", lineHeight: 1, letterSpacing: "-1px" }}>
                {currentMonth + 1}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8" }}>
                {currentYear} 年
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", lineHeight: 1 }}>
                {currentWeekDays[0]?.dateStr.slice(5)} ~ {currentWeekDays[6]?.dateStr.slice(5)}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8" }}>
                週死線檢視
              </span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {/* 月視圖 / 週視圖切換 */}
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: "2px", borderRadius: "14px" }}>
            <button
              onClick={() => setViewMode("month")}
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: viewMode === "month" ? "#ffffff" : "transparent",
                color: viewMode === "month" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: viewMode === "month" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              📅 月
            </button>
            <button
              onClick={() => {
                setViewMode("week");
                setWeekBaseDate(selectedDate || todayStr);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: viewMode === "week" ? "#ffffff" : "transparent",
                color: viewMode === "week" ? "#0f172a" : "#64748b",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: viewMode === "week" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              📆 週
            </button>
          </div>

          <button
            onClick={() => {
              onGoToday();
              setWeekBaseDate(todayStr);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: "16px",
              border: "1.5px solid #0f172a",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              fontSize: "11px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <span>⤺</span> TODAY
          </button>

          <button
            onClick={viewMode === "month" ? onPrevMonth : handlePrevWeek}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={viewMode === "month" ? "上個月" : "上一週"}
          >
            ‹
          </button>
          <button
            onClick={viewMode === "month" ? onNextMonth : handleNextWeek}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "700",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={viewMode === "month" ? "下個月" : "下一週"}
          >
            ›
          </button>

          {viewMode === "month" && (
            <button
              onClick={onToggleWrap}
              style={{
                padding: "5px 9px",
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
              {isWrapText ? "🔤 換行" : "🔤 單行"}
            </button>
          )}
        </div>
      </div>

      {/* ================= 📅 月視圖模式 ================= */}
      {viewMode === "month" && (
        <>
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

          {/* 月曆網格 (每格高度 96px) */}
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
        </>
      )}

      {/* ================= 📆 週視圖模式 (衝刺與考試週專用大空間檢視) ================= */}
      {viewMode === "week" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
            minHeight: "280px",
          }}
        >
          {currentWeekDays.map((dayItem, idx) => {
            const isSelected = selectedDate === dayItem.dateStr;
            const isToday = todayStr === dayItem.dateStr;
            const isWeekend = idx >= 5;

            // 該天的所有待辦事項
            const dayTasks = assignments.filter((t) => extractDateOnly(t.dueDate) === dayItem.dateStr);

            return (
              <div
                key={dayItem.dateStr}
                onClick={() => onSelectDate(dayItem.dateStr)}
                style={{
                  backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                  borderRadius: "14px",
                  padding: "10px 6px",
                  border: isSelected ? "2px solid #0f172a" : isToday ? "2px solid #22c55e" : "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {/* 星期與日期標頭 */}
                <div style={{ textAlign: "center", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px dashed #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: isWeekend ? "#38bdf8" : "#94a3b8" }}>
                    週{dayItem.dayOfWeekName}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "900",
                      color: isSelected ? "#0f172a" : isToday ? "#16a34a" : "#334155",
                      marginTop: "2px",
                    }}
                  >
                    {dayItem.dayNumber}
                  </div>
                </div>

                {/* 當日所有任務卡片垂直展開 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", flex: 1 }}>
                  {dayTasks.length === 0 ? (
                    <div style={{ textAlign: "center", fontSize: "11px", color: "#cbd5e1", marginTop: "24px" }}>
                      無行程
                    </div>
                  ) : (
                    dayTasks.map((t) => {
                      const colorObj = getColorTheme(t.color);
                      return (
                        <div
                          key={t.id}
                          style={{
                            padding: "6px 5px",
                            borderRadius: "6px",
                            backgroundColor: colorObj.tagBg,
                            color: colorObj.tagText,
                            borderLeft: `3px solid ${colorObj.bar}`,
                            fontSize: "11px",
                            fontWeight: "700",
                            lineHeight: 1.25,
                            wordBreak: "break-all",
                            opacity: t.completed ? 0.5 : 1,
                            textDecoration: t.completed ? "line-through" : "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                          title={t.title + (t.completed ? " (已完成)" : "")}
                        >
                          <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>
                            {t.dueDate?.includes(" ") ? t.dueDate.split(" ")[1] : "截止"}
                          </div>
                          <div>{t.title}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
