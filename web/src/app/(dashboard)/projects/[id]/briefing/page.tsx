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

type Briefing = {
  id: number | null;
  project_id: number;
  premise: string | null;
  genre: string | null;
  audience: string | null;
  tone: string | null;
  format: string | null;
  duration: string | null;
  visual_style: string | null;
  objective: string | null;
  references_text: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const emptyBriefing = {
  premise: "",
  genre: "",
  audience: "",
  tone: "",
  format: "",
  duration: "",
  visual_style: "",
  objective: "",
  references_text: "",
  notes: "",
};

export default function ProjectBriefingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [briefing, setBriefing] = useState(emptyBriefing);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectResponse, briefingResponse] = await Promise.all([
        fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}`, { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}/briefing`, { method: "GET", cache: "no-store" }),
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

      if (!briefingResponse.ok) {
        setError("Não foi possível carregar o briefing");
        setLoading(false);
        return;
      }

      const meData = await meResponse.json();
      const projectData = await projectResponse.json();
      const briefingData = await briefingResponse.json();

      setUser(meData);
      setProject(projectData);
      setBriefing({
        premise: briefingData.premise || "",
        genre: briefingData.genre || "",
        audience: briefingData.audience || "",
        tone: briefingData.tone || "",
        format: briefingData.format || "",
        duration: briefingData.duration || "",
        visual_style: briefingData.visual_style || "",
        objective: briefingData.objective || "",
        references_text: briefingData.references_text || "",
        notes: briefingData.notes || "",
      });
    } catch (err) {
      setError("Erro inesperado ao carregar o briefing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/briefing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(briefing),
      });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível salvar o briefing");
        setSaving(false);
        return;
      }

      setSuccess("Briefing salvo com sucesso");
      await loadData();
    } catch (err) {
      setError("Erro inesperado ao salvar o briefing");
    } finally {
      setSaving(false);
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
        <div>Carregando briefing...</div>
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

            <h1 style={{ margin: 0, fontSize: "34px" }}>Briefing do projeto</h1>

            <p style={{ marginTop: "10px", color: "#c7c4d7", maxWidth: "760px" }}>
              Estruture a base criativa do projeto para depois gerar história, prompts de imagem e prompts de vídeo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/projects"
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
              Voltar para projetos
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
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span>Premissa</span>
              <textarea
                value={briefing.premise}
                onChange={(event) =>
                  setBriefing((current) => ({ ...current, premise: event.target.value }))
                }
                rows={4}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(6,14,32,0.58)",
                  color: "#dae2fd",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <label style={{ display: "grid", gap: "8px" }}>
                <span>Gênero</span>
                <input
                  type="text"
                  value={briefing.genre}
                  onChange={(event) =>
                    setBriefing((current) => ({ ...current, genre: event.target.value }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span>Público</span>
                <input
                  type="text"
                  value={briefing.audience}
                  onChange={(event) =>
                    setBriefing((current) => ({ ...current, audience: event.target.value }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span>Tom</span>
                <input
                  type="text"
                  value={briefing.tone}
                  onChange={(event) =>
                    setBriefing((current) => ({ ...current, tone: event.target.value }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span>Formato</span>
                <input
                  type="text"
                  value={briefing.format}
                  onChange={(event) =>
                    setBriefing((current) => ({ ...current, format: event.target.value }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span>Duração</span>
                <input
                  type="text"
                  value={briefing.duration}
                  onChange={(event) =>
                    setBriefing((current) => ({ ...current, duration: event.target.value }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span>Estilo visual</span>
                <input
                  type="text"
                  value={briefing.visual_style}
                  onChange={(event) =>
                    setBriefing((current) => ({
                      ...current,
                      visual_style: event.target.value,
                    }))
                  }
                  style={{
                    height: "48px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(6,14,32,0.58)",
                    color: "#dae2fd",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </label>
            </div>

            <label style={{ display: "grid", gap: "8px" }}>
              <span>Objetivo</span>
              <textarea
                value={briefing.objective}
                onChange={(event) =>
                  setBriefing((current) => ({ ...current, objective: event.target.value }))
                }
                rows={4}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(6,14,32,0.58)",
                  color: "#dae2fd",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span>Referências</span>
              <textarea
                value={briefing.references_text}
                onChange={(event) =>
                  setBriefing((current) => ({
                    ...current,
                    references_text: event.target.value,
                  }))
                }
                rows={4}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(6,14,32,0.58)",
                  color: "#dae2fd",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span>Observações</span>
              <textarea
                value={briefing.notes}
                onChange={(event) =>
                  setBriefing((current) => ({ ...current, notes: event.target.value }))
                }
                rows={4}
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(6,14,32,0.58)",
                  color: "#dae2fd",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </label>

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

            <button
              type="submit"
              disabled={saving}
              style={{
                height: "50px",
                borderRadius: "16px",
                border: "none",
                background: saving ? "#908fa0" : "#8083ff",
                color: "#ffffff",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                padding: "0 18px",
              }}
            >
              {saving ? "Salvando briefing..." : "Salvar briefing"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
