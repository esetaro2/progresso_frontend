import { Injectable } from '@angular/core';

export interface Toast {
  header?: string;
  text: string;
  classname?: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  show(text: string, options: Partial<Toast> = {}) {
    this.toasts.push({ text, ...options });
  }

  remove(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear() {
    this.toasts = [];
  }
}
