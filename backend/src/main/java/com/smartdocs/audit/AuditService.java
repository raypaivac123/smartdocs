package com.smartdocs.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository repo;

    @Transactional
    public void log(String action, String entity,
                    String entityId, String detail) {
        repo.save(AuditEvent.builder()
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .userName(currentUser())
                .detail(detail)
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditEvent> findAll(String action, String user,
                                    int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("timestamp").descending());
        return repo.findAllFiltered(
                (action != null && !action.isBlank()) ? action : null,
                (user   != null && !user.isBlank())   ? user   : null,
                pageable);
    }

    private String currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated())
                ? auth.getName() : "System";
    }
}