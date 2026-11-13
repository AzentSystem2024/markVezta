import { CommonModule } from '@angular/common';
import {
  Component,
  NgModule,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
import {
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  providers: [DataService],
})
export class LoginFormComponent implements OnInit {
  @Input()
  resetLink = '/auth/reset-password';
  @Input()
  createAccountLink = '/auth/create-account';
  showPassword: boolean = false;
  defaultAuthData: IResponse;
  btnStylingMode: DxButtonTypes.ButtonStyle;
  menus:
    | {
        [key: string]: any;
      }
    | undefined;
  settings:
    | {
        [key: string]: any;
      }
    | undefined;
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
  is2FAState: boolean = false;
  isSetup2FA: boolean = false;
  qrCodeUrl: string = '';
  manualEntryKey: string = '';
  secretKey: string = '';
  tempToken: string = '';
  otpCode: string = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  mfaProvider: string = 'Google';
  savedCompanyId: number;
  savedFinYearId: number;

  passwordEditorOptions = {
    placeholder: 'Password',
    stylingMode: 'outlined',
    mode: this.passwordMode,
    value: '',
    buttons: [
      {
        name: 'lockIcon',
        location: 'before',
        options: {
          icon: 'lock',
          stylingMode: 'text',
        },
      },
    ],
  };

  datasource: any;
  userDataResponse: any;

  private lastNotificationMessage = '';
  private lastNotificationTime = 0;

  private ipFetchPromise: Promise<{
    internetIP: string;
    localIP: string;
  }> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
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
    this.fetchIPs();
    this.get_financial_year_dropdown();
    this.defaultAuthData = await this.authService.getUser();

    // Load navigation from localStorage
    this.navigation = JSON.parse(localStorage.getItem('sidemenuItems') || '[]');
  }

  // ======= NEW CHANGES =======
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

  // Internet IP (public) with timeout
  async getInternetIP(): Promise<string> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal,
      });
      clearTimeout(timeout);
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
        resolve(''); // fallback if nothing happens
      }, 1000);
      try {
        const pc = new RTCPeerConnection({
          iceServers: [],
        });
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
            try {
              pc.close();
            } catch {}
          }
        };
      } catch {
        clearTimeout(timeout);
        resolve('');
      }
    });
  }

  fetchIPs(): Promise<{ internetIP: string; localIP: string }> {
    if (this.ipFetchPromise) {
      return this.ipFetchPromise;
    }
    this.ipFetchPromise = Promise.all([this.getInternetIP(), this.getLocalIP()])
      .then(([internetIP, localIP]) => ({ internetIP, localIP }))
      .catch(() => ({ internetIP: '', localIP: '' }));

    return this.ipFetchPromise;
  }

  showNotification(
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    displayTime = 3000,
  ): void {
    const now = Date.now();
    // Prevent duplicate toast if identical message is triggered within 1 second
    if (
      this.lastNotificationMessage === message &&
      now - this.lastNotificationTime < 1000
    ) {
      return;
    }
    this.lastNotificationMessage = message;
    this.lastNotificationTime = now;

    notify({
      message,
      type,
      displayTime,
      position: {
        at: 'top right',
        my: 'top right',
      },
    });
  }

  async onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    // Prevent concurrent / duplicate submissions
    if (this.loading) {
      return;
    }

    const username = this.formData.LOGIN_NAME?.trim();
    const password = this.formData.PASSWORD;
    const companyId = this.formData.COMPANY_ID;
    const financialYearId = this.formData.FINANCIAL_YEAR_ID;

    // Fast synchronous validation
    if (!username || !password) {
      this.showNotification('Please enter login name and password', 'warning');
      return;
    }

    if (!financialYearId) {
      this.showNotification('Please select financial year', 'warning');
      return;
    }

    this.loading = true;

    try {
      const { internetIP, localIP } = await this.fetchIPs();

      const payload = {
        LOGIN_NAME: username,
        PASSWORD: password,
        COMPANY_ID: companyId,
        FINANCIAL_YEAR_ID: financialYearId,
        COMPUTER_NAME: 'AZENT-1',
        COMPUTER_USER: 'Indu',
        DOMAIN_NAME: window.location.hostname || '',
        LOCAL_IP: localIP,
        INTERNET_IP: internetIP,
        SYSTEM_DATETIME: new Date().toISOString(),
      };

      const res: any = await firstValueFrom(
        this.dataservice.login_function_api(payload),
      );

      this.handleLoginResponse(res);
    } catch {
      this.showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private handleLoginResponse(res: any): void {
    if (!res) {
      this.showNotification(
        'Unexpected server response. Please try again.',
        'error',
      );
      return;
    }

    switch (res.flag) {
      case 1:
        this.handleSuccessfulLogin(res);
        break;

      case 10:
        this.savedCompanyId = this.formData.COMPANY_ID;
        this.savedFinYearId = this.formData.FINANCIAL_YEAR_ID;
        this.is2FAState = true;
        this.isSetup2FA = true;
        this.tempToken = res.tempToken;
        this.mfaProvider = res.mfaProvider || 'Google';
        this.fetch2FASetupInfo();
        break;

      case 11:
        this.savedCompanyId = this.formData.COMPANY_ID;
        this.savedFinYearId = this.formData.FINANCIAL_YEAR_ID;
        this.is2FAState = true;
        this.isSetup2FA = false;
        this.tempToken = res.tempToken;
        this.mfaProvider = res.mfaProvider || 'Google';
        break;

      default:
        // Authentication or backend validation failure
        this.showNotification(
          res.Message || res.message || 'Username or password is incorrect',
          'error',
        );
        break;
    }

    if (res.UTC_DIFF_MESSAGE && res.UTC_DIFF_MESSAGE.trim() !== '') {
      this.showNotification(res.UTC_DIFF_MESSAGE.trim(), 'warning', 5000);
    }
  }

  private handleSuccessfulLogin(res: any): void {
    localStorage.setItem('userData', JSON.stringify(res));
    sessionStorage.setItem('savedUserData', JSON.stringify(res));
    localStorage.setItem('sideMenuItems', JSON.stringify(res.MenuGroups || []));
    sessionStorage.setItem('authToken', res.Token || '');

    this.userDataResponse = res;

    this.showNotification('Login successful!', 'success', 2000);

    const redirectPath =
      this.userDataResponse?.GeneralSettings?.VAT_TITLE === 'GST'
        ? '/mark-dashboard'
        : '/analytics-dashboard';

    this.router.navigate([redirectPath]);
  }

  fetch2FASetupInfo() {
    this.loading = true;
    this.dataservice.get2FASetupInfo(this.tempToken).subscribe({
      next: (res: any) => {
        this.qrCodeUrl = res.qrCodeSetupImageUrl || res.QrCodeSetupImageUrl;
        this.manualEntryKey = res.manualEntryKey || res.ManualEntryKey;
        this.secretKey = res.secretKey || res.SecretKey;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.showNotification('Failed to fetch 2FA setup info', 'error');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onGenerateNewQRClick() {
    this.isSetup2FA = true;
    this.fetch2FASetupInfo();
  }

  onOtpInput(index: number, event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 1) {
      const chars = value.split('').slice(0, 6);
      for (let i = 0; i < chars.length; i++) {
        if (index + i < 6) {
          this.otpDigits[index + i] = chars[i];
          const nextInput = document.getElementById(
            `otp-${index + i}`,
          ) as HTMLInputElement;
          if (nextInput) nextInput.value = chars[i];
        }
      }
      this.otpCode = this.otpDigits.join('');
      const focusIndex = Math.min(index + chars.length, 5);
      const focusTarget = document.getElementById(`otp-${focusIndex}`);
      if (focusTarget) focusTarget.focus();
      return;
    }
    this.otpDigits[index] = value;
    input.value = value;
    this.otpCode = this.otpDigits.join('');
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }

  onVerifyOTP(e: Event) {
    if (e) {
      e.preventDefault();
    }
    if (this.loading) {
      return;
    }
    if (!this.otpCode || this.otpCode.length < 6) {
      this.showNotification('Please enter a valid 6-digit code', 'error');
      return;
    }
    this.loading = true;
    this.dataservice
      .verify2FA(
        this.tempToken,
        this.otpCode,
        this.secretKey,
        this.savedCompanyId,
        this.savedFinYearId,
      )
      .subscribe({
        next: (res: any) => {
          if (res?.flag === 1) {
            this.handleSuccessfulLogin(res);
          } else {
            this.showNotification(
              res?.Message || res?.message || 'Invalid code',
              'error',
            );
          }
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.showNotification('Verification failed', 'error');
          this.loading = false;
          this.cdr.markForCheck();
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