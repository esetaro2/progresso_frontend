import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TaskDto } from '../../dto/task.dto';
import { TaskService } from '../../service/task.service';
import { ToastService } from '../../service/toast.service';
import { TeamMembersTableComponent } from '../team-members-table/team-members-table.component';

@Component({
  selector: 'app-create-task-stepper-dialog',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    FormsModule,
    TeamMembersTableComponent,
  ],
  templateUrl: './create-task-stepper-dialog.component.html',
  styleUrl: './create-task-stepper-dialog.component.css',
})
export class CreateTaskStepperDialogComponent implements OnInit {
  @Output() taskCreated = new EventEmitter<void>();

  loadingStates = {
    createTask: false,
  };

  errorStates = {
    createTask: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  taskForm: FormGroup;
  taskDto?: TaskDto;

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

  priorities = ['HIGH', 'MEDIUM', 'LOW'];
  selectedPriorityLabel = 'Select Priority';

  selectedTeamMemberId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      projectId: number;
      teamId: number;
      startDate: string;
      dueDate: string;
    },
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastService: ToastService
  ) {
    this.taskForm = this.fb.group(
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
        priority: ['', Validators.required],
        startMonth: ['', Validators.required],
        startDay: ['', Validators.required],
        startYear: ['', Validators.required],
        dueMonth: ['', Validators.required],
        dueDay: ['', Validators.required],
        dueYear: ['', Validators.required],
      },
      {
        validators: [
          this.todayDateBeforeStartValidator,
          this.startBeforeDueValidator,
          this.startDateBeforeProjectDueDateValidator,
          this.startDateAfterProjectStartDateValidator,
          this.dueDateBeforeProjectDueDateValidator,
        ],
      }
    );

    this.yearsList = this.getYearsList();
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

  onCreateFirstPartTask() {
    const formValues = this.taskForm.value;

    const startMonthIndex = this.months.indexOf(formValues.startMonth) + 1;
    const startDate = `${formValues.startYear}-${String(
      startMonthIndex
    ).padStart(2, '0')}-${String(formValues.startDay).padStart(2, '0')}`;

    const dueMonthIndex = this.months.indexOf(formValues.dueMonth) + 1;
    const dueDate = `${formValues.dueYear}-${String(dueMonthIndex).padStart(
      2,
      '0'
    )}-${String(formValues.dueDay).padStart(2, '0')}`;

    this.taskDto = {
      name: formValues.name,
      description: formValues.description,
      priority: formValues.priority,
      startDate: startDate,
      dueDate: dueDate,
      projectId: this.data.projectId,
    };

    console.log('First part task', this.taskDto);
  }

  onTeamMemberSelected(teamMemberId: number): void {
    this.selectedTeamMemberId = teamMemberId;
  }

  onSubmit(): void {
    this.setLoadingState('createTask', true);

    this.taskService
      .createAndAssignTaskToUser(this.taskDto!, this.selectedTeamMemberId!)
      .subscribe({
        next: (task: TaskDto) => {
          console.log('Task creato con successo', task);

          this.toastService.show('Task created successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });

          this.taskCreated.emit();
          this.setLoadingState('createTask', false);
          this.setErrorState('createTask', null);
        },
        error: () => {
          this.setLoadingState('createTask', false);
          this.setErrorState('createTask', 'Failed to create task!');
        },
      });
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

  startDateAfterProjectStartDateValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    if (startMonth && startDay && startYear && this.data?.startDate) {
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
      const projectStartDate = new Date(this.data.startDate);
      projectStartDate.setHours(0, 0, 0, 0);

      if (startDate < projectStartDate) {
        return { startBeforeProjectStartDate: true };
      }
    }
    return null;
  };

  startDateBeforeProjectDueDateValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    if (startMonth && startDay && startYear && this.data?.dueDate) {
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
      const projectDueDate = new Date(this.data.dueDate);
      projectDueDate.setHours(0, 0, 0, 0);

      if (startDate > projectDueDate) {
        return { startAfterProjectDueDate: true };
      }
    }
    return null;
  };

  dueDateBeforeProjectDueDateValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const dueMonth = control.get('dueMonth')?.value;
    const dueDay = control.get('dueDay')?.value;
    const dueYear = control.get('dueYear')?.value;

    if (dueMonth && dueDay && dueYear && this.data?.dueDate) {
      const dueMonthIndex = this.months.indexOf(dueMonth);

      const dueDate = new Date(dueYear, dueMonthIndex, dueDay, 0, 0, 0, 0);
      const projectDueDate = new Date(this.data.dueDate);
      projectDueDate.setHours(0, 0, 0, 0);

      if (dueDate > projectDueDate) {
        return { dueAfterProjectDueDate: true };
      }
    }
    return null;
  };

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

  onInput(controlName: string) {
    const control = this.taskForm.get(controlName);
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
    this.taskForm.get(controlName)?.setValue(value);
    this.taskForm.get(controlName)?.markAsTouched();
  }

  onPrioritySelected(priority: string): void {
    this.selectedPriorityLabel = priority;
    this.onDropdownSelect(priority.toString(), 'priority');
  }

  isStartDateValid(): boolean {
    const startMonth = this.taskForm.get('startMonth')?.valid;
    const startDay = this.taskForm.get('startDay')?.valid;
    const startYear = this.taskForm.get('startYear')?.valid;

    return startMonth! && startDay! && startYear!;
  }
}
