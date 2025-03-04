import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { MatTableDataSource } from '@angular/material/table';
import { TeamDto } from '../../dto/team.dto';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { TeamService } from '../../service/team.service';
import { Page } from '../../dto/page.dto';
import { TeamInfoDialogComponent } from '../team-info-dialog/team-info-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { EditTeamStepperDialogComponent } from '../edit-team-stepper-dialog/edit-team-stepper-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../service/toast.service';

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-teams-table',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './teams-table.component.html',
  styleUrl: './teams-table.component.css',
})
export class TeamsTableComponent implements OnInit {
  @Output() reloadProjectsTable = new EventEmitter<void>();

  loadingStates = {
    loadTeams: false,
    deactivateTeam: false,
  };

  errorStates = {
    loadTeams: null as string | null,
    deactivateTeam: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  displayedColumns: string[] = ['id', 'name', 'active', 'actions'];
  dataSource = new MatTableDataSource<TeamDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedActive: boolean | null = null;
  actives: boolean[] = [true, false];
  activeLabels: Record<string, string> = {
    true: 'Active',
    false: 'Inactive',
  };

  selectedRow: TeamDto | null = null;
  selectedTeamId: number | null = null;

  errorMessage = '';
  isSearchQueryPresent = false;

  constructor(
    private toastService: ToastService,
    private teamService: TeamService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTeams();
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

  loadTeams(): void {
    this.setLoadingState('loadTeams', true);

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.teamService
      .getAllTeams(
        this.currentPage,
        this.pageSize,
        this.selectedActive!,
        this.searchQuery.trim()
      )
      .subscribe({
        next: (pageData: Page<TeamDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;

          this.setLoadingState('loadTeams', false);
          this.setErrorState('loadTeams', null);
        },
        error: (error) => {
          this.setLoadingState('loadTeams', false);
          this.setErrorState('loadTeams', error.message);
          this.dataSource.data = [];
        },
      });
  }

  onViewTeam(team: TeamDto): void {
    this.dialog.open(TeamInfoDialogComponent, {
      width: '100%',
      maxWidth: '750px',
      data: {
        team: team,
      },
    });
  }

  openEditTeamDialog(team: TeamDto): void {
    const dialogRef = this.dialog.open(EditTeamStepperDialogComponent, {
      data: {
        team: team,
      },
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.componentInstance.teamUpdated.subscribe(() => {
      this.resetAllFilters();
      this.applyFilter();

      this.reloadProjectsTable.emit();
    });
  }

  openDeactivateDialog(row: TeamDto): void {
    const dialogData: ConfirmDialogData = {
      title: 'Deactivate team',
      message: 'Are you sure you want to deactivate this team?',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('deactivateTeam', true);

        this.teamService.deleteTeam(row.id!).subscribe({
          next: () => {
            this.resetAllFilters();
            this.applyFilter();

            this.toastService.show('Team deactivated successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.setLoadingState('deactivateTeam', false);
            this.setErrorState('deactivateTeam', null);
          },
          error: (error) => {
            this.setLoadingState('deactivateTeam', false);
            this.setErrorState(
              'deactivateTeam',
              error.message.replace(/\n/g, '<br>')
            );
            this.toastService.show(this.errorStates.deactivateTeam!, {
              classname: 'bg-danger text-light',
              delay: 5000,
            });
          },
        });
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadTeams();
  }

  resetSearchQuery(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  selectActive(active: boolean): void {
    this.selectedActive = active;
    this.applyFilter();
  }

  resetActive(): void {
    this.selectedActive = null;
    this.applyFilter();
  }

  resetAllFilters(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.selectedActive = null;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTeams();
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

  getButtonTooltip(action: 'view' | 'edit' | 'deactivate'): string | null {
    if (action === 'edit') {
      return 'Edit team';
    } else if (action === 'view') {
      return 'Show team members';
    } else if (action === 'deactivate') {
      return 'Deactivate team';
    } else return null;
  }
}
