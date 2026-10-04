import React, { useState, useRef, useMemo, useEffect } from "react";
import html2canvas from "html2canvas";
import ImportModal from "./ImportModal";
import type { Course } from "./TimetableCanvas";
import { DAYS, PERIOD_KEYS, TimetableCanvas } from "./TimetableCanvas";
import TimetableControls from "./TimetableControls";

export type { Course };

export default function Timetable() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("hub_courses");
    if (!saved) return [];
    try {
      const parsed: Course[] = JSON.parse(saved);
      const uniqueMap = new Map<string, Course>();
      parsed.forEach((c) => uniqueMap.set(`${c.day}-${c.period}`, c));
      return Array.from(uniqueMap.values());
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState<Course["day"]>("Mon");
  const [period, setPeriod] = useState<number>(1);
  const [editTargetIds, setEditTargetIds] = useState<string[] | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  // 背景桌布與調色
  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem("hub_bg_image") || null);
  const [bgPosX, setBgPosX] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_pos_x");
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [bgPosY, setBgPosY] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_pos_y");
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [bgZoom, setBgZoom] = useState<number>(() => {
    const saved = localStorage.getItem("hub_bg_zoom");
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  const [cardColor, setCardColor] = useState(() => {
    const savedColor = localStorage.getItem("hub_card_color");
    const hasBg = localStorage.getItem("hub_bg_image");
    return savedColor || (hasBg ? "#ffffff" : "#bfdbfe");
  });
  const [cardOpacity, setCardOpacity] = useState(() => {
    const saved = localStorage.getItem("hub_card_opacity");
    return saved !== null ? parseFloat(saved) : 0.5;
  });
  const [textColor, setTextColor] = useState(() => localStorage.getItem("hub_text_color") || "#000000");

  const exportRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  // 畫面動態縮放：讓課表自適應視窗高度
  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const availableHeight = previewContainerRef.current.clientHeight - 30;
      const targetHeight = isMobileView ? 812 : 720;
      setScaleFactor(availableHeight < targetHeight ? Math.max(0.5, availableHeight / targetHeight) : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isMobileView]);

  // 合併連續課堂
  const mergedCourses = useMemo(() => {
    const merged: Array<{ name: string; classroom: string; day: string; startPeriodKeyIndex: number; span: number; ids: string[] }> = [];
    for (const d of DAYS) {
      const dayCourses = courses.filter((c) => c.day === d);
      dayCourses.sort((a, b) => PERIOD_KEYS.indexOf(a.period) - PERIOD_KEYS.indexOf(b.period));
      
      let current: any = null;
      for (const c of dayCourses) {
        const pKeyIndex = PERIOD_KEYS.indexOf(c.period);
        if (!current) {
          current = { name: c.name, classroom: c.classroom, day: c.day, startPeriodKeyIndex: pKeyIndex, span: 1, ids: [c.id] };
        } else {
          if (current.name === c.name && current.classroom === c.classroom && current.startPeriodKeyIndex + current.span === pKeyIndex) {
            current.span += 1;
            current.ids.push(c.id);
          } else {
            merged.push(current);
            current = { name: c.name, classroom: c.classroom, day: c.day, startPeriodKeyIndex: pKeyIndex, span: 1, ids: [c.id] };
          }
        }
      }
      if (current) merged.push(current);
    }
    return merged;
  }, [courses]);

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editTargetIds) {
      const updated = courses.map((c) => editTargetIds.includes(c.id) ? { ...c, name, classroom } : c);
      setCourses(updated);
      localStorage.setItem("hub_courses", JSON.stringify(updated));
      setEditTargetIds(null);
    } else {
      const exists = courses.some((c) => c.day === day && c.period === period);
      if (exists) {
        alert("此時段已經有排定課程！");
        return;
      }
      const updated = [...courses, { id: Date.now().toString(), name, classroom, day, period }];
      setCourses(updated);
      localStorage.setItem("hub_courses", JSON.stringify(updated));
    }
    setName("");
    setClassroom("");
  };

  const handleDeleteCourse = (idsToDelete: string[]) => {
    const updated = courses.filter((c) => !idsToDelete.includes(c.id));
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    if (editTargetIds && idsToDelete.includes(editTargetIds[0])) {
      setEditTargetIds(null);
      setName("");
      setClassroom("");
    }
  };

  const handleEditClick = (mc: any) => {
    if (!isManageMode) return;
    setName(mc.name);
    setClassroom(mc.classroom);
    setEditTargetIds(mc.ids);
  };

  const handleClearAll = () => {
    if (window.confirm("確定要清空目前課表上的所有課程嗎？")) {
      setCourses([]);
      localStorage.setItem("hub_courses", JSON.stringify([]));
      setEditTargetIds(null);
      setName("");
      setClassroom("");
    }
  };

  const handleImportSuccess = (newCourses: Course[]) => {
    const courseMap = new Map<string, Course>();
    courses.forEach((c) => courseMap.set(`${c.day}-${c.period}`, c));
    newCourses.forEach((c) => courseMap.set(`${c.day}-${c.period}`, c));

    const updated = Array.from(courseMap.values());
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    alert(`🎉 匯入完成！已自動濾除重複堂次，課表已完美合併。`);
  };

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    try {
      const originalTransform = exportRef.current.style.transform;
      const originalBorder = exportRef.current.style.border;
      const originalBorderRadius = exportRef.current.style.borderRadius;
      const originalBoxShadow = exportRef.current.style.boxShadow;

      exportRef.current.style.transform = "none";
      exportRef.current.style.border = "none";
      exportRef.current.style.borderRadius = "0px";
      exportRef.current.style.boxShadow = "none";

      const canvas = await html2canvas(exportRef.current, {
        scale: 3, 
        useCORS: true,
        backgroundColor: bgImage ? null : "#ffffff",
      });

      exportRef.current.style.transform = originalTransform;
      exportRef.current.style.border = originalBorder;
      exportRef.current.style.borderRadius = originalBorderRadius;
      exportRef.current.style.boxShadow = originalBoxShadow;

      const link = document.createElement("a");
      link.download = isMobileView ? "MyTimetable_Mobile_Wallpaper.png" : "MyTimetable_3-4_Wallpaper.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("匯出圖片失敗，請確定背景圖片是否支援 CORS。");
    }
  };

  const updateSettings = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === "hub_card_color") setCardColor(value);
    if (key === "hub_card_opacity") setCardOpacity(parseFloat(value));
    if (key === "hub_text_color") setTextColor(value);
  };

  const updateBgPos = (x: number, y: number, zoom: number) => {
    setBgPosX(x);
    setBgPosY(y);
    setBgZoom(zoom);
    localStorage.setItem("hub_bg_pos_x", String(x));
    localStorage.setItem("hub_bg_pos_y", String(y));
    localStorage.setItem("hub_bg_zoom", String(zoom));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64Str = reader.result as string;
          localStorage.setItem("hub_bg_image", base64Str);
          setBgImage(base64Str);
          setCardColor("#ffffff");
          localStorage.setItem("hub_card_color", "#ffffff");
          updateBgPos(50, 50, 100);
        } catch {
          alert("圖片檔案過大 (建議 2MB 以下)。");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    localStorage.removeItem("hub_bg_image");
    setBgImage(null);
    setCardColor("#bfdbfe");
    localStorage.setItem("hub_card_color", "#bfdbfe");
    updateBgPos(50, 50, 100);
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "32px", 
      alignItems: "center", 
      justifyContent: "center",
      height: "100%", 
      width: "100%", 
      boxSizing: "border-box", 
      overflow: "hidden", 
      position: "relative" 
    }}>
      
      {/* 獨立彈窗 */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* 左側：課表預覽畫布元件 */}
      <div 
        ref={previewContainerRef}
        style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, height: "100%", overflow: "hidden" }}
      >
        <TimetableCanvas
          ref={exportRef}
          isMobileView={isMobileView}
          bgImage={bgImage}
          bgPosX={bgPosX}
          bgPosY={bgPosY}
          bgZoom={bgZoom}
          cardColor={cardColor}
          cardOpacity={cardOpacity}
          textColor={textColor}
          scaleFactor={scaleFactor}
          isManageMode={isManageMode}
          mergedCourses={mergedCourses}
          onEditClick={handleEditClick}
          onDeleteCourse={handleDeleteCourse}
        />
      </div>

      {/* 🌟 右側：精緻緊湊自然卡片（不再強制拉長或變大） */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <TimetableControls
          isMobileView={isMobileView}
          setIsMobileView={setIsMobileView}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          name={name}
          setName={setName}
          classroom={classroom}
          setClassroom={setClassroom}
          day={day}
          setDay={setDay}
          period={period}
          setPeriod={setPeriod}
          editTargetIds={editTargetIds}
          onCancelEdit={() => { setEditTargetIds(null); setName(""); setClassroom(""); }}
          onSaveCourse={handleSaveCourse}
          isManageMode={isManageMode}
          setIsManageMode={setIsManageMode}
          onClearAll={handleClearAll}
          cardColor={cardColor}
          textColor={textColor}
          cardOpacity={cardOpacity}
          onUpdateSettings={updateSettings}
          bgImage={bgImage}
          bgPosX={bgPosX}
          bgPosY={bgPosY}
          bgZoom={bgZoom}
          onUpdateBgPos={updateBgPos}
          onResetBgPos={() => updateBgPos(50, 50, 100)}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onExportImage={handleExportImage}
        />
      </div>

    </div>
  );
}