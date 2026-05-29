package com.smartdocs.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository        userRepo;
    private final JwtService            jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req) {

        // 1. Valida email e senha
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.email(), req.password()));
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException(
                    "E-Mail oder Passwort falsch.");
        }

        // 2. Carrega o usuário do banco
        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        // 3. Gera o token JWT
        String token = jwtService.generateToken(user);

        // 4. Retorna token + dados do usuário
        return ResponseEntity.ok(
                new AuthResponse(token, UserDto.from(user)));
    }
}