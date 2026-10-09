package ir.ac.ut.ece.ie.model;

import java.util.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "articles")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String summary;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String body;

    @Column(nullable = false)
    private LocalDateTime publishTime;

    @ManyToMany
    @JoinTable(name = "article_references", joinColumns = @JoinColumn(name = "article_id"), inverseJoinColumns = @JoinColumn(name = "ref_article_id"))
    private List<Article> references = new ArrayList<>();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    public Article() {}

    public Article(String title, String summary, String body) {
        this.title = title;
        this.summary = summary;
        this.body = body;
        this.publishTime = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }

    public void setSummary(String summary) { this.summary = summary; }

    public String getBody() { return body; }

    public void setBody(String body) { this.body = body; }

    public LocalDateTime getPublishTime() { return publishTime; }

    public void setPublishTime(LocalDateTime publishTime) { this.publishTime = publishTime; }

    public List<Article> getReferences() { return references; }

    public void setReferences(List<Article> references) { this.references = references; }

    public void addReference(Article article) { references.add(article); }

    public boolean removeReference(Article article) { return references.remove(article); }

    public void clearReferences() { references.clear(); }

    public void addReferences(List<Article> refs) {
        if (refs == null || refs.isEmpty()) {
            return;
        }
        this.references.addAll(refs);
    }

    public User getAuthor() { return author; }

    public void setAuthor(User author) { this.author = author; }
}
