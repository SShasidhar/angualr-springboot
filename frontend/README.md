# Ionic Angular Frontend (Standalone Architecture)

## High Level Architecture

This application is a **Standalone** Ionic Angular application. It connects to a Spring Boot backend using a "Security-First" approach:
-   **Architecture**: No `NgModules`. All components are `standalone: true`.
-   **Bootstrapping**: `main.ts` uses `bootstrapApplication` with `provideRouter`, `provideIonicAngular`, and `provideHttpClient`.
-   **Security**:
    -   **HttpOnly Cookies**: The app relies on the browser to automatically handle the `accessToken` cookie.
    -   **Interceptors**: A functional `authInterceptor` ensures `withCredentials: true` is set on every request.

---

## Code Breakdown

### 1. Configuration (`src`)

#### `main.ts`
The entry point.
-   **`bootstrapApplication(AppComponent, ...)`**: Bootstraps the root component.
-   **Providers**:
    -   `provideIonicAngular()`: Initializes Ionic.
    -   `provideRouter(routes)`: Sets up routing from `app.routes.ts`.
    -   `provideHttpClient(withInterceptors([authInterceptor]))`: Configures HTTP with our secure interceptor.

#### `app.routes.ts`
Defines navigation routes.
-   Lazy-loads components using `loadComponent`.
-   Protects `/dashboard` with `authGuard`.

#### `app.component.ts`
The root component.
-   **Standalone**: `true`.
-   **Imports**: `IonApp`, `IonRouterOutlet` from `@ionic/angular/standalone` to enable Ionic routing.

### 2. Security Logic (`src/app/interceptors`, `...guards`, `...services`)

#### `interceptors/auth.interceptor.ts`
Functional Interceptor.
-   Intersects every request and adds `withCredentials: true`.

#### `services/auth.service.ts`
Manages API communication.
-   `providedIn: 'root'`.
-   **`login`**: Authenticates and sets a local UI flag.
-   **`logout`**: Clears session.

#### `guards/auth.guard.ts`
Functional Guard (`CanActivateFn`).
-   Checks `AuthService.isLoggedIn()` to protect routes.

### 3. Pages (`src/app/pages`)

#### `Login Page` (`login/login.page.*`)
-   **Standalone**: `true`.
-   **Imports**: `IonContent`, `IonCard`, `IonInput`, etc., directly from `@ionic/angular/standalone`.
-   **Functionality**: Authenticates user via `AuthService`.

#### `Dashboard Page` (`dashboard/dashboard.page.*`)
-   **Standalone**: `true`.
-   **Imports**: Ionic components and `addIcons` for icons.
-   **Functionality**: Fetches protected data to verify secure cookie transmission.
