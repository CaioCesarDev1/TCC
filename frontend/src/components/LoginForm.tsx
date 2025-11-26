import { FormEvent, useState } from "react";
import { useAuth } from "../modules/auth/AuthContext";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
    return value;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cpfDigits = cpf.replace(/\D/g, "");
    try {
      await login({ cpf: cpfDigits, password: senha });
    } catch (err) {
      setError("CPF ou senha incorretos.");
      console.error("Erro no login", err);
    }
  }

  return (
    <div className="govbr-login-container">
      <div className="govbr-header">
        <div className="govbr-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="4" fill="#1351B4"/>
            <path d="M20 10L25 18H15L20 10Z" fill="white"/>
            <path d="M15 18L20 26L25 18H15Z" fill="white"/>
            <path d="M20 26L15 30H25L20 26Z" fill="white"/>
          </svg>
          <span className="govbr-title">gov.br</span>
        </div>
        <p className="govbr-subtitle">Acesse sua conta gov.br</p>
      </div>

      <form id="login-form" onSubmit={handleSubmit} className="govbr-login-form">
        <div className="govbr-form-group">
          <label htmlFor="cpf" className="govbr-label">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            maxLength={14}
            required
            value={formatCpf(cpf)}
            onChange={(event) => setCpf(event.target.value)}
            placeholder="000.000.000-00"
            className="govbr-input"
            disabled={isLoading}
          />
        </div>

        <div className="govbr-form-group">
          <label htmlFor="senha" className="govbr-label">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            placeholder="Digite sua senha"
            className="govbr-input"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="govbr-alert govbr-alert-error" role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <button type="submit" className="govbr-button-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="govbr-spinner"></span>
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <div className="govbr-help-links">
          <a href="#" className="govbr-link">Esqueci minha senha</a>
          <span className="govbr-separator">•</span>
          <a href="#" className="govbr-link">Criar conta gov.br</a>
        </div>
      </form>

      <div className="govbr-footer">
        <p className="govbr-footer-text">
          Ao continuar, você concorda com os{" "}
          <a href="#" className="govbr-link-footer">Termos de Uso</a> e{" "}
          <a href="#" className="govbr-link-footer">Política de Privacidade</a> do gov.br
        </p>
      </div>
    </div>
  );
}


