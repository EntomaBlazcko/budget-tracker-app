import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-expense',
  templateUrl: 'add-expense.page.html',
  styleUrls: ['add-expense.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonNote,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonChip,
    IonDatetime,
    IonDatetimeButton,
    IonIcon,
    IonModal,
    IonButton,
    RouterLink,
  ],
})
export class AddExpensePage {
  readonly today = '2026-11-15';

  constructor() {
    addIcons({ cameraOutline, calendarOutline });
  }
}
