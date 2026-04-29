"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("marcelo@dttools.app");
  const [password, setPassword] = useState("Gulex0519!@Bel1347");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível entrar");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4f7fb",
        color: "#172033",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          border: "1px solid rgba(42,55,82,0.12)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#2f6fdd",
              marginBottom: "12px",
            }}
          >
            Studio ThinkingTools
          </div>
          <h1 style={{ fontSize: "32px", margin: 0, marginBottom: "8px" }}>
            Entrar
          </h1>
          <p style={{ margin: 0, color: "#5f6f89", lineHeight: 1.5 }}>
            Faça login para acessar o painel do seu agente de histórias,
            imagens e vídeos.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#d5dbeb" }}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{
                height: "48px",
                borderRadius: "12px",
                border: "1px solid rgba(42,55,82,0.16)",
                background: "#f8fbff",
                color: "#172033",
                padding: "0 14px",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#d5dbeb" }}>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                height: "48px",
                borderRadius: "12px",
                border: "1px solid rgba(42,55,82,0.16)",
                background: "#f8fbff",
                color: "#172033",
                padding: "0 14px",
                outline: "none",
              }}
            />
          </label>

          {error ? (
            <div
              style={{
                background: "rgba(255, 84, 89, 0.12)",
                color: "#ff8f93",
                border: "1px solid rgba(255, 84, 89, 0.24)",
                padding: "12px 14px",
                borderRadius: "12px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: "50px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
