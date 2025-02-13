import { Component } from '@angular/core';
import { ToastService } from '../../service/toast.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-toast-container',
  imports: [NgbModule, CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="toast-container">
      <ngb-toast
        *ngFor="let toast of toastService.toasts"
        [header]="toast.header!"
        [class]="toast.classname"
        [autohide]="true"
        [delay]="toast.delay || 5000"
        (hide)="toastService.remove(toast)"
      >
        {{ toast.text }}
      </ngb-toast>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1200;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        pointer-events: none;
      }
      .toast-container ngb-toast {
        margin-bottom: 0.5rem;
        pointer-events: auto;
      }
    `,
  ],
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
