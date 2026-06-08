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
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxTabPanelModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { AuthService, DataService } from 'src/app/services';
@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent {
  @ViewChild('mobileBoxRef', { static: false }) mobileBoxRef: any;
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
  countryCode: any;
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
  PhonenumberCode: any;
  countryCodes: any;
  mobile_limit: any;
  MobilecountryCode: any;
  countryCodeDeliveryaddress: any;
  Phone_limit: number | undefined;
  mobile_limit_Delivery_Address: number | undefined;

  constructor(
    private service: DataService,
    authservice: AuthService,
  ) {
    this.sesstion_Details();

    this.sessionData_tax();
    service.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
    });

    this.getStateDropDown();
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
    this.service.getCountryDataAPi().subscribe((response) => {
      this.CountryDropdownData = response;
      console.log(this.CountryDropdownData, 'CountryDropdownData');
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
  get_Country_Dropdown_List() {
    this.service.getCountryWithFlags().subscribe((response: any) => {
      this.CountryDropdownData = response;
    });
  }
  onCountrySelectionChanged(event: any) {
    this.selecte_countyId = event.value;
    this.getStateDropDown();
    const selectedCountry = this.CountryDropdownData.find(
      (country: any) => country.ID === this.selecte_countyId,
    );
  }

  onStateSelectionChanged(event: any) {}
  ngOnInit(): void {
    this.get_Country_Dropdown_List();
    this.getDealerDropDown();
    this.getPaymentTerms();
    this.showCountry();
    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getPriceLevelDropDown();
    this.get_Warehouse_Dropdown_List();
    this.get_DeliveryAddress_Dropdown_List();
    this.sesstion_Details();
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

  onDropdownClosed() {}
  onDropdownOpened() {}
  updateMobileNumber() {}
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}${item.COUNTRY_NAME}`;
  }
  onCountrycodeChangeDeliveryAddressmobile(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = res.Data[0].MOBILE_DIGITS;
    });
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
    DxTabPanelModule,
    DxButtonModule,
  ],
  declarations: [CustomerFormComponent],
  exports: [CustomerFormComponent],
})
export class CustomerFormModule {}
