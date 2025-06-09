import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroqPage } from './groq.page';

describe('GroqPage', () => {
  let component: GroqPage;
  let fixture: ComponentFixture<GroqPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GroqPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
