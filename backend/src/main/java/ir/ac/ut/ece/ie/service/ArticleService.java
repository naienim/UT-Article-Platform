package ir.ac.ut.ece.ie.service;

import java.util.*;
import ir.ac.ut.ece.ie.dto.*;
import ir.ac.ut.ece.ie.model.User;
import java.util.stream.Collectors;
import ir.ac.ut.ece.ie.model.Article;
import org.springframework.stereotype.Service;
import ir.ac.ut.ece.ie.repository.UserRepository;
import ir.ac.ut.ece.ie.repository.ArticleRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;


@Service
public class ArticleService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository, UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ArticleDetailDto createArticle(ArticleRequestDto dto) {
        validateArticle(dto);

        if (articleRepository.existsByTitleIgnoreCase(dto.getTitle())) {
            throw new IllegalArgumentException("Article title must be unique");
        }

        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        Article article = new Article(dto.getTitle(), dto.getSummary(), dto.getBody());
        article.setAuthor(author);

        if (dto.getReferenceIds() != null && !dto.getReferenceIds().isEmpty()) {
            List<Article> refs = articleRepository.findAllById(dto.getReferenceIds());
            article.addReferences(refs);
        }

        Article saved = articleRepository.save(article);
        return mapToDetailDto(saved);
    }

    @Transactional
    public ArticleDetailDto updateArticle(Long id, ArticleRequestDto dto) {
        validateArticle(dto);

        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            throw new NoSuchElementException("Article not found");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("You do not have permission to edit this article.");
        }

        article.setTitle(dto.getTitle());
        article.setSummary(dto.getSummary());
        article.setBody(dto.getBody());

        article.clearReferences();
        if (dto.getReferenceIds() != null && !dto.getReferenceIds().isEmpty()) {
            List<Article> refs = articleRepository.findAllById(dto.getReferenceIds());
            article.addReferences(refs);
        }

        Article saved = articleRepository.save(article);
        return mapToDetailDto(saved);
    }

    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            throw new NoSuchElementException("Article not found");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("You do not have permission to delete this article.");
        }

        List<Article> allArticles = articleRepository.findAll();
        for (Article a : allArticles) {
            if (a.removeReference(article)) {
                articleRepository.save(a);
            }
        }
        articleRepository.delete(article);
    }

    @Transactional(readOnly = true)
    public List<ArticleSummaryDto> getArticles(String query, String sortBy) {
        List<Article> articles;
        if (query != null && !query.isBlank()) {
            articles = articleRepository.searchByTitleOrSummary(query.trim());
        }
        else if ("date".equalsIgnoreCase(sortBy)) {
            articles = articleRepository.findAllByOrderByPublishTimeDesc();
        }
        else {
            articles = articleRepository.findAll();
        }

        Map<Long, Integer> refCounts = computeReferenceCounts();
        if ("date".equalsIgnoreCase(sortBy)) {
            articles.sort(Comparator.comparing(Article::getPublishTime).reversed());
        }
        else {
            articles.sort(Comparator.comparingInt((Article a) -> getReferenceCount(a, refCounts)).reversed());
        }

        if (query != null && !query.isBlank()) {
            String LowerCaseQuery = query.toLowerCase().trim();
            List<Article> titleMatches = new ArrayList<>();
            List<Article> summaryMatches = new ArrayList<>();
            for (Article a : articles) {
                String title = a.getTitle().toLowerCase();
                String summary = a.getSummary().toLowerCase();
                if (title.contains(LowerCaseQuery)) {
                    titleMatches.add(a);
                }
                else if (summary.contains(LowerCaseQuery)) {
                    summaryMatches.add(a);
                }
            }

            articles = new ArrayList<>();
            articles.addAll(titleMatches);
            articles.addAll(summaryMatches);
        }

        List<ArticleSummaryDto> summaries = new ArrayList<>();
        for (Article article : articles) {
            int count = refCounts.getOrDefault(article.getId(), 0);
            summaries.add(mapToSummaryDto(article, count));
        }
        return summaries;
    }

    @Transactional(readOnly = true)
    public ArticleDetailDto getArticleById(Long id) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article == null) {
            throw new NoSuchElementException("Article not found");
        }
        return mapToDetailDto(article);
    }

    private void validateArticle(ArticleRequestDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Article title cannot be empty");
        }
        if (dto.getSummary() == null || dto.getSummary().isBlank()) {
            throw new IllegalArgumentException("Article summary cannot be empty");
        }
        if (dto.getBody() == null || dto.getBody().isBlank()) {
            throw new IllegalArgumentException("Article body cannot be empty");
        }
    }

    private void verifyAuthor(Article article) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("You do not have permission to delete this article.");
        }
    }

    private Map<Long, Integer> computeReferenceCounts() {
        Map<Long, Integer> counts = new HashMap<>();
        for (Article a : articleRepository.findAll()) {
            for (Article ref : a.getReferences()) {
                Long id = ref.getId();
                int newCount = counts.getOrDefault(id, 0) + 1;
                counts.put(id, newCount);
            }
        }
        return counts;
    }

    private int getReferenceCount(Article article, Map<Long, Integer> refCounts) {
        return refCounts.getOrDefault(article.getId(), 0);
    }

    private ArticleSummaryDto mapToSummaryDto(Article article, int refCount) {
        ArticleSummaryDto dto = new ArticleSummaryDto();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSummary(article.getSummary());
        dto.setPublishTime(article.getPublishTime());
        dto.setReferenceCount(refCount);
        dto.setAuthor(article.getAuthor().getUsername());
        return dto;
    }

    private ArticleDetailDto mapToDetailDto(Article article) {
        ArticleDetailDto dto = new ArticleDetailDto();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSummary(article.getSummary());
        dto.setBody(article.getBody());
        dto.setPublishTime(article.getPublishTime());
        dto.setAuthor(article.getAuthor().getUsername());

        Map<Long, Integer> refCounts = computeReferenceCounts();
        dto.setReferenceCount(refCounts.getOrDefault(article.getId(), 0));
        List<ArticleSummaryDto> references = new ArrayList<>();
        for (Article ref : article.getReferences()) {
            int count = refCounts.getOrDefault(ref.getId(), 0);
            references.add(mapToSummaryDto(ref, count));
        }
        dto.setReferences(references);
        return dto;
    }
}
