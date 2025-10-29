// auth/login/login.page.ts (Updated)
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseService } from 'src/app/core/services/firebase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Track page view
    this.firebaseService.trackScreenView('login');

    // Check if already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/home']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe(
      (response) => {
        this.isLoading = false;
        
        // Track successful login
        this.firebaseService.trackLogin('email');
        
        this.showToast('Login successful!', 'success');
        this.router.navigate(['/home']);
      },
      (error) => {
        this.isLoading = false;
        
        // Track failed login
        this.firebaseService.logAnalyticsEvent('login_failed', {
          method: 'email'
        });
        
        const errorMsg = error.error?.detail || error.error?.message || 'Login failed. Please try again.';
        this.showToast(errorMsg, 'danger');
      }
    );
  }

  loginWithGoogle() {
    // Track Google login attempt
    this.firebaseService.logAnalyticsEvent('login_attempt', {
      method: 'google'
    });
    
    this.showToast('Google login coming soon', 'warning');
  }

  forgotPassword() {
    this.alertController.create({
      header: 'Forgot Password',
      message: 'Enter your email address to reset password',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email address'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: (data) => {
            if (data.email) {
              // Track password reset request
              this.firebaseService.logAnalyticsEvent('password_reset_requested', {
                email: data.email
              });
              
              this.showToast('Password reset link sent to your email', 'success');
            }
          }
        }
      ]
    }).then(alert => alert.present());
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
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

// auth/register/register.page.ts (Updated - add to existing file)
// Add to constructor:
// private firebaseService: FirebaseService

// In ngOnInit(), add:
// this.firebaseService.trackScreenView('register');

// In onRegister() success callback, add:
// this.firebaseService.trackSignup('email');