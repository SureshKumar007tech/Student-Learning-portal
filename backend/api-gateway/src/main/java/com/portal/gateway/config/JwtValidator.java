package com.portal.gateway.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtValidator {

    @Value("${jwt.secret:}")
    private String secret;

    @PostConstruct
    public void validateSecretConfiguration() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                "CRITICAL SECURITY CONFIGURATION ERROR: 'jwt.secret' (JWT_SECRET) is missing. " +
                "Startup aborted. You must configure a secure secret through environment variables or secure configuration."
            );
        }
        if (secret.trim().length() < 32) {
            throw new IllegalStateException(
                "CRITICAL SECURITY CONFIGURATION ERROR: 'jwt.secret' is too short (current length: " +
                secret.trim().length() + "). HMAC-SHA256 requires a secret of at least 32 characters (256 bits)."
            );
        }
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) return false;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String dataToSign = parts[0] + "." + parts[1];
            String expectedSig = sign(dataToSign, secret);
            if (!MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            Map<String, Object> claims = getClaims(token);
            Number exp = (Number) claims.get("exp");
            if (exp != null && Instant.now().getEpochSecond() > exp.longValue()) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> getClaims(String token) {
        Map<String, Object> claims = new HashMap<>();
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return claims;

            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            String json = new String(decoded, StandardCharsets.UTF_8);

            extractStringClaim(json, "sub", claims);
            extractStringClaim(json, "email", claims);
            extractStringClaim(json, "role", claims);
            extractLongClaim(json, "userId", claims);
            extractLongClaim(json, "exp", claims);
            extractLongClaim(json, "iat", claims);
            return claims;
        } catch (Exception e) {
            return claims;
        }
    }

    private void extractStringClaim(String json, String key, Map<String, Object> claims) {
        Matcher matcher = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        if (matcher.find()) {
            claims.put(key, matcher.group(1));
        }
    }

    private void extractLongClaim(String json, String key, Map<String, Object> claims) {
        Matcher matcher = Pattern.compile("\"" + key + "\"\\s*:\\s*(\\d+)").matcher(json);
        if (matcher.find()) {
            claims.put(key, Long.parseLong(matcher.group(1)));
        }
    }

    private String sign(String data, String secretKey) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmac);
    }
}
