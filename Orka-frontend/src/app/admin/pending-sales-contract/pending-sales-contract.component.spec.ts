import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSalesContractComponent } from './pending-sales-contract.component';

describe('PendingSalesContractComponent', () => {
  let component: PendingSalesContractComponent;
  let fixture: ComponentFixture<PendingSalesContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingSalesContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingSalesContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
