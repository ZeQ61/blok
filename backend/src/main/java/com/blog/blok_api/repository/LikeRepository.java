package com.blog.blok_api.repository;
import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Like;
import com.blog.blok_api.model.User;
import com.blog.blok_api.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByUserAndPost(User user, Post post);
    boolean existsByUserAndComment(User user, Comment comment);

    Optional<Like> findByUserAndPost(User user, Post post);
    Optional<Like> findByUserAndComment(User user, Comment comment);

    Long countByPost(Post post);
    Long countByComment(Comment comment);

    int countByPostId(Long postId);
    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.author.id = :userId")
    int countByAuthorPosts(@Param("userId") Long userId);

    void deleteAllByPostId(Long postId);
    void deleteAllByCommentIdIn(List<Long> commentIds); // önemli!
    @Query("SELECT DISTINCT l.post FROM Like l " +
           "LEFT JOIN FETCH l.post.author a " +
           "LEFT JOIN FETCH a.role " +
           "LEFT JOIN FETCH l.post.category " +
           "LEFT JOIN FETCH l.post.tags " +
           "WHERE l.user.id = :userId AND l.post IS NOT NULL " +
           "ORDER BY l.likedAt DESC")
    List<Post> findLikedPostsByUserId(@Param("userId") Long userId);

    List<Like> findAllByUserId(Long userId);

    void deleteAllByUser(User user);

    void deleteAllByPost(Post post);
    
    // Toplu like sayıları için
    @Query("SELECT l.post.id, COUNT(l) FROM Like l WHERE l.post.id IN :postIds GROUP BY l.post.id")
    List<Object[]> countLikesByPostIds(@Param("postIds") List<Long> postIds);
    
    // Kullanıcının beğendiği post ID'lerini toplu al
    @Query("SELECT l.post.id FROM Like l WHERE l.user.id = :userId AND l.post.id IN :postIds")
    List<Long> findLikedPostIdsByUserAndPosts(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);
}



