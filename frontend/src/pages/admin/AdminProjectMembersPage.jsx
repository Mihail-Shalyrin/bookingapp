import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function AdminProjectMembersPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [membersSearch, setMembersSearch] = useState("");
  const [candidatesSearch, setCandidatesSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadAll();
  }, [projectId]);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadMembers(), loadCandidates()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(name) {
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get(`/api/projects/${projectId}/users`, { params });
      setMembers(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  async function loadCandidates(name) {
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get(
        `/api/admin/projects/${projectId}/users/search`,
        { params }
      );
      setCandidates(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  async function addUser(userId, username) {
    try {
      await api.post("/api/admin/projects/users", {
        userId: userId,
        projectId: Number(projectId),
      });
      setMessage({ type: "ok", text: `Пользователь ${username} добавлен в проект` });
      loadAll();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  async function removeUser(userId, username) {
    if (!confirm(`Убрать ${username} из проекта?`)) return;

    try {
      await api.delete(`/api/admin/projects/${projectId}/users/${userId}`);
      setMessage({ type: "ok", text: `Пользователь ${username} удалён из проекта` });
      loadAll();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  function onMembersSearch(e) {
    e.preventDefault();
    loadMembers(membersSearch.trim());
  }

  function onCandidatesSearch(e) {
    e.preventDefault();
    loadCandidates(candidatesSearch.trim());
  }

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => navigate(`/admin/projects/${projectId}`)}
        style={{ marginBottom: 16 }}
      >
        ← К проекту
      </button>

      <h2>Участники проекта</h2>

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

      {!loading && (
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>

          {/* В проекте */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <h3>В проекте ({members.length})</h3>

            <form onSubmit={onMembersSearch} style={{ marginBottom: 12, display: "flex", gap: 8 }}>
              <input
                placeholder="Поиск"
                value={membersSearch}
                onChange={(e) => setMembersSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit">Найти</button>
              <button type="button" onClick={() => { setMembersSearch(""); loadMembers(); }}>
                Сбросить
              </button>
            </form>

            {members.length === 0 ? (
              <p style={{ color: "gray" }}>Никого не найдено.</p>
            ) : (
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
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{m.username}</strong>
                      {m.lastname && (
                        <span style={{ color: "#666" }}> — {m.lastname}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeUser(m.id, m.username)}
                      style={{
                        padding: "6px 12px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fca5a5",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Убрать
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Можно добавить */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <h3>Не в проекте ({candidates.length})</h3>

            <form onSubmit={onCandidatesSearch} style={{ marginBottom: 12, display: "flex", gap: 8 }}>
              <input
                placeholder="Поиск"
                value={candidatesSearch}
                onChange={(e) => setCandidatesSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit">Найти</button>
              <button type="button" onClick={() => { setCandidatesSearch(""); loadCandidates(); }}>
                Сбросить
              </button>
            </form>

            {candidates.length === 0 ? (
              <p style={{ color: "gray" }}>Никого не найдено.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {candidates.map((u) => (
                  <li
                    key={u.id}
                    style={{
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 4,
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{u.username}</strong>
                      {u.lastname && (
                        <span style={{ color: "#666" }}> — {u.lastname}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addUser(u.id, u.username)}
                      style={{
                        padding: "6px 12px",
                        background: "#d1fae5",
                        color: "#065f46",
                        border: "1px solid #6ee7b7",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Добавить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
}