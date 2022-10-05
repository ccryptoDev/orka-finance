import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementSequenceComponent } from './disbursement-sequence.component';

describe('DisbursementSequenceComponent', () => {
  let component: DisbursementSequenceComponent;
  let fixture: ComponentFixture<DisbursementSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisbursementSequenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbursementSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
