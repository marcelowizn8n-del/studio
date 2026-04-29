# Story Agent V1 — setup base

## 1. Copiar variáveis
```bash
cp .env.example .env
```

## 2. Ajustar domínios e segredos
Edite o arquivo `.env` com:
- domínio real
- `SECRET_KEY`
- senha do PostgreSQL

## 3. Subir a stack
```bash
docker compose up -d --build
```

## 4. Validar serviços
- Frontend: `https://app.seudominio.com`
- API docs: `https://api.seudominio.com/docs`
- API hello: `https://api.seudominio.com/api/v1/hello`
- API health: `https://api.seudominio.com/api/v1/health`

## 5. Resultado esperado
A home do Next.js deve exibir o JSON vindo do endpoint `/api/v1/hello` da API.
