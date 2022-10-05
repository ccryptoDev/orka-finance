import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDocumentsComponent } from './loan-documents.component';

describe('LoanDocumentsComponent', () => {
  let component: LoanDocumentsComponent;
  let fixture: ComponentFixture<LoanDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
