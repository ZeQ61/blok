package com.blog.blok_api.repository;

import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndIsDeletedFalse(Post post);
    List<Comment> findByAuthorAndIsDeletedFalse(User author);
    List<Comment> findAllByPostId(Long postId);
    Optional<Comment> findByIdAndAuthorId(Long commentId, Long authorId);

    @Query("SELECT DISTINCT c.post FROM Comment c " +
           "LEFT JOIN FETCH c.post.author a " +
           "LEFT JOIN FETCH a.role " +
           "LEFT JOIN FETCH c.post.category " +
           "LEFT JOIN FETCH c.post.tags " +
           "WHERE c.author.id = :userId AND c.isDeleted = false " +
           "GROUP BY c.post.id " +
           "ORDER BY MAX(c.createdAt) DESC")
    List<Post> findDistinctPostsByAuthorId(@Param("userId") Long userId);

    void deleteAllByAuthor(User user);
    
    // Toplu comment sayıları için
    @Query("SELECT c.post.id, COUNT(c) FROM Comment c WHERE c.post.id IN :postIds AND c.isDeleted = false GROUP BY c.post.id")
    List<Object[]> countCommentsByPostIds(@Param("postIds") List<Long> postIds);
}
