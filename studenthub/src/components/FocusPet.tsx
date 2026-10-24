import { useState, useEffect, useRef } from "react";
import type { PetState } from "./petConfig";
import {
  DEFAULT_PET_STATE,
  OUTFITS,
  getPetProfile,
  MOTIVATION_QUOTES,
  FOCUS_QUOTES,
} from "./petConfig";

export default function FocusPet() {
  // 從 localStorage 讀取寵物狀態（預設金幣為 DEFAULT_PET_STATE 的 50 🪙，絕不鎖定在 9999）
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem("hub_focus_pet");
    return saved ? JSON.parse(saved) : DEFAULT_PET_STATE;
  });

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem("hub_pet_visible");
    return saved !== null ? saved === "true" : true;
  });

  const [isIslandMode, setIsIslandMode] = useState<boolean>(() => {
    return localStorage.getItem("hub_view_mode") === "island";
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

  const [dialogue, setDialogue] = useState<string>("我出發散步囉！🐾");
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);

  // 專注狀態監聽
  const [isFocusing, setIsFocusing] = useState<boolean>(false);
  const [focusTitle, setFocusTitle] = useState<string>("");

  const [pos, setPos] = useState(() => {
    const savedPos = localStorage.getItem("hub_pet_pos");
    return savedPos ? JSON.parse(savedPos) : { x: window.innerWidth - 180, y: window.innerHeight - 220 };
  });

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;

  const savePet = (nextState: PetState) => {
    setPet(nextState);
    localStorage.setItem("hub_focus_pet", JSON.stringify(nextState));
  };

  // 監聽專注狀態：開始專注時自動喚醒寵物並開啟跑動
  useEffect(() => {
    const handleFocusStateChange = (e: any) => {
      const { isFocusing: focusing, todoTitle } = e.detail || {};
      setIsFocusing(!!focusing);
      setFocusTitle(todoTitle || "");

      if (focusing) {
        setIsVisible(true);
        setDialogue(`正在陪你【${todoTitle || "專注"}】中！加油 🐱🔥`);
        setShowBubble(true);
      } else {
        setDialogue("辛苦囉！休息一下吧 ☕");
        setShowBubble(true);
      }
    };

    window.addEventListener("hub_focus_state_change", handleFocusStateChange);
    return () => window.removeEventListener("hub_focus_state_change", handleFocusStateChange);
  }, []);

  // 專注跑動計時器
  useEffect(() => {
    if (!isVisible) return;

    const intervalTime = isFocusing ? 2500 : 5000;

    const roamInterval = setInterval(() => {
      if (isDragging.current) return;

      const willMove = isFocusing ? true : Math.random() > 0.3;

      if (willMove) {
        setIsMoving(true);
        const dx = (Math.random() - 0.5) * (isFocusing ? 320 : 160);
        const dy = (Math.random() - 0.5) * (isFocusing ? 220 : 120);

        const current = posRef.current;
        const targetX = Math.max(60, Math.min(window.innerWidth - 160, current.x + dx));
        const targetY = Math.max(80, Math.min(window.innerHeight - 180, current.y + dy));

        if (dx < 0) {
          setFacingLeft(true);
        } else if (dx > 0) {
          setFacingLeft(false);
        }

        setPos({ x: targetX, y: targetY });

        setTimeout(() => {
          setIsMoving(false);
        }, 1000);

        if (isFocusing) {
          const quotes = [...FOCUS_QUOTES, `認真【${focusTitle}】中...`, "看你寫作業好療癒 ✨"];
          setDialogue(quotes[Math.floor(Math.random() * quotes.length)]);
          setShowBubble(true);
        } else if (Math.random() < 0.25) {
          const quotes = ["散步好開心～", "巡邏中！👀", "看看你在做什麼～", "偷偷跟著你 🐾"];
          setDialogue(quotes[Math.floor(Math.random() * quotes.length)]);
          setShowBubble(true);
        }
      }
    }, intervalTime);

    return () => clearInterval(roamInterval);
  }, [isVisible, isFocusing, focusTitle]);

  // 同步外觀與隱藏狀態
  useEffect(() => {
    const handleToggleVisibility = (e: any) => {
      const targetState = e.detail?.visible !== undefined ? e.detail.visible : !isVisible;
      setIsVisible(targetState);
      localStorage.setItem("hub_pet_visible", String(targetState));
    };

    const handleSyncAvatarNameAndOutfit = () => {
      setCustomAvatar(localStorage.getItem("hub_custom_pet_avatar") || null);
      setCustomName(localStorage.getItem("hub_custom_pet_name") || "");
      setCurrentOutfit(localStorage.getItem("hub_pet_outfit") || "default");
    };

    const handleViewModeChange = (e: any) => {
      setIsIslandMode(e.detail?.mode === "island");
    };

    window.addEventListener("toggle_pet_visibility", handleToggleVisibility);
    window.addEventListener("custom_pet_avatar_updated", handleSyncAvatarNameAndOutfit);
    window.addEventListener("custom_pet_name_updated", handleSyncAvatarNameAndOutfit);
    window.addEventListener("pet_outfit_updated", handleSyncAvatarNameAndOutfit);
    window.addEventListener("hub_view_mode_changed", handleViewModeChange);

    return () => {
      window.removeEventListener("toggle_pet_visibility", handleToggleVisibility);
      window.removeEventListener("custom_pet_avatar_updated", handleSyncAvatarNameAndOutfit);
      window.removeEventListener("custom_pet_name_updated", handleSyncAvatarNameAndOutfit);
      window.removeEventListener("pet_outfit_updated", handleSyncAvatarNameAndOutfit);
      window.removeEventListener("hub_view_mode_changed", handleViewModeChange);
    };
  }, [isVisible]);

  // 監聽獲得獎勵事件（專注完成後會增加真實金幣與經驗）
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
          coins: basePet.coins + coinsBonus, // 正確累加賺到的金幣
          happiness: Math.min(100, basePet.happiness + 10)
        };
        savePet(next);
      } else {
        setPet(basePet);
      }

      if (message) {
        setDialogue(message);
        setShowBubble(true);
      }
    };

    const handleAddPetExp = (e: any) => {
      const { exp = 0, coins = 0 } = e.detail || {};
      handlePetReward({ detail: { expBonus: exp, coinsBonus: coins } });
    };

    window.addEventListener("focus_pet_reward", handlePetReward);
    window.addEventListener("hub_add_pet_exp", handleAddPetExp);
    return () => {
      window.removeEventListener("focus_pet_reward", handlePetReward);
      window.removeEventListener("hub_add_pet_exp", handleAddPetExp);
    };
  }, [pet]);

  // 拖曳處理
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 120, e.clientX - dragOffset.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        localStorage.setItem("hub_pet_pos", JSON.stringify(pos));
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pos]);

  const handlePetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setDialogue(randomQuote);
    setShowBubble(true);
  };

  // 餵食邏輯：扣除真實金幣 15 🪙
  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pet.coins < 15) {
      setDialogue("金幣不夠買零食啦 (需要 15 🪙)！");
      setShowBubble(true);
      return;
    }

    let newExp = pet.exp + 25;
    let newLevel = pet.level;
    let newMaxExp = pet.maxExp;

    while (newExp >= newMaxExp) {
      newExp -= newMaxExp;
      newLevel += 1;
      newMaxExp = Math.round(newMaxExp * 1.3);
    }

    const nextState = {
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      coins: pet.coins - 15, // 扣除 15 金幣
      happiness: Math.min(100, pet.happiness + 20)
    };

    savePet(nextState);
    setDialogue("好呷好呷！EXP +25 🍖✨");
    setShowBubble(true);
  };

  const setPetVisibleState = (visible: boolean) => {
    setIsVisible(visible);
    localStorage.setItem("hub_pet_visible", String(visible));
  };

  const profile = getPetProfile(pet.level);
  const equippedOutfit = OUTFITS.find(o => o.id === currentOutfit);
  const expPercentage = Math.min(100, Math.round((pet.exp / pet.maxExp) * 100));
  const currentDisplayName = customName || (customAvatar ? "自訂專屬守護獸" : profile.title);

  const renderAvatarContent = (size = "44px") => {
    if (customAvatar) {
      return (
        <img
          src={customAvatar}
          alt="custom-pet"
          style={{
            maxWidth: "80px",
            maxHeight: "80px",
            objectFit: "contain",
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
          }}
        />
      );
    }

    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px" }}>
        <span style={{ fontSize: size, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}>
          {profile.icon}
        </span>

        {currentOutfit !== "default" && equippedOutfit && (
          <span style={{
            position: "absolute",
            top: "-6px",
            right: "4px",
            fontSize: "22px",
            transform: "rotate(-12deg)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            animation: "floatBubble 2s infinite ease-in-out"
          }}>
            {equippedOutfit.icon}
          </span>
        )}
      </div>
    );
  };

  // 當處於守護獸島模式時，寵物已在島嶼中央大顯身手，隱藏懸浮桌寵避免重疊
  if (isIslandMode) return null;

  if (!isVisible) {
    return (
      <button
        onClick={() => setPetVisibleState(true)}
        title="點擊呼喚守護獸"
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: `3px solid ${profile.color}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 99999, // 用來確保浮在圖層最頂層的 CSS 屬性
          padding: 0,
          overflow: "hidden"
        }}
      >
        {renderAvatarContent("26px")}
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 99999,
        userSelect: "none",
        cursor: "grab",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        transition: isDragging.current ? "none" : "left 0.8s cubic-bezier(0.25, 1, 0.5, 1), top 0.8s cubic-bezier(0.25, 1, 0.5, 1)"
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 氣泡語錄 */}
      {showBubble && (
        <div style={{
          backgroundColor: isFocusing ? "#eff6ff" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "700",
          color: isFocusing ? "#1d4ed8" : "#334155",
          border: "1px solid",
          borderColor: isFocusing ? "#93c5fd" : "#e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "180px",
          textAlign: "center",
          animation: "floatBubble 2s infinite ease-in-out",
          whiteSpace: "nowrap"
        }}>
          {dialogue}
        </div>
      )}

      {/* 寵物本體 */}
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => { e.stopPropagation(); setPetVisibleState(false); }}
          onMouseDown={(e) => e.stopPropagation()}
          title="隱藏桌面寵物"
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            width: "16px",
            height: "16px",
            backgroundColor: "rgba(100, 116, 139, 0.8)",
            color: "#ffffff",
            borderRadius: "50%",
            border: "1px solid #ffffff",
            fontSize: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            lineHeight: 1
          }}
        >
          ✕
        </button>

        <div
          className={isMoving ? "pet-walking" : "pet-idle"}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
            transition: "transform 0.3s ease",
            padding: "4px"
          }}
          onClick={handlePetClick}
          onDoubleClick={() => setIsExpanded(!isExpanded)}
        >
          {renderAvatarContent("52px")}
        </div>
      </div>

      {/* 顯示真實等級與當前金幣數量 */}
      <div style={{
        backgroundColor: isFocusing ? "#2563eb" : "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        color: "#fff",
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "bold",
        display: "flex",
        gap: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}>
        <span>Lv.{pet.level}</span>
        <span style={{ color: "#fbbf24" }}>🪙{pet.coins}</span>
        {isFocusing && <span style={{ color: "#93c5fd" }}>🔥陪讀中</span>}
      </div>

      {/* 雙擊詳細選單 */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            border: "1px solid #e2e8f0",
            width: "160px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            cursor: "default"
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>
            {currentDisplayName}
          </div>

          <div style={{ width: "100%", height: "5px", backgroundColor: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${expPercentage}%`, height: "100%", backgroundColor: profile.color }}></div>
          </div>
          <div style={{ fontSize: "9px", color: "#64748b", textAlign: "center" }}>
            {pet.exp}/{pet.maxExp} EXP
          </div>

          <button
            onClick={handleFeed}
            style={{
              padding: "5px 8px",
              backgroundColor: "#ffedd5",
              color: "#ea580c",
              border: "none",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🍖 餵食 (-15🪙 / +25EXP)
          </button>
        </div>
      )}

      <style>{`
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .pet-idle {
          animation: breathing 3s infinite ease-in-out;
        }
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        .pet-walking {
          animation: bounceWalk 0.3s infinite alternate ease-in-out;
        }
        @keyframes bounceWalk {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}