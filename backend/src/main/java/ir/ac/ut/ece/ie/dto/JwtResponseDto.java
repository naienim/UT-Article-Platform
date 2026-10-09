package ir.ac.ut.ece.ie.dto;

public class JwtResponseDto {
    private String token;
    private String username;

    public JwtResponseDto(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
}