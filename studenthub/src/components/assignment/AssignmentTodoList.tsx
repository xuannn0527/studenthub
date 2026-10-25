import React from "react";
import type { AssignmentItem } from "./assignmentTypes";
import { getColorTheme, extractDateOnly } from "./assignmentTypes";

interface AssignmentTodoListProps {
  pendingCount: number;
  selectedDayCount: number;
  displayedAssignments: AssignmentItem[];
  filterMode: "pending" | "selected";
  selectedDate: string;
  onSetFilterMode: (mode: "pending" | "selected") => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (item: AssignmentItem, e: React.MouseEvent) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onCardClick: (item: AssignmentItem) => void;
  onStartFocus: (item: AssignmentItem) => void; // 🍅 專注討伐
}

export const AssignmentTodoList: React.FC<AssignmentTodoListProps> = ({
  pendingCount,
  selectedDayCount,
  displayedAssignments,
  filterMode,
  selectedDate,
  onSetFilterMode,
  onOpenAddModal,
  onOpenEditModal,
  onToggleTask,
  onDeleteTask,
  onCardClick,
  onStartFocus,
}) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        padding: "20px 22px",
        border: "1.5px solid rgba(56, 189, 248, 0.25)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        color: "#ffffff",
      }}
    >
      {/* 頂部標題與新增按鈕 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "800",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textShadow: "0 0 12px rgba(56, 189, 248, 0.35)",
          }}
        >
          <span>📅</span>
          <span>待辦事項</span>
        </h3>

        <button
          onClick={onOpenAddModal}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #0284c7, #2563eb)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 0 12px rgba(2, 132, 199, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>＋</span> 新增待辦
        </button>
      </div>

      {/* 篩選標籤頁籤：只留下「待繳交」與「所選日期」 */}
      <div style={{ display: "flex", gap: "6px", backgroundColor: "rgba(255, 255, 255, 0.08)", padding: "3px", borderRadius: "8px" }}>
        <button
          onClick={() => onSetFilterMode("pending")}
          style={{
            flex: 1,
            padding: "6px 0",
            borderRadius: "6px",
            border: "none",
            background: filterMode === "pending" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
            color: filterMode === "pending" ? "#ffffff" : "#94a3b8",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            boxShadow: filterMode === "pending" ? "0 2px 8px rgba(2, 132, 199, 0.4)" : "none",
            transition: "all 0.15s",
          }}
        >
          待繳交 ({pendingCount})
        </button>
        <button
          onClick={() => onSetFilterMode("selected")}
          style={{
            flex: 1,
            padding: "6px 0",
            borderRadius: "6px",
            border: "none",
            background: filterMode === "selected" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
            color: filterMode === "selected" ? "#ffffff" : "#94a3b8",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            boxShadow: filterMode === "selected" ? "0 2px 8px rgba(2, 132, 199, 0.4)" : "none",
            transition: "all 0.15s",
          }}
        >
          所選日期 ({selectedDayCount})
        </button>
      </div>

      {/* 待辦卡片列表 (縮小比例、更精巧、可編輯、所選日期可看已完成並劃掉復原) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "490px", overflowY: "auto", paddingRight: "2px" }}>
        {displayedAssignments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontSize: "13px", backgroundColor: "rgba(30, 41, 59, 0.4)", borderRadius: "10px" }}>
            {filterMode === "selected"
              ? `【${selectedDate}】尚無行程或作業項目 🎉`
              : "所有待辦事項皆已討伐完成！太棒了 🎉"}
          </div>
        ) : (
          displayedAssignments.map((item) => {
            const colorObj = getColorTheme(item.color);
            const datePart = extractDateOnly(item.dueDate);

            return (
              <div
                key={item.id}
                onClick={() => onCardClick(item)}
                style={{
                  position: "relative",
                  backgroundColor: selectedDate === datePart ? "rgba(30, 58, 138, 0.35)" : "rgba(30, 41, 59, 0.6)",
                  borderRadius: "10px",
                  padding: "10px 14px 10px 16px",
                  cursor: "pointer",
                  border: selectedDate === datePart ? "1.5px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: selectedDate === datePart ? "0 0 14px rgba(56, 189, 248, 0.25)" : "0 2px 6px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                  opacity: item.completed ? 0.55 : 1,
                }}
              >
                {/* 左側精緻彩色邊條 */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: item.completed ? "#64748b" : colorObj.bar,
                    boxShadow: item.completed ? "none" : `0 0 8px ${colorObj.bar}`,
                    borderRadius: "10px 0 0 10px",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                  {/* 第一行：標題 + 分類標籤 [作業] + 番茄專注徽章 + 遊戲難度徽章 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: item.completed ? "#94a3b8" : "#f8fafc",
                        textDecoration: item.completed ? "line-through" : "none",
                        textDecorationColor: item.completed ? "#64748b" : "transparent",
                        textDecorationThickness: "2px",
                      }}
                    >
                      {item.title}
                    </span>

                    {/* 灰邊框分類標籤 [作業 / 科目] */}
                    <span
                      style={{
                        fontSize: "11px",
                        color: item.completed ? "#64748b" : "#93c5fd",
                        border: "1px solid rgba(56, 189, 248, 0.35)",
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                        padding: "0px 6px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        textDecoration: item.completed ? "line-through" : "none",
                      }}
                    >
                      {item.category || "作業"}
                    </span>

                    {/* 🍅 累計專注番茄鐘次數徽章 */}
                    {(item.pomodoroCount || 0) > 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          backgroundColor: "rgba(239, 68, 68, 0.25)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontWeight: "800",
                        }}
                        title={`已專注討伐 ${item.pomodoroCount} 次 (${item.totalFocusMinutes || (item.pomodoroCount || 0) * 25} 分鐘)`}
                      >
                        🍅 {item.pomodoroCount}
                      </span>
                    )}

                    {/* 遊戲難度獎勵徽章 */}
                    {item.difficulty === "boss" && (
                      <span style={{ fontSize: "10px", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.5)", padding: "1px 6px", borderRadius: "4px", fontWeight: "800" }}>
                        🐲 BOSS (+60 EXP)
                      </span>
                    )}
                    {item.difficulty === "elite" && (
                      <span style={{ fontSize: "10px", backgroundColor: "rgba(168, 85, 247, 0.2)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.5)", padding: "1px 6px", borderRadius: "4px", fontWeight: "800" }}>
                        🛡️ 菁英 (+35 EXP)
                      </span>
                    )}
                    {item.difficulty === "normal" && (
                      <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "700" }}>
                        +{item.expReward || 20} EXP
                      </span>
                    )}
                  </div>

                  {/* 第二行：待繳交 / 已完成 截止日期 */}
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>
                    <span
                      style={{
                        color: item.completed ? "#34d399" : "#60a5fa",
                        fontWeight: item.completed ? "700" : "600",
                        textDecoration: item.completed ? "line-through" : "none",
                      }}
                    >
                      {item.completed ? "✓ 已完成" : "待繳交"}
                    </span>
                    <span style={{ textDecoration: item.completed ? "line-through" : "none" }}>
                      {" "}截止日期:{item.dueDate || "無期限"}
                    </span>
                  </div>
                </div>

                {/* 右側操作：專注討伐 / 完成討伐 / ↺ 復原按鈕、✏️ 編輯、✕ 刪除 */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                  {/* 🍅 專注討伐按鈕 (未完成時可點擊進入番茄鐘) */}
                  {!item.completed && (
                    <button
                      onClick={() => onStartFocus(item)}
                      style={{
                        padding: "5px 9px",
                        borderRadius: "6px",
                        border: "1px solid rgba(244, 63, 94, 0.5)",
                        backgroundColor: "rgba(244, 63, 94, 0.15)",
                        color: "#fb7185",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        boxShadow: "0 0 8px rgba(244, 63, 94, 0.25)",
                      }}
                      title="一鍵帶入全螢幕番茄鐘沉浸專注"
                    >
                      <span>🍅</span> 專注
                    </button>
                  )}

                  {item.completed ? (
                    <button
                      onClick={() => onToggleTask(item.id)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        color: "#f8fafc",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                      title="復原為待繳交事項"
                    >
                      <span style={{ color: "#38bdf8", fontWeight: "900" }}>↺</span> 復原
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleTask(item.id)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: "6px",
                        border: "none",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
                        whiteSpace: "nowrap",
                      }}
                      title="標記完成並獲得獎勵"
                    >
                      ⚔️ 討伐
                    </button>
                  )}

                  {/* ✏️ 編輯按鈕 */}
                  <button
                    onClick={(e) => onOpenEditModal(item, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: "13px",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="編輯事項"
                  >
                    ✏️
                  </button>

                  {/* ✕ 刪除按鈕 */}
                  <button
                    onClick={(e) => onDeleteTask(item.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      fontSize: "14px",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
