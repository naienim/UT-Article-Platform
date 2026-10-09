package ir.ac.ut.ece.ie.dto;

import java.time.LocalDateTime;

public class ArticleSummaryDto {
    private Long id;
    private String title;
    private String summary;
    private LocalDateTime publishTime;
    private int referenceCount;
    private String author;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public LocalDateTime getPublishTime() { return publishTime; }
    public void setPublishTime(LocalDateTime publishTime) { this.publishTime = publishTime; }
    public int getReferenceCount() { return referenceCount; }
    public void setReferenceCount(int referenceCount) { this.referenceCount = referenceCount; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
}
