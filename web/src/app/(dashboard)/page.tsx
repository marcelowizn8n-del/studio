"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          router.push("/login");
          router.refresh();
          return;
        }

        const data = await response.json();
        if (mounted) {
          setUser(data);
        }
      } catch (error) {
        router.push("/login");
        router.refresh();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main style={{ padding: "48px", fontFamily: "var(--font-body)" }}>
        <h1>Carregando sessão...</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        color: "#172033",
        padding: "32px",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#2f6fdd",
                marginBottom: "10px",
              }}
            >
              Studio ThinkingTools
            </div>
            <h1 style={{ margin: 0, fontSize: "34px" }}>
              Área autenticada funcionando
            </h1>
            <p style={{ marginTop: "10px", color: "#5f6f89", maxWidth: "760px" }}>
              Seu frontend Next.js agora usa login real, cookies HttpOnly e
              validação de sessão via FastAPI.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              height: "44px",
              padding: "0 18px",
              borderRadius: "12px",
              border: "1px solid rgba(42,55,82,0.16)",
              background: "#ffffff",
              color: "#172033",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Sair
          </button>
        </header>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(42,55,82,0.12)",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Sessão atual</h2>
          <div style={{ display: "grid", gap: "10px", color: "#334155" }}>
            <div><strong>ID:</strong> {user?.id}</div>
            <div><strong>Nome:</strong> {user?.full_name}</div>
            <div><strong>E-mail:</strong> {user?.email}</div>
            <div><strong>Ativo:</strong> {user?.is_active ? "Sim" : "Não"}</div>
            <div><strong>Criado em:</strong> {user?.created_at}</div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <Link
            href="/projects"
            style={{
              textDecoration: "none",
              color: "#172033",
              background: "#ffffff",
              border: "1px solid rgba(42,55,82,0.12)",
              borderRadius: "18px",
              padding: "20px",
              display: "block",
            }}
          >
            <strong>Projetos</strong>
            <div style={{ marginTop: "8px", color: "#5f6f89" }}>
              Próximo passo: CRUD de projetos.
            </div>
          </Link>

          <Link
            href="/settings"
            style={{
              textDecoration: "none",
              color: "#172033",
              background: "#ffffff",
              border: "1px solid rgba(42,55,82,0.12)",
              borderRadius: "18px",
              padding: "20px",
              display: "block",
            }}
          >
            <strong>Configurações</strong>
            <div style={{ marginTop: "8px", color: "#5f6f89" }}>
              Próximo passo: gestão de conta e preferências.
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
