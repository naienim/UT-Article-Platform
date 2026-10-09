package ir.ac.ut.ece.ie.dto;

import java.util.List;
import java.time.LocalDateTime;

public class ArticleDetailDto {
    private Long id;
    private String title;
    private String summary;
    private String body;
    private LocalDateTime publishTime;
    private List<ArticleSummaryDto> references;
    private int referenceCount;
    private String author;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public LocalDateTime getPublishTime() { return publishTime; }
    public void setPublishTime(LocalDateTime publishTime) { this.publishTime = publishTime; }
    public List<ArticleSummaryDto> getReferences() { return references; }
    public void setReferences(List<ArticleSummaryDto> references) { this.references = references; }
    public int getReferenceCount() { return referenceCount; }
    public void setReferenceCount(int referenceCount) { this.referenceCount = referenceCount; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
}
