# Deploy no Render + Neon + CloudAMQP

Stack 100% gratuita e permanente (sem prazo de trial, sem cartão de crédito). O repositório já
está preparado — `render.yaml` na raiz descreve o serviço do backend, e `backend/Dockerfile` faz
o build.

> Nota: nomes exatos de campos nos dashboards desses serviços podem mudar com o tempo. Trate isso
> como um roteiro, não como print exato da tela.

## 1. Neon (Postgres)

Crie um projeto em [neon.tech](https://neon.tech) (sem cartão). No dashboard do projeto, pegue a
**connection string** ou os campos separados — você vai precisar de: host, porta (normalmente
`5432`), nome do banco, usuário e senha.

## 2. CloudAMQP (RabbitMQ)

Crie uma instância grátis (plano **Little Lemur**) em [cloudamqp.com](https://www.cloudamqp.com).
No painel da instância, pegue a AMQP URL — dela você extrai host, usuário, senha e vhost. A porta
segura (AMQPS) é sempre `5671`, diferente da local (`5672`).

## 3. Render (backend)

No [render.com](https://render.com), `New` → `Blueprint` → conecte este repositório. O Render lê o
`render.yaml` da raiz automaticamente e propõe criar o serviço `smartdocs-backend`.

Durante a criação, ele vai pedir os valores das variáveis marcadas com `sync: false` no
`render.yaml`:

| Variável | De onde vem |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `DB_HOST` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | Painel do Neon (passo 1) |
| `RABBITMQ_HOST` / `RABBITMQ_VHOST` / `RABBITMQ_USERNAME` / `RABBITMQ_PASSWORD` | Painel do CloudAMQP (passo 2) |
| `CORS_ALLOWED_ORIGINS` | URL do frontend hospedado (pode deixar em branco/`*` por enquanto se o frontend ainda não estiver no ar) |

`JWT_SECRET` é gerado automaticamente pelo Render (`generateValue: true`) — não precisa preencher.
`DB_PORT`, `DB_SSLMODE`, `RABBITMQ_PORT` e `RABBITMQ_SSL_ENABLED` já vêm com o valor certo no
`render.yaml`, não mexer.

Plano gratuito do Render "dorme" o serviço depois de ~15 min sem tráfego — a primeira requisição
depois disso demora mais (cold start) enquanto ele acorda.

## 4. Verificar

```bash
curl https://<sua-url>.onrender.com/actuator/health
```

Deve responder `{"status":"UP"}`. Se falhar, os *Logs* do serviço no painel do Render são o
primeiro lugar pra olhar — a causa mais comum é uma das variáveis do Neon/CloudAMQP com o valor
errado.
