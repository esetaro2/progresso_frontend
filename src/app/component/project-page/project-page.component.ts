import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { ProjectDto } from '../../dto/project.dto';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../service/user.service';
import { TeamService } from '../../service/team.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { TeamDto } from '../../dto/team.dto';
import { Page } from '../../dto/page.dto';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TaskTableComponent } from '../task-table/task-table.component';
import { MatDialog } from '@angular/material/dialog';
import { AssignTeamDialogComponent } from '../assign-team-dialog/assign-team-dialog.component';
import { CreateTaskStepperDialogComponent } from '../create-task-stepper-dialog/create-task-stepper-dialog.component';

@Component({
  selector: 'app-project-page',
  imports: [
    LoadingSpinnerComponent,
    CommonModule,
    MaterialModule,
    FormsModule,
    NgbModule,
    NgxChartsModule,
    TaskTableComponent,
  ],
  templateUrl: './project-page.component.html',
  styleUrl: './project-page.component.css',
})
export class ProjectPageComponent implements OnInit {
  @ViewChild(TaskTableComponent) taskTableComponent!: TaskTableComponent;

  loadingStates = {
    project: false,
    percentage: false,
    manager: false,
    team: false,
    teamMembers: false,
  };

  errorStates = {
    project: null as string | null,
    percentage: null as string | null,
    manager: null as string | null,
    team: null as string | null,
    teamMembers: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  projectIdParam: string | null = null;
  projectId = 0;
  project?: ProjectDto;
  chartData: { name: string; value: number }[] = [];
  completedPercentage = 0;

  projectManager?: UserResponseDto;
  team?: TeamDto;
  teamMembers: UserResponseDto[] = [];
  teamMembersNames: string[] = [];

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.projectIdParam = this.route.snapshot.paramMap.get('id');

    this.projectId = Number.parseInt(this.projectIdParam || '0');

    if (this.projectId !== 0) {
      this.getProjectInfo();
    }
  }

  setLoadingState(key: keyof typeof this.loadingStates, state: boolean) {
    this.loadingStates[key] = state;
  }

  setErrorState(key: keyof typeof this.errorStates, error: string | null) {
    this.errorStates[key] = error;
  }

  getProjectInfo(): void {
    this.setLoadingState('project', true);

    this.projectService.getProjectById(this.projectId).subscribe({
      next: (projectDto: ProjectDto) => {
        this.project = projectDto;
        this.getProjectPercentage();

        if (this.project?.projectManagerId) {
          this.getProjectManagerById();
        }
        if (this.project?.teamId) {
          this.getTeamInfo();
        }
        this.setLoadingState('project', false);
        this.setErrorState('project', null);
      },
      error: (error) => {
        this.setLoadingState('project', false);
        this.setErrorState('project', error.message.replace(/^"|"$/g, ''));
        this.router.navigate(['']);
      },
    });
  }

  onUpdateProjectPercentage(): void {
    this.getProjectPercentage();
  }

  getProjectPercentage(): void {
    this.setLoadingState('percentage', true);

    this.projectService
      .getProjectCompletionPercentage(this.project!.id!)
      .subscribe({
        next: (percentage: number) => {
          this.chartData = [
            { name: 'Completed', value: percentage },
            { name: 'Remaining', value: 100 - percentage },
          ];
          this.completedPercentage =
            this.chartData
              .filter((name) => name.name === 'Completed')
              .map((result) => result.value)[0] || 0;
          this.setLoadingState('percentage', false);
          this.setErrorState('percentage', null);
        },
        error: () => {
          this.setLoadingState('percentage', false);
          this.setErrorState(
            'percentage',
            'Unable to retrieve the project completion percentage!'
          );
        },
      });
  }

  getProjectManagerById(): void {
    this.setLoadingState('manager', true);

    this.userService.getUserById(this.project!.projectManagerId).subscribe({
      next: (projectManagerDto: UserResponseDto) => {
        this.projectManager = projectManagerDto;
        this.setLoadingState('manager', false);
        this.setErrorState('manager', null);
      },
      error: () => {
        this.setLoadingState('manager', false);
        this.setErrorState(
          'manager',
          "Unable to retrieve the project manager's information!"
        );
      },
    });
  }

  getTeamInfo(): void {
    this.setLoadingState('team', true);

    this.teamService.getTeamById(this.project!.teamId!).subscribe({
      next: (teamDto: TeamDto) => {
        this.team = teamDto;
        this.findUsersByTeamID(this.currentPage, this.totalElements);
        this.setLoadingState('team', false);
        this.setErrorState('team', null);
      },
      error: () => {
        this.setLoadingState('team', false);
        this.setErrorState('team', "Unable to retrieve the project's team!");
      },
    });
  }

  findUsersByTeamID(page: number, size: number): void {
    this.setLoadingState('teamMembers', true);

    this.userService.getUsersByTeamId(this.team!.id!, page, size).subscribe({
      next: (pageData: Page<UserResponseDto>) => {
        this.teamMembers = pageData.content;
        this.teamMembersNames = this.teamMembers.map(
          (teammember) =>
            `${teammember.firstName} ${teammember.lastName} (${teammember.username})`
        );
        this.totalElements = pageData.page.totalElements;
        this.totalPages = pageData.page.totalPages;
        this.setLoadingState('teamMembers', false);
        this.setErrorState('teamMembers', null);
      },
      error: () => {
        this.setLoadingState('teamMembers', false);
        this.setErrorState(
          'teamMembers',
          "Unable to retrieve the team's members!"
        );
      },
    });
  }

  onAssignTeam() {
    const dialogRef = this.dialog.open(AssignTeamDialogComponent, {
      width: '100%',
      maxWidth: '750px',
      data: this.projectId,
    });

    dialogRef.componentInstance.teamAssigned.subscribe(() => {
      this.getProjectInfo();
    });
  }

  onAddTask() {
    const dialogRef = this.dialog.open(CreateTaskStepperDialogComponent, {
      width: '100%',
      maxWidth: '750px',
      data: {
        projectId: this.projectId,
        teamId: this.team?.id,
        startDate: this.project?.startDate,
        dueDate: this.project?.dueDate,
      },
    });

    dialogRef.componentInstance.taskCreated.subscribe(() => {
      dialogRef.close();
      this.taskTableComponent.loadTasks();
    });
  }

  getPriorityClass(): string {
    switch (this.project?.priority) {
      case 'LOW':
        return 'low-priority';
      case 'MEDIUM':
        return 'medium-priority';
      case 'HIGH':
        return 'high-priority';
      default:
        return 'default-priority';
    }
  }

  getStatusClass() {
    switch (this.project?.status) {
      case 'NOT_STARTED':
        return 'not-started-circle';
      case 'IN_PROGRESS':
        return 'in-progress-circle';
      case 'COMPLETED':
        return 'completed-circle';
      case 'CANCELLED':
        return 'cancelled-circle';
      default:
        return '';
    }
  }

  getTooltipText(): string {
    const statusClass = this.getStatusClass();
    switch (statusClass) {
      case 'in-progress-circle':
        return 'In Progress';
      case 'completed-circle':
        return 'Completed';
      case 'not-started-circle':
        return 'Not Started';
      case 'cancelled-circle':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  }
}
