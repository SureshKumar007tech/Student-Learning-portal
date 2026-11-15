package com.portal.course.config;

import com.portal.course.dto.request.CreateCourseRequest;
import com.portal.course.repository.CourseRepository;
import com.portal.course.service.CourseService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CourseService courseService;
    private final boolean seedEnabled;

    public DatabaseInitializer(
            CourseRepository courseRepository,
            CourseService courseService,
            @Value("${portal.seed.enabled:false}") boolean seedEnabled) {
        this.courseRepository = courseRepository;
        this.courseService = courseService;
        this.seedEnabled = seedEnabled;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        if (!courseRepository.existsByCode("CS-HTML")) {
            courseService.createCourse(new CreateCourseRequest(
                    "CS-HTML",
                    "HTML",
                    "Learn webpage structure.",
                    "Beginner",
                    1L,
                    8
            ));
        }

        if (!courseRepository.existsByCode("CS-CSS")) {
            courseService.createCourse(new CreateCourseRequest(
                    "CS-CSS",
                    "CSS",
                    "Learn webpage styling.",
                    "Beginner",
                    1L,
                    12
            ));
        }

        if (!courseRepository.existsByCode("CS-REACT")) {
            courseService.createCourse(new CreateCourseRequest(
                    "CS-REACT",
                    "React",
                    "Build interactive user interfaces.",
                    "Intermediate",
                    1L,
                    20
            ));
        }

        if (!courseRepository.existsByCode("CS-MICROSERVICES")) {
            courseService.createCourse(new CreateCourseRequest(
                    "CS-MICROSERVICES",
                    "Spring Boot Microservices",
                    "Build scalable distributed systems with API Gateway and PostgreSQL.",
                    "Advanced",
                    1L,
                    30
            ));
        }
    }
}
