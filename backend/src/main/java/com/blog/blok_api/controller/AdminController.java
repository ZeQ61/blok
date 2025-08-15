package com.blog.blok_api.controller;

import com.blog.blok_api.dto.AdminPostResponseDto;
import com.blog.blok_api.dto.AdminUserResponseDto;
import com.blog.blok_api.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;


    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    @GetMapping("/dashboard")
    public ResponseEntity<String> getAdminPanel() {
        return ResponseEntity.ok("Admin Paneli Girişi Başarılı!");
    }

    // YENİ: Tüm kullanıcıları listele (sadece ADMIN)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserResponseDto>> listUsers(
            @RequestParam(value = "q", required = false) String q,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC, size = 20)
            Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(q, pageable));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/posts")
    public ResponseEntity<Page<AdminPostResponseDto>> listPosts(
            @RequestParam(value = "q", required = false) String q,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC, size = 20)
            Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAllPosts(q, pageable));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }
}
