package com.stepa7.authservice.controller;

import com.stepa7.authservice.request.SigninRequest;
import com.stepa7.authservice.request.SignupRequest;
import com.stepa7.authservice.security.JwtCore;
import com.stepa7.authservice.token.RefreshToken;
import com.stepa7.authservice.token.RefreshTokenService;
import com.stepa7.authservice.user.User;
import com.stepa7.authservice.user.UserDetailsImpl;
import com.stepa7.authservice.user.UserRepository;
import com.stepa7.authservice.user.UserRole;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class SecurityController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtCore jwtCore;
    private final RefreshTokenService refreshTokenService;
    @Value("${jwt.refreshExpirationMs:86400000}")
    private long refreshTokenDurationMs;

    @Autowired
    public SecurityController(UserRepository userRepository, AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder, JwtCore jwtCore, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtCore = jwtCore;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (userRepository.existsUserByLogin(signupRequest.getLogin())) {
            return ResponseEntity.badRequest().body("login_exists");
        }
        if (userRepository.existsUserByMail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest().body("email_exists");
        }
        String hashed = passwordEncoder.encode(signupRequest.getPassword());
        User user = new User();
        user.setLogin(signupRequest.getLogin());
        user.setMail(signupRequest.getEmail());
        user.setPassword(hashed);
        user.setRole(Set.of(UserRole.GUEST));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("signup", "success"));
    }


    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest signinRequest, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signinRequest.getLogin(), signinRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findUserByLogin(signinRequest.getLogin()).orElseThrow();
            String accessToken = jwtCore.generateToken(authentication);

            String plainRefresh = refreshTokenService.createRefreshToken(user);
            ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", plainRefresh)
                    .secure(true)
                    .httpOnly(true)
                    .path("/")
                    .sameSite("Strict")
                    .maxAge(refreshTokenDurationMs / 1000)
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            Map<String, Object> body = new HashMap<>();
            body.put("accessToken", accessToken);
            body.put("tokenType", "Bearer");
            body.put("expiresIn", jwtCore.getExpireTimeMs());

            return ResponseEntity.ok(body);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid_credentials");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "REFRESH_TOKEN", required = false) String refreshTokenCookie,
                                          HttpServletResponse response) {
        if (refreshTokenCookie == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token is missing");
        }

        String hash = refreshTokenService.hashPlain(refreshTokenCookie);
        RefreshToken refreshToken = refreshTokenService.findByToken(hash);
        if (refreshToken == null || refreshTokenService.isTokenExpired(refreshToken)) {
            if (refreshToken != null) {
                refreshTokenService.deleteByTokenHash(hash);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("refresh_invalid_or_expired");
        }

        User user = refreshToken.getUser();
        refreshTokenService.deleteByTokenHash(hash);
        String newPlainRefresh = refreshTokenService.createRefreshToken(user);

        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", newPlainRefresh)
                .secure(true)
                .httpOnly(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(refreshTokenDurationMs / 1000)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        String newAccessToken = jwtCore.generateToken(authentication);

        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", newAccessToken);
        body.put("tokenType", "Bearer");
        body.put("expiresIn", jwtCore.getExpireTimeMs());

        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "REFRESH_TOKEN", required = false) String refreshTokenCookie,
                                    HttpServletResponse response) {
        if (refreshTokenCookie != null) {
            String hash = refreshTokenService.hashPlain(refreshTokenCookie);
            refreshTokenService.deleteByTokenHash(hash);
        }

        ResponseCookie refreshCookie = ResponseCookie.from("REFRESH_TOKEN", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("logout", "ok"));
    }
}
