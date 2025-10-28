import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PARKINGDETAILSPage } from './parking-details.page';

describe('PARKINGDETAILSPage', () => {
  let component: PARKINGDETAILSPage;
  let fixture: ComponentFixture<PARKINGDETAILSPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PARKINGDETAILSPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
