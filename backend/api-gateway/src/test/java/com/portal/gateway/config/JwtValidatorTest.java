package com.portal.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtValidatorTest {

    private JwtValidator jwtValidator;
    private final String testSecret = "test-only-signing-key-not-for-production-32chars";

    @BeforeEach
    void setUp() {
        jwtValidator = new JwtValidator();
        ReflectionTestUtils.setField(jwtValidator, "secret", testSecret);
        jwtValidator.validateSecretConfiguration();
    }

    @Test
    void validateToken_WhenNullOrMalformed_ShouldReturnFalse() {
        assertThat(jwtValidator.validateToken(null)).isFalse();
        assertThat(jwtValidator.validateToken("")).isFalse();
        assertThat(jwtValidator.validateToken("invalid.token.structure")).isFalse();
    }

    @Test
    void getClaims_WhenInvalid_ShouldReturnEmptyMap() {
        Map<String, Object> claims = jwtValidator.getClaims("invalid.token");
        assertThat(claims).isEmpty();
    }

    @Test
    void validateSecretConfiguration_WhenMissingOrTooShort_ShouldThrowException() {
        JwtValidator missingSecretValidator = new JwtValidator();
        ReflectionTestUtils.setField(missingSecretValidator, "secret", "");
        assertThatThrownBy(missingSecretValidator::validateSecretConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("missing");

        JwtValidator shortSecretValidator = new JwtValidator();
        ReflectionTestUtils.setField(shortSecretValidator, "secret", "short-key-15ch");
        assertThatThrownBy(shortSecretValidator::validateSecretConfiguration)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("too short");
    }

    @Test
    void validateToken_WhenValidToken_ShouldReturnTrueAndExtractClaims() throws Exception {
        String token = createJwtToken("student", 1L, "student@portal.edu", "ROLE_STUDENT", 3600, testSecret);
        assertThat(jwtValidator.validateToken(token)).isTrue();

        Map<String, Object> claims = jwtValidator.getClaims(token);
        assertThat(claims.get("sub")).isEqualTo("student");
        assertThat(claims.get("userId")).isEqualTo(1L);
        assertThat(claims.get("role")).isEqualTo("ROLE_STUDENT");
    }

    @Test
    void validateToken_WhenExpired_ShouldReturnFalse() throws Exception {
        // Expired 60 seconds ago
        String expiredToken = createJwtToken("student", 1L, "student@portal.edu", "ROLE_STUDENT", -60, testSecret);
        assertThat(jwtValidator.validateToken(expiredToken)).isFalse();
    }

    @Test
    void validateToken_WhenSignatureTampered_ShouldReturnFalse() throws Exception {
        String token = createJwtToken("student", 1L, "student@portal.edu", "ROLE_STUDENT", 3600, testSecret);
        String[] parts = token.split("\\.");
        // Alter payload slightly
        String tampered = parts[0] + "." + parts[1] + "tampered." + parts[2];
        assertThat(jwtValidator.validateToken(tampered)).isFalse();
    }

    private String createJwtToken(String username, Long userId, String email, String role, long expiresInSeconds, String secretKey) throws Exception {
        long now = Instant.now().getEpochSecond();
        long exp = now + expiresInSeconds;

        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                String.format("{\"sub\":\"%s\",\"userId\":%d,\"email\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                        username, userId, email, role, now, exp).getBytes(StandardCharsets.UTF_8)
        );

        String dataToSign = header + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hmac = mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8));
        String sig = Base64.getUrlEncoder().withoutPadding().encodeToString(hmac);

        return dataToSign + "." + sig;
    }
}
