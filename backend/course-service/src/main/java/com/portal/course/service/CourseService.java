package com.portal.course.service;

import com.portal.course.dto.request.CreateCourseRequest;
import com.portal.course.dto.response.CourseResponse;

import java.util.List;

public interface CourseService {
    List<CourseResponse> getAllCourses(String level);
    CourseResponse getCourseById(Long id);
    CourseResponse createCourse(CreateCourseRequest request);
}

