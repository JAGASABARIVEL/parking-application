// core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from 'src/app/shared/models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    this.loadStoredUser();
  }

  register(username: string, email: string, firstName: string, lastName: string, 
           phoneNumber: string, userType: string, password: string, 
           passwordConfirm: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      user_type: userType,
      password,
      password_confirm: passwordConfirm
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, {
      username,
      password
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  private handleAuthResponse(response: AuthResponse) {
    this.storage.set('access_token', response.access);
    this.storage.set('refresh_token', response.refresh);
    this.storage.set('user', response.user);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): Observable<void> {
    return new Observable(observer => {
      this.storage.remove('access_token');
      this.storage.remove('refresh_token');
      this.storage.remove('user');
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      observer.next();
      observer.complete();
    });
  }

  private async loadStoredUser() {
    const token = await this.storage.get('access_token');
    const user = await this.storage.get('user');
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): Observable<string> {
    return new Observable(observer => {
      if (!this.storage.get('access_token')) {
        console.error('Storage not initialized yet');
        observer.error('Storage not initialized');
        return;
      }

      this.storage.get('access_token').then(token => {
        observer.next(token);
        observer.complete();
      });
    });
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile/`, userData).pipe(
      tap(updatedUser => {
        this.storage.set('user', updatedUser);
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
}