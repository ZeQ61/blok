package com.blog.blok_api.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true) private String username;
    @Column(unique = true) private String email;
    private String hashedPassword;
    @Column(name = "profile_image_url")
    private String profileImageUrl;

    private String bio;
    private boolean isOnline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    private Role role;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;
    @OneToMany(mappedBy = "user") private List<Like> likes;
    @OneToMany(mappedBy = "user") private List<Notification> notifications;
    @OneToMany(mappedBy = "user") private List<SavedPost> savedPosts;

    public User() {
    }

    public User(Long id, String username, String email, String hashedPassword, String profileImgUrl, String bio, boolean isOnline, LocalDateTime createdAt, LocalDateTime updatedAt, Role role, List<Post> posts, List<Comment> comments, List<Like> likes, List<Notification> notifications, List<SavedPost> savedPosts) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.profileImageUrl = profileImgUrl;
        this.bio = bio;
        this.isOnline = isOnline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.role = role;
        this.posts = posts;
        this.comments = comments;
        this.likes = likes;
        this.notifications = notifications;
        this.savedPosts = savedPosts;
    }

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

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public String getProfileImgUrl() {
        return profileImageUrl;
    }

    public void setProfileImgUrl(String profileImgUrl) {
        this.profileImageUrl = profileImgUrl;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public List<Like> getLikes() {
        return likes;
    }

    public void setLikes(List<Like> likes) {
        this.likes = likes;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<SavedPost> getSavedPosts() {
        return savedPosts;
    }

    public void setSavedPosts(List<SavedPost> savedPosts) {
        this.savedPosts = savedPosts;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String hashedPassword;
        private String profileImgUrl;
        private String bio;
        private boolean isOnline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Role role;
        private List<Post> posts;
        private List<Comment> comments;
        private List<Like> likes;
        private List<Notification> notifications;
        private List<SavedPost> savedPosts;

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

        public Builder hashedPassword(String hashedPassword) {
            this.hashedPassword = hashedPassword;
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

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public Builder posts(List<Post> posts) {
            this.posts = posts;
            return this;
        }

        public Builder comments(List<Comment> comments) {
            this.comments = comments;
            return this;
        }

        public Builder likes(List<Like> likes) {
            this.likes = likes;
            return this;
        }

        public Builder notifications(List<Notification> notifications) {
            this.notifications = notifications;
            return this;
        }

        public Builder savedPosts(List<SavedPost> savedPosts) {
            this.savedPosts = savedPosts;
            return this;
        }

        public User build() {
            return new User(id, username, email, hashedPassword, profileImgUrl, bio, isOnline, createdAt,
                    updatedAt, role, posts, comments, likes, notifications, savedPosts);
        }
    }
}
