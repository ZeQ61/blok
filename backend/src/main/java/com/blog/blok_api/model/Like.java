package com.blog.blok_api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "post_id"}),
        @UniqueConstraint(columnNames = {"user_id", "comment_id"})
})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Column(nullable = false)
    private LocalDateTime likedAt;

    public Like() {

    }
    public Like(Long id, User user, Post post, Comment comment, LocalDateTime likedAt) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.comment = comment;
        this.likedAt = likedAt;
    }


    public static LikeBuilder builder() {
        return new LikeBuilder();
    }

    public static class LikeBuilder {
        private Long id;
        private User user;
        private Post post;
        private Comment comment;
        private LocalDateTime likedAt;

        public LikeBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LikeBuilder user(User user) {
            this.user = user;
            return this;
        }

        public LikeBuilder post(Post post) {
            this.post = post;
            return this;
        }

        public LikeBuilder comment(Comment comment) {
            this.comment = comment;
            return this;
        }

        public LikeBuilder likedAt(LocalDateTime likedAt) {
            this.likedAt = likedAt;
            return this;
        }

        public Like build() {
            return new Like(id, user, post, comment, likedAt);
        }
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

    public Comment getComment() {
        return comment;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }

    public LocalDateTime getLikedAt() {
        return likedAt;
    }

    public void setLikedAt(LocalDateTime likedAt) {
        this.likedAt = likedAt;
    }


}
