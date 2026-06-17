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
import { AuthService, DataService, IUser, ThemeService } from 'src/app/services';
import { ThemeSwitcherModule } from 'src/app/components/library/theme-switcher/theme-switcher.component';
import { Router } from '@angular/router';
import { DxPopupModule } from 'devextreme-angular';

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
  popupVisible: boolean = false

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
  logoPath: string = '';

  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private dataservice: DataService,
    public themeService: ThemeService
  ) { }

  ngOnInit() {
    this.authService.getUser().then((e) => (this.user = e.data));
    this.sesstion_Details();
    this.version = this.dataservice.get_version();

    this.themeService.isDark.subscribe((isDark) => {
      this.logoPath = isDark
        ? 'assets/images/Vezta-logo-dark.svg'
        : 'assets/images/6e23102ce572502e660df2d9b8ac0c1454ec149d.png';
    });
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



}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxToolbarModule,
    ThemeSwitcherModule,
    UserPanelModule,
    DxPopupModule
  ],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent],
})
export class AppHeaderModule { }
