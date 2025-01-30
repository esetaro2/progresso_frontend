import { Component, Input, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { ProjectDto } from '../../dto/project.dto';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../service/project.service';

@Component({
  selector: 'app-project-card',
  imports: [MaterialModule, CommonModule, NgxChartsModule, NgbModule],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
})
export class ProjectCardComponent implements OnInit {
  @Input() project!: ProjectDto;
  chartData: { name: string; value: number }[] = [];

  constructor(private projectService: ProjectService) {}

  completed = false;

  ngOnInit(): void {
    this.projectService
      .getProjectCompletionPercentage(this.project.id!)
      .subscribe({
        next: (percentage: number) => {
          this.chartData = [
            { name: 'Completed', value: percentage },
            { name: 'Remaining', value: 100 - percentage },
          ];
        },
      });
  }

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

  getTooltipText(): string {
    const statusClass = this.getStatusClass();
    switch (statusClass) {
      case 'in-progress-circle':
        return 'In Progress';
      case 'completed-circle':
        return 'Completed';
      case 'not-started-circle':
        return 'Not Started';
      case 'cancelled-circle':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  }
}
