package com.blog.blok_api.dto;

import java.time.LocalDateTime;

public class AdminPostResponseDto {
    private Long id;
    private String title;
    private String slug;
    private String authorUsername;
    private boolean published;
    private LocalDateTime createdAt;

    public AdminPostResponseDto() {}

    public AdminPostResponseDto(Long id, String title, String slug,
                                String authorUsername, boolean published,
                                LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.slug = slug;
        this.authorUsername = authorUsername;
        this.published = published;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
