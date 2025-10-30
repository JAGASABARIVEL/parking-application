import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisputesReturnsPage } from './disputes-returns.page';

describe('DisputesReturnsPage', () => {
  let component: DisputesReturnsPage;
  let fixture: ComponentFixture<DisputesReturnsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisputesReturnsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
