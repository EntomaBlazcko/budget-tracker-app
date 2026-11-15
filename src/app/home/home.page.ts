import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonProgressBar,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForward, carOutline, cartOutline, cashOutline, fastFoodOutline, playCircleOutline } from 'ionicons/icons';

interface RecentTransaction {
  merchant: string;
  category: string;
  categoryClass: string;
  icon: string;
  date: string;
  amount: string;
  income?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonNote,
    RouterLink,
  ],
})
export class HomePage {
  readonly month = 'NOVEMBER 2026';

  readonly recent: RecentTransaction[] = [
    {
      merchant: 'Jollibee',
      category: 'Food',
      categoryClass: 'cat-food',
      icon: 'fast-food-outline',
      date: 'TODAY · 12:40 PM',
      amount: '-₱285.00',
    },
    {
      merchant: 'Grab',
      category: 'Transport',
      categoryClass: 'cat-transport',
      icon: 'car-outline',
      date: 'TODAY · 8:15 AM',
      amount: '-₱180.00',
    },
    {
      merchant: 'SM Supermarket',
      category: 'Shopping',
      categoryClass: 'cat-shopping',
      icon: 'cart-outline',
      date: 'YESTERDAY · 6:02 PM',
      amount: '-₱1,845.50',
    },
    {
      merchant: 'Netflix',
      category: 'Fun',
      categoryClass: 'cat-fun',
      icon: 'play-circle-outline',
      date: 'NOV 12 · 9:00 AM',
      amount: '-₱549.00',
    },
    {
      merchant: 'Salary deposit',
      category: 'Income',
      categoryClass: 'cat-income',
      icon: 'cash-outline',
      date: 'NOV 11 · 8:00 AM',
      amount: '+₱42,000.00',
      income: true,
    },
  ];

  constructor() {
    addIcons({
      arrowForward,
      fastFoodOutline,
      carOutline,
      cartOutline,
      playCircleOutline,
      cashOutline,
    });
  }
}
