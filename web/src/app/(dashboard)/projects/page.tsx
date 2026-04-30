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

type Project = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  title: "",
  description: "",
  status: "draft" as "draft" | "active" | "archived",
};

export default function ProjectsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectsResponse] = await Promise.all([
        fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        fetch("/api/projects", { method: "GET", cache: "no-store" }),
      ]);

      if (!meResponse.ok || !projectsResponse.ok) {
        router.push("/login");
        router.refresh();
        return;
      }

      const meData = await meResponse.json();
      const projectsData = await projectsResponse.json();

      setUser(meData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      setError("Não foi possível carregar os projetos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = editingId !== null;
      const url = isEditing ? `/api/projects/${editingId}` : "/api/projects";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível salvar o projeto");
        setSaving(false);
        return;
      }

      setForm(emptyForm);
      setEditingId(null);
      setSuccess(isEditing ? "Projeto atualizado com sucesso" : "Projeto criado com sucesso");
      await loadAll();
    } catch (err) {
      setError("Erro inesperado ao salvar o projeto");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description || "",
      status: project.status,
    });
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setSuccess("");
    setError("");
  }

  async function handleDelete(projectId: number) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este projeto?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível excluir o projeto");
        return;
      }

      if (editingId === projectId) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setSuccess("Projeto excluído com sucesso");
      await loadAll();
    } catch (err) {
      setError("Erro inesperado ao excluir o projeto");
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
          background: "#0b1326",
          color: "#dae2fd",
          fontFamily: "var(--font-body)",
        }}
      >
        <div>Carregando projetos...</div>
      </main>
    );
  }

  return (
    <StudioShell active="projects" onLogout={handleLogout}>
      <div className="mf-content">
        <section className="mf-glass mf-hero">
          <div className="mf-hero-copy">
            <div className="mf-kicker">Projetos criativos</div>
            <h1 className="mf-title">Projetos</h1>
            <p className="mf-subtitle">
              Organize histórias, cenas, prompts e imagens em uma biblioteca visual com fluxo de produção completo.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "28px" }}>
              <Link className="mf-primary" href="/" style={{ display: "inline-flex", alignItems: "center" }}>
                Dashboard
              </Link>
              <span className="mf-pill">{projects.length} projetos</span>
            </div>
          </div>
          <div className="mf-hero-art" />
        </section>

        <div style={{ display: "grid", gap: "26px", marginTop: "48px" }}>

        <section
          className="mf-glass"
          style={{
            borderRadius: "24px",
            padding: "30px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {editingId ? "Editar projeto" : "Novo projeto"}
          </h2>

          <div style={{ marginBottom: "18px", color: "#c7c4d7" }}>
            Usuário autenticado: <strong>{user?.full_name}</strong> ({user?.email})
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span>Título</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                required
                className="mf-field"
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span>Descrição</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className="mf-field"
                style={{ resize: "vertical" }}
              />
            </label>

            <label style={{ display: "grid", gap: "8px" }}>
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as "draft" | "active" | "archived",
                  }))
                }
                className="mf-field"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </label>

            {error ? <div className="mf-alert mf-alert-error">{error}</div> : null}
            {success ? <div className="mf-alert mf-alert-success">{success}</div> : null}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  opacity: saving ? 0.7 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                className="mf-primary"
              >
                {saving
                  ? editingId
                    ? "Salvando..."
                    : "Criando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Criar projeto"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  className="mf-secondary"
                >
                  Cancelar edição
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section style={{ display: "grid", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Seus projetos</h2>

          {projects.length === 0 ? (
            <div
              className="mf-glass"
              style={{
                borderRadius: "18px",
                padding: "20px",
                color: "#c7c4d7",
              }}
            >
              Nenhum projeto encontrado. Crie o primeiro projeto acima.
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                className="mf-glass"
                style={{
                  borderRadius: "22px",
                  padding: "24px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{project.title}</h3>
                    <div style={{ color: "#c0c1ff", marginTop: "6px" }}>
                      status: {project.status}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Link
                      href={`/projects/${project.id}/briefing`}
                      style={{
                        textDecoration: "none",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(90,160,255,0.25)",
                        background: "rgba(90,160,255,0.12)",
                        color: "#9dbdff",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      Briefing
                    </Link>

                    <Link
                      href={`/projects/${project.id}/story`}
                      style={{
                        textDecoration: "none",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(143,255,194,0.22)",
                        background: "rgba(56,217,169,0.12)",
                        color: "#7ff0c4",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      História
                    </Link>

                    <Link
                      href={`/projects/${project.id}/image-prompts`}
                      style={{
                        textDecoration: "none",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,210,90,0.25)",
                        background: "rgba(255,210,90,0.12)",
                        color: "#ffe38a",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      Prompts de imagem
                    </Link>

                    <Link
                      href={`/projects/${project.id}/video-prompts`}
                      style={{
                        textDecoration: "none",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(200,140,255,0.28)",
                        background: "rgba(170,120,255,0.14)",
                        color: "#d7b8ff",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      Prompts de vídeo
                    </Link>

                    <Link
                      href={`/projects/${project.id}/scenes`}
                      style={{
                        textDecoration: "none",
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(200,168,255,0.28)",
                        background: "rgba(200,168,255,0.14)",
                        color: "#c0c1ff",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: 700,
                      }}
                    >
                      Cenas
                    </Link>

                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.16)",
                        background: "rgba(255,255,255,0.055)",
                        color: "#dae2fd",
                        cursor: "pointer",
                        padding: "0 14px",
                        fontWeight: 700,
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        height: "40px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,84,89,0.24)",
                        background: "rgba(255,84,89,0.12)",
                        color: "#ffb3b6",
                        cursor: "pointer",
                        padding: "0 14px",
                        fontWeight: 700,
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <p style={{ margin: 0, color: "#dae2fd", lineHeight: 1.6 }}>
                  {project.description || "Sem descrição"}
                </p>

                <div style={{ color: "#908fa0", fontSize: "14px" }}>
                  Criado em: {project.created_at}
                </div>
              </article>
            ))
          )}
        </section>
        </div>
      </div>
      <StudioFooter />
    </StudioShell>
  );
}
