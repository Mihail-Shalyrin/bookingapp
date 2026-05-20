import { useState, useEffect } from "react";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function SuperAdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    load();
  }, []);

  async function load(name) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get("/api/admin/projects", { params });
      setProjects(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    try {
      await api.post("/api/superadmin/projects", newProject);
      setMessage({ type: "ok", text: "Проект создан" });
      setNewProject({ name: "", description: "" });
      setShowCreate(false);
      load();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  async function onDelete(projectId, projectName) {
    if (!confirm(`Удалить проект "${projectName}"?\nВсе резервы за этим проектом будут сняты, а участники откреплены.`)) return;

    try {
      await api.delete(`/api/superadmin/projects/${projectId}`);
      setMessage({ type: "ok", text: "Проект удалён" });
      load();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load(search.trim());
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Управление проектами</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {showCreate ? "Отмена" : "+ Создать проект"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={onCreate}
          style={{
            padding: 16,
            marginBottom: 16,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <input
            placeholder="Название проекта"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Описание"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows={3}
          />
          <button type="submit" style={{ alignSelf: "flex-start", padding: "8px 16px" }}>
            Создать
          </button>
        </form>
      )}

      <form onSubmit={onSearch} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <button type="submit">Найти</button>
        <button type="button" onClick={() => { setSearch(""); load(); }}>Сбросить</button>
      </form>

      {message && (
        <div style={{
          padding: 8, marginBottom: 12,
          background: message.type === "ok" ? "#d1fae5" : "#fee2e2",
          color: message.type === "ok" ? "#065f46" : "#991b1b",
          borderRadius: 4,
        }}>
          {message.text}
        </div>
      )}

      {loading && <div>Загрузка...</div>}

      {!loading && projects.length === 0 && (
        <p style={{ color: "gray" }}>Проектов нет.</p>
      )}

      {!loading && projects.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((p) => (
            <li
              key={p.id}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{p.name}</div>
                {p.description && (
                  <div style={{ color: "#666", marginTop: 4 }}>{p.description}</div>
                )}
              </div>
              <button
                onClick={() => onDelete(p.id, p.name)}
                style={{
                  padding: "6px 12px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fca5a5",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}