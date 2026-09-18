package com.civic.connect.config;

import com.civic.connect.model.*;
import com.civic.connect.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final DistrictRepository districtRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final WorkerRepository workerRepository;
    private final CitizenRepository citizenRepository;
    private final ComplaintRepository complaintRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    public DataInitializer(RoleRepository roleRepository,
                           DistrictRepository districtRepository,
                           DepartmentRepository departmentRepository,
                           UserRepository userRepository,
                           DepartmentHeadRepository departmentHeadRepository,
                           WorkerRepository workerRepository,
                           CitizenRepository citizenRepository,
                           ComplaintRepository complaintRepository,
                           PasswordEncoder passwordEncoder,
                           DataSource dataSource) {
        this.roleRepository = roleRepository;
        this.districtRepository = districtRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.workerRepository = workerRepository;
        this.citizenRepository = citizenRepository;
        this.complaintRepository = complaintRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            try {
                stmt.execute("ALTER TABLE complaints ADD (work_deadline VARCHAR2(100))");
            } catch (Exception ignored) {}
        } catch (Exception e) {
            System.err.println("Could not alter table complaints: " + e.getMessage());
        }
        // 1. Roles
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").build()));
        Role deptHeadRole = roleRepository.findByName("ROLE_DEPARTMENT_HEAD")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_DEPARTMENT_HEAD").build()));
        Role workerRole = roleRepository.findByName("ROLE_WORKER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_WORKER").build()));
        Role citizenRole = roleRepository.findByName("ROLE_CITIZEN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CITIZEN").build()));

        // 2. Standardized 7 Departments
        Department roadDept = getOrCreateDept("Road Maintenance", "ROAD", "Roads & Potholes Repair");
        Department sanitationDept = getOrCreateDept("Sanitation Dept", "SAN", "Sanitation & Waste Management");
        Department waterDept = getOrCreateDept("Water Board", "WAT", "Water & Utilities Supply");
        Department electricityDept = getOrCreateDept("Electricity Dept", "ELE", "Electrical & Streetlights");
        Department floodingDept = getOrCreateDept("Flooding Dept", "FLD", "Flooding & Monsoon Control");
        Department drainageDept = getOrCreateDept("Drainage Dept", "DRN", "Drainage & Sewerage Systems");
        Department generalDept = getOrCreateDept("General Administration", "GEN", "General Civic Complaints");

        List<Department> allDepts = List.of(roadDept, sanitationDept, waterDept, electricityDept, floodingDept, drainageDept, generalDept);

        // 3. Districts
        List<String> districtNames = List.of("Coimbatore", "Chennai", "Madurai", "Trichy");
        String encodedPass = passwordEncoder.encode("password123");

        // 4. Super Admin
        userRepository.findByEmailOrMobile("admin@civicconnect.gov.in", "admin@civicconnect.gov.in").ifPresentOrElse(
                u -> { u.setPassword(encodedPass); userRepository.save(u); },
                () -> userRepository.save(User.builder()
                        .fullName("Super Admin")
                        .email("admin@civicconnect.gov.in")
                        .password(encodedPass)
                        .mobile("9876543210")
                        .role(superAdminRole)
                        .build())
        );

        // 5. Seed Demo Dept Head: Ramesh (Roads - Coimbatore)
        District cbe = districtRepository.findByNameIgnoreCase("Coimbatore")
                .orElseGet(() -> districtRepository.save(District.builder().name("Coimbatore").code("CBE").state("Tamil Nadu").build()));

        User rameshUser = userRepository.findByEmailOrMobile("ramesh.cbe.roads@civicconnect.gov.in", "coimbatore.road.head@civicconnect.gov.in")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Ramesh Kumar")
                        .email("ramesh.cbe.roads@civicconnect.gov.in")
                        .password(encodedPass)
                        .mobile("9876543211")
                        .role(deptHeadRole)
                        .district(cbe)
                        .department(roadDept)
                        .designation("Roads Head")
                        .build()));
        rameshUser.setPassword(encodedPass);
        userRepository.save(rameshUser);

        if (departmentHeadRepository.findByDistrictIdAndDepartmentId(cbe.getId(), roadDept.getId()).isEmpty()) {
            departmentHeadRepository.save(DepartmentHead.builder()
                    .user(rameshUser)
                    .district(cbe)
                    .department(roadDept)
                    .build());
        }

        // 6. Seed Demo Dept Head: Senthil (Water - Coimbatore)
        User senthilUser = userRepository.findByEmailOrMobile("senthil.cbe.water@civicconnect.gov.in", "senthil.cbe.water@civicconnect.gov.in")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Senthil Nathan")
                        .email("senthil.cbe.water@civicconnect.gov.in")
                        .password(encodedPass)
                        .mobile("9876543212")
                        .role(deptHeadRole)
                        .district(cbe)
                        .department(waterDept)
                        .designation("Water Head")
                        .build()));
        senthilUser.setPassword(encodedPass);
        userRepository.save(senthilUser);

        if (departmentHeadRepository.findByDistrictIdAndDepartmentId(cbe.getId(), waterDept.getId()).isEmpty()) {
            departmentHeadRepository.save(DepartmentHead.builder()
                    .user(senthilUser)
                    .district(cbe)
                    .department(waterDept)
                    .build());
        }

        // 7. Seed Demo Worker: Venkatesan (Roads - Coimbatore)
        User venkatUser = userRepository.findByEmailOrMobile("venkatesan@civicconnect.gov.in", "venkatesan@civicconnect.gov.in")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Venkatesan")
                        .email("venkatesan@civicconnect.gov.in")
                        .password(encodedPass)
                        .mobile("9952012345")
                        .role(workerRole)
                        .district(cbe)
                        .department(roadDept)
                        .designation("Senior Road Inspector")
                        .build()));
        venkatUser.setPassword(encodedPass);
        userRepository.save(venkatUser);

        if (workerRepository.findByUserId(venkatUser.getId()).isEmpty()) {
            workerRepository.save(Worker.builder()
                    .user(venkatUser)
                    .workerIdCode("W002")
                    .district(cbe)
                    .department(roadDept)
                    .designation("Senior Road Inspector")
                    .build());
        }

        // 8. Seed Demo Citizen: Pradeepa
        User pradeepaUser = userRepository.findByEmailOrMobile("pradeepa@gmail.com", "pradeepa@gmail.com")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Pradeepa")
                        .email("pradeepa@gmail.com")
                        .password(encodedPass)
                        .mobile("8122671800")
                        .role(citizenRole)
                        .district(cbe)
                        .build()));
        pradeepaUser.setPassword(encodedPass);
        userRepository.save(pradeepaUser);

        if (citizenRepository.findByUserId(pradeepaUser.getId()).isEmpty()) {
            citizenRepository.save(Citizen.builder()
                    .user(pradeepaUser)
                    .address("Gandhipuram, Coimbatore")
                    .city("Coimbatore")
                    .state("Tamil Nadu")
                    .pincode("641012")
                    .build());
        }

        // 9. Seed Remaining District Department Heads & Workers dynamically
        for (String distName : districtNames) {
            District district = districtRepository.findByNameIgnoreCase(distName)
                    .orElseGet(() -> districtRepository.save(District.builder().name(distName).code(distName.substring(0, 3).toUpperCase()).state("Tamil Nadu").build()));

            for (Department dept : allDepts) {
                if (departmentHeadRepository.findByDistrictIdAndDepartmentId(district.getId(), dept.getId()).isEmpty()) {
                    String emailCode = (distName + "." + dept.getCode()).toLowerCase();
                    String headEmail = emailCode + ".head@civicconnect.gov.in";
                    String headName = distName + " " + dept.getName() + " Head";

                    User headUser = userRepository.findByEmailOrMobile(headEmail, headEmail).orElseGet(() ->
                            userRepository.save(User.builder()
                                    .fullName(headName)
                                    .email(headEmail)
                                    .password(encodedPass)
                                    .mobile("9876" + (Math.abs((distName + dept.getName()).hashCode()) % 1000000))
                                    .role(deptHeadRole)
                                    .district(district)
                                    .department(dept)
                                    .designation(dept.getName() + " Officer")
                                    .build())
                    );

                    departmentHeadRepository.save(DepartmentHead.builder()
                            .user(headUser)
                            .district(district)
                            .department(dept)
                            .build());
                }

                String workerEmail = (distName + "." + dept.getCode()).toLowerCase() + ".worker@civicconnect.gov.in";
                if (userRepository.findByEmailOrMobile(workerEmail, workerEmail).isEmpty()) {
                    User wUser = userRepository.save(User.builder()
                            .fullName(distName + " " + dept.getName() + " Inspector")
                            .email(workerEmail)
                            .password(encodedPass)
                            .mobile("9952" + (Math.abs((distName + dept.getName()).hashCode()) % 1000000))
                            .role(workerRole)
                            .district(district)
                            .department(dept)
                            .designation("Field Inspector")
                            .build());

                    workerRepository.save(Worker.builder()
                            .user(wUser)
                            .workerIdCode("W-" + dept.getCode() + "-" + district.getCode())
                            .district(district)
                            .department(dept)
                            .designation("Senior Field Inspector")
                            .build());
                }
            }
        }

        // 10. Seed Demo Complaints so My Complaints and Track Complaints are never empty
        if (complaintRepository.count() == 0) {
            Optional<DepartmentHead> roadHead = departmentHeadRepository.findByDistrictIdAndDepartmentId(cbe.getId(), roadDept.getId());
            Optional<DepartmentHead> eleHead = departmentHeadRepository.findByDistrictIdAndDepartmentId(cbe.getId(), electricityDept.getId());

            Complaint c1 = Complaint.builder()
                    .complaintCode("C-1001")
                    .citizen(pradeepaUser)
                    .district(cbe)
                    .department(roadDept)
                    .departmentHead(roadHead.orElse(null))
                    .title("Deep Pothole on Main Avinashi Road")
                    .description("Hazardous pothole causing heavy traffic delay and vehicle damage near Hope College junction.")
                    .category("Road Maintenance")
                    .locationAddress("Avinashi Road, Coimbatore")
                    .status("IN_PROGRESS")
                    .priority("HIGH")
                    .urgency("HIGH")
                    .beforeImageUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80")
                    .build();
            complaintRepository.save(c1);

            Complaint c2 = Complaint.builder()
                    .complaintCode("C-1002")
                    .citizen(pradeepaUser)
                    .district(cbe)
                    .department(electricityDept)
                    .departmentHead(eleHead.orElse(null))
                    .title("Elango theruvil theru vilaku eriyavillai (Streetlight Not Working)")
                    .description("Streetlight pole #4 in Elango Street has been non-functional for 3 days causing safety issues at night.")
                    .category("Electricity Dept")
                    .locationAddress("Elango Street, Coimbatore")
                    .status("SUBMITTED")
                    .priority("MEDIUM")
                    .urgency("NORMAL")
                    .beforeImageUrl("https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&q=80")
                    .build();
            complaintRepository.save(c2);
        }

        // Ensure all existing complaints have continuous Complaint IDs (C-1001, C-1002, C-1003...) without gaps
        List<Complaint> existingComplaints = complaintRepository.findAll();
        existingComplaints.sort((a, b) -> a.getId().compareTo(b.getId()));
        long complaintCounter = 1001;
        for (Complaint c : existingComplaints) {
            String newCode = "C-" + complaintCounter++;
            if (!newCode.equals(c.getComplaintCode())) {
                c.setComplaintCode(newCode);
                complaintRepository.save(c);
            }
        }
    }

    private Department getOrCreateDept(String name, String code, String desc) {
        return departmentRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> departmentRepository.save(Department.builder().name(name).code(code).description(desc).build()));
    }
}
