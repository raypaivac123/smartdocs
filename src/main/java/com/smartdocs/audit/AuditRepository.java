package com.smartdocs.audit;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AuditRepository extends JpaRepository<AuditEvent, UUID> {

    @Query("""
        SELECT a FROM AuditEvent a
        WHERE (:action IS NULL OR a.action   = :action)
          AND (:user   IS NULL OR a.userName = :user)
        ORDER BY a.timestamp DESC
    """)
    Page<AuditEvent> findAllFiltered(
            @Param("action") String action,
            @Param("user")   String user,
            Pageable pageable
    );
}