package com.civic.connect.controller;

import com.civic.connect.dto.AuthRequest;
import com.civic.connect.dto.AuthResponse;
import com.civic.connect.dto.RegisterRequest;
import com.civic.connect.dto.UserResponse;
import com.civic.connect.security.UserPrincipal;
import com.civic.connect.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserResponse.builder()
                .id(currentUser.getId())
                .email(currentUser.getUsername())
                .role(currentUser.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("ROLE_CITIZEN"))
                .build());
    }
}
