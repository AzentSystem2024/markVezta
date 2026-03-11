import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { UserPanelModule } from '../user-panel/user-panel.component';
import { AuthService, DataService, IUser } from 'src/app/services';
import { ThemeSwitcherModule } from 'src/app/components/library/theme-switcher/theme-switcher.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title!: string;
  customerInfo: any;
  user: IUser | null = { email: 'rererer' };
  UserName: any;

  userMenuItems = [
    {
      text: 'Change Password',
      icon: 'key',
      onClick: () => {
        this.changePassword();
      },
    },
    {
      text: 'Logout',
      icon: 'runner',
      onClick: () => {
        this.authService.logOut();
        localStorage.removeItem('menuData');
      },
    },
  ];
  company: any;
  version: any;
  userInitials = '';

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private dataservice: DataService,
  ) {}

  ngOnInit() {
    this.authService.getUser().then((e) => (this.user = e.data));
    this.sesstion_Details();
    this.version = this.dataservice.get_version();
    this.isDarkTheme();
  }

  private getInitials(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.UserName = sessionData.USER_NAME;
    this.company = sessionData.SELECTED_COMPANY.COMPANY_NAME;

    const initials = this.UserName?.trim()
      .split(/\s+/)
      .map((x) => x[0])
      .join('')
      .toUpperCase();

    this.user = {
      ...this.user,
      initials,
    };
  }

  changePassword() {
    this.router.navigateByUrl('/change-password');
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };
  isDarkTheme() {
    return document.body.classList.contains('dx-theme-fluent-dark');
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxToolbarModule,
    ThemeSwitcherModule,
    UserPanelModule,
  ],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent],
})
export class AppHeaderModule {}
