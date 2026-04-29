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
          background: "#0b1020",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>Carregando projetos...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#ffffff",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
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
                color: "#8ab4ff",
                marginBottom: "10px",
              }}
            >
              Studio ThinkingTools
            </div>

            <h1 style={{ margin: 0, fontSize: "34px" }}>Projetos</h1>

            <p style={{ marginTop: "10px", color: "#b6bfd6", maxWidth: "760px" }}>
              Cada projeto pode receber briefing, história, prompts de imagem e prompts de vídeo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#ffffff",
                background: "#18213f",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              Voltar ao painel
            </Link>

            <button
              onClick={handleLogout}
              style={{
                height: "44px",
                padding: "0 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#18213f",
                color: "#ffffff",
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
            background: "#121933",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {editingId ? "Editar projeto" : "Novo projeto"}
          </h2>

          <div style={{ marginBottom: "18px", color: "#b6bfd6" }}>
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
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#0d1430",
                  color: "#ffffff",
                  padding: "0 14px",
                  outline: "none",
                }}
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
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#0d1430",
                  color: "#ffffff",
                  padding: "14px",
                  outline: "none",
                  resize: "vertical",
                }}
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
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#0d1430",
                  color: "#ffffff",
                  padding: "0 14px",
                  outline: "none",
                }}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
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

            {success ? (
              <div
                style={{
                  background: "rgba(56, 217, 169, 0.12)",
                  color: "#7ff0c4",
                  border: "1px solid rgba(56, 217, 169, 0.24)",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                }}
              >
                {success}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  height: "50px",
                  borderRadius: "12px",
                  border: "none",
                  background: saving ? "#4f5b7a" : "#4f7cff",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  padding: "0 18px",
                }}
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
                    height: "50px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "#18213f",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "0 18px",
                  }}
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
              style={{
                background: "#121933",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
                padding: "20px",
                color: "#b6bfd6",
              }}
            >
              Nenhum projeto encontrado. Crie o primeiro projeto acima.
            </div>
          ) : (
            projects.map((project) => (
              <article
                key={project.id}
                style={{
                  background: "#121933",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "18px",
                  padding: "20px",
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
                    <div style={{ color: "#8ab4ff", marginTop: "6px" }}>
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
                        color: "#b8d4ff",
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
                        color: "#ffe39a",
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
                        color: "#e0c8ff",
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
                        color: "#c8a8ff",
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
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "#18213f",
                        color: "#ffffff",
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

                <p style={{ margin: 0, color: "#dbe4ff", lineHeight: 1.6 }}>
                  {project.description || "Sem descrição"}
                </p>

                <div style={{ color: "#93a0c7", fontSize: "14px" }}>
                  Criado em: {project.created_at}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
