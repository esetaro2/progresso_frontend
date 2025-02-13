import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AvailableTeamTableComponent } from '../available-team-table/available-team-table.component';
import { CreateTeamDialogComponent } from '../create-team-dialog/create-team-dialog.component';
import { ProjectService } from '../../service/project.service';
import { ProjectDto } from '../../dto/project.dto';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-assign-team-dialog',
  imports: [
    AvailableTeamTableComponent,
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  templateUrl: './assign-team-dialog.component.html',
  styleUrl: './assign-team-dialog.component.css',
})
export class AssignTeamDialogComponent {
  @Output() teamAssigned = new EventEmitter<void>();

  loadingStates = {
    assignTeamToProject: false,
  };

  errorStates = {
    assignTeamToProject: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  existingTeam = false;
  selectedTeamId: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public projectId: number,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<AssignTeamDialogComponent>,
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}

  setLoadingState(key: keyof typeof this.loadingStates, state: boolean): void {
    this.loadingStates[key] = state;
  }

  setErrorState(
    key: keyof typeof this.errorStates,
    error: string | null
  ): void {
    this.errorStates[key] = error;
  }

  openCreateTeamDialog() {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent, {
      width: '100%',
      maxWidth: '750px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Team creato: ', result);
        this.selectedTeamId = result.id;
        console.log('SELECTED TEAM ID PASSATO DAL DIALOG', this.selectedTeamId);
        this.assignTeamToProject();
      }
    });
  }

  onTeamSelected(teamId: number): void {
    this.selectedTeamId = teamId;
    console.log('ID del team selezionato:', this.selectedTeamId);
  }

  assignTeamToProject(): void {
    this.setLoadingState('assignTeamToProject', true);

    this.projectService
      .assignTeamToProject(this.projectId, this.selectedTeamId!)
      .subscribe({
        next: (project: ProjectDto) => {
          console.log('Progetto con team assegnato', project);
          this.teamAssigned.emit();
          this.toastService.show('Team assigned successfully!', {
            classname: 'bg-success text-light',
            delay: 5000,
          });

          this.dialogRef.close();
          this.setLoadingState('assignTeamToProject', false);
          this.setErrorState('assignTeamToProject', null);
        },
        error: () => {
          this.setLoadingState('assignTeamToProject', false);
          this.setErrorState('assignTeamToProject', 'Failed to assign team!');
        },
      });
  }
}
