package com.portal.course.service.impl;

import com.portal.course.dto.request.CreateCourseRequest;
import com.portal.course.dto.response.CourseResponse;
import com.portal.course.entity.Course;
import com.portal.course.exception.DuplicateResourceException;
import com.portal.course.exception.ResourceNotFoundException;
import com.portal.course.repository.CourseRepository;
import com.portal.course.service.CourseService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<CourseResponse> getAllCourses(String level) {
        List<Course> courses;
        if (level != null && !level.isBlank() && !level.equalsIgnoreCase("All")) {
            courses = courseRepository.findByLevel(level.trim());
        } else {
            courses = courseRepository.findAll();
        }

        return courses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return toResponse(course);
    }

    @Override
    public CourseResponse createCourse(CreateCourseRequest request) {
        if (courseRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Course with code '" + request.getCode() + "' already exists");
        }

        Course course = new Course();
        course.setCode(request.getCode().trim().toUpperCase());
        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription().trim());
        course.setLevel(request.getLevel().trim());
        course.setInstructorId(request.getInstructorId());
        course.setDurationHours(request.getDurationHours());
        course.setActive(true);

        Course saved = courseRepository.save(course);
        return toResponse(saved);
    }

    private CourseResponse toResponse(Course c) {
        return new CourseResponse(
                c.getId(),
                c.getCode(),
                c.getTitle(),
                c.getDescription(),
                c.getLevel(),
                c.getInstructorId(),
                c.getDurationHours(),
                c.isActive(),
                c.getCreatedAt()
        );
    }
}

