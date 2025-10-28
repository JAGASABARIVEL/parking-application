import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OWNERDASHBOARDPage } from './owner-dashboard.page';

describe('OWNERDASHBOARDPage', () => {
  let component: OWNERDASHBOARDPage;
  let fixture: ComponentFixture<OWNERDASHBOARDPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OWNERDASHBOARDPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
