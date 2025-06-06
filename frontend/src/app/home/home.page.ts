import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, search, list, logIn} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class HomePage {
  constructor() {
    addIcons({
      person,
      search,
      list,
      logIn
    });
  }
}
