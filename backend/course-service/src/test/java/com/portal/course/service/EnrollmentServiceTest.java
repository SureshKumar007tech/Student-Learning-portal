package com.portal.course.service;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.EnrollmentResponse;
import com.portal.course.entity.Course;
import com.portal.course.entity.Enrollment;
import com.portal.course.exception.DuplicateResourceException;
import com.portal.course.exception.ForbiddenException;
import com.portal.course.exception.UnauthorizedException;
import com.portal.course.repository.CourseRepository;
import com.portal.course.repository.EnrollmentRepository;
import com.portal.course.service.impl.EnrollmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EnrollmentServiceTest {

    private EnrollmentRepositoryStub enrollmentRepository;
    private CourseRepositoryStub courseRepository;
    private EnrollmentServiceImpl enrollmentService;

    static class CourseRepositoryStub extends CourseRepository {
        Map<Long, Course> courses = new HashMap<>();

        public CourseRepositoryStub() {
            super(null);
        }

        @Override
        public Optional<Course> findById(Long id) {
            return Optional.ofNullable(courses.get(id));
        }
    }

    static class EnrollmentRepositoryStub extends EnrollmentRepository {
        Map<Long, Enrollment> enrollments = new HashMap<>();
        long nextId = 100L;

        public EnrollmentRepositoryStub() {
            super(null);
        }

        @Override
        public Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId) {
            return enrollments.values().stream()
                    .filter(e -> Objects.equals(e.getStudentId(), studentId) && Objects.equals(e.getCourseId(), courseId))
                    .findFirst();
        }

        @Override
        public Enrollment save(Enrollment e) {
            if (e.getId() == null) {
                e.setId(nextId++);
            }
            enrollments.put(e.getId(), e);
            return e;
        }

        @Override
        public List<Enrollment> findByStudentId(Long studentId) {
            List<Enrollment> list = new ArrayList<>();
            for (Enrollment e : enrollments.values()) {
                if (Objects.equals(e.getStudentId(), studentId)) {
                    list.add(e);
                }
            }
            return list;
        }

        @Override
        public Optional<Enrollment> findById(Long id) {
            return Optional.ofNullable(enrollments.get(id));
        }

        @Override
        public void updateProgress(Long id, int progressPercent, String status, LocalDateTime completedAt) {
            Enrollment e = enrollments.get(id);
            if (e != null) {
                e.setProgressPercent(progressPercent);
                e.setStatus(status);
                e.setCompletedAt(completedAt);
            }
        }
    }

    @BeforeEach
    void setUp() {
        enrollmentRepository = new EnrollmentRepositoryStub();
        courseRepository = new CourseRepositoryStub();
        enrollmentService = new EnrollmentServiceImpl(enrollmentRepository, courseRepository);
    }

    @Test
    void enrollStudent_WhenStudentRole_ShouldDeriveIdentityFromContext() {
        Course course = new Course();
        course.setId(10L);
        course.setTitle("Java Basics");
        courseRepository.courses.put(10L, course);

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId(10L);
        request.setStudentId(999L); // Malicious/spoofed student id in body

        EnrollmentResponse response = enrollmentService.enrollStudent(request, "1", "ROLE_STUDENT");

        assertThat(response.getStudentId()).isEqualTo(1L);
        assertThat(response.getCourseTitle()).isEqualTo("Java Basics");
    }

    @Test
    void enrollStudent_WhenDuplicateEnrollment_ShouldThrowDuplicateResourceException() {
        Course course = new Course();
        course.setId(10L);
        course.setTitle("Java Basics");
        courseRepository.courses.put(10L, course);

        Enrollment existing = new Enrollment();
        existing.setId(1L);
        existing.setCourseId(10L);
        existing.setStudentId(1L);
        enrollmentRepository.enrollments.put(1L, existing);

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId(10L);

        assertThatThrownBy(() -> enrollmentService.enrollStudent(request, "1", "ROLE_STUDENT"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already enrolled");
    }

    @Test
    void getStudentEnrollments_WhenAccessingOtherStudent_ShouldThrowForbiddenException() {
        // Authenticated student 1 tries to access student 2's enrollments
        assertThatThrownBy(() -> enrollmentService.getStudentEnrollments(2L, "1", "ROLE_STUDENT"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void getStudentEnrollments_WhenAdminAccessesOtherStudent_ShouldSucceed() {
        Enrollment e = new Enrollment();
        e.setId(20L);
        e.setCourseId(10L);
        e.setStudentId(2L);
        enrollmentRepository.enrollments.put(20L, e);

        List<EnrollmentResponse> responses = enrollmentService.getStudentEnrollments(2L, "99", "ROLE_ADMIN");
        assertThat(responses).hasSize(1);
    }

    @Test
    void updateProgress_WhenStudentTriesToUpdateAnotherStudentsEnrollment_ShouldThrowForbidden() {
        Enrollment enrollment = new Enrollment();
        enrollment.setId(50L);
        enrollment.setCourseId(10L);
        enrollment.setStudentId(2L); // Belongs to student 2
        enrollmentRepository.enrollments.put(50L, enrollment);

        UpdateProgressRequest req = new UpdateProgressRequest(50);

        // Student 1 attempts to update
        assertThatThrownBy(() -> enrollmentService.updateProgress(50L, req, "1", "ROLE_STUDENT"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void updateProgress_WhenStudentUpdatesOwnEnrollment_ShouldSucceed() {
        Course course = new Course();
        course.setId(10L);
        course.setTitle("Full Stack Course");
        courseRepository.courses.put(10L, course);

        Enrollment enrollment = new Enrollment();
        enrollment.setId(50L);
        enrollment.setCourseId(10L);
        enrollment.setStudentId(1L); // Belongs to student 1
        enrollment.setStatus("ENROLLED");
        enrollment.setProgressPercent(0);
        enrollmentRepository.enrollments.put(50L, enrollment);

        UpdateProgressRequest req = new UpdateProgressRequest(100);

        EnrollmentResponse response = enrollmentService.updateProgress(50L, req, "1", "ROLE_STUDENT");

        assertThat(response.getProgressPercent()).isEqualTo(100);
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
    }
}
