package com.blog.blok_api.dto;

import java.time.LocalDateTime;

public class ProfileResponseDto {
    private Long id;
    private String username;
    private String email;
    private String profileImgUrl;
    private String bio;
    private boolean isOnline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int postsCount;
    private int likesReceived;

    // Parametresiz constructor
    public ProfileResponseDto() {
    }

    // Tüm alanları parametre alan constructor
    public ProfileResponseDto(Long id, String username, String email, String profileImgUrl, String bio,
                              boolean isOnline, LocalDateTime createdAt, LocalDateTime updatedAt,
                              int postsCount, int likesReceived) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.profileImgUrl = profileImgUrl;
        this.bio = bio;
        this.isOnline = isOnline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.postsCount = postsCount;
        this.likesReceived = likesReceived;
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

    public String getProfileImgUrl() {
        return profileImgUrl;
    }

    public void setProfileImgUrl(String profileImgUrl) {
        this.profileImgUrl = profileImgUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getPostsCount() {
        return postsCount;
    }

    public void setPostsCount(int postsCount) {
        this.postsCount = postsCount;
    }

    public int getLikesReceived() {
        return likesReceived;
    }

    public void setLikesReceived(int likesReceived) {
        this.likesReceived = likesReceived;
    }

    // Builder sınıfı
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String profileImgUrl;
        private String bio;
        private boolean isOnline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int postsCount;
        private int likesReceived;

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

        public Builder profileImgUrl(String profileImgUrl) {
            this.profileImgUrl = profileImgUrl;
            return this;
        }

        public Builder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public Builder isOnline(boolean isOnline) {
            this.isOnline = isOnline;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Builder postsCount(int postsCount) {
            this.postsCount = postsCount;
            return this;
        }

        public Builder likesReceived(int likesReceived) {
            this.likesReceived = likesReceived;
            return this;
        }

        public ProfileResponseDto build() {
            return new ProfileResponseDto(id, username, email, profileImgUrl, bio, isOnline,
                    createdAt, updatedAt, postsCount, likesReceived);
        }
    }
}
