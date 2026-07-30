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
  EventEmitter,
  HostListener,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
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
import { DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';
import notify from 'devextreme/ui/notify';
import { isValidPhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-user-edit-form',
  templateUrl: './user-edit-form.component.html',
  styleUrls: ['./user-edit-form.component.scss'],
})
export class UserEditFormComponent {
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
  @Input() selectedRowData: any;
  @Output() closeForm = new EventEmitter<void>();

  @Input() formdata: any;

  userData: any = {
    ID: '',
    UserName: '',
    Password: '',
    DateofBirth: '',
    UserRoleID: '',
    Whatsapp: '',
    LoginName: '',
    GenderID: '',
    Email: '',
    Mobile: '',
    countryCode: '',
    IsInactive: false,
    InactiveReason: '',
    changePasswordOnLogin: false,
    CompanyList: [],
    Date_Format: '',
    Time_Format: '',
    // Decimal_Points:'',
    // Currency_Symbol:'',
  };
  newUserData: any = {};
  // newUserData :any;

  CompanyList: any[];
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
  countryCodes: any[] = [];

  passwordMode: 'password' | 'text' = 'password';
  togglePasswordVisibility = () => {
    this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
    this.cdr.detectChanges(); // Ensure the UI reflects the change immediately
  };

  isEditPopupOpened: boolean = false;
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
  userList: any;

  // Radio button options
  userTypes = ['Normal User', 'Clinician'];
  gender: any;
  userRole: any;
  clinicianOptions = ['clinician1', 'clinician2', 'clinician3'];
  isLocked: boolean = false;
  isInactive: boolean = false;
  showUserDetails: boolean = true; // Show User Details by default
  showOptions: boolean = true; // Show Options by default
  selectedUserType: string = this.userTypes[0]; // Default to 'Normal User'
  mobile_limit: any;

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
  CompanyList_data: any = {};
  CompanyData: any;
  countryCode: any;
  sessionData: any;
  storeid: any;
  // Use this function to display based on dropdown state
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }
  getEditUserData = () => ({ ...this.newUserData });
  user_name_value: any;
  phonenumber: string;
  phoneNoCode: string;
  user_list: any = [];

  isCountryDropdownOpen = false;
  isWhatsappDropdownOpen = false;
  whatsappCountryCode: string = '';
  isAdminUser = false;

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
    this.get_userlist();
  }

  get_userlist() {
    this.dataservice.get_User_data().subscribe((res: any) => {
      this.user_list = res?.Data || res?.data || res || [];
      this.userList = this.user_list;
    });
  }

  parsePhoneAndCountryCode(rawPhone: any): {
    countryCode: string;
    number: string;
  } {
    if (!rawPhone) return { countryCode: '', number: '' };

    const str = rawPhone.toString().trim();

    // Check if it has a hyphen or space separator e.g. "+91-51234719632" or "+91 51234719632"
    if (str.includes('-') || str.includes(' ')) {
      const parts = str.split(/[-\s]+/);
      if (parts.length >= 2 && parts[0].startsWith('+')) {
        const code = parts[0];
        const num = parts.slice(1).join('').replace(/\D/g, '');
        return { countryCode: code, number: num };
      }
    }

    // Check against countryCodes array if string starts with "+"
    if (str.startsWith('+') && this.countryCodes && this.countryCodes.length) {
      const match = this.countryCodes.find(
        (c: any) => c.data?.dial_code && str.startsWith(c.data.dial_code),
      );
      if (match) {
        const code = match.data.dial_code;
        const num = str.replace(code, '').replace(/\D/g, '');
        return { countryCode: code, number: num };
      }
    }

    // Fallback: strip non-digits
    return { countryCode: '', number: str.replace(/\D/g, '') };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedRowData'] && changes['selectedRowData'].currentValue) {
      this.newUserData = {
        ...this.selectedRowData,
        ...changes['selectedRowData'].currentValue,
      };
    }
    const MobileNo =
      this.selectedRowData?.MOBILE || this.selectedRowData?.Mobile || '';
    const WhatsappNo =
      this.selectedRowData?.WHATSAPP_NO ||
      this.selectedRowData?.WHATSAPP ||
      this.selectedRowData?.Whatsapp ||
      '';

    const mobileParsed = this.parsePhoneAndCountryCode(MobileNo);
    this.countryCode = mobileParsed.countryCode || '+91';
    this.newUserData.MOBILE = mobileParsed.number;

    const whatsappParsed = this.parsePhoneAndCountryCode(WhatsappNo);
    this.whatsappCountryCode =
      whatsappParsed.countryCode || this.countryCode || '+91';
    this.newUserData.WHATSAPP_NO = whatsappParsed.number;
    this.newUserData.Whatsapp = whatsappParsed.number;

    this.get_userlist();
    this.user_role_dropdown();
    this.get_Company_details();
    this.updateMobileNumber();
    this.sesstion_Details();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.storeid = this.sessionData.Configuration[0].STORE_ID;
    this.isAdminUser = this.sessionData.USER_ROLE_NAME === 'Administrator' || this.sessionData.USER_NAME === 'ADMIN';
    console.log(this.storeid);
  }

  Closepop() {
    this.isEditPopupOpened = false;
    this.closeForm.emit(); // Emit the close event to parent component
  }
  get_Company_details() {
    this.dataservice.get_CompanyList_Api().subscribe((res: any) => {
      this.CompanyList_data = res.Data;

      const company_id = this.newUserData.COMPANY_ID;
      this.CompanyData = this.CompanyList_data.filter((item) =>
        company_id.includes(item.ID),
      );

      this.selectedRows = company_id; // This will auto-check rows in the grid
    });
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

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
  }

  user_role_dropdown() {
    this.dataservice.get_userLevels_Dropdown_Api().subscribe((res: any) => {
      this.userRole = res;
    });
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

  selected_Data() {
    this.user_name_value = this.newUserData.USER_NAME;
  }

  // Method to handle tab click and set selected index
  // onTabClick(event: any) {
  //     ;
  //   this.selectedIndex = event.itemIndex;
  // }

  // WhatsappValidate = (e: any): boolean => {
  //   const whatsappNumber = e.value;

  //   // Remove all non-digit characters
  //   const sanitizedNumber = whatsappNumber.replace(/\D/g, '');

  //   // Check if the sanitized number has at least 10 digits
  //   if (sanitizedNumber.length >= 10) {
  //     return true; // Valid
  //   }
  //   return false; // Invalid
  // };

  autoBindWhatsapp() {
    setTimeout(() => {
      if (!this.newUserData.Whatsapp && this.newUserData.Mobile) {
        this.newUserData.Whatsapp = this.newUserData.Mobile;
      }
    }, 0);
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

  // This function removes spaces from the email input and updates the Email property
  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Remove spaces from the email input
    const sanitizedValue = target.value.replace(/\s/g, '');

    // Update the target value and the Email property
    target.value = sanitizedValue;
    this.newUserData.Email = sanitizedValue;
    this.checkEmailExists({ value: sanitizedValue });
  }

  onDateOfBirthChange(event: any) {
    this.newUserData.DateofBirth = event.value; // Update the model with the selected date
  }

  checkLoginNameExists = (e: any): boolean => {
    const loginName = (e.value || '').trim().toLowerCase();
    if (!loginName) return true;

    const list = this.user_list || this.userList || [];
    const currentId = this.newUserData?.ID;

    const exists = list.some(
      (user: any) =>
        (user.LOGIN_NAME || user.LoginName || '').trim().toLowerCase() ===
        loginName && user.ID !== currentId,
    );

    return !exists;
  };

  onLoginNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Remove spaces from the current value and sanitize it
    const sanitizedValue = target.value
      .replace(/\s/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    // Check if the first character is an alphabet
    if (sanitizedValue.length > 0 && /^[a-zA-Z]/.test(sanitizedValue[0])) {
      target.value = sanitizedValue;
      this.newUserData.LOGIN_NAME = sanitizedValue;
      this.newUserData.LoginName = sanitizedValue;
    } else {
      target.value = '';
      this.newUserData.LOGIN_NAME = '';
      this.newUserData.LoginName = '';
    }
  }

  MobileNumberValidate = (e: any): boolean => {
    const mobileNumber = e.value;

    // Remove all non-digit characters
    const sanitizedNumber = mobileNumber.replace(/\D/g, '');

    // Check if the sanitized number has at least 10 digits
    if (sanitizedNumber.length >= 10) {
      return true; // Valid
    }
    return false; // Invalid
  };

  onMobileInputChange(event: any) {
    const target = event.target as HTMLInputElement;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.newUserData.MOBILE = digits;
    this.revalidateMobile();
  }

  validateWhatsapp(event: any) {
    const target = event.target as HTMLInputElement;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.newUserData.WHATSAPP_NO = digits;
    this.newUserData.Whatsapp = digits;
    this.revalidateWhatsapp();
  }

  // validateWhatsapp(event: any) {
  //   const target = event.target as HTMLInputElement;
  //   let digits = target.value.replace(/\D/g, '');
  //   if (digits.startsWith('0')) {
  //     digits = digits.substring(1);
  //   }
  //   this.newUserData.WHATSAPP_NO = digits;
  // }

  // Triggered when the dropdown is opened
  onDropdownOpened() {
    this.isDropdownOpen = true; // Mark dropdown as open
  }
  // Triggered when the dropdown is closed
  onDropdownClosed() {
    this.isDropdownOpen = false; // Mark dropdown as closed
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

  onUserNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Regular expression to allow only alphabets with a single space between words
    let sanitizedValue = target.value
      .replace(/[^a-zA-Z\s]/g, '') // Remove all characters except alphabets and spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
      .replace(/^\s+/g, '') // Remove spaces at the beginning of the string
      .toUpperCase();

    target.value = sanitizedValue;
    this.newUserData.UserName = sanitizedValue; // Update the UserName value
  }

  toggleUserDetails(): void {
    this.showUserDetails = !this.showUserDetails;
  }

  // updateMobileNumber() {
  //   // Find the selected country code

  //   const selectedCountry = this.countryCodes.find(
  //     (code) => code.data.dial_code === this.newUserData.countryCode
  //   );

  //   if (selectedCountry) {
  //     const dialCode = selectedCountry.data.dial_code; // Extract country code

  //     // Extract and validate the mobile number part
  //     const mobileNumber = this.getOnlyMobileNumber(this.newUserData.Mobile);
  //     const validMobileNumber = this.validateMobileNumber(mobileNumber);

  //     // Update the mobile field with valid country code and mobile number
  //     this.newUserData.Mobile = `${dialCode} ${validMobileNumber}`;

  //   }
  // }
  onCountrySelected(event: any) {
    const dialCode =
      event?.itemData?.dial_code ||
      event?.itemData?.data?.dial_code ||
      (typeof event?.value === 'string' ? event.value : '');

    if (dialCode) {
      if (this.countryCode && this.countryCode !== dialCode) {
        this.newUserData.MOBILE = '';
        if (this.mobileBox?.instance) {
          this.mobileBox.instance.option('isValid', true);
        }
      }
      this.countryCode = dialCode;
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
        this.newUserData.WHATSAPP_NO = '';
        this.newUserData.Whatsapp = '';
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
      const val = this.newUserData.MOBILE || '';
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
      const val = this.newUserData.WHATSAPP_NO || '';
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

  updateMobileNumber() {
    const code = this.countryCode; // E.g., "+91"
  }

  MobileValidate = (e: any): boolean => {
    const dialCode = (this.countryCode || '').trim();
    const mobileValue = e.value ? e.value.toString().trim() : '';
    const mobileNumber = mobileValue.replace(/\D/g, '');
    if (!mobileNumber) return true;

    // UAE (+971) mobile numbers are strictly 9 digits
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

    // UAE (+971) mobile numbers are strictly 9 digits
    if (dialCode === '+971' || dialCode === '971') {
      return mobileNumber.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + mobileNumber);
    } catch {
      return false;
    }
  };

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
  onCountrycodeChange(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  Update_data() {
    let isValid = true;
    if (this.validationGroup?.instance) {
      const res = this.validationGroup.instance.validate();
      isValid = res.isValid;
    }

    const isMobileValid = this.MobileValidate({
      value: this.newUserData.MOBILE,
    });
    const isWhatsappValid = this.WhatsappValidate({
      value: this.newUserData.WHATSAPP_NO,
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
      return;
    }

    const whatsappVal =
      this.newUserData.WHATSAPP_NO || this.newUserData.Whatsapp || '';
    const whatsappCode = this.whatsappCountryCode || this.countryCode || '+91';

    const payload = {
      ...this.newUserData,
      COMPANY_ID: this.selectedRows,
      STORE_ID: this.storeid,
      MOBILE:
        (this.countryCode || '+91') + '-' + (this.newUserData.MOBILE || ''),
      WHATSAPP_NO: whatsappCode + '-' + whatsappVal,
      Whatsapp: whatsappCode + '-' + whatsappVal,
      WHATSAPP: whatsappCode + '-' + whatsappVal,

      IS_LOCKED: this.newUserData.IS_LOCKED,
      LOCK_DATE_FROM: this.newUserData.LOCK_DATE_FROM,
      LOCK_DATE_TO: this.newUserData.LOCK_DATE_TO,
      LOCK_REASON: this.newUserData.LOCK_REASON
    };

    console.log(payload)
    this.dataservice.Update_user_data(payload).subscribe((res: any) => {
      this.isEditPopupOpened = false;
      this.closeForm.emit();
      this.get_userlist();
    });
  }
  validateMobileLength = (e: any): boolean => {
    const value = e.value || '';

    // Allow only digits
    const digitsOnly = value.replace(/\D/g, '');

    return digitsOnly.length === this.mobile_limit;
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
  declarations: [UserEditFormComponent],
  exports: [UserEditFormComponent],
})
export class UserEditFormModule { }
