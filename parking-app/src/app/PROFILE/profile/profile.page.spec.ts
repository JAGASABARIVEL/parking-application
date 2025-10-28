import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PROFILEPage } from './profile.page';

describe('PROFILEPage', () => {
  let component: PROFILEPage;
  let fixture: ComponentFixture<PROFILEPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PROFILEPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
