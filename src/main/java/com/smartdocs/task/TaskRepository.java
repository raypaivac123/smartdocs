package com.smartdocs.task;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByStatus(Task.TaskStatus status, Pageable pageable);

    List<Task> findByDocumentId(UUID documentId);

    long countByStatus(Task.TaskStatus status);
}