import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessPrincipalIdentityComponent } from './business-principal-identity.component';

describe('BusinessPrincipalIdentityComponent', () => {
  let component: BusinessPrincipalIdentityComponent;
  let fixture: ComponentFixture<BusinessPrincipalIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessPrincipalIdentityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessPrincipalIdentityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
