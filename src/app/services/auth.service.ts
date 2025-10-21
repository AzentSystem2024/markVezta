import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface IUser {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface IResponse {
  isOk: boolean;
  data?: IUser;
  message?: string;
}

const defaultPath = '/';
export const defaultUser: IUser = {
  email: '',
  name: '',
  avatarUrl:
    'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/01.png',
};

@Injectable()
export class AuthService {
  private apiUrl = environment.apiUrl;
  public endpoint: string;
  private _user: IUser | null = defaultUser;
  private menuData: { [key: string]: any } | undefined;
  private settingsData: { [key: string]: any } | undefined;

  get loggedIn(): boolean {
    return !!this._user;
  }

  private _lastAuthenticatedPath: string = defaultPath;

  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private http: HttpClient, private router: Router) {
    this.endpoint = `${this.apiUrl}/users/login`;

    this.menuData = JSON.parse(localStorage.getItem('menuData') || '[]');
    this.settingsData = JSON.parse(
      localStorage.getItem('settingsData') || '[]'
    );
  }

  // async logIn(email: string, password: string) {
  //   try {
  //     // Send request
  //     this._user = { ...defaultUser, email };
  //     this.router.navigate([this._lastAuthenticatedPath]);

  //     return {
  //       isOk: true,
  //       data: this._user,
  //     };
  //   } catch {
  //     return {
  //       isOk: false,
  //       message: 'Authentication failed',
  //     };
  //   }
  // }

  async getUser() {
    try {
      // Send request

      return {
        isOk: true,
        data: this._user,
      };
    } catch {
      return {
        isOk: false,
        data: null,
      };
    }
  }

  async createAccount(email: string, password: string) {
    try {
      // Send request

      this.router.navigate(['/auth/create-account']);
      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to create account',
      };
    }
  }

  async changePassword(email: string, recoveryCode: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to change password',
      };
    }
  }

  async resetPassword(email: string) {
    try {
      // Send request

      return {
        isOk: true,
      };
    } catch {
      return {
        isOk: false,
        message: 'Failed to reset password',
      };
    }
  }

  // async logOut() {
  //   this.router.navigate(['/auth/login']);
  //   // localStorage.removeItem('authToken');
  // }

  async logOut() {
    // Navigate to login route
    await this.router.navigate(['/auth/login']);

    // Clear local storage items
    localStorage.removeItem('menuData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('settingsData');

    // Optional: Reset user
    this._user = null;

    // Force a full page reload
    window.location.reload();
  }

  verifyLogin(data: object): Observable<any> {
    return this.http.post(this.endpoint, data);
  }
  getToken() {
    return localStorage.getItem('authToken');
  }

  setMenuData(menu: any) {
    this.menuData = menu;
    localStorage.setItem('menuData', JSON.stringify(menu));
  }
  // getMenuData() {
  //   return this.menuData;
  // }

  getMenuData() {
    let menuData = this.menuData || [];

    // If no menu or user not logged in, show public Accounts route
    // if (!menuData || menuData.length === 0) {
    //   return [
    //     {
    //       text: 'Accounts',
    //       path: '/accounts',
    //       icon: 'money',
    //     },
    //   ];
    // }

    // If logged in, but Accounts not in the list, optionally add it
    const hasAccounts = menuData.some((item: any) => item.path === '/accounts');
    if (!hasAccounts) {
      menuData.push({
        text: 'Accounts',
        path: '/accounts',
        icon: 'money',
      });
    }

    const hasArticleColor = menuData.some(
      (item: any) => item.psth === '/article-color'
    );
    if (!hasArticleColor) {
    }
    return menuData;
  }

  setsettingsData(settings: any) {
    this.settingsData = settings;
    localStorage.setItem('settingsData', JSON.stringify(settings));
  }
  getsettingsData() {
    console.log(this.getsettingsData, 'GETSETTINGS');
    return this.settingsData;
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    const isAuthForm = [
      'login',
      'reset-password',
      'create-account',
      'change-password/:recoveryCode',
    ].includes(route.routeConfig?.path || defaultPath);

    // if (!isLoggedIn && isAuthForm) {
    //   this.router.navigate(['/auth/login']);
    // }

    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath =
        route.routeConfig?.path || defaultPath;
    }

    return isLoggedIn || isAuthForm;
  }
}
