package com.blog.blok_api.dto;

public class LoginResponseDto {
    private Long id;
    private String username;
    private String email;
    private String roleName;
    private boolean isOnline;
    private String token;

    // Parametresiz constructor
    public LoginResponseDto() {
    }

    // Tüm alanları parametre alan constructor
    public LoginResponseDto(Long id, String username, String email, String roleName, boolean isOnline, String token) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roleName = roleName;
        this.isOnline = isOnline;
        this.token = token;
    }

    // Getter ve Setter metodları
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    // Builder sınıfı
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String roleName;
        private boolean isOnline;
        private String token;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder roleName(String roleName) {
            this.roleName = roleName;
            return this;
        }

        public Builder isOnline(boolean isOnline) {
            this.isOnline = isOnline;
            return this;
        }

        public Builder token(String token) {
            this.token = token;
            return this;
        }

        public LoginResponseDto build() {
            return new LoginResponseDto(id, username, email, roleName, isOnline, token);
        }
    }
}
