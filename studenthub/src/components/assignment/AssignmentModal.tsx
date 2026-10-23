import React from "react";
import { ACCENT_COLORS, getColorTheme } from "./assignmentTypes";

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
  if (!modalMode) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
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
          borderRadius: "18px",
          padding: "24px",
          width: "420px",
          maxWidth: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          color: "#1e293b",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>
            {modalMode === "edit" ? "✏️ 編輯待辦事項 / 作業" : "📝 新增待辦事項 / 作業"}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "18px", color: "#94a3b8", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
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
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                分類標籤
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => onSetFormCategory(e.target.value)}
                placeholder="例：作業、考試"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                關卡難度
              </label>
              <select
                value={formDifficulty}
                onChange={(e) => onSetFormDifficulty(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: "700",
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              >
                <option value="normal">普通 (+20 EXP)</option>
                <option value="elite">🛡️ 菁英 (+35 EXP)</option>
                <option value="boss">🐲 BOSS (+60 EXP)</option>
              </select>
            </div>
          </div>

          {/* 日期與時間原生選擇器 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
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
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
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
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* 邊條色彩選擇：14 款精選色票 + 自由自訂色彩 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569" }}>
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
                      border: isSelected ? "2.5px solid #0f172a" : "1.5px solid rgba(0,0,0,0.1)",
                      boxShadow: isSelected ? "0 0 0 2px rgba(37,99,235,0.3)" : "none",
                      cursor: "pointer",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.15s",
                    }}
                  />
                );
              })}

              {/* 🎨 原生自訂色彩按鈕與安全 input (防止事件冒泡與格式不符) */}
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
                      border: isCustomHex ? "2.5px solid #0f172a" : "1.5px solid rgba(0,0,0,0.15)",
                      boxShadow: isCustomHex ? "0 0 0 2px rgba(37,99,235,0.3)" : "none",
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#f1f5f9",
                color: "#475569",
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
                padding: "7px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
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
