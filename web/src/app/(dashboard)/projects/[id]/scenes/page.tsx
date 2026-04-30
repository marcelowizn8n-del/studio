"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

type Scene = {
  id: number;
  project_id: number;
  position: number;
  title: string;
  description: string;
  duration_seconds: number;
  image_prompt: string | null;
  video_prompt: string | null;
  generated_image_base64: string | null;
  generated_image_mime_type: string | null;
  image_generation_model: string | null;
  image_generation_size: string | null;
  image_generation_quality: string | null;
  image_generation_status: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const emptyScene = {
  title: "",
  description: "",
  duration_seconds: 8,
};

const imageModelOptions = [
  { value: "gpt-image-2", label: "GPT Image 2", description: "Melhor qualidade, requer acesso liberado na organização" },
  { value: "gpt-image-1.5", label: "GPT Image 1.5", description: "Alta qualidade da família GPT Image" },
  { value: "gpt-image-1", label: "GPT Image 1", description: "Modelo GPT Image anterior e mais disponível" },
  { value: "gpt-image-1-mini", label: "GPT Image 1 Mini", description: "Opção mais leve para testes" },
  { value: "dall-e-3", label: "DALL-E 3", description: "Fallback estável para geração por prompt" },
];

const gptImageSizeOptions = ["1024x1024", "1536x1024", "1024x1536"];
const dallEImageSizeOptions = ["1024x1024", "1792x1024", "1024x1792"];
const gptImageQualityOptions = ["low", "medium", "high"];
const dallEQualityOptions = ["standard", "hd"];

const panelStyle = {
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "24px",
  padding: "24px",
} as const;

const fieldStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(6,14,32,0.58)",
  color: "#dae2fd",
  padding: "14px",
  outline: "none",
} as const;

const buttonStyle = {
  minHeight: "44px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.055)",
  color: "#dae2fd",
  cursor: "pointer",
  fontWeight: 700,
  padding: "0 18px",
} as const;

export default function ProjectScenesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [form, setForm] = useState(emptyScene);
  const [sceneCount, setSceneCount] = useState(6);
  const [imageModel, setImageModel] = useState("gpt-image-2");
  const [imageSize, setImageSize] = useState("1536x1024");
  const [imageQuality, setImageQuality] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [meResponse, projectResponse, scenesResponse] = await Promise.all([
        fetch("/api/auth/me", { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}`, { method: "GET", cache: "no-store" }),
        fetch(`/api/projects/${projectId}/scenes`, { method: "GET", cache: "no-store" }),
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

      const meData = await meResponse.json();
      const projectData = await projectResponse.json();
      const scenesData = scenesResponse.ok ? await scenesResponse.json() : [];

      setUser(meData);
      setProject(projectData);
      setScenes(Array.isArray(scenesData) ? scenesData : []);
    } catch (err) {
      setError("Erro inesperado ao carregar cenas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  useEffect(() => {
    if (imageModel === "dall-e-3" && !dallEQualityOptions.includes(imageQuality)) {
      setImageQuality("standard");
    }
    if (imageModel !== "dall-e-3" && !gptImageQualityOptions.includes(imageQuality)) {
      setImageQuality("medium");
    }
    if (imageModel === "dall-e-3" && !dallEImageSizeOptions.includes(imageSize)) {
      setImageSize(imageSize === "1024x1536" ? "1024x1792" : "1792x1024");
    }
    if (imageModel !== "dall-e-3" && !gptImageSizeOptions.includes(imageSize)) {
      setImageSize(imageSize === "1024x1792" ? "1024x1536" : "1536x1024");
    }
  }, [imageModel, imageQuality, imageSize]);

  async function runSceneAction(
    actionName: string,
    successMessage: string,
    request: () => Promise<Response>
  ) {
    setBusyAction(actionName);
    setError("");
    setSuccess("");

    try {
      const response = await request();
      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível concluir a ação");
        return;
      }

      setScenes(Array.isArray(data) ? data : scenes);
      setSuccess(successMessage);
      await loadData();
    } catch (err) {
      setError("Erro inesperado ao concluir a ação");
    } finally {
      setBusyAction("");
    }
  }

  async function handleCreateScene(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({
        detail: "Falha ao processar resposta",
      }));

      if (!response.ok) {
        setError(data.detail || "Não foi possível criar a cena");
        return;
      }

      setForm(emptyScene);
      setSuccess("Cena criada com sucesso");
      await loadData();
    } catch (err) {
      setError("Erro inesperado ao criar a cena");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateScene(scene: Scene, payload: Partial<Scene>) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${scene.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.detail || "Não foi possível atualizar a cena");
        return;
      }

      const updated = await response.json();
      setScenes((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.position - b.position)
      );
      setSuccess("Cena atualizada");
    } catch (err) {
      setError("Erro inesperado ao atualizar a cena");
    }
  }

  async function handleDeleteScene(scene: Scene) {
    const confirmed = window.confirm("Excluir esta cena?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/projects/${projectId}/scenes/${scene.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.detail || "Não foi possível excluir a cena");
        return;
      }

      setSuccess("Cena excluída");
      await loadData();
    } catch (err) {
      setError("Erro inesperado ao excluir a cena");
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
        <div>Carregando cenas...</div>
      </main>
    );
  }

  return (
    <StudioShell active="scenes" onLogout={handleLogout}>
      <div className="mf-with-sidebar">
        <ProjectSideNav active="timeline" projectId={projectId} projectTitle={project?.title} />

        <div className="mf-content" style={{ padding: 0 }}>
          <header className="mf-scene-header">
            <div>
              <div style={{ color: "#fff", fontWeight: 900, marginBottom: "14px" }}>
                Scene Editor
              </div>
              <p style={{ margin: 0, color: "#aab6ce", fontSize: "20px" }}>
                Architecting the visual narrative through procedural generation.
              </p>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button className="mf-secondary" type="button">
                ▷ Preview Sequence
              </button>
              <button
                className="mf-primary"
                type="button"
                onClick={() =>
                  runSceneAction("gpt-images", "Imagens geradas", () =>
                    fetch(`/api/projects/${projectId}/scenes/generate-images`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        force_regenerate: true,
                        model: imageModel,
                        size: imageSize,
                        quality: imageQuality,
                      }),
                    })
                  )
                }
                disabled={!scenes.length || busyAction === "gpt-images"}
              >
                {busyAction === "gpt-images" ? "Renderizando..." : "Render All"}
              </button>
            </div>
          </header>

          <section className="mf-scene-tools">
            <div className="mf-glass mf-tool-card">
              <h2>Gerar timeline</h2>
              <div className="mf-tool-row">
                <label>
                  <span className="mf-label">Quantidade</span>
                  <input
                    className="mf-field"
                    type="number"
                    min={1}
                    max={20}
                    value={sceneCount}
                    onChange={(event) => setSceneCount(Number(event.target.value))}
                  />
                </label>
                <button
                  className="mf-primary"
                  type="button"
                  onClick={() =>
                    runSceneAction("generate-scenes", "Cenas geradas com sucesso", () =>
                      fetch(`/api/projects/${projectId}/scenes/generate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ force_regenerate: true, scene_count: sceneCount }),
                      })
                    )
                  }
                  disabled={busyAction === "generate-scenes"}
                >
                  {busyAction === "generate-scenes" ? "Gerando..." : "Gerar cenas"}
                </button>
                <button
                  className="mf-secondary"
                  type="button"
                  onClick={() =>
                    runSceneAction("image-prompts", "Prompts de imagem gerados", () =>
                      fetch(`/api/projects/${projectId}/scenes/generate-image-prompts`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ force_regenerate: true }),
                      })
                    )
                  }
                  disabled={!scenes.length || busyAction === "image-prompts"}
                >
                  Prompts imagem
                </button>
                <button
                  className="mf-secondary"
                  type="button"
                  onClick={() =>
                    runSceneAction("video-prompts", "Prompts de vídeo gerados", () =>
                      fetch(`/api/projects/${projectId}/scenes/generate-video-prompts`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ force_regenerate: true }),
                      })
                    )
                  }
                  disabled={!scenes.length || busyAction === "video-prompts"}
                >
                  Prompts vídeo
                </button>
              </div>
            </div>

            <div className="mf-glass mf-tool-card">
              <h2>Modelo de imagem</h2>
              <div className="mf-tool-row">
                <label>
                  <span className="mf-label">Modelo</span>
                  <select className="mf-field" value={imageModel} onChange={(event) => setImageModel(event.target.value)}>
                    {imageModelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mf-label">Tamanho</span>
                  <select className="mf-field" value={imageSize} onChange={(event) => setImageSize(event.target.value)}>
                    {(imageModel === "dall-e-3" ? dallEImageSizeOptions : gptImageSizeOptions).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mf-label">Qualidade</span>
                  <select className="mf-field" value={imageQuality} onChange={(event) => setImageQuality(event.target.value)}>
                    {(imageModel === "dall-e-3" ? dallEQualityOptions : gptImageQualityOptions).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p style={{ color: "#8f9bb4", lineHeight: 1.5, marginBottom: 0 }}>
                {imageModelOptions.find((option) => option.value === imageModel)?.description}
              </p>
            </div>
          </section>

          {error ? <div className="mf-alert mf-alert-error">{error}</div> : null}
          {success ? <div className="mf-alert mf-alert-success">{success}</div> : null}

          <section className="mf-timeline">
            {scenes.length === 0 ? (
              <div className="mf-glass mf-empty-state">
                Nenhuma cena criada ainda. Gere cenas a partir da história ou adicione manualmente.
              </div>
            ) : (
              scenes.map((scene) => (
                <article className="mf-glass mf-scene-card" key={scene.id}>
                  <div className="mf-timeline-dot" />
                  <SceneVisual scene={scene} />
                  <div style={{ display: "grid", gap: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "start" }}>
                      <input
                        className="mf-scene-title-input"
                        defaultValue={scene.title}
                        onBlur={(event) => {
                          if (event.target.value !== scene.title) {
                            handleUpdateScene(scene, { title: event.target.value });
                          }
                        }}
                      />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button className="mf-mini-btn" type="button" title="Salvar alterações">
                          ✎
                        </button>
                        <button className="mf-mini-btn" type="button" onClick={() => handleDeleteScene(scene)} title="Excluir cena">
                          ⋮
                        </button>
                      </div>
                    </div>

                    <label style={{ display: "grid", gap: "9px" }}>
                      <span className="mf-label">Script text</span>
                      <textarea
                        className="mf-scene-script"
                        defaultValue={scene.description}
                        onBlur={(event) => {
                          if (event.target.value !== scene.description) {
                            handleUpdateScene(scene, { description: event.target.value });
                          }
                        }}
                        rows={3}
                      />
                    </label>

                    <div className="mf-prompt-grid">
                      <PromptBlock title="Image prompt" value={scene.image_prompt} />
                      <PromptBlock title="Video prompt" value={scene.video_prompt} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#8f9bb4", fontSize: "13px" }}>
                      <span>{scene.status.toUpperCase()}</span>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        duração
                        <input
                          className="mf-duration-input"
                          type="number"
                          min={1}
                          defaultValue={scene.duration_seconds}
                          onBlur={(event) => {
                            const duration = Number(event.target.value);
                            if (duration !== scene.duration_seconds) {
                              handleUpdateScene(scene, { duration_seconds: duration });
                            }
                          }}
                        />
                        s
                      </label>
                    </div>
                  </div>
                </article>
              ))
            )}

            <form className="mf-new-scene" onSubmit={handleCreateScene}>
              <div className="mf-add-circle">+</div>
              <span>Append new scene</span>
              <div className="mf-glass mf-new-scene-form">
                <input
                  className="mf-field"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Título da nova cena"
                  required
                />
                <textarea
                  className="mf-field"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Descrição visual da cena"
                  rows={3}
                  required
                  style={{ resize: "vertical" }}
                />
                <input
                  className="mf-field"
                  type="number"
                  min={1}
                  value={form.duration_seconds}
                  onChange={(event) => setForm((current) => ({ ...current, duration_seconds: Number(event.target.value) }))}
                />
                <button className="mf-primary" type="submit" disabled={saving}>
                  {saving ? "Criando..." : "Adicionar cena"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
      <StudioFooter />
    </StudioShell>
  );
}

function SceneVisual({ scene }: { scene: Scene }) {
  const mimeType = scene.generated_image_mime_type || "image/png";

  return (
    <div className="mf-scene-visual">
      {scene.generated_image_base64 ? (
        <img src={`data:${mimeType};base64,${scene.generated_image_base64}`} alt={`Imagem gerada para ${scene.title}`} />
      ) : null}
      <div className="mf-scene-badges">
        <span>{scene.image_generation_status || "PENDING"}</span>
        <span>00:{String(scene.duration_seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}

function PromptBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="mf-scene-prompt">
      <h3>{title}</h3>
      <p>
        {value || "Ainda não gerado para esta cena."}
      </p>
    </div>
  );
}
