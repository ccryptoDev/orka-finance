import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductsDetailsComponent } from './loan-products-details.component';

describe('LoanProductsDetailsComponent', () => {
  let component: LoanProductsDetailsComponent;
  let fixture: ComponentFixture<LoanProductsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
