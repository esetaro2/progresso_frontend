import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTeamStepperDialogComponent } from './edit-team-stepper-dialog.component';

describe('EditTeamStepperDialogComponent', () => {
  let component: EditTeamStepperDialogComponent;
  let fixture: ComponentFixture<EditTeamStepperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTeamStepperDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTeamStepperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
