# SmartDocs

[![CI](https://github.com/raypaivac123/smartdocs/actions/workflows/ci.yml/badge.svg)](https://github.com/raypaivac123/smartdocs/actions/workflows/ci.yml)
[![SAST](https://github.com/raypaivac123/smartdocs/actions/workflows/sast.yml/badge.svg)](https://github.com/raypaivac123/smartdocs/actions/workflows/sast.yml)
[![DAST](https://github.com/raypaivac123/smartdocs/actions/workflows/dast.yml/badge.svg)](https://github.com/raypaivac123/smartdocs/actions/workflows/dast.yml)

SmartDocs is an AI-assisted document workflow platform built as a portfolio project for enterprise software roles. It focuses on document upload, asynchronous processing, auditability, task generation and a lightweight web interface.

The project is organized as a fullstack repository:

```text
smartdocs/
  backend/         Spring Boot API
  frontend-react/  React + TypeScript SPA (Vite)
```

## Why This Project Exists

Many teams still manage contracts, invoices, reports and official records through shared folders, spreadsheets and e-mail attachments. That makes documents hard to search, classify, summarize and track.

SmartDocs models a more structured workflow:

1. A user uploads a PDF.
2. The backend validates and stores the document metadata.
3. The document starts as `PENDING`.
4. An audit event is recorded.
5. A RabbitMQ message triggers asynchronous processing.
6. The document is classified and summarized.
7. Follow-up tasks can be created.
8. The final status becomes `PROCESSED` or `ERROR`.

## Current Features

- JWT authentication with Spring Security
- PDF upload validation
- PostgreSQL persistence with Spring Data JPA
- Flyway database migrations
- Asynchronous document processing with RabbitMQ
- AI-powered document classification and summarization via Groq (Llama 3.3 70B)
- Document classification, summary and extracted fields
- Task module linked to processed documents
- Audit log module for traceability
- Swagger/OpenAPI documentation
- Unit tests with JUnit and Mockito
- Integration tests with PostgreSQL
- JaCoCo coverage configuration
- React + TypeScript frontend (login, dashboard, documents, upload, tasks and audit pages)
  connected to the real backend API — no mocked data for the core flows
- `DocumentAiAnalyzer` interface decoupling document analysis from a specific AI provider
- Dead Letter Queue with automatic retry and exponential backoff for failed AI processing
- Manual reprocessing endpoint for documents that ended up in an error state
- Spring Boot Actuator health checks (with liveness/readiness probes)
- Multi-stage Dockerfile and full docker-compose stack with healthchecks
- CI/CD pipeline: automated tests, dependency scanning (SCA), static analysis (SAST) and
  dynamic analysis (DAST) on every push/PR

## Technologies

### Backend

- Java 21
- Spring Boot 3.3.5
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- RabbitMQ
- JWT
- PDFBox
- Swagger/OpenAPI
- Maven

### Testing

- JUnit 5
- Mockito
- Spring Boot Test
- Testcontainers
- JaCoCo

### Frontend

- React 19
- TypeScript
- Vite
- Consumes the real backend API (JWT login, documents, upload, tasks, audit)

## Running Locally

### Option A — everything in Docker

Builds the backend image and starts it together with Postgres and RabbitMQ:

```bash
docker compose up -d --build
```

### Option B — infra in Docker, backend from your IDE

Useful while developing, since it skips rebuilding the image on every change.

Start only Postgres and RabbitMQ:

```bash
docker compose up -d postgres rabbitmq
```

Run the backend:

```bash
cd backend
mvnw.cmd spring-boot:run
```

On Linux/macOS:

```bash
cd backend
./mvnw spring-boot:run
```

Run the frontend:

```bash
cd frontend-react
npm install
cp .env.example .env
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- RabbitMQ Management: `http://localhost:15672`

Demo frontend credentials:

```text
dev@smartdocs.de / demo123
```

## Environment Variables

Copy `backend/src/main/resources/application.properties.example` for the full list with
comments. Summary of what needs to be set outside of local development:

| Variable | Purpose | Local default |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` | Postgres connection | `localhost` / `5432` / `smartdocs` |
| `DB_USERNAME` / `DB_PASSWORD` | Postgres credentials | `smartdocs` / `smartdocs123` |
| `RABBITMQ_HOST` / `RABBITMQ_PORT` / `RABBITMQ_VHOST` | RabbitMQ connection | `localhost` / `5672` / `/` |
| `RABBITMQ_USERNAME` / `RABBITMQ_PASSWORD` | RabbitMQ credentials | `smartdocs` / `smartdocs123` |
| `JWT_SECRET` | Secret used to sign JWTs — generate a new random value (32+ bytes) for any real environment | dev-only placeholder |
| `GROQ_API_KEY` | Groq API key used for document analysis (free tier, no card required) | placeholder (AI calls will fail) |
| `GROQ_MODEL` | Groq model to use | `llama-3.3-70b-versatile` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of origins allowed to call the API | `http://localhost:5173,http://localhost:80,http://localhost:3000` |

None of these have real secrets committed to the repository — production values must be
injected via the hosting platform's environment/secret configuration.

## Deployment

The backend is containerized (`backend/Dockerfile`) and ready to run on any platform that
accepts a Docker image. The current deployment plan is a free-tier stack — Render (backend),
Neon (Postgres) and CloudAMQP (RabbitMQ) — but that isn't wired up in this repository yet.
See Sprint 3 in [`docs/planning/roadmap-scrum.md`](docs/planning/roadmap-scrum.md) for the
up-to-date plan.

## Running Tests

From `backend/`:

```bash
mvnw.cmd test
```

On Linux/macOS:

```bash
./mvnw test
```

## Portfolio Highlights

This project demonstrates:

- Backend development with Java and Spring Boot
- REST API design
- Authentication and authorization with JWT
- Relational persistence with PostgreSQL
- Database versioning with Flyway
- Asynchronous processing with RabbitMQ
- Document processing with PDFBox
- AI-ready service architecture
- Auditability and task workflow design
- Automated unit and integration testing
- Local infrastructure with Docker Compose
- Fullstack repository organization
- Messaging resilience: Dead Letter Queue, automatic retry with exponential backoff, manual
  reprocessing
- CI/CD pipeline design: automated testing, SCA (Dependabot), SAST (Semgrep) and DAST
  (OWASP ZAP) wired into GitHub Actions
- Multi-stage Docker builds and container hardening (non-root user)
- Production deployment readiness (environment-driven configuration)

## Roadmap

- Add Selenium or Playwright end-to-end tests
- Add Azure Blob Storage support
- Add Azure Document Intelligence as an optional analysis provider
- Isolate PDF text extraction in a sandboxed process (see Sprint 4 in `docs/planning/`)
- GitOps deployment flow with Helm and Argo CD (see Sprint 6 in `docs/planning/`)
