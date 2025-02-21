import { Component, OnInit } from '@angular/core';
import { ProjectDto } from '../../dto/project.dto';
import { ProjectService } from '../../service/project.service';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '../../dto/page.dto';
import { FilterSectionComponent } from '../filter-section/filter-section.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateProjectStepperDialogComponent } from '../create-project-stepper-dialog/create-project-stepper-dialog.component';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-project-dashboard',
  imports: [
    CommonModule,
    ProjectCardComponent,
    MaterialModule,
    FormsModule,
    NgbModule,
    FilterSectionComponent,
    PaginationComponent,
  ],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css'],
})
export class ProjectDashboardComponent implements OnInit {
  loadingStates = {
    projects: false,
  };

  errorStates = {
    projects: null as string | null,
  };

  setLoadingState(key: keyof typeof this.loadingStates, state: boolean): void {
    this.loadingStates[key] = state;
  }

  setErrorState(
    key: keyof typeof this.errorStates,
    error: string | null
  ): void {
    this.errorStates[key] = error;
  }

  username: string | null = null;
  role: string | null = null;

  projects: ProjectDto[] = [];

  isSearchQueryPresent = false;
  searchQuery?: string;

  selectedStatus?: string;
  statuses: string[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  statusLabels: Record<string, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  selectedPriority?: string;
  priorities: string[] = ['LOW', 'MEDIUM', 'HIGH'];
  priorityLabels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };

  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUserUsername();
    this.role = this.authService.getUserRole();
    this.applyFilters();
  }

  loadAllProjectsWithFilters(): void {
    this.setLoadingState('projects', true);

    this.projectService
      .getAllProjectsWithFilters(
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery?.trim()
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.setLoadingState('projects', false);
          this.setErrorState('projects', null);
        },
        error: (error) => {
          this.setLoadingState('projects', false);
          this.setErrorState('projects', error.message);
          this.projects = [];
        },
      });
  }

  loadManagerProjectsWithFilters(): void {
    this.setLoadingState('projects', true);

    this.projectService
      .getProjectsByManagerAndFilters(
        this.username!,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery?.trim()
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.setLoadingState('projects', false);
          this.setErrorState('projects', null);
        },
        error: (error) => {
          this.setLoadingState('projects', false);
          this.setErrorState('projects', error.message);
          this.projects = [];
        },
      });
  }

  loadTeamMemberProjectsWithFilters(): void {
    this.setLoadingState('projects', true);

    this.projectService
      .getProjectsByTeamMemberAndFilters(
        this.username!,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery?.trim()
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.setLoadingState('projects', false);
          this.setErrorState('projects', null);
        },
        error: (error) => {
          this.setLoadingState('projects', false);
          this.setErrorState('projects', error.message);
          this.projects = [];
        },
      });
  }

  applyFilters(): void {
    if (this.role === 'ADMIN') {
      this.loadAllProjectsWithFilters();
    } else if (this.role === 'PROJECTMANAGER') {
      this.loadManagerProjectsWithFilters();
    } else if (this.role === 'TEAMMEMBER') {
      this.loadTeamMemberProjectsWithFilters();
    }
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.applyFilters();
  }

  resetStatus(): void {
    this.selectedStatus = '';
    this.currentPage = 0;
    this.applyFilters();
  }

  selectPriority(priority: string): void {
    this.selectedPriority = priority;
    this.currentPage = 0;
    this.applyFilters();
  }

  resetPriority(): void {
    this.selectedPriority = '';
    this.currentPage = 0;
    this.applyFilters();
  }

  searchByQuery(query: string): void {
    this.searchQuery = query;
    this.currentPage = 0;
    this.applyFilters();
  }

  resetAllFilters() {
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.searchQuery = '';
    this.currentPage = 0;
    this.applyFilters();
  }

  createProject(): void {
    const dialogRef = this.dialog.open(CreateProjectStepperDialogComponent, {
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.componentInstance.projectCreated.subscribe(() => {
      this.currentPage = 0;
      this.applyFilters();
    });
  }

  goToPage(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.applyFilters();
  }
}
