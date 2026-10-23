export interface TodoItem {
  id: string;
  title: string;
  type: "timer" | "habit" | "target";
  timingType: "countdown" | "countup" | "none";
  durationMinutes: number; // 倒計時或預設時間

  // 養習慣專屬欄位
  habitFrequency?: "daily" | "weekly" | "monthly";
  habitTargetAmount?: number;
  habitUnit?: "minutes" | "times";

  // 定目標專屬欄位
  targetDeadline?: string;
  targetTotalAmount?: number;
  targetCurrentAmount?: number;
  targetUnit?: "minutes" | "times";
}

export interface FocusRecord {
  id: string;
  todoId: string;
  todoTitle: string;
  durationMinutes: number;
  timestamp: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
}

export interface BgAdjustment {
  scale: number; // 30 ~ 300 (%)
  posX: number;  // 0 ~ 100 (%)
  posY: number;  // 0 ~ 100 (%)
}

export interface WallpaperItem {
  id: string;
  name: string;
  previewUrl: string;
  url: string;
}