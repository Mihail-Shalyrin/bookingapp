import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

const ALL_ROLES = ["USER", "ADMIN", "SUPERADMIN"];

export default function SuperAdminEditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    password: "",
    lastname: "",
    address: "",
    office: "",
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/superadmin/users/${id}`);
      setUser(data);
      setForm({
        password: "",
        lastname: data.lastname || "",
        address: data.address || "",
        office: data.office || "",
        roles: data.roles || [],
      });
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const body = {
      lastname: form.lastname,
      address: form.address,
      office: form.office,
      roles: form.roles,
    };

    // пароль шлём только если ввели
    if (form.password && form.password.trim()) {
      body.password = form.password;
    }

    try {
      await api.put(`/api/superadmin/users/${id}`, body);
      setMessage({ type: "ok", text: "Изменения сохранены" });
      setTimeout(() => navigate("/superadmin/users"), 1000);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  function toggleRole(role) {
    if (form.roles.includes(role)) {
      setForm({ ...form, roles: form.roles.filter(r => r !== role) });
    } else {
      setForm({ ...form, roles: [...form.roles, role] });
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (!user) return <div style={{ padding: 24 }}>Пользователь не найден</div>;

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <button onClick={() => navigate("/superadmin/users")} style={{ marginBottom: 16 }}>
        ← К списку
      </button>

      <h2>Редактирование: {user.username}</h2>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Username (не меняется):
          <input value={user.username} disabled style={{ width: "100%", marginTop: 4 }} />
        </label>

        <label>
          Новый пароль (оставь пустым, чтобы не менять):
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Фамилия:
          <input
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Адрес:
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Офис:
          <input
            value={form.office}
            onChange={(e) => setForm({ ...form, office: e.target.value })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <div>
          <div style={{ marginBottom: 6 }}>Роли:</div>
          {ALL_ROLES.map((role) => (
            <label key={role} style={{ marginRight: 16 }}>
              <input
                type="checkbox"
                checked={form.roles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              {" "}{role}
            </label>
          ))}
        </div>

        <button type="submit" style={{ padding: "10px 16px", alignSelf: "flex-start" }}>
          Сохранить
        </button>

        {message && (
          <div style={{
            padding: 8,
            background: message.type === "ok" ? "#d1fae5" : "#fee2e2",
            color: message.type === "ok" ? "#065f46" : "#991b1b",
            borderRadius: 4,
          }}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}