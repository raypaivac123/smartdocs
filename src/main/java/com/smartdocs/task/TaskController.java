package com.smartdocs.task;

import com.smartdocs.audit.AuditService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepo;
    private final AuditService   auditService;

    @GetMapping
    public ResponseEntity<PageResponse> list(
            @RequestParam(defaultValue = "")  String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50")int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<Task> tasks = status.isBlank()
                ? taskRepo.findAll(pageable)
                : taskRepo.findByStatus(parseStatus(status), pageable);

        List<TaskDto> dtos = tasks.getContent()
                .stream().map(TaskDto::from).collect(Collectors.toList());

        return ResponseEntity.ok(
                new PageResponse(dtos, tasks.getTotalElements()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest req) {

        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Aufgabe nicht gefunden: " + id));

        String oldStatus = task.getStatus().name();
        task.setStatus(parseStatus(req.status()));
        taskRepo.save(task);

        auditService.log("STATUS", "Task", id.toString(),
                "Status: " + oldStatus + " → " + task.getStatus().name());

        return ResponseEntity.ok(TaskDto.from(task));
    }

    /* ── Helpers ─────────────────────────────────────────── */
    private Task.TaskStatus parseStatus(String val) {
        try {
            return Task.TaskStatus.valueOf(
                    val.toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return Task.TaskStatus.PENDING;
        }
    }

    /* ── DTOs ────────────────────────────────────────────── */
    record UpdateStatusRequest(@NotBlank String status) {}

    record TaskDto(
            String id, String title, String status,
            String priority, String dueDate,
            String assignedTo, String documentId,
            String documentName, String createdAt
    ) {
        static TaskDto from(Task t) {
            return new TaskDto(
                    t.getId().toString(),
                    t.getTitle(),
                    t.getStatus().name().toLowerCase().replace("_", "-"),
                    t.getPriority().name().toLowerCase(),
                    t.getDueDate() != null ? t.getDueDate().toString() : null,
                    t.getAssignedTo(),
                    t.getDocument() != null
                            ? t.getDocument().getId().toString() : null,
                    t.getDocument() != null
                            ? t.getDocument().getFilename() : null,
                    t.getCreatedAt().toString()
            );
        }
    }

    record PageResponse(List<TaskDto> content, long totalElements) {}
}