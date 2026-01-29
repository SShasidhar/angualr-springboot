# Security-First Spring Boot Backend

## High Level Architecture

This project implements a **Stateless** security architecture using **JWT (JSON Web Tokens)** stored in **HttpOnly Cookies**. This approach maximizes security by preventing XSS attacks (JavaScript cannot read the cookie) and ensuring the backend remains stateless (no server-side session storage).

### Key Features
1.  **Stateless Session**: The server does not store user sessions. Every request is authenticated via the JWT token.
2.  **HttpOnly Cookies**: The JWT is sent to the client as an HttpOnly cookie, meaning it is automatically sent by the browser on subsequent requests but is inaccessible to client-side scripts.
3.  **Spring Security**: Used for robust authentication and authorization.
4.  **MySQL Database**: Persisting user data.

---

## Code Breakdown

### 1. Configuration (`src/main/resources/application.properties`)
-   **Configures Server Port**: Runs on `8080`.
-   **Database Connection**: Connects to MySQL (`angularspringsecure`) using `createDatabaseIfNotExist=true` to auto-provision the DB.
-   **JPA Settings**: implementation of Hibernate dialect and DDL auto-update.
-   **JWT Properties**: Defines the `secret`, `expirationMs`, and `cookieName` needed for token generation.

### 2. Security Configuration (`com.security.backend.security`)

#### `WebSecurityConfig.java`
The central security hub.
-   **`filterChain(HttpSecurity http)`**:
    -   Disables CSRF (Standard for stateless JWT APIs, rely on SameSite cookie policy).
    -   Sets Session Policy to `STATELESS`.
    -   Configures CORS to allow requests from `http://localhost:4200` (Frontend) with `AllowCredentials(true)` (crucial for cookies).
    -   Defines public endpoints (`/api/auth/**`, `/api/test/**`).
    -   Adds the `AuthTokenFilter` before the standard authentication filter.
-   **`passwordEncoder()`**: Defines `BCryptPasswordEncoder` for hashing passwords.

#### `AuthTokenFilter.java` (Extends `OncePerRequestFilter`)
Intercepts every HTTP request.
-   **`doFilterInternal`**:
    1.  Extracts the JWT from the `accessToken` Cookie using `JwtUtils`.
    2.  Validates the token.
    3.  If valid, loads `UserDetails` and sets the `Authentication` object in `SecurityContextHolder`.

#### `jwt/JwtUtils.java`
Utility class for low-level JWT operations.
-   **`getJwtFromCookies`**: Extracts the token string from the `Cookie` header.
-   **`generateJwtCookie`**: Creates a secure `ResponseCookie` containing the signed JWT.
-   **`validateJwtToken`**: Verifies the signature and expiration of the token.
-   **`getUserNameFromJwtToken`**: Decodes the subject (username) from the token.

### 3. Controllers (`com.security.backend.controller`)

#### `AuthController.java`
Handles public authentication endpoints.
-   **`authenticateUser` (`POST /api/auth/login`)**:
    -   Authenticates credentials using `AuthenticationManager`.
    -   Generates a JWT Cookie.
    -   Returns the Cookie in `Set-Cookie` header and user info in body.
-   **`registerUser` (`POST /api/auth/register`)**:
    -   Checks if username exists.
    -   Encodes password and saves new `User` to DB.
-   **`logoutUser` (`POST /api/auth/logout`)**:
    -   Returns a "Clean" (empty) cookie to clear the client's storage.

#### `TestController.java`
Demonstrates access control.
-   **`allAccess`**: Public endpoint.
-   **`userAccess`**: Protected endpoint. Requires a valid JWT cookie to access.

### 4. Service Logic (`com.security.backend.service`)

#### `UserDetailsServiceImpl.java`
Bridges our DB User to Spring Security.
-   **`loadUserByUsername`**: Fetches `User` entity from `UserRepository` and converts it to a standard Spring Security `UserDetails` object.

### 5. Repository & Model (`com.security.backend.repository`, `...model`)

#### `UserRepository.java`
-   Standard `JpaRepository` interface.
-   **`findByUsername`**: Custom query method to find users for login.
-   **`existsByUsername`**: Used during registration.

#### `User.java` (Entity)
-   Maps to `users` table in MySQL.
-   Fields: `id`, `username`, `password`.
