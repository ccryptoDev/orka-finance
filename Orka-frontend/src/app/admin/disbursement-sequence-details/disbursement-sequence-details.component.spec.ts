import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementSequenceDetailsComponent } from './disbursement-sequence-details.component';

describe('DisbursementSequenceDetailsComponent', () => {
  let component: DisbursementSequenceDetailsComponent;
  let fixture: ComponentFixture<DisbursementSequenceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisbursementSequenceDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbursementSequenceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
