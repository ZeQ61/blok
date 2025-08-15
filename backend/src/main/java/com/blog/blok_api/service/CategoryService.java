package com.blog.blok_api.service;

import com.blog.blok_api.dto.CategoryCreateDto;
import com.blog.blok_api.dto.CategoryDto;

public interface CategoryService {
    CategoryDto createCategory(CategoryCreateDto dto);
}