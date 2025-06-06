import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationDetailPage } from './location-detail.page';

describe('LocationDetailPage', () => {
  let component: LocationDetailPage;
  let fixture: ComponentFixture<LocationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
