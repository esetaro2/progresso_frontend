import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-back-to-top-button',
  imports: [CommonModule, MaterialModule, NgbModule],
  templateUrl: './back-to-top-button.component.html',
  styleUrl: './back-to-top-button.component.css',
})
export class BackToTopButtonComponent {
  showButton = false;

  @HostListener('window:scroll')
  onScroll() {
    this.showButton = window.scrollY > 100;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
