# SmartDocs Backend

Spring Boot 3 / Java 21 API behind SmartDocs. For the project pitch and how to run the whole
stack (backend + frontend + infra), see the [root README](../README.md).

## Package structure

```text
com.smartdocs
├── ai          Document analysis (DocumentAiAnalyzer interface + GroqAiAnalyzer implementation)
├── audit       Append-only audit log of user/system actions
├── auth        JWT authentication (login, token issuing/validation)
├── config      Security, CORS, Swagger/OpenAPI, shared beans (RestTemplate, ObjectMapper)
├── document    Core domain: Document entity, upload/list/reprocess REST API, processing logic
├── exception   Global exception → HTTP response mapping
├── messaging   RabbitMQ: producer, consumer, Dead Letter Queue consumer, queue/exchange config
└── task        Follow-up tasks generated from a processed document
```

## The document processing pipeline

1. `POST /api/documents/upload` validates and stores the PDF, saves the `Document` as `PENDING`,
   and publishes a message to RabbitMQ (`DocumentProcessingProducer`).
2. `DocumentProcessingConsumer` picks up the message and calls `DocumentService.processDocument()`:
   extracts text with PDFBox, sends it to the configured `DocumentAiAnalyzer`, and stores the
   classification, summary, extracted fields and generated tasks. Status becomes `PROCESSED`.
3. If analysis fails (AI provider down, malformed response, etc.), the exception propagates out of
   the listener instead of being swallowed. Spring AMQP retries automatically with exponential
   backoff (`spring.rabbitmq.listener.simple.retry.*`, currently 4 attempts: 2s → 4s → 8s).
4. If all retries are exhausted, RabbitMQ dead-letters the message (via the `x-dead-letter-exchange`
   argument on the main queue) into a separate DLQ. `DocumentDeadLetterConsumer` picks it up there
   and marks the document `ERROR` — this is the *only* place that happens, so a transient failure
   never permanently kills a document on the first try.
5. `POST /api/documents/{id}/reprocess` resets an `ERROR` document back to `PENDING` and republishes
   it, for manual recovery without re-uploading the file.

This exists because the naive version (catch the exception, mark `ERROR`, done) turns any blip in
the AI provider into a permanent failure. See `RabbitMQConfig` and `DocumentService` for the
implementation, and `docs/planning/roadmap-scrum.md` (Sprint 1) for the reasoning trail.

## AI provider

Document analysis goes through the `DocumentAiAnalyzer` interface (`ai/` package), so
`DocumentService` never talks to a specific AI vendor directly. The only implementation today is
`GroqAiAnalyzer`, which calls Groq's OpenAI-compatible API running Llama 3.3 70B — chosen because
it's free with no credit card, which matters for a publicly reachable demo deployment. Swapping or
adding a provider means implementing the interface and registering it as a `@Service`; nothing else
in the codebase needs to change.

## Running locally

From this directory:

```bash
./mvnw spring-boot:run       # Linux/macOS
mvnw.cmd spring-boot:run     # Windows
```

Requires Postgres and RabbitMQ reachable (see the root README's `docker compose up -d postgres
rabbitmq`, or point the `DB_*`/`RABBITMQ_*` env vars at your own instances).

## Running tests

```bash
./mvnw test       # Linux/macOS
mvnw.cmd test     # Windows
```

Unit tests (JUnit 5 + Mockito) don't need any infrastructure running. Integration tests
(`*IT.java`, e.g. `DocumentRepositoryIT`) use Testcontainers to spin up a real, throwaway Postgres —
they need Docker running, but nothing else.

## Database migrations

Flyway migrations live in `src/main/resources/db/migration/`, applied automatically on startup.
Once a migration is committed and has shipped, it's immutable — a mistake gets fixed with a new
`V{n}__description.sql`, never by editing an old one (see `V2__fix_demo_user_password.sql` for a
real example of that pattern).

## API documentation

Swagger UI is available at `/swagger-ui/index.html` while the app is running (see the root README
for the local URL).

## Health checks

Spring Boot Actuator exposes `/actuator/health` (and `/actuator/health/liveness` /
`/actuator/health/readiness`), unauthenticated. This is what `docker-compose.yml`'s healthcheck and
the DAST CI job poll to know the app is actually ready, not just that the container started.

## Environment variables

See [`src/main/resources/application.properties.example`](src/main/resources/application.properties.example)
for the full, commented list. Nothing in this repo defaults to a real secret — every credential-like
value has a dev-only placeholder that only works against the local `docker-compose.yml` stack.
