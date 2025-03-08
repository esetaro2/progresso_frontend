import { Component, EventEmitter, Output } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ProjectDto } from '../../dto/project.dto';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AvailablePmTableComponent } from '../available-pm-table/available-pm-table.component';
import { ProjectService } from '../../service/project.service';
import { AvailableTeamTableComponent } from '../available-team-table/available-team-table.component';
import { CreateTeamDialogComponent } from '../create-team-dialog/create-team-dialog.component';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-create-project-stepper-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    MatAutocompleteModule,
    AvailablePmTableComponent,
    AvailableTeamTableComponent,
  ],
  templateUrl: './create-project-stepper-dialog.component.html',
  styleUrls: ['./create-project-stepper-dialog.component.css'],
})
export class CreateProjectStepperDialogComponent {
  @Output() projectCreated = new EventEmitter<void>();

  loadingStates = {
    createProject: false,
    assignTeam: false,
  };

  errorStates = {
    createProject: null as string | null,
    assignTeam: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  projectForm: FormGroup;
  projectDto!: ProjectDto;

  today = new Date();
  currentYear = this.today.getFullYear();
  selectedStartMonthLabel = 'MM';
  selectedStartDayLabel = 'DD';
  selectedStartYearLabel = 'YYYY';
  selectedDueMonthLabel = 'MM';
  selectedDueDayLabel = 'DD';
  selectedDueYearLabel = 'YYYY';

  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  daysInStartMonth: number[] = [];
  daysInDueMonth: number[] = [];
  yearsList: number[] = [];

  selectedPmId = 0;

  existingTeam = false;
  selectedTeamId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateProjectStepperDialogComponent>,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    this.projectForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        description: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(255),
          ],
        ],
        startMonth: ['', Validators.required],
        startDay: ['', Validators.required],
        startYear: ['', Validators.required],
        dueMonth: ['', Validators.required],
        dueDay: ['', Validators.required],
        dueYear: ['', Validators.required],
      },
      {
        validators: [
          this.startBeforeDueValidator,
          this.todayDateBeforeStartValidator,
        ],
      }
    );

    this.daysInStartMonth = this.getStartDaysInMonth();
    this.daysInDueMonth = this.getDueDaysInMonth();
    this.yearsList = this.getYearsList();
  }

  preventInitialSpace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      inputElement.value.length === 0
    ) {
      event.preventDefault();
    }
  }

  setLoadingState(key: keyof typeof this.loadingStates, state: boolean): void {
    this.loadingStates[key] = state;
  }

  setErrorState(
    key: keyof typeof this.errorStates,
    error: string | null
  ): void {
    this.errorStates[key] = error;
  }

  todayDateBeforeStartValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    if (startMonth && startDay && startYear) {
      const startMonthIndex = this.months.indexOf(startMonth);

      const startDate = new Date(
        startYear,
        startMonthIndex,
        startDay,
        0,
        0,
        0,
        0
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return { startBeforeToday: true };
      }
    }

    return null;
  };

  startBeforeDueValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    const dueMonth = control.get('dueMonth')?.value;
    const dueDay = control.get('dueDay')?.value;
    const dueYear = control.get('dueYear')?.value;

    if (startMonth && startDay && startYear && dueMonth && dueDay && dueYear) {
      const startMonthIndex = this.months.indexOf(startMonth);
      const dueMonthIndex = this.months.indexOf(dueMonth);

      const startDate = new Date(
        startYear,
        startMonthIndex,
        startDay,
        0,
        0,
        0,
        0
      );
      const dueDate = new Date(dueYear, dueMonthIndex, dueDay, 0, 0, 0, 0);

      if (dueDate < startDate) {
        return { dueBeforeStart: true };
      }
    }

    return null;
  };

  onCreateFirstPartProject(): void {
    const formValues = this.projectForm.value;

    const startMonthIndex = this.months.indexOf(formValues.startMonth) + 1;
    const startDate = `${formValues.startYear}-${String(
      startMonthIndex
    ).padStart(2, '0')}-${String(formValues.startDay).padStart(2, '0')}`;

    const dueMonthIndex = this.months.indexOf(formValues.dueMonth) + 1;
    const dueDate = `${formValues.dueYear}-${String(dueMonthIndex).padStart(
      2,
      '0'
    )}-${String(formValues.dueDay).padStart(2, '0')}`;

    this.projectDto = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      startDate: startDate,
      dueDate: dueDate,
      projectManagerId: this.selectedPmId,
    };
  }

  onPmSelected(pmId: number) {
    this.selectedPmId = pmId;
    this.projectDto.projectManagerId = this.selectedPmId;
  }

  onTeamSelected(teamId: number): void {
    this.selectedTeamId = teamId;
  }

  openCreateTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedTeamId = result.id;
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    this.setLoadingState('createProject', true);

    this.projectService.createProject(this.projectDto).subscribe({
      next: (project) => {
        this.setLoadingState('createProject', false);
        this.setErrorState('createProject', null);

        if (this.selectedTeamId) {
          this.setLoadingState('assignTeam', true);

          this.projectService
            .assignTeamToProject(project.id!, this.selectedTeamId!)
            .subscribe({
              next: () => {
                this.setLoadingState('assignTeam', false);
                this.setErrorState('assignTeam', null);

                this.projectCreated.emit();
                this.dialogRef.close();
                this.toastService.show('Project created successfully!', {
                  classname: 'bg-success text-light',
                  delay: 5000,
                });
                this.toastService.show(
                  'Team assigned to project successfully!',
                  {
                    classname: 'bg-success text-light',
                    delay: 5000,
                  }
                );
              },
              error: (error) => {
                this.setLoadingState('assignTeam', false);
                this.setErrorState('assignTeam', error.message);
              },
            });
        } else {
          this.projectCreated.emit();
          this.dialogRef.close();
          this.toastService.show('Project created successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });
        }
      },
      error: (error) => {
        this.setLoadingState('createProject', false);
        this.setErrorState('createProject', error.message);
      },
    });
  }

  onInput(controlName: string) {
    const control = this.projectForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  onStartYearSelected(year: number) {
    this.selectedStartYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'startYear');
    this.updateStartDaysInMonth();
  }

  onStartMonthSelected(month: string) {
    this.selectedStartMonthLabel = month;
    this.onDropdownSelect(month, 'startMonth');
    this.updateStartDaysInMonth();
  }

  onStartDaySelected(day: number) {
    this.selectedStartDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'startDay');
  }

  onDueYearSelected(year: number) {
    this.selectedDueYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'dueYear');
    this.updateDueDaysInMonth();
  }

  onDueMonthSelected(month: string) {
    this.selectedDueMonthLabel = month;
    this.onDropdownSelect(month, 'dueMonth');
    this.updateDueDaysInMonth();
  }

  onDueDaySelected(day: number) {
    this.selectedDueDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'dueDay');
  }

  onDropdownSelect(value: string, controlName: string) {
    const control = this.projectForm.get(controlName);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  updateStartDaysInMonth() {
    this.daysInStartMonth = this.getStartDaysInMonth();
    if (
      !this.daysInStartMonth.includes(parseInt(this.selectedStartDayLabel)) &&
      this.selectedStartDayLabel !== 'DD'
    ) {
      this.onStartDaySelected(this.daysInStartMonth[0]);
    }
  }

  updateDueDaysInMonth() {
    this.daysInDueMonth = this.getDueDaysInMonth();
    if (
      !this.daysInDueMonth.includes(parseInt(this.selectedDueDayLabel)) &&
      this.selectedDueDayLabel !== 'DD'
    ) {
      this.onDueDaySelected(this.daysInStartMonth[0]);
    }
  }

  getStartDaysInMonth(): number[] {
    const monthIndex =
      this.months.indexOf(this.selectedStartMonthLabel) + 1 || 1;
    const year =
      parseInt(this.selectedStartYearLabel) || new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getDueDaysInMonth(): number[] {
    const monthIndex = this.months.indexOf(this.selectedDueMonthLabel) + 1 || 1;
    const year =
      parseInt(this.selectedDueYearLabel) || new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  private getYearsList(): number[] {
    const minimumYear = this.currentYear;
    const maximumYear = this.currentYear + 10;
    return Array.from(
      { length: maximumYear - minimumYear + 1 },
      (_, i) => minimumYear + i
    );
  }

  isStartDateValid(): boolean {
    const startMonth = this.projectForm.get('startMonth')?.valid;
    const startDay = this.projectForm.get('startDay')?.valid;
    const startYear = this.projectForm.get('startYear')?.valid;

    return startMonth! && startDay! && startYear!;
  }
}
