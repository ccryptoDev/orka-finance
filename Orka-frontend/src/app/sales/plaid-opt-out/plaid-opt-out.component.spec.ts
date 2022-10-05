import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaidOptOutComponent } from './plaid-opt-out.component';

describe('PlaidOptOutComponent', () => {
  let component: PlaidOptOutComponent;
  let fixture: ComponentFixture<PlaidOptOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaidOptOutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaidOptOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
