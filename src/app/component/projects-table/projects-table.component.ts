import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProjectDto } from '../../dto/project.dto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ProjectService } from '../../service/project.service';
import { Page } from '../../dto/page.dto';
import { Router } from '@angular/router';

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-projects-table',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './projects-table.component.html',
  styleUrl: './projects-table.component.css',
})
export class ProjectsTableComponent implements OnInit {
  loadingStates = {
    laodProjects: false,
  };

  errorStates = {
    laodProjects: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  displayedColumns: string[] = [
    'id',
    'name',
    'description',
    'startDate',
    'dueDate',
    'completionDate',
    'completionPercentage',
    'projectManager',
    'team',
    'status',
    'priority',
    'actions',
  ];
  dataSource = new MatTableDataSource<ProjectDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  isSearchQueryPresent = false;
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedPriority?: string;
  priorities: string[] = ['HIGH', 'MEDIUM', 'LOW'];
  priorityLabels: Record<string, string> = {
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  selectedStatus?: string;
  statuses: string[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  statusesLabels: Record<string, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  constructor(private projectService: ProjectService, private router: Router) {}

  ngOnInit(): void {
    this.getAllProjects();
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

  getAllProjects(): void {
    this.setLoadingState('laodProjects', true);

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.projectService
      .getAllProjectsWithFilters(
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority,
        this.searchQuery.trim()
      )
      .subscribe({
        next: (pageData: Page<ProjectDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.setLoadingState('laodProjects', false);
          this.setErrorState('laodProjects', null);
        },
        error: (error) => {
          this.setLoadingState('laodProjects', false);
          this.setErrorState('laodProjects', error.message);
          this.dataSource.data = [];
        },
      });
  }

  goToProjectDetails(project: ProjectDto): void {
    this.router.navigate(['project', project.id, project.name]);
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.getAllProjects();
  }

  resetSearchQuery(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  resetStatus(): void {
    this.selectedStatus = '';
    this.applyFilter();
  }

  selectPriority(priority: string): void {
    this.selectedPriority = priority;
    this.applyFilter();
  }

  resetPriority(): void {
    this.selectedPriority = '';
    this.applyFilter();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllProjects();
  }

  sortData(sort: Sort): void {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'startDate':
          return compare(a.startDate, b.startDate, isAsc);
        case 'dueDate':
          return compare(a.dueDate, b.dueDate, isAsc);
        case 'completionDate':
          return compare(a.completionDate!, b.completionDate!, isAsc);
        case 'completionPercentage':
          return compare(
            a.completionPercentage!,
            b.completionPercentage!,
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  getButtonTooltip(action: 'view'): string | null {
    if (action === 'view') {
      return 'Go to project details';
    } else return null;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
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

  getStatusClass(status: string) {
    switch (status) {
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

  getPercentageClass(completionPercentage: number): string {
    if (completionPercentage <= 33) {
      return 'low-percentage';
    } else if (completionPercentage <= 66) {
      return 'medium-percentage';
    } else {
      return 'high-percentage';
    }
  }

  getTooltipText(status: string): string {
    const statusClass = this.getStatusClass(status);
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
