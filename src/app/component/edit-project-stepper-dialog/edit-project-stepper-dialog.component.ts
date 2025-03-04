import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProjectDto } from '../../dto/project.dto';
import { TeamDto } from '../../dto/team.dto';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ProjectService } from '../../service/project.service';
import { ToastService } from '../../service/toast.service';
import { CreateTeamDialogComponent } from '../create-team-dialog/create-team-dialog.component';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { AvailablePmTableComponent } from '../available-pm-table/available-pm-table.component';
import { AvailableTeamTableComponent } from '../available-team-table/available-team-table.component';
import { EditTeamStepperDialogComponent } from '../edit-team-stepper-dialog/edit-team-stepper-dialog.component';

@Component({
  selector: 'app-edit-project-stepper-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    MatAutocompleteModule,
    AvailablePmTableComponent,
    AvailableTeamTableComponent,
  ],
  templateUrl: './edit-project-stepper-dialog.component.html',
  styleUrl: './edit-project-stepper-dialog.component.css',
})
export class EditProjectStepperDialogComponent implements OnInit {
  @Output() projectUpdated = new EventEmitter<void>();

  loadingStates = {
    updateProject: false,
    updateProjectManager: false,
    reassignTeam: false,
  };

  errorStates = {
    updateProject: null as string | null,
    updateProjectManager: null as string | null,
    reassignTeam: null as string | null,
  };

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

  updateProjectManager = false;
  selectedPmId: number | null = null;

  existingTeam = false;
  selectedTeamId: number | null = null;

  userRole?: string;

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      project: ProjectDto;
      team: TeamDto;
      userRole: string;
    },
    public dialogRef: MatDialogRef<EditProjectStepperDialogComponent>,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    const project = this.data.project;

    this.userRole = this.data.userRole;

    const startDate = new Date(project.startDate);
    const dueDate = new Date(project.dueDate);

    this.selectedStartMonthLabel = this.months[startDate.getMonth()];
    this.selectedStartDayLabel = startDate.getDate().toString();
    this.selectedStartYearLabel = startDate.getFullYear().toString();

    this.selectedDueMonthLabel = this.months[dueDate.getMonth()];
    this.selectedDueDayLabel = dueDate.getDate().toString();
    this.selectedDueYearLabel = dueDate.getFullYear().toString();

    this.projectForm = this.fb.group(
      {
        name: [
          project.name,
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        description: [
          project.description,
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(255),
          ],
        ],
        startMonth: [this.months[startDate.getMonth()], Validators.required],
        startDay: [startDate.getDate(), Validators.required],
        startYear: [startDate.getFullYear(), Validators.required],
        dueMonth: [this.months[dueDate.getMonth()], Validators.required],
        dueDay: [dueDate.getDate(), Validators.required],
        dueYear: [dueDate.getFullYear(), Validators.required],
      },
      {
        validators: [
          this.startBeforeDueValidator,
          this.todayDateBeforeStartValidator,
        ],
      }
    );

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

  ngOnInit(): void {
    this.updateStartDateDays();
    this.updateDueDateDays();
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
      const newStartDate = new Date(
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

      if (this.data.project) {
        const originalStartDate = new Date(this.data.project.startDate);
        originalStartDate.setHours(0, 0, 0, 0);

        if (
          this.data.project.status !== 'IN_PROGRESS' &&
          newStartDate.getTime() === originalStartDate.getTime()
        ) {
          return null;
        }

        if (this.data.project.status === 'IN_PROGRESS') {
          return { startDateLocked: true };
        }
      }

      if (newStartDate < today) {
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

  onStepChange(event: { selectedIndex: number }) {
    switch (event.selectedIndex) {
      case 0:
        this.onEditFirstPartProject();
        break;
      case 1:
        this.onEditFirstPartProject();
        if (this.selectedPmId !== null) {
          this.onPmSelected(this.selectedPmId);
        }
        this.onEditFirstPartProject();
        break;
      case 2:
        if (this.selectedTeamId !== null) {
          this.onTeamSelected(this.selectedTeamId);
        }
        this.onEditFirstPartProject();
        break;
    }
  }

  isValidForNext(): boolean {
    if (this.projectForm.valid) {
      return true;
    }

    const controlsValid = Object.keys(this.projectForm.controls).every(
      (key) => {
        const control = this.projectForm.get(key);
        return control?.valid;
      }
    );

    const groupErrors = this.projectForm.errors;

    if (
      controlsValid &&
      groupErrors &&
      Object.keys(groupErrors).length === 1 &&
      groupErrors['startDateLocked']
    ) {
      return true;
    }

    return false;
  }

  onEditFirstPartProject(): void {
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
      projectManagerId: this.selectedPmId
        ? this.selectedPmId
        : this.data.project.projectManagerId,
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

  openEditTeamDialog(): void {
    const dialogRef = this.dialog.open(EditTeamStepperDialogComponent, {
      data: {
        team: this.data.team,
      },
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.componentInstance.teamUpdated.subscribe(() => {
      this.onSubmit();
      this.projectUpdated.emit();
      dialogRef.close();
    });
  }

  onSubmit(): void {
    this.setLoadingState('updateProject', true);

    this.projectService
      .updateProject(this.data.project.id!, this.projectDto)
      .subscribe({
        next: (updatedProject) => {
          this.setLoadingState('updateProject', false);
          this.setErrorState('updateProject', null);

          this.toastService.show('Project updated successfully!', {
            classname: 'bg-success text-light',
            delay: 3000,
          });

          if (this.selectedPmId) {
            this.setLoadingState('updateProjectManager', true);

            this.projectService
              .updateProjectManager(updatedProject.id!, this.selectedPmId)
              .subscribe({
                next: () => {
                  this.setLoadingState('updateProjectManager', false);
                  this.setErrorState('updateProjectManager', null);

                  this.toastService.show(
                    'Project Manager updated successfully!',
                    {
                      classname: 'bg-success text-light',
                      delay: 3000,
                    }
                  );

                  if (this.selectedTeamId) {
                    this.setLoadingState('reassignTeam', true);

                    this.projectService
                      .reassignTeamToProject(
                        updatedProject.id!,
                        this.selectedTeamId
                      )
                      .subscribe({
                        next: () => {
                          this.setLoadingState('reassignTeam', false);
                          this.setErrorState('reassignTeam', null);

                          this.toastService.show(
                            'Team reassigned successfully!',
                            {
                              classname: 'bg-success text-light',
                              delay: 3000,
                            }
                          );

                          this.projectUpdated.emit();
                          this.dialogRef.close();
                        },
                        error: (error) => {
                          this.setLoadingState('reassignTeam', false);
                          this.setErrorState('reassignTeam', error.message);
                        },
                      });
                  } else {
                    this.projectUpdated.emit();
                    this.dialogRef.close();
                  }
                },
                error: (error) => {
                  this.setLoadingState('updateProjectManager', false);
                  this.setErrorState('updateProjectManager', error.message);
                },
              });
          } else if (this.selectedTeamId) {
            this.setLoadingState('reassignTeam', true);

            this.projectService
              .reassignTeamToProject(updatedProject.id!, this.selectedTeamId)
              .subscribe({
                next: () => {
                  this.setLoadingState('reassignTeam', false);
                  this.setErrorState('reassignTeam', null);

                  this.toastService.show('Team reassigned successfully!', {
                    classname: 'bg-success text-light',
                    delay: 3000,
                  });

                  this.projectUpdated.emit();
                  this.dialogRef.close();
                },
                error: (error) => {
                  this.setLoadingState('reassignTeam', false);
                  this.setErrorState('reassignTeam', error.message);
                },
              });
          } else {
            this.projectUpdated.emit();
            this.dialogRef.close();
          }
        },
        error: (error) => {
          this.setLoadingState('updateProject', false);
          this.setErrorState('updateProject', error.message);
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

  onStartMonthSelected(month: string) {
    this.selectedStartMonthLabel = month;
    this.onDropdownSelect(month, 'startMonth');
    this.updateStartDateDays();
    this.updateDueDateDays();
  }

  onStartDaySelected(day: number) {
    this.selectedStartDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'startDay');
    this.updateDueDateDays();
  }

  onStartYearSelected(year: number) {
    this.selectedStartYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'startYear');
    this.updateStartDateDays();
    this.updateDueDateDays();
  }

  onDueMonthSelected(month: string) {
    this.selectedDueMonthLabel = month;
    this.onDropdownSelect(month, 'dueMonth');
    this.updateDueDateDays();
  }

  onDueDaySelected(day: number) {
    this.selectedDueDayLabel = day.toString();
    this.onDropdownSelect(day.toString(), 'dueDay');
  }

  onDueYearSelected(year: number) {
    this.selectedDueYearLabel = year.toString();
    this.onDropdownSelect(year.toString(), 'dueYear');
    this.updateDueDateDays();
  }

  private onDropdownSelect(value: string, controlName: string) {
    this.projectForm.get(controlName)?.setValue(value);
    this.projectForm.get(controlName)?.markAsTouched();
  }

  private updateStartDateDays() {
    this.daysInStartMonth = this.getDaysInMonth(
      this.selectedStartMonthLabel,
      parseInt(this.selectedStartYearLabel) || this.currentYear
    );
  }

  private updateDueDateDays() {
    this.daysInDueMonth = this.getDaysInMonth(
      this.selectedDueMonthLabel,
      parseInt(this.selectedDueYearLabel) || this.currentYear
    );
  }

  private getDaysInMonth(monthLabel: string, year: number): number[] {
    const monthIndex = this.months.indexOf(monthLabel) + 1;
    if (monthIndex <= 0) return [];
    return Array.from(
      { length: new Date(year, monthIndex, 0).getDate() },
      (_, i) => i + 1
    );
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
