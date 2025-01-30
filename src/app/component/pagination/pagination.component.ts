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

  visiblePageNumbers(): number[] {
    const maxVisiblePages = 5;
    const startPage = Math.max(
      this.currentPage - Math.floor(maxVisiblePages / 2),
      0
    );
    const endPage = Math.min(
      startPage + maxVisiblePages - 1,
      this.totalPages - 1
    );
    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
