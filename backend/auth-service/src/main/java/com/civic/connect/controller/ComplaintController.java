package com.civic.connect.controller;

import com.civic.connect.dto.ComplaintResponse;
import com.civic.connect.security.UserPrincipal;
import com.civic.connect.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("category") String category,
            @RequestParam("locationAddress") String locationAddress,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Long citizenId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(complaintService.createComplaint(citizenId, title, description, category, locationAddress, district, image));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        String role = user != null ? user.getAuthorities().iterator().next().getAuthority() : "ROLE_CITIZEN";
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, role));
    }

    @GetMapping("/citizen")
    public ResponseEntity<List<ComplaintResponse>> getCitizenComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        String role = user != null ? user.getAuthorities().iterator().next().getAuthority() : "ROLE_CITIZEN";
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, role));
    }

    @GetMapping("/depthead")
    public ResponseEntity<List<ComplaintResponse>> getDeptHeadComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        String role = user != null ? user.getAuthorities().iterator().next().getAuthority() : "ROLE_DEPARTMENT_HEAD";
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, role));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ComplaintResponse>> getAdminComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, "ROLE_ADMIN"));
    }

    @GetMapping("/worker")
    public ResponseEntity<List<ComplaintResponse>> getWorkerComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, "ROLE_WORKER"));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ComplaintResponse> getComplaintByIdNumeric(@PathVariable("id") Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ComplaintResponse> getComplaintByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(complaintService.getComplaintByCode(code));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignWorker(
            @PathVariable("id") Long complaintId,
            @RequestParam("workerId") Long workerId) {
        return ResponseEntity.ok(complaintService.assignWorker(complaintId, workerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable("id") Long complaintId,
            @RequestParam(value = "status", required = false, defaultValue = "RESOLVED") String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "afterImage", required = false) MultipartFile afterImage) {
        MultipartFile finalImg = image != null ? image : afterImage;
        return ResponseEntity.ok(complaintService.updateStatus(complaintId, status, remarks, finalImg));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ComplaintResponse> resolveComplaint(
            @PathVariable("id") Long complaintId,
            @RequestParam(value = "status", required = false, defaultValue = "RESOLVED") String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "afterImage", required = false) MultipartFile afterImage) {
        MultipartFile finalImg = image != null ? image : afterImage;
        return ResponseEntity.ok(complaintService.updateStatus(complaintId, status, remarks, finalImg));
    }

    @PutMapping("/{id}/rework")
    public ResponseEntity<ComplaintResponse> requestRework(
            @PathVariable("id") Long complaintId,
            @RequestBody Map<String, String> payload) {
        String reason = payload != null ? payload.get("reason") : "Rework requested";
        return ResponseEntity.ok(complaintService.requestRework(complaintId, reason));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ComplaintResponse> submitFeedback(
            @PathVariable("id") Long complaintId,
            @RequestBody Map<String, Object> payload) {
        Integer rating = payload != null && payload.get("rating") != null ? Integer.parseInt(payload.get("rating").toString()) : 5;
        String feedback = payload != null && payload.get("comments") != null ? payload.get("comments").toString() : "Good service";
        return ResponseEntity.ok(complaintService.submitFeedback(complaintId, rating, feedback));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable("id") Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok().build();
    }
}
