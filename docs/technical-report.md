# Relatório Técnico - Studio ThinkingTools

Data: 30/04/2026  
Repositório: `marcelowizn8n-del/studio`  
Ambiente de produção: `https://studio.thinkingtools.io`  
VPS: `72.62.12.98`  
Diretório de produção: `/opt/apps/studio`

## 1. Visão Geral

O Studio ThinkingTools é uma aplicação web para criação e organização de projetos narrativos com apoio de IA. O fluxo principal do produto permite que o usuário crie um projeto, preencha o briefing criativo, gere uma história base, gere prompts de imagem, gere prompts de vídeo, quebre a narrativa em cenas e gere imagens por cena usando modelos da OpenAI.

Fluxo funcional atual:

```text
login -> projetos -> briefing -> história -> prompts de imagem -> prompts de vídeo -> cenas -> geração de imagens
```

O sistema já opera com autenticação real via JWT em cookies HttpOnly, persistência em Postgres, frontend em Next.js, backend em FastAPI e deploy via Docker Compose na VPS.

## 2. Arquitetura

A aplicação está dividida em quatro serviços principais:

| Serviço | Tecnologia | Responsabilidade |
| --- | --- | --- |
| `web` | Next.js 14 / React 18 | Interface do usuário, rotas frontend e proxy autenticado para API |
| `api` | FastAPI / SQLAlchemy | API principal, autenticação, regras de negócio e integrações de IA |
| `postgres` | PostgreSQL 16 | Banco relacional de usuários, projetos, briefing, histórias, prompts e cenas |
| `redis` | Redis 7 | Serviço auxiliar preparado para cache/fila/sessões futuras |

Rede de produção:

- Rede interna da aplicação: `app_net`
- Rede compartilhada com proxy: `npm_shared`
- Aliases expostos ao Nginx Proxy Manager: `studio-web` e `studio-api`

## 3. Frontend

Localização: `web/`

Stack:

- Next.js `14.2.30`
- React `18.3.1`
- TypeScript
- App Router
- CSS global customizado em `web/src/app/globals.css`

Principais telas:

| Rota | Arquivo | Função |
| --- | --- | --- |
| `/login` | `web/src/app/(auth)/login/page.tsx` | Login do usuário |
| `/` | `web/src/app/(dashboard)/page.tsx` | Dashboard principal |
| `/projects` | `web/src/app/(dashboard)/projects/page.tsx` | CRUD de projetos |
| `/projects/[id]/briefing` | `.../briefing/page.tsx` | Briefing criativo |
| `/projects/[id]/story` | `.../story/page.tsx` | História gerada |
| `/projects/[id]/image-prompts` | `.../image-prompts/page.tsx` | Prompts de imagem gerais |
| `/projects/[id]/video-prompts` | `.../video-prompts/page.tsx` | Prompts de vídeo gerais |
| `/projects/[id]/scenes` | `.../scenes/page.tsx` | Editor de cenas e geração de imagens |

Componentes compartilhados:

- `web/src/components/StudioShell.tsx`
  - Top navigation
  - Sidebar de projeto
  - Footer visual

O frontend usa rotas internas em `web/src/app/api/*` como camada de proxy para o backend. Essa camada lê cookies HttpOnly, injeta o token JWT no header `Authorization` e tenta refresh automático quando o access token expira.

## 4. Backend

Localização: `api/`

Stack:

- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- Passlib / Argon2
- OpenAI Python SDK

Arquivo principal:

- `api/app/main.py`

Routers ativos:

- `auth_router`
- `health_router`
- `hello_router`
- `projects_router`

Prefixo principal de projetos:

```text
/api/v1/projects
```

Principais endpoints:

| Método | Endpoint | Função |
| --- | --- | --- |
| `GET` | `/api/v1/projects` | Listar projetos do usuário autenticado |
| `POST` | `/api/v1/projects` | Criar projeto |
| `GET` | `/api/v1/projects/{id}` | Buscar projeto |
| `PATCH` | `/api/v1/projects/{id}` | Atualizar projeto |
| `DELETE` | `/api/v1/projects/{id}` | Excluir projeto |
| `GET/POST` | `/api/v1/projects/{id}/briefing` | Ler/criar/atualizar briefing |
| `GET` | `/api/v1/projects/{id}/story` | Ler história |
| `POST` | `/api/v1/projects/{id}/story/generate` | Gerar história |
| `GET` | `/api/v1/projects/{id}/image-prompts` | Ler prompts de imagem |
| `POST` | `/api/v1/projects/{id}/image-prompts/generate` | Gerar prompts de imagem |
| `GET` | `/api/v1/projects/{id}/video-prompts` | Ler prompts de vídeo |
| `POST` | `/api/v1/projects/{id}/video-prompts/generate` | Gerar prompts de vídeo |
| `GET/POST` | `/api/v1/projects/{id}/scenes` | Listar/criar cenas |
| `POST` | `/api/v1/projects/{id}/scenes/generate` | Gerar cenas a partir da história |
| `POST` | `/api/v1/projects/{id}/scenes/generate-image-prompts` | Gerar prompts de imagem por cena |
| `POST` | `/api/v1/projects/{id}/scenes/generate-video-prompts` | Gerar prompts de vídeo por cena |
| `POST` | `/api/v1/projects/{id}/scenes/generate-images` | Gerar imagens por cena |
| `PATCH/DELETE` | `/api/v1/projects/{id}/scenes/{scene_id}` | Atualizar/excluir cena |

## 5. Banco de Dados

Banco: PostgreSQL  
ORM: SQLAlchemy  
Inicialização atual: `api/app/db/init_db.py`

Tabelas principais:

| Tabela | Modelo | Descrição |
| --- | --- | --- |
| `users` | `User` | Usuários autenticáveis |
| `projects` | `Project` | Projetos criativos do usuário |
| `project_briefings` | `ProjectBriefing` | Briefing único por projeto |
| `project_stories` | `ProjectStory` | História única por projeto |
| `project_image_prompts` | `ProjectImagePrompt` | Prompt visual geral do projeto |
| `project_video_prompts` | `ProjectVideoPrompt` | Prompt de vídeo geral do projeto |
| `project_scenes` | `ProjectScene` | Cenas individuais com prompts e imagem gerada |

Observação técnica: existem arquivos placeholder para módulos futuros, como `character.py`, `revision.py`, `story_bible.py`, `image_prompt.py`, `video_prompt.py`, `story.py`, `versioning_service.py` etc. Eles indicam áreas planejadas, mas ainda não implementadas.

## 6. Autenticação e Segurança

O sistema usa autenticação JWT com dois cookies:

- `tt_access`
- `tt_refresh`

Características:

- Cookies HttpOnly.
- Cookies `secure` em produção.
- `sameSite: lax`.
- Access token com expiração curta.
- Refresh token com expiração maior.
- Middleware do Next.js protege rotas privadas.
- Proxy interno do frontend injeta `Authorization: Bearer <token>` nas chamadas ao backend.

Arquivos relevantes:

- `api/app/routers/auth.py`
- `api/app/services/auth_service.py`
- `api/app/core/security.py`
- `api/app/core/dependencies.py`
- `web/src/lib/backend-auth.ts`
- `web/src/middleware.ts`

## 7. Integração com IA

O app possui duas categorias de geração:

1. Geradores textuais baseados em templates internos:
   - História
   - Prompts de imagem
   - Prompts de vídeo
   - Cenas
   - Prompts por cena

2. Geração real de imagem via OpenAI:
   - Endpoint: `/api/v1/projects/{id}/scenes/generate-images`
   - Serviço: `api/app/services/scene_service.py`

Modelos de imagem suportados no backend:

- `gpt-image-2`
- `gpt-image-1.5`
- `gpt-image-1`
- `gpt-image-1-mini`
- `dall-e-3`

Normalização de tamanho:

- GPT Image:
  - `1024x1024`
  - `1536x1024`
  - `1024x1536`
- DALL-E 3:
  - `1024x1024`
  - `1792x1024`
  - `1024x1792`

O backend já trata erro de organização OpenAI não verificada para modelos GPT Image e retorna mensagem amigável.

## 8. Infraestrutura e Deploy

Deploy atual:

- VPS Ubuntu
- Docker Compose
- Nginx Proxy Manager como proxy externo
- Diretório de produção: `/opt/apps/studio`

Serviços Docker:

```text
web
api
postgres
redis
```

Comando de build local:

```bash
cd /Users/marcelo/Documents/studio/web
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Deploy por `rsync` a partir do Mac:

```bash
rsync -avz --progress \
  --exclude '.env' \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude 'new' \
  /Users/marcelo/Documents/studio/ \
  root@72.62.12.98:/opt/apps/studio/
```

Rebuild apenas do frontend:

```bash
cd /opt/apps/studio
docker compose up -d --build web
```

Rebuild de frontend e backend:

```bash
cd /opt/apps/studio
docker compose up -d --build api web
```

## 9. Estado Visual do Produto

O layout atual segue a direção visual “luminous glass” inspirada no protótipo enviado em `/new/`, com:

- Fundo escuro com profundidade.
- Cards translúcidos.
- Topbar estilo produto criativo.
- Sidebar por projeto.
- Dashboard com cards de sessão e atalhos.
- Editor de cenas com timeline e cards visuais.

Correções recentes:

- Ajustes de responsividade.
- Proteção contra overflow de texto.
- Correção de textos sobrepostos.
- Ajuste dos botões de navegação da topbar.
- Normalização dos tamanhos de imagem por modelo.

## 10. Pontos de Atenção

1. Migrações de banco

O projeto possui estrutura Alembic, mas os arquivos de migração aparentam estar incompletos/vazios. Atualmente a criação/atualização das tabelas depende do fluxo de inicialização. Para produção madura, recomenda-se formalizar migrações versionadas.

2. Versionamento de gerações

Ainda não há histórico/rollback de histórias, prompts e cenas. Regenerações podem sobrescrever conteúdo atual.

3. Geração textual por LLM

Histórias e prompts textuais ainda são majoritariamente template-based. O próximo salto de qualidade é usar OpenAI/Anthropic para geração textual real com schema controlado.

4. Imagens em base64 no banco

As imagens geradas são salvas em base64 na tabela de cenas. Isso funciona para V1, mas pode crescer rapidamente o banco. Para escala, recomenda-se mover imagens para object storage.

5. Redis ainda pouco explorado

O Redis está disponível, mas ainda não parece ser usado para filas de geração, cache ou jobs assíncronos.

6. Observabilidade

Logs existem via Docker, mas ainda não há observabilidade estruturada com métricas, tracing, alertas ou painel operacional.

## 11. Próximos Passos Recomendados

Ordem recomendada para completar o V1:

1. Consolidar editor de cenas
   - Edição mais confortável por cena.
   - Reordenação drag-and-drop.
   - Preview visual mais claro.

2. IA textual real
   - História via LLM.
   - Prompt de imagem por cena via LLM.
   - Prompt de vídeo por cena via LLM.
   - Campo `generation_mode` indicando provedor/modelo.

3. Armazenamento de imagens
   - Mover imagens para storage externo.
   - Salvar apenas URL/metadados no Postgres.

4. Versionamento
   - Histórico de gerações.
   - Rollback.
   - Comparação lado a lado.

5. Deploy mais seguro
   - Transformar `/opt/apps/studio` em git repo ou criar script de deploy idempotente.
   - Formalizar backup de banco antes de alterações estruturais.
   - Adicionar healthcheck pós-deploy.

## 12. Conclusão

O Studio ThinkingTools já possui uma base funcional sólida para um V1: autenticação real, CRUD persistido, fluxo criativo completo, editor de cenas, geração de prompts e geração real de imagens por IA. A arquitetura atual é simples e adequada para evolução rápida.

Os principais próximos investimentos técnicos são migrações formais, geração textual real por LLM, armazenamento externo de imagens, versionamento de gerações e melhoria operacional do deploy/observabilidade.
