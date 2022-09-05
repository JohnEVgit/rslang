/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthModalService } from 'src/app/services/auth-modal.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  form = new FormGroup({
    email: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  get email() {
    return this.form.controls.email as FormControl;
  }

  get password() {
    return this.form.controls.password as FormControl;
  }

  signup = new FormGroup({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  get name() {
    return this.signup.controls.name as FormControl;
  }

  get emailS() {
    return this.signup.controls.email as FormControl;
  }

  get passwordS() {
    return this.signup.controls.password as FormControl;
  }

  constructor(public authModalService: AuthModalService) { }

  ngOnInit(): void {
  }

  submit() {
    const loginUser = async (user:{}) => {
      const rawResponse = await fetch('https://angular-learnwords.herokuapp.com/signin', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      const content = await rawResponse.json();
      localStorage.setItem('JWT', content.token);
      localStorage.setItem('ID', content.userId);
      localStorage.setItem('NAME', content.name);
      localStorage.setItem('refreshToken', content.refreshToken);

      if (content.message === 'Authenticated') {
        this.authModalService.authenticated = true;
      }
      console.log(content);
    };

    loginUser(this.form.value).then(() => this.authModalService.close());
  }

  submitS() {
    console.log(this.signup.value);
    const createUser = async (user: {}) => {
      const rawResponse = await fetch('https://angular-learnwords.herokuapp.com/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      const content = await rawResponse.json();
    };

    createUser(this.signup.value).then(() => this.authModalService.close());
  }
}
