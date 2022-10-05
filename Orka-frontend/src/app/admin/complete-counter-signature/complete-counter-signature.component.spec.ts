import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteCounterSignatureComponent } from './complete-counter-signature.component';

describe('CompleteCounterSignatureComponent', () => {
  let component: CompleteCounterSignatureComponent;
  let fixture: ComponentFixture<CompleteCounterSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompleteCounterSignatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteCounterSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
