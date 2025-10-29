import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddParkingPage } from './add-parking.page';

describe('AddParkingPage', () => {
  let component: AddParkingPage;
  let fixture: ComponentFixture<AddParkingPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddParkingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
