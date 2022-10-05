import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddinstallerComponent } from './addinstaller.component';

describe('AddinstallerComponent', () => {
  let component: AddinstallerComponent;
  let fixture: ComponentFixture<AddinstallerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddinstallerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddinstallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
