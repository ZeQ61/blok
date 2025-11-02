package com.blog.blok_api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * PostView - Post görüntülenme kayıtları
 * Aynı kullanıcı aynı postu birden fazla kez görüntülediğinde tekrar sayılmaz
 * Unique constraint: (user_id, post_id) çifti tekil olmalı
 */
@Entity
@Table(name = "post_views", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "post_id"})
       })
public class PostView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    public PostView() {
    }

    public PostView(Long id, User user, Post post, LocalDateTime viewedAt) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.viewedAt = viewedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }
}

