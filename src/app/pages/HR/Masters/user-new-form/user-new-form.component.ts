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
  DxNumberBoxModule,
  DxDropDownBoxModule,
  DxListModule,
} from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { BrowserModule } from '@angular/platform-browser';
import CountryList from 'country-list-with-dial-code-and-flag';
import { DataService } from 'src/app/services';



@Component({
  selector: 'app-user-new-form',
  templateUrl: './user-new-form.component.html',
  styleUrls: ['./user-new-form.component.scss']
})
export class UserNewFormComponent {
  @ViewChild('fileUploader', { static: false })
  fileUploader!: DxFileUploaderComponent; // Update the type here
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('currencySelectBox') currencySelectBox: ElementRef;

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
    Date_Format:'',
    Time_Format:'',
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
 CompanyList: any[] ;
  isAddFormPopupOpened: boolean;
  clearData: any;

constructor(private fb: FormBuilder, private dataservice: DataService,private cdr: ChangeDetectorRef) {}

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
  userList_Data: any[]=[]
userList:any
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
  decimal:number;

  public isDropdownOpen: boolean = false;
  dateFormat: any;
  timeFormat: any;
  currencySymbol: any;
  exampleDateFormat: any;
  exampleTimeFormat: any;
  CompanyList_data:any
  CompanyData:any

// Use this function to display based on dropdown state
  countryCodeDisplay = (item: any) => {
    return item
      ? this.isDropdownOpen
        ? `${item.data.flag} ${item.data.dial_code} - ${item.data.name}`
        : `${item.data.flag}`
      : ''; // Display only country flag before dropdown is opened
  };

    getCountryCodeList() {
    const codes = CountryList.getAll(); // Get all country codes
    this.countryCodes = codes.map((country: any) => ({
      data: country.data,
    }));
    console.log(this.countryCodes, 'country code'); // Optional: For debugging
  }


ngOnInit(): void {
    
    // this.getDropDownData('GENDER_DATA');
    // this.getDropDownData('USER_ROLE');
    // this.getDropDownData('DATE_FORMAT');
    // this.getDropDownData('TIME_FORMAT');
    // this.getDropDownData('CURRENCY_SYMBOL');
    // this.getUserSecurityPolicyData();
    // this.getFacilityData();
    this.getCountryCodeList();
    this.getUSerData()
    // this.fetch_all_UserLevel_list();
    // this.setDefaultCountryCode();
    this.updateMobileNumber(); // Update mobile field with the default country code
    this.get_Company_details()
    this.user_role_dropdown()
  }
  getUSerData() {
    this.dataservice.get_User_data().subscribe((data) => {
      this.userList = data;
      console.log('datasource', this.userList);
    });
  }


  get_Company_details(){

  this.dataservice.get_CompanyList_Api().subscribe((res:any)=>{
    console.log(res);
    this.CompanyList_data=res.Data
    console.log(this.CompanyList_data);

    const company_id=this.newUserData.COMPANY_ID
    this.CompanyData = this.CompanyList_data.filter(item => company_id.includes(item.ID));
    
    console.log(this.CompanyData);
      this.selectedRows = company_id; // This will auto-check rows in the grid

    console.log('Preselected Companies:', this.selectedRows);
    this.isAddFormPopupOpened =false

  })
}
  // Triggered when the dropdown is opened
  onDropdownOpened() {
    this.isDropdownOpen = true; // Mark dropdown as open
  }
    // Triggered when the dropdown is closed
  onDropdownClosed() {
    this.isDropdownOpen = false; // Mark dropdown as closed
  }



  
  onTimeFormatChange(event:any){
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
    const selectedFormat = this.dateFormat.find(format => format.DESCRIPTION === event.value)?.DESCRIPTION;
    if (selectedFormat) {
      this.newUserData.Date_Format = event.value; // Ensure the correct value is set
      this.exampleDateFormat = this.getFormattedDate(selectedFormat); // Generate the example format
    } else {
      this.exampleDateFormat = '';
    }
  }

  onSelectionChanged(e: any) {
  this.selectedRows = e.selectedRowKeys;
  console.log('User selected:', this.selectedRows);
}

  //   // Method to handle tab click and set selected index
  // onTabClick(event: any) {
  //   console.log(event);
  //   this.selectedIndex = event.itemIndex;
  // }

    WhatsappValidate = (e: any): boolean => {
    const whatsappNumber = e.value;

    // Remove all non-digit characters
    const sanitizedNumber = whatsappNumber.replace(/\D/g, '');

    // Check if the sanitized number has at least 10 digits
    if (sanitizedNumber.length >= 10) {
      return true; // Valid
    }
    return false; // Invalid
  };

    autoBindWhatsapp() {
    console.log('WhatsApp field focused.');
    setTimeout(() => {
      if (!this.newUserData.Whatsapp && this.newUserData.Mobile) {
        console.log(
          'Populating WhatsApp with Mobile:',
          this.newUserData.Mobile
        );
        this.newUserData.Whatsapp = this.newUserData.Mobile;
      }
    }, 0);
  }

   validateWhatsapp(event: any) {
    const target = event.target as HTMLInputElement;

    // Allow only input that starts with '+' and contains only digits
    const sanitizedValue = target.value.replace(/[^0-9+]/g, '');

    // Ensure the '+' is only at the start
    if (sanitizedValue.indexOf('+') > 0) {
      target.value = '+' + sanitizedValue.replace(/\+/g, '');
    } else {
      target.value = sanitizedValue;
    }

    // Update the WhatsApp property with the sanitized value
    this.newUserData.Whatsapp = target.value;
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
      (user) => user.Email.toLowerCase() === email.toLowerCase()
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
  const loginName = e.value?.trim();

  if (!Array.isArray(this.userList)) {
    console.warn('userList is not loaded yet');
    e.valid = true; // allow validation to pass, or set false to block
    return true;
  }

  const exists = this.userList.some((user) => user.LoginName === loginName);

  // Return true if it does NOT exist, false if it DOES exist
  e.valid = !exists;
  return e.valid;
};


  onLoginNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Remove spaces from the current value and sanitize it
    const sanitizedValue = target.value
      .replace(/\s/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    // Check if the first character is an alphabet
    if (sanitizedValue.length > 0 && /^[a-zA-Z]/.test(sanitizedValue[0])) {
      // Update the target value and the LoginName property
      target.value = sanitizedValue;
      this.newUserData.LoginName = sanitizedValue; // Update the login name value

      // Validate the login name directly
      this.checkLoginNameExists({ value: sanitizedValue });
    } else {
      // If the first character is not an alphabet, reset the input
      target.value = ''; // Optionally clear the input
      this.newUserData.LoginName = ''; // Reset the login name value
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

    // Get the input value and allow only '+' at the start and digits after that
    let newValue = target.value.replace(/[^0-9+]/g, '');

    // Ensure the input starts with '+' and not '0'
    if (!newValue.startsWith('+')) {
      newValue = '+' + newValue;
    }

    // Remove any leading '0' after '+'
    newValue = newValue.replace(/\+0/g, '+');

    // Set the cleaned value back to the input
    target.value = newValue;

    // Find the selected country code
    const selectedCountry = this.countryCodes.find(
      (code) => code.data.dial_code === this.newUserData.countryCode
    );

    if (selectedCountry) {
      const dialCode = selectedCountry.data.dial_code;

      // If the user tries to backspace to remove the dial code, reset the input
      if (!newValue.startsWith(dialCode)) {
        this.newUserData.Mobile = dialCode; // Reset mobile number to only show dial code
        return;
      }

      // Extract the mobile number part
      const mobileNumberPart = newValue.replace(dialCode, '').trim();
      const validMobileNumber = this.validateMobileNumber(mobileNumberPart);

      // Update the mobile field, keeping the dial code intact
      this.newUserData.Mobile = `${dialCode} ${validMobileNumber}`;
    }
  }

    validateMobileNumber(mobileNumber: string): string {
    // Remove any non-digit characters
    const digitsOnly = mobileNumber.replace(/\D/g, '');

    // Ensure the number does not start with zero and return valid number or empty string if invalid
    return digitsOnly.startsWith('0') ? '' : digitsOnly;
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
        numbers.charAt(Math.floor(Math.random() * numbers.length))
      );
    }
    if (this.securityPolicyData.UppercaseCharacters) {
      characters.push(upperCase);
      requiredCharacters.push(
        upperCase.charAt(Math.floor(Math.random() * upperCase.length))
      );
    }
    if (this.securityPolicyData.LowercaseCharacters) {
      characters.push(lowerCase);
      requiredCharacters.push(
        lowerCase.charAt(Math.floor(Math.random() * lowerCase.length))
      );
    }
    if (this.securityPolicyData.SpecialCharacters) {
      characters.push(specialChars);
      requiredCharacters.push(
        specialChars.charAt(Math.floor(Math.random() * specialChars.length))
      );
    }

    // Ensure there are character sets to choose from
    if (characters.length === 0) {
      throw new Error(
        'No character sets selected based on the security policy.'
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


  updateMobileNumber() {
    // Find the selected country code
    const selectedCountry = this.countryCodes.find(
      (code) => code.data.dial_code === this.newUserData.countryCode
    );

    if (selectedCountry) {
      const dialCode = selectedCountry.data.dial_code; // Extract country code

      // Extract and validate the mobile number part
      const mobileNumber = this.getOnlyMobileNumber(this.newUserData.Mobile);
      const validMobileNumber = this.validateMobileNumber(mobileNumber);

      // Update the mobile field with valid country code and mobile number
      this.newUserData.Mobile = `${dialCode} ${validMobileNumber}`;

      console.log('Updated Mobile:', this.newUserData.Mobile); // For debugging
    }
  }

    getOnlyMobileNumber(fullPhoneNumber: string): string {
    // Extract mobile number by removing the dial code part
    const selectedCountry = this.countryCodes.find((code) =>
      fullPhoneNumber.startsWith(code.data.dial_code)
    );

    if (selectedCountry) {
      return fullPhoneNumber.replace(selectedCountry.data.dial_code, '').trim();
    }

    return fullPhoneNumber; // Return as is if no match found
  }



   copyToClipboard(): void {
    if (!navigator.clipboard) {
      console.warn(
        'Clipboard API not available. Make sure you are running the application over HTTPS.'
      );
      // Optionally show a user-friendly message or fallback logic
      this.tooltipVisible = false;
      return;
    }

    navigator.clipboard
      .writeText(this.generatedPassword)
      .then(() => {
        this.tooltipVisible = true;
        console.log('Password copied to clipboard');
      })
      .catch((err) => {
        console.error('Error copying password to clipboard', err);
        // You can show an error message to the user here
      });
  }

  
  user_role_dropdown(){

    this.dataservice.get_userLevels_Dropdown_Api().subscribe((res:any)=>{
      console.log(res,'==========datedrp=======');
      this.userRole=res
    })
  }

  getNewUserData = () => ({ 
    ...this.newUserData,
    COMPANY_ID: this.selectedRows
   });
  
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
    DxListModule
  ],
  providers: [],
  declarations: [UserNewFormComponent],
  exports: [UserNewFormComponent],
})
export class UserNewFormModule {}
