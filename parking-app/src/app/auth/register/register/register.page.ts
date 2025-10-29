// auth/register/register.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.registerForm = this.fb.group({
      userType: ['user', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('passwordConfirm')?.value
      ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onUserTypeChange() {
    // Handle user type change if needed
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    const formData = this.registerForm.value;

    this.authService.register(
      formData.username,
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.phoneNumber,
      formData.userType,
      formData.password,
      formData.passwordConfirm
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.showToast('Account created successfully!', 'success');
        this.router.navigate(['/home']);
      },
      (error) => {
        this.isLoading = false;
        const errorMsg = this.getErrorMessage(error);
        this.showToast(errorMsg, 'danger');
      }
    );
  }

  showTerms() {
    this.alertController.create({
      header: 'Terms & Conditions',
      message: 'By using this app, you agree to our terms of service and privacy policy...',
      buttons: ['OK']
    }).then(alert => alert.present());
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  private getErrorMessage(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.username) {
        return `Username: ${error.error.username[0]}`;
      }
      if (error.error.email) {
        return `Email: ${error.error.email[0]}`;
      }
      if (error.error.password) {
        return `Password: ${error.error.password[0]}`;
      }
      if (error.error.detail) {
        return error.error.detail;
      }
    }
    return 'Registration failed. Please try again.';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    }).then(toast => toast.present());
  }
}