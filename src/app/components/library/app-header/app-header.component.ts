import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
  // createComponent,
  // ComponentRef,
  // EnvironmentInjector,
  // ApplicationRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

import { UserPanelModule } from '../user-panel/user-panel.component';
import { AuthService, DataService, IUser, ThemeService } from 'src/app/services';
import { ThemeSwitcherModule } from 'src/app/components/library/theme-switcher/theme-switcher.component';
import { Router } from '@angular/router';
import { PendingActivityComponent, PendingActivityModule } from 'src/app/pages/pending-activity/pending-activity.component';
import { DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';

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
    showPendingActivity = false;

  companyList: any[] = [];
  selectedCompanyId: number | null = null;
  companyPopupVisible = false;

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
  finId: any;
  userInitials = '';
  logoPath: string = '';
  pendingActivities: any[] = [];
  // taskBarData: any[] = [];

  // isPanelVisible = false;
  
  canSwitchCompany = false;

  constructor(
    private authService: AuthService,
    // private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private dataservice: DataService,
    public themeService: ThemeService,
      // private cdr: ChangeDetectorRef
    // private appRef: ApplicationRef,
    // private environmentInjector: EnvironmentInjector
  ) { }

  ngOnInit() {
    this.authService.getUser().then((e) => (this.user = e.data));
    this.sesstion_Details();
    this.version = this.dataservice.get_version();
    this.loadPendingActivities();

    this.themeService.isDark.subscribe((isDark) => {
      this.logoPath = isDark
        ? 'assets/images/Vezta-logo-dark.svg'
        : 'assets/images/6e23102ce572502e660df2d9b8ac0c1454ec149d.png';
    });
  }

  loadPendingActivities(): void {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
    const payload = {
      USER_ID: sessionData?.USER_ID,
      COMPANY_ID: sessionData?.SELECTED_COMPANY?.COMPANY_ID
    };

    if (payload.USER_ID && payload.COMPANY_ID) {
      this.dataservice.TaskBarApi(payload).subscribe({
        next: (res: any) => {
          this.pendingActivities = res?.TASK_LIST || [];
        },
        error: () => {}
      });
    }
  }

  // Total pending count
  get totalPending(): number {
    if (!this.pendingActivities || this.pendingActivities.length === 0) return 0;
    return this.pendingActivities.reduce(
      (total, item) => total + (Number(item.VERIFY_COUNT) || Number(item.count) || 0), 0
    );
  }

  // private pendingComponentRef?: ComponentRef<PendingActivityComponent>;

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
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

    this.UserName = sessionData?.USER_NAME;
    // Get all available companies
    this.companyList = sessionData?.Companies || [];

    // Get currently selected company
    this.selectedCompanyId =
      sessionData?.SELECTED_COMPANY?.COMPANY_ID ?? null;

    this.company = sessionData?.SELECTED_COMPANY?.COMPANY_NAME;
    this.finId = sessionData?.FINANCIAL_YEARS?.[0]?.FIN_CODE || '2026';

    this.canSwitchCompany = sessionData?.IS_COMPANY_SWITCH

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

  openCompanyPopup() {
    if (!this.canSwitchCompany) {
      return;
    }

    this.companyPopupVisible = !this.companyPopupVisible;
  }

  onCompanyChanged(item: any) {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );

    // Update selected company ID
    sessionData.COMPANY_ID = item.COMPANY_ID;

    // Update selected company details
    sessionData.SELECTED_COMPANY = item;

    // Save updated session
    sessionStorage.setItem(
      'savedUserData',
      JSON.stringify(sessionData)
    );

    // Update header
    this.company = item.COMPANY_NAME;
    this.selectedCompanyId = item.COMPANY_ID;

    this.companyPopupVisible = false;

    // Reload application
    window.location.reload();
  }

  changePassword() {
    this.router.navigateByUrl('/change-password');
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };
 
// togglePanel() {
//   this.showPendingActivityPanel();
// }
togglePanel(): void {
  this.showPendingActivity = !this.showPendingActivity;
 
  // this.cdr.detectChanges();
}

//  
// showPendingActivityPanel(): void {

//   if (this.pendingComponentRef) {
//     return;
//   }

//   this.pendingComponentRef = createComponent(
//     PendingActivityComponent,
//     {
//       environmentInjector: this.environmentInjector
//     }
//   );

//   this.appRef.attachView(this.pendingComponentRef.hostView);

//   document.body.appendChild(
//     this.pendingComponentRef.location.nativeElement
//   );

//   this.pendingComponentRef.changeDetectorRef.detectChanges();
// }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxToolbarModule,
    ThemeSwitcherModule,
    UserPanelModule,
    DxPopupModule,
    PendingActivityModule,
    DxSelectBoxModule,
  ],
  declarations: [AppHeaderComponent],
  exports: [AppHeaderComponent],
})
export class AppHeaderModule { }
