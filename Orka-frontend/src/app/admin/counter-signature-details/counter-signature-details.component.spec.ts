import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterSignatureDetailsComponent } from './counter-signature-details.component';

describe('CounterSignatureDetailsComponent', () => {
  let component: CounterSignatureDetailsComponent;
  let fixture: ComponentFixture<CounterSignatureDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterSignatureDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterSignatureDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
