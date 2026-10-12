export interface TodoItem {
  id: string;
  title: string;
  type: "timer" | "habit" | "target";
  timingType: "countdown" | "countup" | "none";
  durationMinutes: number;

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