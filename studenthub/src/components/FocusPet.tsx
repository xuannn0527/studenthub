import React, { useState, useEffect, useRef } from "react";

export interface PetState {
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  happiness: number;
}

const DEFAULT_PET_STATE: PetState = {
  level: 1,
  exp: 0,
  maxExp: 100,
  coins: 50,
  happiness: 100,
};

const getPetProfile = (level: number) => {
  if (level < 4) return { icon: "🐣", title: "初生好奇雛鳥", color: "#eab308" };
  if (level < 7) return { icon: "🦊", title: "靈性學業狐", color: "#f97316" };
  if (level < 10) return { icon: "🦌", title: "專注幻獸鹿", color: "#06b6d4" };
  return { icon: "🐉", title: "時空守護龍神", color: "#8b5cf6" };
};

const MOTIVATION_QUOTES = [
  "今天也要元氣滿滿！✨",
  "散步散步～到處巡邏！🐾",
  "專注是通往自由的捷徑 📖",
  "寫完作業我們就可以去玩了！🎮",
  "讀累了嗎？喝口水休息一下 💧",
  "你超棒的，保持這個節奏！🔥",
  "摸摸我～專注力 +100% 💖",
  "呼嚕嚕～好舒服喔 💤"
];

export default function FocusPet() {
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem("hub_focus_pet");
    return saved ? JSON.parse(saved) : DEFAULT_PET_STATE;
  });

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem("hub_pet_visible");
    return saved !== null ? saved === "true" : true;
  });

  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    return localStorage.getItem("hub_custom_pet_avatar") || null;
  });

  // 🌟 自訂名稱狀態追蹤
  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem("hub_custom_pet_name") || "";
  });

  const [dialogue, setDialogue] = useState<string>("我出發散步囉！🐾");
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);

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

  useEffect(() => {
    const handleToggleVisibility = (e: any) => {
      const targetState = e.detail?.visible !== undefined ? e.detail.visible : !isVisible;
      setIsVisible(targetState);
      localStorage.setItem("hub_pet_visible", String(targetState));
    };

    window.addEventListener("toggle_pet_visibility", handleToggleVisibility);
    return () => window.removeEventListener("toggle_pet_visibility", handleToggleVisibility);
  }, [isVisible]);

  // 🌟 監聽外觀與名稱的雙向同步
  useEffect(() => {
    const handleSyncAvatarAndName = () => {
      setCustomAvatar(localStorage.getItem("hub_custom_pet_avatar") || null);
      setCustomName(localStorage.getItem("hub_custom_pet_name") || "");
    };

    window.addEventListener("custom_pet_avatar_updated", handleSyncAvatarAndName);
    window.addEventListener("custom_pet_name_updated", handleSyncAvatarAndName);
    return () => {
      window.removeEventListener("custom_pet_avatar_updated", handleSyncAvatarAndName);
      window.removeEventListener("custom_pet_name_updated", handleSyncAvatarAndName);
    };
  }, []);

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

    window.addEventListener("focus_pet_reward", handlePetReward);
    return () => window.removeEventListener("focus_pet_reward", handlePetReward);
  }, [pet]);

  useEffect(() => {
    if (!isVisible) return;

    const roamInterval = setInterval(() => {
      if (isDragging.current) return;

      const willMove = Math.random() > 0.3;

      if (willMove) {
        setIsMoving(true);
        const dx = (Math.random() - 0.5) * 140;
        const dy = (Math.random() - 0.5) * 100;

        const current = posRef.current;
        const targetX = Math.max(30, Math.min(window.innerWidth - 120, current.x + dx));
        const targetY = Math.max(50, Math.min(window.innerHeight - 150, current.y + dy));

        if (dx < 0) {
          setFacingLeft(true);
        } else if (dx > 0) {
          setFacingLeft(false);
        }

        setPos({ x: targetX, y: targetY });

        setTimeout(() => {
          setIsMoving(false);
        }, 1500);

        if (Math.random() < 0.25) {
          const quotes = ["散步好開心～", "巡邏中！👀", "看看你在做什麼～", "偷偷跟著你 🐾"];
          setDialogue(quotes[Math.floor(Math.random() * quotes.length)]);
          setShowBubble(true);
        }
      } else {
        setIsMoving(false);
        if (Math.random() < 0.3) {
          setDialogue("呼嚕嚕～休息一下 💤");
          setShowBubble(true);
        }
      }
    }, 4500);

    return () => clearInterval(roamInterval);
  }, [isVisible]);

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

  const handleFeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isDemo = localStorage.getItem("hub_is_demo") === "true";

    if (!isDemo && pet.coins < 15) {
      setDialogue("金幣不夠買零食啦 (需要 15 🪙)！");
      setShowBubble(true);
      return;
    }

    const newCoins = isDemo ? pet.coins : pet.coins - 15;
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
      coins: newCoins,
      happiness: Math.min(100, pet.happiness + 20)
    };

    savePet(nextState);
    window.dispatchEvent(new CustomEvent("focus_pet_reward", { detail: {} }));

    setDialogue("好呷好呷！EXP +25 🍖✨");
    setShowBubble(true);
  };

  const setPetVisibleState = (visible: boolean) => {
    setIsVisible(visible);
    localStorage.setItem("hub_pet_visible", String(visible));
    window.dispatchEvent(new CustomEvent("pet_visibility_changed", { detail: { visible } }));
  };

  const profile = getPetProfile(pet.level);
  const expPercentage = Math.min(100, Math.round((pet.exp / pet.maxExp) * 100));

  // 🌟 名稱顯示判定：若有自訂名稱優先使用，其次若是自訂頭像則為「自訂專屬守護獸」，最後為等級稱號
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
    return <span style={{ fontSize: size, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}>{profile.icon}</span>;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setPetVisibleState(true)}
        title="點擊呼喚守護獸"
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: `2px solid ${profile.color}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          transition: "transform 0.2s",
          padding: 0,
          overflow: "hidden"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {renderAvatarContent("24px")}
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        userSelect: "none",
        cursor: "grab",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        transition: isDragging.current ? "none" : "left 1.2s cubic-bezier(0.25, 1, 0.5, 1), top 1.2s cubic-bezier(0.25, 1, 0.5, 1)"
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 浮動對話氣泡 */}
      {showBubble && (
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          padding: "5px 10px",
          borderRadius: "10px",
          fontSize: "11px",
          fontWeight: "600",
          color: "#334155",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "160px",
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
            background: "transparent",
            border: "none",
            boxShadow: "none",
            transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
            transition: "transform 0.3s ease",
            padding: "4px"
          }}
          onClick={handlePetClick}
          onDoubleClick={() => setIsExpanded(!isExpanded)}
          title="按一下互動，點兩下展開狀態面板"
        >
          {renderAvatarContent("48px")}
        </div>
      </div>

      {/* 等級與金幣膠囊標籤 */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        color: "#fff",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "bold",
        display: "flex",
        gap: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
      }}>
        <span>Lv.{pet.level}</span>
        <span style={{ color: "#fbbf24" }}>🪙{pet.coins}</span>
      </div>

      {/* 雙擊展開詳細養成卡片 (🌟 已同步顯示自訂名稱) */}
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