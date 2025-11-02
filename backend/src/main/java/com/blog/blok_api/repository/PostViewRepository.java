package com.blog.blok_api.repository;

import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.PostView;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    boolean existsByUserAndPost(User user, Post post);
    Optional<PostView> findByUserAndPost(User user, Post post);
    void deleteAllByUser(User user);
    void deleteAllByPost(Post post);
}
