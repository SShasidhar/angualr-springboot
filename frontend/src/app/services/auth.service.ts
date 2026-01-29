import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const AUTH_API = 'http://localhost:8080/api/auth/';
const TEST_API = 'http://localhost:8080/api/test/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(AUTH_API + 'login', {
      username: credentials.username,
      password: credentials.password
    }).pipe(
      tap(() => {
        localStorage.setItem('isLoggedIn', 'true');
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(AUTH_API + 'register', {
      username: user.username,
      password: user.password
    });
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'logout', {},).pipe(
      tap(() => {
        localStorage.removeItem('isLoggedIn');
      })
    );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
  
  getProtectedData(): Observable<any> {
      return this.http.get(TEST_API + 'user', { responseType: 'text' });
  }
}
