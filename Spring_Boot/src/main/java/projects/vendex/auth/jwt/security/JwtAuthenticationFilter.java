package projects.vendex.auth.jwt.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import projects.vendex.exceptions.ApiErrorResponse;
import projects.vendex.exceptions.InvalidJwtException;
import projects.vendex.exceptions.JwtExpiredException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Profile("!dev")
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;
    
    // Public endpoints that don't require authentication
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/register",
        "/login",
        "/refreshToken",
        "/swagger-ui",
        "/v3/api-docs",
        "/docs"
    );

    JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService, ObjectMapper objectMapper){
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response,@NonNull FilterChain filterChain) throws ServletException, IOException {
        final String requestPath = request.getRequestURI();
        
        // Skip JWT validation for public endpoints
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        log.debug("Checking for JWT token in the request for path: {}", requestPath);
        final String authHeader = request.getHeader("Authorization");
        String jwt;
        String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            // No token provided - let Spring Security handle authorization
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            username = this.jwtService.extractUsername(jwt);

            log.debug("Extracted username from the token: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (userDetails == null) {
                        log.warn("User not found for username: {}", username);
                        // Don't throw error, just continue without authentication
                        filterChain.doFilter(request, response);
                        return;
                    }
                    if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Successfully authenticated user: {}", username);
                    } else {
                        log.warn("Invalid token for user: {}", username);
                        // Token invalid but don't block - let Spring Security handle it
                    }
                } catch (UsernameNotFoundException ex) {
                    log.warn("User not found: {}", username);
                    // Don't throw error, just continue without authentication
                }
            }
        } catch (JwtExpiredException ex) {
            log.warn("JWT token expired: {}", ex.getMessage());
            // For expired tokens, only block if it's a protected endpoint
            // Otherwise, let it pass and Spring Security will handle it
            if (isProtectedEndpoint(requestPath)) {
                errorResponse(request, response, ex, "Token expired. Please login again.");
                return;
            }
        } catch (InvalidJwtException ex) {
            log.warn("Invalid JWT token: {}", ex.getMessage());
            // For invalid tokens, only block if it's a protected endpoint
            if (isProtectedEndpoint(requestPath)) {
                errorResponse(request, response, ex, "Invalid token. Please login again.");
                return;
            }
        } catch (Exception ex) {
            log.error("Unexpected error in JWT filter: {}", ex.getMessage(), ex);
            // For unexpected errors, only block protected endpoints
            if (isProtectedEndpoint(requestPath)) {
                errorResponse(request, response, ex, "Authentication error occurred");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith) ||
               path.startsWith("/demo/") ||
               path.startsWith("/agent/");
    }
    
    private boolean isProtectedEndpoint(String path) {
        return path.startsWith("/admin/") || 
               path.startsWith("/user/");
    }

    private void errorResponse(HttpServletRequest request, HttpServletResponse response, Exception ex, String desc) throws IOException {
        log.info("Error raised in JWT Filter for path: {}", request.getRequestURI());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        ApiErrorResponse errorResponse = new ApiErrorResponse(HttpStatus.UNAUTHORIZED.value(),
                ex.getMessage(),
                desc,
                request.getRequestURI()
        );

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        response.getWriter().flush();
    }
}
