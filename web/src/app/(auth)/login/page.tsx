"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const inputStyle = {
  height: "54px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(6,14,32,0.58)",
  color: "#ffffff",
  padding: "0 16px",
  outline: "none",
  width: "100%",
} as const;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        background:
          "radial-gradient(circle at 12% 16%, rgba(128,131,255,0.26), transparent 30%), radial-gradient(circle at 86% 76%, rgba(123,208,255,0.18), transparent 34%), #0b1326",
        color: "#dae2fd",
        padding: "32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "14%",
          left: "10%",
          width: "170px",
          height: "170px",
          borderRadius: "42px",
          background: "linear-gradient(135deg, rgba(192,193,255,0.55), rgba(123,208,255,0.16))",
          transform: "rotate(18deg)",
          filter: "blur(0.2px)",
          opacity: 0.38,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "12%",
          bottom: "12%",
          width: "230px",
          height: "230px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 0 80px rgba(128,131,255,0.26) inset",
          opacity: 0.44,
        }}
      />
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(255,255,255,0.055)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderTopColor: "rgba(255,255,255,0.26)",
          borderRadius: "32px",
          padding: "32px",
          boxShadow: "0 0 52px rgba(99,102,241,0.18)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "18%",
            right: "18%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "22px",
              margin: "0 auto 22px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #8083ff, #6f00be)",
              boxShadow: "0 24px 60px rgba(99,102,241,0.24)",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "26px",
              fontFamily: "var(--font-display)",
            }}
          >
            S
          </div>
          <div
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c0c1ff",
              marginBottom: "12px",
            }}
          >
            Studio ThinkingTools
          </div>
          <h1 style={{ fontSize: "34px", margin: 0, marginBottom: "10px", color: "#ffffff" }}>
            Entrar
          </h1>
          <p style={{ margin: 0, color: "#c7c4d7", lineHeight: 1.6 }}>
            Acesse sua forja de ideias, cenas, imagens e vídeos.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c7c4d7", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#c7c4d7", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={inputStyle}
            />
          </label>

          {error ? (
            <div
              style={{
                background: "rgba(255, 180, 171, 0.12)",
                color: "#ffb4ab",
                border: "1px solid rgba(255, 180, 171, 0.24)",
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
              height: "54px",
              borderRadius: "16px",
              border: "none",
              background: loading ? "rgba(144,143,160,0.55)" : "linear-gradient(135deg, #8083ff, #494bd6)",
              color: "#ffffff",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24), 0 18px 36px rgba(73,75,214,0.24)",
              marginTop: "6px",
            }}
          >
            {loading ? "Entrando..." : "Entrar no Studio"}
          </button>
        </form>
      </div>
    </main>
  );
}
