import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BOOKINGFLOWPage } from './booking-flow.page';

describe('BOOKINGFLOWPage', () => {
  let component: BOOKINGFLOWPage;
  let fixture: ComponentFixture<BOOKINGFLOWPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BOOKINGFLOWPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
