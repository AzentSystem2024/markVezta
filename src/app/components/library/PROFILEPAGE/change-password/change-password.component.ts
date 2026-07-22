import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxDataGridModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components/utils/form-popup/form-popup.component';
import { CustomReuseStrategy } from 'src/app/custome-reuse-strategy';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  @ViewChild('validationGroup', { static: true })
  validationGroup: DxValidationGroupComponent;

  securityPolicyData: any;
  UserID: any;
  oldPassword: any;
  getOldPassword: any;
  newPassword: string = '';
  confirmPassword: string = '';
  confirmPasswordBorderColor: string = '1px solid #ddd'; // Default border color
  oldPasswordBorderColor: string = '1px solid #ddd'; // Default border color
  newPasswordBorderColor: string = '1px solid #ddd'; // Default border color
  oldPasswordError: string = ''; // Error message for old password validation
  dummyId: any;
  showConfirmPassword: boolean = false;
  isPasswordVisible: boolean = false;
  isOldPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  isSaving: boolean = false; // Property to track saving state

  constructor(
    // private service: MasterReportService,
    private authService: AuthService,
    private route: Router,
    private dataService: DataService,
    // private reuseStrategy: CustomReuseStrategy
  ) {
    // this.UserID = sessionStorage.getItem('USER_ID');
    this.sesstion_Details();
  }

  ngOnInit(): void {
    this.getSecurityPolicyData();
    this.sesstion_Details();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.UserID = sessionData.USER_ID;
  }

  getSecurityPolicyData() {
    this.dataService.getUserSecurityPolicityData().subscribe((res: any) => {
      this.securityPolicyData = res.data[0];
    });
  }

  // Custom async validation function for old password
  validateOldPassword = (params: any): Promise<any> => {
    return new Promise((resolve) => {
      // Check if oldPassword is set to avoid running validation unnecessarily
      if (!params.value) {
        this.oldPasswordBorderColor = '1px solid #ddd';
        resolve(true);
        return;
      }

      this.dataService.get_User_Data_By_Id(this.UserID).subscribe(
        (res: any) => {
          let actualOldPassword = '';
          if (res && res.Data && res.Data.length > 0) {
            actualOldPassword = res.Data[0].PASSWORD || res.Data[0].Password;
          } else {
            actualOldPassword = res.Password || res.PASSWORD;
          }

          if (params.value !== actualOldPassword) {
            this.oldPasswordBorderColor = '2px solid red';
            resolve({ isValid: false, message: 'Incorrect password' });
          } else {
            this.oldPasswordBorderColor = '2px solid green';
            resolve(true);
          }
        },
        () => {
          resolve({ isValid: false, message: 'Validation failed' });
        },
      );
    });
  };

  validateNewPasswordNotSame = (params: any): Promise<any> => {
    return new Promise((resolve) => {
      if (!params.value) {
        resolve(true);
        return;
      }

      this.dataService.get_User_Data_By_Id(this.UserID).subscribe(
        (res: any) => {
          let actualOldPassword = '';
          if (res && res.Data && res.Data.length > 0) {
            actualOldPassword = res.Data[0].PASSWORD || res.Data[0].Password;
          } else {
            actualOldPassword = res.Password || res.PASSWORD;
          }

          if (params.value === actualOldPassword) {
            resolve({
              isValid: false,
              message:
                'New password cannot be the same as the current password',
            });
          } else {
            resolve(true);
          }
        },
        () => {
          resolve(true);
        },
      );
    });
  };

  checkPasswordStrength(): boolean {
    // Skip password validation if not required
    if (
      !this.securityPolicyData ||
      !this.securityPolicyData.PasswordValidationRequired
    ) {
      return true;
    }

    return (
      this.checkNumbers() &&
      this.checkUppercase() &&
      this.checkLowercase() &&
      this.checkSpecialCharacters() &&
      this.checkMinimumLength()
    );
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Remove spaces from the current value
    const sanitizedValue = target.value.replace(/\s/g, '');

    // Update the target value and the newPassword property
    target.value = sanitizedValue;
    this.newPassword = sanitizedValue; // Update the password value

    this.checkPasswordStrength();
    this.validateNewPasswordBorder();
    if (this.confirmPassword) {
      this.validateConfirmPassword();
    }
  }

  validateNewPasswordBorder(): void {
    if (!this.newPassword) {
      this.newPasswordBorderColor = '1px solid #ddd';
      return;
    }

    if (this.checkPasswordStrength() && this.newPassword !== this.oldPassword) {
      this.newPasswordBorderColor = '2px solid green';
    } else {
      this.newPasswordBorderColor = '2px solid red';
    }
  }

  onConfirmPasswordKeyDown(event: KeyboardEvent): void {
    // Capture current input value
    const target = event.target as HTMLInputElement;
    setTimeout(() => {
      this.confirmPassword = target.value; // Get the updated password after keydown
      this.validateConfirmPassword(); // Call the function to check the strength of the password
    }, 0);
  }

  validateConfirmPassword(): void {
    if (!this.confirmPassword) {
      this.confirmPasswordBorderColor = '1px solid #ddd';
      return;
    }

    // Validate if confirmPassword matches newPassword
    if (this.confirmPassword === this.newPassword && this.newPassword !== '') {
      this.confirmPasswordBorderColor = '2px solid green'; // Set border color to green
    } else {
      this.confirmPasswordBorderColor = '2px solid red'; // Set border color to red
    }
  }

  validatePasswordMatch = (): boolean => {
    return this.newPassword === this.confirmPassword;
  };

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible; // Toggle the visibility
  }
  toggleOldPasswordVisibility(): void {
    this.isOldPasswordVisible = !this.isOldPasswordVisible; // Toggle the visibility
  }
  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible; // Toggle the visibility
  }

  checkNumbers(): boolean {
    return this.securityPolicyData.Numbers ? /\d/.test(this.newPassword) : true;
  }

  checkUppercase(): boolean {
    return this.securityPolicyData.UppercaseCharacters
      ? /[A-Z]/.test(this.newPassword)
      : true;
  }

  checkLowercase(): boolean {
    return this.securityPolicyData.LowercaseCharacters
      ? /[a-z]/.test(this.newPassword)
      : true;
  }

  checkSpecialCharacters(): boolean {
    return this.securityPolicyData.SpecialCharacters
      ? /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword)
      : true;
  }

  checkMinimumLength(): boolean {
    const minLen = this.securityPolicyData?.MinimumLength || 8;
    return (this.newPassword || '').length >= minLen;
  }

  isFormValid(): boolean {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      return false;
    }

    if (this.oldPasswordBorderColor !== '2px solid green') {
      return false;
    }

    if (this.newPasswordBorderColor !== '2px solid green') {
      return false;
    }

    if (this.confirmPasswordBorderColor !== '2px solid green') {
      return false;
    }

    return true;
  }

  resetForm() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    this.oldPasswordBorderColor = '1px solid #ddd';
    this.newPasswordBorderColor = '1px solid #ddd';
    this.confirmPasswordBorderColor = '1px solid #ddd';

    this.isOldPasswordVisible = false;
    this.isPasswordVisible = false;
    this.isConfirmPasswordVisible = false;

    this.validationGroup.instance.reset();
  }

  closeChangePassword() {

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const vatTitle = sessionData?.GeneralSettings?.VAT_TITLE;

    if (vatTitle === 'GST') {
      this.route.navigate(['/mark-dashboard']);
    } else {
      this.route.navigate(['/analytics-dashboard']);
    }
    this.resetForm();
  }

  saveNewPassword() {
    if (!this.isFormValid()) {
      return;
    }

    if (this.validationGroup?.instance) {
      const validationResult = this.validationGroup.instance.validate();
      if (!validationResult.isValid) {
        return;
      }
    }

    this.isSaving = true;

    const PasswordData = {
      UserID: this.UserID,
      NewPassword: this.newPassword,
    };

    this.dataService.reset_Password(PasswordData).subscribe(
      (res) => {
        try {
          if (res) {
            notify(
              {
                message: 'Password Updated successfully',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success',
            );
            setTimeout(() => {
              const sessionData = JSON.parse(
                sessionStorage.getItem('savedUserData') || '{}',
              );

              if (sessionData?.GeneralSettings?.VAT_TITLE === 'GST') {
                this.route.navigate(['/mark-dashboard']);
              } else {
                this.route.navigate(['/analytics-dashboard']);
              }
            }, 500);
          } else {
            this.isSaving = false;
            notify(
              {
                message: res,
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'error',
            );
          }
        } catch (error) {
          this.isSaving = false;
          notify(
            {
              message: 'Password update operation failed',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error',
          );
        }
      },
      (error) => {
        this.isSaving = false;
        notify(
          {
            message: 'Password update operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error',
        );
      },
    );
    this.resetForm();
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule,
    FormPopupModule,
    DxValidatorModule,
    DxValidationGroupModule,
  ],
  exports: [ChangePasswordComponent],
  declarations: [ChangePasswordComponent],
})
export class ChangePasswordModule { }
