import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { getErrorText } from "../../utils/errors";
import Modal from "../../components/Modal";
const ALL_ROLES = ["USER", "ADMIN", "SUPERADMIN"];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    lastname: "",
    address: "",
    office: "",
    roles: ["USER"],
  });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    load();
  }, []);

  async function load(name) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (name) params.name = name;
      const { data } = await api.get("/api/superadmin/users", { params });
      setUsers(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    try {
      await api.post("/api/superadmin/users", newUser);
      setMessage({ type: "ok", text: "Пользователь создан" });
      setNewUser({
        username: "", password: "", lastname: "",
        address: "", office: "", roles: ["USER"],
      });
      setShowCreate(false);
      load();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  async function onDelete(userId, username) {
    if (!confirm(`Удалить пользователя "${username}"?`)) return;

    try {
      await api.delete(`/api/superadmin/users/${userId}`);
      setMessage({ type: "ok", text: "Пользователь удалён" });
      load();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load(search.trim());
  }

  function toggleRole(role) {
    if (newUser.roles.includes(role)) {
      setNewUser({ ...newUser, roles: newUser.roles.filter(r => r !== role) });
    } else {
      setNewUser({ ...newUser, roles: [...newUser.roles, role] });
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Управление пользователями</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {showCreate ? "Отмена" : "+ Создать пользователя"}
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
            placeholder="Username (логин)"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <input
            placeholder="Фамилия"
            value={newUser.lastname}
            onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
          />
          <input
            placeholder="Адрес"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
          />
          <input
            placeholder="Офис"
            value={newUser.office}
            onChange={(e) => setNewUser({ ...newUser, office: e.target.value })}
          />
          <div>
            <span style={{ marginRight: 12 }}>Роли:</span>
            {ALL_ROLES.map((role) => (
              <label key={role} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={newUser.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {" "}{role}
              </label>
            ))}
          </div>
          <button type="submit" style={{ alignSelf: "flex-start", padding: "8px 16px" }}>
            Создать
          </button>
        </form>
      )}

      <form onSubmit={onSearch} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <input
          placeholder="Поиск по имени"
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

      {!loading && users.length === 0 && (
        <p style={{ color: "gray" }}>Пользователей нет.</p>
      )}

      {!loading && users.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((u) => {
            const isSelf = currentUser?.username === u.username;
            return (
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
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "#dbeafe", color: "#1e40af",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold",
                  }}>
                    {u.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {u.username}
                      {isSelf && <span style={{ color: "#888", fontSize: 12 }}> (вы)</span>}
                    </div>
                    {u.lastname && (
                      <div style={{ color: "#666", fontSize: 14 }}>{u.lastname}</div>
                    )}
                    {u.roles?.length > 0 && (
                      <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                        {u.roles.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => navigate(`/superadmin/users/${u.id}/edit`)}
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                  >
                    Редактировать
                  </button>
                  {!isSelf && (
                    <button
                      onClick={() => onDelete(u.id, u.username)}
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
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}