package ir.ac.ut.ece.ie.controller;

import ir.ac.ut.ece.ie.model.User;
import ir.ac.ut.ece.ie.security.JwtUtils;
import ir.ac.ut.ece.ie.dto.AuthRequestDto;
import ir.ac.ut.ece.ie.dto.JwtResponseDto;
import ir.ac.ut.ece.ie.security.UserDetailsImpl;
import ir.ac.ut.ece.ie.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequestDto loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponseDto(jwt, userDetails.getUsername()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUpUser(@RequestBody AuthRequestDto signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: Username is already taken!"));
        }

        boolean hasEmail = signUpRequest.getEmail() != null && !signUpRequest.getEmail().isBlank();
        boolean hasPhone = signUpRequest.getPhoneNumber() != null && !signUpRequest.getPhoneNumber().isBlank();
        if (!hasEmail && !hasPhone) {
            return ResponseEntity.badRequest().body(Map.of("error", "At least one of Email or Phone Number is required"));
        }

        if (hasEmail && !signUpRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        }
        if (hasPhone && !signUpRequest.getPhoneNumber().matches("^\\+?[0-9]{7,15}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number format"));
        }

        if (!signUpRequest.getPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters and contain a lowercase letter, an uppercase letter, and a digit"));
        }

        if (hasEmail && userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: Email is already in use!"));
        }
        if (hasPhone && userRepository.existsByPhoneNumber(signUpRequest.getPhoneNumber())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: Phone number is already in use!"));
        }

        String emailToSave = hasEmail ? signUpRequest.getEmail() : null;
        String phoneToSave = hasPhone ? signUpRequest.getPhoneNumber() : null;
        User user = new User(signUpRequest.getUsername(), encoder.encode(signUpRequest.getPassword()), emailToSave, phoneToSave);
        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(signUpRequest.getUsername(), signUpRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok(new JwtResponseDto(jwt, signUpRequest.getUsername()));
    }
}