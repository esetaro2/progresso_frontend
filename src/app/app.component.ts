import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './component/toast-container/toast-container.component';
import { SidebarComponent } from './component/sidebar/sidebar.component';
import { AuthService } from './service/auth.service';
import { CommonModule } from '@angular/common';
import { BackToTopButtonComponent } from "./component/back-to-top-button/back-to-top-button.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    SidebarComponent,
    CommonModule,
    BackToTopButtonComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Progresso';

  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      (authStatus) => (this.isAuthenticated = authStatus)
    );
  }
}
