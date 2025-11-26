import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { formatCpf } from "../utils/formatters";

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <Link to="/" className="logo-titulo" style={{ textDecoration: "none", color: "inherit" }}>
            Portal Saúde Digital
          </Link>
          {user && (
            <nav className="header-nav">
              <Link
                to="/"
                className={location.pathname === "/" ? "nav-link active" : "nav-link"}
              >
                Dashboard
              </Link>
              <Link
                to="/perfil"
                className={location.pathname === "/perfil" ? "nav-link active" : "nav-link"}
              >
                Meu Perfil
              </Link>
            </nav>
          )}
        </div>
        {user && (
          <div className="user-info-right">
            <div>
              <strong>Bem-vindo, {user.name}</strong>
            </div>
            <div>CPF: {formatCpf(user.cpf)}</div>
            <div>
              <button type="button" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


