package com.storage.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Component
public class UserContext {

    public UUID getCurrentUserId() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

//                System.out.println("All headers received:");
                request.getHeaderNames().asIterator()
                        .forEachRemaining(headerName ->
                                System.out.println(headerName + ": " + request.getHeader(headerName)));

                String userIdHeader = request.getHeader("X-User-Id");
//                System.out.println("X-User-Id header: " + userIdHeader);

                if (userIdHeader != null && !userIdHeader.isEmpty()) {
                    return UUID.fromString(userIdHeader);
                }
            }
            throw new IllegalStateException("User ID not found in request headers");
        } catch (Exception e) {
            System.err.println("Error getting user ID: " + e.getMessage());
            throw new IllegalStateException("Failed to get current user ID: " + e.getMessage());
        }
    }
}