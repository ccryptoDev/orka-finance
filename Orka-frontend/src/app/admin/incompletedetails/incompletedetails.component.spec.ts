import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompletedetailsComponent } from './incompletedetails.component';

describe('IncompletedetailsComponent', () => {
  let component: IncompletedetailsComponent;
  let fixture: ComponentFixture<IncompletedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncompletedetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompletedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
