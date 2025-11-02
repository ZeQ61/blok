package com.blog.blok_api.repository;

import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndIsDeletedFalse(Post post);
    List<Comment> findByAuthorAndIsDeletedFalse(User author);
    List<Comment> findAllByPostId(Long postId);
    Optional<Comment> findByIdAndAuthorId(Long commentId, Long authorId);

    @Query("SELECT DISTINCT c.post FROM Comment c WHERE c.author.id = :userId AND c.isDeleted = false GROUP BY c.post.id ORDER BY MAX(c.createdAt) DESC")
    List<Post> findDistinctPostsByAuthorId(Long userId);

    void deleteAllByAuthor(User user);
}
