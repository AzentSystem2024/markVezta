import { CommonModule } from '@angular/common';
import {
  Component,
  NgModule,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { LoginOauthModule } from 'src/app/components/library/login-oauth/login-oauth.component';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxButtonModule, DxButtonTypes } from 'devextreme-angular/ui/button';
import notify from 'devextreme/ui/notify';
import {
  AuthService,
  DataService,
  IResponse,
  ThemeService,
} from 'src/app/services';
import { text } from 'stream/consumers';
import * as path from 'path';
import {
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  providers: [DataService],
})
export class LoginFormComponent implements OnInit {
  @Input() resetLink = '/auth/reset-password';
  @Input() createAccountLink = '/auth/create-account';
  showPassword: boolean = false;

  defaultAuthData: IResponse;

  btnStylingMode: DxButtonTypes.ButtonStyle;

  menus: { [key: string]: any } | undefined;
  settings: { [key: string]: any } | undefined;

  errorMessage: any;
  resData: any;
  navigation: any;

  validUsernames: string[] = [];
  isPasswordVisible: boolean = false;
  passwordVisible = false;
  passwordMode: 'password' | 'text' = 'password';
  loading = false;
  finacialYearList: any = [];
  CompanyList: any = [];
  formData: any = {};
  selectedRole;
  passwordEditorOptions = {
    placeholder: 'Password',
    stylingMode: 'outlined',
    mode: this.passwordMode,
    value: '',

    buttons: [
      {
        name: 'lockIcon',
        location: 'before',
        options: { icon: 'lock', stylingMode: 'text' },
      },
    ],
  };
  datasource: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private sessionService: SessionService,
  ) {
    this.themeService.isDark.subscribe((value: boolean) => {
      this.btnStylingMode = value ? 'outlined' : 'contained';
    });
  }

  togglePasswordVisibility = () => {
    this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    this.cdr.detectChanges(); // Ensure the UI reflects the change immediately
  };

  changePasswordMode() {
    this.passwordMode = this.passwordMode === 'text' ? 'password' : 'text';
  }

  onCreateAccountClick = () => {
    this.router.navigate([this.createAccountLink]);
  };

  async ngOnInit(): Promise<void> {
    this.get_financial_year_dropdown();
    this.defaultAuthData = await this.authService.getUser();

    // Load navigation from localStorage
    this.navigation = JSON.parse(localStorage.getItem('sidemenuItems') || '[]');
  }

  ///=========================NEW CHANGES =====================

  get_financial_year_dropdown() {
    this.dataservice.financial_year_api().subscribe((res: any) => {
      this.finacialYearList = res || []; // Ensure fallback to empty array
      const currentYear = this.finacialYearList.find((year: any) => {
        return year.DESCRIPTION.includes(new Date().getFullYear().toString());
      });
      if (currentYear) {
        this.formData.FINANCIAL_YEAR_ID = currentYear.ID;
      }
    });
  }

  onUsernameChange(e: any) {
    const typedUsername = e.value?.trim();

    if (typedUsername && typedUsername.length >= 3) {
      const payload = {
        LOGIN_NAME: typedUsername,
      };

      this.dataservice.Company_api(payload).subscribe((res: any) => {
        // Optionally store or use the company list
        this.CompanyList = res.Companies || [];
        if (this.CompanyList.length > 0) {
          this.formData.COMPANY_ID = this.CompanyList[0].COMPANY_ID;
        }
        // Optionally store login info
        localStorage.setItem('userData', JSON.stringify(res));
      });
    }
  }

  // Internet IP (public)
  async getInternetIP(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || '';
    } catch {
      return '';
    }
  }

  // Local IP (best effort – browser dependent)
  getLocalIP(): Promise<string> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(''); // ⛑ fallback if nothing happens
      }, 1500);

      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {
            clearTimeout(timeout);
            resolve('');
          });

        pc.onicecandidate = (event) => {
          if (!event || !event.candidate) return;

          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const match = ipRegex.exec(event.candidate.candidate);

          if (match) {
            clearTimeout(timeout);
            resolve(match[1]);
            pc.close();
          }
        };
      } catch {
        clearTimeout(timeout);
        resolve('');
      }
    });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading = true;

    if (!this.formData.LOGIN_NAME || !this.formData.PASSWORD) {
      notify({
        message: 'Please enter login name and password',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      this.loading = false;
      return;
    }
    if (!this.formData.FINANCIAL_YEAR_ID) {
      notify({
        message: 'Please select financial year',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      this.loading = false;
      return;
    }

    const COMPUTER_NAME = 'AZENT-1';
    const COMPUTER_USER = 'Indu';
    const DOMAIN_NAME = window.location.hostname || '';

    // ✅ SAFE async calls
    const [INTERNET_IP, LOCAL_IP] = await Promise.all([
      this.getInternetIP(),
      this.getLocalIP(),
    ]);
    const SYSTEM_DATETIME = new Date().toISOString();
    const payload = {
      LOGIN_NAME: this.formData.LOGIN_NAME,
      PASSWORD: this.formData.PASSWORD,
      COMPANY_ID: this.formData.COMPANY_ID,
      FINANCIAL_YEAR_ID: this.formData.FINANCIAL_YEAR_ID,
      COMPUTER_NAME,
      COMPUTER_USER,
      DOMAIN_NAME,
      LOCAL_IP,
      INTERNET_IP,
      SYSTEM_DATETIME,
    };

    this.dataservice.login_function_api(payload).subscribe({
      next: (res: any) => {
        if (res.flag === 1) {
          localStorage.setItem('userData', JSON.stringify(res));
          sessionStorage.setItem('savedUserData', JSON.stringify(res));
          localStorage.setItem('sideMenuItems', JSON.stringify(res.MenuGroups));
          sessionStorage.setItem('authToken', res.Token);
          this.router.navigate(['/analytics-dashboard']);

          notify({
            message: 'Login successful!',
            type: 'success',
            displayTime: 2000,
            position: { at: 'top right', my: 'top right' },
          });
        }
        if (res.UTC_DIFF_MESSAGE && res.UTC_DIFF_MESSAGE.trim() !== '') {
          notify({
            message: res.UTC_DIFF_MESSAGE,
            type: 'warning', // best for time mismatch
            displayTime: 5000,
            position: { at: 'top right', my: 'top right' },
          });
        } else {
          // Backend validation message
          notify({
            message: res.Message || 'Username or password is incorrect',
            type: 'success',
            displayTime: 3000,
            position: { at: 'top right', my: 'top right' },
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        notify({
          message: 'Something went wrong. Please try again.',
          type: 'error',
          displayTime: 3000,
        });
      },
    });
  }


}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LoginOauthModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DxSelectBoxModule,
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent],
})
export class LoginFormModule {}