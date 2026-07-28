CREATE TABLE users (
                       id         BIGSERIAL PRIMARY KEY,
                       email      VARCHAR(255) NOT NULL UNIQUE,
                       password   VARCHAR(255) NOT NULL,
                       name       VARCHAR(255) NOT NULL,
                       role       VARCHAR(50)  NOT NULL DEFAULT 'USER',
                       created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
                           id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                           filename         VARCHAR(500) NOT NULL,
                           original_filename VARCHAR(500),
                           file_path        VARCHAR(1000),
                           file_size_bytes  BIGINT,
                           page_count       INTEGER,
                           classification   VARCHAR(100),
                           status           VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
                           summary          TEXT,
                           extracted_fields JSONB        NOT NULL DEFAULT '{}',
                           uploaded_by_id   BIGINT       REFERENCES users(id),
                           uploaded_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                           processed_at     TIMESTAMPTZ,
                           error_message    TEXT
);

CREATE TABLE tasks (
                       id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
                       title       TEXT        NOT NULL,
                       document_id UUID        REFERENCES documents(id) ON DELETE CASCADE,
                       status      VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                       priority    VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
                       due_date    DATE,
                       assigned_to VARCHAR(255),
                       created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
                           id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
                           timestamp TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
                           user_name VARCHAR(255) NOT NULL,
                           action    VARCHAR(100) NOT NULL,
                           entity    VARCHAR(100) NOT NULL,
                           entity_id VARCHAR(255),
                           detail    TEXT
);

CREATE INDEX idx_documents_status   ON documents(status);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_at DESC);
CREATE INDEX idx_tasks_status       ON tasks(status);
CREATE INDEX idx_audit_timestamp    ON audit_log(timestamp DESC);

INSERT INTO users (email, password, name, role) VALUES
                                                    ('dev@smartdocs.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Anna Becker', 'USER'),
                                                    ('admin@smartdocs.de', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Klaus Fischer', 'ADMIN');