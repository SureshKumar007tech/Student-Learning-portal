package com.portal.engagement.service.impl;

import com.portal.engagement.dto.request.InquiryRequest;
import com.portal.engagement.dto.response.InquiryResponse;
import com.portal.engagement.entity.Inquiry;
import com.portal.engagement.exception.BadRequestException;
import com.portal.engagement.exception.ResourceNotFoundException;
import com.portal.engagement.repository.InquiryRepository;
import com.portal.engagement.service.InquiryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;

    public InquiryServiceImpl(InquiryRepository inquiryRepository) {
        this.inquiryRepository = inquiryRepository;
    }

    @Override
    public InquiryResponse submitInquiry(InquiryRequest request) {
        Inquiry inquiry = new Inquiry();
        inquiry.setName(request.getName().trim());
        inquiry.setEmail(request.getEmail().trim().toLowerCase());
        inquiry.setMessage(request.getMessage().trim());
        inquiry.setStatus("NEW");

        Inquiry saved = inquiryRepository.save(inquiry);
        return toResponse(saved);
    }

    @Override
    public List<InquiryResponse> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InquiryResponse updateInquiryStatus(Long id, String status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + id));

        String upper = status.trim().toUpperCase();
        if (!upper.equals("NEW") && !upper.equals("IN_PROGRESS") && !upper.equals("RESOLVED")) {
            throw new BadRequestException("Status must be NEW, IN_PROGRESS, or RESOLVED");
        }

        LocalDateTime resolvedAt = upper.equals("RESOLVED") ? LocalDateTime.now() : null;
        inquiryRepository.updateStatus(id, upper, resolvedAt);
        inquiry.setStatus(upper);
        inquiry.setResolvedAt(resolvedAt);

        return toResponse(inquiry);
    }

    private InquiryResponse toResponse(Inquiry inq) {
        return new InquiryResponse(
                inq.getId(),
                inq.getName(),
                inq.getEmail(),
                inq.getMessage(),
                inq.getStatus(),
                inq.getCreatedAt(),
                inq.getResolvedAt()
        );
    }
}

