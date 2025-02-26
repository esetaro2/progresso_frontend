import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../service/project.service';
import { ProjectDto } from '../../dto/project.dto';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { TeamMembersTableComponent } from '../team-members-table/team-members-table.component';
import { EditProjectStepperDialogComponent } from '../edit-project-stepper-dialog/edit-project-stepper-dialog.component';
import { AuthService } from '../../service/auth.service';
import { CommentDto } from '../../dto/comment.dto';
import { CommentService } from '../../service/comment.service';
import { CommentComponent } from '../comment/comment.component';
import { PageEvent } from '@angular/material/paginator';
import { ToastService } from '../../service/toast.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-page',
  imports: [
    LoadingSpinnerComponent,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxChartsModule,
    TaskTableComponent,
    TeamMembersTableComponent,
    CommentComponent,
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
    completeProject: false,
    deleteProject: false,
  };

  errorStates = {
    project: null as string | null,
    percentage: null as string | null,
    manager: null as string | null,
    team: null as string | null,
    teamMembers: null as string | null,
    completeProject: null as string | null,
    deleteProject: null as string | null,
  };

  loadingStatesComments = {
    loadComments: false,
    createComment: false,
  };

  errorStatesComments = {
    loadComments: null as string | null,
    createComment: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  get isLoadingComments(): boolean {
    return Object.values(this.loadingStatesComments).some((state) => state);
  }

  userId: number | null = null;
  userFirstName: string | null = null;
  userLastName: string | null = null;
  userUsername: string | null = null;

  projectIdParam: string | null = null;
  projectId = 0;
  project?: ProjectDto;
  chartData: { name: string; value: number }[] = [];
  completedPercentage = 0;

  projectManager?: UserResponseDto;
  team?: TeamDto;
  teamMembers: UserResponseDto[] = [];
  teamMembersNames: string[] = [];

  currentPageTeamMembers = 0;
  totalPagesTeamMembers = 0;
  totalElementsTeamMembers = 0;

  commentForm: FormGroup;
  comments: CommentDto[] = [];

  currentPageComment = 0;
  pageSizeComment = 10;
  totalPagesComment = 0;
  totalElementsComment = 0;

  scrollToFirstComment = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private userService: UserService,
    private teamService: TeamService,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private commentService: CommentService,
    private toastService: ToastService
  ) {
    this.commentForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(500),
          Validators.pattern(/\S/),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userFirstName = this.authService.getUserFirstName();
    this.userLastName = this.authService.getUserLastName();
    this.userUsername = this.authService.getUserUsername();

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

  setLoadingStateComments(
    key: keyof typeof this.loadingStatesComments,
    state: boolean
  ) {
    this.loadingStatesComments[key] = state;
  }

  setErrorStateComments(
    key: keyof typeof this.errorStatesComments,
    error: string | null
  ) {
    this.errorStatesComments[key] = error;
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

        this.loadComments();

        this.setLoadingState('project', false);
        this.setErrorState('project', null);
      },
      error: (error) => {
        this.setLoadingState('project', false);
        this.setErrorState('project', error.message);
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
        error: (error) => {
          this.setLoadingState('percentage', false);
          this.setErrorState('percentage', error.message);
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
      error: (error) => {
        this.setLoadingState('manager', false);
        this.setErrorState('manager', error.message);
      },
    });
  }

  getTeamInfo(): void {
    this.setLoadingState('team', true);

    this.teamService.getTeamById(this.project!.teamId!).subscribe({
      next: (teamDto: TeamDto) => {
        this.team = teamDto;
        this.findUsersByTeamID(
          this.currentPageTeamMembers,
          this.totalElementsTeamMembers
        );
        this.setLoadingState('team', false);
        this.setErrorState('team', null);
      },
      error: (error) => {
        this.setLoadingState('team', false);
        this.setErrorState('team', error.message);
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
        this.totalElementsTeamMembers = pageData.page.totalElements;
        this.totalPagesTeamMembers = pageData.page.totalPages;
        this.setLoadingState('teamMembers', false);
        this.setErrorState('teamMembers', null);
      },
      error: (error) => {
        this.setLoadingState('teamMembers', false);
        this.setErrorState('teamMembers', error.message);
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
      this.getProjectPercentage();
      this.taskTableComponent.loadTasks();
    });
  }

  onEditProject(): void {
    const dialogRef = this.dialog.open(EditProjectStepperDialogComponent, {
      width: '100%',
      maxWidth: '750px',
      data: {
        project: this.project,
        team: this.team,
      },
    });

    dialogRef.componentInstance.projectUpdated.subscribe(() => {
      dialogRef.close();
      this.getProjectInfo();
      this.taskTableComponent.loadTasks();
    });
  }

  onCompleteProject(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Complete Project',
      message: 'Are you sure you want to complete this project?',
      confirmText: 'Complete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('completeProject', true);

        this.projectService.completeProject(this.projectId).subscribe({
          next: () => {
            this.setLoadingState('completeProject', false);
            this.setErrorState('completeProject', null);

            this.toastService.show('Project completed successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.getProjectInfo();
            this.taskTableComponent.loadTasks();
          },
          error: (error) => {
            this.setLoadingState('completeProject', false);
            this.setErrorState('completeProject', error.message);
          },
        });
      }
    });
  }

  onDeleteProject(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('deleteProject', true);

        this.projectService.removeProject(this.projectId).subscribe({
          next: () => {
            this.setLoadingState('deleteProject', false);
            this.setErrorState('deleteProject', null);

            this.toastService.show('Project deleted successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.getProjectInfo();
            this.taskTableComponent.loadTasks();
          },
          error: (error) => {
            this.setLoadingState('deleteProject', false);
            this.setErrorState('deleteProject', error.message);
          },
        });
      }
    });
  }

  loadComments(): void {
    this.setLoadingStateComments('loadComments', true);

    this.commentService
      .findByProjectId(
        this.projectId,
        this.currentPageComment,
        this.pageSizeComment,
        'creationDate,DESC'
      )
      .subscribe({
        next: (pageData) => {
          this.comments = pageData.content;
          console.log('Comments', this.comments);
          this.totalElementsComment = pageData.page.totalElements;
          this.totalPagesComment = pageData.page.totalPages;

          this.setLoadingStateComments('loadComments', false);
          this.setErrorStateComments('loadComments', null);

          if (this.scrollToFirstComment) {
            setTimeout(() => {
              const firstCommentElement =
                document.querySelector('.comment-section');
              if (firstCommentElement) {
                firstCommentElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }
              this.scrollToFirstComment = false;
            }, 0);
          }
        },
        error: (error) => {
          this.setLoadingStateComments('loadComments', false);
          this.setErrorStateComments('loadComments', error.message);
        },
      });
  }

  onCreateComment() {
    if (this.commentForm.invalid) {
      return;
    }

    this.setLoadingStateComments('createComment', true);

    const newComment: CommentDto = {
      content: this.commentForm.get('content')?.value.trim(),
      userId: this.userId!,
      projectId: this.projectId,
    };

    this.commentService.createComment(newComment).subscribe({
      next: () => {
        this.commentForm.reset();

        this.currentPageComment = 0;
        this.scrollToFirstComment = true;

        this.loadComments();

        this.setLoadingStateComments('createComment', false);
        this.setErrorStateComments('createComment', null);
      },
      error: (error) => {
        this.setLoadingStateComments('createComment', false);
        this.setErrorStateComments('createComment', error.message);
      },
    });
  }

  onReplyComment(scrollToFirstCommentReply: boolean): void {
    this.scrollToFirstComment = scrollToFirstCommentReply;
    this.currentPageComment = 0;
    this.loadComments();
  }

  onEditComment(): void {
    this.loadComments();
  }

  onDeleteComment(): void {
    this.loadComments();
  }

  onPageChange(event: PageEvent): void {
    this.currentPageComment = event.pageIndex;
    this.pageSizeComment = event.pageSize;
    this.loadComments();
  }

  onInput(controlName: string) {
    const control = this.commentForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
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
