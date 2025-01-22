import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserLoginDto } from '../../dto/user-login.dto';
import { CommonModule } from '@angular/common';
import { UserResponseDto } from '../../dto/user-response.dto';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordFieldType = 'password';
  private usernameRegex = '^[a-zA-Z]\\.[a-zA-Z]+\\.(am|pm|tm)[0-9]+@progresso\\.com$';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(this.usernameRegex)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const userLoginDto: UserLoginDto = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService.login(userLoginDto).subscribe({
      next: (response: { userResponseDto: UserResponseDto }) => {
        console.log(response.userResponseDto);
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Username or password is incorrect.';
      },
    });
  }

  onInput(controlName: string) {
    const control = this.loginForm.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
    const currentPasswordValue = this.loginForm.get('password')!.value;
    this.loginForm.get('password')?.setValue('');
    this.loginForm.get('password')?.setValue(currentPasswordValue);
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
