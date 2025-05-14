import { Component, ViewChild } from '@angular/core';
import { UsersTableComponent } from '../users-table/users-table.component';
import { TeamsTableComponent } from '../teams-table/teams-table.component';
import { ProjectsTableComponent } from '../projects-table/projects-table.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [UsersTableComponent, TeamsTableComponent, ProjectsTableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  @ViewChild(ProjectsTableComponent)
  projectsTableComponent!: ProjectsTableComponent;

  onReloadProjectsTable(): void {
    this.projectsTableComponent.resetAllFilters();
    this.projectsTableComponent.applyFilter();
  }
}
