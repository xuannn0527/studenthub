import React, { useMemo } from "react";
import { ACCENT_COLORS, getColorTheme, getTimetableCourseNames } from "./assignmentTypes";

interface AssignmentModalProps {
  modalMode: "add" | "edit" | null;
  formTitle: string;
  formDate: string;
  formTime: string;
  formCategory: string;
  formDifficulty: "normal" | "elite" | "boss";
  formColor: string;
  onSetFormTitle: (v: string) => void;
  onSetFormDate: (v: string) => void;
  onSetFormTime: (v: string) => void;
  onSetFormCategory: (v: string) => void;
  onSetFormDifficulty: (v: "normal" | "elite" | "boss") => void;
  onSetFormColor: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  modalMode,
  formTitle,
  formDate,
  formTime,
  formCategory,
  formDifficulty,
  formColor,
  onSetFormTitle,
  onSetFormDate,
  onSetFormTime,
  onSetFormCategory,
  onSetFormDifficulty,
  onSetFormColor,
  onClose,
  onSubmit,
}) => {
  // 自動從課表中載入現有課程名稱
  const timetableCourses = useMemo(() => getTimetableCourseNames(), [modalMode]);

  if (!modalMode) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(10, 15, 30, 0.75)",
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
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          borderRadius: "22px",
          padding: "26px",
          width: "440px",
          maxWidth: "100%",
          border: "1.5px solid rgba(56, 189, 248, 0.3)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            {modalMode === "edit" ? "✏️ 編輯待辦事項 / 作業" : "📝 新增待辦事項 / 作業"}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "5px" }}>
              事項名稱
            </label>
            <input
              type="text"
              placeholder="例：作業 2 或 微積分習題"
              value={formTitle}
              onChange={(e) => onSetFormTitle(e.target.value)}
              required
              autoFocus
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backgroundColor: "rgba(30, 41, 59, 0.75)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
                  分類標籤
                </label>
                {timetableCourses.length > 0 && (
                  <span style={{ fontSize: "10px", color: "#38bdf8", fontWeight: "600" }}>
                    可選課表科目 ▾
                  </span>
                )}
              </div>
              <input
                type="text"
                list="course-category-options"
                value={formCategory}
                onChange={(e) => onSetFormCategory(e.target.value)}
                placeholder="例：作業、考試"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backgroundColor: "rgba(30, 41, 59, 0.75)",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
              <datalist id="course-category-options">
                <option value="作業" />
                <option value="考試" />
                <option value="報告" />
                {timetableCourses.map((cName) => (
                  <option key={cName} value={cName} />
                ))}
              </datalist>

              {/* 課表科目快速填入快捷 Pill */}
              {timetableCourses.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "5px" }}>
                  {timetableCourses.slice(0, 4).map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => onSetFormCategory(cName)}
                      style={{
                        padding: "2px 6px",
                        fontSize: "10px",
                        fontWeight: "600",
                        borderRadius: "4px",
                        border: formCategory === cName ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.12)",
                        backgroundColor: formCategory === cName ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.06)",
                        color: formCategory === cName ? "#38bdf8" : "#cbd5e1",
                        cursor: "pointer",
                      }}
                    >
                      {cName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "5px" }}>
                關卡難度
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => onSetFormDifficulty(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  fontSize: "12px",
                  fontWeight: "700",
                  backgroundColor: "#1e293b",
                  color: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                <option value="normal" style={{ backgroundColor: "#1e293b", color: "#fff" }}>普通 (+20 EXP)</option>
                <option value="elite" style={{ backgroundColor: "#1e293b", color: "#c084fc" }}>🛡️ 菁英 (+35 EXP)</option>
                <option value="boss" style={{ backgroundColor: "#1e293b", color: "#f87171" }}>🐲 BOSS (+60 EXP)</option>
              </select>
            </div>
          </div>

          {/* 日期與時間原生選擇器 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "5px" }}>
                截止日期
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => onSetFormDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backgroundColor: "rgba(30, 41, 59, 0.75)",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "5px" }}>
                截止時間
              </label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => onSetFormTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  backgroundColor: "rgba(30, 41, 59, 0.75)",
                  color: "#ffffff",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* 邊條色彩選擇：14 款精選色票 + 自由自訂色彩 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>
                標記色彩 (可選預設或自訂色彩)
              </label>
              <span style={{ fontSize: "11px", fontWeight: "700", color: getColorTheme(formColor).bar }}>
                {getColorTheme(formColor).name || "自訂色彩"}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              {ACCENT_COLORS.map((c) => {
                const isSelected =
                  typeof formColor === "string" &&
                  (formColor === c.id || formColor.toLowerCase() === c.bar.toLowerCase());
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetFormColor(c.id);
                    }}
                    title={c.name}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: c.bar,
                      border: isSelected ? "2.5px solid #ffffff" : "1.5px solid rgba(255,255,255,0.2)",
                      boxShadow: isSelected ? `0 0 10px ${c.bar}` : "none",
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s",
                    }}
                  />
                );
              })}

              {/* 🎨 原生自訂色彩按鈕 */}
              {(() => {
                const isCustomHex =
                  typeof formColor === "string" &&
                  formColor.startsWith("#") &&
                  !ACCENT_COLORS.some((c) => c.bar.toLowerCase() === formColor.toLowerCase());
                const validPickerColor =
                  typeof formColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(formColor)
                    ? formColor
                    : getColorTheme(formColor).bar;

                return (
                  <label
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                      cursor: "pointer",
                      border: isCustomHex ? "2.5px solid #ffffff" : "1.5px solid rgba(255,255,255,0.2)",
                      boxShadow: isCustomHex ? "0 0 10px rgba(56, 189, 248, 0.5)" : "none",
                    }}
                    title="🎨 點擊自訂任何色彩"
                  >
                    <input
                      type="color"
                      value={validPickerColor}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSetFormColor(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        opacity: 0,
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: "10px", pointerEvents: "none" }}>🎨</span>
                  </label>
                );
              })()}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#cbd5e1",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #0284c7, #2563eb)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(2, 132, 199, 0.4)",
              }}
            >
              {modalMode === "edit" ? "儲存修改" : "確認新增"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
