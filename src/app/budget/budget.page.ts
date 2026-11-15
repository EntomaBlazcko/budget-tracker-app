import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-budget',
  templateUrl: 'budget.page.html',
  styleUrls: ['budget.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class BudgetPage {}
