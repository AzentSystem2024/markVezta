import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import notify from 'devextreme/ui/notify';
import { confirm, custom } from 'devextreme/ui/dialog';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  isUserLoggedIn: any;
  private timeoutId: any;
  inactivityTimeout: any;
  private apiInProgress = false;
  private isLoggingOut = false; // 🔴 prevent multiple calls

  constructor(
    private authservice: AuthService,
    private ngZone: NgZone,
    private dataservice: DataService,
  ) {}

  setApiInProgress(status: boolean) {
    this.apiInProgress = status;

    if (status) {
      this.resetTimer();
    }
  }

  startTheInactiveService() {
    this.get_securityPolicy_List();
  }

  get_securityPolicy_List() {
    this.dataservice.get_securityPolicy_List().subscribe((response: any) => {
      if (response) {
        const presentSecurityData = response.data[0];
        this.inactivityTimeout =
          presentSecurityData.SessionTimeoutMinutes * 60000;

        this.isUserLoggedIn = true;
        this.startWatching();
        this.setupEvents();
      }
    });
  }

  startWatching() {
    this.resetTimer();
  }

  // ✅ Clean logout

  async logout() {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    let isRefreshing = false;

    const unloadHandler = async () => {
      isRefreshing = true;
      await this.authservice.logOut();
    };

    window.addEventListener('beforeunload', unloadHandler);

    const dialog = custom({
      title: 'Session Timeout',
      message: 'Your session has timed out. Please log in to continue.',
      buttons: [
        {
          text: 'OK',
          onClick: async () => {
            window.removeEventListener('beforeunload', unloadHandler);

            await this.authservice.logOut();

            setTimeout(() => window.location.reload(), 200);
          },
        },
      ],
    });

    // ✅ Only show popup if NOT refreshing
    setTimeout(() => {
      if (!isRefreshing) {
        dialog.show();
      }
    }, 0);
  }

  resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      if (this.isUserLoggedIn && !this.apiInProgress) {
        this.ngZone.run(() => this.logout());
      } else {
        this.resetTimer();
      }
    }, this.inactivityTimeout);
  }

  setupEvents() {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach((event) => {
      window.addEventListener(event, () => this.resetTimer());
    });
  }
}
