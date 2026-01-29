import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput, IonButton, IonLabel, ToastController, LoadingController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonInput, IonButton, IonLabel, CommonModule, FormsModule]
})
export class LoginPage {
  credentials = { username: '', password: '' };
  isRegister = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
  }

  async submit() {
    const loading = await this.loadingController.create({
      message: this.isRegister ? 'Registering...' : 'Authenticating...',
      spinner: 'crescent'
    });
    await loading.present();

    if (this.isRegister) {
      this.authService.register(this.credentials).subscribe({
        next: async () => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Registration successful! Please sign in.',
            duration: 2000,
            color: 'success',
            position: 'bottom'
          });
          await toast.present();
          this.isRegister = false; // Switch back to login
        },
        error: async (err) => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Registration failed. Username might be taken.',
            duration: 2000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
    } else {
      this.authService.login(this.credentials).subscribe({
        next: async () => {
          await loading.dismiss();
          this.router.navigate(['/dashboard']);
        },
        error: async (err) => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Login failed. Please check your credentials.',
            duration: 2000,
            color: 'danger',
            position: 'bottom'
          });
          await toast.present();
        }
      });
    }
  }
}
