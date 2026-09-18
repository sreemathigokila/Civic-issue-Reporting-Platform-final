package com.civic.connect.controller;

import com.civic.connect.dto.ChangePasswordRequest;
import com.civic.connect.dto.UpdateProfileRequest;
import com.civic.connect.dto.UserResponse;
import com.civic.connect.security.UserPrincipal;
import com.civic.connect.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                      @RequestBody UpdateProfileRequest request) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal currentUser,
                                            @RequestBody ChangePasswordRequest request) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
