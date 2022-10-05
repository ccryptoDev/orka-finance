import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddloanProductsComponent } from './addloan-products.component';

describe('AddloanProductsComponent', () => {
  let component: AddloanProductsComponent;
  let fixture: ComponentFixture<AddloanProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddloanProductsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddloanProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
