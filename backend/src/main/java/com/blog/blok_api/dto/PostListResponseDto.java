package com.blog.blok_api.dto;

import java.util.List;

public class PostListResponseDto {
    private List<PostResponseDto> posts;
    private int totalCount;
    private int page;
    private int pageSize;
}
