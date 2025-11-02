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
    void deleteAllByCommentIdIn(List<Long> commentIds);
    void deleteAllByUser(User user);
    void deleteAllByPost(Post post);

    /**
     * Kullanıcının beğendiği post ID'lerini getir - EN SON BEĞENİLEN EN ÜSTTE
     * likedAt'e göre DESC sıralama yapılır
     * Bu metod sadece Post ID'lerini döndürür, Post entity'leri için PostRepository kullanılmalı
     */
    @Query("""
           SELECT l.post.id
           FROM Like l
           WHERE l.user.id = :userId
           ORDER BY l.likedAt DESC
           """)
    List<Long> findLikedPostIdsByUserId(@Param("userId") Long userId);

    // ====== OPTİMİZASYON EKLERİ ======

    // NEW: Tek post için beğenmiş mi? (ID ile, nesne yüklemeden)
    @Query("SELECT COUNT(l) > 0 FROM Like l WHERE l.user.id = :userId AND l.post.id = :postId")
    boolean hasUserLiked(@Param("userId") Long userId, @Param("postId") Long postId);

    // NEW: Görüntülenen post listesi içinde hangilerini beğenmiş? (tek sorgu)
    @Query("""
           SELECT l.post.id
           FROM Like l
           WHERE l.user.id = :userId AND l.post.id IN :postIds
           """)
    List<Long> findLikedPostIdsByUserIdAndPostIds(@Param("userId") Long userId,
                                                  @Param("postIds") List<Long> postIds);
}
