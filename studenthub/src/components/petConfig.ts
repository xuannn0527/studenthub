export interface PetState {
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  happiness: number;
}

export const DEFAULT_PET_STATE: PetState = {
  level: 1,
  exp: 0,
  maxExp: 100,
  coins: 50,
  happiness: 100,
};

// 🌟 造型清單定義
export const OUTFITS = [
  { id: "default", name: "預設造型", icon: "🐣", unlockLevel: 1 },
  { id: "scholar", name: "學霸方帽", icon: "🎓", unlockLevel: 3 },
  { id: "fox", name: "靈性學業狐", icon: "🦊", unlockLevel: 5 },
  { id: "crown", name: "榮耀皇冠", icon: "👑", unlockLevel: 7 },
  { id: "dragon", name: "時空守護龍神", icon: "🐉", unlockLevel: 10 },
];

// 🌟 本體動物等級解鎖 Icon
export const getPetProfile = (level: number) => {
  if (level < 4) return { icon: "🐣", title: "初生好奇雛鳥", color: "#eab308" };
  if (level < 7) return { icon: "🦊", title: "靈性學業狐", color: "#f97316" };
  if (level < 10) return { icon: "🦌", title: "專注幻獸鹿", color: "#06b6d4" };
  return { icon: "🐉", title: "時空守護龍神", color: "#8b5cf6" };
};

// 一般互動勵志語錄
export const MOTIVATION_QUOTES = [
  "今天也要元氣滿滿！✨",
  "散步散步～到處巡邏！🐾",
  "專注是通往自由的捷徑 📖",
  "寫完作業我們就可以去玩了！🎮",
  "讀累了嗎？喝口水休息一下 💧",
  "你超棒的，保持這個節奏！🔥",
  "摸摸我～專注力 +100% 💖",
  "呼嚕嚕～好舒服喔 💤"
];

// 專注進行中專屬陪讀語錄
export const FOCUS_QUOTES = [
  "專注的你最棒了！✨",
  "堅持住！再完成一個小階段 💪",
  "不要看手機喔～ 👀",
  "一起加油，我在旁邊陪你！🐾",
  "高效專注中... 🔥"
];