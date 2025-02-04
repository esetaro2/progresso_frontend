import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvailableTeamTableComponent } from '../available-team-table/available-team-table.component';
import { CreateTeamDialogComponent } from '../create-team-dialog/create-team-dialog.component';

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
export class CreateProjectStepperDialogComponent implements OnInit {
  @Output() projectCreated = new EventEmitter<void>();

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

  selectedPmId: number | null = null;

  existingTeam = false;
  selectedTeamId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateProjectStepperDialogComponent>,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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

    this.yearsList = this.getYearsList();
  }

  ngOnInit(): void {
    this.updateStartDateDays();
    this.updateDueDateDays();
  }

  todayDateBeforeStartValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    if (startMonth && startDay && startYear) {
      const startDate = new Date(`${startMonth} ${startDay}, ${startYear}`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return { startBeforeToday: true };
      }
    }

    return null;
  }

  startBeforeDueValidator(control: AbstractControl): ValidationErrors | null {
    const startMonth = control.get('startMonth')?.value;
    const startDay = control.get('startDay')?.value;
    const startYear = control.get('startYear')?.value;

    const dueMonth = control.get('dueMonth')?.value;
    const dueDay = control.get('dueDay')?.value;
    const dueYear = control.get('dueYear')?.value;

    if (startMonth && startDay && startYear && dueMonth && dueDay && dueYear) {
      const startDate = new Date(`${startMonth} ${startDay}, ${startYear}`);
      const dueDate = new Date(`${dueMonth} ${dueDay}, ${dueYear}`);
      if (dueDate < startDate) {
        return { dueBeforeStart: true };
      }
    }

    return null;
  }

  onCreateFirstPartProject(): void {
    const formValues = this.projectForm.value;

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

    this.projectDto = {
      name: formValues.name,
      description: formValues.description,
      startDate: startDate,
      dueDate: dueDate,
      projectManagerId: 0,
    };

    console.log('Dati Iniziali Del Progetto Con Manager 0', this.projectDto);
  }

  onPmSelected(pmId: number) {
    this.selectedPmId = pmId;
    console.log('PM SELEZIONATO DAL FIGLIO', this.selectedPmId);

    this.projectDto.projectManagerId = this.selectedPmId;
    console.log('Progetto con pm settato', this.projectDto);
  }

  onTeamSelected(teamId: number): void {
    this.selectedTeamId = teamId;
    console.log('ID del team selezionato:', this.selectedTeamId);
  }

  openCreateTeamDialog(): void {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Team creato: ', result);
        this.selectedTeamId = result.id;
        console.log('SELECTED TEAM ID PASSATO DAL DIALOG', this.selectedTeamId);
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    this.projectService.createProject(this.projectDto).subscribe({
      next: (project) => {
        console.log('Progetto creato con PM', project);

        if (this.selectedTeamId) {
          this.projectService
            .assignTeamToProject(project.id!, this.selectedTeamId!)
            .subscribe({
              next: (updatedProject) => {
                console.log('Project con PM e Team', updatedProject);
              },
              error: (error) => {
                console.error('Error assigning team', error);
              },
            });
        }
      },
      error: (error) => {
        console.error('Error creating project', error);
      },
    });

    this.projectCreated.emit();
    this.dialogRef.close();
    this.snackBar.open('Project created successfully!', 'Close', {
      duration: 5000,
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
