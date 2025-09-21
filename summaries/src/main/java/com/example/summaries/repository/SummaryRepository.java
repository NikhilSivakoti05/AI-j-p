package com.example.summaries.repository;

import com.example.summaries.model.Summary;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SummaryRepository extends JpaRepository<Summary, Long> {
}
