import { Component } from '@angular/core';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  carOutline,
  cartOutline,
  fastFoodOutline,
  flashOutline,
  medicalOutline,
  playCircleOutline,
} from 'ionicons/icons';

type BudgetState = 'ok' | 'almost' | 'over';

interface Envelope {
  name: string;
  number: string;
  categoryClass: string;
  icon: string;
  spent: string;
  limit: string;
  used: string;
  percent: number;
  status: string;
  state: BudgetState;
}

@Component({
  selector: 'app-budgets',
  templateUrl: 'budgets.page.html',
  styleUrls: ['budgets.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon,
    IonProgressBar,
    IonBadge,
  ],
})
export class BudgetsPage {
  readonly envelopes: Envelope[] = [
    {
      name: 'Food',
      number: 'ENVELOPE 01',
      categoryClass: 'cat-food',
      icon: 'fast-food-outline',
      spent: '₱5,100',
      limit: '₱5,500',
      used: '93% USED',
      percent: 0.93,
      status: '₱400 LEFT',
      state: 'almost',
    },
    {
      name: 'Transport',
      number: 'ENVELOPE 02',
      categoryClass: 'cat-transport',
      icon: 'car-outline',
      spent: '₱1,800',
      limit: '₱5,000',
      used: '36% USED',
      percent: 0.36,
      status: '₱3,200 LEFT',
      state: 'ok',
    },
    {
      name: 'Bills',
      number: 'ENVELOPE 03',
      categoryClass: 'cat-bills',
      icon: 'flash-outline',
      spent: '₱1,600',
      limit: '₱10,000',
      used: '16% USED',
      percent: 0.16,
      status: '₱8,400 LEFT',
      state: 'ok',
    },
    {
      name: 'Fun',
      number: 'ENVELOPE 04',
      categoryClass: 'cat-fun',
      icon: 'play-circle-outline',
      spent: '₱1,350',
      limit: '₱1,000',
      used: '135% USED',
      percent: 1,
      status: 'OVER BY ₱350',
      state: 'over',
    },
    {
      name: 'Health',
      number: 'ENVELOPE 05',
      categoryClass: 'cat-health',
      icon: 'medical-outline',
      spent: '₱500',
      limit: '₱3,500',
      used: '14% USED',
      percent: 0.14,
      status: '₱3,000 LEFT',
      state: 'ok',
    },
    {
      name: 'Shopping',
      number: 'ENVELOPE 06',
      categoryClass: 'cat-shopping',
      icon: 'cart-outline',
      spent: '₱1,200',
      limit: '₱5,000',
      used: '24% USED',
      percent: 0.24,
      status: '₱3,800 LEFT',
      state: 'ok',
    },
  ];

  constructor() {
    addIcons({
      fastFoodOutline,
      carOutline,
      flashOutline,
      playCircleOutline,
      medicalOutline,
      cartOutline,
    });
  }
}
