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
  DxDataGridComponent,
  DxDropDownBoxModule,
  DxListModule,
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
import {
  DxTextBoxModule,
  DxTextBoxComponent,
} from 'devextreme-angular/ui/text-box';
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AuthService, DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';
import { isValidPhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-supplier-fin-form',
  templateUrl: './supplier-fin-form.component.html',
  styleUrls: ['./supplier-fin-form.component.scss'],
})
export class SupplierFinFormComponent {
  @ViewChild(DxValidationGroupComponent)
  validationGroup!: DxValidationGroupComponent;

  @ViewChild('landedCostGrid', { static: false })
  landedCostGrid!: DxDataGridComponent; // reference to dx-data-grid

  @ViewChild('mobileValidator', { static: false })
  mobileValidator!: DxValidatorComponent;
  @ViewChild('phoneValidator', { static: false })
  phoneValidator!: DxValidatorComponent;
  @ViewChild('mobileBox', { static: false }) mobileBox!: DxTextBoxComponent;
  @ViewChild('phoneBox', { static: false }) phoneBox!: DxTextBoxComponent;

  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  SupplierCategory: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: string = '+971';
  phoneCountryCode: string = '+971';
  countryCodePhone: string = '+971';
  isCountryDropdownOpen = false;
  isPhoneDropdownOpen = false;
  DEFAULT_COUNTRY_CODE: any;
  sessionData: any;
  stateLabel: any;
  Country: any[] = [];
  State: any[] = [];
  selected_Company_id: any;
  selectedStateId: any[] = [];
  StateId: any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp: { SUPP_ID: number }[] = [];
  selecte_countyId: any;
  formSupplierData: any = {
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
    IS_DEFAULT_CURRENCY: true,
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

  PhoneNumber: any;
  countryCodes: any;
  purchaseTypeOptions = [
    { text: 'Local Purchase', value: 1 },
    { text: 'Interstate Purchase', value: 2 },
  ];
  Phone_limit: any;

  supplier: any;

  constructor(
    private service: DataService,
    authservice: AuthService,
  ) {
    this.stateLabel = authservice.getsettingsData().STATE_LABEL;
    const defaultCc =
      authservice.getsettingsData().DEFAULT_COUNTRY_CODE || '+971';
    this.countryCode = defaultCc;
    this.phoneCountryCode = defaultCc;
    this.countryCodePhone = defaultCc;

    const codes = CountryList.getAll();
    this.countryCodes = codes.map((country: any) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`,
      display: `${country.dial_code}`,
    }));

    this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
    this.sesstion_Details();
    this.sessionData_tax();
    this.listSupplier();
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
    this.newSupplier.VAT_RULE_ID = 2;
    console.log(
      this.newSupplier.VAT_RULE_ID,
      '===========vat rule id============',
    );
  }
  newSupplier = this.formSupplierData;

  getNewSupplierData = () => ({
    ...this.newSupplier,
    MOBILE_NO:
      (this.countryCode || '+971') + '-' + (this.Supplier_mobile || ''),
    PHONE:
      (this.phoneCountryCode || this.countryCodePhone || '+971') +
      '-' +
      (this.PhoneNumber || ''),
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

  deafulvalue() {
    console.log('==open =====');
    this.newSupplier.VAT_RULE_ID = 2;
    this.formSupplierData.VAT_RULE_ID = 2;
  }
  listSupplier() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getSupplierData(payload).subscribe((response) => {
      this.supplier = response;
    });
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
    this.newSupplier.ADDRESS2 = '';
    this.newSupplier.ADDRESS3 = '';
    this.newSupplier.NOTES = '';
    this.newSupplier.PHONE = '';
    this.newSupplier.SUPP_CAT_ID = 0;
    this.newSupplier.FAX_NO = '';
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

  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };

    this.service.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
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
      (c: any) => c.ID === event.value,
    );

    if (!selectedCountry) return;

    const matchedCountry = this.countryCodes.find(
      (c: any) =>
        (c.name || c.COUNTRY_NAME || '')?.toLowerCase().trim() ===
        (selectedCountry.COUNTRY_NAME || selectedCountry.DESCRIPTION || '')
          ?.toLowerCase()
          .trim(),
    );

    if (matchedCountry) {
      const dialCode = matchedCountry.dial_code || matchedCountry.CODE;
      this.countryCode = dialCode;
      this.phoneCountryCode = dialCode;
      this.countryCodePhone = dialCode;
      this.revalidateMobile();
      this.revalidatePhone();
    } else {
      console.warn(
        'No matching country code found for:',
        selectedCountry.COUNTRY_NAME || selectedCountry.DESCRIPTION,
      );
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
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.DEFAULT_COUNTRY_CODE = this.sessionData.DEFAULT_COUNTRY_CODE;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
    this.DEFAULT_COUNTRY_CODE =
      sessionData.GeneralSettings?.DEFAULT_COUNTRY_CODE;
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

  onCountrySelected(event: any) {
    const dialCode = this.extractDialCode(event);

    if (dialCode) {
      if (this.countryCode && this.countryCode !== dialCode) {
        this.Supplier_mobile = '';
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
        this.PhoneNumber = '';
        if (this.phoneBox?.instance) {
          this.phoneBox.instance.option('isValid', true);
        }
      }
      this.phoneCountryCode = dialCode;
      this.countryCodePhone = dialCode;
    }
    this.isPhoneDropdownOpen = false;
    this.revalidatePhone();
  }

  revalidateMobile() {
    setTimeout(() => {
      const val = this.Supplier_mobile || '';
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
      const val = this.PhoneNumber || '';
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
  };

  PhoneValidate = (e: any): boolean => {
    const dialCode = (
      this.phoneCountryCode ||
      this.countryCodePhone ||
      ''
    ).trim();
    const phoneValue = e?.value ? e.value.toString().trim() : '';
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
    this.Supplier_mobile = digits;
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
    this.PhoneNumber = digits;
    this.revalidatePhone();
  }

  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }

  validateVAT = (e: any): boolean => {
    if (this.newSupplier.VAT_RULE_ID != 2) {
      return true;
    }
    return !!(e.value && e.value.trim().length > 0);
  };

  onTaxRuleChange() {
    if (this.newSupplier.VAT_RULE_ID != 2) {
      this.newSupplier.VAT_REGNO = '';
    }
    this.validationGroup.instance.validate();
  }

  validateSupplierCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.supplier) return true;
    return !this.supplier.some(
      (item: any) => item.SUPP_CODE?.toLowerCase() === value,
    );
  };

  validateSupplierName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.supplier) return true;
    return !this.supplier.some(
      (item: any) => item.SUPP_NAME?.toLowerCase() === value,
    );
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
    DxValidationGroupModule,
    DxValidatorModule,
    DxDataGridModule,
    DxRadioGroupModule,
    DxDropDownBoxModule,
    DxListModule,
  ],
  declarations: [SupplierFinFormComponent],
  exports: [SupplierFinFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierFinFormModule {}
