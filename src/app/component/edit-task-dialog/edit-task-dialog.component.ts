import { Component, EventEmitter, Inject, Output } from '@angular/core';
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
export class EditTaskDialogComponent {
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
  selectedTeamMemberIds: number[] = [];

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
    const dueDate = new Date(task.dueDate);

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
          this.startBeforeDueValidator,
          this.dueDateBeforeProjectDueDateValidator,
        ],
      }
    );

    this.daysInStartMonth = this.getStartDaysInMonth();
    this.daysInDueMonth = this.getDueDaysInMonth();
    this.taskForm.markAllAsTouched();
    this.yearsList = this.getYearsList();
  }

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

  onStepChange(event: { selectedIndex: number }) {
    switch (event.selectedIndex) {
      case 0:
        this.onEditFirstPartTask();
        break;
      case 1:
        this.onEditFirstPartTask();
        break;
    }
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
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      priority: formValues.priority.trim(),
      startDate: startDate,
      dueDate: dueDate,
      projectId: this.data.projectId,
    };
  }

  onTeamMemberSelected(teamMemberIds: number[]): void {
    this.selectedTeamMemberIds = teamMemberIds;
  }

  onSubmit() {
    this.setLoadingState('updateTask', true);

    this.taskService.updateTask(this.data.task.id!, this.taskDto!).subscribe({
      next: (task) => {
        this.setLoadingState('updateTask', false);
        this.setErrorState('updateTask', null);

        if (this.selectedTeamMemberIds.length !== 0) {
          this.setLoadingState('reassignTask', true);

          this.taskService
            .reassignTaskToUser(task.id!, this.selectedTeamMemberIds.at(0)!)
            .subscribe({
              next: () => {
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
              error: (error) => {
                this.setLoadingState('reassignTask', false);
                this.setErrorState('reassignTask', error.message);
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
      error: (error) => {
        this.setLoadingState('updateTask', false);
        this.setErrorState('updateTask', error.message);
      },
    });
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

  onInput(controlName: string) {
    const control = this.taskForm.get(controlName);
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
    const control = this.taskForm.get(controlName);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
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
