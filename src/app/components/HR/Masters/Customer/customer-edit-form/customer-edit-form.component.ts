// import { Component } from '@angular/core';
import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../../../utils/form-textbox/form-textbox.component';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { AuthService, DataService } from 'src/app/services';
@Component({
  selector: 'app-customer-edit-form',
  templateUrl: './customer-edit-form.component.html',
  styleUrls: ['./customer-edit-form.component.scss'],
})
export class CustomerEditFormComponent {
  @Input() selectedCustomerData: any;
  @Output() ChangedCustomerData: any;
  @Output() updateCompleted = new EventEmitter<any>();
  CountryDropdownData: any;
  VATRuleDropdownData: any[] = [];
  PaymentTermsDropdownData: any;
  PriceLevelDropdownData: any[] = [];
  StateDropdownData: any;
  countryCode: any;
  isCurrencyAccepted: boolean = true;
  selecte_countyId: any;
  selected_fin_id: any;
  sessionData: any;
  selected_vat_id: any;
  selected_Company_id: any = null; // or ''
  dob: string | number | Date = new Date();
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
    CREDIT_LIMIT: '',
    CURRENT_CREDIT: '',
    PAY_TERM_ID: '',
    NOTES: '',
    PRICE_CLASS_ID: '',
    DISCOUNT_PERCENT: '',
    CUST_VAT_RULE_ID: '',
    VAT_REGNO: '',
    CUST_TYPE: 0,
    DELIVERY_ADDRESS: [],
    DEALER_TYPE: 0,
    DEALER_ID: 0,
  };

  DEFAULT_COUNTRY_CODE: any;

  //  newCustomer = this.formCustomerData;
  customerTypeOptions = [
    { text: 'Unit of Company', value: 1 },
    { text: 'Outside Customer', value: 2 },
  ];

  dealerTypeOptions = [
    { text: 'Dealer', value: 1 },
    { text: 'Sub-Dealer', value: 2 },
  ];
  isDealerVisible: boolean;
  deliveryAddress1: any;
  deliveryAddress2: any;
  deliveryAddress3: any;
  isSubDealerPopupVisible: boolean;
  dealerList: any;

  constructor(private service: DataService, authservice: AuthService) {
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    this.getStateDropDown();
    this.showCountry();
    this.sessionData_tax();
    this.selecte_countyId = this.formCustomerData.COUNTRY_ID;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedCustomerData'] &&
      changes['selectedCustomerData'].currentValue
    ) {
      this.formCustomerData = this.selectedCustomerData;

      console.log('Salary Head Data:', this.formCustomerData);

      this.selecte_countyId = this.formCustomerData.COUNTRY_ID;
      this.ChangedCustomerData = this.formCustomerData;
      if (this.formCustomerData.DELIVERY_ADDRESS?.length) {
        this.deliveryAddress1 =
          this.formCustomerData.DELIVERY_ADDRESS[0]?.DELIVERY_ADDRESS || '';
        this.deliveryAddress2 =
          this.formCustomerData.DELIVERY_ADDRESS[1]?.DELIVERY_ADDRESS || '';
        this.deliveryAddress3 =
          this.formCustomerData.DELIVERY_ADDRESS[2]?.DELIVERY_ADDRESS || '';
      } else {
        // In case no addresses exist yet
        this.deliveryAddress1 = '';
        this.deliveryAddress2 = '';
        this.deliveryAddress3 = '';
      }
      // ✅ Show dealer dropdown automatically if Dealer Type = 2
      if (this.formCustomerData.CUST_TYPE === 2) {
        if (this.formCustomerData.DEALER_TYPE === 2) {
          this.isDealerVisible = true;
          this.getDealerDropDown(); // fetch dealer list for dropdown
        } else {
          this.isDealerVisible = false;
        }
      } else {
        this.isDealerVisible = false;
      }
    }
  }

  addDeliveryAddress(address: string) {
    if (address && address.trim() !== '') {
      this.formCustomerData.DELIVERY_ADDRESS.push({
        DELIVERY_ADDRESS: address,
      });
    }
  }

  onDealerTypeChange(e: any) {
    console.log(e.value, 'Dealer Type Changed');

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
    this.service.getDropdownData('DEALER').subscribe((response: any) => {
      this.dealerList = response;
    });
  }
  // getNewCustomerData = () => ({ ...this.newCustomer });
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.DEFAULT_COUNTRY_CODE = this.sessionData.DEFAULT_COUNTRY_CODE;
  }
  showCountry() {
    this.service.getCountryDataAPi().subscribe((response) => {
      this.CountryDropdownData = response;
      console.log(this.CountryDropdownData);
    });
  }
  getPriceLevelDropDown() {
    const dropdownprice = 'PRICECLASS';
    this.service.getDropdownData(dropdownprice).subscribe((data: any) => {
      this.PriceLevelDropdownData = data;
    });
  }
  getVATRuleDropDown() {
    const dropdownvat = 'VATRULE';
    this.service.getDropdownData(dropdownvat).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getPaymentTerms() {
    this.service.getpayment_term_Api().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
      console.log('count', this.PaymentTermsDropdownData);
    });
  }

  getStateDropDown() {
    const id = this.selecte_countyId;
    const payload = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: this.selecte_countyId,
    };
    this.service.getStateData_Api(payload).subscribe((data: any) => {
      this.StateDropdownData = data;
    });
    console.log(this.StateDropdownData, '========state data====');
    console.log(this.selecte_countyId, '======county id============');
    // this.service.getStateData().subscribe((data: any) => {
    //   this.StateDropdownData = data;
    // });
  }
  onStateSelectionChanged(event: any) {}
  onCountrySelectionChanged(event: any) {
    console.log(event);
    this.selecte_countyId = event.value;
    console.log(this.selecte_countyId, '======county id============');
    this.getStateDropDown();
    const selectedCountry = this.CountryDropdownData.find(
      (country) => country.ID === event.value
    );
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE;
    }
  }

  ngOnInit(): void {
    this.getPaymentTerms();

    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getPriceLevelDropDown();
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

  UpdateData() {
    console.log('Update functionsssss calledd');

    console.log(this.selectedCustomerData);

    this.service
      .UpdateCustomerApi(this.selectedCustomerData)
      .subscribe((res: any) => {
        console.log(res);
        // this.updateCompleted.emit(res);
      });
  }
  closePopup() {}
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
    DxButtonModule,
    DxRadioGroupModule,
  ],
  declarations: [CustomerEditFormComponent],
  exports: [CustomerEditFormComponent],
})
export class CustomerEditFormModule {}
