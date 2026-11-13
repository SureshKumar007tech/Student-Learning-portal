package com.portal.engagement.service;

import com.portal.engagement.dto.request.InquiryRequest;
import com.portal.engagement.dto.response.InquiryResponse;

import java.util.List;

public interface InquiryService {
    InquiryResponse submitInquiry(InquiryRequest request);
    List<InquiryResponse> getAllInquiries();
    InquiryResponse updateInquiryStatus(Long id, String status);
}

