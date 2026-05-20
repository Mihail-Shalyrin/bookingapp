import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load(name) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get("/api/projects/me", { params });
      setProjects(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load(search.trim());
  }

  function onReset() {
    setSearch("");
    load();
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Мои проекты</h2>

      <form onSubmit={onSearch} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <button type="submit">Найти</button>
        <button type="button" onClick={onReset}>Сбросить</button>
      </form>

      {message && (
        <div style={{
          padding: 8, marginBottom: 12,
          background: "#fee2e2", color: "#991b1b", borderRadius: 4,
        }}>
          {message.text}
        </div>
      )}

      {loading && <div>Загрузка...</div>}

      {!loading && projects.length === 0 && (
        <p style={{ color: "gray" }}>У вас пока нет проектов.</p>
      )}

      {!loading && projects.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((p) => (
            <li
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}/rooms`)}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                marginBottom: 8,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              <div style={{ fontWeight: "bold", fontSize: 16 }}>{p.name}</div>
              {p.description && (
                <div style={{ color: "#666", marginTop: 4 }}>{p.description}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}