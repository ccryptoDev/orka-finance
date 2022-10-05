import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneChecklistComponent } from './milestone-checklist.component';

describe('MilestoneChecklistComponent', () => {
  let component: MilestoneChecklistComponent;
  let fixture: ComponentFixture<MilestoneChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilestoneChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
