import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { ProjectDto } from '../../dto/project.dto';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-project-card',
  imports: [MaterialModule, CommonModule, NgxChartsModule],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
})
export class ProjectCardComponent {
  @Input() project!: ProjectDto;

  chartData = [
    {
      name: 'Completed',
      value: 70,
    },
    {
      name: 'Remaining',
      value: 30,
    },
  ];

  scaleType = ScaleType.Ordinal;

  getPriorityClass(): string {
    switch (this.project.priority) {
      case 'LOW':
        return 'low-priority';
      case 'MEDIUM':
        return 'medium-priority';
      case 'HIGH':
        return 'high-priority';
      default:
        return 'default-priority';
    }
  }

  getStatusClass() {
    switch (this.project.status) {
      case 'NOT_STARTED':
        return 'not-started-circle';
      case 'IN_PROGRESS':
        return 'in-progress-circle';
      case 'COMPLETED':
        return 'completed-circle';
      case 'CANCELLED':
        return 'cancelled-circle';
      default:
        return '';
    }
  }
}
