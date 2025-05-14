import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-filter-section',
  imports: [CommonModule, MaterialModule, FormsModule, NgbModule],
  templateUrl: './filter-section.component.html',
  styleUrls: ['./filter-section.component.css'],
})
export class FilterSectionComponent {
  @Input() role?: string | null;
  @Input() selectedStatus?: string;
  @Input() selectedPriority?: string;
  @Input() searchQuery?: string;
  @Input() statuses: string[] = [];
  @Input() priorities: string[] = [];
  @Input() statusLabels: Record<string, string> = {};
  @Input() priorityLabels: Record<string, string> = {};

  @Output() statusChange = new EventEmitter<string>();
  @Output() priorityChange = new EventEmitter<string>();
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() createProjectEmitter = new EventEmitter<void>();

  isSearchQueryPresent = false;

  selectStatus(status: string) {
    this.statusChange.emit(status);
  }

  selectPriority(priority: string) {
    this.priorityChange.emit(priority);
  }

  onSearchQueryChange(event: Event) {
    this.isSearchQueryPresent = true;
    const input = event.target as HTMLInputElement;
    this.searchQueryChange.emit(input.value);
  }

  resetStatus() {
    this.selectedStatus = '';
    this.statusChange.emit(this.selectedStatus);
  }

  resetPriority() {
    this.selectedPriority = '';
    this.priorityChange.emit(this.selectedPriority);
  }

  resetAllFilters() {
    this.isSearchQueryPresent = false;
    this.resetFilters.emit();
  }

  createProject() {
    this.createProjectEmitter.emit();
  }
}
