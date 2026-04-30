"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectSideNav, StudioFooter, StudioShell } from "@/components/StudioShell";

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
    <StudioShell active="projects" onLogout={handleLogout}>
      <div className="mf-with-sidebar">
        <ProjectSideNav active="briefing" projectId={projectId} projectTitle={project?.title} />

        <div className="mf-content" style={{ padding: 0 }}>
          <section className="mf-glass mf-hero">
            <div className="mf-hero-copy">
              <div className="mf-kicker">Briefing do projeto</div>
              <h1 className="mf-title">{project?.title || "Novo projeto"}</h1>
              <p className="mf-subtitle">
                Defina os pilares narrativos e a identidade visual desta jornada através das memórias e da imaginação.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "28px" }}>
                <span className="mf-pill">✦ IA ativa</span>
                <span className="mf-pill">↻ Atualizado agora</span>
              </div>
            </div>
            <div className="mf-hero-art" />
          </section>

          <div className="mf-briefing-grid">
            <aside className="mf-glass mf-status-card">
              <div style={{ color: "#fff", fontWeight: 900, fontSize: "18px", lineHeight: 1.3 }}>
                Completion
                <br />
                Status
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#aeb1ff", fontSize: "12px", fontWeight: 900 }}>
                  <span>PROGRESS</span>
                  <span>65%</span>
                </div>
                <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.09)", marginTop: "10px", overflow: "hidden" }}>
                  <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg,#6f72ff,#9b5cff)" }} />
                </div>
              </div>
              <div style={{ display: "grid", gap: "14px", color: "#9aa6bd", fontWeight: 700 }}>
                <span style={{ color: "#aeb1ff" }}>⊙ Premissa</span>
                <span>⊙ Gênero & Público</span>
                <span>⊙ Tom & Atmosfera</span>
              </div>
            </aside>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "30px" }}>
              <section className="mf-glass mf-form-card">
                <h2>▣ Premissa Narrativa</h2>
                <label style={{ display: "grid", gap: "10px" }}>
                  <span className="mf-label">O núcleo da história</span>
                  <textarea
                    className="mf-field"
                    value={briefing.premise}
                    onChange={(event) => setBriefing((current) => ({ ...current, premise: event.target.value }))}
                    rows={5}
                    placeholder="Descreva o conflito central e a jornada emocional..."
                    style={{ resize: "vertical" }}
                  />
                </label>
                <div className="mf-two-col">
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Contexto</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.format}
                      onChange={(event) => setBriefing((current) => ({ ...current, format: event.target.value }))}
                      placeholder="Ex: Curta narrativa ilustrada"
                    />
                  </label>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Motivação</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.objective}
                      onChange={(event) => setBriefing((current) => ({ ...current, objective: event.target.value }))}
                      placeholder="Ex: Memória, descoberta, imaginação"
                    />
                  </label>
                </div>
              </section>

              <div className="mf-two-col">
                <section className="mf-glass mf-form-card mf-accent-cyan">
                  <h2>⚭ Gênero & Público</h2>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Gênero primário</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.genre}
                      onChange={(event) => setBriefing((current) => ({ ...current, genre: event.target.value }))}
                      placeholder="Aventura fantástica"
                    />
                  </label>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Público alvo</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.audience}
                      onChange={(event) => setBriefing((current) => ({ ...current, audience: event.target.value }))}
                      placeholder="Crianças e famílias"
                    />
                  </label>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Duração</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.duration}
                      onChange={(event) => setBriefing((current) => ({ ...current, duration: event.target.value }))}
                      placeholder="3 a 5 minutos"
                    />
                  </label>
                </section>

                <section className="mf-glass mf-form-card mf-accent-pink">
                  <h2>◌ Tom & Atmosfera</h2>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Tom emocional</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.tone}
                      onChange={(event) => setBriefing((current) => ({ ...current, tone: event.target.value }))}
                      placeholder="Poético, nostálgico e encantador"
                    />
                  </label>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Estilo visual</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.visual_style}
                      onChange={(event) => setBriefing((current) => ({ ...current, visual_style: event.target.value }))}
                      placeholder="Cinema nostálgico brasileiro"
                    />
                  </label>
                  <label style={{ display: "grid", gap: "10px" }}>
                    <span className="mf-label">Observações</span>
                    <input
                      className="mf-field"
                      type="text"
                      value={briefing.notes}
                      onChange={(event) => setBriefing((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Direção emocional e restrições criativas"
                    />
                  </label>
                </section>
              </div>

              <section className="mf-glass mf-form-card">
                <h2>Referências</h2>
                <textarea
                  className="mf-field"
                  value={briefing.references_text}
                  onChange={(event) => setBriefing((current) => ({ ...current, references_text: event.target.value }))}
                  rows={4}
                  placeholder="Locações, filmes, artistas, objetos, memórias e referências visuais..."
                  style={{ resize: "vertical" }}
                />
              </section>

              {error ? <div className="mf-alert mf-alert-error">{error}</div> : null}
              {success ? <div className="mf-alert mf-alert-success">{success}</div> : null}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "18px", flexWrap: "wrap" }}>
                <button className="mf-secondary" type="button" onClick={() => loadData()}>
                  Descartar alterações
                </button>
                <button className="mf-primary" type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar briefing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <StudioFooter />
    </StudioShell>
  );
}
