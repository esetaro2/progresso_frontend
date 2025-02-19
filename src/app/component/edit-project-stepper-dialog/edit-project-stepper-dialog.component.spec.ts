import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectStepperDialogComponent } from './edit-project-stepper-dialog.component';

describe('EditProjectStepperDialogComponent', () => {
  let component: EditProjectStepperDialogComponent;
  let fixture: ComponentFixture<EditProjectStepperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProjectStepperDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectStepperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
