"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  full_name: string;
};

type Project = {
  id: number;
  title: string;
  description: string | null;
  status: "draft" | "active" | "archived";
};

type Story = {
  id: number | null;
  project_id: number;
  title: string | null;
  logline: string | null;
  synopsis: string | null;
  opening: string | null;
  development: string | null;
  ending: string | null;
  full_story_text: string | null;
  generation_mode: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function ProjectStoryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [story, setStory] = useState<Story | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectResponse, storyResponse] = await Promise.all([
        fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}`, { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}/story`, { method: "GET", cache: "no-store" }),
      ]);

      if (!meResponse.ok) {
        router.push("/login");
        router.refresh();
        return;
      }

      if (!projectResponse.ok) {
        setError("Projeto não encontrado");
        setLoading(false);
        return;
      }

      if (!storyResponse.ok) {
        setError("Não foi possível carregar a história");
        setLoading(false);
        return;
      }

      const meData = await meResponse.json();
      const projectData = await projectResponse.json();
      const storyData = await storyResponse.json();

      setUser(meData);
      setProject(projectData);
      setStory(storyData);
    } catch (err) {
      setError("Erro inesperado ao carregar a história");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  async function handleGenerateStory() {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/story/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force_regenerate: true }),
      });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível gerar a história");
        setGenerating(false);
        return;
      }

      setSuccess("História gerada com sucesso");
      setStory(data);
    } catch (err) {
      setError("Erro inesperado ao gerar a história");
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

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
          background: "#0b1326",
          color: "#dae2fd",
          fontFamily: "var(--font-body)",
        }}
      >
        <div>Carregando história...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1326",
        color: "#dae2fd",
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
                color: "#c0c1ff",
                marginBottom: "10px",
              }}
            >
              Studio ThinkingTools
            </div>

            <h1 style={{ margin: 0, fontSize: "34px" }}>História do projeto</h1>

            <p style={{ marginTop: "10px", color: "#c7c4d7", maxWidth: "760px" }}>
              Gere uma história base a partir do briefing já salvo no projeto.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={`/projects/${projectId}/briefing`}
              style={{
                textDecoration: "none",
                color: "#dae2fd",
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: "16px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              Voltar ao briefing
            </Link>

            <button
              onClick={handleLogout}
              style={{
                height: "44px",
                padding: "0 18px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.055)",
                color: "#dae2fd",
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
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "24px",
            padding: "24px",
            display: "grid",
            gap: "10px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>{project?.title}</h2>
          <div style={{ color: "#dae2fd" }}>
            <strong>Status:</strong> {project?.status}
          </div>
          <div style={{ color: "#dae2fd" }}>
            <strong>Usuário:</strong> {user?.full_name} ({user?.email})
          </div>
          <div style={{ color: "#c7c4d7" }}>
            {project?.description || "Sem descrição do projeto"}
          </div>
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "24px",
            padding: "24px",
            display: "grid",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>História gerada</h2>

            <button
              onClick={handleGenerateStory}
              disabled={generating}
              style={{
                height: "46px",
                borderRadius: "16px",
                border: "none",
                background: generating ? "#908fa0" : "#8083ff",
                color: "#ffffff",
                fontWeight: 700,
                cursor: generating ? "not-allowed" : "pointer",
                padding: "0 18px",
              }}
            >
              {generating ? "Gerando..." : "Gerar história"}
            </button>
          </div>

          {error ? (
            <div
              style={{
                background: "rgba(255, 84, 89, 0.12)",
                color: "#ffb4ab",
                border: "1px solid rgba(255, 84, 89, 0.24)",
                padding: "12px 14px",
                borderRadius: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                background: "rgba(56, 217, 169, 0.12)",
                color: "#7ff0c4",
                border: "1px solid rgba(56, 217, 169, 0.24)",
                padding: "12px 14px",
                borderRadius: "16px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          ) : null}

          {!story?.title ? (
            <div
              style={{
                background: "rgba(6,14,32,0.58)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "20px",
                color: "#c7c4d7",
              }}
            >
              Ainda não existe história gerada para este projeto.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{story.title}</h3>
                <div style={{ color: "#908fa0", fontSize: "14px" }}>
                  modo: {story.generation_mode || "n/d"} • status: {story.status || "n/d"}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Logline</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{story.logline || "Sem logline"}</p>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Sinopse</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{story.synopsis || "Sem sinopse"}</p>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Abertura</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{story.opening || "Sem abertura"}</p>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Desenvolvimento</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{story.development || "Sem desenvolvimento"}</p>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Encerramento</h3>
                <p style={{ margin: 0, lineHeight: 1.7 }}>{story.ending || "Sem encerramento"}</p>
              </div>

              <div
                style={{
                  background: "rgba(6,14,32,0.58)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Texto completo</h3>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    margin: 0,
                    lineHeight: 1.7,
                    color: "#dae2fd",
                  }}
                >
                  {story.full_story_text || "Sem texto completo"}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
