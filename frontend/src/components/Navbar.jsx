import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = hasRole("ADMIN") || hasRole("SUPERADMIN");
  const isSuperAdmin = hasRole("SUPERADMIN");

  return (
    <nav className="navbar">
      <NavLink to="/rooms">Комнаты</NavLink>
      <NavLink to="/my-bookings">Мои брони</NavLink>
      <NavLink to="/my-projects">Мои проекты</NavLink>
      <NavLink to="/my-reserved">Мои резервы</NavLink>

      {isAdmin && (
        <>
          <span className="navbar-divider"></span>
          <NavLink to="/admin/projects" className="admin">Управление проектами</NavLink>
          <NavLink to="/admin/users" className="admin">Резервы сотрудников</NavLink>
          <NavLink to="/admin/employees" className="admin">Брони сотрудников</NavLink>
        </>
      )}

      {isSuperAdmin && (
        <>
          <span className="navbar-divider"></span>
          <NavLink to="/superadmin/users" className="superadmin">Пользователи (SA)</NavLink>
        </>
      )}

      <span className="navbar-spacer"></span>
      <span className="navbar-user">{user.username}</span>
      <button onClick={() => { logout(); navigate("/login"); }}>
        Выйти
      </button>
    </nav>
  );
}