package com.portal.course.service;

import com.portal.course.dto.request.CreateCourseRequest;
import com.portal.course.dto.response.CourseResponse;
import com.portal.course.entity.Course;
import com.portal.course.exception.DuplicateResourceException;
import com.portal.course.exception.ResourceNotFoundException;
import com.portal.course.repository.CourseRepository;
import com.portal.course.service.impl.CourseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CourseServiceTest {

    private CourseRepositoryStub courseRepository;
    private CourseServiceImpl courseService;

    static class CourseRepositoryStub extends CourseRepository {
        List<Course> allCourses = new ArrayList<>();
        Course singleCourse;
        boolean codeExists = false;

        public CourseRepositoryStub() {
            super(null);
        }

        @Override
        public List<Course> findAll() {
            return allCourses;
        }

        @Override
        public Optional<Course> findById(Long id) {
            return Optional.ofNullable(singleCourse);
        }

        @Override
        public boolean existsByCode(String code) {
            return codeExists;
        }
    }

    @BeforeEach
    void setUp() {
        courseRepository = new CourseRepositoryStub();
        courseService = new CourseServiceImpl(courseRepository);
    }

    @Test
    void getAllCourses_ShouldReturnListOfCourses() {
        Course c1 = new Course();
        c1.setId(1L);
        c1.setCode("CS-HTML");
        c1.setTitle("HTML");
        c1.setLevel("Beginner");

        Course c2 = new Course();
        c2.setId(2L);
        c2.setCode("CS-REACT");
        c2.setTitle("React");
        c2.setLevel("Intermediate");

        courseRepository.allCourses = List.of(c1, c2);

        List<CourseResponse> result = courseService.getAllCourses("All");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("HTML");
        assertThat(result.get(1).getTitle()).isEqualTo("React");
    }

    @Test
    void getCourseById_WhenExists_ShouldReturnCourse() {
        Course c = new Course();
        c.setId(1L);
        c.setCode("CS-HTML");
        c.setTitle("HTML");
        c.setLevel("Beginner");

        courseRepository.singleCourse = c;

        CourseResponse result = courseService.getCourseById(1L);

        assertThat(result.getTitle()).isEqualTo("HTML");
        assertThat(result.getCode()).isEqualTo("CS-HTML");
    }

    @Test
    void getCourseById_WhenNotFound_ShouldThrowException() {
        courseRepository.singleCourse = null;

        assertThatThrownBy(() -> courseService.getCourseById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createCourse_WhenDuplicateCode_ShouldThrowException() {
        CreateCourseRequest request = new CreateCourseRequest("CS-HTML", "HTML", "Desc", "Beginner", 1L, 10);
        courseRepository.codeExists = true;

        assertThatThrownBy(() -> courseService.createCourse(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");
    }
}
