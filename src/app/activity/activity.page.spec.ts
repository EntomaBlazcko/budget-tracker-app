import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ActivityPage } from './activity.page';

describe('ActivityPage', () => {
  let component: ActivityPage;
  let fixture: ComponentFixture<ActivityPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
