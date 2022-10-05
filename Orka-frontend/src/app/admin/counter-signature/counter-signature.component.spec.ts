import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterSignatureComponent } from './counter-signature.component';

describe('CounterSignatureComponent', () => {
  let component: CounterSignatureComponent;
  let fixture: ComponentFixture<CounterSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterSignatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
