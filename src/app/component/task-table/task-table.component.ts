import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../../service/task.service';
import { Page } from '../../dto/page.dto';
import { TaskDto } from '../../dto/task.dto';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';

interface Task {
  id?: number;
  name: string;
  description: string;
  priority: string;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  status?: string;
  ownerUsername?: string;
}

function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@Component({
  selector: 'app-task-table',
  imports: [MaterialModule, NgbModule, CommonModule, FormsModule],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css',
})
export class TaskTableComponent implements OnInit {
  @Input() projectId?: number;
  @Input() teamId?: number;
  @Input() startDate?: string;
  @Input() dueDate?: string;

  loadingStates = {
    tasks: false,
  };

  errorStates = {
    tasks: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  displayedColumns: string[] = [
    'name',
    'startDate',
    'dueDate',
    'completionDate',
    'priority',
    'status',
    'owner',
    'description',
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchQuery = '';

  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedRow: Task | null = null;
  selectedTaskId: number | null = null;

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTasks();
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

  loadTasks(): void {
    this.setLoadingState('tasks', true);

    this.taskService
      .getTasksByProjectId(this.projectId!, this.currentPage, this.pageSize)
      .subscribe({
        next: (pageData: Page<TaskDto>) => {
          this.totalElements = pageData.page.totalElements;
          this.totalPages = pageData.page.totalPages;

          const tasks = pageData.content.map((task) => ({
            ...task,
            ownerUsername: task.assignedUserUsername || 'Unassigned',
            completionDate: task.completionDate ?? 'Not Completed',
          }));

          this.dataSource.data = tasks;
          this.dataSource.sort = this.sort;
          this.setLoadingState('tasks', false);
          this.setErrorState('tasks', null);
        },
        error: () => {
          this.setLoadingState('tasks', false);
          this.setErrorState('tasks', "No tasks found.");
          this.dataSource.data = [];
        },
      });
  }

  openCompleteDialog(row: Task): void {
    const dialogData: ConfirmDialogData = {
      title: 'Complete Task',
      message: 'Are you sure you want to complete this task?',
      confirmText: 'Complete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    this.selectedRow = row;
    this.selectedTaskId = row.id!;
    console.log('Task selezionata per completamento', row);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService.completeTask(this.selectedTaskId!).subscribe({
          next: (task: TaskDto) => {
            console.log('Task completata', task);
            this.loadTasks();
          },
          error: (error) => {
            console.error('Errore completamento task', error);
          },
        });
      } else {
        console.log('Azione annullata.');
      }
    });
  }

  openDeleteDialog(row: Task): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    this.selectedRow = row;
    this.selectedTaskId = row.id!;
    console.log('Task selezionata per eliminazione', row);

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService
          .removeTaskFromProject(this.projectId!, this.selectedTaskId!)
          .subscribe({
            next: () => {
              console.log('Task eliminata');
              this.loadTasks();
            },
            error: (error) => {
              console.error('Errore eliminazione task', error);
            },
          });
      } else {
        console.log('Azione annullata.');
      }
    });
  }

  openEditDialog(row: Task): void {
    console.log('Task selezionata per modifica', row);

    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '100%',
      maxWidth: '750px',
      data: {
        task: row,
        teamId: this.teamId,
        projectId: this.projectId,
        startDate: this.startDate,
        dueDate: this.dueDate,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadTasks();
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
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
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'startDate':
          return compare(a.startDate, b.startDate, isAsc);
        case 'dueDate':
          return compare(a.dueDate, b.dueDate, isAsc);
        case 'completionDate':
          return compare(a.completionDate!, b.completionDate!, isAsc);
        default:
          return 0;
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
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

  getStatusClass(status: string) {
    switch (status) {
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

  getTooltipText(status: string): string {
    const statusClass = this.getStatusClass(status);
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
