import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TaskDto } from '../../dto/task.dto';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../service/task.service';
import { TeamMembersTableComponent } from '../team-members-table/team-members-table.component';
import { ToastService } from '../../service/toast.service';

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

@Component({
  selector: 'app-edit-task-dialog',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    FormsModule,
    TeamMembersTableComponent,
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrl: './edit-task-dialog.component.css',
})
export class EditTaskDialogComponent implements OnInit {
  @Output() taskUpdated = new EventEmitter<void>();

  loadingStates = {
    updateTask: false,
    reassignTask: false,
  };

  errorStates = {
    updateTask: null as string | null,
    reassignTask: null as string | null,
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

  searchQuery = '';
  isSearchQueryPresent = false;
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  reassignUser = false;
  selectedRow: TeamMember | null = null;
  selectedTeamMemberId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      task: TaskDto;
      teamId: number;
      projectId: number;
      startDate: string;
      dueDate: string;
    },
    private taskService: TaskService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private toastService: ToastService
  ) {
    const task = this.data.task;

    const startDate = new Date(task.startDate);
    console.log('Start date:', startDate);
    const dueDate = new Date(task.dueDate);
    console.log('Due date:', dueDate);

    this.selectedStartMonthLabel = this.months[startDate.getMonth()];
    this.selectedStartDayLabel = startDate.getDate().toString();
    this.selectedStartYearLabel = startDate.getFullYear().toString();

    this.selectedDueMonthLabel = this.months[dueDate.getMonth()];
    this.selectedDueDayLabel = dueDate.getDate().toString();
    this.selectedDueYearLabel = dueDate.getFullYear().toString();

    this.selectedPriorityLabel = task.priority || 'Select Priority';

    this.taskForm = this.fb.group(
      {
        name: [
          task.name,
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        description: [
          task.description,
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(255),
          ],
        ],
        priority: [task.priority, Validators.required],
        startMonth: [this.months[startDate.getMonth()], Validators.required],
        startDay: [startDate.getDate(), Validators.required],
        startYear: [startDate.getFullYear(), Validators.required],
        dueMonth: [this.months[dueDate.getMonth()], Validators.required],
        dueDay: [dueDate.getDate(), Validators.required],
        dueYear: [dueDate.getFullYear(), Validators.required],
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

    this.taskForm.markAllAsTouched();
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

  onEditFirstPartTask() {
    const formValues = this.taskForm.value;

    const monthNames = [
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

    const startMonthIndex = monthNames.indexOf(formValues.startMonth) + 1;
    const startDate = `${formValues.startYear}-${String(
      startMonthIndex
    ).padStart(2, '0')}-${String(formValues.startDay).padStart(2, '0')}`;

    const dueMonthIndex = monthNames.indexOf(formValues.dueMonth) + 1;
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
    console.log(this.selectedTeamMemberId);
  }

  onSubmit() {
    this.setLoadingState('updateTask', true);

    this.taskService.updateTask(this.data.task.id!, this.taskDto!).subscribe({
      next: (task) => {
        this.setLoadingState('updateTask', false);
        this.setErrorState('updateTask', null);

        if (this.selectedTeamMemberId) {
          this.setLoadingState('reassignTask', true);

          this.taskService
            .reassignTaskToUser(task.id!, this.selectedTeamMemberId)
            .subscribe({
              next: (task) => {
                console.log('Task with reassigned user', task);
                this.setLoadingState('reassignTask', false);
                this.setErrorState('reassignTask', null);

                this.dialogRef.close();
                this.taskUpdated.emit();

                this.toastService.show('Task udpated successfully!', {
                  classname: 'bg-success text-light',
                  delay: 5000,
                });
                this.toastService.show('Task reassigned successfully!', {
                  classname: 'bg-success text-light',
                  delay: 5000,
                });
              },
              error: () => {
                this.setLoadingState('reassignTask', false);
                this.setErrorState('reassignTask', 'Failed to assign user!');
              },
            });
        } else {
          this.dialogRef.close();
          this.taskUpdated.emit();
          this.toastService.show('Task udpated successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });
        }
      },
      error: () => {
        this.setLoadingState('updateTask', false);
        this.setErrorState('updateTask', 'Failed to update task!');
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
