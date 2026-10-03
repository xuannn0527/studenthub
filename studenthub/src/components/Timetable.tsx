import React, { useState } from "react";

export interface Course {
  id: string;
  name: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  period: number;
  classroom: string;
}

const DAYS: Array<Course["day"]> = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_LABELS: Record<Course["day"], string> = {
  Mon: "週一",
  Tue: "週二",
  Wed: "週三",
  Thu: "週四",
  Fri: "週五",
};
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Timetable() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("hub_courses");
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [day, setDay] = useState<Course["day"]>("Mon");
  const [period, setPeriod] = useState<number>(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const exists = courses.some((c) => c.day === day && c.period === period);
    if (exists) {
      alert("此時段已經有排定課程！");
      return;
    }

    const updated = [...courses, { id: Date.now().toString(), name, classroom, day, period }];
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
    setName("");
    setClassroom("");
  };

  const handleDelete = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    localStorage.setItem("hub_courses", JSON.stringify(updated));
  };

  return (
    <div>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="課程名稱"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />
        <input
          type="text"
          placeholder="教室地點"
          value={classroom}
          onChange={(e) => setClassroom(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as Course["day"])}
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>{DAY_LABELS[d]}</option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>第 {p} 節</option>
          ))}
        </select>
        <button
          type="submit"
          style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          新增課程
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "50px repeat(5, 1fr)", gap: "6px", textAlign: "center" }}>
        <div style={{ fontWeight: "bold", fontSize: "12px", color: "#64748b", padding: "6px 0" }}>節次</div>
        {DAYS.map((d) => (
          <div key={d} style={{ fontWeight: "bold", fontSize: "12px", color: "#64748b", padding: "6px 0", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
            {DAY_LABELS[d]}
          </div>
        ))}
        {PERIODS.map((p) => (
          <React.Fragment key={p}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#94a3b8" }}>
              第 {p} 節
            </div>
            {DAYS.map((d) => {
              const course = courses.find((c) => c.day === d && c.period === p);
              return (
                <div
                  key={`${d}-${p}`}
                  style={{
                    minHeight: "48px",
                    padding: "4px",
                    borderRadius: "6px",
                    border: "1px dashed #e2e8f0",
                    backgroundColor: course ? "#eff6ff" : "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {course && (
                    <>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1e293b" }}>{course.name}</span>
                      <span style={{ fontSize: "10px", color: "#64748b" }}>{course.classroom}</span>
                      <button
                        onClick={() => handleDelete(course.id)}
                        style={{ position: "absolute", top: "2px", right: "2px", border: "none", background: "none", color: "#94a3b8", cursor: "pointer", fontSize: "10px" }}
                        title="刪除"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}