package com.smartdocs.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestParam(defaultValue = "")  String action,
            @RequestParam(defaultValue = "")  String user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50")int size) {

        Page<AuditEvent> events =
                auditService.findAll(action, user, page, size);

        List<Map<String, Object>> content = events.getContent()
                .stream()
                .map(e -> Map.<String, Object>of(
                        "id",        e.getId().toString(),
                        "timestamp", e.getTimestamp().toString(),
                        "user",      e.getUserName(),
                        "action",    e.getAction(),
                        "entity",    e.getEntity(),
                        "entityId",  e.getEntityId() != null ? e.getEntityId() : "",
                        "detail",    e.getDetail()   != null ? e.getDetail()   : ""
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "content",       content,
                "totalElements", events.getTotalElements(),
                "totalPages",    events.getTotalPages()
        ));
    }
}