import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { InsightsPage } from './insights.page';

describe('InsightsPage', () => {
  let component: InsightsPage;
  let fixture: ComponentFixture<InsightsPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(InsightsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
