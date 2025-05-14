import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { TeamMembersTableComponent } from '../team-members-table/team-members-table.component';
import { TeamDto } from '../../dto/team.dto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-team-info-dialog',
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    TeamMembersTableComponent,
  ],
  templateUrl: './team-info-dialog.component.html',
  styleUrl: './team-info-dialog.component.css',
})
export class TeamInfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      team: TeamDto;
    }
  ) {}
}
