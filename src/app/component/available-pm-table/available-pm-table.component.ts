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
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

interface ProjectManager {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

@Component({
  selector: 'app-available-pm-table',
  imports: [MaterialModule, CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './available-pm-table.component.html',
  styleUrl: './available-pm-table.component.css',
})
export class AvailablePmTableComponent implements OnInit {
  loading = false;

  @Output() pmSelected = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'username'];
  dataSource = new MatTableDataSource<ProjectManager>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  currentPage = 0;
  pageSize = 6;
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

  getAvailablePms(): void {
    this.loading = true;

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.userService
      .getAvailablePms(this.currentPage, this.pageSize, this.searchQuery)
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          console.log('Available PMs', this.dataSource.data);
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching available Project Managers', error);
          this.loading = false;
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
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
    console.log('PM selezionato:', this.selectedRow);
    this.pmSelected.emit(this.selectedPmId);
  }
}
