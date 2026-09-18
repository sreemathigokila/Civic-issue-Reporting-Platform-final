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

    @PostMapping(consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
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

    @PostMapping(consumes = "application/json")
    public ResponseEntity<ComplaintResponse> createComplaintJson(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody Map<String, Object> body) {
        Long citizenId = user != null ? user.getId() : 1L;
        String title = body.get("title") != null ? body.get("title").toString() : "Civic Complaint";
        String description = body.get("description") != null ? body.get("description").toString() : "";
        String category = body.get("category") != null ? body.get("category").toString() : "Roads & Potholes";
        String locationAddress = body.get("locationAddress") != null ? body.get("locationAddress").toString() : "Coimbatore";
        String district = body.get("district") != null ? body.get("district").toString() : "Coimbatore";
        return ResponseEntity.ok(complaintService.createComplaint(citizenId, title, description, category, locationAddress, district, null));
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

    @GetMapping({"/admin/citizens", "/citizens"})
    public ResponseEntity<List<Map<String, Object>>> getCitizens() {
        return ResponseEntity.ok(complaintService.getCitizens());
    }

    @GetMapping("/depthead")
    public ResponseEntity<List<ComplaintResponse>> getDeptHeadComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        String role = user != null ? user.getAuthorities().iterator().next().getAuthority() : "ROLE_DEPARTMENT_HEAD";
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, role));
    }

    @GetMapping({"/depthead/workers", "/admin/workers", "/workers"})
    public ResponseEntity<List<Map<String, Object>>> getDeptHeadWorkers(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(complaintService.getDeptHeadWorkers(userId));
    }

    @GetMapping({"/admin", "/admin/complaints"})
    public ResponseEntity<List<ComplaintResponse>> getAdminComplaints(@AuthenticationPrincipal UserPrincipal user) {
        Long userId = user != null ? user.getId() : 1L;
        return ResponseEntity.ok(complaintService.getComplaintsForUser(userId, "ROLE_ADMIN"));
    }

    @GetMapping({"/stats", "/public/stats"})
    public ResponseEntity<Map<String, Object>> getComplaintStats() {
        return ResponseEntity.ok(complaintService.getComplaintStats());
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

    @GetMapping("/code/{code}")
    public ResponseEntity<ComplaintResponse> getComplaintByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(complaintService.getComplaintByCode(code));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintByIdOrCode(@PathVariable("id") String idOrCode) {
        if (idOrCode != null && (idOrCode.startsWith("C-") || idOrCode.startsWith("c-"))) {
            return ResponseEntity.ok(complaintService.getComplaintByCode(idOrCode));
        }
        try {
            Long id = Long.parseLong(idOrCode);
            return ResponseEntity.ok(complaintService.getComplaintById(id));
        } catch (Exception e) {
            return ResponseEntity.ok(complaintService.getComplaintByCode(idOrCode));
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignWorker(
            @PathVariable("id") Long complaintId,
            @RequestParam("workerId") Long workerId,
            @RequestParam(value = "deadline", required = false) String deadline) {
        return ResponseEntity.ok(complaintService.assignWorker(complaintId, workerId, deadline));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable("id") Long complaintId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "remarks", required = false) String remarks,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "afterImage", required = false) MultipartFile afterImage) {
        String finalStatus = (status != null && !status.trim().isEmpty()) ? status : "IN_PROGRESS";
        MultipartFile finalImg = image != null ? image : afterImage;
        return ResponseEntity.ok(complaintService.updateStatus(complaintId, finalStatus, remarks, finalImg));
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
    public ResponseEntity<?> deleteComplaint(@PathVariable("id") Long id) {
        try {
            complaintService.deleteComplaint(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
