import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../../service/user.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { Page } from '../../dto/page.dto';

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
  selector: 'app-team-members-table',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './team-members-table.component.html',
  styleUrl: './team-members-table.component.css',
})
export class TeamMembersTableComponent implements OnInit {
  @Input() teamId?: number;
  @Input() readOnly?: boolean;
  @Output() teamMemberSelectedId = new EventEmitter<number>();

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
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedRow: TeamMember | null = null;
  selectedTeamMemberId: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getTeamMembers();
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

  getTeamMembers(): void {
    this.setLoadingState('teamMembers', true);

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.userService
      .getUsersByTeamId(
        this.teamId!,
        this.currentPage,
        this.pageSize,
        this.searchQuery.trim()
      )
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;

          const selectedRow = this.dataSource.data.find(
            (tm) => tm.id === this.selectedTeamMemberId
          );
          if (selectedRow) {
            this.selectedRow = selectedRow;
          } else {
            this.selectedRow = null;
          }

          this.setLoadingState('teamMembers', false);
          this.setErrorState('teamMembers', null);
        },
        error: () => {
          this.setLoadingState('teamMembers', false);
          this.setErrorState('teamMembers', 'No team members found.');
          this.dataSource.data = [];
        },
      });
  }

  onRowClicked(row: TeamMember): void {
    this.selectedRow = row;
    this.selectedTeamMemberId = row.id;
    this.teamMemberSelectedId.emit(this.selectedTeamMemberId);
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.getTeamMembers();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getTeamMembers();
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
