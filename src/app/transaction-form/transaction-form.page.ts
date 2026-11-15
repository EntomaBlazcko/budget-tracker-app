import { Component, input } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-transaction-form',
  templateUrl: 'transaction-form.page.html',
  styleUrls: ['transaction-form.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent],
})
export class TransactionFormPage {
  /**
   * Bound from the route by withComponentInputBinding() in main.ts.
   * Undefined on /transactions/new, set on /transactions/:id/edit.
   */
  readonly id = input<string>();
}
