import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, LoadingController, ToastController, IonItem, IonLabel, IonText, IonButton} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule, IonItem, IonLabel, IonText, IonButton]
})
export class RegisterPage implements OnInit {
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  registrationForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor() { }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentRoute = (event as NavigationEnd).url;
        if (!currentRoute.startsWith('/login')) {
          this.resetFields();
        }
      });
  }
  async register() {
    if (this.registrationForm.invalid) {
      this.showErrorMessage('Por favor, completa los campos correctamente.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registrando los datos...',
      spinner: 'crescent',
      duration: 2000
    });

    await loading.present();

    const { email, password } = this.registrationForm.value;

    try {
      await this.authService.register(email!, password!);
      this.showInfoMessage('Registro realizado. Redirigiendo...');

      setTimeout(() => {
        this.router.navigate(["/list"]);
      }, 2000);

    } catch (error) {
      this.showErrorMessage('Error en el registro: ' + (error as any).message);
    } finally {
      loading.dismiss();
    }
  }

  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }

  async showInfoMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
  resetFields(){
    this.registrationForm.reset();
  }
}
