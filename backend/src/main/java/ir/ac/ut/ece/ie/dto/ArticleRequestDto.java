package ir.ac.ut.ece.ie.dto;

import java.util.List;

public class ArticleRequestDto {
    private String title;
    private String summary;
    private String body;
    private List<Long> referenceIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public List<Long> getReferenceIds() { return referenceIds; }
    public void setReferenceIds(List<Long> referenceIds) { this.referenceIds = referenceIds; }
}
