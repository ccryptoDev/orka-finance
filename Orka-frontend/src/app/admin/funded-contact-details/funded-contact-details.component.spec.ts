import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundedContactDetailsComponent } from './funded-contact-details.component';

describe('FundedContactDetailsComponent', () => {
  let component: FundedContactDetailsComponent;
  let fixture: ComponentFixture<FundedContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundedContactDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundedContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
