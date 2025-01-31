import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  goToPage(pageIndex: number): void {
    this.pageChange.emit(pageIndex);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  visiblePageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      if (current > 3) {
        pages.push('...');
      }

      let startPage = Math.max(current - 1, 1);
      let endPage = Math.min(current + 1, total - 2);

      if (current <= 3) {
        startPage = 1;
        endPage = 3;
      }

      if (current >= total - 4) {
        startPage = total - 4;
        endPage = total - 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (current < total - 4) {
        pages.push('...');
      }

      pages.push(total - 1);
    }

    return pages;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isNumber(value: any): value is number {
    return typeof value === 'number';
  }
  
}
