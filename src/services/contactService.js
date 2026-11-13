import { apiRequest } from "./apiClient";

export async function submitContactInquiry(inquiryData) {
  return await apiRequest("/inquiries", {
    method: "POST",
    body: JSON.stringify(inquiryData)
  });
}

export async function fetchAllInquiries() {
  return await apiRequest("/inquiries");
}

export async function updateInquiryStatus(id, status) {
  return await apiRequest(`/inquiries/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
}
