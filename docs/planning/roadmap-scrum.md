# SmartDocs — Roadmap em Sprints

> Base: commit `57bb4c1` (main). Sprint 0 reflete o que já está implementado.
> A partir daqui é backlog priorizado, não promessa — ajuste a ordem conforme o tempo disponível.

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

## Sprint 1 — Higiene & Resiliência (prioridade máxima)

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

## Sprint 2 — CI & Segurança

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

## Sprint 3 — Empacotamento & Deploy

> Progresso (29/07/2026): Dockerfile, docker-compose completo e variáveis de produção documentadas prontos. Deploy público: repositório já preparado pro Railway (`backend/railway.json` + [`docs/deploy-railway.md`](deploy-railway.md)) — falta o usuário criar o projeto no Railway e conectar de fato.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Dockerfile da aplicação | Multi-stage build (Maven build → JRE runtime) | P | Média |
| 2 | docker-compose completo | Unir app + Postgres + RabbitMQ num único compose, com healthchecks | P | Média |
| 3 | Deploy público | Subir em ambiente acessível (Railway/Render/Fly.io) pra recrutador testar sem rodar local | M | Média |
| 4 | Variáveis de produção documentadas | README com lista de env vars necessárias em produção | P | Baixa |

---

## Sprint 4 — Isolamento de Processamento (Sandbox de PDF)

Objetivo: hoje qualquer PDF enviado é parseado direto no processo da aplicação pelo PDFBox — um PDF malicioso explorando o parser tem acesso ao mesmo processo/memória da API. Esse sprint contém isso.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Isolar extração de texto | Rodar `extractText`/`countPages` em subprocesso ou container efêmero com limite de CPU/memória | G | Média |
| 2 | Timeout de processamento | Cancelar e marcar como `ERROR` se a extração/análise passar de X segundos | P | Média |
| 3 | Validação de magic bytes | Validar assinatura real do arquivo (`%PDF-`), não só a extensão `.pdf` | P | Alta |

---

## Sprint 5 — Tempo Real

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | SSE de status de documento | `SseEmitter` por documento; o consumer do RabbitMQ dispara evento quando termina o processamento | M | Baixa |
| 2 | Frontend consumindo SSE | Trocar qualquer polling manual do frontend mock por escuta de eventos | P | Baixa |

---

## Sprint 6 — GitOps e Kubernetes

Objetivo: sair do "deploy manual" (Sprint 3) para um fluxo onde o estado do cluster é descrito em Git e sincronizado automaticamente. Depende do CI do Sprint 2 e do Dockerfile do Sprint 3 já existirem — não faz sentido começar por aqui.

| # | Item | Descrição | Esforço | Prioridade |
|---|------|-----------|---------|------------|
| 1 | Manifests base do Kubernetes | Deployment/Service/Ingress + probes de liveness/readiness, base pro Helm chart e pro Argo Application | G | Baixa |
| 2 | Helm chart do backend | Empacotar os manifests (deployment, service, configmap) num Helm chart parametrizável, ao invés de YAML solto | M | Média |
| 3 | CI publicando imagem no registry | Estender o CI (GitHub Actions) pra buildar e publicar a imagem Docker a cada push na main | P | Média |
| 4 | Repositório de config GitOps | Repositório separado só com os manifests/Helm values, versionando o estado desejado do cluster | P | Baixa |
| 5 | ArgoCD sincronizando o cluster | Instalar ArgoCD (local via Minikube) e configurar Application apontando pro repo de config, com sync automático | M | Baixa |

---

## Backlog / Planejado (sem sprint definida)

- Camada de analytics (agregações, export CSV/Parquet)
- Frontend consumindo a API real (remover dados mockados)

---

## Como usar isso

Este arquivo é a versão legível. O arquivo [`kanban-board.csv`](kanban-board.csv) tem os mesmos itens no formato `Lista,Cartão,Descrição,Labels,Prioridade,Esforço` — cada "Lista" é um sprint, pronto pra importar em Trello (via Power-Up de CSV), ClickUp, Jira ou Asana.
