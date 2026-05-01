"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudioFooter, StudioShell } from "@/components/StudioShell";

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
        const response = await fetch("/api/auth/me", { method: "GET", cache: "no-store" });

        if (!response.ok) {
          router.push("/login");
          router.refresh();
          return;
        }

        const data = await response.json();
        if (mounted) setUser(data);
      } catch (error) {
        router.push("/login");
        router.refresh();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSession();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="mf-shell" style={{ display: "grid", placeItems: "center" }}>
        <h1>Carregando sessão...</h1>
      </main>
    );
  }

  return (
    <StudioShell active="dashboard" onLogout={handleLogout} userInitials={user?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}>
      <div className="mf-content" style={{ display: "grid", gap: "72px" }}>
        <section className="mf-glass mf-hero">
          <div className="mf-hero-copy">
            <h1 className="mf-title">Bem-vindo, {user?.full_name?.split(" ")[0] || "Marcelo"}</h1>
            <p className="mf-subtitle">
              Sua forja criativa está pronta. Continue de onde parou ou explore novos horizontes na biblioteca.
            </p>
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", marginTop: "34px" }}>
              <Link className="mf-primary" href="/projects" style={{ display: "inline-flex", alignItems: "center" }}>
                ⊕ Novo Projeto
              </Link>
              <Link className="mf-secondary" href="/projects" style={{ display: "inline-flex", alignItems: "center" }}>
                Ver Estatísticas
              </Link>
            </div>
          </div>
          <div className="mf-hero-art" />
        </section>

        <section className="mf-dashboard-grid">
          <div className="mf-glass mf-dashboard-card">
            <div className="mf-session-header">
              <h2>Detalhes da Sessão</h2>
              <span className="mf-status-pill">
                ATIVA
              </span>
            </div>
            <div className="mf-info-grid">
              <Info label="ID da Sessão" value={`MF-${String(user?.id || 0).padStart(4, "0")}-001X`} />
              <Info label="Nome de Usuário" value={user?.full_name || "Marcelo"} />
              <Info label="E-mail de Acesso" value={user?.email || ""} />
              <Info label="Nível de Acesso" value="Creative Director" accent />
            </div>
          </div>

          <div className="mf-glass mf-dashboard-card">
            <h2 className="mf-card-title">Atalhos</h2>
            <div style={{ display: "grid", gap: "20px" }}>
              <Shortcut href="/projects" title="Projetos" tone="#8083ff" />
              <Shortcut href="/settings" title="Configurações" tone="#ddb7ff" />
              <Shortcut href="/projects" title="Suporte" tone="#7bd0ff" />
            </div>
          </div>
        </section>
      </div>
      <StudioFooter />
    </StudioShell>
  );
}

function Info({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mf-info-item">
      <div className="mf-label">{label}</div>
      <div className={`mf-info-value ${accent ? "accent" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Shortcut({ href, title, tone }: { href: string; title: string; tone: string }) {
  return (
    <Link
      className="mf-shortcut"
      href={href}
      style={{
        ["--shortcut-tone" as string]: tone,
      }}
    >
      <span className="mf-shortcut-main">
        <span className="mf-shortcut-icon">▱</span>
        <span className="mf-shortcut-title">{title}</span>
      </span>
      <span className="mf-shortcut-arrow">›</span>
    </Link>
  );
}
