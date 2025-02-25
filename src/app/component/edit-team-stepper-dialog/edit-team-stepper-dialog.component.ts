import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../../material.module';
import { AvailableTeamMembersTableComponent } from '../available-team-members-table/available-team-members-table.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeamDto } from '../../dto/team.dto';
import { TeamService } from '../../service/team.service';
import { ToastService } from '../../service/toast.service';
import { TeamMembersTableComponent } from '../team-members-table/team-members-table.component';

@Component({
  selector: 'app-edit-team-stepper-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    FormsModule,
    AvailableTeamMembersTableComponent,
    TeamMembersTableComponent,
  ],
  templateUrl: './edit-team-stepper-dialog.component.html',
  styleUrl: './edit-team-stepper-dialog.component.css',
})
export class EditTeamStepperDialogComponent {
  @Output() teamUpdated = new EventEmitter<void>();

  loadingStates = {
    updateTeam: false,
    addTeamMembers: false,
    removeTeamMembers: false,
  };

  errorStates = {
    updateTeam: null as string | null,
    addTeamMembers: null as string | null,
    removeTeamMembers: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  teamForm: FormGroup;

  addSelectedTeamMemberIds: number[] = [];
  removeSelectedTeamMemberIds: number[] = [];

  showAddMembers = false;
  showRemoveMembers = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      team: TeamDto;
    },
    private fb: FormBuilder,
    private teamService: TeamService,
    private dialogRef: MatDialogRef<EditTeamStepperDialogComponent>,
    private toastService: ToastService
  ) {
    this.teamForm = this.fb.group({
      name: [
        this.data.team.name,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
    });
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
    this.addSelectedTeamMemberIds = selectedTeamMembersIdsEvent;
    console.log(
      'Team Members selezionati dal figlio: ',
      this.addSelectedTeamMemberIds
    );
  }

  onTeamMemberSelected(teamMemberIds: number[]): void {
    this.removeSelectedTeamMemberIds = teamMemberIds;
    console.log(this.removeSelectedTeamMemberIds);
  }

  updateTeam(): void {
    const teamName = this.teamForm.get('name')?.value.trim();
    this.setLoadingState('updateTeam', true);

    this.teamService.updateTeam(this.data.team.id!, teamName).subscribe({
      next: (updatedTeam) => {
        console.log('Team updated successfully', updatedTeam);
        this.setLoadingState('updateTeam', false);
        this.setErrorState('updateTeam', null);

        this.toastService.show('Team updated successfully!', {
          classname: 'bg-success text-light',
          delay: 3000,
        });

        this.teamUpdated.emit();
        this.dialogRef.close();
      },
      error: (error) => {
        this.setLoadingState('updateTeam', false);
        this.setErrorState('updateTeam', error.message);
      },
    });
  }

  addMembersToTeam(): void {
    this.setLoadingState('addTeamMembers', true);

    this.teamService
      .addMembersToTeam(this.data.team.id!, this.addSelectedTeamMemberIds)
      .subscribe({
        next: (updatedAddTeamMembers) => {
          console.log('Team members added successfully', updatedAddTeamMembers);
          this.setLoadingState('addTeamMembers', false);
          this.setErrorState('addTeamMembers', null);

          this.toastService.show('Team members added successfully!', {
            classname: 'bg-success text-light',
            delay: 3000,
          });

          this.addSelectedTeamMemberIds = [];
        },
        error: (error) => {
          this.setLoadingState('addTeamMembers', false);
          this.setErrorState('addTeamMembers', error.message);
          this.addSelectedTeamMemberIds = [];
        },
      });
  }

  removeMembersFromTeam(): void {
    this.setLoadingState('removeTeamMembers', true);

    this.teamService
      .removeMembersFromTeam(
        this.data.team.id!,
        this.removeSelectedTeamMemberIds
      )
      .subscribe({
        next: (updatedRemoveTeamMembers) => {
          console.log(
            'Team members removed successfully',
            updatedRemoveTeamMembers
          );
          this.setLoadingState('removeTeamMembers', false);
          this.setErrorState('removeTeamMembers', null);
          this.toastService.show('Team members removed successfully!', {
            classname: 'bg-success text-light',
            delay: 3000,
          });

          this.removeSelectedTeamMemberIds = [];
        },
        error: (error) => {
          this.setLoadingState('removeTeamMembers', false);
          this.setErrorState('removeTeamMembers', error.message);
          this.removeSelectedTeamMemberIds = [];
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
