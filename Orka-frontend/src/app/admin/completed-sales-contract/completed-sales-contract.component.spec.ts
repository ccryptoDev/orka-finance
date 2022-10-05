import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedSalesContractComponent } from './completed-sales-contract.component';

describe('CompletedSalesContractComponent', () => {
  let component: CompletedSalesContractComponent;
  let fixture: ComponentFixture<CompletedSalesContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedSalesContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedSalesContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
