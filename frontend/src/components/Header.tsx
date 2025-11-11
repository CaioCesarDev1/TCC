import { useAuth } from "../modules/auth/AuthContext";
import { formatCpf } from "../utils/formatters";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <span className="logo-titulo">Portal Saúde Digital</span>
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


