package com.portal.user.config;

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
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    public String generateToken(Long userId, String username, String email, String role) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + (expirationMs / 1000);

            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String payloadJson = String.format(
                    "{\"sub\":\"%s\",\"userId\":%d,\"email\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                    escape(username), userId, escape(email), escape(role), now, exp
            );

            String encodedHeader = Base64.getUrlEncoder().withoutPadding().encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String dataToSign = encodedHeader + "." + encodedPayload;

            String signature = sign(dataToSign, secret);
            return dataToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            if (token == null) return false;
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

    public String getUsernameFromToken(String token) {
        return (String) getClaims(token).get("sub");
    }

    public Long getUserIdFromToken(String token) {
        Number id = (Number) getClaims(token).get("userId");
        return id != null ? id.longValue() : null;
    }

    public String getRoleFromToken(String token) {
        return (String) getClaims(token).get("role");
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

    private String escape(String val) {
        if (val == null) return "";
        return val.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
