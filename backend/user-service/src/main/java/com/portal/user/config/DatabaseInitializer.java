package com.portal.user.config;

import com.portal.user.dto.request.RegisterRequest;
import com.portal.user.repository.UserRepository;
import com.portal.user.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final boolean seedEnabled;
    private final String studentPassword;
    private final String adminPassword;

    public DatabaseInitializer(
            UserRepository userRepository,
            AuthService authService,
            @Value("${portal.seed.enabled:false}") boolean seedEnabled,
            @Value("${portal.seed.student-password:}") String studentPassword,
            @Value("${portal.seed.admin-password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.seedEnabled = seedEnabled;
        this.studentPassword = studentPassword;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        if (!studentPassword.isBlank() && !userRepository.existsByUsername("student")) {
            RegisterRequest student = new RegisterRequest(
                    "student",
                    "student@portal.edu",
                    studentPassword,
                    "Alex",
                    "Morgan",
                    "ROLE_STUDENT"
            );
            authService.registerInternal(student, "ROLE_STUDENT");
        }

        if (!adminPassword.isBlank() && !userRepository.existsByUsername("admin")) {
            RegisterRequest admin = new RegisterRequest(
                    "admin",
                    "admin@portal.edu",
                    adminPassword,
                    "System",
                    "Admin",
                    "ROLE_ADMIN"
            );
            authService.registerInternal(admin, "ROLE_ADMIN");
        }
    }
}
