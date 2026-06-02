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
  DxFormModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import {
  SupplierFormComponent,
  SupplierFormModule,
} from 'src/app/components/library/supplier-form/supplier-form.component';
import { AuthService, DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-supplier-edit',
  templateUrl: './supplier-edit.component.html',
  styleUrls: ['./supplier-edit.component.scss'],
  standalone: false,
})
export class SupplierEditComponent {
  @Input() supplierData: any;
  @Output() formClosed: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('landedCostGrid', { static: false })
  landedCostGrid!: DxDataGridComponent;
  @ViewChild(SupplierFormComponent) itemsComponent: SupplierFormComponent;
  popupVisible: boolean = true;
  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: any;
  stateLabel: any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp: { SUPP_ID: number }[] = [];
  selecte_countyId: any;
  formSupplierData = {
    ID: '',
    HQID: 1,
    SUPP_CODE: '',
    SUPP_NAME: '',
    CONTACT_NAME: '',
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP: '',
    STATE_ID: '', // Use number or string depending on your data type
    CITY: '',
    COUNTRY_ID: null, // Check if number or string is expected
    PHONE: '',
    EMAIL: '',
    IS_INACTIVE: 0,
    MOBILE_NO: '',
    NOTES: '',
    FAX_NO: '',
    VAT_REGNO: '',
    CURRENCY_ID: '', // Check if number or string is expected
    PAY_TERM_ID: '', // Same here: ensure it's a number if necessary
    VAT_RULE_ID: '',

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
  countryCodePhone: any;
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
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    console.log(
      this.countryCode,
      '===========================country Code============',
    );
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
      console.log(this.countryCodes, 'COUNTRY;;;;;;;;;;');
    });
    //  this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
    this.sesstion_Details();
    this.sessionData_tax();
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.CountryDropdownData = data;
      console.log(this.CountryDropdownData, 'COUNTRY;;;;;;;;;;');
    });
  }

  newSupplier = { ...this.formSupplierData };

  getNewSupplierData = () => ({ ...this.newSupplier });

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.DEFAULT_COUNTRY_CODE = this.sessionData.DEFAULT_COUNTRY_CODE;
  }

  //   showCountry(){
  //     this.dataservice.getCountryData().subscribe(
  //      (response)=>{
  //            this.CountryDropdownData=response;
  //            console.log('count',this.CountryDropdownData);
  //      }
  //     )
  //  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.DEFAULT_COUNTRY_CODE =
      sessionData.GeneralSettings.DEFAULT_COUNTRY_CODE;
    console.log(this.DEFAULT_COUNTRY_CODE, 'DEFAULT_COUNTRY_CODE');
  }

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierData'] && changes['supplierData'].currentValue) {
      console.log('SupplierData:', this.supplierData);
      this.Supplier_Category = this.supplierData.SUPP_CAT_ID;
      setTimeout(() => {
        this.purchType = Number(this.supplierData.PURCH_TYPE);
        console.log('Radio value:', this.purchType);
        this.cdr.detectChanges();
      });
      //  this.get_Country_Dropdown_List()
      this.get_State_Dropdown_List();

      const savedCostIDs = (this.supplierData.Supplier_cost || []).map(
        (cost: any) => cost.COST_ID,
      );
      console.log('Saved Cost IDs:', savedCostIDs);
      const selectedCosts = (this.landedcost || []).filter((cost: any) =>
        savedCostIDs.includes(cost.ID),
      );
      this.selectedLandedCostKeys = selectedCosts.map((cost: any) => cost.ID);
      this.isCurrencyAccepted = this.supplierData.IS_DEFAULT_CURRENCY;
      console.log('Selected Landed Cost Keys:', this.selectedLandedCostKeys);
      const MobileNo = this.supplierData.MOBILE_NO;
      const [countryCode, number] = MobileNo.split('-');
      this.countryCode = countryCode;
      this.Supplier_mobile = number;
      const phoneNo = this.supplierData.PHONE;
      const [countryCodePhone, phonenumber] = phoneNo.split('-');
      this.countryCodePhone = countryCodePhone;
      this.PhoneNumber = phonenumber;
      console.log(this.countryCodePhone, this.PhoneNumber);
      this.onCountrycodeChange({ value: this.countryCode });
      this.onCountrycodeChangePhone({ value: this.countryCodePhone });
    }
  }

  ngOnInit() {
    console.log('EDIT COMPONENT111');
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    console.log('Received supplier data:', this.supplierData);
    // Trigger change detection after receiving the data
    this.cdr.detectChanges();
    this.loadDropdownData();
    this.listSupplier();
    this.getVATRuleDropDown();
    this.getSuppliercategoryDropDown();
    this.get_State_Dropdown_List();
    // this.listCountry();
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
      console.log(this.landedcost, 'LANDEDCOST');
    });
  }

  getSuppliercategoryDropDown() {
    const payload = {
      NAME: 'SUPPLIER_CATEGORY',
      // COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.SupplierCategory = data;
      console.log('dropdown', this.SupplierCategory);
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
      // console.log(response, 'response++++++++++');
      this.PaymentTerms = response;
      console.log(this.PaymentTerms, 'Country dropdown');
    });
  }

  onSelectionChanged(event: any): void {
    this.selectedLandedCostKeys = event.selectedRowKeys;
    const selectedRows = event.selectedRowsData;

    // Map the selected rows to only include the COST_IDs
    this.formSupplierData.Supplier_cost = selectedRows.map((row: any) => {
      return { COST_ID: row.ID, SUPP_ID: 0 };
    });

    // Debug log to verify the binding
    console.log('Updated Supplier_cost:', this.formSupplierData.Supplier_cost);
  }

  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdown', this.VATRuleDropdownData);
    });
  }

  getStateDropDown() {
    this.dataservice.getStateData().subscribe((data: any) => {
      this.StateDropdownData = data;
      console.log('dropdown', this.StateDropdownData);
    });
  }

  onCountrySelectionChanged(event: any) {
    this.selecte_countyId = event.value;
    console.log(this.selecte_countyId, 'selected country id++++++++++');

    this.get_State_Dropdown_List();
    const selectedCountry = this.CountryDropdownData.find(
      (country: any) => country.ID === this.selecte_countyId,
    );

    // 4️ If found, set code & name
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE; // e.g., '+971'
      this.DEFAULT_COUNTRY_CODE = this.countryCode; // bind to textbox
      console.log('Selected Country:', selectedCountry.DESCRIPTION);
      console.log('Auto-filled Country Code:', this.DEFAULT_COUNTRY_CODE);
    } else {
      // 5️ Fallback if no country found
      this.countryCode = '';
      this.DEFAULT_COUNTRY_CODE = '';
      console.warn(' No matching country found for ID:', this.selecte_countyId);
    }
  }

  get_State_Dropdown_List() {
    // console.log('function working');
    const CountryId = this.supplierData?.COUNTRY_ID;
    console.log(CountryId, 'country id of selected state id');
    this.dataservice
      .get_State_Dropdown_Api('STATE_NAME', CountryId)
      .subscribe((response: any) => {
        console.log(response, 'response++++++++++');
        this.State = response;
      });
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;

    console.log(this.selectedStateId, 'seleted state');
    this.StateId = event.value;
    this.get_State_Dropdown_List();

    // console.log(this.selectedStateId, 'selectedStateId++++++++++');
  }

  onSelectedCostChanged(event: any): void {
    // Update selectedLandedCostKeys with the new selection
    this.selectedLandedCostKeys = event.selectedRowKeys;

    // Update the Supplier_cost array with the selected items
    this.supplierData.Supplier_cost = this.landedcost
      .filter((cost: any) => this.selectedLandedCostKeys.includes(cost.ID))
      .map((cost: any) => ({
        COST_ID: cost.ID,
        DESCRIPTION: cost.DESCRIPTION,
        SUPP_ID: 0,
      }));

    console.log('Updated Supplier_cost:', this.supplierData.Supplier_cost);
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

  updateSupplier() {
    const payload = {
      ...this.supplierData,
      SUPP_CAT_ID: this.Supplier_Category,
      PURCH_TYPE: this.purchType,
      MOBILE_NO: this.countryCode + '-' + this.Supplier_mobile,
      PHONE: this.countryCodePhone + '-' + this.PhoneNumber,
      IS_DEFAULT_CURRENCY: this.isCurrencyAccepted,
    };
    console.log(payload, 'PAYLOADINEDIT');
    this.dataservice
      .updateSuppliers(payload.ID, payload)
      .subscribe((response: any) => {
        try {
          notify(
            {
              message: 'Supplier updatedddd successfully',
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
        console.log(response, 'RESPONSE IN UPDATE');
        this.closeForm();
      });
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  getCurrency_Dropdown() {
    this.dataservice.getCurrencyDropdown().subscribe((response) => {
      this.CurrencyDropdownData = response;
      console.log(
        'count==================================',
        this.CurrencyDropdownData,
      );
    });
  }

  onCountrycodeChange(e: any) {
    console.log(e, '========event==============');
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }
  onCountrycodeChangePhone(e: any) {
    console.log(e, '========event==============');
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
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

    // ✅ Allow empty (optional field)
    if (!value) return true;

    // ✅ Wait until limit is loaded
    if (!this.Phone_limit) return true;

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
    DxValidationGroupModule,
    DxValidatorModule,
    DxDataGridModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    SupplierFormModule,
    DxRadioGroupModule,
  ],
  providers: [],
  exports: [SupplierEditComponent],
  declarations: [SupplierEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierEditModule {}
