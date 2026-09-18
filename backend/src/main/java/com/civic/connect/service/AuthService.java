package com.civic.connect.service;

import com.civic.connect.dto.AuthRequest;
import com.civic.connect.dto.AuthResponse;
import com.civic.connect.dto.RegisterRequest;
import com.civic.connect.dto.UserResponse;
import com.civic.connect.model.*;
import com.civic.connect.repository.*;
import com.civic.connect.security.JwtTokenProvider;
import com.civic.connect.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DistrictRepository districtRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentHeadRepository departmentHeadRepository;
    private final WorkerRepository workerRepository;
    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       DistrictRepository districtRepository,
                       DepartmentRepository departmentRepository,
                       DepartmentHeadRepository departmentHeadRepository,
                       WorkerRepository workerRepository,
                       CitizenRepository citizenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.districtRepository = districtRepository;
        this.departmentRepository = departmentRepository;
        this.departmentHeadRepository = departmentHeadRepository;
        this.workerRepository = workerRepository;
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getEmail();
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = request.getUsernameOrEmail();
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(principal.getId());

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email address already in use.");
        }

        String rawRoleName = req.getRole() != null ? req.getRole() : "ROLE_CITIZEN";
        if (!rawRoleName.startsWith("ROLE_")) {
            rawRoleName = "ROLE_" + rawRoleName.toUpperCase();
        }
        final String roleName = rawRoleName;

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

        District district = null;
        if (req.getDistrict() != null && !req.getDistrict().isEmpty()) {
            district = districtRepository.findByNameIgnoreCase(req.getDistrict())
                    .orElseGet(() -> districtRepository.save(District.builder().name(req.getDistrict()).state(req.getState()).build()));
        }

        Department department = null;
        if (req.getDepartmentId() != null) {
            department = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .role(role)
                .district(district)
                .department(department)
                .workerIdCode(req.getWorkerIdCode())
                .designation(req.getDesignation())
                .aadharId(req.getAadharId())
                .build();

        user = userRepository.save(user);

        // Populate role-specific entities
        if ("ROLE_CITIZEN".equals(roleName)) {
            Citizen citizen = Citizen.builder()
                    .user(user)
                    .address(req.getLocation())
                    .city(req.getCity())
                    .state(req.getState())
                    .build();
            citizenRepository.save(citizen);
        } else if ("ROLE_WORKER".equals(roleName)) {
            Worker worker = Worker.builder()
                    .user(user)
                    .workerIdCode(req.getWorkerIdCode() != null ? req.getWorkerIdCode() : "W-" + user.getId())
                    .district(district)
                    .department(department)
                    .designation(req.getDesignation())
                    .aadharId(req.getAadharId())
                    .build();
            workerRepository.save(worker);
        } else if ("ROLE_DEPARTMENT_HEAD".equals(roleName)) {
            if (district != null && department != null) {
                // Enforce UNIQUE(district_id, department_id)
                if (departmentHeadRepository.findByDistrictIdAndDepartmentId(district.getId(), department.getId()).isPresent()) {
                    throw new RuntimeException("A Department Head already exists for District '" + district.getName() + "' and Department '" + department.getName() + "'");
                }
                DepartmentHead deptHead = DepartmentHead.builder()
                        .user(user)
                        .district(district)
                        .department(department)
                        .build();
                departmentHeadRepository.save(deptHead);
            }
        }

        return mapToUserResponse(user);
    }

    public UserResponse mapToUserResponse(User user) {
        String city = null;
        String state = null;
        String address = null;
        String pincode = null;

        Citizen citizen = citizenRepository.findByUserId(user.getId()).orElse(null);
        if (citizen != null) {
            city = citizen.getCity();
            state = citizen.getState();
            address = citizen.getAddress();
            pincode = citizen.getPincode();
        }

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole() != null ? user.getRole().getName() : "ROLE_CITIZEN")
                .district(user.getDistrict() != null ? user.getDistrict().getName() : null)
                .state(state != null ? state : (user.getDistrict() != null ? user.getDistrict().getState() : null))
                .city(city)
                .address(address)
                .pincode(pincode)
                .location(address != null ? address : city)
                .designation(user.getDesignation())
                .workerIdCode(user.getWorkerIdCode())
                .build();
    }
}
