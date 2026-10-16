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
  DxDropDownBoxModule,
  DxListModule,
  DxRadioGroupModule,
  DxValidationGroupComponent,
  DxValidatorComponent,
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
import { DxTextBoxComponent, DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { AuthService, DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';
import { isValidPhoneNumber } from 'libphonenumber-js';


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
  countryCode: string = '+91';
  phoneCountryCode: string = '+91';
  countryCodePhone: string = '+91';
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

  PhoneNumber: any;
  countryCodes: any;
  purchaseTypeOptions = [
    { text: 'Local Purchase', value: 1 },
    { text: 'Interstate Purchase', value: 2 },
  ];
  Phone_limit: any;
  isCountryDropdownOpen = false;
  isPhoneDropdownOpen = false;

  constructor(
    private service: DataService,
    private authservice: AuthService,
  ) {
    this.stateLabel = authservice.getsettingsData()?.STATE_LABEL;
    // this.countryCode = authservice.getsettingsData()?.DEFAULT_COUNTRY_CODE;
    // this.DEFAULT_COUNTRY_CODE = authservice.getsettingsData()?.DEFAULT_COUNTRY_CODE;

    const defaultCc =
      authservice.getsettingsData().DEFAULT_COUNTRY_CODE || '+91';
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
    if (this.isCurrencyAccepted) {
      const defCur = this.getDefaultCurrencyId();
      if (defCur !== null && defCur !== undefined) {
        this.newSupplier.CURRENCY_ID = defCur;
      }
    }
    // service.getCountryWithFlags().subscribe((data) => {
    //   this.countryCodes = data;
    // });
  }
  newSupplier = this.formSupplierData;

  getDefaultCurrencyId(): any {
    const settingsStr = sessionStorage.getItem('settings');
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings && settings.CURRENCY_ID !== undefined && settings.CURRENCY_ID !== null && settings.CURRENCY_ID !== '') {
          return settings.CURRENCY_ID;
        }
      } catch (e) { }
    }

    const savedUserStr = sessionStorage.getItem('savedUserData') || localStorage.getItem('userData');
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser?.GeneralSettings?.CURRENCY_ID !== undefined && savedUser?.GeneralSettings?.CURRENCY_ID !== null && savedUser?.GeneralSettings?.CURRENCY_ID !== '') {
          return savedUser.GeneralSettings.CURRENCY_ID;
        }
        if (savedUser?.CURRENCY_ID !== undefined && savedUser?.CURRENCY_ID !== null && savedUser?.CURRENCY_ID !== '') {
          return savedUser.CURRENCY_ID;
        }
        if (savedUser?.Configuration?.[0]?.CURRENCY_ID !== undefined && savedUser?.Configuration?.[0]?.CURRENCY_ID !== null && savedUser?.Configuration?.[0]?.CURRENCY_ID !== '') {
          return savedUser.Configuration[0].CURRENCY_ID;
        }
        if (savedUser?.SELECTED_COMPANY?.CURRENCY_ID !== undefined && savedUser?.SELECTED_COMPANY?.CURRENCY_ID !== null && savedUser?.SELECTED_COMPANY?.CURRENCY_ID !== '') {
          return savedUser.SELECTED_COMPANY.CURRENCY_ID;
        }
      } catch (e) { }
    }

    const authSettings = this.authservice?.getsettingsData?.();
    if (authSettings && authSettings.CURRENCY_ID !== undefined && authSettings.CURRENCY_ID !== null && authSettings.CURRENCY_ID !== '') {
      return authSettings.CURRENCY_ID;
    }

    return null;
  }

  getNewSupplierData = () => {
    let currencyId = this.newSupplier.CURRENCY_ID;
    if (this.isCurrencyAccepted) {
      const defCur = this.getDefaultCurrencyId();
      if (defCur !== null && defCur !== undefined && defCur !== '') {
        currencyId = defCur;
      }
    }

    return {
      ...this.newSupplier,
      CURRENCY_ID: currencyId,
      MOBILE_NO: this.countryCode + '-' + this.Supplier_mobile,
      PHONE: this.countryCodePhone + '-' + this.PhoneNumber,
      IS_DEFAULT_CURRENCY: this.isCurrencyAccepted,
    };
  };

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
    if (checked) {
      const defCur = this.getDefaultCurrencyId();
      if (defCur !== null && defCur !== undefined) {
        this.newSupplier.CURRENCY_ID = defCur;
      }
      // Clear selection when disabled
      this.formSupplierData.Supplier_cost = [];

      if (this.landedCostGrid) {
        this.landedCostGrid.instance.clearSelection();
      }
    } else {
      this.newSupplier.CURRENCY_ID = '';
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
      CURRENCY_ID: this.isCurrencyAccepted ? (this.getDefaultCurrencyId() ?? '') : '',
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

  // onCountrySelectionChanged(event: any) {
  //   this.selecte_countyId = event.value;
  //   this.CountryId = event.value;

  //   this.get_State_Dropdown_List();

  //   const selectedCountry = this.CountryDropdownData.find(
  //     (country: any) => country.ID === this.selecte_countyId,
  //   );
  //   // 4️ If found, set code & name
  //   if (selectedCountry) {
  //     this.countryCode = selectedCountry.CODE; // e.g., '+971'
  //     this.DEFAULT_COUNTRY_CODE = this.countryCode; // bind to textbox
  //     this.countryCodePhone = selectedCountry.CODE;
  //   } else {
  //     // 5️ Fallback if no country found
  //     this.countryCode = '';
  //     this.DEFAULT_COUNTRY_CODE = '';
  //     this.countryCodePhone = '';
  //     console.warn(' No matching country found for ID:', this.selecte_countyId);
  //   }
  // }

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

    if (this.isCurrencyAccepted) {
      const defCur = this.getDefaultCurrencyId();
      if (defCur !== null && defCur !== undefined) {
        this.newSupplier.CURRENCY_ID = defCur;
      }
    }

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

  onCountrycodeChange(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
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
    DxDropDownBoxModule,
    DxListModule,
  ],
  declarations: [SupplierFormComponent],
  exports: [SupplierFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierFormModule { }
