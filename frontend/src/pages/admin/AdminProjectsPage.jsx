import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { getErrorText } from "../../utils/errors";
import Modal from "../../components/Modal";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole("SUPERADMIN");

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

  function openCreate() {
    setNewProject({ name: "", description: "" });
    setShowCreate(true);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <h2 style={{ margin: 0 }}>Управление проектами</h2>
        {isSuperAdmin && (
          <button type="submit" onClick={openCreate}>
            + Создать проект
          </button>
        )}
      </div>

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
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>
          Загрузка...
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "#6b7280", padding: 32 }}>
          Проектов нет
        </div>
      )}

      {!loading && projects.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((p) => (
            <li
              key={p.id}
              className="card"
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onClick={() => navigate(`/admin/projects/${p.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                {p.description && (
                  <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
                    {p.description}
                  </div>
                )}
              </div>
              {isSuperAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id, p.name);
                  }}
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fca5a5",
                  }}
                >
                  Удалить
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Создать проект"
      >
        <form
          onSubmit={onCreate}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              Название
            </label>
            <input
              placeholder="Название проекта"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              autoFocus
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              Описание
            </label>
            <textarea
              placeholder="Описание (необязательно)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={4}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={() => setShowCreate(false)}>
              Отмена
            </button>
            <button type="submit">
              Создать
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}