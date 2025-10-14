package com.blog.blok_api.util;

import com.blog.blok_api.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.Normalizer;

@Component
public class SlugUtil {
    
    private static PostRepository postRepository;
    
    @Autowired
    public void setPostRepository(PostRepository postRepository) {
        SlugUtil.postRepository = postRepository;
    }
    
    public static String toSlug(String input) {
        if (input == null) return null;
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
    
    public static String generateUniqueSlug(String title) {
        if (title == null) return null;
        
        String baseSlug = toSlug(title);
        String slug = baseSlug;
        int counter = 1;
        
        // Eğer postRepository null ise (test ortamında olabilir), sadece base slug döndür
        if (postRepository == null) {
            return baseSlug;
        }
        
        // Slug'un unique olduğundan emin ol
        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }
}
