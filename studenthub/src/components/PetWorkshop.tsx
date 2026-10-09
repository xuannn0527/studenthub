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

interface Quest {
  id: string;
  title: string;
  desc: string;
  rewardExp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  progress: number;
  maxProgress: number;
}

const DEFAULT_QUESTS: Quest[] = [
  { id: "q1", title: "晨間點名", desc: "打開並查看一次今日課表", rewardExp: 20, rewardCoins: 10, completed: true, claimed: false, progress: 1, maxProgress: 1 },
  { id: "q2", title: "深度專注者", desc: "完成 2 輪番茄鐘專注 (25分鐘/輪)", rewardExp: 60, rewardCoins: 30, completed: false, claimed: false, progress: 0, maxProgress: 2 },
  { id: "q3", title: "課業終結者", desc: "勾選完成 1 項作業或待辦事項", rewardExp: 40, rewardCoins: 20, completed: false, claimed: false, progress: 0, maxProgress: 1 },
  { id: "q4", title: "飽食大師", desc: "在工坊內餵食守護獸 1 次零食", rewardExp: 30, rewardCoins: 15, completed: false, claimed: false, progress: 0, maxProgress: 1 },
];

const FOODS = [
  { id: "f1", name: "活力小餅乾", icon: "🍪", cost: 10, exp: 20, desc: "酥脆可口，恢復基本元氣" },
  { id: "f2", name: "香烤大雞腿", icon: "🍗", cost: 25, exp: 60, desc: "滿滿蛋白質，守護獸最愛" },
  { id: "f3", name: "特級神仙草莓派", icon: "🍰", cost: 50, exp: 140, desc: "奢華甜點，帶來大量成長經驗" },
  { id: "f4", name: "時空星光能量果", icon: "🌟", cost: 100, exp: 320, desc: "蘊含星辰之力，急速提升等級" },
];

// 🌟 新增：造型衣櫃清單
const OUTFITS = [
  { id: "default", name: "預設造型", icon: "🐣", unlockLevel: 1, desc: "初生萌芽的可愛雛鳥造型" },
  { id: "scholar", name: "學霸方帽", icon: "🎓", unlockLevel: 3, desc: "象徵認真學習與智慧的學者帽" },
  { id: "fox", name: "靈性學業狐", icon: "🦊", unlockLevel: 5, desc: "敏捷聰明的小狐狸造型" },
  { id: "crown", name: "榮耀皇冠", icon: "👑", unlockLevel: 7, desc: "專注力滿點的王者榮耀象徵" },
  { id: "dragon", name: "時空守護龍神", icon: "🐉", unlockLevel: 10, desc: "終極進化，擁有強大時空之力的神龍" },
];

const getPetProfile = (level: number, currentOutfitId: string) => {
  // 如果玩家有裝備特定造型，優先使用該造型的外觀
  const outfit = OUTFITS.find(o => o.id === currentOutfitId);
  if (outfit && level >= outfit.unlockLevel) {
    let title = "初生好奇雛鳥";
    let color = "#eab308";
    if (level >= 10) { title = "時空守護龍神"; color = "#8b5cf6"; }
    else if (level >= 7) { title = "專注幻獸鹿"; color = "#06b6d4"; }
    else if (level >= 5) { title = "靈性學業狐"; color = "#f97316"; }
    else if (level >= 3) { title = "資深學霸精靈"; color = "#3b82f6"; }
    return { icon: outfit.icon, title, color };
  }

  // 預設根據等級切換
  if (level < 4) return { icon: "🐣", title: "初生好奇雛鳥", color: "#eab308" };
  if (level < 7) return { icon: "🦊", title: "靈性學業狐", color: "#f97316" };
  if (level < 10) return { icon: "🦌", title: "專注幻獸鹿", color: "#06b6d4" };
  return { icon: "🐉", title: "時空守護龍神", color: "#8b5cf6" };
};

export default function PetWorkshop() {
  const [pet, setPet] = useState<PetState>(() => {
    const saved = localStorage.getItem("hub_focus_pet");
    return saved ? JSON.parse(saved) : DEFAULT_PET_STATE;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("hub_quests");
    return saved ? JSON.parse(saved) : DEFAULT_QUESTS;
  });

  const [message, setMessage] = useState<string>("");
  
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem("hub_is_demo") === "true";
  });

  const [isPetVisible, setIsPetVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem("hub_pet_visible");
    return saved !== null ? saved === "true" : true;
  });

  const [customAvatar, setCustomAvatar] = useState<string | null>(() => {
    return localStorage.getItem("hub_custom_pet_avatar") || null;
  });

  // 🌟 造型穿戴狀態
  const [currentOutfit, setCurrentOutfit] = useState<string>(() => {
    return localStorage.getItem("hub_pet_outfit") || "default";
  });

  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem("hub_custom_pet_name") || "";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSyncVisibility = (e: any) => {
      if (e.detail?.visible !== undefined) {
        setIsPetVisible(e.detail.visible);
      }
    };
    window.addEventListener("pet_visibility_changed", handleSyncVisibility);
    return () => window.removeEventListener("pet_visibility_changed", handleSyncVisibility);
  }, []);

  const togglePetVisibility = () => {
    const next = !isPetVisible;
    setIsPetVisible(next);
    localStorage.setItem("hub_pet_visible", String(next));
    window.dispatchEvent(new CustomEvent("toggle_pet_visibility", { detail: { visible: next } }));
  };

  const updatePet = (newPet: PetState) => {
    setPet(newPet);
    localStorage.setItem("hub_focus_pet", JSON.stringify(newPet));
    window.dispatchEvent(new CustomEvent("focus_pet_reward", { detail: {} }));
  };

  // 🌟 換裝處理函數
  const handleEquipOutfit = (outfitId: string) => {
    setCurrentOutfit(outfitId);
    localStorage.setItem("hub_pet_outfit", outfitId);
    window.dispatchEvent(new CustomEvent("pet_outfit_updated"));
    const outfitObj = OUTFITS.find(o => o.id === outfitId);
    setMessage(`✨ 成功換上新造型：【${outfitObj?.name}】！`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setCustomName(trimmed);
      localStorage.setItem("hub_custom_pet_name", trimmed);
      window.dispatchEvent(new CustomEvent("custom_pet_name_updated"));
      setMessage(`✨ 守護獸已成功改名為「${trimmed}」！`);
    } else {
      setCustomName("");
      localStorage.removeItem("hub_custom_pet_name");
      window.dispatchEvent(new CustomEvent("custom_pet_name_updated"));
      setMessage("🔄 已恢復預設稱號！");
    }
    setIsEditingName(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleStartEditName = () => {
    setNameInput(customName || (customAvatar ? "自訂專屬守護獸" : profile.title));
    setIsEditingName(true);
  };

  const handleImageUploadAndRemoveBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const maxDim = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        const isBgDark = bgR < 60 && bgG < 60 && bgB < 60;
        const tolerance = 40;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r < 65 && g < 65 && b < 65) continue; 

          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          if ((!isBgDark && dist < tolerance) || (r > 240 && g > 240 && b > 240)) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL("image/png");

        try {
          localStorage.setItem("hub_custom_pet_avatar", transparentDataUrl);
          setCustomAvatar(transparentDataUrl);
          window.dispatchEvent(new CustomEvent("custom_pet_avatar_updated"));
          setMessage("✨ 寵物上傳成功！已去背並完整保留黑色細節！");
          setTimeout(() => setMessage(""), 3500);
        } catch {
          alert("圖片過大無法快取，請選擇小於 2MB 的圖片！");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    localStorage.removeItem("hub_custom_pet_avatar");
    localStorage.removeItem("hub_custom_pet_name");
    localStorage.removeItem("hub_pet_outfit");
    setCustomAvatar(null);
    setCustomName("");
    setCurrentOutfit("default");
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.dispatchEvent(new CustomEvent("custom_pet_avatar_updated"));
    window.dispatchEvent(new CustomEvent("custom_pet_name_updated"));
    window.dispatchEvent(new CustomEvent("pet_outfit_updated"));
    setMessage("🔄 已恢復為預設精靈外觀與稱號！");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleToggleDemo = () => {
    if (!isDemoMode) {
      const demoPet: PetState = { ...pet, coins: 9999, happiness: 100 };
      updatePet(demoPet);
      setIsDemoMode(true);
      localStorage.setItem("hub_is_demo", "true");
      setMessage("⚡ DEMO 模式已啟動！金幣已設為 9999，已開啟無限餵食！");
    } else {
      updatePet(DEFAULT_PET_STATE);
      setIsDemoMode(false);
      localStorage.setItem("hub_is_demo", "false");
      setMessage("✅ 已退出 DEMO 模式，守護獸與金幣已恢復正常設定！");
    }
    setTimeout(() => setMessage(""), 3500);
  };

  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.claimed) return;

    let newExp = pet.exp + quest.rewardExp;
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
      coins: pet.coins + quest.rewardCoins,
      happiness: Math.min(100, pet.happiness + 10)
    };

    updatePet(nextPet);

    const updatedQuests = quests.map(q => q.id === questId ? { ...q, claimed: true } : q);
    setQuests(updatedQuests);
    localStorage.setItem("hub_quests", JSON.stringify(updatedQuests));

    setMessage(`🎉 領取成功！獲得 +${quest.rewardExp} EXP 與 +${quest.rewardCoins} 🪙！`);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleBuyFood = (food: typeof FOODS[0]) => {
    if (!isDemoMode && pet.coins < food.cost) {
      alert("金幣不足，可點擊右上角【⚡ DEMO 模式】開啟無限餵食！🪙");
      return;
    }

    let newExp = pet.exp + food.exp;
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
      coins: isDemoMode ? pet.coins : pet.coins - food.cost,
      happiness: Math.min(100, pet.happiness + 20)
    };

    updatePet(nextPet);

    const updatedQuests = quests.map(q => q.id === "q4" ? { ...q, completed: true, progress: 1 } : q);
    setQuests(updatedQuests);
    localStorage.setItem("hub_quests", JSON.stringify(updatedQuests));

    setMessage(`😋 守護獸享用了【${food.name}】，獲得 +${food.exp} EXP！${isDemoMode ? " (DEMO 無限餵食中)" : ""}`);
    setTimeout(() => setMessage(""), 2000);
  };

  const profile = getPetProfile(pet.level, currentOutfit);
  const expPercentage = Math.min(100, Math.round((pet.exp / pet.maxExp) * 100));
  const currentDisplayName = customName || (customAvatar ? "自訂專屬守護獸" : profile.title);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      
      {/* 頂部狀態橫幅卡片 */}
      <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#f8fafc", border: `3px solid ${profile.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {customAvatar ? (
              <img src={customAvatar} alt="pet-avatar" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
            ) : (
              profile.icon
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isEditingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="輸入守護獸名字..."
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1.5px solid #2563eb", fontSize: "16px", fontWeight: "bold", outline: "none", width: "160px" }}
                  />
                  <button onClick={handleSaveName} style={{ padding: "4px 10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>儲存</button>
                  <button onClick={() => setIsEditingName(false)} style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>取消</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>{currentDisplayName}</h2>
                  <button
                    onClick={handleStartEditName}
                    title="點擊修改名稱"
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "2px 4px", borderRadius: "4px", display: "flex", alignItems: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
              )}
              
              <span style={{ backgroundColor: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "99px", fontSize: "12px", fontWeight: "bold" }}>Lv.{pet.level}</span>
            </div>
            <p style={{ margin: "4px 0 10px 0", fontSize: "12px", color: "#64748b" }}>陪伴你每一次專注與學習的守護精靈</p>
            
            <div style={{ width: "240px", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: `${expPercentage}%`, height: "100%", backgroundColor: profile.color, transition: "width 0.3s" }}></div>
            </div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
              經驗進度：{pet.exp} / {pet.maxExp} EXP ({expPercentage}%)
            </div>
          </div>
        </div>

        {/* 控制按鍵區 */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={togglePetVisibility}
            style={{
              padding: "10px 14px",
              backgroundColor: isPetVisible ? "#f1f5f9" : "#eff6ff",
              color: isPetVisible ? "#475569" : "#2563eb",
              border: "1px solid",
              borderColor: isPetVisible ? "#cbd5e1" : "#93c5fd",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {isPetVisible ? "🙈 隱藏桌面寵物" : "👁️ 顯示桌面寵物"}
          </button>

          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fef3c7", padding: "10px 16px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "10px", color: "#b45309", fontWeight: "600" }}>持有金幣</span>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#d97706" }}>🪙 {pet.coins}</span>
          </div>

          <button
            onClick={handleToggleDemo}
            style={{
              padding: "10px 16px",
              backgroundColor: isDemoMode ? "#ef4444" : "#8b5cf6",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: isDemoMode ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(139,92,246,0.3)"
            }}
          >
            {isDemoMode ? "✕ 結束 DEMO" : "⚡ DEMO: 無限金幣"}
          </button>
        </div>

      </div>

      {/* 🌟 守護獸造型衣櫃專區 */}
      <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            👗 守護獸衣櫃與造型解鎖
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            隨著守護獸等級提升，將自動解鎖對應的專屬服飾與頭銜！
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {OUTFITS.map((outfit) => {
            const isUnlocked = pet.level >= outfit.unlockLevel;
            const isEquipped = currentOutfit === outfit.id;

            return (
              <div 
                key={outfit.id} 
                style={{ 
                  padding: "16px", 
                  borderRadius: "12px", 
                  border: isEquipped ? "2px solid #2563eb" : "1px solid #e2e8f0", 
                  backgroundColor: isEquipped ? "#eff6ff" : (isUnlocked ? "#fafafa" : "#f1f5f9"), 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  textAlign: "center", 
                  gap: "8px",
                  opacity: isUnlocked ? 1 : 0.6
                }}
              >
                <span style={{ fontSize: "36px" }}>{outfit.icon}</span>
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b" }}>{outfit.name}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{outfit.desc}</div>

                {isEquipped ? (
                  <span style={{ marginTop: "auto", fontSize: "11px", color: "#2563eb", fontWeight: "bold", padding: "4px 10px", backgroundColor: "#dbeafe", borderRadius: "6px" }}>使用中 ✔</span>
                ) : isUnlocked ? (
                  <button 
                    onClick={() => handleEquipOutfit(outfit.id)}
                    style={{ marginTop: "auto", width: "100%", padding: "6px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    穿戴造型
                  </button>
                ) : (
                  <span style={{ marginTop: "auto", fontSize: "11px", color: "#94a3b8", backgroundColor: "#e2e8f0", padding: "4px 8px", borderRadius: "6px", fontWeight: "600" }}>
                    Lv.{outfit.unlockLevel} 解鎖
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 自訂寵物與去背功能區 */}
      <div style={{ backgroundColor: "#ffffff", padding: "18px 24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "14px", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
            🎨 自訂專屬照片去背
          </h4>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
            上傳自定義角色照片，自動清除底色背景！
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUploadAndRemoveBg}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: "8px 16px", backgroundColor: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            🖼️ 上傳照片自動去背
          </button>

          {(customAvatar || customName || currentOutfit !== "default") && (
            <button
              onClick={handleResetAvatar}
              style={{ padding: "8px 14px", backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              🔄 恢復預設
            </button>
          )}
        </div>
      </div>

      {/* 提示訊息 */}
      {message && (
        <div style={{ backgroundColor: isDemoMode ? "#f5f3ff" : "#ecfdf5", border: isDemoMode ? "1px solid #ddd6fe" : "1px solid #a7f3d0", color: isDemoMode ? "#6d28d9" : "#065f46", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: "bold", textAlign: "center" }}>
          {message}
        </div>
      )}

      {/* 雙欄：任務與餵食 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        
        {/* 📜 冒險任務板 */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            📜 每日專注懸賞榜
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>達成每日學習指標，換取大量成長經驗與金幣！</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {quests.map((q) => (
              <div key={q.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #f1f5f9", backgroundColor: q.claimed ? "#f8fafc" : "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: q.claimed ? "#94a3b8" : "#1e293b" }}>{q.title}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 6px 0" }}>{q.desc}</div>
                  <div style={{ display: "flex", gap: "8px", fontSize: "11px", fontWeight: "600" }}>
                    <span style={{ color: "#2563eb" }}>+{q.rewardExp} EXP</span>
                    <span style={{ color: "#d97706" }}>+{q.rewardCoins} 🪙</span>
                  </div>
                </div>

                {q.claimed ? (
                  <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", padding: "6px 12px" }}>已領取 ✔</span>
                ) : q.completed ? (
                  <button onClick={() => handleClaimQuest(q.id)} style={{ padding: "8px 16px", backgroundColor: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>
                    領取獎勵
                  </button>
                ) : (
                  <span style={{ fontSize: "11px", color: "#94a3b8", backgroundColor: "#f1f5f9", padding: "6px 10px", borderRadius: "6px", fontWeight: "600" }}>
                    進行中 ({q.progress}/{q.maxProgress})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🍖 守護獸補給小舖 */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            🍖 守護獸補給小舖
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>使用專注賺取之金幣購買美食，加速守護獸升級進化！</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {FOODS.map((food) => (
              <div key={food.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px" }}>
                <span style={{ fontSize: "32px" }}>{food.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#1e293b" }}>{food.name}</span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>+{food.exp} EXP</span>
                
                <button 
                  onClick={() => handleBuyFood(food)} 
                  style={{ marginTop: "6px", width: "100%", padding: "6px", backgroundColor: isDemoMode ? "#f5f3ff" : "#ffffff", color: isDemoMode ? "#7c3aed" : "#ea580c", border: isDemoMode ? "1px solid #ddd6fe" : "1px solid #fed7aa", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                >
                  {isDemoMode ? "⚡ 免費無限餵食" : `🪙 ${food.cost} 購買餵食`}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}