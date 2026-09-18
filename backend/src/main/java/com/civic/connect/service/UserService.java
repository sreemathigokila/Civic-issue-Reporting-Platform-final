package com.civic.connect.service;

import com.civic.connect.dto.ChangePasswordRequest;
import com.civic.connect.dto.UpdateProfileRequest;
import com.civic.connect.dto.UserResponse;
import com.civic.connect.model.Citizen;
import com.civic.connect.model.User;
import com.civic.connect.repository.CitizenRepository;
import com.civic.connect.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    public UserService(UserRepository userRepository, CitizenRepository citizenRepository, PasswordEncoder passwordEncoder, AuthService authService) {
        this.userRepository = userRepository;
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getFullName() != null && !req.getFullName().trim().isEmpty()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getMobile() != null && !req.getMobile().trim().isEmpty()) {
            user.setMobile(req.getMobile().trim());
        }

        userRepository.save(user);

        // Get or create citizen details record for location info across all roles
        Citizen citizen = citizenRepository.findByUserId(userId).orElseGet(() -> {
            Citizen newCitizen = Citizen.builder()
                    .user(user)
                    .build();
            return citizenRepository.save(newCitizen);
        });

        if (req.getAddress() != null) citizen.setAddress(req.getAddress());
        if (req.getCity() != null) citizen.setCity(req.getCity());
        if (req.getState() != null) citizen.setState(req.getState());
        if (req.getPincode() != null) citizen.setPincode(req.getPincode());
        citizenRepository.save(citizen);

        return authService.mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
