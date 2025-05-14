import { Component, OnInit, TemplateRef } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { NgbModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../service/toast.service';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidebar',
  imports: [MaterialModule, NgbModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  firstName: string | null = null;
  lastName: string | null = null;
  role: string | null = null;

  loadingStates = {
    logout: false,
  };

  errorStates = {
    logout: null as string | null,
  };

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    public offCanvasService: NgbOffcanvas,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.firstName = this.authService.getUserFirstName();
    this.lastName = this.authService.getUserLastName();
    this.role = this.authService.getUserRole();
  }

  logout(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '100%',
      maxWidth: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setLoadingState('logout', true);

        this.authService.logout().subscribe({
          next: () => {
            this.setLoadingState('logout', false);
            this.setErrorState('logout', null);

            this.router.navigate(['/login']);

            this.toastService.show('Logout successfull!', {
              classname: 'bg-success text-light',
              delay: 5000,
            });
          },
          error: (error) => {
            this.setLoadingState('logout', false);
            this.setErrorState('logout', error.message);

            this.toastService.show(this.errorStates.logout!, {
              classname: 'bg-danger text-light',
              delay: 5000,
            });
          },
        });
      }
    });
  }

  openSidebar(content: TemplateRef<unknown>): void {
    this.offCanvasService.open(content, { position: 'start' });
  }
}
