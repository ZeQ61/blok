package com.blog.blok_api.mapper;

import com.blog.blok_api.dto.AdminUserResponseDto;
import com.blog.blok_api.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AdminUserMapper {

    @Mapping(source = "role.name", target = "roleName")
    AdminUserResponseDto toDto(User user);

    List<AdminUserResponseDto> toDtoList(List<User> users);
}
