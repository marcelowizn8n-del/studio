'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createProjectScene,
  deleteProjectScene,
  fetchImagePrompts,
  fetchProjectScenes,
  fetchVideoPrompts,
  generateImagePrompts,
  generateProjectScenes,
  generateVideoPrompts,
  updateProjectScene
} from '@/lib/api-client';
import type { ProjectScene, ScenePrompt } from '@/lib/api-client';

type PageProps = {
  params: {
    id: string;
  };
};

const emptyScene = {
  title: '',
  description: '',
  duration_seconds: 8
};

export default function ScenesPage({ params }: PageProps) {
  const projectId = params.id;
  const [scenes, setScenes] = useState<ProjectScene[]>([]);
  const [imagePrompts, setImagePrompts] = useState<ScenePrompt[]>([]);
  const [videoPrompts, setVideoPrompts] = useState<ScenePrompt[]>([]);
  const [storyText, setStoryText] = useState('');
  const [sceneCount, setSceneCount] = useState(6);
  const [draft, setDraft] = useState(emptyScene);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedSceneId) || scenes[0],
    [scenes, selectedSceneId]
  );

  useEffect(() => {
    refreshAll();
  }, [projectId]);

  async function refreshAll() {
    try {
      setLoading(true);
      setError(null);
      const [nextScenes, nextImages, nextVideos] = await Promise.all([
        fetchProjectScenes(projectId),
        fetchImagePrompts(projectId),
        fetchVideoPrompts(projectId)
      ]);
      setScenes(nextScenes);
      setImagePrompts(nextImages);
      setVideoPrompts(nextVideos);
      setSelectedSceneId((current) => current || nextScenes[0]?.id || null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar cenas.');
    } finally {
      setLoading(false);
    }
  }

  async function runAction(name: string, action: () => Promise<void>) {
    try {
      setBusy(name);
      setError(null);
      await action();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nao foi possivel concluir a acao.');
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerateScenes() {
    await runAction('scenes', async () => {
      const generated = await generateProjectScenes(projectId, storyText, sceneCount);
      setScenes(generated);
      setSelectedSceneId(generated[0]?.id || null);
      setImagePrompts([]);
      setVideoPrompts([]);
    });
  }

  async function handleCreateScene() {
    await runAction('create', async () => {
      const created = await createProjectScene(projectId, draft);
      setScenes((current) => [...current, created].sort((a, b) => a.order - b.order));
      setSelectedSceneId(created.id);
      setDraft(emptyScene);
    });
  }

  async function handleUpdateScene(scene: ProjectScene, payload: Partial<ProjectScene>) {
    await runAction(scene.id, async () => {
      const updated = await updateProjectScene(scene.id, payload);
      setScenes((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)).sort((a, b) => a.order - b.order)
      );
    });
  }

  async function handleDeleteScene(scene: ProjectScene) {
    await runAction(scene.id, async () => {
      await deleteProjectScene(scene.id);
      const nextScenes = scenes.filter((item) => item.id !== scene.id);
      setScenes(nextScenes);
      setSelectedSceneId(nextScenes[0]?.id || null);
    });
  }

  async function handleGeneratePrompts(kind: 'image' | 'video') {
    await runAction(kind, async () => {
      if (kind === 'image') {
        setImagePrompts(await generateImagePrompts(projectId));
      } else {
        setVideoPrompts(await generateVideoPrompts(projectId));
      }
    });
  }

  const promptByScene = (items: ScenePrompt[], sceneId: string) => items.find((item) => item.scene_id === sceneId);

  return (
    <main className="scene-shell">
      <section className="scene-header">
        <div>
          <span className="badge">Sprint 7</span>
          <h1>Editor de cenas</h1>
          <p className="muted">
            Quebre a historia em cenas, ajuste duracao e gere prompts especificos de imagem e video para cada trecho.
          </p>
        </div>
        <div className="scene-actions">
          <button onClick={() => handleGeneratePrompts('image')} disabled={!scenes.length || busy === 'image'}>
            Gerar imagem
          </button>
          <button onClick={() => handleGeneratePrompts('video')} disabled={!scenes.length || busy === 'video'}>
            Gerar video
          </button>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="scene-workbench">
        <aside className="scene-generator">
          <h2>Gerar timeline</h2>
          <textarea
            value={storyText}
            onChange={(event) => setStoryText(event.target.value)}
            placeholder="Cole aqui a historia completa para dividir em cenas."
          />
          <label>
            Cenas
            <input
              type="number"
              min="1"
              max="20"
              value={sceneCount}
              onChange={(event) => setSceneCount(Number(event.target.value))}
            />
          </label>
          <button onClick={handleGenerateScenes} disabled={storyText.length < 20 || busy === 'scenes'}>
            Dividir historia
          </button>

          <div className="scene-create">
            <h2>Nova cena</h2>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Titulo"
            />
            <textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Descricao visual da cena"
            />
            <input
              type="number"
              min="1"
              value={draft.duration_seconds}
              onChange={(event) => setDraft({ ...draft, duration_seconds: Number(event.target.value) })}
            />
            <button onClick={handleCreateScene} disabled={draft.title.length < 2 || draft.description.length < 8}>
              Adicionar cena
            </button>
          </div>
        </aside>

        <section className="scene-timeline">
          {loading ? (
            <div className="empty-state">Carregando cenas...</div>
          ) : scenes.length === 0 ? (
            <div className="empty-state">Nenhuma cena criada ainda.</div>
          ) : (
            scenes.map((scene) => (
              <article
                key={scene.id}
                className={`scene-item ${selectedScene?.id === scene.id ? 'is-active' : ''}`}
                onClick={() => setSelectedSceneId(scene.id)}
              >
                <div className="scene-index">{scene.order}</div>
                <div className="scene-body">
                  <input
                    defaultValue={scene.title}
                    onBlur={(event) => {
                      if (event.target.value !== scene.title) {
                        handleUpdateScene(scene, { title: event.target.value });
                      }
                    }}
                  />
                  <textarea
                    defaultValue={scene.description}
                    onBlur={(event) => {
                      if (event.target.value !== scene.description) {
                        handleUpdateScene(scene, { description: event.target.value });
                      }
                    }}
                  />
                  <div className="scene-meta">
                    <label>
                      Duracao
                      <input
                        type="number"
                        min="1"
                        defaultValue={scene.duration_seconds}
                        onBlur={(event) => {
                          const duration = Number(event.target.value);
                          if (duration !== scene.duration_seconds) {
                            handleUpdateScene(scene, { duration_seconds: duration });
                          }
                        }}
                      />
                    </label>
                    <button onClick={() => handleDeleteScene(scene)} disabled={busy === scene.id}>
                      Remover
                    </button>
                  </div>
                  <PromptBlock title="Imagem" prompt={promptByScene(imagePrompts, scene.id)?.prompt} />
                  <PromptBlock title="Video" prompt={promptByScene(videoPrompts, scene.id)?.prompt} />
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

function PromptBlock({ title, prompt }: { title: string; prompt?: string }) {
  return (
    <div className="prompt-block">
      <strong>{title}</strong>
      <p>{prompt || 'Prompt ainda nao gerado para esta cena.'}</p>
    </div>
  );
}
