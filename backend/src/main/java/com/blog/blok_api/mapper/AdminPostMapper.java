package com.blog.blok_api.mapper;

import com.blog.blok_api.dto.AdminPostResponseDto;
import com.blog.blok_api.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


import java.util.List;

@Mapper(componentModel = "spring")
public interface AdminPostMapper {

    @Mapping(source = "author.username", target = "authorUsername")
    AdminPostResponseDto toDto(Post post);

    List<AdminPostResponseDto> toDtoList(List<Post> posts);
}
