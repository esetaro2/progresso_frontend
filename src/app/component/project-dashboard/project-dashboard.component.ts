import { Component, OnInit } from '@angular/core';
import { ProjectDto } from '../../dto/project.dto';
import { ProjectService } from '../../service/project.service';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../project-card/project-card.component';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Page } from '../../dto/page.dto';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
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
    LoadingSpinnerComponent,
    FilterSectionComponent,
    PaginationComponent,
  ],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css'],
})
export class ProjectDashboardComponent implements OnInit {

  username: string | null = null;
  role: string | null = null;

  projects: ProjectDto[] = [];

  loading = false;

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

  errorMessage = '';

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
    this.loading = true;
    this.projectService
      .getAllProjectsWithFilters(
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          console.log('PageData ALL Filters', pageData);
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching all projects with filters', error);
          this.loading = false;
          this.projects = [];
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
        },
      });
  }

  loadManagerProjectsWithFilters(): void {
    this.loading = true;
    this.projectService
      .getProjectsByManagerAndFilters(
        this.username!,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          console.log('Pagedata PM Filters', pageData);
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error(
            'Error fetching projects by manager and filters',
            error
          );
          this.loading = false;
          this.projects = [];
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
        },
      });
  }

  loadTeamMemberProjectsWithFilters(): void {
    this.loading = true;
    this.projectService
      .getProjectsByTeamMemberAndFilters(
        this.username!,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          console.log('Pagedata TM Filters', pageData);
          this.projects = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error(
            'Error fetching projects by team member and filters',
            error
          );
          this.loading = false;
          this.projects = [];
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
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
