/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  isVisible$ = new BehaviorSubject<boolean>(false);

  open() {
    this.isVisible$.next(true);
  }

  close() {
    this.isVisible$.next(false);
  }

  constructor() { }
}