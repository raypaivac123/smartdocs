# SmartDocs

SmartDocs is an AI-powered document management system built with Java, Spring Boot, PostgreSQL, RabbitMQ and automated testing. The project was created to solve a real problem in organizations that still manage important documents manually using folders, spreadsheets, e-mail attachments and isolated files. This manual process makes it difficult to find documents, classify them, summarize content, extract relevant information, create follow-up tasks and track what happened during processing.

SmartDocs provides a structured backend for uploading PDF documents, storing metadata, processing documents asynchronously, applying AI-based analysis, creating tasks and keeping audit records. The project is being developed as a professional portfolio project focused on backend development, fullstack evolution and QA automation practices.

### The Problem

Many companies and institutions deal with a large number of documents every day, such as contracts, invoices, reports, requests and official records. When this process is manual, documents are hard to find, there is no standardized classification, employees need to read and summarize files manually, there is no automatic workflow after upload and there is little traceability about what was processed or changed.

SmartDocs solves this by creating an intelligent document workflow where each document can be uploaded, stored, classified, analyzed and tracked.

### What SmartDocs Does

Currently, SmartDocs supports authentication with JWT, PDF document upload, metadata persistence in PostgreSQL, asynchronous document processing with RabbitMQ, AI-based analysis structure using Claude, document classification, summary generation, extracted fields storage, task creation, audit logging, API documentation with Swagger/OpenAPI, unit tests with JUnit and Mockito, integration tests with PostgreSQL real database via Docker Compose and code coverage reports with JaCoCo.

The current backend flow is:

1. The user uploads a PDF document.
2. The backend validates the file.
3. The document metadata is saved in PostgreSQL.
4. The document starts with `PENDING` status.
5. An audit event is created.
6. A message is sent to RabbitMQ.
7. A RabbitMQ consumer receives the message.
8. The document is processed asynchronously.
9. The document becomes `PROCESSED` or `ERROR`.
10. The result is stored in the database.

### Current Backend Features

#### Authentication

The project includes JWT-based authentication using Spring Security. Protected endpoints require a bearer token. The authentication layer includes custom security configuration, JWT service, user repository and user details configuration.

#### Document Upload

Users can upload PDF files through the document API. The backend validates whether the file is empty, whether it has a valid name and whether it is a PDF. If the file is valid, the document is saved with `PENDING` status and sent to the asynchronous processing queue.

#### Asynchronous Processing with RabbitMQ

SmartDocs uses RabbitMQ to avoid processing documents directly inside the upload request. This makes the upload flow faster and prepares the system for scalable processing.

Implemented RabbitMQ components:

- `RabbitMQConfig`
- `DocumentProcessingProducer`
- `DocumentProcessingConsumer`
- `DocumentProcessingMessage`

The message flow is:

1. `DocumentProcessingProducer` sends the document ID to the queue.
2. RabbitMQ stores the message.
3. `DocumentProcessingConsumer` receives the message.
4. `DocumentService.processDocument(documentId)` is executed.
5. The document is updated based on the processing result.

#### AI Document Analysis

The project currently contains a `ClaudeService` responsible for analyzing document content. The service is structured to return document classification, extracted fields, summary and suggested tasks.

The current AI result contains:

- `classification`
- `extractedFields`
- `summary`
- `tasks`

A planned improvement is to refactor the AI layer using the Strategy Pattern. Instead of making `DocumentService` depend directly on `ClaudeService`, the project will introduce a `DocumentAiAnalyzer` interface. This will make it easier to switch between providers such as Claude and Azure Document Intelligence.

Planned architecture:

- `DocumentAiAnalyzer`
- `ClaudeDocumentAiAnalyzer`
- `AzureDocumentIntelligenceAnalyzer`

#### Audit Module

The audit module records important actions in the system, such as document upload, successful processing and processing errors. This improves traceability and helps understand what happened during the document lifecycle.

Implemented audit classes:

- `AuditEvent`
- `AuditRepository`
- `AuditService`
- `AuditController`

#### Task Module

SmartDocs can create tasks based on the AI analysis result. These tasks are linked to documents and can be used to guide the user about what should be done after a document is processed.

Implemented task classes:

- `Task`
- `TaskRepository`
- `TaskController`

#### Swagger/OpenAPI Documentation

The backend uses Swagger/OpenAPI for API documentation and testing. Swagger was used during development to test authentication, document upload, document listing, document details and protected endpoints with bearer token.

Swagger URL:

`http://localhost:8080/swagger-ui/index.html`

### Database

SmartDocs uses PostgreSQL as the main database. The database runs locally through Docker Compose. Flyway is used for database migrations, and Hibernate validates the schema using `ddl-auto=validate`.

Database technologies:

- PostgreSQL
- Spring Data JPA
- Hibernate
- Flyway
- Docker Compose

### Docker and Infrastructure

The project uses Docker Compose to run local infrastructure services.

Current Docker services:

- PostgreSQL
- RabbitMQ

Local service URLs:

- PostgreSQL: `localhost:5432`
- RabbitMQ: `localhost:5672`
- RabbitMQ Management: `http://localhost:15672`
- Backend: `http://localhost:8080`

### Testing Strategy

SmartDocs already includes an initial backend testing strategy focused on QA practices.

Current test structure:

- `DocumentServiceTest`
- `DocumentRepositoryIT`
- `SmartdocsApplicationTests`

#### Unit Tests with JUnit and Mockito

`DocumentServiceTest` validates business rules in isolation using JUnit, Mockito and AssertJ.

Implemented unit test scenarios:

1. Uploading a valid PDF should save the document as `PENDING`, associate the authenticated user, create an audit log and send a message to RabbitMQ.
2. Uploading an empty file should be rejected.
3. Uploading a non-PDF file should be rejected.
4. Uploading a file without a name should be rejected.
5. Processing a document successfully should mark it as `PROCESSED`, save classification, summary and extracted fields.
6. When AI processing fails, the document should be marked as `ERROR` and the error message should be saved.

These tests cover both happy paths and negative scenarios, which is important for QA-oriented development.

#### Integration Tests with PostgreSQL

`DocumentRepositoryIT` validates integration with a real PostgreSQL database running through Docker Compose.

It validates:

- Spring Data JPA configuration
- PostgreSQL connection
- Flyway migration validation
- Repository loading
- Custom repository method execution

Current integration test result:

`Tests run: 2, Failures: 0, Errors: 0, Skipped: 0`

#### Code Coverage with JaCoCo

JaCoCo is configured to generate code coverage reports after test execution. It loads execution data, analyzes the SmartDocs classes and generates a coverage report.

### Current Project Status

The current backend is working with:

- Spring Boot running on port `8080`
- PostgreSQL connected through Docker Compose
- RabbitMQ connected through Docker Compose
- Flyway validating migrations
- Swagger available for API testing
- Unit tests passing
- Integration tests passing
- JaCoCo generating coverage reports
- GitHub repository initialized
- First commit completed

Current commit message:

`feat: add SmartDocs backend with RabbitMQ and automated tests`

### Technologies Used

#### Backend

- Java 21
- Spring Boot 3.3.5
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- Lombok
- Flyway
- PostgreSQL
- RabbitMQ
- Swagger/OpenAPI
- PDFBox
- Maven

#### Testing and QA

- JUnit 5
- Mockito
- AssertJ
- Spring Boot Test
- Integration Testing
- JaCoCo
- Docker Compose

#### Infrastructure

- Docker
- Docker Compose
- PostgreSQL container
- RabbitMQ container

### Planned Features

#### 1. Frontend with React and TypeScript

The frontend is still pending. It will be developed using React, TypeScript and Vite. The frontend will consume the Spring Boot API and provide a complete interface for users.

Planned frontend features:

- Login page
- Dashboard page
- Document upload page
- Document list page
- Document details page
- Task list page
- JWT authentication flow
- Loading states
- Error handling
- API integration with the backend

#### 2. Selenium E2E Tests with Page Object Model

The next QA step is to implement end-to-end tests using Selenium WebDriver and Page Object Model.

Planned structure:

- `LoginE2ETest`
- `DocumentUploadE2ETest`
- `LoginPage`
- `DashboardPage`
- `UploadDocumentPage`

Planned scenarios:

- User login
- Invalid login validation
- Upload PDF document
- List uploaded documents
- View document details
- Validate error message for invalid upload

This will complete the testing pyramid:

1. Unit tests
2. Integration tests
3. End-to-end tests

#### 3. Strategy Pattern for AI Providers

The current AI integration will be refactored using the Strategy Pattern.

Planned interface:

```java
public interface DocumentAiAnalyzer {
    DocumentAnalysis analyze(String text, String filename);
}
```

Planned implementations:

- `ClaudeDocumentAiAnalyzer`
- `AzureDocumentIntelligenceAnalyzer`

Benefits:

- Lower coupling
- Easier provider replacement
- Cleaner architecture
- Better separation of responsibilities
- Easier testing
- Stronger portfolio value

#### 4. Azure Blob Storage

Currently, uploaded files are stored locally in `./uploads`. A future improvement is to replace local storage with Azure Blob Storage.

Planned architecture:

- `DocumentStorageService`
- `LocalDocumentStorageService`
- `AzureBlobDocumentStorageService`

Expected benefits:

- Safer file storage
- Cloud-ready architecture
- Better scalability
- More realistic production environment
- Stronger cloud integration for portfolio

#### 5. Azure Document Intelligence

After the Strategy Pattern is implemented, Azure Document Intelligence can be added as a second document analysis provider.

Possible responsibilities:

- OCR
- Text extraction
- Table extraction
- Key-value pair extraction
- Structured document data extraction

Future flow:

1. PDF is uploaded.
2. Azure Document Intelligence extracts document data.
3. Claude or another AI provider generates summary and tasks.
4. SmartDocs stores the structured result.

### How to Run the Backend Locally

Start Docker services:

```bash
docker compose up -d
```

Run the Spring Boot backend on Linux or macOS:

```bash
./mvnw spring-boot:run
```

Run the Spring Boot backend on Windows:

```bash
mvnw.cmd spring-boot:run
```

Access Swagger:

`http://localhost:8080/swagger-ui/index.html`

Access RabbitMQ Management:

`http://localhost:15672`

### How to Run Tests

Run all tests:

```bash
./mvnw test
```

Run all tests on Windows:

```bash
mvnw.cmd test
```

Run only the unit tests:

```bash
mvnw.cmd -Dtest=DocumentServiceTest test
```

Run only the integration tests:

```bash
mvnw.cmd -Dtest=DocumentRepositoryIT test
```

Before running `DocumentRepositoryIT`, make sure PostgreSQL is running through Docker Compose.

### Environment Configuration

Example local configuration:

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/smartdocs
spring.datasource.username=smartdocs
spring.datasource.password=smartdocs123
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=25MB
smartdocs.storage.path=./uploads
```

Important note: sensitive values should be moved to environment variables before production deployment.

### Professional Highlights

This project demonstrates:

- Backend development with Java and Spring Boot
- REST API design
- Authentication with JWT
- PostgreSQL persistence
- Database migration with Flyway
- Asynchronous messaging with RabbitMQ
- AI-based document processing
- API documentation with Swagger
- Unit testing with JUnit and Mockito
- Integration testing with PostgreSQL
- QA mindset with happy path and negative scenario coverage
- Docker-based local infrastructure
- Code coverage with JaCoCo
- Future-ready architecture for React, Selenium and Azure

### Interview Summary

SmartDocs is a document management platform built with Java, Spring Boot, PostgreSQL and RabbitMQ. It allows users to upload PDF documents, stores metadata in a database, processes documents asynchronously, applies AI-based analysis, generates summaries and creates follow-up tasks. The project includes JWT authentication, Swagger documentation, Flyway migrations, unit tests with JUnit and Mockito, integration tests with PostgreSQL and code coverage with JaCoCo. The next steps are to build a React and TypeScript frontend, implement Selenium E2E tests with Page Object Model and add Azure Blob Storage for cloud-based document storage.
