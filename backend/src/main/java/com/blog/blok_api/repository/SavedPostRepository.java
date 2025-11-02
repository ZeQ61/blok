package com.blog.blok_api.repository;

import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.SavedPost;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Optional<SavedPost> findByUserAndPost(User user, Post post);
    List<SavedPost> findAllByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT sp.post FROM SavedPost sp WHERE sp.user.id = :userId ORDER BY sp.createdAt DESC")
    List<Post> findSavedPostsByUserId(@Param("userId") Long userId);
    
    void deleteByUserAndPost(User user, Post post);
    void deleteAllByPost(Post post);
    void deleteAllByUser(User user);
}

