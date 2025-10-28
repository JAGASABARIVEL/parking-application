import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BOOKINGSHISTORYPage } from './bookings-history.page';

describe('BOOKINGSHISTORYPage', () => {
  let component: BOOKINGSHISTORYPage;
  let fixture: ComponentFixture<BOOKINGSHISTORYPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BOOKINGSHISTORYPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
