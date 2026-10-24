import React, { useState, useEffect, useRef } from "react";
import type { AssignmentItem } from "../assignment";
import { DEFAULT_ASSIGNMENTS, extractDateOnly } from "../assignment";
import { getPetProfile, OUTFITS, MOTIVATION_QUOTES } from "../petConfig";
import CrusadeBattleModal from "./CrusadeBattleModal";

interface GuardianIslandProps {
  onReturnToDesktop: () => void;
  onStartFocus?: (assignment: AssignmentItem) => void;
}

interface PetState {
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  happiness: number;
}

const DEFAULT_PET: PetState = {
  level: 1,
  exp: 0,
  maxExp: 100,
  coins: 50,
  happiness: 100,
};

interface MovePing {
  id: number;
  x: number;
  y: number;
}

export const GuardianIsland: React.FC<GuardianIslandProps> = ({
  onReturnToDesktop,
}) => {
  // 寵物狀態
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem("hub_focus_pet");
    return saved ? JSON.parse(saved) : DEFAULT_PET;
  });

  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    return localStorage.getItem("hub_custom_pet_avatar") || null;
  });

  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem("hub_custom_pet_name") || "";
  });

  const [currentOutfit, setCurrentOutfit] = useState<string>(() => {
    return localStorage.getItem("hub_pet_outfit") || "default";
  });

  // 作業與待辦事項
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    const saved = localStorage.getItem("hub_assignments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_ASSIGNMENTS;
  });

  // 🐾 守護獸座標與漫遊狀態
  const [petOffset, setPetOffset] = useState({ x: 0, y: 0 });
  const [isWalking, setIsWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [dialogue, setDialogue] = useState("歡迎來到守護獸島！🌴 點擊草地可指揮我移動喔！⚔️");
  const [isDialogueOpen, setIsDialogueOpen] = useState(true);
  const [isHappyJump, setIsHappyJump] = useState(false);

  // 🎮 LoL 風格點地移動相關 Ref 與點擊波紋
  const grassRef = useRef<HTMLDivElement>(null);
  const [movePings, setMovePings] = useState<MovePing[]>([]);
  const lastManualCommandTime = useRef<number>(0);
  const walkTimeoutRef = useRef<any>(null);

  // 🍅 守護獸島內沉浸番茄鐘專注狀態
  const [isIslandFocusing, setIsIslandFocusing] = useState(false);
  const [focusAssignment, setFocusAssignment] = useState<AssignmentItem | null>(null);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60);
  const [focusTotalSeconds, setFocusTotalSeconds] = useState(25 * 60);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [focusElapsedSeconds, setFocusElapsedSeconds] = useState(0);

  // 討伐戰鬥 Modal
  const [activeBattleAssignment, setActiveBattleAssignment] = useState<AssignmentItem | null>(null);

  // 當前島嶼面板頁籤：討伐告示板 (crusade) vs 補給餵食小舖 (supplies)
  const [activeIslandTab, setActiveIslandTab] = useState<"crusade" | "supplies">("crusade");

  // 飄字通知
  const [islandToast, setIslandToast] = useState<string | null>(null);

  const savePet = (nextState: PetState) => {
    setPet(nextState);
    localStorage.setItem("hub_focus_pet", JSON.stringify(nextState));
  };

  const showToast = (msg: string) => {
    setIslandToast(msg);
    setTimeout(() => setIslandToast(null), 3000);
  };

  // 監聽寵物經驗與金幣更新
  useEffect(() => {
    const handlePetReward = (e: any) => {
      const { expBonus = 0, coinsBonus = 0, message = "" } = e.detail || {};
      const latestSaved = localStorage.getItem("hub_focus_pet");
      let basePet = latestSaved ? JSON.parse(latestSaved) : pet;

      if (expBonus > 0 || coinsBonus > 0) {
        let newExp = basePet.exp + expBonus;
        let newLevel = basePet.level;
        let newMaxExp = basePet.maxExp;

        while (newExp >= newMaxExp) {
          newExp -= newMaxExp;
          newLevel += 1;
          newMaxExp = Math.round(newMaxExp * 1.3);
        }

        const next: PetState = {
          level: newLevel,
          exp: newExp,
          maxExp: newMaxExp,
          coins: basePet.coins + coinsBonus,
          happiness: Math.min(100, basePet.happiness + 10),
        };
        savePet(next);
      } else {
        setPet(basePet);
      }

      if (message) {
        setDialogue(message);
        setIsDialogueOpen(true);
      }
    };

    const handleSyncAvatar = () => {
      setCustomAvatar(localStorage.getItem("hub_custom_pet_avatar") || null);
      setCustomName(localStorage.getItem("hub_custom_pet_name") || "");
      setCurrentOutfit(localStorage.getItem("hub_pet_outfit") || "default");
    };

    window.addEventListener("focus_pet_reward", handlePetReward);
    window.addEventListener("hub_add_pet_exp", (e: any) => {
      const { exp = 0, coins = 0 } = e.detail || {};
      handlePetReward({ detail: { expBonus: exp, coinsBonus: coins } });
    });
    window.addEventListener("custom_pet_avatar_updated", handleSyncAvatar);
    window.addEventListener("custom_pet_name_updated", handleSyncAvatar);
    window.addEventListener("pet_outfit_updated", handleSyncAvatar);

    return () => {
      window.removeEventListener("focus_pet_reward", handlePetReward);
      window.removeEventListener("custom_pet_avatar_updated", handleSyncAvatar);
      window.removeEventListener("custom_pet_name_updated", handleSyncAvatar);
      window.removeEventListener("pet_outfit_updated", handleSyncAvatar);
    };
  }, [pet]);

  // 🎮 守護獸自主漫遊 (專注時在原地靜修，若使用者近期有點擊移動則暫停自動巡邏)
  useEffect(() => {
    if (isIslandFocusing) return;

    const roamTimer = setInterval(() => {
      // 若玩家在 7 秒內曾下達點地移動指令，則優先尊重玩家位置
      if (Date.now() - lastManualCommandTime.current < 7000) return;

      const shouldMove = Math.random() > 0.4;
      if (shouldMove) {
        setIsWalking(true);
        // 在島嶼平台中央左右 ±110px、上下 ±20px 內自然巡邏
        const targetX = (Math.random() - 0.5) * 220;
        const targetY = (Math.random() - 0.5) * 35;

        setFacingLeft(targetX < petOffset.x);
        setPetOffset({ x: targetX, y: targetY });

        setTimeout(() => {
          setIsWalking(false);
        }, 1100);

        if (Math.random() < 0.25) {
          const islandQuotes = [
            "島上的空氣好清新～✨",
            "看著你努力，這座島嶼正在散發耀眼光芒！🌸",
            "巡邏島嶼周圍～一切安全！👀",
            "隨時準備好與你一起討伐作業魔物！⚔️",
            "你可以點擊草地，指揮我移動到任意位置喔！🐾",
          ];
          setDialogue(islandQuotes[Math.floor(Math.random() * islandQuotes.length)]);
          setIsDialogueOpen(true);
        }
      }
    }, 4500);

    return () => clearInterval(roamTimer);
  }, [isIslandFocusing, petOffset]);

  // =========================================================
  // 🎮 功能 2：LoL 風格點地移動 (Click-to-Move on Grass)
  // =========================================================
  const handleGrassClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!grassRef.current) return;
    const rect = grassRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // 計算相對於草地中心 (460 / 2 = 230, 90 / 2 = 45) 的偏移量
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rawOffsetX = clickX - centerX;
    const rawOffsetY = clickY - centerY;

    // 限制在橢圓草地安全範圍內
    const clampedX = Math.max(-165, Math.min(165, rawOffsetX));
    const clampedY = Math.max(-25, Math.min(25, rawOffsetY));

    // 1. 生成 LoL 風格綠色點擊標記光環
    const pingId = Date.now() + Math.random();
    setMovePings((prev) => [...prev, { id: pingId, x: clickX, y: clickY }]);
    setTimeout(() => {
      setMovePings((prev) => prev.filter((p) => p.id !== pingId));
    }, 650);

    // 2. 記錄手動指令時間
    lastManualCommandTime.current = Date.now();

    // 3. 轉向與開始平滑移動
    setFacingLeft(clampedX < petOffset.x);
    setIsWalking(true);
    setPetOffset({ x: clampedX, y: clampedY });

    // 4. 計算移動距離與所需時間
    const distance = Math.hypot(clampedX - petOffset.x, clampedY - petOffset.y);
    const moveDuration = Math.max(450, Math.min(1100, distance * 4.5));

    if (walkTimeoutRef.current) clearTimeout(walkTimeoutRef.current);
    walkTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
    }, moveDuration);

    // 5. 英雄對話彩蛋
    if (Math.random() < 0.5) {
      const lolQuotes = [
        "遵命！前往目標座標！⚔️",
        "收到召喚師指令，立即趕往！🐾",
        "守護獸全速前進！💨",
        "正在巡邏該區域！👀",
        "好步調！目標點確認！✨",
        "衝呀～為了專注之光！🔥",
      ];
      setDialogue(lolQuotes[Math.floor(Math.random() * lolQuotes.length)]);
      setIsDialogueOpen(true);
    }
  };

  // 點擊守護獸互動
  const handlePetClick = () => {
    setIsHappyJump(true);
    setTimeout(() => setIsHappyJump(false), 600);
    const quotes = [
      ...MOTIVATION_QUOTES,
      "摸摸我～專注力 +100%！💖",
      "今天也要一起守護這座島嶼喔！🌟",
      "有你在，什麼作業魔獸都難不倒我們！🔥",
    ];
    setDialogue(quotes[Math.floor(Math.random() * quotes.length)]);
    setIsDialogueOpen(true);
  };

  // =========================================================
  // 🍅 功能 1：島內直接執行專注番茄鐘 (In-Island Pomodoro)
  // =========================================================
  const handleStartIslandFocus = (item?: AssignmentItem) => {
    const target = item || {
      id: "free-focus-" + Date.now(),
      title: "島嶼靈泉自由專注",
      category: "修煉",
      dueDate: "",
      completed: false,
      expReward: 25,
      coinReward: 15,
    };

    setFocusAssignment(target);
    setFocusTotalSeconds(25 * 60);
    setFocusSecondsLeft(25 * 60);
    setFocusElapsedSeconds(0);
    setIsFocusPaused(false);
    setIsIslandFocusing(true);

    // 讓守護獸回到島嶼中央開始靜修
    setPetOffset({ x: 0, y: 0 });
    setIsWalking(false);
    setDialogue(`正在陪你【${target.title}】專注修煉中！加油 🔥`);
    setIsDialogueOpen(true);

    // 發送全域專注狀態通知
    window.dispatchEvent(
      new CustomEvent("hub_focus_state_change", {
        detail: { isFocusing: true, todoTitle: target.title },
      })
    );

    showToast(`🍅 已在島嶼啟動 25 分鐘專注！守護獸正在陪你修煉...`);
  };

  // 番茄鐘每秒倒數計時器
  useEffect(() => {
    if (!isIslandFocusing || isFocusPaused) return;

    const timer = setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          // 倒數結束，自動結算
          handleFinishIslandFocus(true);
          return 0;
        }
        return prev - 1;
      });

      setFocusElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isIslandFocusing, isFocusPaused]);

  // 暫停 / 繼續
  const handleTogglePauseFocus = () => {
    const nextPaused = !isFocusPaused;
    setIsFocusPaused(nextPaused);
    if (nextPaused) {
      setDialogue("專注暫停中 ⏸️，深呼吸喝口水再繼續吧！☕");
      showToast("⏸️ 番茄鐘已暫停");
    } else {
      setDialogue("繼續專注修煉！保持火熱狀態！🔥");
      showToast("▶️ 繼續專注計時");
    }
  };

  // 提前結算或倒數完成結算
  const handleFinishIslandFocus = (isAutoCompleted = false) => {
    if (!focusAssignment) return;

    const elapsedMins = Math.max(1, Math.round(focusElapsedSeconds / 60));
    const finalMins = isAutoCompleted ? 25 : elapsedMins;

    const exp = Math.min(finalMins * 2, 60);
    const coins = 10 + Math.floor(finalMins / 3);

    // 1. 若為具體待辦作業，累加專注次數與分鐘
    if (!focusAssignment.id.startsWith("free-focus")) {
      const updated = assignments.map((a) =>
        a.id === focusAssignment.id
          ? {
              ...a,
              pomodoroCount: (a.pomodoroCount || 0) + 1,
              totalFocusMinutes: (a.totalFocusMinutes || 0) + finalMins,
            }
          : a
      );
      setAssignments(updated);
      localStorage.setItem("hub_assignments", JSON.stringify(updated));
    }

    // 2. 寫入番茄鐘歷史紀錄
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const savedRecords = localStorage.getItem("hub_pomodoro_records");
      const records = savedRecords ? JSON.parse(savedRecords) : [];
      const newRecord = {
        id: "island_r_" + Date.now(),
        todoId: focusAssignment.id,
        todoTitle: `【${focusAssignment.category || "島嶼專注"}】${focusAssignment.title}`,
        durationMinutes: finalMins,
        timestamp: todayStr,
        timeStr: new Date().toTimeString().slice(0, 5),
      };
      localStorage.setItem("hub_pomodoro_records", JSON.stringify([newRecord, ...records]));
    } catch {}

    // 3. 發送獎勵事件
    window.dispatchEvent(
      new CustomEvent("focus_pet_reward", {
        detail: {
          expBonus: exp,
          coinsBonus: coins,
          message: `🎉 專注完成！累積 ${finalMins} 分鐘，獲得 +${exp} EXP / +${coins} 🪙！`,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", { detail: { exp, coins } })
    );

    // 4. 重置專注狀態
    setIsIslandFocusing(false);
    setFocusAssignment(null);
    setDialogue(`太棒了！這次專注修煉了 ${finalMins} 分鐘，靈力大幅增長！✨`);
    setIsDialogueOpen(true);

    window.dispatchEvent(
      new CustomEvent("hub_focus_state_change", {
        detail: { isFocusing: false },
      })
    );

    showToast(`🏆 專注結算成功！專注 ${finalMins} 分鐘，獲得 +${exp} EXP · +${coins} 🪙`);
  };

  // 放棄專注
  const handleCancelIslandFocus = () => {
    if (window.confirm("確定要中止當前島嶼專注嗎？此次專注將不計入紀錄。")) {
      setIsIslandFocusing(false);
      setFocusAssignment(null);
      setDialogue("沒關係，調整好節奏，我們隨時可以再出發！🌿");
      setIsDialogueOpen(true);

      window.dispatchEvent(
        new CustomEvent("hub_focus_state_change", {
          detail: { isFocusing: false },
        })
      );
      showToast("已結束專注修煉");
    }
  };

  // 觸發討伐戰鬥
  const handleStartCrusade = (item: AssignmentItem) => {
    setActiveBattleAssignment(item);
  };

  // 戰鬥勝利結算完成
  const handleCrusadeComplete = (item: AssignmentItem) => {
    const exp = item.expReward || 20;
    const coins = item.coinReward || 10;

    // 1. 更新作業狀態
    const updated = assignments.map((a) =>
      a.id === item.id ? { ...a, completed: true } : a
    );
    setAssignments(updated);
    localStorage.setItem("hub_assignments", JSON.stringify(updated));

    // 2. 更新寵物數值
    let newExp = pet.exp + exp;
    let newLevel = pet.level;
    let newMaxExp = pet.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.round(newMaxExp * 1.3);
    }

    const nextPet: PetState = {
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      coins: pet.coins + coins,
      happiness: Math.min(100, pet.happiness + 15),
    };

    savePet(nextPet);

    // 3. 廣播全域事件
    window.dispatchEvent(
      new CustomEvent("focus_pet_reward", {
        detail: {
          expBonus: exp,
          coinsBonus: coins,
          message: `🎉 成功討伐【${item.title}】！獲得 +${exp} EXP 與 +${coins} 🪙！`,
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent("hub_add_pet_exp", { detail: { exp, coins } })
    );

    setActiveBattleAssignment(null);
    showToast(`🎉 成功討伐【${item.title}】！獲得 +${exp} EXP / +${coins} 🪙`);
  };

  // 餵食小舖快速購買
  const handleIslandFeed = (foodName: string, cost: number, exp: number, icon: string) => {
    if (pet.coins < cost) {
      setDialogue(`金幣不夠買【${foodName}】啦（需要 ${cost} 🪙）！快去討伐作業賺金幣吧！⚔️`);
      setIsDialogueOpen(true);
      return;
    }

    let newExp = pet.exp + exp;
    let newLevel = pet.level;
    let newMaxExp = pet.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.round(newMaxExp * 1.3);
    }

    const nextPet: PetState = {
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      coins: pet.coins - cost,
      happiness: Math.min(100, pet.happiness + 20),
    };

    savePet(nextPet);
    setDialogue(`好呷好呷！守護獸享用了【${foodName}】${icon}，EXP +${exp}！✨`);
    setIsDialogueOpen(true);
    showToast(`😋 餵食成功！-${cost} 🪙 / +${exp} EXP`);
  };

  const profile = getPetProfile(pet.level);
  const equippedOutfit = OUTFITS.find((o) => o.id === currentOutfit);
  const expPercentage = Math.min(100, Math.round((pet.exp / pet.maxExp) * 100));
  const currentDisplayName = customName || (customAvatar ? "守護獸伙伴" : profile.title);

  // 待討伐的作業事項
  const pendingAssignments = assignments.filter((a) => !a.completed);

  // 格式化倒數時間
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // 計算圓形進度環 offset (半徑 70，周長約 439.8)
  const ringRadius = 70;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const focusProgress = focusTotalSeconds > 0 ? (focusTotalSeconds - focusSecondsLeft) / focusTotalSeconds : 0;
  const strokeDashoffset = ringCircumference * (1 - focusProgress);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "#0b132b",
        backgroundImage: `
          radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0) 65%),
          radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.2) 0%, rgba(15, 23, 42, 0) 60%),
          linear-gradient(180deg, #0c1a30 0%, #172554 45%, #0f172a 100%)
        `,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 飄字 Toast 提示 */}
      {islandToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1.5px solid rgba(251, 191, 36, 0.5)",
            color: "#fbbf24",
            padding: "10px 24px",
            borderRadius: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 99999,
            fontWeight: "800",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✨</span>
          <span>{islandToast}</span>
        </div>
      )}

      {/* 🌟 頂部 HUD：島嶼標題、金幣、等級與【返回桌面模式】按鈕 */}
      <header
        style={{
          width: "100%",
          padding: "16px 28px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 30,
          background: "linear-gradient(180deg, rgba(10, 15, 30, 0.75) 0%, rgba(10, 15, 30, 0) 100%)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* 左側：島嶼標誌與等級 */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 4px 14px rgba(6, 182, 212, 0.35)",
            }}
          >
            🏝️
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ margin: 0, fontSize: "19px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                守護獸島 <span style={{ fontSize: "14px", fontWeight: "600", color: "#93c5fd" }}>Guardian Sanctuary</span>
              </h1>
              <span
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  color: "#93c5fd",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "800",
                }}
              >
                Lv.{pet.level}
              </span>
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
              專注與學業能量凝聚的奇幻聖域 • 點擊草地指揮移動
            </p>
          </div>
        </div>

        {/* 右側：金幣、經驗值與【返回桌面模式】核心開關 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* 金幣膠囊 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              padding: "6px 14px",
              borderRadius: "20px",
            }}
          >
            <span style={{ fontSize: "16px" }}>🪙</span>
            <span style={{ fontWeight: "900", color: "#fbbf24", fontSize: "14px" }}>{pet.coins}</span>
          </div>

          {/* 經驗進度條 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "130px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#cbd5e1", fontWeight: "700" }}>
              <span>EXP</span>
              <span>{pet.exp}/{pet.maxExp}</span>
            </div>
            <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: `${expPercentage}%`, height: "100%", backgroundColor: profile.color, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* 🖥️ 返回桌面模式按鈕（顯眼、隨時可一鍵切回） */}
          <button
            onClick={onReturnToDesktop}
            style={{
              padding: "9px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(59, 130, 246, 0.8))";
              e.currentTarget.style.borderColor = "rgba(147, 197, 253, 0.6)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title="切換回桌面模式（行事曆、待辦事項、課表與桌布）"
          >
            <span>🖥️</span>
            <span>返回桌面模式</span>
          </button>
        </div>
      </header>

      {/* 🌟 核心雙區佈局：左側島嶼冒險舞台 + 右側冒險告示與補給面板 */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px",
          padding: "16px 28px 24px 28px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 10,
          minHeight: 0,
        }}
      >
        {/* ====================================================
            🏝️ 左側：奇幻浮空島主場景
            ==================================================== */}
        <div
          style={{
            position: "relative",
            borderRadius: "28px",
            border: "1.5px solid rgba(255, 255, 255, 0.12)",
            background: isIslandFocusing
              ? "radial-gradient(ellipse at 50% 50%, rgba(15, 30, 70, 0.85) 0%, rgba(10, 15, 30, 0.95) 100%)"
              : "radial-gradient(ellipse at 50% 60%, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.7) 100%)",
            boxShadow: "inset 0 0 60px rgba(56, 189, 248, 0.15), 0 20px 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "36px",
            transition: "background 0.5s ease",
          }}
        >
          {/* 天空漂浮動態雲朵與能量碎石 */}
          <div className="floating-cloud c1" style={{ top: "15%", left: "8%" }}>☁️</div>
          <div className="floating-cloud c2" style={{ top: "25%", right: "12%" }}>☁️</div>
          <div className="floating-cloud c3" style={{ top: "45%", left: "15%" }}>✨</div>
          <div className="floating-cloud c1" style={{ top: "35%", right: "20%" }}>🌸</div>

          {/* 遠景浮空小碎島 */}
          <div
            className="floating-mini-island"
            style={{
              position: "absolute",
              top: "16%",
              right: "8%",
              width: "120px",
              height: "45px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #10b981 0%, #064e3b 60%, #1e293b 100%)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              opacity: 0.8,
            }}
          >
            ⛩️
          </div>

          <div
            className="floating-mini-island"
            style={{
              position: "absolute",
              top: "22%",
              left: "6%",
              width: "90px",
              height: "35px",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #3b82f6 0%, #1e3a8a 60%, #1e293b 100%)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              opacity: 0.75,
              animationDelay: "-2s",
            }}
          >
            💎
          </div>

          {/* 🍅 專注模式專屬懸浮圓形倒數計時 HUD */}
          {isIslandFocusing && (
            <div
              className="focus-hud-fadein"
              style={{
                position: "absolute",
                top: "22px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 35,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* 圓形進度環與時間倒數 */}
              <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                  <defs>
                    <linearGradient id="islandFocusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  {/* 底環 */}
                  <circle
                    cx="80"
                    cy="80"
                    r={ringRadius}
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* 動態進度環 */}
                  <circle
                    cx="80"
                    cy="80"
                    r={ringRadius}
                    stroke="url(#islandFocusGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s ease" }}
                  />
                </svg>

                {/* 圓環中央文字 */}
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", color: isFocusPaused ? "#facc15" : "#93c5fd", fontWeight: "800", letterSpacing: "1px" }}>
                    {isFocusPaused ? "⏸️ 已暫停" : "🔥 專注修煉中"}
                  </span>
                  <span
                    style={{
                      fontSize: "30px",
                      fontWeight: "900",
                      color: "#ffffff",
                      fontVariantNumeric: "tabular-nums",
                      textShadow: "0 0 14px rgba(56, 189, 248, 0.6)",
                      lineHeight: "1.2",
                    }}
                  >
                    {formatTime(focusSecondsLeft)}
                  </span>
                  <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
                    25:00 倒數
                  </span>
                </div>
              </div>

              {/* 當前專注作業標籤 */}
              {focusAssignment && (
                <div
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    padding: "4px 14px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#e0f2fe",
                    maxWidth: "280px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  【{focusAssignment.category || "作業"}】{focusAssignment.title}
                </div>
              )}

              {/* 專注控制按鍵列 */}
              <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                <button
                  onClick={handleTogglePauseFocus}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backgroundColor: isFocusPaused ? "#2563eb" : "rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {isFocusPaused ? "▶️ 繼續" : "⏸️ 暫停"}
                </button>

                <button
                  onClick={() => handleFinishIslandFocus(false)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                  }}
                  title="提早結束並按照已專注時間結算 EXP 與金幣"
                >
                  ⚡ 提早完成
                </button>

                <button
                  onClick={handleCancelIslandFocus}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "10px",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                  title="放棄當前專注"
                >
                  ✕ 放棄
                </button>
              </div>
            </div>
          )}

          {/* 🌿 主浮空島嶼平台地面 (Central Floating Island Platform) */}
          <div
            className="island-main-float"
            style={{
              position: "relative",
              width: "480px",
              height: "170px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {/* 🌟 島嶼上層翠綠草地 (Grass Area - 支援 LoL 風格點地移動) */}
            <div
              ref={grassRef}
              onClick={handleGrassClick}
              title="點擊草地任意位置，指揮守護獸走動！🐾"
              style={{
                width: "460px",
                height: "90px",
                borderRadius: "50%",
                background: "radial-gradient(ellipse at 50% 30%, #34d399 0%, #059669 45%, #065f46 80%, #047857 100%)",
                border: "2px solid rgba(110, 231, 183, 0.4)",
                boxShadow: "0 0 40px rgba(52, 211, 153, 0.35), inset 0 2px 10px rgba(255, 255, 255, 0.4)",
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {/* 🎮 LoL 風格點地移動波紋光環 (Movement Command Pings) */}
              {movePings.map((ping) => (
                <React.Fragment key={ping.id}>
                  <div
                    className="lol-move-ping-outer"
                    style={{ left: `${ping.x}px`, top: `${ping.y}px` }}
                  />
                  <div
                    className="lol-move-ping-inner"
                    style={{ left: `${ping.x}px`, top: `${ping.y}px` }}
                  />
                </React.Fragment>
              ))}

              {/* 島上裝飾：神木、石碑、水晶花草 */}
              <div style={{ position: "absolute", left: "28px", top: "-24px", fontSize: "36px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))", pointerEvents: "none" }}>
                🌳
              </div>
              <div style={{ position: "absolute", right: "36px", top: "-18px", fontSize: "30px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))", pointerEvents: "none" }}>
                🔮
              </div>
              <div style={{ position: "absolute", left: "85px", top: "-8px", fontSize: "16px", pointerEvents: "none" }}>
                🌸
              </div>
              <div style={{ position: "absolute", right: "90px", top: "-6px", fontSize: "16px", pointerEvents: "none" }}>
                🍄
              </div>

              {/* 聖壇地面魔法陣同心圓 (專注時具備旋轉靈氣) */}
              <div
                className={isIslandFocusing ? "focus-magic-circle" : ""}
                style={{
                  width: "220px",
                  height: "55px",
                  borderRadius: "50%",
                  border: isIslandFocusing
                    ? "2px solid rgba(56, 189, 248, 0.8)"
                    : "1.5px dashed rgba(255, 255, 255, 0.3)",
                  boxShadow: isIslandFocusing
                    ? "0 0 25px rgba(56, 189, 248, 0.7), inset 0 0 15px rgba(56, 189, 248, 0.5)"
                    : "0 0 15px rgba(255, 255, 255, 0.2)",
                  pointerEvents: "none",
                  transition: "all 0.4s ease",
                }}
              />
            </div>

            {/* 島嶼下層岩石根部 */}
            <div
              style={{
                width: "360px",
                height: "95px",
                marginTop: "-50px",
                clipPath: "polygon(5% 0%, 95% 0%, 55% 100%, 45% 100%)",
                background: "linear-gradient(180deg, #064e3b 0%, #1e293b 40%, #0f172a 100%)",
                borderBottom: "3px solid rgba(56, 189, 248, 0.3)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            {/* 🌟 放大至島中央的守護獸主角（具平滑漫遊/點地走動與對話互動） */}
            <div
              style={{
                position: "absolute",
                top: "-75px",
                left: "50%",
                transform: `translateX(calc(-50% + ${petOffset.x}px)) translateY(${petOffset.y}px)`,
                transition: isWalking ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePetClick();
              }}
            >
              {/* 對話氣泡 */}
              {isDialogueOpen && (
                <div
                  className="dialogue-float"
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: isIslandFocusing
                      ? "1.5px solid rgba(56, 189, 248, 0.6)"
                      : "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isIslandFocusing ? "#93c5fd" : "#f8fafc",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                    maxWidth: "220px",
                    textAlign: "center",
                    marginBottom: "8px",
                    whiteSpace: "normal",
                    lineHeight: "1.4",
                  }}
                >
                  {dialogue}
                </div>
              )}

              {/* 守護獸本體 */}
              <div
                className={`
                  ${isHappyJump ? "pet-jump-happy" : isWalking ? "pet-island-walk" : isIslandFocusing ? "pet-meditating" : "pet-island-idle"}
                  ${isIslandFocusing ? "pet-focus-aura" : ""}
                `}
                style={{
                  transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
                  transition: "transform 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderRadius: "50%",
                }}
              >
                {customAvatar ? (
                  <img
                    src={customAvatar}
                    alt="custom-pet"
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "contain",
                      filter: isIslandFocusing
                        ? "drop-shadow(0 0 16px rgba(56, 189, 248, 0.9))"
                        : "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "105px",
                      height: "105px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      border: `3px solid ${profile.color}`,
                      boxShadow: isIslandFocusing
                        ? `0 0 45px #38bdf8, inset 0 0 20px #38bdf8`
                        : `0 0 30px ${profile.color}70`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: "65px", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" }}>
                      {profile.icon}
                    </span>

                    {currentOutfit !== "default" && equippedOutfit && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "4px",
                          fontSize: "30px",
                          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
                        }}
                      >
                        {equippedOutfit.icon}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 守護獸稱號與等級標籤 */}
              <div
                style={{
                  marginTop: "6px",
                  backgroundColor: isIslandFocusing ? "rgba(30, 58, 138, 0.85)" : "rgba(15, 23, 42, 0.8)",
                  border: isIslandFocusing ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <span>{currentDisplayName}</span>
                <span style={{ color: "#fbbf24" }}>Lv.{pet.level}</span>
                {isIslandFocusing && <span style={{ color: "#38bdf8" }}>🔥修煉中</span>}
              </div>
            </div>
          </div>

          {/* 底部互動導引小提示 */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              fontSize: "12px",
              color: "#94a3b8",
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "4px 14px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🎮 點擊草地移動守護獸</span>
            <span>•</span>
            <span>🍅 點擊右側待辦可直接在島內開啟專注修煉！</span>
          </div>
        </div>

        {/* ====================================================
            📜 右側：冒險討伐告示板 & 守護獸能量補給面板
            ==================================================== */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            borderRadius: "28px",
            border: "1.5px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* 面板頂部頁籤切換 */}
          <div style={{ display: "flex", gap: "8px", backgroundColor: "rgba(255, 255, 255, 0.06)", padding: "4px", borderRadius: "12px" }}>
            <button
              onClick={() => setActiveIslandTab("crusade")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "10px",
                border: "none",
                backgroundColor: activeIslandTab === "crusade" ? "#2563eb" : "transparent",
                color: activeIslandTab === "crusade" ? "#ffffff" : "#94a3b8",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>⚔️</span> 冒險討伐榜 ({pendingAssignments.length})
            </button>
            <button
              onClick={() => setActiveIslandTab("supplies")}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: "10px",
                border: "none",
                backgroundColor: activeIslandTab === "supplies" ? "#d97706" : "transparent",
                color: activeIslandTab === "supplies" ? "#ffffff" : "#94a3b8",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>🍖</span> 補給能量站
            </button>
          </div>

          {/* TAB 1: 冒險討伐榜 */}
          {activeIslandTab === "crusade" && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                overflowY: "auto",
                paddingRight: "4px",
                minHeight: 0,
              }}
            >
              {/* 自由專注快速按鈕 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1px dashed rgba(59, 130, 246, 0.3)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#93c5fd", fontWeight: "700" }}>
                  🌟 島嶼靈泉修煉
                </div>
                <button
                  onClick={() => handleStartIslandFocus()}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  🍅 啟動自由專注 (25m)
                </button>
              </div>

              {pendingAssignments.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "16px",
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
                  <div style={{ fontWeight: "700", color: "#f8fafc" }}>太神了！所有作業魔獸已全數討伐完畢！</div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>可在桌面模式的「作業與待辦」新增更多修煉目標！</div>
                </div>
              ) : (
                pendingAssignments.map((item) => {
                  const isBoss = item.difficulty === "boss";
                  const isElite = item.difficulty === "elite";

                  const monsterIcon = isBoss ? "🐲" : isElite ? "👺" : "👾";
                  const monsterColor = isBoss ? "#ef4444" : isElite ? "#a855f7" : "#10b981";

                  const isItemFocusing = isIslandFocusing && focusAssignment?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: isItemFocusing ? "rgba(30, 58, 138, 0.35)" : "rgba(255, 255, 255, 0.05)",
                        border: isItemFocusing
                          ? "1.5px solid #38bdf8"
                          : `1px solid ${isBoss ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: "14px",
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        transition: "transform 0.15s, background 0.15s",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "18px" }}>{monsterIcon}</span>
                          <span style={{ fontWeight: "800", fontSize: "14px", color: "#f8fafc" }}>
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              backgroundColor: `${monsterColor}22`,
                              color: monsterColor,
                              border: `1px solid ${monsterColor}66`,
                              padding: "1px 6px",
                              borderRadius: "6px",
                              fontWeight: "800",
                            }}
                          >
                            {isBoss ? "BOSS 級" : isElite ? "菁英怪" : "一般怪"}
                          </span>

                          {(item.pomodoroCount || 0) > 0 && (
                            <span
                              style={{
                                fontSize: "10px",
                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                color: "#fca5a5",
                                padding: "1px 6px",
                                borderRadius: "6px",
                                fontWeight: "800",
                              }}
                            >
                              🍅 {item.pomodoroCount} 次
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "#94a3b8" }}>
                          <span>截止：{extractDateOnly(item.dueDate) || "無期限"}</span>
                          <span style={{ color: "#60a5fa", fontWeight: "700" }}>+{item.expReward || 20} EXP</span>
                          <span style={{ color: "#fbbf24", fontWeight: "700" }}>+{item.coinReward || 10} 🪙</span>
                        </div>
                      </div>

                      {/* 操作按鍵：島內直接執行專注 & ⚔️ 討伐 */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => handleStartIslandFocus(item)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            backgroundColor: isItemFocusing ? "#ef4444" : "rgba(239, 68, 68, 0.15)",
                            color: isItemFocusing ? "#ffffff" : "#f87171",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          title="在島嶼直接啟動番茄鐘倒數專注修煉"
                        >
                          {isItemFocusing ? "🔥 專注中" : "🍅 專注"}
                        </button>

                        <button
                          onClick={() => handleStartCrusade(item)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: "900",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span>⚔️</span> 討伐
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: 補給能量站 */}
          {activeIslandTab === "supplies" && (
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                overflowY: "auto",
                minHeight: 0,
              }}
            >
              {[
                { name: "活力小餅乾", cost: 10, exp: 20, icon: "🍪", desc: "酥脆可口，補充基本冒險活力" },
                { name: "香烤大雞腿", cost: 25, exp: 60, icon: "🍗", desc: "滿滿蛋白質，守護獸大愛" },
                { name: "特級神仙草莓派", cost: 50, exp: 140, icon: "🍰", desc: "奢華甜點，帶來大量成長經驗" },
                { name: "時空星光能量果", cost: 100, exp: 320, icon: "🌟", desc: "蘊含星辰之力，急速提升等級" },
              ].map((food) => (
                <div
                  key={food.name}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "16px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "36px" }}>{food.icon}</span>
                  <span style={{ fontWeight: "800", fontSize: "13px", color: "#f8fafc" }}>{food.name}</span>
                  <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: "700" }}>+{food.exp} EXP</span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{food.desc}</span>

                  <button
                    onClick={() => handleIslandFeed(food.name, food.cost, food.exp, food.icon)}
                    style={{
                      marginTop: "auto",
                      width: "100%",
                      padding: "8px 0",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: pet.coins >= food.cost ? "#d97706" : "rgba(255, 255, 255, 0.1)",
                      color: pet.coins >= food.cost ? "#ffffff" : "#64748b",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: pet.coins >= food.cost ? "pointer" : "not-allowed",
                      transition: "all 0.15s",
                    }}
                  >
                    🪙 {food.cost} 購買餵食
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ⚔️ 升級版「討伐」過場動畫與結算視窗 */}
      <CrusadeBattleModal
        assignment={activeBattleAssignment}
        onClose={() => setActiveBattleAssignment(null)}
        onComplete={handleCrusadeComplete}
      />

      {/* 🌟 樣式與動畫定義 */}
      <style>{`
        @keyframes islandFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .island-main-float {
          animation: islandFloat 4s infinite ease-in-out;
        }

        @keyframes miniFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .floating-mini-island {
          animation: miniFloat 5s infinite ease-in-out;
        }

        @keyframes cloudDrift {
          0% { transform: translateX(0); opacity: 0.3; }
          50% { transform: translateX(30px); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 0.3; }
        }
        .floating-cloud {
          position: absolute;
          font-size: 26px;
          animation: cloudDrift 8s infinite ease-in-out;
          pointer-events: none;
        }
        .c2 { animation-duration: 11s; animation-delay: -3s; font-size: 32px; }
        .c3 { animation-duration: 9s; animation-delay: -5s; font-size: 20px; }

        .pet-island-idle {
          animation: islandBreathing 3s infinite ease-in-out;
        }
        @keyframes islandBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .pet-island-walk {
          animation: islandWalkBounce 0.32s infinite alternate ease-in-out;
        }
        @keyframes islandWalkBounce {
          0% { transform: translateY(0) rotate(-3deg); }
          100% { transform: translateY(-14px) rotate(3deg); }
        }

        .pet-meditating {
          animation: meditateFloat 2.4s infinite ease-in-out;
        }
        @keyframes meditateFloat {
          0%, 100% { transform: translateY(0) scale(1.02); }
          50% { transform: translateY(-10px) scale(1.08); }
        }

        .pet-focus-aura {
          animation: focusGlow 2s infinite alternate ease-in-out;
        }
        @keyframes focusGlow {
          0% { filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.5)); }
          100% { filter: drop-shadow(0 0 25px rgba(129, 140, 248, 0.9)); }
        }

        @keyframes happyJumpAnim {
          0%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-30px) scale(1.15) rotate(-5deg); }
          70% { transform: translateY(-10px) scale(1.05) rotate(5deg); }
        }
        .pet-jump-happy {
          animation: happyJumpAnim 0.55s ease-out;
        }

        @keyframes dialogueBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .dialogue-float {
          animation: dialogueBounce 2.5s infinite ease-in-out;
        }

        @keyframes focusHudFadeIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-15px) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        .focus-hud-fadein {
          animation: focusHudFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes magicCircleSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .focus-magic-circle {
          animation: magicCircleSpin 12s linear infinite;
        }

        /* 🎮 LoL 風格點地移動光環波紋 */
        @keyframes lolPingPulse {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
        }
        .lol-move-ping-outer {
          position: absolute;
          width: 38px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #34d399;
          box-shadow: 0 0 12px #10b981, inset 0 0 8px #10b981;
          animation: lolPingPulse 0.6s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
          pointer-events: none;
          z-index: 20;
        }

        @keyframes lolPingInner {
          0% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }
        .lol-move-ping-inner {
          position: absolute;
          width: 14px;
          height: 8px;
          border-radius: 50%;
          background-color: #a7f3d0;
          box-shadow: 0 0 10px #34d399;
          animation: lolPingInner 0.45s ease-out forwards;
          pointer-events: none;
          z-index: 21;
        }
      `}</style>
    </div>
  );
};

export default GuardianIsland;
