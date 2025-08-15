package com.blog.blok_api.dto;

import lombok.Data;

@Data
public class CommentRequestDto {
    private String content;
    private Long postId;
    private Long parentCommentId; // Eğer cevapsa, üst yorumun ID’si


    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
}
