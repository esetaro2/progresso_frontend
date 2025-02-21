import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
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
import { ToastService } from '../../service/toast.service';

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

  @Output() updateProjectPercentage = new EventEmitter<void>();

  loadingStates = {
    tasks: false,
    deleteTask: false,
    completeTask: false,
    editTask: false,
  };

  errorStates = {
    tasks: null as string | null,
    deleteTask: null as string | null,
    completeTask: null as string | null,
    editTask: null as string | null,
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

  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;

  selectedRow: Task | null = null;
  selectedTaskId: number | null = null;

  selectedStatus?: string;
  statuses: string[] = ['IN_PROGRESS', 'COMPLETED'];
  statusLabels: Record<string, string> = {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  };
  availableStatuses: string[] = [];

  selectedPriority?: string;
  priorities: string[] = ['LOW', 'MEDIUM', 'HIGH'];
  priorityLabels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };
  availablePriorities: string[] = [];

  constructor(
    private toastService: ToastService,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

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

  isBeforeStart(task: Task): boolean {
    const startDate = new Date(task.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    return today < startDate;
  }

  loadTasks(): void {
    this.setLoadingState('tasks', true);

    this.taskService
      .getTasksByProjectIdAndFilters(
        this.projectId!,
        this.currentPage,
        this.pageSize,
        this.selectedStatus,
        this.selectedPriority
      )
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

          this.availableStatuses = Array.from(
            new Set(
              this.dataSource.data
                .map((task) => task.status)
                .filter((status): status is string => status !== undefined)
            )
          );
          this.availablePriorities = Array.from(
            new Set(
              this.dataSource.data
                .map((task) => task.priority)
                .filter(
                  (priority): priority is string => priority !== undefined
                )
            )
          );

          this.setLoadingState('tasks', false);
          this.setErrorState('tasks', null);
        },
        error: (error) => {
          this.setLoadingState('tasks', false);
          this.setErrorState('tasks', error.message);
          this.dataSource.data = [];
        },
      });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 0;
    this.loadTasks();
  }

  resetStatus(): void {
    this.selectedStatus = '';
    this.currentPage = 0;
    this.loadTasks();
  }

  selectPriority(priority: string): void {
    this.selectedPriority = priority;
    this.currentPage = 0;
    this.loadTasks();
  }

  resetPriority(): void {
    this.selectedPriority = '';
    this.currentPage = 0;
    this.loadTasks();
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
        this.setLoadingState('completeTask', true);

        this.taskService.completeTask(this.selectedTaskId!).subscribe({
          next: () => {
            this.loadTasks();
            this.currentPage = 0;

            this.toastService.show('Task completed successfully!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });

            this.updateProjectPercentage.emit();

            this.setLoadingState('completeTask', false);
            this.setErrorState('completeTask', null);
          },
          error: (error) => {
            this.setLoadingState('completeTask', false);
            this.setErrorState('completeTask', error.message);
            this.toastService.show(this.errorStates.completeTask!, {
              classname: 'bg-danger text-light',
              delay: 5000,
            });
          },
        });
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
        this.setLoadingState('deleteTask', true);

        this.taskService
          .removeTaskFromProject(this.projectId!, this.selectedTaskId!)
          .subscribe({
            next: () => {
              this.currentPage = 0;
              this.loadTasks();

              this.toastService.show('Task deleted successfully!', {
                classname: 'bg-success text-light',
                delay: 5000,
              });

              this.updateProjectPercentage.emit();

              this.setLoadingState('deleteTask', false);
              this.setErrorState('deleteTask', null);
            },
            error: (error) => {
              this.setLoadingState('deleteTask', false);
              this.setErrorState('deleteTask', error.message);
              this.toastService.show(this.errorStates.deleteTask!, {
                classname: 'bg-danger text-light',
                delay: 5000,
              });
            },
          });
      } else {
        console.log('Azione annullata.');
      }
    });
  }

  openEditDialog(row: TaskDto): void {
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

    dialogRef.componentInstance.taskUpdated.subscribe(() => {
      this.currentPage = 0;
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

  getButtonTooltip(
    task: Task,
    action: 'complete' | 'edit' | 'delete'
  ): string | null {
    if (action === 'complete') {
      if (this.isBeforeStart(task) && task.ownerUsername === 'Unassigned') {
        return 'The task has not started and is unassigned.';
      }

      if (this.isBeforeStart(task)) {
        return 'The task has not started yet';
      } else if (task.ownerUsername === 'Unassigned') {
        return 'The task is not assigned to any user';
      } else if (task.status === 'COMPLETED') {
        return 'The task is already completed';
      }
    } else if (action === 'edit' || action === 'delete') {
      if (task.status === 'COMPLETED') {
        return `Cannot ${action} a completed task`;
      }
    }
    return null;
  }
}
