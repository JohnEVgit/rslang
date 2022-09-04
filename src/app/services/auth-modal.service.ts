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

  open() {
    this.isVisible$.next(true);
  }

  close() {
    this.isVisible$.next(false);
  }

  clearStorage() {
    if (localStorage.length > 0) {
      this.local.clear();
      this.authenticated = false;
    }
  }

  public getToken() {
    return this.local.getItem('JWT');
  }

  public getUserId() {
    return this.local.getItem('ID');
  }

  public checkAuthenticated() {
    this.authenticated = !!localStorage.length;
  }
}