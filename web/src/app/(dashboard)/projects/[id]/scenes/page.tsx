"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

const imageSizeOptions = ["1024x1024", "1536x1024", "1024x1536"];
const gptImageQualityOptions = ["low", "medium", "high"];
const dallEQualityOptions = ["standard", "hd"];

const panelStyle = {
  background: "#ffffff",
  border: "1px solid rgba(42,55,82,0.12)",
  borderRadius: "20px",
  padding: "24px",
} as const;

const fieldStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(42,55,82,0.16)",
  background: "#f8fbff",
  color: "#172033",
  padding: "14px",
  outline: "none",
} as const;

const buttonStyle = {
  minHeight: "44px",
  borderRadius: "12px",
  border: "1px solid rgba(42,55,82,0.16)",
  background: "#ffffff",
  color: "#172033",
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
  }, [imageModel, imageQuality]);

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
          background: "#f4f7fb",
          color: "#172033",
          fontFamily: "var(--font-body)",
        }}
      >
        <div>Carregando cenas...</div>
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
      <div style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gap: "24px" }}>
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

            <h1 style={{ margin: 0, fontSize: "34px" }}>Editor de cenas</h1>
            <p style={{ marginTop: "10px", color: "#5f6f89", maxWidth: "760px" }}>
              Quebre a história em cenas individuais e gere prompts específicos de imagem e vídeo.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href={`/projects/${projectId}/story`} style={buttonStyle}>
              História
            </Link>
            <Link href={`/projects/${projectId}/image-prompts`} style={buttonStyle}>
              Prompts de imagem
            </Link>
            <Link href={`/projects/${projectId}/video-prompts`} style={buttonStyle}>
              Prompts de vídeo
            </Link>
            <Link href="/projects" style={buttonStyle}>
              Projetos
            </Link>
            <button onClick={handleLogout} style={buttonStyle}>
              Sair
            </button>
          </div>
        </header>

        <section style={{ ...panelStyle, display: "grid", gap: "10px" }}>
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>{project?.title}</h2>
          <div style={{ color: "#334155" }}>
            <strong>Status:</strong> {project?.status}
          </div>
          <div style={{ color: "#334155" }}>
            <strong>Usuário:</strong> {user?.full_name} ({user?.email})
          </div>
          <div style={{ color: "#5f6f89" }}>
            {project?.description || "Sem descrição do projeto"}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "18px", alignItems: "start" }}>
          <aside style={{ ...panelStyle, display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gap: "12px" }}>
              <h2 style={{ margin: 0 }}>Gerar timeline</h2>
              <label style={{ display: "grid", gap: "8px", color: "#334155" }}>
                Quantidade de cenas
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={sceneCount}
                  onChange={(event) => setSceneCount(Number(event.target.value))}
                  style={{ ...fieldStyle, height: "48px" }}
                />
              </label>
              <button
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
                style={{
                  ...buttonStyle,
                  border: "none",
                  background: busyAction === "generate-scenes" ? "#94a3b8" : "#7c3aed",
                  color: "#ffffff",
                }}
              >
                {busyAction === "generate-scenes" ? "Gerando..." : "Gerar cenas da história"}
              </button>
              <button
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
                style={buttonStyle}
              >
                Gerar prompts de imagem
              </button>
              <button
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
                style={buttonStyle}
              >
                Gerar prompts de vídeo
              </button>
              <button
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
                style={{
                  ...buttonStyle,
                  border: "1px solid rgba(143,255,194,0.22)",
                  background: "rgba(56,217,169,0.12)",
                  color: "#047857",
                }}
              >
                {busyAction === "gpt-images" ? "Gerando imagens..." : "Gerar imagens"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                borderTop: "1px solid rgba(42,55,82,0.12)",
                paddingTop: "18px",
              }}
            >
              <h2 style={{ margin: 0 }}>Modelo de imagem</h2>
              <label style={{ display: "grid", gap: "8px", color: "#334155" }}>
                Modelo
                <select
                  value={imageModel}
                  onChange={(event) => setImageModel(event.target.value)}
                  style={{ ...fieldStyle, height: "48px" }}
                >
                  {imageModelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ color: "#5f6f89", fontSize: "14px", lineHeight: 1.5 }}>
                {imageModelOptions.find((option) => option.value === imageModel)?.description}
              </div>
              <label style={{ display: "grid", gap: "8px", color: "#334155" }}>
                Tamanho
                <select
                  value={imageSize}
                  onChange={(event) => setImageSize(event.target.value)}
                  style={{ ...fieldStyle, height: "48px" }}
                >
                  {imageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: "8px", color: "#334155" }}>
                Qualidade
                <select
                  value={imageQuality}
                  onChange={(event) => setImageQuality(event.target.value)}
                  style={{ ...fieldStyle, height: "48px" }}
                >
                  {(imageModel === "dall-e-3" ? dallEQualityOptions : gptImageQualityOptions).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form onSubmit={handleCreateScene} style={{ display: "grid", gap: "12px" }}>
              <h2 style={{ margin: 0 }}>Nova cena</h2>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Título"
                required
                style={{ ...fieldStyle, height: "48px" }}
              />
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Descrição visual da cena"
                rows={5}
                required
                style={{ ...fieldStyle, resize: "vertical" }}
              />
              <input
                type="number"
                min={1}
                value={form.duration_seconds}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    duration_seconds: Number(event.target.value),
                  }))
                }
                style={{ ...fieldStyle, height: "48px" }}
              />
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  border: "none",
                  background: saving ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                }}
              >
                {saving ? "Criando..." : "Adicionar cena"}
              </button>
            </form>
          </aside>

          <section style={{ display: "grid", gap: "14px" }}>
            {error ? (
              <div
                style={{
                  background: "rgba(255, 84, 89, 0.12)",
                  color: "#ff8f93",
                  border: "1px solid rgba(255, 84, 89, 0.24)",
                  padding: "12px 14px",
                  borderRadius: "12px",
                }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  background: "rgba(56, 217, 169, 0.12)",
                  color: "#047857",
                  border: "1px solid rgba(56, 217, 169, 0.24)",
                  padding: "12px 14px",
                  borderRadius: "12px",
                }}
              >
                {success}
              </div>
            ) : null}

            {scenes.length === 0 ? (
              <div style={{ ...panelStyle, color: "#5f6f89" }}>
                Nenhuma cena criada ainda. Gere cenas a partir da história ou adicione manualmente.
              </div>
            ) : (
              scenes.map((scene) => (
                <article
                  key={scene.id}
                  style={{
                    ...panelStyle,
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    gap: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "16px",
                      background: "rgba(200,168,255,0.14)",
                      color: "#7c3aed",
                      fontWeight: 800,
                      fontSize: "20px",
                    }}
                  >
                    {scene.position}
                  </div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    <input
                      defaultValue={scene.title}
                      onBlur={(event) => {
                        if (event.target.value !== scene.title) {
                          handleUpdateScene(scene, { title: event.target.value });
                        }
                      }}
                      style={{ ...fieldStyle, height: "48px", fontWeight: 700 }}
                    />
                    <textarea
                      defaultValue={scene.description}
                      onBlur={(event) => {
                        if (event.target.value !== scene.description) {
                          handleUpdateScene(scene, { description: event.target.value });
                        }
                      }}
                      rows={4}
                      style={{ ...fieldStyle, resize: "vertical" }}
                    />

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                      <label style={{ display: "flex", gap: "8px", alignItems: "center", color: "#5f6f89" }}>
                        Duração
                        <input
                          type="number"
                          min={1}
                          defaultValue={scene.duration_seconds}
                          onBlur={(event) => {
                            const duration = Number(event.target.value);
                            if (duration !== scene.duration_seconds) {
                              handleUpdateScene(scene, { duration_seconds: duration });
                            }
                          }}
                          style={{ ...fieldStyle, width: "92px", height: "42px", padding: "0 12px" }}
                        />
                      </label>
                      <button onClick={() => handleDeleteScene(scene)} style={buttonStyle}>
                        Excluir cena
                      </button>
                      <span style={{ color: "#7a879c", fontSize: "14px" }}>status: {scene.status}</span>
                    </div>

                    <PromptBlock title="Prompt de imagem" value={scene.image_prompt} />
                    <GeneratedImage scene={scene} />
                    <PromptBlock title="Prompt de vídeo" value={scene.video_prompt} />
                  </div>
                </article>
              ))
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function GeneratedImage({ scene }: { scene: Scene }) {
  if (!scene.generated_image_base64) {
    return (
      <div
        style={{
          background: "#f8fbff",
          border: "1px solid rgba(42,55,82,0.12)",
          borderRadius: "16px",
          padding: "16px",
          color: "#5f6f89",
        }}
      >
        Imagem ainda não gerada para esta cena.
      </div>
    );
  }

  const mimeType = scene.generated_image_mime_type || "image/png";

  return (
    <div
      style={{
        background: "#f8fbff",
        border: "1px solid rgba(42,55,82,0.12)",
        borderRadius: "16px",
        padding: "16px",
        display: "grid",
        gap: "10px",
      }}
    >
      <h3 style={{ margin: 0, color: "#047857" }}>Imagem gerada</h3>
      <img
        src={`data:${mimeType};base64,${scene.generated_image_base64}`}
        alt={`Imagem gerada para ${scene.title}`}
        style={{
          width: "100%",
          borderRadius: "12px",
          border: "1px solid rgba(42,55,82,0.12)",
          display: "block",
        }}
      />
      <div style={{ color: "#7a879c", fontSize: "14px" }}>
        Modelo: {scene.image_generation_model || "n/d"} · Qualidade:{" "}
        {scene.image_generation_quality || "n/d"} · Tamanho: {scene.image_generation_size || "n/d"}
      </div>
    </div>
  );
}

function PromptBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div
      style={{
        background: "#f8fbff",
        border: "1px solid rgba(42,55,82,0.12)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#7c3aed" }}>{title}</h3>
      <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>
        {value || "Ainda não gerado para esta cena."}
      </p>
    </div>
  );
}
