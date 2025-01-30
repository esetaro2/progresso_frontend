import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.userService.initializeUser(userId);
      }
    }
  }
}
