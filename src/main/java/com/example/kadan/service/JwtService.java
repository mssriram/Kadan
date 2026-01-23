package com.example.kadan.service;

import com.example.kadan.config.JwtUserPrincipal;
import com.example.kadan.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtService {

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.issuer}")
    private String jwtIssuer;

    public String generateToken(User user) {
        return generateToken(new HashMap<>(), user.getId().toString());
    }

    public String generateToken(Map<String, Object> extraClaims, String id) {
        return buildToken(extraClaims, id);
    }

    private String buildToken(Map<String, Object> extraClaims, String id) {
        return Jwts.builder()
                .claims(extraClaims)
                .issuer(jwtIssuer)
                .subject(id)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(jwtExpiration)))
                .signWith(getSigningKey()).compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public JwtUserPrincipal extractPrincipal(String token) {
        String subject = extractSubject(token);
        UUID userId = UUID.fromString(subject);
        return new JwtUserPrincipal(userId);
    }


    public String extractSubject(String jwt) {
        return extractClaim(jwt, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
