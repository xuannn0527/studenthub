import { useState, useEffect, useRef } from "react";
import type { TodoItem, BgAdjustment, WallpaperItem } from "./pomodoroTypes";
import { pomodoroAudio, type AmbientSoundType } from "./PomodoroAudio";

// 精選 8 款 1080p 高清桌布 (Unsplash 經常用高畫質自然與專注美學)
const DEFAULT_WALLPAPERS: WallpaperItem[] = [
  {
    id: "dark_minimal",
    name: "極簡深灰",
    previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "starry_sky",
    name: "深夜星空",
    previewUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&q=80",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "forest",
    name: "靜謐森林",
    previewUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=80",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "cafe",
    name: "溫馨咖啡廳",
    previewUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "sunset_ocean",
    name: "靜海夕陽",
    previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "rainy_glass",
    name: "玻璃雨滴",
    previewUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&q=80",
    url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "lofi_room",
    name: "Lofi 復古房間",
    previewUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=85&auto=format&fit=crop",
  },
  {
    id: "snow_mountain",
    name: "雪山晨曦",
    previewUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=80",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85&auto=format&fit=crop",
  },
];

const SOUND_LIST: { id: AmbientSoundType; name: string; icon: string }[] = [
  { id: "rain", name: "窗外雨聲", icon: "🌧" },
  { id: "birds", name: "森林鳥鳴", icon: "🌲" },
  { id: "cafe", name: "咖啡廳環境音", icon: "☕" },
  { id: "waves", name: "岸邊海浪", icon: "🌊" },
  { id: "lofi", name: "Lofi 輕音樂", icon: "🎵" },
];

interface PomodoroFullScreenProps {
  todo: TodoItem;
  onExit: () => void;
  onRecordCompleted: (actualMinutes: number) => void;
}

export default function PomodoroFullScreen({
  todo,
  onExit,
  onRecordCompleted,
}: PomodoroFullScreenProps) {
  // ⚡ Demo 快速測試模式
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem("hub_pomodoro_demo_mode") === "true";
  });

  // 模式狀態：專注 (focus) 或 休息 (break)
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(1);

  // 取得初始倒數秒數
  const getInitialSeconds = (isBreak: boolean, demo: boolean) => {
    if (demo) {
      return isBreak ? 2 : 5;
    }
    if (isBreak) {
      return 5 * 60; // 5 分鐘休息
    }
    return todo.timingType === "countdown" ? Math.max(1, todo.durationMinutes) * 60 : 0;
  };

  const [seconds, setSeconds] = useState<number>(() =>
    getInitialSeconds(false, isDemoMode)
  );

  // 白噪音播放器狀態
  const [soundTrack, setSoundTrack] = useState<AmbientSoundType | null>(() => {
    return (localStorage.getItem("hub_pomodoro_sound_track") as AmbientSoundType) || "rain";
  });
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem("hub_pomodoro_sound_vol");
    return saved !== null ? Number(saved) : 0.6;
  });

  // 音量初始化與同步
  useEffect(() => {
    pomodoroAudio.setVolume(volume);
    localStorage.setItem("hub_pomodoro_sound_vol", volume.toString());
  }, [volume]);

  // 切換白噪音
  const toggleSound = (type: AmbientSoundType) => {
    if (isSoundPlaying && soundTrack === type) {
      pomodoroAudio.stopSound();
      setIsSoundPlaying(false);
    } else {
      setSoundTrack(type);
      localStorage.setItem("hub_pomodoro_sound_track", type);
      pomodoroAudio.playSound(type);
      setIsSoundPlaying(true);
    }
  };

  // 桌布選擇狀態
  const [activeWallpaperId, setActiveWallpaperId] = useState<string>(() => {
    return localStorage.getItem("hub_pomodoro_wallpaper") || "dark_minimal";
  });
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(() => {
    return localStorage.getItem("hub_pomodoro_custom_bg") || null;
  });

  // 圖像微調面板狀態 (縮放 30%~300%, X軸 0%~100%, Y軸 0%~100%)
  const [bgAdjust, setBgAdjust] = useState<BgAdjustment>(() => {
    const saved = localStorage.getItem("hub_pomodoro_custom_bg_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { scale: 100, posX: 50, posY: 50 };
  });

  // 控制面板展開狀態
  const [activePanel, setActivePanel] = useState<"sound" | "wallpaper" | "adjust" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // 掛載時自動全螢幕
  useEffect(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  // 當 Demo 模式切換時重設秒數
  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem("hub_pomodoro_demo_mode", String(next));
    setSeconds(getInitialSeconds(mode === "break", next));
    showToast(next ? "⚡ 已開啟 Demo 測試模式 (專注 5s / 休息 2s)" : "⏱ 已恢復標準時間");
  };

  // 壁紙儲存與切換
  const handleSelectWallpaper = (wpId: string) => {
    setActiveWallpaperId(wpId);
    setCustomBgUrl(null);
    localStorage.setItem("hub_pomodoro_wallpaper", wpId);
    localStorage.removeItem("hub_pomodoro_custom_bg");
  };

  // 本機圖片上傳 (5MB 限制)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ 圖片大小需在 5MB 以內！");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      try {
        localStorage.setItem("hub_pomodoro_custom_bg", base64);
        setCustomBgUrl(base64);
        setActiveWallpaperId("custom");
        showToast("🎨 自訂背景圖片上傳成功！");
      } catch {
        alert("⚠️ 儲存空間已滿，未能將 Base64 寫入 localStorage，但當前專注階段有效。");
        setCustomBgUrl(base64);
        setActiveWallpaperId("custom");
      }
    };
    reader.readAsDataURL(file);
  };

  // 儲存微調參數
  const updateBgAdjust = (key: keyof BgAdjustment, val: number) => {
    setBgAdjust((prev) => {
      const next = { ...prev, [key]: val };
      localStorage.setItem("hub_pomodoro_custom_bg_config", JSON.stringify(next));
      return next;
    });
  };

  const resetBgAdjust = () => {
    const resetVal: BgAdjustment = { scale: 100, posX: 50, posY: 50 };
    setBgAdjust(resetVal);
    localStorage.setItem("hub_pomodoro_custom_bg_config", JSON.stringify(resetVal));
    showToast("↺ 圖像微調已重置");
  };

  // 核心自動循環工作流計時器
  useEffect(() => {
    let timer: number | null = null;

    if (!isPaused) {
      timer = window.setInterval(() => {
        setSeconds((prev) => {
          // 1. 休息時間倒數
          if (mode === "break") {
            if (prev <= 1) {
              // 休息結束，鈴聲提醒並自動回到專注模式
              pomodoroAudio.playChime("rest_end");
              setMode("focus");
              setCycleCount((c) => c + 1);
              showToast("🔔 休息結束！已自動為你開啟下一輪專注 ✨");
              return getInitialSeconds(false, isDemoMode);
            }
            return prev - 1;
          }

          // 2. 專注時間 (倒計時)
          if (todo.timingType === "countdown") {
            if (prev <= 1) {
              // 倒數專注完成！
              const actualMins = isDemoMode ? 1 : Math.max(1, todo.durationMinutes);
              pomodoroAudio.playChime("complete");
              onRecordCompleted(actualMins);

              // 自動切換至休息模式
              setMode("break");
              showToast("🎉 專注完成！獲得獎勵，進入 5 分鐘短暫放鬆 ☕");
              return getInitialSeconds(true, isDemoMode);
            }
            return prev - 1;
          }

          // 3. 正向計時 (累加秒數)
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, mode, isDemoMode, todo, onRecordCompleted]);

  // 手動結算正向計時
  const handleCompleteCountup = () => {
    const actualMins = isDemoMode ? 1 : Math.max(1, Math.floor(seconds / 60));
    pomodoroAudio.playChime("complete");
    onRecordCompleted(actualMins);
    setMode("break");
    setSeconds(getInitialSeconds(true, isDemoMode));
    showToast(`🎉 已完成專注 (${actualMins} 分鐘)！進入休息模式 ☕`);
  };

  // 離開沉浸全螢幕
  const handleExit = () => {
    if (window.confirm("確定要退出沉浸專注模式嗎？")) {
      pomodoroAudio.stopSound();
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      onExit();
    }
  };

  // 背景圖 URL 計算
  const currentWallpaperUrl = customBgUrl
    ? customBgUrl
    : DEFAULT_WALLPAPERS.find((w) => w.id === activeWallpaperId)?.url ||
      DEFAULT_WALLPAPERS[0].url;

  // 格式化秒數
  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 倒數總進度百分比 (用於環狀或底部光條)
  const totalTargetSecs = mode === "break"
    ? (isDemoMode ? 2 : 300)
    : (isDemoMode ? 5 : todo.durationMinutes * 60);
  const progressPercent = todo.timingType === "countdown" || mode === "break"
    ? Math.min(100, Math.max(0, ((totalTargetSecs - seconds) / Math.max(1, totalTargetSecs)) * 100))
    : 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        backgroundColor: "#090d16",
        backgroundImage: `url(${currentWallpaperUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgAdjust.scale}% auto`,
        backgroundPosition: `${bgAdjust.posX}% ${bgAdjust.posY}%`,
        transition: "background-image 0.6s ease-in-out",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 32px",
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 輕量半透明遮罩，保持壁紙高清晰度 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            mode === "break"
              ? "rgba(6, 78, 59, 0.25)"
              : "rgba(0, 0, 0, 0.2)",
          pointerEvents: "none",
        }}
      />

      {/* 頂部通知 Toast */}
      {toastMessage && (
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "700",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            zIndex: 1000000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 頂部操作狀態列 */}
      <header
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* 左側：任務資訊與模式徽章 */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: mode === "break" ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.25)",
              border: `1px solid ${mode === "break" ? "rgba(52, 211, 153, 0.5)" : "rgba(96, 165, 250, 0.5)"}`,
              color: mode === "break" ? "#6ee7b7" : "#93c5fd",
              fontSize: "13px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{mode === "break" ? "☕ SHORT BREAK 休息中" : "🍅 FOCUS 專注中"}</span>
            <span style={{ opacity: 0.7 }}>| 第 {cycleCount} 輪循環</span>
          </div>

          {/* ⚡ Demo 模式標籤與快速切換 */}
          <button
            onClick={toggleDemoMode}
            title="點擊切換 Demo 快速測試模式"
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              backgroundColor: isDemoMode ? "rgba(245, 158, 11, 0.3)" : "rgba(255, 255, 255, 0.08)",
              border: `1px solid ${isDemoMode ? "rgba(245, 158, 11, 0.6)" : "rgba(255, 255, 255, 0.15)"}`,
              color: isDemoMode ? "#fbbf24" : "#94a3b8",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s",
            }}
          >
            <span>⚡ Demo {isDemoMode ? "ON (5s/2s)" : "OFF"}</span>
          </button>
        </div>

        {/* 右側工具選單按鈕組 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 白噪音開關按鈕 */}
          <button
            onClick={() => setActivePanel((p) => (p === "sound" ? null : "sound"))}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activePanel === "sound" || isSoundPlaying ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
              border: `1px solid ${isSoundPlaying ? "rgba(96, 165, 250, 0.5)" : "rgba(255, 255, 255, 0.15)"}`,
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
          >
            <span>🔊</span>
            <span>{isSoundPlaying ? "播放中" : "環境音效"}</span>
          </button>

          {/* 精選壁紙按鈕 */}
          <button
            onClick={() => setActivePanel((p) => (p === "wallpaper" ? null : "wallpaper"))}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activePanel === "wallpaper" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>🖼️</span>
            <span>壁紙庫</span>
          </button>

          {/* 圖像微調面板按鈕 */}
          <button
            onClick={() => setActivePanel((p) => (p === "adjust" ? null : "adjust"))}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: activePanel === "adjust" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span>⚙️</span>
            <span>背景微調</span>
          </button>

          {/* 退出按鈕 */}
          <button
            onClick={handleExit}
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            ✕ 結束專注
          </button>
        </div>
      </header>

      {/* 彈出抽屜控制面板 (白噪音 / 壁紙 / 微調) */}
      {activePanel && (
        <div
          style={{
            position: "absolute",
            top: "84px",
            right: "32px",
            width: "360px",
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(20px)",
            color: "#ffffff",
            zIndex: 100,
          }}
        >
          {/* 1. 白噪音環境音控制 */}
          {activePanel === "sound" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🎧 環境白噪音播放器</h4>
                <button
                  onClick={() => setActivePanel(null)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                {SOUND_LIST.map((s) => {
                  const isActive = isSoundPlaying && soundTrack === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSound(s.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        backgroundColor: isActive ? "rgba(59, 130, 246, 0.35)" : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${isActive ? "rgba(96, 165, 250, 0.5)" : "rgba(255, 255, 255, 0.08)"}`,
                        color: "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "600" }}>
                        <span style={{ fontSize: "18px" }}>{s.icon}</span>
                        <span>{s.name}</span>
                      </div>
                      <span style={{ fontSize: "12px", color: isActive ? "#60a5fa" : "#64748b" }}>
                        {isActive ? "❚❚ 暫停" : "▶ 播放"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 音量控制拉桿 */}
              <div style={{ paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                  <span>音量大小</span>
                  <span style={{ color: "#ffffff", fontWeight: "700" }}>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer", accentColor: "#3b82f6" }}
                />
              </div>
            </div>
          )}

          {/* 2. 精選壁紙庫 */}
          {activePanel === "wallpaper" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>🖼️ 精選高清壁紙</h4>
                <button
                  onClick={() => setActivePanel(null)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  maxHeight: "260px",
                  overflowY: "auto",
                  paddingRight: "4px",
                  marginBottom: "16px",
                }}
              >
                {DEFAULT_WALLPAPERS.map((wp) => {
                  const isSelected = activeWallpaperId === wp.id && !customBgUrl;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => handleSelectWallpaper(wp.id)}
                      style={{
                        position: "relative",
                        height: "76px",
                        borderRadius: "10px",
                        backgroundImage: `url(${wp.previewUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        cursor: "pointer",
                        border: isSelected ? "2px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                        boxShadow: isSelected ? "0 0 12px rgba(59, 130, 246, 0.5)" : "none",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "6px 8px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                        }}
                      />
                      <span
                        style={{
                          position: "relative",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: isSelected ? "#93c5fd" : "#f1f5f9",
                        }}
                      >
                        {wp.name} {isSelected && "✓"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 本機上傳圖片 */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "12px" }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    padding: "9px 0",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px dashed rgba(255, 255, 255, 0.3)",
                    color: "#f1f5f9",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  📁 上傳本機自訂背景 (5MB以內)
                </button>
              </div>
            </div>
          )}

          {/* 3. 圖像微調面板 */}
          {activePanel === "adjust" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>⚙️ 圖像微調面板</h4>
                <button
                  onClick={() => setActivePanel(null)}
                  style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "16px" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 縮放比例 (30% ~ 300%) */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>縮放比例 (Zoom)</span>
                    <span style={{ color: "#ffffff", fontWeight: "700" }}>{bgAdjust.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="5"
                    value={bgAdjust.scale}
                    onChange={(e) => updateBgAdjust("scale", Number(e.target.value))}
                    style={{ width: "100%", cursor: "pointer", accentColor: "#3b82f6" }}
                  />
                </div>

                {/* 水平位置 X 軸 (0% ~ 100%) */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>水平 X 軸位置</span>
                    <span style={{ color: "#ffffff", fontWeight: "700" }}>{bgAdjust.posX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bgAdjust.posX}
                    onChange={(e) => updateBgAdjust("posX", Number(e.target.value))}
                    style={{ width: "100%", cursor: "pointer", accentColor: "#3b82f6" }}
                  />
                </div>

                {/* 垂直位置 Y 軸 (0% ~ 100%) */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                    <span>垂直 Y 軸位置</span>
                    <span style={{ color: "#ffffff", fontWeight: "700" }}>{bgAdjust.posY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bgAdjust.posY}
                    onChange={(e) => updateBgAdjust("posY", Number(e.target.value))}
                    style={{ width: "100%", cursor: "pointer", accentColor: "#3b82f6" }}
                  />
                </div>

                <button
                  onClick={resetBgAdjust}
                  style={{
                    padding: "8px 0",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#cbd5e1",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginTop: "6px",
                  }}
                >
                  ↺ 重置為預設位置
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 頂部全螢幕進度光條 */}
      {todo.timingType === "countdown" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${progressPercent}%`,
            height: "4px",
            backgroundColor: mode === "break" ? "#10b981" : "#3b82f6",
            boxShadow: `0 0 16px ${mode === "break" ? "#10b981" : "#3b82f6"}`,
            zIndex: 9999999,
            transition: "width 0.4s ease",
          }}
        />
      )}

      {/* 中央主沉浸區：直接呈現文字、倒數與控制，無多餘外框 */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* 標題與當前目標 */}
        <h2
          style={{
            fontSize: "46px",
            fontWeight: "800",
            color: "#ffffff",
            margin: "0 0 14px 0",
            letterSpacing: "-0.5px",
            textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.9)",
          }}
        >
          {mode === "break" ? "☕ 深呼吸，讓大腦休息一下" : todo.title}
        </h2>

        <p
          style={{
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.85)",
            margin: "0 0 32px 0",
            fontWeight: "600",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          {mode === "break"
            ? "5 分鐘短暫放鬆，倒數完畢自動開啟下一輪"
            : todo.timingType === "countdown"
            ? `⏱ 沉浸專注倒數 · 目標 ${todo.durationMinutes} 分鐘`
            : "⏱ 自由正向計時 · 隨時可點擊完成結算"}
        </p>

        {/* 超大計時時間字體 */}
        <div
          style={{
            fontSize: "140px",
            fontWeight: "900",
            fontFamily: "'SF Mono', Monaco, Menlo, Consolas, monospace",
            color: mode === "break" ? "#6ee7b7" : "#ffffff",
            lineHeight: 1,
            letterSpacing: "6px",
            textShadow:
              mode === "break"
                ? "0 8px 36px rgba(16, 185, 129, 0.7), 0 2px 10px rgba(0,0,0,0.9)"
                : "0 8px 36px rgba(0, 0, 0, 0.95), 0 2px 12px rgba(0,0,0,0.9)",
            marginBottom: "44px",
          }}
        >
          {formatTime(seconds)}
        </div>

        {/* 控制按鈕組 */}
        <div style={{ display: "flex", justifyContent: "center", gap: "18px", alignItems: "center" }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              padding: "16px 44px",
              borderRadius: "16px",
              backgroundColor: isPaused ? "#10b981" : "rgba(15, 23, 42, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
              transition: "all 0.2s ease",
            }}
          >
            {isPaused ? "▶ 繼續計時" : "❚❚ 暫停"}
          </button>

          {/* 若為正向計時，提供「完成專注」按鈕 */}
          {mode === "focus" && todo.timingType === "countup" && (
            <button
              onClick={handleCompleteCountup}
              style={{
                padding: "16px 36px",
                borderRadius: "16px",
                backgroundColor: "#2563eb",
                border: "none",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.5)",
                transition: "all 0.2s ease",
              }}
            >
              ✓ 完成專注
            </button>
          )}

          {/* 倒計時提早結算按鈕 */}
          {mode === "focus" && todo.timingType === "countdown" && (
            <button
              onClick={() => {
                if (window.confirm("確定要提前結算目前的專注時間嗎？")) {
                  const elapsedSecs = Math.max(1, (todo.durationMinutes * 60) - seconds);
                  const actualMins = Math.max(1, Math.floor(elapsedSecs / 60));
                  pomodoroAudio.playChime("complete");
                  onRecordCompleted(actualMins);
                  setMode("break");
                  setSeconds(getInitialSeconds(true, isDemoMode));
                  showToast(`🎉 已提前結算 (${actualMins} 分鐘)！進入休息模式`);
                }
              }}
              style={{
                padding: "16px 28px",
                borderRadius: "16px",
                backgroundColor: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              ✓ 提前結算
            </button>
          )}
        </div>
      </main>

      {/* 底部狀態說明 */}
      <footer
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
          color: "rgba(255, 255, 255, 0.5)",
          fontSize: "13px",
        }}
      >
        <div>
          <span>💡 提示：原生全螢幕可完全隱藏瀏覽器網址列；專注倒數結束後會自動結算並開始休息</span>
        </div>
        <div>
          <span>{isSoundPlaying ? `🎧 正在播放：${SOUND_LIST.find((s) => s.id === soundTrack)?.name}` : "🔇 白噪音靜音中"}</span>
        </div>
      </footer>
    </div>
  );
}
