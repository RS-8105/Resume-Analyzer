package com.example.resumeanalyzer.service; // <-- change if needed

import com.example.resumeanalyzer.dto.AnalysisResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NlpService {

    @Value("${NLP_URL}")
    private String nlpUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AnalysisResponse analyzeResume(String text, String role) {

        String url = nlpUrl + "/analyze";

        Map<String, String> request = new HashMap<>();
        request.put("resume_text", text);
        request.put("role", role);

        return restTemplate.postForObject(url, request, AnalysisResponse.class);
    }
}