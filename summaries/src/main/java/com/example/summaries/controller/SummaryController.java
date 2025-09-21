package com.example.summaries.controller;

import com.example.summaries.model.Summary;
import com.example.summaries.service.SummaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/summaries")
public class SummaryController {

    private final SummaryService service;
    private final RestTemplate restTemplate;

    @Value("${external.api.url}")
    private String externalApiUrl;

    public SummaryController(SummaryService service, RestTemplate restTemplate) {
        this.service = service;
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public List<Summary> list() {
        return service.findAll();
    }

    @PostMapping
    public Summary create(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String apiResponse;

        try {
            Map<String, Object> payload = Map.of(
                    "model", "deepseek/deepseek-r1-0528-qwen3-8b:free",
                    "messages", List.of(
                            Map.of("role", "system",
                                    "content", "You are an expert at processing and summarizing text content. Follow the user's instructions precisely."),
                            Map.of("role", "user",
                                    "content", prompt)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 2000
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> resp = restTemplate.exchange(
                    externalApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                List<?> choices = (List<?>) resp.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map first = (Map) choices.get(0);
                    Map message = (Map) first.get("message");
                    apiResponse = message.get("content").toString();
                } else {
                    apiResponse = "[No AI response]";
                }
            } else {
                apiResponse = "[Error: Proxy returned non-success]";
            }

        } catch (Exception e) {
            e.printStackTrace();
            apiResponse = "[Fallback Summary]: " +
                    (prompt == null ? "" :
                            (prompt.length() > 200 ? prompt.substring(0, 200) + "..." : prompt));
        }

        Summary s = new Summary(prompt, apiResponse);
        return service.save(s);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Summary> update(@PathVariable Long id, @RequestBody Summary payload) {
        return service.findById(id).map(existing -> {
            existing.setPrompt(payload.getPrompt());
            existing.setResponse(payload.getResponse());
            service.save(existing);
            return ResponseEntity.ok(existing);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
