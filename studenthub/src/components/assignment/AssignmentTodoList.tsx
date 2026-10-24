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
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "20px 22px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* 頂部標題與新增按鈕 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "800",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>📅</span>
          <span>待辦事項</span>
        </h3>

        <button
          onClick={onOpenAddModal}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>＋</span> 新增待辦
        </button>
      </div>

      {/* 篩選標籤頁籤：只留下「待繳交」與「所選日期」 */}
      <div style={{ display: "flex", gap: "6px", backgroundColor: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
        <button
          onClick={() => onSetFilterMode("pending")}
          style={{
            flex: 1,
            padding: "6px 0",
            borderRadius: "6px",
            border: "none",
            backgroundColor: filterMode === "pending" ? "#ffffff" : "transparent",
            color: filterMode === "pending" ? "#0f172a" : "#64748b",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            boxShadow: filterMode === "pending" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
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
            backgroundColor: filterMode === "selected" ? "#ffffff" : "transparent",
            color: filterMode === "selected" ? "#0f172a" : "#64748b",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            boxShadow: filterMode === "selected" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.15s",
          }}
        >
          所選日期 ({selectedDayCount})
        </button>
      </div>

      {/* 待辦卡片列表 (縮小比例、更精巧、可編輯、所選日期可看已完成並劃掉復原) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "490px", overflowY: "auto", paddingRight: "2px" }}>
        {displayedAssignments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8", fontSize: "13px", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
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
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  padding: "10px 14px 10px 16px",
                  cursor: "pointer",
                  border: selectedDate === datePart ? "1.5px solid #2563eb" : "1px solid #f1f5f9",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "transform 0.15s, box-shadow 0.15s",
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
                    backgroundColor: item.completed ? "#94a3b8" : colorObj.bar,
                    borderRadius: "8px 0 0 8px",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                  {/* 第一行：標題 + 分類標籤 [作業] + 番茄專注徽章 + 遊戲難度徽章 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: item.completed ? "#94a3b8" : "#1e293b",
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
                        color: item.completed ? "#94a3b8" : "#64748b",
                        border: "1px solid #cbd5e1",
                        padding: "0px 5px",
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
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                          padding: "1px 5px",
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
                      <span style={{ fontSize: "10px", backgroundColor: item.completed ? "#f1f5f9" : "#fee2e2", color: item.completed ? "#94a3b8" : "#b91c1c", padding: "1px 5px", borderRadius: "4px", fontWeight: "800" }}>
                        🐲 BOSS (+60 EXP)
                      </span>
                    )}
                    {item.difficulty === "elite" && (
                      <span style={{ fontSize: "10px", backgroundColor: item.completed ? "#f1f5f9" : "#ede9fe", color: item.completed ? "#94a3b8" : "#6d28d9", padding: "1px 5px", borderRadius: "4px", fontWeight: "800" }}>
                        🛡️ 菁英 (+35 EXP)
                      </span>
                    )}
                    {item.difficulty === "normal" && (
                      <span style={{ fontSize: "10px", color: item.completed ? "#94a3b8" : "#d97706", fontWeight: "700" }}>
                        +{item.expReward || 20} EXP
                      </span>
                    )}
                  </div>

                  {/* 第二行：待繳交 / 已完成 截止日期 */}
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                    <span
                      style={{
                        color: item.completed ? "#059669" : "#64748b",
                        fontWeight: item.completed ? "700" : "500",
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
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }} onClick={(e) => e.stopPropagation()}>
                  {/* 🍅 專注討伐按鈕 (未完成時可點擊進入番茄鐘) */}
                  {!item.completed && (
                    <button
                      onClick={() => onStartFocus(item)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #fca5a5",
                        backgroundColor: "#fff1f2",
                        color: "#e11d48",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
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
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "1.5px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#1e293b",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                      title="復原為待繳交事項"
                    >
                      <span style={{ color: "#2563eb", fontWeight: "900" }}>↺</span> 復原
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleTask(item.id)}
                      style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#10b981",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(16, 185, 129, 0.3)",
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
                      color: "#64748b",
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
                      color: "#cbd5e1",
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
