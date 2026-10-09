package ir.ac.ut.ece.ie.dto;
import java.util.List;

public class UserProfileDto {
    private String username;
    private String email;
    private String phoneNumber;
    private List<ArticleSummaryDto> articles;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public List<ArticleSummaryDto> getArticles() { return articles; }
    public void setArticles(List<ArticleSummaryDto> articles) { this.articles = articles; }
}