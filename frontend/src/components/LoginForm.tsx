import { FormEvent, useState } from "react";
import { useAuth } from "../modules/auth/AuthContext";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await login({ cpf, password: senha });
    } catch (err) {
      setError("CPF ou senha incorretos.");
      console.error("Erro no login", err);
    }
  }

  return (
    <form id="login-form" onSubmit={handleSubmit} className="login-form">
      <label>
        CPF:
        <input
          id="cpf"
          type="text"
          maxLength={11}
          required
          value={cpf}
          onChange={(event) => setCpf(event.target.value)}
        />
      </label>
      <label>
        Senha:
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
      {error && <span className="error-message">{error}</span>}
    </form>
  );
}


