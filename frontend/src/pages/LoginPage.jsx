import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import { getErrorText } from "../utils/errors";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await login(username, password);
      loginAs(accessToken, refreshToken);
      navigate("/rooms");
    } catch (err) {
  setError(getErrorText(err));
} finally {
  setLoading(false);
}
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: 20,
    }}>
      <div style={{
        background: "white",
        padding: 40,
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: 400,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60,
            height: 60,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}>
            🏢
          </div>
          <h2 style={{ margin: 0, fontSize: 24 }}>Бронирование</h2>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              Логин
            </label>
            <input
              placeholder="Введите логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 13, color: "#374151", fontWeight: 500 }}>
              Пароль
            </label>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 12, marginTop: 8, fontSize: 15 }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          {error && (
            <div className="message message-err" style={{ margin: 0, marginTop: 4 }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}