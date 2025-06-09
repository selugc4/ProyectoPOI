import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchPOIsPage } from './search-pois.page';

describe('SearchPOIsPage', () => {
  let component: SearchPOIsPage;
  let fixture: ComponentFixture<SearchPOIsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPOIsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
