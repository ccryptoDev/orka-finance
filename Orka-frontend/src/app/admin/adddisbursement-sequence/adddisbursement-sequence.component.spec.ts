import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdddisbursementSequenceComponent } from './adddisbursement-sequence.component';

describe('AdddisbursementSequenceComponent', () => {
  let component: AdddisbursementSequenceComponent;
  let fixture: ComponentFixture<AdddisbursementSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdddisbursementSequenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdddisbursementSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
