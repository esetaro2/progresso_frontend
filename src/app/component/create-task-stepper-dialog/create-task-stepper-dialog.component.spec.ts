import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaskStepperDialogComponent } from './create-task-stepper-dialog.component';

describe('CreateTaskStepperDialogComponent', () => {
  let component: CreateTaskStepperDialogComponent;
  let fixture: ComponentFixture<CreateTaskStepperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskStepperDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTaskStepperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
