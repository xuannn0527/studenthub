import { useState, useRef } from "react";
import type { Course } from "./TimetableCanvas";
import { DAYS, DAY_LABELS, PERIOD_KEYS } from "./TimetableCanvas";

const Icons = {
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  monitor: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  smartphone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  import: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <polyline points="9 15 12 18 15 15"></polyline>
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  edit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  palette: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
    </svg>
  ),
  image: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  move: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 9 2 12 5 15"></polyline>
      <polyline points="9 5 12 2 15 5"></polyline>
      <polyline points="15 19 12 22 9 19"></polyline>
      <polyline points="19 9 22 12 19 15"></polyline>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="12" y1="2" x2="12" y2="22"></line>
    </svg>
  )
};

interface TimetableControlsProps {
  isMobileView: boolean;
  setIsMobileView: (v: boolean) => void;
  onOpenImportModal: () => void;
  name: string;
  setName: (v: string) => void;
  classroom: string;
  setClassroom: (v: string) => void;
  day: Course["day"];
  setDay: (v: Course["day"]) => void;
  period: number;
  setPeriod: (v: number) => void;
  editTargetIds: string[] | null;
  onCancelEdit: () => void;
  onSaveCourse: (e: React.FormEvent) => void;
  isManageMode: boolean;
  setIsManageMode: (v: boolean) => void;
  onClearAll: () => void;
  cardColor: string;
  textColor: string;
  cardOpacity: number;
  onUpdateSettings: (key: string, value: string) => void;
  bgImage: string | null;
  bgPosX: number;
  bgPosY: number;
  bgZoom: number;
  onUpdateBgPos: (x: number, y: number, zoom: number) => void;
  onResetBgPos: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onExportImage: () => void;
}

export default function TimetableControls({
  isMobileView,
  setIsMobileView,
  onOpenImportModal,
  name,
  setName,
  classroom,
  setClassroom,
  day,
  setDay,
  period,
  setPeriod,
  editTargetIds,
  onCancelEdit,
  onSaveCourse,
  isManageMode,
  setIsManageMode,
  onClearAll,
  cardColor,
  textColor,
  cardOpacity,
  onUpdateSettings,
  bgImage,
  bgPosX,
  bgPosY,
  bgZoom,
  onUpdateBgPos,
  onResetBgPos,
  onImageUpload,
  onRemoveImage,
  onExportImage
}: TimetableControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🌟 控制微調區塊的展開 / 收合（完成鍵）
  const [isAdjustingPos, setIsAdjustingPos] = useState(true);

  return (
    <div style={{ 
      width: "380px", 
      backgroundColor: "#ffffff", 
      padding: "16px 20px", 
      borderRadius: "16px", 
      border: "1px solid #e2e8f0", 
      boxShadow: "0 4px 16px rgba(0,0,0,0.05)", 
      display: "flex", 
      flexDirection: "column", 
      gap: "10px", 
      flexShrink: 0, 
      boxSizing: "border-box" 
    }}>
      
      {/* 標題列 */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
        <span style={{ color: "#475569" }}>{Icons.settings}</span>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b", letterSpacing: "0.2px" }}>
          課表與外觀設定
        </h3>
      </div>

      {/* 模式切換 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button 
          onClick={() => setIsMobileView(false)} 
          style={{ padding: "8px 10px", backgroundColor: !isMobileView ? "#2563eb" : "#f8fafc", color: !isMobileView ? "#fff" : "#64748b", border: "1px solid", borderColor: !isMobileView ? "#2563eb" : "#e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s" }}
        >
          {Icons.monitor} 3:4 網頁
        </button>
        <button 
          onClick={() => setIsMobileView(true)} 
          style={{ padding: "8px 10px", backgroundColor: isMobileView ? "#1e293b" : "#f8fafc", color: isMobileView ? "#fff" : "#64748b", border: "1px solid", borderColor: isMobileView ? "#1e293b" : "#e2e8f0", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.15s" }}
        >
          {Icons.smartphone} 9:16 手機
        </button>
      </div>

      {/* 智慧匯入按鈕 */}
      <button 
        onClick={onOpenImportModal} 
        style={{ 
          width: "100%",
          padding: "8px 10px", 
          backgroundColor: "#f0fdf4", 
          color: "#16a34a", 
          border: "1px solid #bbf7d0", 
          borderRadius: "8px", 
          fontWeight: "600", 
          cursor: "pointer", 
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "all 0.15s"
        }}
      >
        {Icons.import} 智慧匯入選課清單
      </button>

      <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

      {/* 手動排課表單 */}
      <form onSubmit={onSaveCourse} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", gap: "5px" }}>
            {Icons.plus} {editTargetIds ? "編輯選定課程" : "排定課程"}
          </span>
          {editTargetIds && (
            <button type="button" onClick={onCancelEdit} style={{ fontSize: "11px", color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: "600" }}>
              取消編輯
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "6px" }}>
          <input type="text" placeholder="課程名稱" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px" }} />
          <input type="text" placeholder="教室 (如 BS440)" value={classroom} onChange={(e) => setClassroom(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", fontSize: "12px" }} />
        </div>
        
        {!editTargetIds && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            <select value={day} onChange={(e) => setDay(e.target.value as Course["day"])} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px" }}>
              {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
            </select>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontSize: "12px" }}>
              {PERIOD_KEYS.map((pKey) => (
                <option key={pKey} value={pKey}>
                  {pKey === 9 ? "中午" : `第 ${pKey} 節`}
                </option>
              ))}
            </select>
            <button type="submit" style={{ padding: "6px 10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" }}>
              新增
            </button>
          </div>
        )}

        {editTargetIds && (
          <button type="submit" style={{ padding: "6px 10px", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {Icons.check} 儲存修改
          </button>
        )}
      </form>

      {/* 編輯 / 刪除與清空控制 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        <button onClick={() => setIsManageMode(!isManageMode)} style={{ padding: "6px 10px", backgroundColor: isManageMode ? "#fee2e2" : "#f8fafc", color: isManageMode ? "#ef4444" : "#475569", border: "1px solid", borderColor: isManageMode ? "#fca5a5" : "#e2e8f0", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          {Icons.edit} {isManageMode ? "結束管理" : "管理課程"}
        </button>
        <button onClick={onClearAll} style={{ padding: "6px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
          {Icons.trash} 清空課表
        </button>
      </div>

      <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

      {/* 外觀風格設定 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
          {Icons.palette} 外觀風格
        </span>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>卡片色彩</span>
            <input type="color" value={cardColor} onChange={(e) => onUpdateSettings("hub_card_color", e.target.value)} style={{ border: "none", width: "20px", height: "20px", cursor: "pointer", borderRadius: "4px" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>文字色彩</span>
            <input type="color" value={textColor} onChange={(e) => onUpdateSettings("hub_text_color", e.target.value)} style={{ border: "none", width: "20px", height: "20px", cursor: "pointer", borderRadius: "4px" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f8fafc", padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>透明度 {cardOpacity}</span>
          <input type="range" min="0.1" max="1" step="0.05" value={cardOpacity} onChange={(e) => onUpdateSettings("hub_card_opacity", e.target.value)} style={{ flex: 1, cursor: "pointer" }} />
        </div>

        {/* 上傳 / 移除桌布按鈕列 */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => { onImageUpload(e); setIsAdjustingPos(true); }} style={{ display: "none" }} />
        {bgImage ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            <button 
              onClick={() => setIsAdjustingPos(!isAdjustingPos)} 
              style={{ 
                padding: "6px 8px", 
                backgroundColor: isAdjustingPos ? "#eff6ff" : "#f8fafc", 
                color: isAdjustingPos ? "#2563eb" : "#475569", 
                border: "1px solid", 
                borderColor: isAdjustingPos ? "#93c5fd" : "#e2e8f0", 
                borderRadius: "6px", 
                fontWeight: "600", 
                cursor: "pointer", 
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px"
              }}
            >
              {Icons.move} {isAdjustingPos ? "收合微調 ▲" : "微調位置 ▼"}
            </button>
            <button onClick={onRemoveImage} style={{ padding: "6px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px" }}>
              移除背景圖
            </button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: "7px 10px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {Icons.image} 上傳背景桌布
          </button>
        )}

        {/* 🌟 桌布位置微調區：支援「確認／完成」收合 */}
        {bgImage && isAdjustingPos && (
          <div style={{ backgroundColor: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "6px", animation: "fadeIn 0.15s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
                {Icons.move} 桌布位置微調
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button onClick={onResetBgPos} style={{ border: "none", background: "none", fontSize: "10px", color: "#64748b", cursor: "pointer", textDecoration: "underline" }}>
                  重置
                </button>
                {/* 🌟 確認 / 完成收合按鍵 */}
                <button 
                  onClick={() => setIsAdjustingPos(false)} 
                  style={{ 
                    padding: "2px 8px", 
                    backgroundColor: "#16a34a", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: "4px", 
                    fontSize: "10px", 
                    fontWeight: "700", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px"
                  }}
                  title="完成調整並收合"
                >
                  {Icons.check} 完成
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>水平 (X)</span>
              <input type="range" min="0" max="100" value={bgPosX} onChange={(e) => onUpdateBgPos(Number(e.target.value), bgPosY, bgZoom)} style={{ flex: 1, cursor: "pointer" }} />
              <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgPosX}%</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>垂直 (Y)</span>
              <input type="range" min="0" max="100" value={bgPosY} onChange={(e) => onUpdateBgPos(bgPosX, Number(e.target.value), bgZoom)} style={{ flex: 1, cursor: "pointer" }} />
              <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgPosY}%</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "#64748b", width: "45px" }}>縮放比</span>
              <input type="range" min="100" max="200" step="5" value={bgZoom} onChange={(e) => onUpdateBgPos(bgPosX, bgPosY, Number(e.target.value))} style={{ flex: 1, cursor: "pointer" }} />
              <span style={{ fontSize: "10px", color: "#94a3b8", width: "26px", textAlign: "right" }}>{bgZoom}%</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: "1px", backgroundColor: "#f1f5f9" }}></div>

      {/* 🌟 匯出按鈕：永遠保持在底部清晰可見 */}
      <button 
        onClick={onExportImage} 
        style={{ 
          padding: "10px", 
          backgroundColor: "#ea580c", 
          color: "#ffffff", 
          border: "none", 
          borderRadius: "8px", 
          fontWeight: "700", 
          cursor: "pointer", 
          fontSize: "13px", 
          boxShadow: "0 2px 6px rgba(234,88,12,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.15s"
        }}
      >
        {Icons.download} 匯出桌布圖片
      </button>

    </div>
  );
}