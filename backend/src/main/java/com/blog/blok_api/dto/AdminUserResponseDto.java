package com.blog.blok_api.dto;

import java.time.LocalDateTime;

public class AdminUserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String roleName;
    private boolean isOnline;
    private LocalDateTime createdAt;

    public AdminUserResponseDto() {}

    public AdminUserResponseDto(Long id, String username, String email,
                                String roleName, boolean isOnline, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roleName = roleName;
        this.isOnline = isOnline;
        this.createdAt = createdAt;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // builder
    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String roleName;
        private boolean isOnline;
        private LocalDateTime createdAt;

        public static Builder builder() { return new Builder(); }

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder roleName(String roleName) { this.roleName = roleName; return this; }
        public Builder isOnline(boolean isOnline) { this.isOnline = isOnline; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AdminUserResponseDto build() {
            return new AdminUserResponseDto(id, username, email, roleName, isOnline, createdAt);
        }
    }
}
