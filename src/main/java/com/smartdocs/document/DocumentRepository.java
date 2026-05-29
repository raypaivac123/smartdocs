package com.smartdocs.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID>, JpaSpecificationExecutor<Document> {

    @Query("SELECT d.classification, COUNT(d) FROM Document d GROUP BY d.classification")
    List<Object[]> countByClassification();

    long countByStatus(Document.DocumentStatus status);
}