package com.blog.blok_api.dto;

public class ToggleLikeResponse {
    private Long postId;
    private boolean liked;
    private String message;

    public ToggleLikeResponse(Long postId, boolean liked, String message) {
        this.postId = postId;
        this.liked = liked;
        this.message = message;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public boolean isLiked() {
        return liked;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
