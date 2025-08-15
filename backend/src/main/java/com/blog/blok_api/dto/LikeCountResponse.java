package com.blog.blok_api.dto;


public class LikeCountResponse {
    private Long postId;
    private int likeCount;

    public LikeCountResponse(Long postId, int likeCount) {
        this.postId = postId;
        this.likeCount = likeCount;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public int getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }
}
