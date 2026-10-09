package ir.ac.ut.ece.ie.controller;

import java.util.Map;
import java.util.List;
import java.util.HashMap;
import ir.ac.ut.ece.ie.model.User;
import java.util.stream.Collectors;
import java.util.function.Function;
import ir.ac.ut.ece.ie.model.Article;
import ir.ac.ut.ece.ie.dto.UserProfileDto;
import ir.ac.ut.ece.ie.dto.UpdateProfileDto;
import ir.ac.ut.ece.ie.dto.ArticleSummaryDto;
import org.springframework.http.ResponseEntity;
import ir.ac.ut.ece.ie.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final PasswordEncoder encoder;

    public UserController(UserRepository userRepository, ArticleRepository articleRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.encoder = encoder;
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile() {
        User user = getAuthenticatedUser();
        List<Article> userArticles = articleRepository.findByAuthorIdOrderByPublishTimeDesc(user.getId());

        Map<Long, Integer> refCounts = new HashMap<>();
        List<Article> allArticles = articleRepository.findAll();
        for (Article a : allArticles) {
            for (Article ref : a.getReferences()) {
                Long refId = ref.getId();
                refCounts.put(refId, refCounts.getOrDefault(refId, 0) + 1);
            }
        }

        UserProfileDto dto = new UserProfileDto();
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());

        Function<Article, ArticleSummaryDto> mapper = a -> mapToArticleSummaryDto(a, user.getUsername(), refCounts.getOrDefault(a.getId(), 0));
        List<ArticleSummaryDto> articleDtos = userArticles.stream().map(mapper).collect(Collectors.toList());

        dto.setArticles(articleDtos);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileDto request) {
        User user = getAuthenticatedUser();

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
            }
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            if (!request.getPhoneNumber().equals(user.getPhoneNumber()) && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number already in use"));
            }
            if (!request.getPhoneNumber().matches("^\\+?[0-9]{7,15}$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number format"));
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is required to set a new password"));
            }
            if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Incorrect current password"));
            }
            if (encoder.matches(request.getNewPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password cannot be the same as your current password"));
            }
            if (!request.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters and contain a lowercase letter, an uppercase letter, and a digit"));
            }
            user.setPassword(encoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    private ArticleSummaryDto mapToArticleSummaryDto(Article article, String username, int refCount) {
        ArticleSummaryDto summary = new ArticleSummaryDto();
        summary.setId(article.getId());
        summary.setTitle(article.getTitle());
        summary.setSummary(article.getSummary());
        summary.setPublishTime(article.getPublishTime());
        summary.setAuthor(username);
        summary.setReferenceCount(refCount);

        return summary;
    }
}