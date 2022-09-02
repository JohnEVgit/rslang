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

  open() {
    this.isVisible$.next(true);
  }

  close() {
    this.isVisible$.next(false);
  }

  clearStorage() {
    if (localStorage.length > 0) {
      this.local.clear();
    }
  }

  constructor() { }
}
