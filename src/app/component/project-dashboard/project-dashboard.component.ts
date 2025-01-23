import { Component, OnInit } from '@angular/core';
import { ProjectDto } from '../../dto/project.dto';
import { ProjectService } from '../../service/project.service';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from "../project-card/project-card.component";
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-project-dashboard',
  imports: [CommonModule, ProjectCardComponent, MaterialModule],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.css',
})
export class ProjectDashboardComponent implements OnInit {
  projects: ProjectDto[] = [];
  loading = true;
  displayedColumns: string[] = ['project1', 'project2', 'project3'];


  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getAllProjects(0, 10).subscribe({
      next: (projects) => {
        this.projects = projects.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching projects', error);
        this.loading = false;
      }
    });
  }
}
