import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFormModule,
  DxListModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxTextBoxModule,
  DxTextBoxComponent,
} from 'devextreme-angular/ui/text-box';
import { DxValidatorComponent } from 'devextreme-angular/ui/validator';
import notify from 'devextreme/ui/notify';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import {
  SupplierFormComponent,
  SupplierFormModule,
} from 'src/app/components/library/supplier-form/supplier-form.component';
import { AuthService, DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';
import CountryList from 'country-list-with-dial-code-and-flag';
import { isValidPhoneNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-supplier-fin-edit',
  templateUrl: './supplier-fin-edit.component.html',
  styleUrls: ['./supplier-fin-edit.component.scss'],
})
export class SupplierFinEditComponent {
  @Input() supplierData: any;
  @Output() formClosed: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('landedCostGrid', { static: false })
  landedCostGrid!: DxDataGridComponent;
  @ViewChild(SupplierFormComponent) itemsComponent: SupplierFormComponent;
  @ViewChild(DxValidationGroupComponent)
  validationGroup!: DxValidationGroupComponent;

  @ViewChild('mobileValidator', { static: false })
  mobileValidator!: DxValidatorComponent;
  @ViewChild('phoneValidator', { static: false })
  phoneValidator!: DxValidatorComponent;
  @ViewChild('mobileBox', { static: false }) mobileBox!: DxTextBoxComponent;
  @ViewChild('phoneBox', { static: false }) phoneBox!: DxTextBoxComponent;

  popupVisible: boolean = true;
  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: string = '+971';
  phoneCountryCode: string = '+971';
  countryCodePhone: string = '+971';
  isCountryDropdownOpen = false;
  isPhoneDropdownOpen = false;
  stateLabel: any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp: { SUPP_ID: number }[] = [];
  selecte_countyId: any;
  formSupplierData: any = {
    ID: '',
    HQID: 1,
    SUPP_CODE: '',
    SUPP_NAME: '',
    CONTACT_NAME: '',
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP: '',
    STATE_ID: '',
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
    IS_DEFAULT_CURRENCY: true,
    Supplier_cost: [],
  };

  landedcost: any[] = [];
  costFactors: any[] = [];
  currency: any;
  vatrule: any;
  supplier: any;
  selectedSupplier: any;
  isPopupVisible: boolean = true;
  selectedLandedCostKeys: any;
  Country: any;
  CountryId: any;
  State: any[] = [];
  selectedStateId: any[] = [];
  SupplierCategory: any[] = [];
  PaymentId: any;
  StateId: any;
  PaymentTerms: any;
  selected_Company_id: any;
  selected_fin_id: any;
  sessionData: any;
  selected_vat_id: any;
  DEFAULT_COUNTRY_CODE: any;
  Supplier_Category: any;
  purchType: number = 0;
  countryCodes: any;
  mobile_limit: any;
  Supplier_mobile: any;
  PhoneNumber: any;
  purchaseTypeOptions = [
    { text: 'Local Purchase', value: 1 },
    { text: 'Interstate Purchase', value: 2 },
  ];
  Phone_limit: any;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    authservice: AuthService,
  ) {
    dataservice.getCurrencyData().subscribe((data) => {
      this.currency = data;
    });
    dataservice.getDropdownData('VATRULE').subscribe((data) => {
      this.vatrule = data;
    });
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

    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
    this.sesstion_Details();
    this.sessionData_tax();
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.CountryDropdownData = data;
    });
  }

  newSupplier = { ...this.formSupplierData };

  getNewSupplierData = () => ({ ...this.newSupplier });

  sessionData_tax() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.DEFAULT_COUNTRY_CODE = this.sessionData.DEFAULT_COUNTRY_CODE;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
    this.selected_fin_id = sessionData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    this.DEFAULT_COUNTRY_CODE =
      sessionData.GeneralSettings?.DEFAULT_COUNTRY_CODE;
  }

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
  }

  private parseIncomingPhone(raw: string) {
    const str = (raw || '').trim();
    const defaultCode = '+971';
    if (!str) {
      return { code: defaultCode, number: '' };
    }

    let code = '';
    let num = '';

    if (str.includes('-')) {
      const parts = str.split('-');
      code = (parts[0] || '').trim();
      num = (parts[1] || '').trim();
    } else if (str.startsWith('+')) {
      code = defaultCode;
      num = str.replace(/\D/g, '');
    } else {
      num = str.replace(/\D/g, '');
    }

    if (code) {
      if (!code.startsWith('+')) {
        code = '+' + code;
      }
    } else {
      code = defaultCode;
    }

    return { code, number: num };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierData'] && changes['supplierData'].currentValue) {
      this.Supplier_Category = this.supplierData.SUPP_CAT_ID;

      setTimeout(() => {
        this.purchType = Number(this.supplierData.PURCH_TYPE);
        this.cdr.detectChanges();
      });

      this.get_State_Dropdown_List();

      const savedCostIDs = (this.supplierData.Supplier_cost || []).map(
        (cost: any) => cost.COST_ID,
      );

      const selectedCosts = (this.landedcost || []).filter((cost: any) =>
        savedCostIDs.includes(cost.ID),
      );

      this.selectedLandedCostKeys = selectedCosts.map((cost: any) => cost.ID);
      this.isCurrencyAccepted = this.supplierData.IS_DEFAULT_CURRENCY;

      const mobileData = this.parseIncomingPhone(
        this.supplierData.MOBILE_NO || '',
      );
      this.countryCode = mobileData.code;
      this.Supplier_mobile = mobileData.number;

      const phoneData = this.parseIncomingPhone(this.supplierData.PHONE || '');
      this.phoneCountryCode = phoneData.code;
      this.countryCodePhone = phoneData.code;
      this.PhoneNumber = phoneData.number;
    }
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    this.cdr.detectChanges();
    this.loadDropdownData();
    this.listSupplier();
    this.getVATRuleDropDown();
    this.getSuppliercategoryDropDown();
    this.get_State_Dropdown_List();
    this.listState();
    this.getPaymentTerms();
    this.getCurrency_Dropdown();
  }

  private loadDropdownData(): void {
    const payload = {
      NAME: 'LANDED_COST',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getDropdownData(payload).subscribe((data) => {
      this.landedcost = data;
    });
  }

  getSuppliercategoryDropDown() {
    const payload = {
      NAME: 'SUPPLIER_CATEGORY',
    };

    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.SupplierCategory = data;
    });
  }

  listSupplier() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getSupplierData(payload).subscribe((response) => {
      this.supplier = response;
    });
  }

  listState() {
    this.dataservice.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
    });
  }

  getPaymentTerms() {
    this.dataservice.getPaymentTermsData().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }

  onPayTermSelectionChanged(event: any) {
    this.PaymentId = event.value;
  }

  get_PaymentTerms_Dropdown_List() {
    this.dataservice.PaymentTerms_Dropdown_Api().subscribe((response: any) => {
      this.PaymentTerms = response;
    });
  }

  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
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
    }
  }

  get_State_Dropdown_List() {
    const CountryId = this.supplierData?.COUNTRY_ID;
    this.dataservice
      .get_State_Dropdown_Api('STATE_NAME', CountryId)
      .subscribe((response: any) => {
        this.State = response;
      });
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    this.StateId = event.value;
    this.get_State_Dropdown_List();
  }

  onSelectedCostChanged(event: any): void {
    this.selectedLandedCostKeys = event.selectedRowKeys;
    this.supplierData.Supplier_cost = this.landedcost
      .filter((cost: any) => this.selectedLandedCostKeys.includes(cost.ID))
      .map((cost: any) => ({
        COST_ID: cost.ID,
        DESCRIPTION: cost.DESCRIPTION,
        SUPP_ID: 0,
      }));
  }

  keyPressNumbers(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    var inputElement = event.target as HTMLInputElement;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else if (inputElement.value.length === 0 && charCode === 48) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  private extractDialCode(event: any): string {
    if (!event) return '';
    let code = '';
    if (typeof event === 'string') code = event;
    else if (typeof event.value === 'string') code = event.value;
    else if (typeof event.value?.dial_code === 'string')
      code = event.value.dial_code;
    else if (typeof event.value?.data?.dial_code === 'string')
      code = event.value.data.dial_code;
    else if (typeof event.itemData?.dial_code === 'string')
      code = event.itemData.dial_code;
    else if (typeof event.itemData?.data?.dial_code === 'string')
      code = event.itemData.data.dial_code;
    else if (typeof event.dial_code === 'string') code = event.dial_code;
    else if (typeof event.data?.dial_code === 'string')
      code = event.data.dial_code;

    code = (code || '').trim();
    if (code && !code.startsWith('+')) {
      code = '+' + code;
    }
    return code;
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

    const formattedDialCode = dialCode.startsWith('+')
      ? dialCode
      : '+' + dialCode;

    if (dialCode === '+971' || dialCode === '971') {
      return mobileNum.length === 9;
    }

    try {
      return isValidPhoneNumber(formattedDialCode + mobileNum);
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

    const formattedDialCode = dialCode.startsWith('+')
      ? dialCode
      : '+' + dialCode;

    if (dialCode === '+971' || dialCode === '971') {
      return phoneNum.length === 9;
    }

    try {
      return isValidPhoneNumber(formattedDialCode + phoneNum);
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

  updateSupplier() {
    const result = this.validationGroup.instance.validate();

    if (!result.isValid) {
      return;
    }

    const payload = {
      ...this.supplierData,
      SUPP_CAT_ID: this.Supplier_Category,
      PURCH_TYPE: this.purchType,
      MOBILE_NO:
        (this.countryCode || '+971') + '-' + (this.Supplier_mobile || ''),
      PHONE:
        (this.phoneCountryCode || this.countryCodePhone || '+971') +
        '-' +
        (this.PhoneNumber || ''),
      IS_DEFAULT_CURRENCY: this.isCurrencyAccepted,
    };
    this.dataservice
      .updateSuppliers(payload.ID, payload)
      .subscribe((response: any) => {
        try {
          notify(
            {
              message: 'Supplier updated successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
        } catch (error) {
          notify(
            {
              message: 'Add operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        this.closeForm();
      });
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  getCurrency_Dropdown() {
    this.dataservice.getCurrencyDropdown().subscribe((response) => {
      this.CurrencyDropdownData = response;
    });
  }

  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }

  validateVAT = (e: any): boolean => {
    if (this.supplierData.VAT_RULE_ID != 2) {
      return true;
    }
    return !!(e.value && e.value.trim().length > 0);
  };

  onTaxRuleChange() {
    if (this.supplierData.VAT_RULE_ID != 2) {
      this.supplierData.VAT_REGNO = '';
    }
  }

  validateSupplierCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.supplier) return true;
    const currentId = this.supplierData?.ID;
    return !this.supplier.some((item: any) => {
      const sameCode = item.SUPP_CODE?.toLowerCase() === value;
      const isSameId = Number(item.ID) === Number(currentId);
      return sameCode && !isSameId;
    });
  };

  validateSupplierName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();
    if (!value || !this.supplier) return true;
    const currentId = this.supplierData?.ID;
    return !this.supplier.some((item: any) => {
      const sameCode = item.SUPP_NAME?.toLowerCase() === value;
      const isSameId = Number(item.ID) === Number(currentId);
      return sameCode && !isSameId;
    });
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
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    SupplierFormModule,
    DxRadioGroupModule,
    DxDropDownBoxModule,
    DxListModule,
  ],
  providers: [],
  exports: [SupplierFinEditComponent],
  declarations: [SupplierFinEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierFinEditModule {}
