# SmartDocs

SmartDocs is an AI-assisted document workflow platform built as a portfolio project for enterprise software roles. It focuses on document upload, asynchronous processing, auditability, task generation and a lightweight web interface.

The project is organized as a fullstack repository:

```text
smartdocs/
  backend/   Spring Boot API
  frontend/  Static HTML/CSS/JS demo UI
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
- AI analysis layer prepared for Claude integration
- Document classification, summary and extracted fields
- Task module linked to processed documents
- Audit log module for traceability
- Swagger/OpenAPI documentation
- Unit tests with JUnit and Mockito
- Integration tests with PostgreSQL
- JaCoCo coverage configuration
- Static frontend demo with login, dashboard, documents, upload, tasks, audit and settings pages

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

- HTML
- CSS
- Vanilla JavaScript
- Mocked demo data

## Running Locally

Start infrastructure from the repository root:

```bash
docker compose up -d
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

Run the frontend demo:

```bash
cd frontend
node dev-server.js
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

## Roadmap

- Replace the static frontend demo with React and TypeScript
- Integrate the frontend with the real backend API
- Add Selenium or Playwright end-to-end tests
- Introduce a `DocumentAiAnalyzer` strategy interface
- Add Azure Blob Storage support
- Add Azure Document Intelligence as an optional analysis provider
- Add CI with GitHub Actions
