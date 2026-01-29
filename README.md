# Security-First Web System: Spring Boot & Ionic Angular

## 🎯 Project Goal

The primary mission of this project is to scaffold a **decoupled, security-first web architecture**. Unlike traditional setups where tokens might be stored in LocalStorage (vulnerable to XSS), this system implements a strict **Stateless JWT** authentication flow using **HttpOnly Cookies**. This ensures that sensitive tokens are never accessible to client-side JavaScript, significantly hardening the application against common web attacks.

---

## �️ System Architecture

### � Authentication Flow (Sequence Diagram)

The following diagram illustrates how the Frontend and Backend handshake securely without exposing the JWT to client-side scripts.

```mermaid
sequenceDiagram
    participant User
    participant Frontend (Ionic)
    participant Backend (Spring Boot)
    participant DB (MySQL)

    Note over User, DB: LOGIN PROCESS
    User->>Frontend: Enters Credentials
    Frontend->>Backend: POST /api/auth/login {user, pass}
    Backend->>DB: Validate User
    DB-->>Backend: User Valid
    Backend->>Backend: Generate JWT
    Backend-->>Frontend: 200 OK + Set-Cookie: accessToken=JWT; HttpOnly; Secure; SameSite
    Note right of Frontend: Browser saves Cookie automatically.<br/>JS cannot read it.

    Note over User, DB: SECURED REQUEST
    User->>Frontend: Navigate to Dashboard
    Frontend->>Backend: GET /api/test/user
    Note right of Frontend: Interceptor adds {withCredentials: true}.<br/>Browser attaches Cookie.
    Backend->>Backend: AuthFilter reads Cookie
    Backend->>Backend: Validate JWT & Set SecurityContext
    Backend-->>Frontend: 200 OK { "User Content" }
```

---

## 🛡️ Backend System Design (Spring Boot)

The backend is designed as a stateless REST API complying with **Spring Security 6** standards.

### 1. Security Layer (`com.security.backend.security`)
This is the heart of the application.
*   **`WebSecurityConfig`**: The security gatekeeper.
    *   **CSRF Disabled**: Since we use stateless JWTs and strictly controlled CORS permissions, standard CSRF tokens are not required (though SameSite cookies provide protection).
    *   **Session Management**: Explicitly set to `STATELESS`. The server forgets the user immediately after sending the response.
    *   **CORS Configuration**: Allowlisted strictly for `http://localhost:4200` with `AllowCredentials(true)` to permit cookie exchange.
*   **`AuthTokenFilter`**: A custom `OncePerRequestFilter`.
    1.  Intercepts **every** request.
    2.  Extracts `accessToken` from the Cookie list.
    3.  Parses the JWT to read the `username`.
    4.  If valid, creates an `UsernamePasswordAuthenticationToken` and places it in the `SecurityContextHolder`.

### 2. Domain & Data Layer
*   **Database**: MySQL 8.0.
*   **Entity**: `User` class maps to the `users` table.
*   **Repository**: `UserRepository` extends `JpaRepository` for efficient SQL generation.

---

## 📱 Frontend System Design (Ionic Angular)

The frontend is a **Single Page Application (SPA)** built with **Ionic 7** and **Angular 17+**. It abandons the traditional `NgModule` pattern in favor of a modern **Standalone Component** architecture.

### 1. Standalone Architecture
*   **Bootstrapping**: The app starts in `main.ts`. We use `bootstrapApplication` to load `AppComponent` and inject global providers (Router, HTTP Client, Ionic).
*   **Lazy Loading**: Routes in `app.routes.ts` use `loadComponent` to fetch pages only when needed, improving startup performance.

### 2. Security Interceptor
Identity management relies on a functional HTTP interceptor.

```typescript
// src/app/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // CLONE the request to add specific flags
  const authReq = req.clone({
    withCredentials: true // forces browser to send Cookies
  });
  return next(authReq);
};
```

### 3. Component Design
*   **`LoginPage`**:
    *   **State**: Tracks `isRegister` boolean to toggle between Login and Registration forms.
    *   **Action**: Calls `AuthService`. On success, routing redirects to Dashboard.
*   **`DashboardPage`**:
    *   **Protection**: Guarded by `authGuard`.
    *   **Verification**: Immediately calls a protected endpoint (`getProtectedData`) to prove the HttpOnly cookie is working.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm
*   Java JDK 17 or 21
*   MySQL Server

### Installation

1.  **Clone the Repository**
    ```bash
    git clone <repo-url>
    cd angualr-springboot
    ```

2.  **Backend Setup**
    *   Navigate to `backend/src/main/resources/application.properties`.
    *   Update `spring.datasource.username` and `spring.datasource.password` with your MySQL credentials.
    *   Run the backend:
        ```bash
        cd backend
        ./mvnw spring-boot:run
        ```

3.  **Frontend Setup**
    *   Install dependencies:
        ```bash
        cd frontend
        npm install
        ```
    *   Run the development server:
        ```bash
        npm start
        ```

### Usage
*   Open `http://localhost:4200`.
*   **Register** a new user or **Login**.
*   Access the **Dashboard** to see the secured API response (proving the HttpOnly cookie works).
