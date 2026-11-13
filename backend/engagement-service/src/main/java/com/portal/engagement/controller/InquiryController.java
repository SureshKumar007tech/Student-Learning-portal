package com.portal.engagement.controller;

import com.portal.engagement.dto.request.InquiryRequest;
import com.portal.engagement.dto.request.UpdateInquiryStatusRequest;
import com.portal.engagement.dto.response.ApiResponse;
import com.portal.engagement.dto.response.InquiryResponse;
import com.portal.engagement.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiries")
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> submitInquiry(@Valid @RequestBody InquiryRequest request) {
        InquiryResponse response = inquiryService.submitInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Inquiry submitted successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryResponse>>> getAllInquiries() {
        List<InquiryResponse> list = inquiryService.getAllInquiries();
        return ResponseEntity.ok(ApiResponse.ok("Inquiries retrieved successfully", list));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InquiryResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInquiryStatusRequest request) {
        InquiryResponse response = inquiryService.updateInquiryStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Inquiry status updated", response));
    }
}

