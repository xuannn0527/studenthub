import React, { useState, useEffect } from "react";
import type { AssignmentItem } from "./assignment";
import {
  DEFAULT_ASSIGNMENTS,
  ACCENT_COLORS,
  extractDateOnly,
  AssignmentCalendar,
  AssignmentTodoList,
  AssignmentModal,
} from "./assignment";
import PomodoroFullScreen from "./pomodoro/PomodoroFullScreen";
import type { TodoItem } from "./pomodoro/pomodoroTypes";
import CrusadeBattleModal from "./island/CrusadeBattleModal";

export type { AssignmentItem };
export { ACCENT_COLORS, extractDateOnly };

export default function AssignmentTracker() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // 日曆導航狀態
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0 ~ 11
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // 待辦資料
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    const saved = localStorage.getItem("hub_assignments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => {
            let validDate = item.dueDate || item.date || "";
            if (!validDate) {
              const dNum = String(((idx * 4 + 10) % 28) + 1).padStart(2, "0");
              validDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${dNum} 23:59`;
            }
            return {
              id: item.id || Date.now().toString() + idx,
              title: item.title || "待辦事項",
              dueDate: validDate.replace("T", " "),
              completed: Boolean(item.completed),
              category: item.category || "作業",
              difficulty: item.difficulty || "normal",
              color: item.color || ACCENT_COLORS[idx % ACCENT_COLORS.length].id,
              expReward: item.expReward || 20,
              coinReward: item.coinReward || 10,
              pomodoroCount: item.pomodoroCount || 0,
              totalFocusMinutes: item.totalFocusMinutes || 0,
            };
          });
        }
      } catch {}
    }
    return DEFAULT_ASSIGNMENTS;
  });

  // 篩選模式：只留下「待繳交 (pending)」與「所選日期 (selected)」
  const [filterMode, setFilterMode] = useState<"pending" | "selected">("pending");

  // 標籤文字顯示方式：單行截斷 (false) vs 自動換行 (true)
  const [isWrapText, setIsWrapText] = useState<boolean>(() => {
    return localStorage.getItem("hub_calendar_wrap_text") === "true";
  });

  // 當前正在專注討伐的作業項目
  const [activeFocusAssignment, setActiveFocusAssignment] = useState<AssignmentItem | null>(null);

  // ⚔️ 討伐過場動畫對象
  const [activeBattleAssignment, setActiveBattleAssignment] = useState<AssignmentItem | null>(null);

  // 新增 / 編輯對話框狀態
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formTime, setFormTime] = useState<string>("23:59");
  const [formCategory, setFormCategory] = useState("作業");
  const [formDifficulty, setFormDifficulty] = useState<"normal" | "elite" | "boss">("normal");
  const [formColor, setFormColor] = useState("blue");

  // 通關飄字通知
  const [rewardToast, setRewardToast] = useState<{ title: string; exp: number; coins: number; isRestore?: boolean } | null>(null);

  useEffect(() => {
    localStorage.setItem("hub_assignments", JSON.stringify(assignments));
  }, [assignments]);

  // 前往今天
  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
    setFilterMode("selected");
  };

  // 月份導航
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // 打開新增 Modal
  const handleOpenAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setFormTitle("");
    setFormDate(selectedDate || todayStr);
    setFormTime("23:59");
    setFormCategory("作業");
    setFormDifficulty("normal");
    setFormColor("blue");
  };

  // 打開編輯 Modal
  const handleOpenEditModal = (item: AssignmentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditingId(item.id);
    setFormTitle(item.title);

    const datePart = extractDateOnly(item.dueDate) || todayStr;
    const timePart = item.dueDate.includes(" ")
      ? item.dueDate.split(" ")[1]
      : item.dueDate.includes("T")
      ? item.dueDate.split("T")[1].slice(0, 5)
      : "23:59";

    setFormDate(datePart);
    setFormTime(timePart || "23:59");
    setFormCategory(item.category || "作業");
    setFormDifficulty(item.difficulty || "normal");
    setFormColor(item.color || "blue");
  };

  // 新增或編輯送出
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    let exp = 20;
    let coins = 10;
    if (formDifficulty === "elite") {
      exp = 35;
      coins = 20;
    } else if (formDifficulty === "boss") {
      exp = 60;
      coins = 35;
    }

    const targetDate = formDate || selectedDate || todayStr;
    const finalDueDate = `${targetDate} ${formTime || "23:59"}`;

    if (modalMode === "edit" && editingId) {
      setAssignments((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formTitle.trim(),
                dueDate: finalDueDate,
                category: formCategory.trim() || "作業",
                difficulty: formDifficulty,
                color: formColor,
                expReward: exp,
                coinReward: coins,
              }
            : item
        )
      );
    } else {
      const newItem: AssignmentItem = {
        id: Date.now().toString(),
        title: formTitle.trim(),
        dueDate: finalDueDate,
        completed: false,
        category: formCategory.trim() || "作業",
        difficulty: formDifficulty,
        color: formColor,
        expReward: exp,
        coinReward: coins,
        pomodoroCount: 0,
        totalFocusMinutes: 0,
      };

      setAssignments((prev) => [newItem, ...prev]);

      const [y, m] = targetDate.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
      setSelectedDate(targetDate);
    }

    setModalMode(null);
  };

  // 任務討伐完成 / ↺ 復原
  const handleToggleTask = (id: string) => {
    const target = assignments.find((item) => item.id === id);
    if (!target) return;

    if (!target.completed) {
      // 點擊「討伐」：觸發升級版討伐過場動畫與結算視窗
      setActiveBattleAssignment(target);
    } else {
      // 點擊「復原」：直接復原為未完成
      setAssignments((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            setRewardToast({ title: item.title, exp: 0, coins: 0, isRestore: true });
            setTimeout(() => setRewardToast(null), 2200);
            return { ...item, completed: false };
          }
          return item;
        })
      );
    }
  };

  // ⚔️ 討伐動畫完成後結算與資料同步
  const handleBattleComplete = (item: AssignmentItem) => {
    const exp = item.expReward || 20;
    const coins = item.coinReward || 10;

    // 1. 同步標記待辦已完成
    setAssignments((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, completed: true } : a))
    );

    // 2. 更新 localStorage 內的寵物數值
    try {
      const savedPet = localStorage.getItem("hub_focus_pet");
      const basePet = savedPet ? JSON.parse(savedPet) : { level: 1, exp: 0, maxExp: 100, coins: 50, happiness: 100 };
      let newExp = basePet.exp + exp;
      let newLevel = basePet.level;
      let newMaxExp = basePet.maxExp;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel += 1;
        newMaxExp = Math.round(newMaxExp * 1.3);
      }

      const nextPet = {
        ...basePet,
        level: newLevel,
        exp: newExp,
        maxExp: newMaxExp,
        coins: basePet.coins + coins,
        happiness: Math.min(100, basePet.happiness + 15),
      };
      localStorage.setItem("hub_focus_pet", JSON.stringify(nextPet));
    } catch {}

    // 3. 觸發全域廣播事件讓 FocusPet 與工坊即時更新
    window.dispatchEvent(
      new CustomEvent("focus_pet_reward", {
        detail: {
          expBonus: exp,
          coinsBonus: coins,
          message: `【${item.title}】討伐成功！+${exp} EXP / +${coins} 🪙`,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", { detail: { exp, coins } })
    );

    // 4. 關閉戰鬥彈窗並浮字提示
    setActiveBattleAssignment(null);
    setRewardToast({ title: item.title, exp, coins, isRestore: false });
    setTimeout(() => setRewardToast(null), 2800);
  };

  // 刪除任務
  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("確定要刪除這筆作業/待辦事項嗎？")) {
      setAssignments((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 點擊待辦卡片：左側日曆同步跳轉高亮
  const handleCardClick = (item: AssignmentItem) => {
    const dStr = extractDateOnly(item.dueDate);
    if (dStr) {
      const [y, m] = dStr.split("-").map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setCurrentYear(y);
        setCurrentMonth(m - 1);
      }
      setSelectedDate(dStr);
    }
  };

  // 🍅 一鍵帶入番茄鐘專注討伐
  const handleStartFocus = (item: AssignmentItem) => {
    setActiveFocusAssignment(item);
  };

  // 番茄鐘專注完成回調
  const handleFocusComplete = (focusMins: number) => {
    if (!activeFocusAssignment) return;
    const mins = focusMins || 25;

    // 1. 更新作業累計專注次數與分鐘
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === activeFocusAssignment.id
          ? {
              ...a,
              pomodoroCount: (a.pomodoroCount || 0) + 1,
              totalFocusMinutes: (a.totalFocusMinutes || 0) + mins,
            }
          : a
      )
    );

    // 2. 同步寫入番茄鐘歷史紀錄 (供番茄鐘統計圖表呈現)
    try {
      const savedRecords = localStorage.getItem("hub_pomodoro_records");
      const records = savedRecords ? JSON.parse(savedRecords) : [];
      const newRecord = {
        id: "r_" + Date.now(),
        todoId: activeFocusAssignment.id,
        todoTitle: `【${activeFocusAssignment.category || "作業"}】${activeFocusAssignment.title}`,
        durationMinutes: mins,
        timestamp: todayStr,
        timeStr: new Date().toTimeString().slice(0, 5),
      };
      localStorage.setItem("hub_pomodoro_records", JSON.stringify([newRecord, ...records]));
    } catch {}

    // 3. 發送守護獸寵物獎勵
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", {
        detail: {
          exp: Math.min(mins, 60),
          coins: 10 + Math.floor(mins / 5),
        },
      })
    );

    // 4. 飄字反饋
    setRewardToast({
      title: `${activeFocusAssignment.title} (專注 ${mins}m)`,
      exp: Math.min(mins, 60),
      coins: 10 + Math.floor(mins / 5),
      isRestore: false,
    });
    setTimeout(() => setRewardToast(null), 3000);

    setActiveFocusAssignment(null);
  };

  // 清單過濾：只留下「待繳交」或「所選日期」
  const pendingAssignments = assignments.filter((item) => !item.completed);
  const selectedDayAssignments = assignments.filter((item) => {
    return extractDateOnly(item.dueDate) === (selectedDate || "");
  });

  const displayedAssignments = filterMode === "selected" ? selectedDayAssignments : pendingAssignments;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1320px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 🏆 通關獎勵 / ↺ 復原提示 Toast */}
      {rewardToast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: rewardToast.isRestore
              ? "1.5px solid rgba(148, 163, 184, 0.5)"
              : "1.5px solid rgba(251, 191, 36, 0.6)",
          }}
        >
          <span style={{ fontSize: "18px" }}>{rewardToast.isRestore ? "↺" : "🎉"}</span>
          <span style={{ fontWeight: "700", fontSize: "13px" }}>
            {rewardToast.isRestore
              ? `【${rewardToast.title}】已復原為待繳交！`
              : `【${rewardToast.title}】討伐成功！已劃線歸檔`}
          </span>
          {!rewardToast.isRestore && (
            <span style={{ color: "#fbbf24", fontWeight: "800", fontSize: "13px" }}>
              +{rewardToast.exp} EXP · +{rewardToast.coins} 🪙
            </span>
          )}
        </div>
      )}

      {/* 🌟 核心雙欄佈局：左側行事曆 (支援月/週切換) + 右側小巧精緻待辦事項清單 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(600px, 1.4fr) minmax(360px, 1fr)",
          gap: "22px",
          alignItems: "start",
        }}
      >
        {/* 左欄：行事曆月曆 / 週死線視圖 */}
        <AssignmentCalendar
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          todayStr={todayStr}
          assignments={assignments}
          isWrapText={isWrapText}
          onSelectDate={(dateStr) => {
            setSelectedDate(dateStr);
            setFilterMode("selected");
          }}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onGoToday={handleGoToday}
          onToggleWrap={() => {
            const next = !isWrapText;
            setIsWrapText(next);
            localStorage.setItem("hub_calendar_wrap_text", String(next));
          }}
        />

        {/* 右欄：待辦事項清單 (支援一鍵專注討伐) */}
        <AssignmentTodoList
          pendingCount={pendingAssignments.length}
          selectedDayCount={selectedDayAssignments.length}
          displayedAssignments={displayedAssignments}
          filterMode={filterMode}
          selectedDate={selectedDate}
          onSetFilterMode={setFilterMode}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onCardClick={handleCardClick}
          onStartFocus={handleStartFocus}
        />
      </div>

      {/* 新增 / 編輯待辦事項 Modal (課表科目自動綁定) */}
      <AssignmentModal
        modalMode={modalMode}
        formTitle={formTitle}
        formDate={formDate}
        formTime={formTime}
        formCategory={formCategory}
        formDifficulty={formDifficulty}
        formColor={formColor}
        onSetFormTitle={setFormTitle}
        onSetFormDate={setFormDate}
        onSetFormTime={setFormTime}
        onSetFormCategory={setFormCategory}
        onSetFormDifficulty={setFormDifficulty}
        onSetFormColor={setFormColor}
        onClose={() => setModalMode(null)}
        onSubmit={handleFormSubmit}
      />

      {/* 🍅 全螢幕番茄鐘沉浸專注視圖 (作業討伐專用模式) */}
      {activeFocusAssignment && (
        <PomodoroFullScreen
          todo={{
            id: `assignment-${activeFocusAssignment.id}`,
            title: `【${activeFocusAssignment.category || "作業"}】${activeFocusAssignment.title}`,
            type: "timer",
            timingType: "countdown",
            durationMinutes: 25,
          } as TodoItem}
          onExit={() => setActiveFocusAssignment(null)}
          onRecordCompleted={handleFocusComplete}
        />
      )}

      {/* ⚔️ 升級版「討伐」過場動畫與結算視窗 */}
      <CrusadeBattleModal
        assignment={activeBattleAssignment}
        onClose={() => setActiveBattleAssignment(null)}
        onComplete={handleBattleComplete}
      />
    </div>
  );
}