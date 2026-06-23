import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  ViewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
  DxDataGridComponent,
  DxRadioGroupModule,
  DxValidationGroupComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxValidationGroupModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss'],
})
export class SupplierFormComponent implements OnInit {
  @ViewChild(DxValidationGroupComponent)
  validationGroup: DxValidationGroupComponent | undefined;

  @ViewChild('landedCostGrid', { static: false })
  landedCostGrid!: DxDataGridComponent; // reference to dx-data-grid

  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  SupplierCategory: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: any;
  DEFAULT_COUNTRY_CODE: any;
  sessionData: any;
  stateLabel: any;
  Country: any[] = [];
  State: any[] = [];
  selected_Company_id: number;
  selectedStateId: any[] = [];
  StateId: any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp: { SUPP_ID: number }[] = [];
  selecte_countyId: any;
  formSupplierData = {
    COMPANY_ID: 0,
    HQID: 1,
    SUPP_CODE: '',
    SUPP_NAME: '',
    CONTACT_NAME: '',
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP: '',
    STATE_ID: null,
    CITY: '',
    COUNTRY_ID: null,
    PHONE: '',
    EMAIL: '',
    IS_INACTIVE: 0,
    MOBILE_NO: '',
    NOTES: '',
    FAX_NO: '',
    VAT_REGNO: '',
    CURRENCY_ID: '',
    PAY_TERM_ID: '',
    VAT_RULE_ID: '',
    SUPP_CAT_ID: 0,
    PURCH_TYPE: 0,
    IS_COMPANY_BRANCH: false,
    // Supplier_cost:''
    Supplier_cost: [] as { COST_ID: number; SUPP_ID: number }[],
  };
  landedcost: any[] = [];
  costFactors: any[] = [];
  CountryId: any;
  PaymentTerms: any;
  PaymentId: any;
  Supplier_mobile: any;
  mobile_limit: any;

  countryCodePhone: any;
  PhoneNumber: any;
  countryCodes: any;
  purchaseTypeOptions = [
    { text: 'Local Purchase', value: 1 },
    { text: 'Interstate Purchase', value: 2 },
  ];
  Phone_limit: any;

  constructor(
    private service: DataService,
    authservice: AuthService,
  ) {
    this.stateLabel = authservice.getsettingsData().STATE_LABEL;
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;

    this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
    this.sesstion_Details();
    this.sessionData_tax();
    service.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
    });
  }
  newSupplier = this.formSupplierData;

  getNewSupplierData = () => ({
    ...this.newSupplier,
    MOBILE_NO: this.countryCode + '-' + this.Supplier_mobile,
    PHONE: this.countryCodePhone + '-' + this.PhoneNumber,
    IS_DEFAULT_CURRENCY: this.isCurrencyAccepted,
  });

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
    if (checked) {
      // Clear selection when disabled
      this.formSupplierData.Supplier_cost = [];

      if (this.landedCostGrid) {
        this.landedCostGrid.instance.clearSelection();
      }
    }
  }

  private loadDropdownData(): void {
    const payload = {
      NAME: 'LANDED_COST',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((data) => {
      this.landedcost = data;
    });
  }

  // in SupplierFormComponent (Add/Edit form)
  resetPartialForm() {
    this.newSupplier = {
      ...this.newSupplier,
      ADDRESS2: '',
      ADDRESS3: '',
      NOTES: '',
      PHONE: '',
      FAX_NO: '',
      VAT_RULE_ID: this.newSupplier.VAT_RULE_ID,
      SUPP_CAT_ID: 0,
    };

    this.newSupplier.ADDRESS2 = '';
    this.newSupplier.ADDRESS3 = '';
    this.newSupplier.NOTES = '';
    this.newSupplier.PHONE = '';
    // Clear Supplier_cost
    this.formSupplierData.Supplier_cost = [];

    if (this.landedCostGrid) {
      this.landedCostGrid.instance.clearSelection();
    }
  }

  onSelectionChanged(event: any): void {
    // Extract selected rows from the event
    const selectedRows = event.selectedRowsData;

    // Map the selected rows to only include the COST_IDs
    this.formSupplierData.Supplier_cost = selectedRows.map((row: any) => {
      return { COST_ID: row.ID, SUPP_ID: 0 };
    });

    // Debug log to verify the binding
  }

  get_Country_Dropdown_List() {
    this.service.getCountryWithFlags().subscribe((response: any) => {
      this.CountryDropdownData = response;
    });
  }

  get_PaymentTerms_Dropdown_List() {
    this.service.PaymentTerms_Dropdown_Api().subscribe((response: any) => {
      this.PaymentTerms = response;
    });
  }

  get_State_Dropdown_List() {
    const CountryId = this.formSupplierData?.COUNTRY_ID;
    this.service
      .get_State_Dropdown_Api('STATE_NAME', CountryId)
      .subscribe((response: any) => {
        this.State = response;
      });
  }

  //   showCountry(){
  //     this.service.getCountryData().subscribe(
  //      (response)=>{
  //            this.CountryDropdownData=response;
  //      }
  //     )
  //  }
  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };

    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      if (!this.newSupplier.VAT_RULE_ID) {
        const defaultValue = data.find(
          (x: any) => x.DESCRIPTION === 'TAX Applicable',
        );

        if (defaultValue) {
          this.newSupplier.VAT_RULE_ID = defaultValue.ID;
        }
      }
    });
  }

  getSuppliercategoryDropDown() {
    const payload = {
      NAME: 'SUPPLIER_CATEGORY',
      // COMPANY_ID: this.selected_Company_id,
    };

    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.SupplierCategory = data;
    });
  }

  getPaymentTerms() {
    this.service.getPaymentTermsData().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }
  getCurrency() {
    this.service.getCurrencyData().subscribe((response) => {
      this.CurrencyDropdownData = response;
    });
  }

  getCurrency_Dropdown() {
    this.service.getCurrencyDropdown().subscribe((response) => {
      this.CurrencyDropdownData = response;
    });
  }

  getStateDropDown() {
    this.service.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
    });
  }
  onCountrySelectionChanged(event: any) {
    this.selecte_countyId = event.value;
    this.CountryId = event.value;

    this.get_State_Dropdown_List();

    const selectedCountry = this.CountryDropdownData.find(
      (country: any) => country.ID === this.selecte_countyId,
    );
    // 4️ If found, set code & name
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE; // e.g., '+971'
      this.DEFAULT_COUNTRY_CODE = this.countryCode; // bind to textbox
      this.countryCodePhone = selectedCountry.CODE;
    } else {
      // 5️ Fallback if no country found
      this.countryCode = '';
      this.DEFAULT_COUNTRY_CODE = '';
      this.countryCodePhone = '';
      console.warn(' No matching country found for ID:', this.selecte_countyId);
    }
  }

  onPayTermSelectionChanged(event: any) {
    this.PaymentId = event.value;
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    this.StateId = event.value;
    this.get_State_Dropdown_List();
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.getPaymentTerms();
    //  this.showCountry();
    this.getVATRuleDropDown();
    this.getSuppliercategoryDropDown();
    this.getStateDropDown();
    this.getCurrency();
    this.getCurrency_Dropdown();

    // this.newSupplier.VAT_RULE_ID = '1';
    console.log(
      this.newSupplier.VAT_RULE_ID,
      '===========vat rule id============',
    );
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

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    // this.selected_vat_id=this.sessionData.VAT_ID
    this.DEFAULT_COUNTRY_CODE = this.sessionData.DEFAULT_COUNTRY_CODE;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.DEFAULT_COUNTRY_CODE =
      sessionData.GeneralSettings.DEFAULT_COUNTRY_CODE;

    // this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    const sessionYear = sessionData.FINANCIAL_YEARS;
    //  this.financialYeaDate=sessionYear[0].DATE_FROM
    // this.formatted_from_date=this.financialYeaDate
  }
  onCountrycodeChange(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }
  onCountrycodeChangePhone(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.Phone_limit = Number(res.Data[0].MOBILE_DIGITS);
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
}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxRadioGroupModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxDataGridModule,
  ],
  declarations: [SupplierFormComponent],
  exports: [SupplierFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierFormModule {}
