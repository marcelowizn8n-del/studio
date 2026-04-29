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

type ImagePrompts = {
  id: number | null;
  project_id: number;
  title: string | null;
  main_prompt: string | null;
  alt_prompt_1: string | null;
  alt_prompt_2: string | null;
  negative_prompt: string | null;
  composition_notes: string | null;
  lighting_notes: string | null;
  style_notes: string | null;
  subject_notes: string | null;
  generation_mode: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function ProjectImagePromptsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [imagePrompts, setImagePrompts] = useState<ImagePrompts | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectResponse, promptsResponse] = await Promise.all([
        fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}`, { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}/image-prompts`, { method: "GET", cache: "no-store" }),
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

      if (!promptsResponse.ok) {
        setError("Não foi possível carregar os prompts de imagem");
        setLoading(false);
        return;
      }

      const meData = await meResponse.json();
      const projectData = await projectResponse.json();
      const promptsData = await promptsResponse.json();

      setUser(meData);
      setProject(projectData);
      setImagePrompts(promptsData);
    } catch (err) {
      setError("Erro inesperado ao carregar os prompts de imagem");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  async function handleGeneratePrompts() {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/image-prompts/generate`, {
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
        setError(data.detail || "Não foi possível gerar os prompts de imagem");
        setGenerating(false);
        return;
      }

      setSuccess("Prompts de imagem gerados com sucesso");
      setImagePrompts(data);
    } catch (err) {
      setError("Erro inesperado ao gerar os prompts de imagem");
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
        <div>Carregando prompts de imagem...</div>
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

            <h1 style={{ margin: 0, fontSize: "34px" }}>Prompts de imagem</h1>

            <p style={{ marginTop: "10px", color: "#c7c4d7", maxWidth: "760px" }}>
              Gere prompts visuais a partir do briefing e da história já criados no projeto.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href={`/projects/${projectId}/story`}
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
              Voltar à história
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
            <h2 style={{ margin: 0 }}>Prompts gerados</h2>

            <button
              onClick={handleGeneratePrompts}
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
              {generating ? "Gerando..." : "Gerar prompts de imagem"}
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

          {!imagePrompts?.title ? (
            <div
              style={{
                background: "rgba(6,14,32,0.58)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "20px",
                color: "#c7c4d7",
              }}
            >
              Ainda não existem prompts de imagem gerados para este projeto.
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
                <h3 style={{ marginTop: 0 }}>{imagePrompts.title}</h3>
                <div style={{ color: "#908fa0", fontSize: "14px" }}>
                  modo: {imagePrompts.generation_mode || "n/d"} • status: {imagePrompts.status || "n/d"}
                </div>
              </div>

              <Card title="Prompt principal" text={imagePrompts.main_prompt} />
              <Card title="Prompt alternativo 1" text={imagePrompts.alt_prompt_1} />
              <Card title="Prompt alternativo 2" text={imagePrompts.alt_prompt_2} />
              <Card title="Prompt negativo" text={imagePrompts.negative_prompt} />
              <Card title="Notas de composição" text={imagePrompts.composition_notes} />
              <Card title="Notas de luz" text={imagePrompts.lighting_notes} />
              <Card title="Notas de estilo" text={imagePrompts.style_notes} />
              <Card title="Notas de assunto" text={imagePrompts.subject_notes} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Card({ title, text }: { title: string; text: string | null }) {
  return (
    <div
      style={{
        background: "rgba(6,14,32,0.58)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          margin: 0,
          lineHeight: 1.7,
          color: "#dae2fd",
        }}
      >
        {text || "Sem conteúdo"}
      </pre>
    </div>
  );
}
