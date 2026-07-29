# Deploy no Railway

Guia pra colocar o SmartDocs no ar usando o [Railway](https://railway.app). O repositório já
está preparado pra isso — `backend/Dockerfile` faz o build multi-stage e `backend/railway.json`
diz ao Railway como buildar e como checar se o serviço está saudável.

> Nota: nomes exatos de variáveis expostas por templates/plugins do Railway podem mudar. Sempre
> confira a aba **Variables** do serviço em questão dentro do painel do Railway antes de copiar
> um nome de variável — os nomes abaixo são os mais comuns hoje, mas trate como ponto de partida,
> não como garantia.

## 1. Criar o projeto

No [railway.app](https://railway.app), crie um projeto novo e vazio (não use um template pronto —
vamos montar os 3 serviços manualmente: Postgres, RabbitMQ e o backend).

## 2. Adicionar o Postgres

`New` → `Database` → `Add PostgreSQL`. O Railway sobe um Postgres gerenciado e expõe variáveis
como `PGHOST` / `RAILWAY_PRIVATE_DOMAIN`, `PGPORT`, `PGDATABASE`, `PGUSER` e a senha (geralmente
`POSTGRES_PASSWORD` ou `PGPASSWORD`, confira na aba Variables desse serviço).

## 3. Adicionar o RabbitMQ

`New` → procure o template oficial de RabbitMQ (ou `Docker Image` → `rabbitmq:3-management-alpine`
se preferir montar manual, igual ao `docker-compose.yml` local). Depois de subir, veja na aba
Variables desse serviço o host privado, usuário e senha expostos.

## 4. Adicionar o backend

`New` → `GitHub Repo` → selecione este repositório (`smartdocs`).

Nas configurações do serviço criado:
- **Root Directory**: `backend`
- O Railway deve detectar o `Dockerfile` automaticamente via `railway.json`. Se não detectar,
  confirme em *Settings → Build* que o builder está como `Dockerfile`.

## 5. Configurar as variáveis de ambiente do backend

Na aba **Variables** do serviço do backend, adicione (usando a sintaxe de referência do Railway,
`${{NomeDoServico.VARIAVEL}}`, pra puxar os valores direto dos outros dois serviços em vez de
copiar e colar):

| Variável | Valor |
|---|---|
| `DB_HOST` | `${{Postgres.RAILWAY_PRIVATE_DOMAIN}}` |
| `DB_PORT` | `${{Postgres.PGPORT}}` (geralmente `5432`) |
| `DB_NAME` | `${{Postgres.PGDATABASE}}` |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | `${{Postgres.POSTGRES_PASSWORD}}` (confira o nome exato na aba Variables do Postgres) |
| `RABBITMQ_HOST` | `${{RabbitMQ.RAILWAY_PRIVATE_DOMAIN}}` |
| `RABBITMQ_PORT` | `5672` |
| `RABBITMQ_USERNAME` / `RABBITMQ_PASSWORD` | conforme exposto pelo serviço do RabbitMQ |
| `JWT_SECRET` | gere um valor novo e aleatório — `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | sua chave real da Claude API |
| `CORS_ALLOWED_ORIGINS` | a URL pública do seu frontend (depois que ele também estiver hospedado em algum lugar) |

Não defina `PORT` manualmente — o Railway injeta essa variável sozinho, e o `application.properties`
já está configurado pra escutar nela (`server.port=${PORT:8080}`).

## 6. Verificar

Depois do deploy, o Railway expõe uma URL pública (`*.up.railway.app`). Teste:

```bash
curl https://<sua-url>.up.railway.app/actuator/health
```

Deve responder `{"status":"UP"}`. Se falhar, o primeiro lugar pra olhar são os *Deploy Logs* do
serviço do backend no painel do Railway.
