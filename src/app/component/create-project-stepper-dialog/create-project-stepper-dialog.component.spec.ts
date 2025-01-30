import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectStepperDialogComponent } from './create-project-stepper-dialog.component';

describe('CreateProjectStepperDialogComponent', () => {
  let component: CreateProjectStepperDialogComponent;
  let fixture: ComponentFixture<CreateProjectStepperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectStepperDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProjectStepperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
