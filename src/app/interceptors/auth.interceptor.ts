import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthModalService } from '../services/auth-modal.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authModalService: AuthModalService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authModalService.getToken();
    if (!request.headers.has('Authorization')) {
      const cloned = request.clone({
        headers: request.headers
          .append('Authorization', `Bearer ${token}`)
          .append('Accept', 'application/json'),
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}
