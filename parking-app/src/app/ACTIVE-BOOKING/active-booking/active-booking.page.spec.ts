import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ACTIVEBOOKINGPage } from './active-booking.page';

describe('ACTIVEBOOKINGPage', () => {
  let component: ACTIVEBOOKINGPage;
  let fixture: ComponentFixture<ACTIVEBOOKINGPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ACTIVEBOOKINGPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
