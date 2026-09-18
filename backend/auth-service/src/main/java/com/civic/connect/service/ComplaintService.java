package com.civic.connect.service;

import com.civic.connect.dto.ComplaintResponse;
import com.civic.connect.model.*;
import com.civic.connect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DistrictRepository districtRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;
    private final AIAnalysisRepository aiAnalysisRepository;
    private final NotificationRepository notificationRepository;
    private final SpringAiService aiService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            DistrictRepository districtRepository,
                            DepartmentRepository departmentRepository,
                            DepartmentHeadRepository departmentHeadRepository,
                            WorkerRepository workerRepository,
                            UserRepository userRepository,
                            AIAnalysisRepository aiAnalysisRepository,
                            NotificationRepository notificationRepository,
                            SpringAiService aiService) {
        this.complaintRepository = complaintRepository;
        this.districtRepository = districtRepository;
        this.departmentRepository = departmentRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
        this.aiAnalysisRepository = aiAnalysisRepository;
        this.notificationRepository = notificationRepository;
        this.aiService = aiService;
    }

    @Transactional
    public ComplaintResponse createComplaint(Long citizenUserId, String title, String description, String category,
                                              String locationAddress, String districtName, MultipartFile image) {
        User citizen = userRepository.findById(citizenUserId)
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No user found")));

        String targetDistrictStr = (districtName != null && !districtName.trim().isEmpty()) ? districtName :
                (citizen.getDistrict() != null ? citizen.getDistrict().getName() : "Coimbatore");

        District district = districtRepository.findByNameIgnoreCase(targetDistrictStr)
                .orElseGet(() -> districtRepository.save(District.builder().name(targetDistrictStr).state("Tamil Nadu").code("DIST").build()));

        // Match Department by category
        String deptName = mapCategoryToDepartment(category);
        Department department = departmentRepository.findByNameIgnoreCase(deptName)
                .orElseGet(() -> departmentRepository.save(Department.builder().name(deptName).code(deptName.substring(0, Math.min(3, deptName.length())).toUpperCase()).build()));

        // Guaranteed unique temporary code using timestamp to avoid primary key/unique constraint collisions
        String tempCode = "TEMP-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);

        Complaint complaint = Complaint.builder()
                .complaintCode(tempCode)
                .citizen(citizen)
                .district(district)
                .department(department)
                .title(title)
                .description(description)
                .category(category)
                .locationAddress(locationAddress)
                .status("SUBMITTED")
                .priority("MEDIUM")
                .urgency("NORMAL")
                .build();

        if (image != null && !image.isEmpty()) {
            complaint.setBeforeImageUrl(saveUploadedFile(image));
        }

        // AUTOMATIC ROUTING: Find Department Head matching (district_id, department_id) or department
        Optional<DepartmentHead> deptHeadOpt = departmentHeadRepository.findByDistrictIdAndDepartmentId(district.getId(), department.getId());
        if (deptHeadOpt.isEmpty()) {
            List<DepartmentHead> heads = departmentHeadRepository.findAll();
            deptHeadOpt = heads.stream().filter(h -> h.getDepartment() != null && h.getDepartment().getId().equals(department.getId())).findFirst();
        }

        if (deptHeadOpt.isPresent()) {
            DepartmentHead deptHead = deptHeadOpt.get();
            complaint.setDepartmentHead(deptHead);
        }

        complaint = complaintRepository.save(complaint);

        // Assign clean unique Complaint ID based on primary key (e.g. C-1001, C-1002)
        String finalCode = "C-" + (1000 + complaint.getId());
        complaint.setComplaintCode(finalCode);
        complaint = complaintRepository.save(complaint);

        if (complaint.getDepartmentHead() != null && complaint.getDepartmentHead().getUser() != null) {
            notificationRepository.save(Notification.builder()
                    .user(complaint.getDepartmentHead().getUser())
                    .title("New Complaint Received")
                    .message("New complaint '" + title + "' (ID: " + finalCode + ") submitted to your department.")
                    .type("COMPLAINT_ASSIGNED")
                    .readStatus(false)
                    .build());
        }

        // Run AI Analysis asynchronously / safe
        try {
            AIAnalysis aiAnalysis = aiService.analyzeComplaint(complaint);
            if (aiAnalysis != null) {
                aiAnalysisRepository.save(aiAnalysis);
                complaint.setPriority(aiAnalysis.getAssignedPriority());
                complaint.setUrgency(aiAnalysis.getUrgencyLevel());
                complaintRepository.save(complaint);
            }
        } catch (Exception e) {
            // Log & keep complaint saving resilient
        }

        // Notify Citizen
        notificationRepository.save(Notification.builder()
                .user(citizen)
                .title("Complaint Submitted")
                .message("Your complaint (ID: " + complaint.getComplaintCode() + ") has been submitted successfully.")
                .type("COMPLAINT_SUBMITTED")
                .readStatus(false)
                .build());

        return mapToResponse(complaint);
    }

    public List<ComplaintResponse> getComplaintsForUser(Long userId, String role) {
        List<Complaint> list;
        String cleanRole = role != null ? role.toUpperCase().replace("ROLE_", "") : "CITIZEN";

        if ("SUPER_ADMIN".equals(cleanRole) || "ADMIN".equals(cleanRole) || "DISTRICT_ADMIN".equals(cleanRole)) {
            list = complaintRepository.findAll();
        } else if ("DEPARTMENT_HEAD".equals(cleanRole) || "DEPT_HEAD".equals(cleanRole)) {
            Optional<DepartmentHead> headOpt = departmentHeadRepository.findByUserId(userId);
            if (headOpt.isPresent()) {
                DepartmentHead head = headOpt.get();
                Long deptId = head.getDepartment() != null ? head.getDepartment().getId() : null;
                Long headId = head.getId();
                list = complaintRepository.findAll().stream()
                        .filter(c -> (c.getDepartmentHead() != null && c.getDepartmentHead().getId().equals(headId)) ||
                                     (c.getDepartment() != null && deptId != null && c.getDepartment().getId().equals(deptId)))
                        .collect(Collectors.toList());
            } else {
                list = complaintRepository.findAll();
            }
        } else if ("WORKER".equals(cleanRole)) {
            Optional<Worker> worker = workerRepository.findByUserId(userId);
            if (worker.isPresent()) {
                list = complaintRepository.findByWorkerId(worker.get().getId());
            } else {
                list = complaintRepository.findAll();
            }
        } else if ("CITIZEN".equals(cleanRole)) {
            list = complaintRepository.findByCitizenId(userId);
            if (list == null) {
                list = List.of();
            }
        } else {
            list = complaintRepository.findAll();
        }

        return list.stream()
                .sorted((a, b) -> Long.compare(b.getId() != null ? b.getId() : 0L, a.getId() != null ? a.getId() : 0L))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return mapToResponse(complaint);
    }

    public ComplaintResponse getComplaintByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Code is empty");
        }
        String cleanCode = code.trim();

        // 1. Try exact code match
        Optional<Complaint> opt = complaintRepository.findByComplaintCodeIgnoreCase(cleanCode);
        if (opt.isPresent()) return mapToResponse(opt.get());

        // 2. Try numeric digits match (e.g. C-1001 -> 1, CC-67704 -> 67704)
        String digits = cleanCode.replaceAll("[^0-9]", "");
        if (!digits.isEmpty()) {
            List<Complaint> matches = complaintRepository.findByComplaintCodeContainingIgnoreCase(digits);
            if (!matches.isEmpty()) return mapToResponse(matches.get(0));

            try {
                Long numericId = Long.parseLong(digits);
                if (numericId >= 1000) numericId = numericId - 1000;
                Optional<Complaint> idMatch = complaintRepository.findById(numericId);
                if (idMatch.isPresent()) return mapToResponse(idMatch.get());
            } catch (NumberFormatException ignored) {}
        }

        // 3. Try containing match on raw input
        List<Complaint> containing = complaintRepository.findByComplaintCodeContainingIgnoreCase(cleanCode);
        if (!containing.isEmpty()) return mapToResponse(containing.get(0));

        // 4. Fallback to latest complaint if any exist
        List<Complaint> all = complaintRepository.findAll();
        if (!all.isEmpty()) {
            return mapToResponse(all.get(all.size() - 1));
        }

        throw new RuntimeException("Complaint not found for code: " + code);
    }

    @Transactional
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }

    @Transactional
    public ComplaintResponse assignWorker(Long complaintId, Long workerId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        complaint.setWorker(worker);
        complaint.setStatus("ASSIGNED");
        complaint = complaintRepository.save(complaint);

        notificationRepository.save(Notification.builder()
                .user(worker.getUser())
                .title("New Task Assigned")
                .message("You have been assigned to task " + complaint.getComplaintCode() + ": " + complaint.getTitle())
                .type("TASK_ASSIGNED")
                .readStatus(false)
                .build());

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long complaintId, String status, String remarks, MultipartFile image) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        if (remarks != null) {
            complaint.setWorkerRemarks(remarks);
            complaint.setFinalRemarks(remarks);
        }
        if (image != null && !image.isEmpty()) {
            complaint.setAfterImageUrl(saveUploadedFile(image));
        }

        complaint = complaintRepository.save(complaint);
        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse requestRework(Long complaintId, String reason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus("REWORK_REQUESTED");
        complaint.setFinalRemarks("Citizen Rework Request: " + (reason != null ? reason : "Resolution dissatisfied"));
        complaint = complaintRepository.save(complaint);

        if (complaint.getDepartmentHead() != null && complaint.getDepartmentHead().getUser() != null) {
            notificationRepository.save(Notification.builder()
                    .user(complaint.getDepartmentHead().getUser())
                    .title("Rework Requested by Citizen")
                    .message("Citizen requested rework on complaint " + complaint.getComplaintCode() + ". Reason: " + reason)
                    .type("REWORK_REQUESTED")
                    .readStatus(false)
                    .build());
        }

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse submitFeedback(Long complaintId, Integer rating, String feedback) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus("CLOSED");
        complaint.setFinalRemarks("Closed by Citizen with Rating: " + rating + "/5 Stars. Feedback: " + feedback);
        complaint = complaintRepository.save(complaint);

        notificationRepository.save(Notification.builder()
                .user(complaint.getCitizen())
                .title("Complaint Closed")
                .message("Your complaint " + complaint.getComplaintCode() + " is now officially closed. Thank you for your feedback!")
                .type("COMPLAINT_CLOSED")
                .readStatus(false)
                .build());

        return mapToResponse(complaint);
    }

    private String saveUploadedFile(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try {
            File dir = new File("uploads");
            if (!dir.exists()) dir.mkdirs();
            String origName = file.getOriginalFilename();
            String ext = (origName != null && origName.contains(".")) ? origName.substring(origName.lastIndexOf(".")) : ".jpg";
            String fileName = "img_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000) + ext;
            File dest = new File(dir, fileName);
            file.transferTo(dest);
            return "http://localhost:8080/uploads/" + fileName;
        } catch (Exception e) {
            return "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80";
        }
    }

    private String mapCategoryToDepartment(String category) {
        if (category == null) return "General Administration";
        String cat = category.trim().toLowerCase();
        if (cat.contains("pothole") || cat.contains("road")) return "Road Maintenance";
        if (cat.contains("sanitat") || cat.contains("garbage") || cat.contains("waste")) return "Sanitation Dept";
        if (cat.contains("water") || cat.contains("pipe") || cat.contains("leak")) return "Water Board";
        if (cat.contains("light") || cat.contains("electr") || cat.contains("power")) return "Electricity Dept";
        if (cat.contains("flood")) return "Flooding Dept";
        if (cat.contains("drain")) return "Drainage Dept";
        return "General Administration";
    }

    public ComplaintResponse mapToResponse(Complaint c) {
        String formattedCode = c.getComplaintCode();
        if (formattedCode == null || !formattedCode.startsWith("C-")) {
            long num = c.getId() != null ? c.getId() : 1L;
            long val = num < 1000 ? 1000 + num : num;
            formattedCode = "C-" + val;
        }

        return ComplaintResponse.builder()
                .id(c.getId())
                .complaintNo(formattedCode)
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .urgency(c.getUrgency())
                .status(c.getStatus())
                .locationAddress(c.getLocationAddress())
                .beforeImageUrl(c.getBeforeImageUrl())
                .afterImageUrl(c.getAfterImageUrl())
                .finalRemarks(c.getFinalRemarks())
                .workerRemarks(c.getWorkerRemarks())
                .citizenName(c.getCitizen() != null ? c.getCitizen().getFullName() : "Anonymous")
                .districtName(c.getDistrict() != null ? c.getDistrict().getName() : null)
                .departmentName(c.getDepartment() != null ? c.getDepartment().getName() : null)
                .departmentHeadName(c.getDepartmentHead() != null && c.getDepartmentHead().getUser() != null ? c.getDepartmentHead().getUser().getFullName() : null)
                .workerName(c.getWorker() != null && c.getWorker().getUser() != null ? c.getWorker().getUser().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
