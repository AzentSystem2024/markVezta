import { Component, NgModule, enableProdMode, OnInit } from '@angular/core';
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
  CountryDropdownData: any;
  VATRuleDropdownData: any[] = [];
  Warehouse: any[] = [];
  selectedWarehouseId: any[] = [];
   WarehouseId: any;
   DeliveryAddressId:any
   DeliveryAddress:any[]=[];
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
  Address1Value :any;
  MobileValue:any;
  locationValue:any;
  phoneValue:any;
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
    CREDIT_LIMIT: '',
    CURRENT_CREDIT: '',
    PAY_TERM_ID: '',
    NOTES: '',
    PRICE_CLASS_ID: '',
    DISCOUNT_PERCENT: '',
    CUST_VAT_RULE_ID: '',
    VAT_REGNO: '',
    CUSTOMER_TYPE: 0,
    WAREHOUSE_ID:'',
    CUST_TYPE: 0,
  
    DEALER_TYPE: 0,
    DEALER_ID: 0,
    DeliveryAddresses: [
  ]

  };
  // selected_Company_id: any;
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
  ];
  isDealerVisible: boolean;
  deliveryAddress1: any;
  deliveryAddress2: any;
  deliveryAddress3: any;

  constructor(private service: DataService, authservice: AuthService) {
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    console.log(
      this.countryCode,
      '===========================country Code============'
    );
    this.sesstion_Details();
    this.sessionData_tax();
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
      DELIVERY_ADDRESS: deliveryAddressArray,
    };
  };

  // addDeliveryAddress(address: string) {
  //   if (address && address.trim() !== '') {
  //     this.formCustomerData.DELIVERY_ADDRESS.push({
  //       DELIVERY_ADDRESS: address,
  //     });
  //   }
  // }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.DEFAULT_COUNTRY_CODE = this.sessionData.GeneralSettings.DEFAULT_COUNTRY_CODE;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
  }

  showCountry() {
    this.service.getCountryDataAPi().subscribe((response) => {
      this.CountryDropdownData = response;
      console.log(this.CountryDropdownData);
    });
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
    this.service.get_DeliveryAddress_Dropdown_Api().subscribe((response: any) => {
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
      COUNTRY_ID: this.selecte_countyId,
    };
    this.service.getStateData_Api(payload).subscribe((data: any) => {
      this.StateDropdownData = data;
    });
    console.log(this.StateDropdownData, '========state data====');
    console.log(this.selecte_countyId, '======county id============');
  }
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
  onStateSelectionChanged(event: any) {}
  ngOnInit(): void {
    this.getDealerDropDown();
    this.getPaymentTerms();
    this.showCountry();
    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getPriceLevelDropDown();
    this.get_Warehouse_Dropdown_List();
    this.get_DeliveryAddress_Dropdown_List();
    this.sesstion_Details();
    console.log('selected company id', this.selected_Company_id);
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
    }


  savedAddresses: any[] = [];
  saveDeliveryAddress() {
  // Validate that at least one field is filled
  if (this.Address1Value || this.MobileValue || this.locationValue || this.phoneValue) {
    const newAddress = {
      ADDRESS1: this.Address1Value,
      MOBILE: this.MobileValue,
      LOCATION: this.locationValue,
      PHONE: this.phoneValue
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
    console.log(this.savedAddresses, 'Saved Addresses:');

    //  Optionally link with formCustomerData for payload
    this.formCustomerData.DeliveryAddresses = [...this.savedAddresses];
    console.log(this.formCustomerData, 'Updated formCustomerData payload');

    //  Clear the input fields
    this.Address1Value = '';
    this.MobileValue = '';
    this.locationValue = '';
    this.phoneValue = '';
  }
}

// saveDeliveryAddress() {
//   if (
//     this.newCustomer.DeliveryAddresses[0].ADDRESS1 ||
//     this.newCustomer.DeliveryAddresses[0].ADDRESS2 ||
//     this.newCustomer.DeliveryAddresses[0].LOCATION ||
//     this.newCustomer.DeliveryAddresses[0].PHONE
//   ) {
//     const newAddress = {
//       ADDRESS1: this.newCustomer.DeliveryAddresses[0].ADDRESS1,
//       MOBILE: this.newCustomer.DeliveryAddresses[0].MOBILE,
//       LOCATION: this.newCustomer.DeliveryAddresses[0].LOCATION,
//       PHONE: this.newCustomer.DeliveryAddresses[0].PHONE
//     };

//     this.savedAddresses.push(newAddress);
//   console.log(this.savedAddresses, 'Saved Addresses:');
  
//     // Optional: clear form after saving
//     this.newCustomer.DeliveryAddresses[0].ADDRESS1 = '';
//     this.newCustomer.DeliveryAddresses[0].MOBILE = '';
//     this.newCustomer.DeliveryAddresses[0].LOCATION = '';
//     this.newCustomer.DeliveryAddresses[0].PHONE = '';
//   }
// }



removeAddress(index: number) {
  const result = confirm(
    "Are you sure you want to delete this address?",
    "Confirm Deletion"
  );

  result.then((dialogResult) => {
    if (dialogResult) {
      this.savedAddresses.splice(index, 1);
    }
  });
}


editAddress(i: number) {
  const addr = this.savedAddresses[i];

  // Fill form fields
  this.Address1Value = addr.ADDRESS1;
  this.MobileValue = addr.MOBILE;
  this.locationValue = addr.LOCATION;
  this.phoneValue = addr.PHONE;

  // ✅ Remember which card is being edited
  this.editingIndex = i;
}


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
