# SmartDocs — Roadmap em Sprints

> Base: commit `a235a23` (main). Sprint 0 reflete o que já está implementado.
> A partir daqui é backlog priorizado, não promessa — ajuste a ordem conforme o tempo disponível.

> **Reordenado em 05/08/2026:** deploy (Render/Neon/CloudAMQP e AWS) adiado por decisão do
> usuário — não é o momento de criar contas/subir o serviço. A infra de deploy já está pronta
> no repo (`render.yaml`, `docs/deploy-render.md`, SSL configurado), só falta executar quando
> fizer sentido. Prioridade agora vai para Sandbox de PDF (segurança) e Landing Page
> (visibilidade pro portfólio), que não dependem de contas externas.

---

## Sprint 0 — Concluído

| # | Item | Status |
|---|------|--------|
| 1 | Auth JWT (login + filtro de validação) | ✅ |
| 2 | Upload de PDF com validação | ✅ |
| 3 | Processamento assíncrono via RabbitMQ | ✅ |
| 4 | Integração com Claude API (classificação/resumo) | ✅ |
| 5 | Migrations Flyway + PostgreSQL | ✅ |
| 6 | Testes unitários (JUnit/Mockito) | ✅ |
| 7 | Testes de integração (Testcontainers) | ✅ |
| 8 | Cobertura de testes (JaCoCo) | ✅ |
| 9 | Swagger/OpenAPI | ✅ |

---

## Sprint 1 — Higiene & Resiliência (concluído)

Objetivo: eliminar o risco de segurança mais óbvio do repo e resolver o ponto que motivou essa lista inteira — hoje uma falha da Claude API mata o documento pra sempre, sem segunda chance.

> Progresso (29/07/2026): Sprint 1 completo — segredos, DLX, reprocessamento e Spring Actuator implementados.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Remover segredos hardcoded | `jwt.secret`, senha do Postgres e do RabbitMQ saem do `application.properties` commitado; usar variáveis de ambiente + `application.properties.example` | P | Alta |
| 2 | Dead Letter Exchange (DLX) | Configurar exchange/fila de DLQ no RabbitMQ com política de retry (N tentativas, backoff) antes de descartar a mensagem | M | Alta |
| 3 | Endpoint de reprocessamento | `POST /api/documents/{id}/reprocess` — reseta status para `PENDING` e republica na fila, sem precisar reenviar o arquivo | P | Alta |
| 4 | Spring Actuator | Adicionar `spring-boot-starter-actuator` + endpoint `/actuator/health` (pré-requisito pro Dockerfile/K8s mais adiante) | P | Média |

*(Esforço: P = pequeno, M = médio, G = grande)*

---

## Sprint 2 — CI & Segurança (concluído)

Objetivo: transformar os tópicos de segurança que você quer levar pra entrevista em algo que existe de verdade no repo, não só em discurso.

> Progresso (29/07/2026): Sprint 2 completo — CI básico, SCA (Dependabot), SAST (Semgrep), DAST (OWASP ZAP baseline) e badge no README.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | CI básico | GitHub Actions rodando `mvn test` a cada push/PR | P | Alta |
| 2 | SCA | Dependabot (nativo do GitHub) ou OWASP Dependency-Check no Maven, escaneando `pom.xml` atrás de CVEs | P | Alta |
| 3 | SAST | Semgrep Action no pipeline, escaneando o código Java | P | Alta |
| 4 | DAST | OWASP ZAP baseline scan contra a aplicação subindo via docker-compose no CI | M | Média |
| 5 | Badge de CI no README | Mostrar status do pipeline | P | Baixa |

---

## Sprint 3 — Empacotamento (concluído)

> Progresso (29/07/2026): Dockerfile, docker-compose completo e variáveis de produção documentadas prontos.
>
> Progresso (31/07/2026): criada a interface `DocumentAiAnalyzer` (`backend/src/main/java/com/smartdocs/ai/`),
> inicialmente com duas implementações — `ClaudeService` (padrão) e `GroqAiAnalyzer` (gratuita, sem cartão) —
> selecionável via `AI_PROVIDER=claude|groq`. Mais tarde no mesmo dia, simplificado pra **uma só**
> implementação: `ClaudeService` removido, `GroqAiAnalyzer` (Llama 3.3 70B via Groq) vira a única forma de
> análise de IA, sem alternância por env var. Motivo: manter duas implementações em paralelo sem necessidade
> real estava virando complexidade acidental — melhor um caminho único e bem definido do que dois "meio-usados".

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Dockerfile da aplicação | Multi-stage build (Maven build → JRE runtime) | P | Média |
| 2 | docker-compose completo | Unir app + Postgres + RabbitMQ num único compose, com healthchecks | P | Média |
| 3 | Variáveis de produção documentadas | README com lista de env vars necessárias em produção | P | Baixa |
| 4 | Abstração de provedor de IA | Interface `DocumentAiAnalyzer` + implementação `GroqAiAnalyzer` (Llama 3.3 70B via Groq, gratuita) como única forma de análise | M | Alta |

---

## Sprint 4 — Frontend em React (concluído)

> Progresso (31/07/2026): reescrita completa em `frontend-react/` (Vite + React 19 + TypeScript),
> responsiva (sidebar vira drawer em telas < 900px). `frontend/` (HTML/JS puro) **removido** — o
> React já conecta na API real (login JWT, documentos, upload, tasks, audit); só os widgets sem
> endpoint de agregação (gráfico semanal, fila de IA) ficam marcados como "demo data" na própria UI.
>
> Bugs reais encontrados testando ponta a ponta: (1) a senha seedada do usuário de demo
> (`dev@smartdocs.de`) não batia com "demo123" anunciado no README — corrigido via
> `V2__fix_demo_user_password.sql`; (2) o `RestTemplate` do `ClaudeService`/`GroqAiAnalyzer` não
> tinha timeout — uma chamada de IA travada bloqueia a thread do RabbitMQ pra sempre e nunca aciona
> o retry/DLX, porque o retry só reage a exceção lançada, não a travamento. Corrigido com
> connect/read timeout em `AppConfig`.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Reescrever em React + TypeScript | 6 páginas + login migradas para componentes | G | Média |
| 2 | Responsividade | Sidebar em drawer, grids que colapsam, tabelas com scroll horizontal em telas pequenas | M | Alta |
| 3 | Conectar API real | Login JWT, documentos, upload, tasks e audit consumindo o backend de verdade | G | Média |
| 4 | Corrigir senha do usuário de demo | Hash seedado na V1 não batia com "demo123"; corrigido via migration V2 | P | Alta |
| 5 | Timeout no cliente HTTP de IA | `RestTemplate` sem timeout travava a thread do consumer e impedia o retry/DLX de agir | P | Alta |

---

## 🔜 Sprint 5 — Sandbox de PDF (próximo passo sugerido)

Objetivo: hoje qualquer PDF enviado é parseado direto no processo da aplicação pelo PDFBox — um PDF malicioso explorando o parser tem acesso ao mesmo processo/memória da API. Esse sprint contém isso. Não depende de nenhuma conta externa nem deploy — pode ser feito 100% local.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Validação de magic bytes | Validar assinatura real do arquivo (`%PDF-`), não só a extensão `.pdf` | P | Alta |
| 2 | Timeout de processamento | Cancelar e marcar como `ERROR` se a extração/análise passar de X segundos | P | Média |
| 3 | Isolar extração de texto | Rodar `extractText`/`countPages` em subprocesso ou container efêmero com limite de CPU/memória | G | Média |

---

## Sprint 6 — Site de Apresentação (Landing Page)

Objetivo: hoje quem abre o app cai direto na tela de login — não existe nenhuma página pública
explicando o que é o SmartDocs antes de autenticar. Um site de apresentação (institucional, sem
precisar de login) ajuda tanto recrutador quanto usuário real a entender a solução antes de entrar.
Não depende de deploy — dá pra construir e demonstrar localmente.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Landing page pública | Página em `/` explicando o problema, a solução e o fluxo (upload → IA → tasks), com CTA pro login | M | Média |
| 2 | Multi-idioma | Suporte a mais de um idioma (pelo menos PT-BR e EN) — mostra que a solução é pensada pra além de um único mercado | M | Média |
| 3 | Screenshots/demo visual | Prints ou GIF curto do dashboard/upload real, não só texto | P | Baixa |

---

## Sprint 7 — Tempo Real

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | SSE de status de documento | `SseEmitter` por documento; o consumer do RabbitMQ dispara evento quando termina o processamento | M | Baixa |
| 2 | Frontend consumindo SSE | Trocar qualquer polling manual do frontend mock por escuta de eventos | P | Baixa |

---

## Sprint 8 — GitOps e Kubernetes

Objetivo: sair do "deploy manual" pra um fluxo onde o estado do cluster é descrito em Git e sincronizado automaticamente. Depende do CI (Sprint 2) e do Dockerfile (Sprint 3), que já existem. Pode ser feito localmente via Minikube, sem precisar de conta em provedor de nuvem — por isso fica antes dos sprints de deploy real.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Manifests base do Kubernetes | Deployment/Service/Ingress + probes de liveness/readiness, base pro Helm chart e pro Argo Application | G | Baixa |
| 2 | Helm chart do backend | Empacotar os manifests (deployment, service, configmap) num Helm chart parametrizável, ao invés de YAML solto | M | Média |
| 3 | CI publicando imagem no registry | Estender o CI (GitHub Actions) pra buildar e publicar a imagem Docker a cada push na main | P | Média |
| 4 | Repositório de config GitOps | Repositório separado só com os manifests/Helm values, versionando o estado desejado do cluster | P | Baixa |
| 5 | ArgoCD sincronizando o cluster | Instalar ArgoCD (local via Minikube) e configurar Application apontando pro repo de config, com sync automático | M | Baixa |

---

## ⏸️ Sprint 9 — Deploy Público Gratuito (adiado)

> **Adiado em 05/08/2026 por decisão do usuário** — não é o momento de criar contas nem colocar o
> serviço no ar. Toda a preparação já está pronta no repo:
>
> - Progresso (31/07/2026): decisão trocada de Railway (trial de $5/30 dias, depois pago) para stack
>   100% gratuita permanente: Render (backend, dorme após 15min ocioso) + Neon (Postgres, sem cartão)
>   + CloudAMQP (RabbitMQ, plano Little Lemur).
> - Progresso (31/07/2026, mais tarde): preparado o repositório pro deploy de verdade — `render.yaml`
>   na raiz + `docs/deploy-render.md`. No caminho, achado que faltava suporte a SSL: o Neon exige
>   `sslmode=require` na URL JDBC e o CloudAMQP (AMQPS) exige `spring.rabbitmq.ssl.enabled=true` +
>   porta `5671`; nenhum dos dois existia antes. Adicionado via `DB_SSLMODE` e
>   `RABBITMQ_SSL_ENABLED`, com default seguro pro ambiente local (`disable`/`false`) pra não quebrar
>   o `docker-compose.yml`. Validado com `docker compose up --wait` depois da mudança.
>
> Quando for retomado, é só criar as 3 contas e seguir o guia — não tem trabalho de código pendente.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Deploy público gratuito | Render (backend) + Neon (Postgres) + CloudAMQP (RabbitMQ) — `render.yaml` + guia prontos, falta criar as contas | M | Média (adiado) |

---

## ⏸️ Sprint 10 — Deploy na AWS (adiado)

Objetivo: Render/Neon/CloudAMQP (Sprint 9) já resolve "ter um link público rápido". Esse sprint é diferente — o
objetivo é experiência de verdade com a nuvem que mais aparece em vaga (EC2/ECS/RDS/VPC/IAM), feita
com calma, não espremida num deploy de fim de semana. Serve de base pra também hospedar o projeto de
dados (`docs/planning/data-pipeline-project-idea.md`) mais pra frente (S3 como data lake, etc.).
Adiado junto com o Sprint 9 pelo mesmo motivo — maior escopo ainda e depende da mesma decisão de "quando ir ao ar".

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | IAM básico | Usuário/role dedicado com permissão mínima necessária (least privilege), nunca usar a conta root pra deploy | P | Alta |
| 2 | RDS PostgreSQL | Banco gerenciado na AWS substituindo o Postgres local, em vez de reaproveitar o Neon | M | Alta |
| 3 | VPC e Security Groups | Rede isolada pro banco (sem IP público) e regras de firewall explícitas liberando só o necessário pro backend | M | Média |
| 4 | ECS Fargate | Rodar o mesmo container do `backend/Dockerfile` já existente em Fargate, sem gerenciar servidor (EC2) diretamente | G | Alta |
| 5 | Application Load Balancer | Expor o serviço do ECS publicamente com HTTPS | M | Média |
| 6 | Documentar custo e teardown | Free tier usado, e passo a passo de como derrubar tudo (`terraform destroy` ou manual) pra não gerar cobrança inesperada | P | Alta |

---

## Backlog / Planejado (sem sprint definida)

- Camada de analytics (agregações, export CSV/Parquet)

---

## Como usar isso

Este arquivo é a versão legível. O arquivo [`kanban-board.csv`](kanban-board.csv) tem os mesmos itens no formato `Lista,Cartão,Descrição,Labels,Prioridade,Esforço` — cada "Lista" é um sprint, pronto pra importar em Trello (via Power-Up de CSV), ClickUp, Jira ou Asana.
