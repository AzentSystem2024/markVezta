import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private timeoutId: any;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // ⏱ 15 minutes
  constructor(private router: Router, private ngZone: NgZone) {}

  startSessionTimer() {
    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.SESSION_TIMEOUT);
  }

  resetSessionTimer() {
    this.startSessionTimer();
  }

  clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();

    this.ngZone.run(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
