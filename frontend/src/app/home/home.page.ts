import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, ViewWillEnter, IonButton, ToastController, LoadingController} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, search, list, logIn, add, push, logOut, cloudDownload} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonButton],
})
export class HomePage implements OnInit {
  authService: AuthService = inject(AuthService);;
  logged = false;
  private router: Router = inject(Router);
  private loadingController = inject(LoadingController);
  constructor() {
    addIcons({
      person,
      search,
      list,
      logIn,
      add,
      push,
      logOut,
      cloudDownload
    });
  }
  ngOnInit(): void {
    this.authService['user$'].subscribe(user => {
      this.logged = !!user;
    });
  }
  async logout() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'crescent',
      duration: 2000
    });
    await loading.present();
    this.logged = false;
    this.authService.logout();
    this.router.navigate(['']);
  }
}
