import {
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { TeamService } from '../../service/team.service';
import { TeamDto } from '../../dto/team.dto';
import { Page } from '../../dto/page.dto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MaterialModule } from '../../material.module';

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-available-team-table',
  imports: [MaterialModule, CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './available-team-table.component.html',
  styleUrls: ['./available-team-table.component.css'],
})
export class AvailableTeamTableComponent implements OnInit {
  loading = false;

  @Output() teamSelected = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'name'];
  dataSource = new MatTableDataSource<TeamDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedRow: TeamDto | null = null;
  selectedTeamId: number | null = null;

  errorMessage = '';
  isSearchQueryPresent = false;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.getAvailableTeams();
  }

  getAvailableTeams(): void {
    this.loading = true;

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.teamService
      .getAvailableTeams(this.currentPage, this.pageSize, this.searchQuery)
      .subscribe({
        next: (pageData: Page<TeamDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.loading = false;

          const selectedRow = this.dataSource.data.find(
            (team) => team.id === this.selectedTeamId
          );
          if (selectedRow) {
            this.selectedRow = selectedRow;
          } else {
            this.selectedRow = null;
          }
        },
        error: (error) => {
          console.error('Error fetching available teams', error);
          this.loading = false;
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
          this.dataSource.data = [];
        },
      });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.getAvailableTeams();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAvailableTeams();
  }

  onRowClicked(row: TeamDto): void {
    this.selectedRow = row;
    this.selectedTeamId = row.id !== undefined ? row.id : null;
    console.log('Team selezionato:', this.selectedRow);
    this.teamSelected.emit(this.selectedTeamId!);
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
        default:
          return 0;
      }
    });
  }
}
