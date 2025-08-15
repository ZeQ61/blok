package com.blog.blok_api.config;


import com.blog.blok_api.model.Role;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.RoleRepository;
import com.blog.blok_api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    public AdminInitializer(UserRepository userRepository, RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder, AdminProperties adminProperties) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminProperties = adminProperties;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername(adminProperties.getUsername()).isEmpty()) {

            // Role daha önce eklenmiş mi kontrol et
            Role role = roleRepository.findByName(adminProperties.getRole())
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName(adminProperties.getRole());
                        return roleRepository.save(newRole); // önce Role'ü kaydet
                    });

            User admin = new User();
            admin.setUsername(adminProperties.getUsername());
            admin.setHashedPassword(passwordEncoder.encode(adminProperties.getPassword()));
            admin.setRole(role); // kayıtlı rol set ediliyor

            userRepository.save(admin);

            System.out.println("✅ Admin kullanıcı başarıyla oluşturuldu.");
        }
    }
}

