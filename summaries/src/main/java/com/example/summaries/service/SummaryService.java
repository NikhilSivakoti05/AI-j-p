package com.example.summaries.service;

import com.example.summaries.model.Summary;
import com.example.summaries.repository.SummaryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SummaryService {

    private final SummaryRepository repository;

    public SummaryService(SummaryRepository repository) {
        this.repository = repository;
    }

    public List<Summary> findAll() {
        return repository.findAll();
    }

    public Optional<Summary> findById(Long id) {
        return repository.findById(id);
    }

    public Summary save(Summary summary) {
        return repository.save(summary);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
