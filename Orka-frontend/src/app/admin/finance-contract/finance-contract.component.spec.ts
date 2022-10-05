import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceContractComponent } from './finance-contract.component';

describe('FinanceContractComponent', () => {
  let component: FinanceContractComponent;
  let fixture: ComponentFixture<FinanceContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
