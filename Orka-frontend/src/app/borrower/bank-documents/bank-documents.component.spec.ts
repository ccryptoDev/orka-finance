import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankDocumentsComponent } from './bank-documents.component';

describe('BankDocumentsComponent', () => {
  let component: BankDocumentsComponent;
  let fixture: ComponentFixture<BankDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
