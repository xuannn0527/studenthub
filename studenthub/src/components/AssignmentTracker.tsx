import React, { useState } from "react";

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export default function AssignmentTracker() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("hub_assignments");
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated = [...assignments, { id: Date.now().toString(), title, dueDate, completed: false }];
    setAssignments(updated);
    localStorage.setItem("hub_assignments", JSON.stringify(updated));
    setTitle("");
    setDueDate("");
  };

  const handleToggle = (id: string) => {
    const updated = assignments.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a));
    setAssignments(updated);
    localStorage.setItem("hub_assignments", JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    localStorage.setItem("hub_assignments", JSON.stringify(updated));
  };

  return (
    <div>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="作業或待辦事項"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
        />
        <button
          type="submit"
          style={{ padding: "6px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          新增作業
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
        {assignments.length === 0 ? (
          <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px" }}>
            尚無作業項目
          </div>
        ) : (
          assignments.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: item.completed ? "#f8fafc" : "#ffffff",
                opacity: item.completed ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item.id)}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "bold", textDecoration: item.completed ? "line-through" : "none" }}>
                    {item.title}
                  </div>
                  {item.dueDate && (
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      截止：{item.dueDate.replace("T", " ")}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ border: "none", background: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}