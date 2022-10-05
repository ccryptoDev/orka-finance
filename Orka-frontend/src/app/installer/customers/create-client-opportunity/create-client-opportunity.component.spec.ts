import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClientOpportunityComponent } from './create-client-opportunity.component';

describe('CreateClientOpportunityComponent', () => {
  let component: CreateClientOpportunityComponent;
  let fixture: ComponentFixture<CreateClientOpportunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateClientOpportunityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClientOpportunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
