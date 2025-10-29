// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for login and register endpoints
    const excludedUrls = ['/login', '/register'];

    // If the request URL matches any excluded endpoint, skip token addition
    if (excludedUrls.some(url => request.url.includes(url))) {
      return next.handle(request);
    }

    // Otherwise, attach token
    return from(this.addToken(request)).pipe(
      switchMap(newRequest => next.handle(newRequest))
    );
  }

  private async addToken(request: HttpRequest<any>): Promise<HttpRequest<any>> {
    const token = await (this.authService.getAccessToken().toPromise());
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return request;
  }
}