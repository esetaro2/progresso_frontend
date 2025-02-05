import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TeamDto } from '../../dto/team.dto';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { TeamService } from '../../service/team.service';
import { UserService } from '../../service/user.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { Page } from '../../dto/page.dto';
import { MatDialogRef } from '@angular/material/dialog';

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

@Component({
  selector: 'app-create-team-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './create-team-dialog.component.html',
  styleUrl: './create-team-dialog.component.css',
})
export class CreateTeamDialogComponent implements OnInit {
  loading = false;
  errorMessage = '';

  teamForm: FormGroup;

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

  selectedTeamMemberIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private dialogRef: MatDialogRef<CreateTeamDialogComponent>
  ) {
    this.teamForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.getAvailableTms();
  }

  getAvailableTms(): void {
    this.loading = true;
    if (this.searchQuery !== '') {
      this.isSearchQueryPresent = true;
    }

    this.userService
      .getAvailableTms(this.currentPage, this.pageSize, this.searchQuery)
      .subscribe({
        next: (pageData: Page<UserResponseDto>) => {
          this.dataSource.data = pageData.content;
          console.log('Available Tms', this.dataSource.data);
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;
          this.dataSource.sort = this.sort;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching available Team Members', error);
          this.loading = false;
          this.errorMessage = error.message;
          this.errorMessage = this.errorMessage.replace(/^"|"$/g, '');
          this.dataSource.data = [];
        },
      });
  }

  createTeam(): void {
    const teamName = this.teamForm.get('name')?.value;
    const selectedUserIds = this.selectedTeamMemberIds;

    this.teamService.createTeam(teamName).subscribe({
      next: (team: TeamDto) => {
        this.teamService.addMembersToTeam(team.id!, selectedUserIds).subscribe({
          next: (updatedTeam: TeamDto) => {
            console.log('Team creato con membri', updatedTeam);
            this.dialogRef.close(updatedTeam);
          },
          error: (error) => {
            console.error(
              "Errore durante l' aggiunta dei membri al team",
              error
            );
          },
        });
      },
      error: (error) => {
        console.error('Errore durante la creazione del team', error);
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
    console.log('Team Members selezionati: ', this.selectedTeamMemberIds);
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

  onInput(controlName: string) {
    const control = this.teamForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }
}
