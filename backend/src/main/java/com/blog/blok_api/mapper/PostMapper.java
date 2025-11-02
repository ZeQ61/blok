package com.blog.blok_api.mapper;

import com.blog.blok_api.dto.PostRequestDto;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.UserDto;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.Tag;
import com.blog.blok_api.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;


import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface PostMapper {

    Post toEntity(PostRequestDto dto);

    @Mapping(source = "author", target = "author", qualifiedByName = "author")
    @Mapping(source = "category.name", target = "categoryName", ignore = true) // Category artık kullanılmıyor
    @Mapping(source = "tags", target = "tagNames")
    PostResponseDto toDto(Post post);

    // MapStruct `@Named` ile özel author dönüşümü
    @Named("author")
    default UserDto mapAuthor(User author) {
        return userToUserDto(author);
    }

    // Elle UserDto dönüşümü - profil resmi de eklendi
    default UserDto userToUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .profileImgUrl(user.getProfileImgUrl())
                .build();
    }

    // Set<Tag> → List<String>
    default List<String> mapTagsToNames(Set<Tag> tags) {
        if (tags == null) return List.of();
        return tags.stream()
                .map(Tag::getName)
                .collect(Collectors.toList());
    }

    List<PostResponseDto> toDtoList(List<Post> posts);
}
