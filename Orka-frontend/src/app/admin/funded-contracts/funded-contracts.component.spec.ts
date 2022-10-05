import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundedContractsComponent } from './funded-contracts.component';

describe('FundedContractsComponent', () => {
  let component: FundedContractsComponent;
  let fixture: ComponentFixture<FundedContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundedContractsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundedContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
