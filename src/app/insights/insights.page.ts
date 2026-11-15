import { Component } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

interface LegendRow {
  name: string;
  categoryClass: string;
  amount: string;
  percent: string;
}

@Component({
  selector: 'app-insights',
  templateUrl: 'insights.page.html',
  styleUrls: ['insights.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonNote,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonChip,
  ],
})
export class InsightsPage {
  readonly legend: LegendRow[] = [
    { name: 'Food', categoryClass: 'cat-food', amount: '₱5,100', percent: '44.1%' },
    { name: 'Transport', categoryClass: 'cat-transport', amount: '₱1,800', percent: '15.6%' },
    { name: 'Bills', categoryClass: 'cat-bills', amount: '₱1,600', percent: '13.9%' },
    { name: 'Fun', categoryClass: 'cat-fun', amount: '₱1,350', percent: '11.7%' },
    { name: 'Health', categoryClass: 'cat-health', amount: '₱500', percent: '4.3%' },
    { name: 'Shopping', categoryClass: 'cat-shopping', amount: '₱1,200', percent: '10.4%' },
  ];
}
