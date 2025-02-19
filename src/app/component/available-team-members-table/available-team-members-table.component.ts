import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../../service/user.service';
import { Page } from '../../dto/page.dto';
import { UserResponseDto } from '../../dto/user-response.dto';

interface TeamMember {
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
  selector: 'app-available-team-members-table',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
  ],
  templateUrl: './available-team-members-table.component.html',
  styleUrl: './available-team-members-table.component.css',
})
export class AvailableTeamMembersTableComponent implements OnInit {
  @Output() selectedTeamMembers = new EventEmitter<number[]>();

  loadingStates = {
    teamMembers: false,
  };

  errorStates = {
    teamMembers: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'username'];
  dataSource = new MatTableDataSource<TeamMember>();
  selection = new SelectionModel<TeamMember>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  isSearchQueryPresent = false;
  currentPage = 0;
  pageSize = 4;
  totalElements = 0;
  totalPages = 0;

  selectedTeamMemberIds: number[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getAvailableTms();
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

  getAvailableTms(): void {
    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.setLoadingState('teamMembers', true);

    this.userService
      .getAvailableTms(this.currentPage, this.pageSize, this.searchQuery.trim())
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          console.log('Available Tms', this.dataSource.data);
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.setLoadingState('teamMembers', false);
          this.setErrorState('teamMembers', null);
        },
        error: () => {
          this.setLoadingState('teamMembers', false);
          this.setErrorState('teamMembers', 'No available team members found!');
          this.dataSource.data = [];
        },
      });
  }

  onRowClicked(row: TeamMember): void {
    if (this.selectedTeamMemberIds.includes(row.id)) {
      this.selection.deselect(row);
      this.selectedTeamMemberIds = this.selectedTeamMemberIds.filter(
        (id) => id !== row.id
      );
    } else {
      this.selection.select(row);
      this.selectedTeamMemberIds.push(row.id);
    }
    this.selectedTeamMembers.emit(this.selectedTeamMemberIds);
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.getAvailableTms();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAvailableTms();
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
