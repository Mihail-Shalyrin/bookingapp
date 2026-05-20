import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function AdminEmployeesPage() {
  const [users, setUsers] = useState([]);
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
      const { data } = await api.get("/api/admin/users", { params });
      setUsers(data);
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
      <h2>Брони сотрудников</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Выберите сотрудника, чтобы просмотреть и управлять его бронями.
      </p>

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

      {!loading && users.length === 0 && (
        <p style={{ color: "gray" }}>Сотрудников не найдено.</p>
      )}

      {!loading && users.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => (
            <li
              key={u.id}
              onClick={() => navigate(`/admin/employees/${u.id}/bookings`)}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                marginBottom: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#dbeafe", color: "#1e40af",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold",
              }}>
                {u.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>{u.username}</div>
                {u.lastname && (
                  <div style={{ color: "#666", fontSize: 14 }}>{u.lastname}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}