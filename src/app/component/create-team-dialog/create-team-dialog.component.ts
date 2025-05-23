import { Component } from '@angular/core';
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
import { TeamService } from '../../service/team.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AvailableTeamMembersTableComponent } from '../available-team-members-table/available-team-members-table.component';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-create-team-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    AvailableTeamMembersTableComponent,
  ],
  templateUrl: './create-team-dialog.component.html',
  styleUrl: './create-team-dialog.component.css',
})
export class CreateTeamDialogComponent {
  loadingStates = {
    createTeam: false,
    assignTeamMembers: false,
  };

  errorStates = {
    createTeam: null as string | null,
    assignTeamMembers: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  teamForm: FormGroup;

  selectedTeamMemberIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private dialogRef: MatDialogRef<CreateTeamDialogComponent>,
    private toastService: ToastService
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

  preventInitialSpace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      inputElement.value.length === 0
    ) {
      event.preventDefault();
    }
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

  onSelectedTeamMembers(selectedTeamMembersIdsEvent: number[]): void {
    this.selectedTeamMemberIds = selectedTeamMembersIdsEvent;
  }

  createTeam(): void {
    const teamName = this.teamForm.get('name')?.value.trim();
    const selectedUserIds = this.selectedTeamMemberIds;

    this.setLoadingState('createTeam', true);

    this.teamService.createTeam(teamName).subscribe({
      next: (team: TeamDto) => {
        this.setLoadingState('createTeam', false);
        this.setErrorState('createTeam', null);

        this.setLoadingState('assignTeamMembers', true);

        this.teamService.addMembersToTeam(team.id!, selectedUserIds).subscribe({
          next: (updatedTeam: TeamDto) => {
            this.setLoadingState('assignTeamMembers', false);
            this.setErrorState('assignTeamMembers', null);

            this.dialogRef.close(updatedTeam);
            this.toastService.show('Team created successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });
          },
          error: (error) => {
            this.setLoadingState('assignTeamMembers', false);
            this.setErrorState('assignTeamMembers', error.message);
          },
        });
      },
      error: (error) => {
        this.setLoadingState('createTeam', false);
        this.setErrorState('createTeam', error.message);
      },
    });
  }

  onInput(controlName: string) {
    const control = this.teamForm.get(controlName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }
}
