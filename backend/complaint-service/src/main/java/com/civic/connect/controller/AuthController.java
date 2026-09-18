package com.civic.connect.controller;

import com.civic.connect.dto.AuthRequest;
import com.civic.connect.dto.AuthResponse;
import com.civic.connect.dto.RegisterRequest;
import com.civic.connect.dto.UserResponse;
import com.civic.connect.model.User;
import com.civic.connect.repository.UserRepository;
import com.civic.connect.security.UserPrincipal;
import com.civic.connect.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<java.util.Map<String, Object>> sendOtp(@RequestBody java.util.Map<String, String> body) {
        String target = body.get("target");
        String type = body.get("type");
        return ResponseEntity.ok(authService.sendOtp(target, type));
    }

    @PostMapping("/send-email-otp")
    public ResponseEntity<java.util.Map<String, Object>> sendEmailOtp(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null) email = body.get("target");
        return ResponseEntity.ok(authService.sendEmailOtp(email));
    }

    @PostMapping("/send-mobile-otp")
    public ResponseEntity<java.util.Map<String, Object>> sendMobileOtp(@RequestBody java.util.Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null) mobile = body.get("target");
        return ResponseEntity.ok(authService.sendMobileOtp(mobile));
    }

    @PostMapping("/send-reset-otp")
    public ResponseEntity<java.util.Map<String, Object>> sendResetOtp(@RequestBody java.util.Map<String, String> body) {
        String target = body.get("target");
        if (target == null) target = body.get("email");
        if (target == null) target = body.get("mobile");
        return ResponseEntity.ok(authService.sendResetOtp(target));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<java.util.Map<String, Object>> verifyOtp(@RequestBody java.util.Map<String, String> body) {
        String target = body.get("target");
        String otp = body.get("otp");
        String type = body.get("type");
        return ResponseEntity.ok(authService.verifyOtp(target, otp, type));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<java.util.Map<String, Object>> verifyEmailOtp(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null) email = body.get("target");
        String otp = body.get("otp");
        return ResponseEntity.ok(authService.verifyEmailOtp(email, otp));
    }

    @PostMapping("/verify-mobile-otp")
    public ResponseEntity<java.util.Map<String, Object>> verifyMobileOtp(@RequestBody java.util.Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null) mobile = body.get("target");
        String otp = body.get("otp");
        return ResponseEntity.ok(authService.verifyMobileOtp(mobile, otp));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, Object>> resetPassword(@RequestBody java.util.Map<String, String> body) {
        String target = body.get("target");
        if (target == null) target = body.get("email");
        if (target == null) target = body.get("mobile");
        String newPassword = body.get("newPassword");
        return ResponseEntity.ok(authService.resetPassword(target, newPassword));
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, Object>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(authService.logout(authHeader));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }
}
