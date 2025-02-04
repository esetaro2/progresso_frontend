import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-not-authorized',
  imports: [MaterialModule],
  templateUrl: './not-authorized.component.html',
  styleUrl: './not-authorized.component.css',
})
export class NotAuthorizedComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
