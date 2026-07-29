# ── Stage 1: build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -B package -DskipTests

# ── Stage 2: runtime ────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S smartdocs \
    && adduser -S smartdocs -G smartdocs \
    && mkdir -p /app/uploads \
    && chown -R smartdocs:smartdocs /app

COPY --from=build --chown=smartdocs:smartdocs /app/target/smartdocs-*.jar app.jar

USER smartdocs

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
