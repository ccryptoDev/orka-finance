import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionToOperateComponent } from './permission-to-operate.component';

describe('PermissionToOperateComponent', () => {
  let component: PermissionToOperateComponent;
  let fixture: ComponentFixture<PermissionToOperateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionToOperateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionToOperateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
