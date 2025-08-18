package com.blog.blok_api.service;

import com.blog.blok_api.dto.CategoryCreateDto;
import com.blog.blok_api.dto.CategoryDto;
import com.blog.blok_api.model.Category;
import com.blog.blok_api.repository.CategoryRepository;
import com.blog.blok_api.util.SlugUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryDto createCategory(CategoryCreateDto dto) {
        // Aynı isimde kategori var mı kontrolü
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new IllegalArgumentException("Bu isimde bir kategori zaten mevcut.");
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setSlug(SlugUtil.toSlug(dto.getName()));

        Category saved = categoryRepository.save(category);

        CategoryDto response = new CategoryDto();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setSlug(saved.getSlug());
        response.setDescription(saved.getDescription());
        return response;
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Kategori bulunamadı: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
