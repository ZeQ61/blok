package com.blog.blok_api.repository;

import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    int countByAuthor(User author);
    List<Post> findByAuthor(User user);

    List<Post> findAllByAuthor(User user);
    @Query("""
    SELECT p 
    FROM Post p 
    LEFT JOIN Like l ON p.id = l.post.id
    WHERE p.isPublished = true
    GROUP BY p.id
    ORDER BY COUNT(l.id) DESC
""")
    List<Post> findTop5MostLikedPosts(Pageable pageable);

    Page<Post> findByTitleContainingIgnoreCaseOrSlugContainingIgnoreCase(
            String title, String slug, Pageable pageable
    );

    void deleteAllByAuthor(User user);
} 