import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function ProjectMembersPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    load();
  }, [projectId]);

  async function load(name) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get(`/api/projects/${projectId}/users`, { params });
      setMembers(data);
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
      <button
        onClick={() => navigate(`/projects/${projectId}/rooms`)}
        style={{ marginBottom: 16 }}
      >
        ← К местам проекта
      </button>

      <h2>Участники проекта</h2>

      <form onSubmit={onSearch} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Поиск по имени"
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

      {!loading && members.length === 0 && (
        <p style={{ color: "gray" }}>Никого не найдено.</p>
      )}

      {!loading && members.length > 0 && (
        <>
          <p style={{ color: "#666", marginBottom: 12 }}>
            Найдено: {members.length}
          </p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {members.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1e40af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}>
                  {m.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div style={{ fontWeight: "bold" }}>{m.username}</div>
                  {m.lastname && (
                    <div style={{ color: "#666", fontSize: 14 }}>{m.lastname}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}