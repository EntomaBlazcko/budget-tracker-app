import { Component } from '@angular/core';
import {
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  carOutline,
  cartOutline,
  cashOutline,
  createOutline,
  fastFoodOutline,
  medicalOutline,
  playCircleOutline,
  storefrontOutline,
  trashOutline,
  flashOutline,
  phonePortraitOutline,
} from 'ionicons/icons';

interface Transaction {
  merchant: string;
  category: string;
  categoryClass: string;
  icon: string;
  note: string;
  date: string;
  amount: string;
  income?: boolean;
}

interface TransactionDay {
  label: string;
  items: Transaction[];
}

@Component({
  selector: 'app-activity',
  templateUrl: 'activity.page.html',
  styleUrls: ['activity.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonChip,
  ],
})
export class ActivityPage {
  readonly days: TransactionDay[] = [
    {
      label: 'TODAY',
      items: [
        {
          merchant: 'Jollibee',
          category: 'Food',
          categoryClass: 'cat-food',
          icon: 'fast-food-outline',
          note: 'Lunch',
          date: 'NOV 15 · 12:40 PM',
          amount: '-₱285.00',
        },
        {
          merchant: 'Grab',
          category: 'Transport',
          categoryClass: 'cat-transport',
          icon: 'car-outline',
          note: 'Ride home',
          date: 'NOV 15 · 6:12 PM',
          amount: '-₱180.00',
        },
        {
          merchant: '7-Eleven',
          category: 'Food',
          categoryClass: 'cat-food',
          icon: 'storefront-outline',
          note: 'Iced coffee',
          date: 'NOV 15 · 8:05 AM',
          amount: '-₱92.50',
        },
      ],
    },
    {
      label: 'YESTERDAY',
      items: [
        {
          merchant: 'SM Supermarket',
          category: 'Shopping',
          categoryClass: 'cat-shopping',
          icon: 'cart-outline',
          note: 'Groceries',
          date: 'NOV 14 · 5:30 PM',
          amount: '-₱1,845.50',
        },
        {
          merchant: 'GCash transfer',
          category: 'Bills',
          categoryClass: 'cat-bills',
          icon: 'phone-portrait-outline',
          note: 'Load + transfer',
          date: 'NOV 14 · 9:18 AM',
          amount: '-₱500.00',
        },
      ],
    },
    {
      label: 'NOV 12',
      items: [
        {
          merchant: 'Netflix',
          category: 'Fun',
          categoryClass: 'cat-fun',
          icon: 'play-circle-outline',
          note: 'Monthly plan',
          date: 'NOV 12 · 7:00 AM',
          amount: '-₱549.00',
        },
        {
          merchant: 'Mercury Drug',
          category: 'Health',
          categoryClass: 'cat-health',
          icon: 'medical-outline',
          note: 'Vitamins',
          date: 'NOV 12 · 1:24 PM',
          amount: '-₱430.00',
        },
        {
          merchant: 'Shopee order',
          category: 'Shopping',
          categoryClass: 'cat-shopping',
          icon: 'cart-outline',
          note: 'Desk lamp',
          date: 'NOV 12 · 3:45 PM',
          amount: '-₱1,120.00',
        },
      ],
    },
    {
      label: 'NOV 11',
      items: [
        {
          merchant: 'Meralco bill',
          category: 'Bills',
          categoryClass: 'cat-bills',
          icon: 'flash-outline',
          note: 'Electricity',
          date: 'NOV 11 · 10:00 AM',
          amount: '-₱2,340.00',
        },
        {
          merchant: 'Salary deposit',
          category: 'Income',
          categoryClass: 'cat-income',
          icon: 'cash-outline',
          note: 'Payroll',
          date: 'NOV 11 · 8:00 AM',
          amount: '+₱42,000.00',
          income: true,
        },
      ],
    },
  ];

  constructor() {
    addIcons({
      fastFoodOutline,
      carOutline,
      storefrontOutline,
      cartOutline,
      phonePortraitOutline,
      playCircleOutline,
      medicalOutline,
      flashOutline,
      cashOutline,
      createOutline,
      trashOutline,
    });
  }
}
