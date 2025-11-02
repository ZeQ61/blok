package com.blog.blok_api.dto;

import java.util.List;

/**
 * PostViewRequestDto - Toplu post görüntülenme takibi için request DTO
 * Frontend'den ekranda görünen post ID'lerini içerir
 */
public class PostViewRequestDto {
    private List<Long> postIds;

    public PostViewRequestDto() {
    }

    public PostViewRequestDto(List<Long> postIds) {
        this.postIds = postIds;
    }

    public List<Long> getPostIds() {
        return postIds;
    }

    public void setPostIds(List<Long> postIds) {
        this.postIds = postIds;
    }
}

