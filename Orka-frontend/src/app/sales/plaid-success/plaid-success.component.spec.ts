import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaidSuccessComponent } from './plaid-success.component';

describe('PlaidSuccessComponent', () => {
  let component: PlaidSuccessComponent;
  let fixture: ComponentFixture<PlaidSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaidSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaidSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
