package com.portal.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JwtValidatorTest {

    private JwtValidator jwtValidator;

    @BeforeEach
    void setUp() {
        jwtValidator = new JwtValidator();
        ReflectionTestUtils.setField(jwtValidator, "secret", "test-only-signing-key-not-for-production-32chars");
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
}

