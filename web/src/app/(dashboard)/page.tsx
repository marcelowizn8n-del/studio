import { fetchHelloWorld } from '@/lib/api-client';

export default async function HomePage() {
  let apiData: Record<string, string> | null = null;
  let error = '';

  try {
    apiData = await fetchHelloWorld();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro ao conectar com a API';
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="badge">Story Agent V1</div>
        <h1>Integração funcionando entre Next.js e FastAPI</h1>
        <p className="muted">
          Esta tela já consome o endpoint <strong>/api/v1/hello</strong> da API para validar a comunicação entre interface e backend.
        </p>

        <div className="grid">
          <div className="card">
            <h3>Frontend</h3>
            <p className="muted">Next.js 14 com App Router e TypeScript.</p>
          </div>
          <div className="card">
            <h3>Backend</h3>
            <p className="muted">FastAPI exposta via Caddy em api.seudominio.com.</p>
          </div>
          <div className="card">
            <h3>Infra</h3>
            <p className="muted">Docker Compose + Caddy + PostgreSQL + Redis.</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>Resposta da API</h3>
          {apiData ? (
            <pre className="code">{JSON.stringify(apiData, null, 2)}</pre>
          ) : (
            <pre className="code">{JSON.stringify({ error }, null, 2)}</pre>
          )}
        </div>
      </section>
    </main>
  );
}
