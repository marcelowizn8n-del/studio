"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type VideoPrompts = {
  id: number;
  project_id: number;
  title: string;
  main_prompt: string;
  alt_prompt_1: string | null;
  alt_prompt_2: string | null;
  negative_prompt: string | null;
  motion_notes: string | null;
  camera_notes: string | null;
  transition_notes: string | null;
  sound_notes: string | null;
  pacing_notes: string | null;
  generation_mode: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Project = {
  id: number;
  title: string;
  status: string;
};

type User = {
  id: number;
  email: string;
  full_name: string;
};

export default function VideoPromptsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [prompts, setPrompts] = useState<VideoPrompts | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  async function loadAll() {
    if (!projectId) return;
    setLoading(true);
    setError("");

    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!meRes.ok) {
        router.push("/login");
        router.refresh();
        return;
      }
      setUser(await meRes.json());

      const projRes = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (projRes.ok) {
        setProject(await projRes.json());
      }

      const vpRes = await fetch(`/api/projects/${projectId}/video-prompts`, { cache: "no-store" });
      if (vpRes.ok) {
        setPrompts(await vpRes.json());
      } else if (vpRes.status === 404) {
        setPrompts(null);
      } else {
        const data = await vpRes.json().catch(() => ({}));
        setError(data?.detail || "Falha ao carregar prompts de vídeo");
      }
    } catch (err) {
      setError("Erro de rede ao carregar prompts de vídeo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [projectId]);

  async function handleGenerate() {
    if (!projectId) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/video-prompts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force_regenerate: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.detail || "Falha ao gerar prompts de vídeo");
        return;
      }

      setPrompts(await res.json());
    } catch (err) {
      setError("Erro de rede ao gerar prompts de vídeo");
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fb",
          color: "#172033",
          fontFamily: "var(--font-body)",
        }}
      >
        <div>Carregando prompts de vídeo...</div>
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
                color: "#7c3aed",
                marginBottom: "10px",
              }}
            >
              Studio ThinkingTools
            </div>

            <h1 style={{ margin: 0, fontSize: "32px" }}>Prompts de Vídeo</h1>

            {project ? (
              <p style={{ marginTop: "10px", color: "#5f6f89" }}>
                Projeto: <strong>{project.title}</strong> (status: {project.status})
              </p>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/projects"
              style={{
                textDecoration: "none",
                color: "#172033",
                background: "#ffffff",
                border: "1px solid rgba(42,55,82,0.16)",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              ← Voltar para projetos
            </Link>

            <Link
              href={`/projects/${projectId}/story`}
              style={{
                textDecoration: "none",
                color: "#047857",
                background: "rgba(56,217,169,0.12)",
                border: "1px solid rgba(143,255,194,0.22)",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              História
            </Link>

            <Link
              href={`/projects/${projectId}/image-prompts`}
              style={{
                textDecoration: "none",
                color: "#9a6b00",
                background: "rgba(255,210,90,0.12)",
                border: "1px solid rgba(255,210,90,0.25)",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              Prompts de imagem
            </Link>

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
          </div>
        </header>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(42,55,82,0.12)",
            borderRadius: "20px",
            padding: "24px",
            display: "grid",
            gap: "16px",
          }}
        >
          <div style={{ color: "#5f6f89" }}>
            Usuário autenticado: <strong>{user?.full_name}</strong> ({user?.email})
          </div>

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

          <div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                height: "50px",
                borderRadius: "12px",
                border: "none",
                background: generating ? "#94a3b8" : "#a172ff",
                color: "#ffffff",
                fontWeight: 700,
                cursor: generating ? "not-allowed" : "pointer",
                padding: "0 22px",
              }}
            >
              {generating
                ? "Gerando..."
                : prompts
                ? "Regenerar prompts de vídeo"
                : "Gerar prompts de vídeo"}
            </button>
          </div>
        </section>

        {prompts ? (
          <section style={{ display: "grid", gap: "16px" }}>
            <Block title="Título" content={prompts.title} />
            <Block title="Prompt principal" content={prompts.main_prompt} />
            <Block title="Prompt alternativo 1" content={prompts.alt_prompt_1} />
            <Block title="Prompt alternativo 2" content={prompts.alt_prompt_2} />
            <Block title="Negative prompt" content={prompts.negative_prompt} />
            <Block title="Notas de movimento" content={prompts.motion_notes} />
            <Block title="Notas de câmera" content={prompts.camera_notes} />
            <Block title="Notas de transição" content={prompts.transition_notes} />
            <Block title="Notas de som" content={prompts.sound_notes} />
            <Block title="Notas de pacing" content={prompts.pacing_notes} />

            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(42,55,82,0.12)",
                borderRadius: "16px",
                padding: "16px",
                color: "#7a879c",
                fontSize: "14px",
              }}
            >
              Gerado em: {prompts.created_at} · Modo: {prompts.generation_mode} · Status: {prompts.status}
            </div>
          </section>
        ) : (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid rgba(42,55,82,0.12)",
              borderRadius: "20px",
              padding: "24px",
              color: "#5f6f89",
            }}
          >
            Nenhum prompt de vídeo gerado ainda. Clique em "Gerar prompts de vídeo".
          </section>
        )}
      </div>
    </main>
  );
}

function Block({ title, content }: { title: string; content: string | null | undefined }) {
  if (!content) return null;
  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid rgba(42,55,82,0.12)",
        borderRadius: "18px",
        padding: "20px",
        display: "grid",
        gap: "10px",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "18px", color: "#7c3aed" }}>{title}</h2>
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          color: "#334155",
          fontFamily: "inherit",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        {content}
      </pre>
    </article>
  );
}
