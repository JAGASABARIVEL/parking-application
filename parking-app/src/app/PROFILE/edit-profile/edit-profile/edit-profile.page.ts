// profile/edit-profile/edit-profile.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: false
})
export class EditProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  profileForm: FormGroup;
  currentUser: any = null;
  isLoading = false;
  profilePicturePreview: string | null = null;
  profilePictureFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: [''],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      bio: [''],
      userType: ['user', [Validators.required]]
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phone_number,
          bio: user.bio || '',
          userType: user.user_type
        });
      }
    });
  }

  async selectProfilePicture() {
    const alert = await this.alertController.create({
      header: 'Select Photo',
      buttons: [
        {
          text: 'Camera',
          handler: () => this.takePicture(CameraSource.Camera)
        },
        {
          text: 'Gallery',
          handler: () => this.takePicture(CameraSource.Photos)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source
      });

      if (image.webPath) {
        this.profilePicturePreview = image.webPath;
        // Convert to blob/file for upload
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        this.profilePictureFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      this.showToast('Error selecting photo', 'danger');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profilePictureFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicturePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();

    this.authService.updateProfile(formData).subscribe(
      () => {
        this.isLoading = false;
        this.showToast('Profile updated successfully', 'success');
        this.router.navigate(['/profile']);
      },
      (error) => {
        this.isLoading = false;
        this.handleError(error);
      }
    );
  }

  prepareFormData(): any {
    const values = this.profileForm.value;
    const formData: any = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      phone_number: values.phoneNumber,
      bio: values.bio,
      user_type: values.userType
    };

    // If profile picture was selected, add it
    if (this.profilePictureFile) {
      const uploadData = new FormData();
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });
      uploadData.append('profile_picture', this.profilePictureFile);
      return uploadData;
    }

    return formData;
  }

  cancel() {
    this.router.navigate(['/profile']);
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: (data) => {
            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Passwords do not match', 'danger');
              return false;
            }
            if (data.newPassword.length < 8) {
              this.showToast('Password must be at least 8 characters', 'danger');
              return false;
            }
            // Call API to change password
            this.showToast('Password changed successfully', 'success');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.showToast('Account deletion requested', 'warning');
            // Call API to delete account
          }
        }
      ]
    });
    await alert.present();
  }

  private handleError(error: any) {
    const errorMsg = this.getErrorMessage(error);
    this.showToast(errorMsg, 'danger');
  }

  private getErrorMessage(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') return error.error;
      if (error.error.detail) return error.error.detail;
      
      const firstKey = Object.keys(error.error)[0];
      if (firstKey && error.error[firstKey]) {
        return `${firstKey}: ${error.error[firstKey][0]}`;
      }
    }
    return 'An error occurred. Please try again.';
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
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}