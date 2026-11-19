// Tabs page - bottom navigation and the add button.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonFab, IonFabButton, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, homeOutline, receiptOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonFab, IonFabButton, RouterLink],
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, receiptOutline, walletOutline, add });
  }
}
