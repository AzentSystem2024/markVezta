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
  Warehouse: any[] = [];
  selectedWarehouseId: any[] = [];
   WarehouseId: any;
   DeliveryAddressId:any
   DeliveryAddress:any[]=[];
selected_fin_id: any;
  sessionData: any;
  selected_vat_id: any;
  selected_Company_id: any = null; // or ''
  dob: string | number | Date = new Date();
   Address1Value :any;
  MobileValue:any;
  locationValue:any;
  phoneValue:any;
  editingIndex: number | null = null;


  formCustomerData = {
    WAREHOUSE_ID:'',
    DELIVERY_ADDRESS_ID:'',
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
      DeliveryAddresses: [
  ]
  };

  DEFAULT_COUNTRY_CODE: any;
selectedTabIndex = 0;
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

     // ✅ Handle DeliveryAddresses (array of detailed addresses)
    if (this.formCustomerData.DeliveryAddresses?.length > 0) {
      const firstAddress = this.formCustomerData.DeliveryAddresses[0];

      // Fill form input values
      this.Address1Value = firstAddress.ADDRESS1 || '';
      this.MobileValue = firstAddress.MOBILE || '';
      this.locationValue = firstAddress.LOCATION || '';
      this.phoneValue = firstAddress.PHONE || '';

      // ✅ Populate savedAddresses array to show cards
      this.savedAddresses = [...this.formCustomerData.DeliveryAddresses];
    } else {
      // Reset all when no data found
      this.Address1Value = '';
      this.MobileValue = '';
      this.locationValue = '';
      this.phoneValue = '';
      this.savedAddresses = [];
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
    this.DEFAULT_COUNTRY_CODE = this.sessionData.GeneralSettings.DEFAULT_COUNTRY_CODE;
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
    this.get_Warehouse_Dropdown_List();
    this.get_DeliveryAddress_Dropdown_List();
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
  
removeAddress(index: number) {
  const result = confirm(
    "Are you sure you want to delete this address?",
    "Confirm Deletion"
  );

  result.then((dialogResult) => {
    if (dialogResult) {
      // ✅ Remove from UI list
      this.savedAddresses.splice(index, 1);

      // ✅ Sync payload with updated list
      this.formCustomerData.DeliveryAddresses = [...this.savedAddresses];

      // ✅ Optional: reset edit mode if currently editing
      if (this.editingIndex === index) {
        // this.resetPartialForm();
        this.editingIndex = null;
      }
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
    DxButtonModule,
    DxRadioGroupModule,
    DxTabPanelModule,
    DxButtonModule,
  ],
  declarations: [CustomerEditFormComponent],
  exports: [CustomerEditFormComponent],
})
export class CustomerEditFormModule {}
