// ==========================================
// 📝 作業與待辦管理型別與工具函式
// ==========================================

export interface AssignmentItem {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD 或 YYYY-MM-DD HH:mm
  completed: boolean;
  category?: string; // 作業 / 考試 / 報告 / 待辦
  difficulty?: "normal" | "elite" | "boss"; // 普通 / 菁英 / Boss
  color?: string; // 邊條顏色
  expReward?: number;
  coinReward?: number;
}

// 邊條色彩配方 (14 款高顏值色票 + 支援任意自訂色彩)
export const ACCENT_COLORS = [
  { id: "blue", name: "天際藍", bar: "#3b82f6", tagBg: "#eff6ff", tagText: "#1d4ed8" },
  { id: "indigo", name: "深靛藍", bar: "#6366f1", tagBg: "#eef2ff", tagText: "#4338ca" },
  { id: "purple", name: "葡萄紫", bar: "#8b5cf6", tagBg: "#f5f3ff", tagText: "#6d28d9" },
  { id: "violet", name: "薰衣草", bar: "#a855f7", tagBg: "#faf5ff", tagText: "#7e22ce" },
  { id: "pink", name: "亮桃粉", bar: "#ec4899", tagBg: "#fdf2f8", tagText: "#be185d" },
  { id: "rose", name: "玫瑰紅", bar: "#f43f5e", tagBg: "#fff1f2", tagText: "#be123c" },
  { id: "red", name: "烈焰赤", bar: "#ef4444", tagBg: "#fef2f2", tagText: "#b91c1c" },
  { id: "orange", name: "晨曦橘", bar: "#f97316", tagBg: "#fff7ed", tagText: "#c2410c" },
  { id: "amber", name: "暖琥珀", bar: "#f59e0b", tagBg: "#fffbeb", tagText: "#b45309" },
  { id: "lime", name: "青檸綠", bar: "#84cc16", tagBg: "#f7fee7", tagText: "#4d7c0f" },
  { id: "emerald", name: "翡翠綠", bar: "#10b981", tagBg: "#ecfdf5", tagText: "#047857" },
  { id: "teal", name: "薄荷青", bar: "#14b8a6", tagBg: "#f0fdfa", tagText: "#0f766e" },
  { id: "sky", name: "蔚藍海", bar: "#0284c7", tagBg: "#f0f9ff", tagText: "#0369a1" },
  { id: "slate", name: "質感墨", bar: "#475569", tagBg: "#f8fafc", tagText: "#334155" },
];

export function getColorTheme(color?: string) {
  if (!color || typeof color !== "string") return ACCENT_COLORS[0];
  const cleanColor = color.trim();
  const matched = ACCENT_COLORS.find(
    (c) => c.id === cleanColor || c.bar.toLowerCase() === cleanColor.toLowerCase()
  );
  if (matched) return matched;
  if (cleanColor.startsWith("#")) {
    const hex = cleanColor.length >= 7 ? cleanColor.slice(0, 7) : cleanColor;
    return {
      id: cleanColor,
      name: "自訂色彩",
      bar: hex,
      tagBg: hex.length === 7 ? `${hex}18` : "rgba(37, 99, 235, 0.1)",
      tagText: hex,
    };
  }
  return ACCENT_COLORS[0];
}

// 預設示範資料
export const DEFAULT_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: "1",
    title: "作業 2",
    dueDate: "2026-10-25 23:59",
    completed: false,
    category: "作業",
    difficulty: "normal",
    color: "blue",
    expReward: 20,
    coinReward: 10,
  },
  {
    id: "2",
    title: "資料結構二元樹實作突破",
    dueDate: "2026-10-27 18:00",
    completed: false,
    category: "作業",
    difficulty: "elite",
    color: "purple",
    expReward: 35,
    coinReward: 20,
  },
  {
    id: "3",
    title: "期中英文口說簡報決戰",
    dueDate: "2026-10-29 12:00",
    completed: false,
    category: "作業",
    difficulty: "boss",
    color: "amber",
    expReward: 60,
    coinReward: 35,
  },
  {
    id: "4",
    title: "物理實驗報告數據解密",
    dueDate: "2026-11-02 23:59",
    completed: false,
    category: "作業",
    difficulty: "normal",
    color: "rose",
    expReward: 30,
    coinReward: 15,
  },
];

// 播放通關經驗音效
export const playVictoryChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [329.63, 392.0, 523.25, 659.25]; // E4, G4, C5, E5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch {}
};

// 日期解析工具：一律回傳 "YYYY-MM-DD"
export const extractDateOnly = (dueDateStr?: string): string => {
  if (!dueDateStr) return "";
  const match = dueDateStr.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, "0");
    const d = match[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return dueDateStr.split(/[T ]/)[0] || "";
};
