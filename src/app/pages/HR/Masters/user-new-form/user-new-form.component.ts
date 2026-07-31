import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxTabPanelModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
  DxTemplateModule,
  DxTabsModule,
  DxTextBoxModule,
  DxTextBoxComponent,
  DxButtonModule,
  DxDataGridModule,
  DxTreeViewModule,
  DxValidatorModule,
  DxValidatorComponent,
  DxValidationSummaryModule,
  DxRadioGroupModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxProgressBarModule,
  DxFileUploaderComponent,
  DxTooltipModule,
  DxValidationGroupModule,
  DxValidationGroupComponent,
  DxNumberBoxModule,
  DxDropDownBoxModule,
  DxListModule,
} from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { BrowserModule } from '@angular/platform-browser';
import CountryList from 'country-list-with-dial-code-and-flag';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { isValidPhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-user-new-form',
  templateUrl: './user-new-form.component.html',
  styleUrls: ['./user-new-form.component.scss'],
})
export class UserNewFormComponent {
  @ViewChild('fileUploader', { static: false })
  fileUploader!: DxFileUploaderComponent; // Update the type here
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('currencySelectBox') currencySelectBox: ElementRef;
  @ViewChild('mobileValidator', { static: false })
  mobileValidator!: DxValidatorComponent;
  @ViewChild('whatsappValidator', { static: false })
  whatsappValidator!: DxValidatorComponent;
  @ViewChild('mobileBox', { static: false }) mobileBox!: DxTextBoxComponent;
  @ViewChild('whatsappBox', { static: false }) whatsappBox!: DxTextBoxComponent;
  @ViewChild('validationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  countryCode: string = '+971';
  whatsappCountryCode: string = '+971';
  isCountryDropdownOpen = false;
  isWhatsappDropdownOpen = false;
  user_list: any[] = [];

  userData: any = {
    UserName: '',
    Password: '',
    DateofBirth: '',
    UserRoleID: '',
    Whatsapp: '',
    LoginName: '',
    Email: '',
    Mobile: '',
    countryCode: '',
    IsInactive: false,
    InactiveReason: '',
    changePasswordOnLogin: false,
    COMPANY_ID: [],
    Date_Format: '',
    Time_Format: '',

    // Decimal_Points:'',
    // Currency_Symbol:'',
  };
  newUserData = this.userData;

  // newUserData :any;
  selectedRows: any[] = [];
  userForm: FormGroup;
  images: string[] = [];
  stylingMode: any = 'primary';
  iconPosition: any = 'left';
  orientations: any = 'horizontal';
  scrollByContent: boolean = true;
  showNavButtons: boolean = true;
  isPasswordVisible = false;
  securityPolicyData: any;
  // facilityList;
  CompanyList: any[];
  isAddFormPopupOpened: boolean;
  clearData: any;
  mobile_limit: any;
  sessionData: any;
  storeid: any;

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    const codes = CountryList.getAll();
    this.countryCodes = codes.map((country: any) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`,
      display: `${country.dial_code}`,
    }));
  }

  countryCodes: any[] = [];

  isDropZoneActive = false;
  imageSource = '';
  textVisible = true;
  progressVisible = false;
  progressValue = 0;
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  selectedIndex: number = 0; // Default to the first tab (User)
  generatedPassword: string = '';
  tooltipVisible = false;
  onShowEvent = 'click';
  onHideEvent = 'click';
  selectedRowCount: number = 0;
  totalRowCount: number = 0;
  userList_Data: any[] = [];
  userList: any;
  UserListdataSource: any;
  userRoles: any;

  // Radio button options
  userTypes = ['Normal User', 'Clinician'];
  gender: any;
  userRole: any;

  isLocked: boolean = false;
  isInactive: boolean = false;
  showUserDetails: boolean = true; // Show User Details by default
  showOptions: boolean = true; // Show Options by default
  selectedUserType: string = this.userTypes[0]; // Default to 'Normal User'

  passwordMode: 'password' | 'text' = 'password';
  togglePasswordVisibility = () => {
    this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    this.cdr.detectChanges(); // Ensure the UI reflects the change immediately
  };
  //dateformat options

  selectedDropdownOption: string;
  //thousandseparator
  thousandSeparatorValue: number;
  decimal: number;

  public isDropdownOpen: boolean = false;
  dateFormat: any;
  timeFormat: any;
  currencySymbol: any;
  exampleDateFormat: any;
  exampleTimeFormat: any;
  CompanyList_data: any;
  CompanyData: any;

  // Use this function to display based on dropdown state
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}${item.COUNTRY_NAME}`;
  }

  ngOnInit(): void {
    // this.getCountryCodeList();
    this.getUSerData();

    this.updateMobileNumber(); // Update mobile field with the default country code
    this.get_Company_details();
    this.user_role_dropdown();
    this.sesstion_Details();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.storeid = this.sessionData.Configuration[0].STORE_ID;
    console.log(this.storeid);
  }

  getUSerData() {
    this.dataservice.get_User_data().subscribe((data: any) => {
      this.user_list = data?.Data || data?.data || data || [];
      this.userList = this.user_list;
    });
  }

  get_Company_details() {
    this.dataservice.get_CompanyList_Api().subscribe((res: any) => {
      this.CompanyList_data = res.Data;

      const company_id = this.newUserData.COMPANY_ID;
      this.CompanyData = this.CompanyList_data.filter((item) =>
        company_id.includes(item.ID),
      );

      this.selectedRows = company_id; // This will auto-check rows in the grid

      this.isAddFormPopupOpened = false;
    });
  }
  // Triggered when the dropdown is opened
  onDropdownOpened() {
    this.isDropdownOpen = true; // Mark dropdown as open
  }
  // Triggered when the dropdown is closed
  onDropdownClosed() {
    this.isDropdownOpen = false; // Mark dropdown as closed
  }

  onTimeFormatChange(event: any) {
    // const selectedTimeFormat = this.timeFormat.find(format => format.DESCRIPTION === event.value)?.DESCRIPTION;
    // if(selectedTimeFormat){
    //   this.newUserData.Time_Format = event.value;
    //   this.exampleTimeFormat = this.getFormattedTime(selectedTimeFormat);
    // } else{
    //   this.exampleTimeFormat = '';
    // }
  }

  onLoginExpiryDateChange(event: any) {
    this.newUserData.LoginExpiryDate = event.value; // Update the model with the selected date
  }
  onLockDateToChange(event: any) {
    this.newUserData.LockDateTo = event.value; // Update the model with the selected date
  }
  onLockDateFromChange(event: any) {
    this.newUserData.LockDateFrom = event.value; // Update the model with the selected date
  }
  onDateFormatChange(event: any): void {
    // Directly set the value from the event
    const selectedFormat = this.dateFormat.find(
      (format) => format.DESCRIPTION === event.value,
    )?.DESCRIPTION;
    if (selectedFormat) {
      this.newUserData.Date_Format = event.value; // Ensure the correct value is set
      this.exampleDateFormat = this.getFormattedDate(selectedFormat); // Generate the example format
    } else {
      this.exampleDateFormat = '';
    }
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
  }

  getFormattedDate(format: string): string {
    const currentDate = new Date();

    // Replace placeholders in the selected format with actual date values
    return format
      .replace('YYYY', currentDate.getFullYear().toString())
      .replace('MM', String(currentDate.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(currentDate.getDate()).padStart(2, '0'))
      .replace('HH', String(currentDate.getHours()).padStart(2, '0'))
      .replace('MM', String(currentDate.getMinutes()).padStart(2, '0'))
      .replace('SS', String(currentDate.getSeconds()).padStart(2, '0'))
      .replace('Month', currentDate.toLocaleString('en-US', { month: 'long' }))
      .replace('Day', currentDate.toLocaleString('en-US', { weekday: 'long' }));
  }

  preventTyping(event: any): void {
    if (event.event) {
      event.event.preventDefault(); // Prevent keypress
    }
  }

  handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // if (input.files && input.files[0]) {
    //   const file = input.files[0];
    //   this.readFile(file);
    //   this.resetFileInput(); // Reset the file input after selecting a file
    // }
  }

  handleDrop(event: DragEvent) {
    // this.preventDefaults(event);
    // if (event.dataTransfer && event.dataTransfer.files) {
    //   const file = event.dataTransfer.files[0];
    //   this.readFile(file);
    // }
  }

  handleDragLeave(e: Event) {
    // this.preventDefaults(e);
    // (e.target as HTMLElement).classList.remove('highlight');
  }

  preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  // This function checks if the email already exists in the user list
  checkEmailExists = (e: any): boolean => {
    const email = e.value;

    // Check if the email already exists in the user list
    const exists = this.userList.some(
      (user) => user.Email.toLowerCase() === email.toLowerCase(),
    );

    // Return true if it does NOT exist, false if it DOES exist
    e.valid = !exists;
    return e.valid;
  };

  // Email format validation using custom regex (only alphanumerics before @)
  customEmailValidation = (e: any): boolean => {
    const email = e.value;

    // Custom regex: only alphanumeric before @, at least one alphabet, followed by valid domain
    const emailPattern =
      /^[a-zA-Z0-9]+[a-zA-Z]+[a-zA-Z0-9]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate email against the custom pattern
    const isValid = emailPattern.test(email);

    e.valid = isValid;
    return e.valid;
  };

  onDateOfBirthChange(event: any) {
    this.newUserData.DateofBirth = event.value; // Update the model with the selected date
  }

  checkLoginNameExists = (e: any): boolean => {
    const loginName = (e.value || '').trim().toLowerCase();
    if (!loginName) return true;

    const list = this.user_list || this.userList || [];

    const exists = list.some(
      (user: any) =>
        (user.LOGIN_NAME || user.LoginName || '').trim().toLowerCase() ===
        loginName,
    );

    return !exists;
  };

  onLoginNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    const sanitizedValue = target.value
      .replace(/\s/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    if (sanitizedValue.length > 0 && /^[a-zA-Z]/.test(sanitizedValue[0])) {
      target.value = sanitizedValue;
      this.newUserData.LoginName = sanitizedValue;
      this.newUserData.LOGIN_NAME = sanitizedValue;
    } else {
      target.value = '';
      this.newUserData.LoginName = '';
      this.newUserData.LOGIN_NAME = '';
    }
  }

  // MobileNumberValidate = (e: any): boolean => {
  //   const mobileNumber = e.value || '';

  //   // Find selected country
  //   const selectedCountry = this.countryCodes.find(
  //     (code) => code.CODE === this.newUserData.countryCode,
  //   );

  //   if (!selectedCountry) return false;

  //   const dialCode = selectedCountry.CODE;

  //   // Remove dial code
  //   const numberPart = mobileNumber.replace(dialCode, '').trim();

  //   // Keep digits only
  //   const sanitizedNumber = numberPart.replace(/\D/g, '');

  //   // Check exact length
  //   return sanitizedNumber.length === this.mobile_limit;
  // };
  // onMobileInputChange(event: any) {
  //   const target = event.target as HTMLInputElement;

  //   // Allow only '+' and numbers
  //   let newValue = target.value.replace(/[^0-9+]/g, '');

  //   // Ensure number starts with '+'
  //   if (!newValue.startsWith('+')) {
  //     newValue = '+' + newValue;
  //   }

  //   // Prevent +0
  //   newValue = newValue.replace(/\+0/g, '+');

  //   target.value = newValue;

  //   // Find selected country
  //   const selectedCountry = this.countryCodes.find(
  //     (code) => code.CODE === this.newUserData.countryCode,
  //   );

  //   if (selectedCountry) {
  //     const dialCode = selectedCountry.CODE;

  //     // Prevent deleting dial code
  //     if (!newValue.startsWith(dialCode)) {
  //       this.newUserData.Mobile = dialCode;
  //       return;
  //     }

  //     // Get mobile number after dial code
  //     const mobileNumberPart = newValue.replace(dialCode, '').trim();

  //     const validMobileNumber = this.validateMobileNumber(mobileNumberPart);

  //     // Update mobile with dial code
  //     this.newUserData.Mobile = `${dialCode} ${validMobileNumber}`;
  //   }
  // }

  validateMobileNumber(mobileNumber: string): string {
    // Remove any non-digit characters
    const digitsOnly = mobileNumber.replace(/\D/g, '');

    // Ensure the number does not start with zero and return valid number or empty string if invalid
    return digitsOnly.startsWith('0') ? '' : digitsOnly;
  }

  onCountrySelected(event: any) {
    const dialCode =
      event?.itemData?.dial_code ||
      event?.itemData?.data?.dial_code ||
      (typeof event?.value === 'string' ? event.value : '');

    if (dialCode) {
      if (this.countryCode && this.countryCode !== dialCode) {
        this.newUserData.Mobile = '';
        this.newUserData.MOBILE = '';
        if (this.mobileBox?.instance) {
          this.mobileBox.instance.option('isValid', true);
        }
      }
      this.countryCode = dialCode;
      this.newUserData.countryCode = dialCode;
    }
    this.isCountryDropdownOpen = false;
    this.revalidateMobile();
  }

  onWhatsappCountrySelected(event: any) {
    const dialCode =
      event?.itemData?.dial_code ||
      event?.itemData?.data?.dial_code ||
      (typeof event?.value === 'string' ? event.value : '');

    if (dialCode) {
      if (this.whatsappCountryCode && this.whatsappCountryCode !== dialCode) {
        this.newUserData.Whatsapp = '';
        this.newUserData.WHATSAPP_NO = '';
        if (this.whatsappBox?.instance) {
          this.whatsappBox.instance.option('isValid', true);
        }
      }
      this.whatsappCountryCode = dialCode;
    }
    this.isWhatsappDropdownOpen = false;
    this.revalidateWhatsapp();
  }

  revalidateMobile() {
    setTimeout(() => {
      const val = this.newUserData.Mobile || this.newUserData.MOBILE || '';
      if (val) {
        const isValid = this.MobileValidate({ value: val });
        if (this.mobileBox?.instance) {
          this.mobileBox.instance.option('isValid', isValid);
          if (!isValid) {
            this.mobileBox.instance.option('validationError', {
              message: 'Invalid mobile number',
            });
          }
        }
      } else if (this.mobileBox?.instance) {
        this.mobileBox.instance.option('isValid', true);
      }
      this.mobileValidator?.instance?.validate();
    }, 0);
  }

  revalidateWhatsapp() {
    setTimeout(() => {
      const val =
        this.newUserData.Whatsapp || this.newUserData.WHATSAPP_NO || '';
      if (val) {
        const isValid = this.WhatsappValidate({ value: val });
        if (this.whatsappBox?.instance) {
          this.whatsappBox.instance.option('isValid', isValid);
          if (!isValid) {
            this.whatsappBox.instance.option('validationError', {
              message: 'Invalid Whatsapp number',
            });
          }
        }
      } else if (this.whatsappBox?.instance) {
        this.whatsappBox.instance.option('isValid', true);
      }
      this.whatsappValidator?.instance?.validate();
    }, 0);
  }

  MobileValidate = (e: any): boolean => {
    const dialCode = (this.countryCode || '').trim();
    const mobileValue = e.value ? e.value.toString().trim() : '';
    const mobileNumber = mobileValue.replace(/\D/g, '');
    if (!mobileNumber) return true;

    if (dialCode === '+971' || dialCode === '971') {
      return mobileNumber.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + mobileNumber);
    } catch {
      return false;
    }
  };

  WhatsappValidate = (e: any): boolean => {
    const dialCode = (this.whatsappCountryCode || '').trim();
    const mobileValue = e.value ? e.value.toString().trim() : '';
    const mobileNumber = mobileValue.replace(/\D/g, '');
    if (!mobileNumber) return true;

    if (dialCode === '+971' || dialCode === '971') {
      return mobileNumber.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + mobileNumber);
    } catch {
      return false;
    }
  };

  autoBindWhatsapp() {
    setTimeout(() => {
      if (!this.newUserData.Whatsapp && this.newUserData.Mobile) {
        this.newUserData.Whatsapp = this.newUserData.Mobile;
        this.newUserData.WHATSAPP_NO = this.newUserData.Mobile;
      }
    }, 0);
  }

  onMobileInputChange(event: any) {
    const target = (event.target ||
      (event.event && event.event.target)) as HTMLInputElement;
    if (!target) return;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.newUserData.Mobile = digits;
    this.newUserData.MOBILE = digits;
    this.revalidateMobile();
  }

  validateWhatsapp(event: any) {
    const target = (event.target ||
      (event.event && event.event.target)) as HTMLInputElement;
    if (!target) return;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.newUserData.Whatsapp = digits;
    this.newUserData.WHATSAPP_NO = digits;
    this.revalidateWhatsapp();
  }

  onUserNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    let sanitizedValue = target.value
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/g, '')
      .toUpperCase();

    target.value = sanitizedValue;
    this.newUserData.UserName = sanitizedValue;
    this.newUserData.USER_NAME = sanitizedValue;
  }

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let sanitizedValue = target.value.replace(/\s/g, '');
    target.value = sanitizedValue;
    this.newUserData.Email = sanitizedValue;
  }

  refreshPassword(): void {
    this.generatedPassword = this.generateRandomPassword(); // Call your existing method to generate a random password
  }

  generateRandomPassword(): string {
    // Fetch the minimum length from security policy; default to 8 if not provided
    const minLength = Math.max(this.securityPolicyData.MinimumLength || 8, 8); // Ensure a minimum length of at least 8

    // Set a maximum length (e.g., 12) or based on your requirement
    const maxLength = 12;

    // Calculate random length between minLength and maxLength
    const length =
      Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

    const specialChars = '@#$%&*';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    // Initialize password and characters array
    let password = '';
    const characters = [];
    const requiredCharacters = [];

    // Include character sets and ensure at least one character from each selected set
    if (this.securityPolicyData.Numbers) {
      characters.push(numbers);
      requiredCharacters.push(
        numbers.charAt(Math.floor(Math.random() * numbers.length)),
      );
    }
    if (this.securityPolicyData.UppercaseCharacters) {
      characters.push(upperCase);
      requiredCharacters.push(
        upperCase.charAt(Math.floor(Math.random() * upperCase.length)),
      );
    }
    if (this.securityPolicyData.LowercaseCharacters) {
      characters.push(lowerCase);
      requiredCharacters.push(
        lowerCase.charAt(Math.floor(Math.random() * lowerCase.length)),
      );
    }
    if (this.securityPolicyData.SpecialCharacters) {
      characters.push(specialChars);
      requiredCharacters.push(
        specialChars.charAt(Math.floor(Math.random() * specialChars.length)),
      );
    }

    // Ensure there are character sets to choose from
    if (characters.length === 0) {
      throw new Error(
        'No character sets selected based on the security policy.',
      );
    }

    // Add at least one character of each required type to the password
    requiredCharacters.forEach((char) => (password += char));

    // Calculate remaining length to fill
    const remainingLength = length - requiredCharacters.length;

    // Fill the rest of the password with random characters from the selected sets
    for (let i = 0; i < remainingLength; i++) {
      const charSet = characters[Math.floor(Math.random() * characters.length)];
      password += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }

    // Shuffle the password to ensure randomness
    password = password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    return password;
  }

  toggleUserDetails(): void {
    this.showUserDetails = !this.showUserDetails;
  }

  updateMobileNumber() {
    // Find the selected country code
    const selectedCountry = this.countryCodes.find(
      (code) => code.data.dial_code === this.newUserData.countryCode,
    );

    if (selectedCountry) {
      const dialCode = selectedCountry.data.dial_code; // Extract country code

      // Extract and validate the mobile number part
      const mobileNumber = this.getOnlyMobileNumber(this.newUserData.Mobile);
      const validMobileNumber = this.validateMobileNumber(mobileNumber);

      // Update the mobile field with valid country code and mobile number
      this.newUserData.Mobile = `${dialCode} ${validMobileNumber}`;
    }
  }
  onCountrycodeChange(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }

  validateMobileLength = (e: any): boolean => {
    const value = e.value || '';

    // Allow only digits
    const digitsOnly = value.replace(/\D/g, '');

    return digitsOnly.length === this.mobile_limit;
  };
  getOnlyMobileNumber(fullPhoneNumber: string): string {
    // Extract mobile number by removing the dial code part
    const selectedCountry = this.countryCodes.find((code) =>
      fullPhoneNumber.startsWith(code.data.dial_code),
    );

    if (selectedCountry) {
      return fullPhoneNumber.replace(selectedCountry.data.dial_code, '').trim();
    }

    return fullPhoneNumber; // Return as is if no match found
  }

  copyToClipboard(): void {
    if (!navigator.clipboard) {
      console.warn(
        'Clipboard API not available. Make sure you are running the application over HTTPS.',
      );
      // Optionally show a user-friendly message or fallback logic
      this.tooltipVisible = false;
      return;
    }

    navigator.clipboard
      .writeText(this.generatedPassword)
      .then(() => {
        this.tooltipVisible = true;
      })
      .catch((err) => {
        console.error('Error copying password to clipboard', err);
        // You can show an error message to the user here
      });
  }

  user_role_dropdown() {
    this.dataservice.get_userLevels_Dropdown_Api().subscribe((res: any) => {
      this.userRole = res;
    });
  }

  // getNewUserData = () => ({
  //   ...this.newUserData,
  //   COMPANY_ID: this.selectedRows,
  //   STORE_ID: this.storeid,
  //   Mobile: this.newUserData.countryCode + '-' + this.newUserData.Mobile,
  // });

  getNewUserData = () => {
    let isValid = true;
    if (this.validationGroup?.instance) {
      const res = this.validationGroup.instance.validate();
      isValid = res.isValid;
    }

    const isMobileValid = this.MobileValidate({
      value: this.newUserData.Mobile || this.newUserData.MOBILE,
    });
    const isWhatsappValid = this.WhatsappValidate({
      value: this.newUserData.Whatsapp || this.newUserData.WHATSAPP_NO,
    });

    if (!isMobileValid) {
      this.revalidateMobile();
      isValid = false;
    }
    if (!isWhatsappValid) {
      this.revalidateWhatsapp();
      isValid = false;
    }

    if (!isValid) {
      notify(
        {
          message: 'Please resolve all validation errors before saving.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return null;
    }

    const mobileVal = this.newUserData.Mobile || this.newUserData.MOBILE || '';
    const whatsappVal =
      this.newUserData.Whatsapp || this.newUserData.WHATSAPP_NO || '';
    const mobileCode = this.countryCode || '+971';
    const whatsappCode = this.whatsappCountryCode || this.countryCode || '+971';

    return {
      ...this.newUserData,
      UserName: this.newUserData.UserName || this.newUserData.USER_NAME,
      LoginName: this.newUserData.LoginName || this.newUserData.LOGIN_NAME,
      LOGIN_NAME: this.newUserData.LOGIN_NAME || this.newUserData.LoginName,
      COMPANY_ID: this.selectedRows,
      STORE_ID: this.storeid,
      Mobile: mobileCode + '-' + mobileVal,
      MOBILE: mobileCode + '-' + mobileVal,
      Whatsapp: whatsappCode + '-' + whatsappVal,
      WHATSAPP_NO: whatsappCode + '-' + whatsappVal,
      WHATSAPP: whatsappCode + '-' + whatsappVal,
      countryCode: mobileCode,
    };
  };
}

@NgModule({
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxTabsModule,
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxTreeViewModule,
    DxValidatorModule,
    DxRadioGroupModule,
    FormTextboxModule,
    DxDateBoxModule,
    DxFileUploaderModule,
    DxProgressBarModule,
    BrowserModule,
    DxTooltipModule,
    ReactiveFormsModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
    DxDropDownBoxModule,
    DxListModule,
  ],
  providers: [],
  declarations: [UserNewFormComponent],
  exports: [UserNewFormComponent],
})
export class UserNewFormModule { }
