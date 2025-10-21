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

  passwordMode = 'password';

  menus: { [key: string]: any } | undefined;
  settings: { [key: string]: any } | undefined;

  errorMessage: any;
  resData: any;
  navigation: any;

  validUsernames: string[] = [];

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
    private cdr: ChangeDetectorRef
  ) {
    this.themeService.isDark.subscribe((value: boolean) => {
      this.btnStylingMode = value ? 'outlined' : 'contained';
    });

    // this.get_Company_list_dropdown()
  }

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
    console.log(this.navigation, 'NAVIGATIONNNNNN');
  }

  ///=========================NEW CHANGES =====================
  passwordVisible = false;

  get_financial_year_dropdown() {
    this.dataservice.financial_year_api().subscribe((res: any) => {
      console.log(res);
      this.finacialYearList = res || []; // Ensure fallback to empty array
      console.log('Dropdown Financial Years:', this.finacialYearList);
      console.log(this.finacialYearList);
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
      console.log('User typed:', typedUsername);

      const payload = {
        LOGIN_NAME: typedUsername,
      };

      this.dataservice.Company_api(payload).subscribe((res: any) => {
        console.log('Company API Response:', res);

        // Optionally store or use the company list
        this.CompanyList = res.Companies || [];

        // Optionally store login info
        localStorage.setItem('userData', JSON.stringify(res));
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.loading = true;

    if (!this.formData.LOGIN_NAME || !this.formData.PASSWORD) {
      alert('Please enter login name and password');
      this.loading = false;
      return;
    }

    console.log('Attempting login with:', this.formData);

    this.dataservice.login_function_api(this.formData).subscribe({
      next: (res: any) => {
        console.log('Login API response:', res);

        if (res.flag === 1) {
          localStorage.setItem('userData', JSON.stringify(res));
          sessionStorage.setItem('savedUserData', JSON.stringify(res));
          localStorage.setItem('sideMenuItems', JSON.stringify(res.MenuGroups));
          this.router.navigate(['/analytics-dashboard']);
        }
        //  else {
        //   this.errorMessage = 'Invalid login credentials';
        // }

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
        console.error('Login Error:', err);
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
