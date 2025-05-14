import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { UserResponseDto } from '../../dto/user-response.dto';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../../service/user.service';
import { Page } from '../../dto/page.dto';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { EditUserAdminDialogComponent } from '../edit-user-admin-dialog/edit-user-admin-dialog.component';

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-users-table',
  imports: [
    MaterialModule,
    NgbModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css',
})
export class UsersTableComponent implements OnInit {
  @Output() reloadProjectsTable = new EventEmitter<void>();

  loadingStates = {
    loadUsers: false,
    activateUser: false,
    deactivateUser: false,
  };

  errorStates = {
    loadUsers: null as string | null,
    activateUser: null as string | null,
    deactivateUser: null as string | null,
    editUser: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'username',
    'role',
    'active',
    'actions',
  ];
  dataSource = new MatTableDataSource<UserResponseDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchQuery = '';
  isSearchQueryPresent = false;
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedRole?: string;
  roles: string[] = ['ADMIN', 'PROJECTMANAGER', 'TEAMMEMBER'];
  rolesLabels: Record<string, string> = {
    ADMIN: 'Admin',
    PROJECTMANAGER: 'Project Manager',
    TEAMMEMBER: 'Team Member',
  };

  selectedActive: boolean | null = null;
  actives: boolean[] = [true, false];
  activeLabels: Record<string, string> = {
    true: 'Active',
    false: 'Inactive',
  };

  selectedUserId: number | null = null;

  constructor(
    private toastService: ToastService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
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

  getAllUsers(): void {
    this.setLoadingState('loadUsers', true);

    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.userService
      .getAllUsers(
        this.currentPage,
        this.pageSize,
        this.searchQuery.trim(),
        this.selectedRole?.trim(),
        this.selectedActive!
      )
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.setLoadingState('loadUsers', false);
          this.setErrorState('loadUsers', null);
        },
        error: (error) => {
          this.setLoadingState('loadUsers', false);
          this.setErrorState('loadUsers', error.message);
          this.dataSource.data = [];
        },
      });
  }

  openEditDialog(row: UserResponseDto): void {
    this.userService.getUserDetailsAdmin(row.id).subscribe({
      next: (fullUser) => {
        this.setErrorState('editUser', null);

        const dialogRef = this.dialog.open(EditUserAdminDialogComponent, {
          width: '100%',
          maxWidth: '900px',
          data: {
            currentUserId: row.id,
            user: fullUser,
          },
        });

        dialogRef.componentInstance.userUpdated.subscribe(() => {
          dialogRef.close();
          this.currentPage = 0;
          this.resetAllFilters();
          this.getAllUsers();

          this.reloadProjectsTable.emit();
        });
      },
      error: (error) => {
        this.setErrorState('editUser', error.message);
        this.toastService.show(this.errorStates.editUser!, {
          classname: 'bg-danger text-light',
          delay: 5000,
        });
      },
    });
  }

  openActivateDialog(row: UserResponseDto): void {
    const dialogData: ConfirmDialogData = {
      title: 'Activate User',
      message: 'Are you sure you want to activate this user?',
      confirmText: 'Activate',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    this.selectedUserId = row.id;

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('activateUser', true);

        this.authService.activateUser(this.selectedUserId!).subscribe({
          next: () => {
            this.currentPage = 0;
            this.resetAllFilters();
            this.getAllUsers();

            this.toastService.show('User activated successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.setLoadingState('activateUser', false);
            this.setErrorState('activateUser', null);
          },
          error: (error) => {
            this.setLoadingState('activateUser', false);
            this.setErrorState('activateUser', error.message);
            this.toastService.show(this.errorStates.activateUser!, {
              classname: 'bg-danger text-light',
              delay: 5000,
            });
          },
        });
      }
    });
  }

  openDeactivateDialog(row: UserResponseDto): void {
    const dialogData: ConfirmDialogData = {
      title: 'Deactivate User',
      message: 'Are you sure you want to deactivate this user?',
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    this.selectedUserId = row.id;

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('deactivateUser', true);

        this.authService.deactivateUser(this.selectedUserId!).subscribe({
          next: () => {
            this.currentPage = 0;
            this.resetAllFilters();
            this.getAllUsers();

            this.toastService.show('User deactivated successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.setLoadingState('deactivateUser', false);
            this.setErrorState('deactivateUser', null);
          },
          error: (error) => {
            this.setLoadingState('deactivateUser', false);
            this.setErrorState(
              'deactivateUser',
              error.message.replace(/\n/g, '<br>')
            );
            this.toastService.show(this.errorStates.deactivateUser!, {
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
    this.getAllUsers();
  }

  resetSearchQuery(): void {
    this.isSearchQueryPresent = false;
    this.searchQuery = '';
    this.applyFilter();
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.applyFilter();
  }

  resetRole(): void {
    this.selectedRole = '';
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
    this.selectedRole = '';
    this.selectedActive = null;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllUsers();
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

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'PROJECTMANAGER':
        return 'Project Manager';
      case 'TEAMMEMBER':
        return 'Team Member';
      default:
        return role;
    }
  }

  getButtonTooltip(action: 'edit' | 'deactivate' | 'activate'): string | null {
    if (action === 'edit') {
      return 'Edit user';
    } else if (action === 'deactivate') {
      return 'Deactivate user';
    } else if (action === 'activate') {
      return 'Activate user';
    } else return null;
  }
}
