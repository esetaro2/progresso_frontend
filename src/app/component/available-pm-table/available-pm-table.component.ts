import {
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { UserService } from '../../service/user.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { Page } from '../../dto/page.dto';
import { MaterialModule } from '../../material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProjectManager {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-available-pm-table',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './available-pm-table.component.html',
  styleUrl: './available-pm-table.component.css',
})
export class AvailablePmTableComponent implements OnInit {
  loadingStates = {
    availableProjectManagers: false,
  };

  errorStates = {
    availableProjectManagers: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  @Output() pmSelected = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'username'];
  dataSource = new MatTableDataSource<ProjectManager>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  currentPage = 0;
  pageSize = 4;
  totalElements = 0;
  totalPages = 0;

  selectedRow: ProjectManager | null = null;
  selectedPmId: number | null = null;

  errorMessage = '';

  isSearchQueryPresent = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getAvailablePms();
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

  getAvailablePms(): void {
    this.setLoadingState('availableProjectManagers', true);

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.userService
      .getAvailablePms(this.currentPage, this.pageSize, this.searchQuery.trim())
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;

          const selectedRow = this.dataSource.data.find(
            (pm) => pm.id === this.selectedPmId
          );
          if (selectedRow) {
            this.selectedRow = selectedRow;
          } else {
            this.selectedRow = null;
          }

          this.setLoadingState('availableProjectManagers', false);
          this.setErrorState('availableProjectManagers', null);
        },
        error: (error) => {
          this.setLoadingState('availableProjectManagers', false);
          this.setErrorState('availableProjectManagers', error.message);
          this.dataSource.data = [];
        },
      });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.getAvailablePms();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAvailablePms();
  }

  onRowClicked(row: ProjectManager): void {
    this.selectedRow = row;
    this.selectedPmId = row.id;
    this.pmSelected.emit(this.selectedPmId);
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
        case 'firstName':
          return compare(a.firstName, b.firstName, isAsc);
        case 'lastName':
          return compare(a.lastName, b.lastName, isAsc);
        case 'username':
          return compare(a.username, b.username, isAsc);
        default:
          return 0;
      }
    });
  }
}
