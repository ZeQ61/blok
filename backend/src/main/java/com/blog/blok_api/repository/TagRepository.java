package com.blog.blok_api.repository;

import com.blog.blok_api.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    // Ek sorgular eklenebilir
} 