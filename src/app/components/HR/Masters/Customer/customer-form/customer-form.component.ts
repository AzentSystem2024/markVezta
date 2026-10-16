import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../../../utils/form-textbox/form-textbox.component';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDropDownBoxModule,
  DxListModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxTabPanelModule,
  DxValidationGroupModule,
  DxValidatorComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxComponent, DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { AuthService, DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';
import { isValidPhoneNumber } from 'libphonenumber-js';
@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent {

  @ViewChild('mobileBoxRef', { static: false }) mobileBoxRef: any;
  @ViewChild('mobileValidator', { static: false })
  mobileValidator!: DxValidatorComponent;
  @ViewChild('phoneValidator', { static: false })
  phoneValidator!: DxValidatorComponent;
  @ViewChild('mobileBox', { static: false }) mobileBox!: DxTextBoxComponent;
  @ViewChild('phoneBox', { static: false }) phoneBox!: DxTextBoxComponent;
  @ViewChild('deliveryMobileValidator', { static: false })
  deliveryMobileValidator!: DxValidatorComponent;
  @ViewChild('deliveryMobileBox', { static: false })
  deliveryMobileBox!: DxTextBoxComponent;
  CountryDropdownData: any;
  VATRuleDropdownData: any[] = [];
  Warehouse: any[] = [];
  selectedWarehouseId: any[] = [];
  WarehouseId: any;
  DeliveryAddressId: any;
  DeliveryAddress: any[] = [];
  PaymentTermsDropdownData: any;
  PriceLevelDropdownData: any[] = [];
  StateDropdownData: any[] = [];

  isCurrencyAccepted: boolean = true;
  selecte_countyId: any;
  selected_Company_id: any = null; // or ''
  // dob=new Date();
  dob: string | number | Date = new Date();
  isSubDealerPopupVisible: boolean = false;
  dealerList: any;
  selectedTabIndex = 0;
  Address1Value: any;
  MobileValue: any;
  locationValue: any;
  phoneValue: any;
  editingIndex: number | null = null;

  formCustomerData = {
    COMPANY_ID: this.selected_Company_id,
    CUST_CODE: '',
    FIRST_NAME: '',
    LAST_NAME: '',
    DOB: this.dob,
    NATIONALITY: '',
    CONTACT_NAME: '',
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP: '',
    STATE_ID: '',
    CITY: '',
    COUNTRY_ID: '',
    PHONE: '',
    EMAIL: '',
    MOBILE_NO: '',
    FAX_NO: '',
    CREDIT_LIMIT: 0,
    CURRENT_CREDIT: 0.0,
    PAY_TERM_ID: 0,
    NOTES: '',
    PRICE_CLASS_ID: 0,
    DISCOUNT_PERCENT: 0,
    CUST_VAT_RULE_ID: 0,
    VAT_REGNO: '',
    CUSTOMER_TYPE: 0,
    WAREHOUSE_ID: 0,
    CUST_TYPE: 0,
    DEALER_TYPE: 0,
    DEALER_ID: 0,
    DISTRICT_ID: 0,
    SALESMAN_ID: 0,
    DeliveryAddresses: [] as any[],
  };

  selected_fin_id: any;
  sessionData: any;
  selected_vat_id: any;
  DEFAULT_COUNTRY_CODE: any;
  customerTypeOptions = [
    { text: 'Unit of Company', value: 1 },
    { text: 'Outside Customer', value: 2 },
  ];

  dealerTypeOptions = [
    { text: 'Dealer', value: 1 },
    { text: 'Sub-Dealer', value: 2 },
    { text: 'CompanyBranch', value: 3 },
  ];
  isDealerVisible: boolean = false;
  deliveryAddress1: any;
  deliveryAddress2: any;
  deliveryAddress3: any;
  mobileNumber: any;

  countryCodes: any;
  mobile_limit: any;
  MobilecountryCode: any;

  Phone_limit: number | undefined;
  mobile_limit_Delivery_Address: number | undefined;
  Salesman: any;
  selected_stateId: any;
  districtData: any;

  countryCode: string = '+91';
  phoneCountryCode: string = '+91';
  PhonenumberCode: string = '+91';
  isCountryDropdownOpen = false;
  isPhoneDropdownOpen = false;
  countryCodeDeliveryaddress: string = '+91';
  isDeliveryCountryDropdownOpen = false;
  CountryDropdownDataList: any = [];

  constructor(
    private service: DataService,
    authservice: AuthService,
  ) {
    this.sesstion_Details();

    const codes = CountryList.getAll();
    this.countryCodes = codes.map((country: any) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`,
      display: `${country.dial_code}`,
    }));

    this.sessionData_tax();
    this.getStateDropDown();
  }


  ngOnInit(): void {
    this.getDealerDropDown();
    this.getPaymentTerms();
    this.showCountry();
    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getSalesmanDropDown();
    this.getPriceLevelDropDown();
    this.get_Warehouse_Dropdown_List();
    this.get_DeliveryAddress_Dropdown_List();
    this.sesstion_Details();
  }

  onCountrycodeChange(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }

  validateEmail = (e: any): boolean => {
    const value = (e.value || '').trim();

    // Empty → valid (not mandatory)
    if (!value) return true;

    // Validate only if user entered something
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };


  onCountrycodeChangeDeliveryAddress(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit_Delivery_Address = Number(res.Data[0].MOBILE_DIGITS);
    });
    setTimeout(() => {
      this.mobileBoxRef?.instance?.validate();
    });
  }
  newCustomer = this.formCustomerData;

  // getNewCustomerData = () => ({ ...this.newCustomer });
  getNewCustomerData = () => {
    // Create delivery address array from entered textboxes
    const deliveryAddressArray = [];

    if (this.deliveryAddress1?.trim()) {
      deliveryAddressArray.push({ DELIVERY_ADDRESS: this.deliveryAddress1 });
    }
    if (this.deliveryAddress2?.trim()) {
      deliveryAddressArray.push({ DELIVERY_ADDRESS: this.deliveryAddress2 });
    }
    if (this.deliveryAddress3?.trim()) {
      deliveryAddressArray.push({ DELIVERY_ADDRESS: this.deliveryAddress3 });
    }

    // Return the full customer data with the delivery address array included
    return {
      ...this.newCustomer,
      DeliveryAddresses: this.savedAddresses,
      MOBILE_NO: this.countryCode + '-' + this.mobileNumber,
      PHONE: this.PhonenumberCode + '-' + this.newCustomer.PHONE,

      // DELIVERY_ADDRESS: deliveryAddressArray,
    };
  };

  showCountry() {
    console.log('======================================;;;;;;;;;');
    this.service.getCountryDataAPi().subscribe((response) => {
      this.CountryDropdownDataList = response;
      console;
    });
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.DEFAULT_COUNTRY_CODE =
      sessionData.GeneralSettings.DEFAULT_COUNTRY_CODE;
  }

  onDealerTypeChange(e: any) {
    if (e.value === 2) {
      // 2 = Sub Dealer
      this.isDealerVisible = true; // show dropdown
      this.getDealerDropDown(); // fetch dealers dynamically
    } else {
      this.isDealerVisible = false; // hide dropdown
      this.formCustomerData.DEALER_ID = null; // reset selection
    }
  }

  onDealerSelected(e: any) {
    const selectedDealer = e.selectedRowsData[0];
    if (selectedDealer) {
      this.formCustomerData.DEALER_ID = selectedDealer.ID;
      this.isSubDealerPopupVisible = false;
    }
  }

  getDealerDropDown() {
    const payload = {
      NAME: 'DEALER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((response: any) => {
      this.dealerList = response;
    });
  }
  getPriceLevelDropDown() {
    const payload = {
      NAME: 'PRICECLASS',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.PriceLevelDropdownData = data;
    });
  }
  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getPaymentTerms() {
    this.service.getpayment_term_Api().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }

  get_Warehouse_Dropdown_List() {
    this.service.get_Warehouse_Dropdown_Api().subscribe((response: any) => {
      this.Warehouse = response;
    });
  }
  onWarehouseValue(event: any) {
    this.selectedWarehouseId = event.value;
    this.WarehouseId = event.value;
    this.get_Warehouse_Dropdown_List();
  }

  get_DeliveryAddress_Dropdown_List() {
    this.service
      .get_DeliveryAddress_Dropdown_Api()
      .subscribe((response: any) => {
        this.DeliveryAddress = response;
      });
  }
  onDeliveryAddressValue(event: any) {
    this.DeliveryAddressId = event.value;
    this.get_DeliveryAddress_Dropdown_List();
  }
  getStateDropDown() {
    const id = this.selecte_countyId;
    const payload = {
      NAME: 'STATE_NAME',
      COMPANY_ID: this.selected_Company_id,
      COUNTRY_ID: this.selecte_countyId,
    };
    this.service.getStateData_Api(payload).subscribe((data: any) => {
      this.StateDropdownData = data;
    });
  }

  getDistrictDropDown() {
    const id = this.selected_stateId;
    const payload = {
      NAME: 'DISTRICT_NAME',
      STATE_ID: this.selected_stateId,
    };
    this.service.Common_Dropdown(payload).subscribe((data: any) => {
      this.districtData = data;
    });
  }

  getSalesmanDropDown() {
    const payload = {
      NAME: 'SALESMAN',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.Common_Dropdown(payload).subscribe((data: any) => {
      this.Salesman = data;
    });
  }


  onCountrySelectionChanged(event: any) {
    this.selecte_countyId = event.value;
    console.log(this.selecte_countyId, 'COUNTRYID');
    this.getStateDropDown();

    const selectedCountry = this.CountryDropdownDataList.find(
      (c: any) => c.ID === event.value,
    );

    if (!selectedCountry) return;

    // match by name (IMPORTANT)
    const matchedCountry = this.countryCodes.find(
      (c: any) =>
        (c.name || c.COUNTRY_NAME || '')?.toLowerCase().trim() ===
        selectedCountry.DESCRIPTION?.toLowerCase().trim(),
    );

    if (matchedCountry) {
      const dialCode = matchedCountry.dial_code || matchedCountry.CODE;
      this.countryCode = dialCode;
      this.phoneCountryCode = dialCode;
      this.PhonenumberCode = dialCode;
      this.countryCodeDeliveryaddress = dialCode;
      this.revalidateMobile();
      this.revalidatePhone();
    } else {
      console.warn(
        'No matching country code found for:',
        selectedCountry.DESCRIPTION,
      );
    }
  }

  onStateSelectionChanged(event: any) {
    this.selected_stateId = event.value;
    this.getDistrictDropDown();
  }

  keyPressNumbers(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    var inputElement = event.target as HTMLInputElement;

    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else if (inputElement.value.length === 0 && charCode === 48) {
      // Check if first character is '0'
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  resetPartialForm() {
    this.newCustomer.ADDRESS2 = '';
    this.newCustomer.ADDRESS3 = '';
    this.Address1Value = '';
    this.MobileValue = '';
    this.locationValue = '';
    this.phoneValue = '';
    this.savedAddresses = [];
    if (this.formCustomerData) {
      this.formCustomerData.DEALER_ID = null;
      this.formCustomerData.CUST_TYPE = 0;

      this.formCustomerData.DEALER_TYPE = 0;
    }
  }

  savedAddresses: any[] = [];
  saveDeliveryAddress() {
    // Validate that at least one field is filled
    if (
      this.Address1Value ||
      this.MobileValue ||
      this.locationValue ||
      this.phoneValue
    ) {
      const newAddress = {
        ADDRESS1: this.Address1Value,
        MOBILE: this.countryCodeDeliveryaddress + '-' + this.MobileValue,
        LOCATION: this.locationValue,
        PHONE: this.phoneValue,
      };

      if (this.editingIndex !== null && this.editingIndex >= 0) {
        // ✅ Update existing card (do not push)
        this.savedAddresses[this.editingIndex] = { ...newAddress };
        this.editingIndex = null; // Exit edit mode
      } else {
        // ✅ Add as a new card
        //  Push into savedAddresses array
        this.savedAddresses.push(newAddress);
      }

      //  Optionally link with formCustomerData for payload
      this.formCustomerData.DeliveryAddresses = [...this.savedAddresses];

      //  Clear the input fields
      this.Address1Value = '';
      this.MobileValue = '';
      this.locationValue = '';
      this.phoneValue = '';
      this.countryCodeDeliveryaddress = '';
    }
  }

  removeAddress(index: number) {
    const result = confirm(
      'Are you sure you want to delete this address?',
      'Confirm Deletion',
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        this.savedAddresses.splice(index, 1);
      }
    });
  }

  editAddress(i: number) {
    const addr = this.savedAddresses[i];

    const [countryCodephone, phonenumber] = addr.MOBILE.split('-');

    // Fill form fields
    this.Address1Value = addr.ADDRESS1;
    this.MobileValue = phonenumber;
    this.countryCodeDeliveryaddress = countryCodephone;
    this.locationValue = addr.LOCATION;
    this.phoneValue = addr.PHONE;

    // ✅ Remember which card is being edited
    this.editingIndex = i;
  }

  private extractDialCode(event: any): string {
    if (!event) return '';
    if (typeof event === 'string') return event;
    if (typeof event.value === 'string') return event.value;
    if (typeof event.value?.dial_code === 'string')
      return event.value.dial_code;
    if (typeof event.value?.data?.dial_code === 'string')
      return event.value.data.dial_code;
    if (typeof event.itemData?.dial_code === 'string')
      return event.itemData.dial_code;
    if (typeof event.itemData?.data?.dial_code === 'string')
      return event.itemData.data.dial_code;
    if (typeof event.dial_code === 'string') return event.dial_code;
    if (typeof event.data?.dial_code === 'string') return event.data.dial_code;
    return '';
  }

  onDeliveryCountrySelected(event: any) {
    const dialCode = this.extractDialCode(event);

    if (dialCode) {
      if (
        this.countryCodeDeliveryaddress &&
        this.countryCodeDeliveryaddress !== dialCode
      ) {
        this.MobileValue = '';
        if (this.deliveryMobileBox?.instance) {
          this.deliveryMobileBox.instance.option('isValid', true);
        }
      }
      this.countryCodeDeliveryaddress = dialCode;
    }
    this.isDeliveryCountryDropdownOpen = false;
    this.revalidateDeliveryMobile();
  }

  revalidateDeliveryMobile() {
    setTimeout(() => {
      const val = this.MobileValue || '';
      if (val) {
        const isValid = this.DeliveryMobileValidate({ value: val });
        if (this.deliveryMobileBox?.instance) {
          this.deliveryMobileBox.instance.option('isValid', isValid);
          if (!isValid) {
            this.deliveryMobileBox.instance.option('validationError', {
              message: 'Invalid mobile number',
            });
          }
        }
      } else if (this.deliveryMobileBox?.instance) {
        this.deliveryMobileBox.instance.option('isValid', true);
      }
      this.deliveryMobileValidator?.instance?.validate();
    }, 0);
  }

  DeliveryMobileValidate = (e: any): boolean => {
    return this.validateDeliveryMobile(e);
  };

  validateDeliveryMobile(e: any): boolean {
    const dialCode = (this.countryCodeDeliveryaddress || '').trim();
    const mobileValue = e?.value ? e.value.toString().trim() : '';
    const mobileNum = mobileValue.replace(/\D/g, '');
    if (!mobileNum) return true;

    if (dialCode === '+971' || dialCode === '971') {
      return mobileNum.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + mobileNum);
    } catch {
      return false;
    }
  }

  onDeliveryMobileInputChange(event: any) {
    const target = (event.target ||
      (event.event && event.event.target)) as HTMLInputElement;
    if (!target) return;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.MobileValue = digits;
    this.revalidateDeliveryMobile();
  }

  onCountrySelected(event: any) {
    const dialCode = this.extractDialCode(event);

    if (dialCode) {
      if (this.countryCode && this.countryCode !== dialCode) {
        this.mobileNumber = '';
        if (this.mobileBox?.instance) {
          this.mobileBox.instance.option('isValid', true);
        }
      }
      this.countryCode = dialCode;
    }
    this.isCountryDropdownOpen = false;
    this.revalidateMobile();
  }

  onPhoneCountrySelected(event: any) {
    const dialCode = this.extractDialCode(event);

    if (dialCode) {
      if (this.phoneCountryCode && this.phoneCountryCode !== dialCode) {
        this.newCustomer.PHONE = '';
        if (this.phoneBox?.instance) {
          this.phoneBox.instance.option('isValid', true);
        }
      }
      this.phoneCountryCode = dialCode;
      this.PhonenumberCode = dialCode;
    }
    this.isPhoneDropdownOpen = false;
    this.revalidatePhone();
  }

  revalidateMobile() {
    setTimeout(() => {
      const val = this.mobileNumber || '';
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

  revalidatePhone() {
    setTimeout(() => {
      const val = this.newCustomer.PHONE || '';
      if (val) {
        const isValid = this.PhoneValidate({ value: val });
        if (this.phoneBox?.instance) {
          this.phoneBox.instance.option('isValid', isValid);
          if (!isValid) {
            this.phoneBox.instance.option('validationError', {
              message: 'Invalid phone number',
            });
          }
        }
      } else if (this.phoneBox?.instance) {
        this.phoneBox.instance.option('isValid', true);
      }
      this.phoneValidator?.instance?.validate();
    }, 0);
  }

  MobileValidate = (e: any): boolean => {
    const dialCode = (this.countryCode || '').trim();
    const mobileValue = e.value ? e.value.toString().trim() : '';
    const mobileNum = mobileValue.replace(/\D/g, '');
    if (!mobileNum) return true;

    if (dialCode === '+971' || dialCode === '971') {
      return mobileNum.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + mobileNum);
    } catch {
      return false;
    }
  };

  PhoneValidate = (e: any): boolean => {
    const dialCode = (
      this.phoneCountryCode ||
      this.PhonenumberCode ||
      ''
    ).trim();
    const phoneValue = e.value ? e.value.toString().trim() : '';
    const phoneNum = phoneValue.replace(/\D/g, '');
    if (!phoneNum) return true;

    if (dialCode === '+971' || dialCode === '971') {
      return phoneNum.length === 9;
    }

    try {
      return isValidPhoneNumber(dialCode + phoneNum);
    } catch {
      return false;
    }
  };

  onMobileInputChange(event: any) {
    const target = (event.target ||
      (event.event && event.event.target)) as HTMLInputElement;
    if (!target) return;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.mobileNumber = digits;
    this.revalidateMobile();
  }

  validatePhone(event: any) {
    const target = (event.target ||
      (event.event && event.event.target)) as HTMLInputElement;
    if (!target) return;
    let digits = target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    this.newCustomer.PHONE = digits;
    this.revalidatePhone();
  }

  onDropdownClosed() { }
  onDropdownOpened() { }
  updateMobileNumber() { }
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }

  onCountrycodeChangePhoneNocode(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.Phone_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  validateMobileLengthdeliveryaddress = (e: any): boolean => {
    const value = (e.value || '').trim();
    if (!value) return true;

    if (!this.mobile_limit_Delivery_Address) return false;

    return value.length === this.mobile_limit_Delivery_Address;
  };

  allowOnlyNumbers(e: any) {
    const value = e.event.target.value;
    e.event.target.value = value.replace(/\D/g, '');
  }

  validateMobileLength = (e: any): boolean => {
    const value = (e.value || '').trim();

    if (!this.mobile_limit) return false;

    return value.length === this.mobile_limit;
  };
  validatePhoneLength = (e: any): boolean => {
    const value = (e.value || '').trim();

    if (!this.Phone_limit) return false;

    return value.length === this.Phone_limit;
  };

}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxDataGridModule,
    DxDropDownBoxModule,
    DxListModule,
    DxTabPanelModule,
    DxButtonModule,
  ],
  declarations: [CustomerFormComponent],
  exports: [CustomerFormComponent],
})
export class CustomerFormModule { }
