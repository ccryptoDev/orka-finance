import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateOfGoodStandingComponent } from './certificate-of-good-standing.component';

describe('CertificateOfGoodStandingComponent', () => {
  let component: CertificateOfGoodStandingComponent;
  let fixture: ComponentFixture<CertificateOfGoodStandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateOfGoodStandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateOfGoodStandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
