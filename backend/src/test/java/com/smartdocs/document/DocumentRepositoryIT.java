package com.smartdocs.document;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/smartdocs",
        "spring.datasource.username=smartdocs",
        "spring.datasource.password=smartdocs123",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
class DocumentRepositoryIT {

    @Autowired
    private DocumentRepository documentRepository;

    @Test
    void contexto_deveCarregarDocumentRepositoryComPostgresReal() {
        assertThat(documentRepository).isNotNull();
    }

    @Test
    void deveContarDocumentosPorStatus() {
        long quantidadePending = documentRepository.countByStatus(
                Document.DocumentStatus.PENDING
        );

        assertThat(quantidadePending)
                .isGreaterThanOrEqualTo(0);
    }
}