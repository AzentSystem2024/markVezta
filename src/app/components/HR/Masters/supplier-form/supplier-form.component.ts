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
// import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
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
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-supplier-form',
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.scss'],
})
export class SupplierFormComponent implements OnInit {
  @ViewChild(DxValidationGroupComponent)
  validationGroup: DxValidationGroupComponent;
  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: any;
  stateLabel: any;
  Country: any[] = [];
  State: any[] = [];
  selectedStateId: any[] = [];
  StateId: any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp: { SUPP_ID: number }[] = [];
  formSupplierData = {
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
    Supplier_cost: '',
  };
  landedcost: any[] = [];
  costFactors: any[] = [];
  CountryId: any;
  PaymentTerms: any;
  PaymentId: any;

  constructor(private service: DataService, authservice: AuthService) {
    this.stateLabel = authservice.getsettingsData().STATE_LABEL;
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    // this.get_Country_Dropdown_List()
    // ;
    service.getCountryWithFlags().subscribe((data) => {
      this.CountryDropdownData = data;
      console.log(this.CountryDropdownData, 'COUNTRY;;;;;;;;;;');
    });

    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
  }
  newSupplier = this.formSupplierData;

  getNewSupplierData = () => ({ ...this.newSupplier });

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
  }

  private loadDropdownData(): void {
    this.service.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
      console.log(this.landedcost, 'LANDEDCOST');
    });
  }

  onSelectionChanged(event: any): void {
    // Extract selected rows from the event
    const selectedRows = event.selectedRowsData;

    // Map the selected rows to only include the COST_IDs
    this.formSupplierData.Supplier_cost = selectedRows.map((row: any) => {
      return { COST_ID: row.ID, SUPP_ID: 0 };
    });

    // Debug log to verify the binding
    console.log('Updated Supplier_cost:', this.formSupplierData.Supplier_cost);
  }

  // get_Country_Dropdown_List() {
  //   this.service.CountryDropdown_Api().subscribe((response: any) => {
  //     // console.log(response, 'response++++++++++');
  //     this.Country = response;
  //     console.log(this.Country,'Country dropdown')
  //   });
  // }

  get_PaymentTerms_Dropdown_List() {
    this.service.PaymentTerms_Dropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.PaymentTerms = response;
      console.log(this.PaymentTerms, 'Country dropdown');
    });
  }

  get_State_Dropdown_List() {
    // console.log('function working');
    const CountryId = this.formSupplierData?.COUNTRY_ID;
    this.service
      .get_State_Dropdown_Api('STATE_NAME', this.CountryId)
      .subscribe((response: any) => {
        console.log(response, 'response++++++++++');
        this.State = response;
      });
  }

  showCountry() {
    this.service.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
      console.log('count', this.CountryDropdownData);
    });
  }
  getVATRuleDropDown() {
    const dropdownvat = 'VATRULE';
    this.service.getDropdownData(dropdownvat).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdown', this.VATRuleDropdownData);
    });
  }
  getPaymentTerms() {
    this.service.getPaymentTermsData().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
      console.log(
        'count==================================',
        this.PaymentTermsDropdownData
      );
    });
  }
  getCurrency() {
    this.service.getCurrencyData().subscribe((response) => {
      this.CurrencyDropdownData = response;
      console.log('count', this.CurrencyDropdownData);
    });
  }

  getStateDropDown() {
    this.service.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
      console.log('dropdown', this.StateDropdownData);
    });
  }
  onCountrySelectionChanged(event: any) {
    this.CountryId = event.value;
    console.log(this.CountryId, 'country selection change ');
    const selectedCountry = this.CountryDropdownData.find(
      (country) => country.ID === event.value
    );
    console.log('selected country', selectedCountry);
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE;
    }
    // this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
  }

  onPayTermSelectionChanged(event: any) {
    this.PaymentId = event.value;
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    console.log(this.selectedStateId, 'seleted state');
    this.StateId = event.value;
    this.get_State_Dropdown_List();

    // console.log(this.selectedStateId, 'selectedStateId++++++++++');
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.getPaymentTerms();
    this.showCountry();
    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getCurrency();
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
    DxValidationGroupModule,
    DxValidatorModule,
    DxDataGridModule,
  ],
  declarations: [SupplierFormComponent],
  exports: [SupplierFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierFormModule {}
