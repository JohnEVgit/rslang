/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  isVisible$ = new BehaviorSubject<boolean>(false);

  local = localStorage;

  authenticated = false;

  open(): void {
    this.isVisible$.next(true);
  }

  close(): void {
    this.isVisible$.next(false);
  }

  clearStorage(): void {
    if (localStorage.length > 0) {
      this.local.clear();
      this.authenticated = false;
    }
  }

  public getToken(): string | null {
    return this.local.getItem('JWT');
  }

  public getUserId(): string | null {
    return this.local.getItem('ID');
  }

  public checkAuthenticated(): void {
    this.authenticated = !!this.local.getItem('JWT');
  }
}
