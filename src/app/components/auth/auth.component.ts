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
      Validators.minLength(6),
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
    emailS: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    passwordS: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  get name() {
    return this.signup.controls.name as FormControl;
  }

  get emailS() {
    return this.signup.controls.emailS as FormControl;
  }

  get passwordS() {
    return this.signup.controls.passwordS as FormControl;
  }

  constructor(public authModalService: AuthModalService) { }

  ngOnInit(): void {
  }

  submit() {
    console.log(this.form.value);
  }

  submitS() {
    console.log(this.signup.value);
  }
}