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
  selectedSupp : {SUPP_ID:number}[] = [];
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
    COUNTRY_ID: '', // Check if number or string is expected
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
  Country:any;
  CountryId:any;
   State:any[]=[];
    selectedStateId: any[] = [];
     PaymentId:any;
 StateId :any;
   PaymentTerms:any;
    selected_Company_id: any;
  selected_fin_id: any;
   sessionData: any;
  selected_vat_id: any;
  DEFAULT_COUNTRY_CODE: any;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    authservice: AuthService
  ) {
    dataservice.getCurrencyData().subscribe((data) => {
      this.currency = data;
    });
    dataservice.getDropdownData('VATRULE').subscribe((data) => {
      this.vatrule = data;
    });
    this.stateLabel = authservice.getsettingsData().STATE_LABEL;
    // this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    console.log(
      this.countryCode,
      '===========================country Code============'
    );
    //  this.get_Country_Dropdown_List();
     this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
     this.sesstion_Details()
    this.sessionData_tax()

  
  }

  newSupplier = { ...this.formSupplierData };

  getNewSupplierData = () => ({ ...this.newSupplier });

      sessionData_tax(){
        // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'" 
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
        console.log(this.sessionData,'=================session data==========')
        this.selected_vat_id=this.sessionData.VAT_ID
        this.DEFAULT_COUNTRY_CODE=this.sessionData.DEFAULT_COUNTRY_CODE
  }

  showCountry(){
    this.dataservice.getCountryData().subscribe(
     (response)=>{
           this.CountryDropdownData=response;
           console.log('count',this.CountryDropdownData);
     }
    )
 }
    sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')
    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')
    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID
    console.log(this.selected_fin_id,'===========selected fin id===================')
    
  }

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted = checked;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplierData'] && changes['supplierData'].currentValue) {
      console.log('SupplierData:', this.supplierData);
      const savedCostIDs = (this.supplierData.Supplier_cost || []).map(
        (cost: any) => cost.COST_ID
      );
      console.log('Saved Cost IDs:', savedCostIDs);
      const selectedCosts = (this.landedcost || []).filter((cost: any) =>
        savedCostIDs.includes(cost.ID)
      );
      this.selectedLandedCostKeys = selectedCosts.map((cost: any) => cost.ID);

      console.log('Selected Landed Cost Keys:', this.selectedLandedCostKeys);
        this.get_State_Dropdown_List()
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
    this.get_State_Dropdown_List();
    this.listCountry();
    this.listState();
    this.getPaymentTerms();
    this.getCurrency_Dropdown();
    this.showCountry();
    this.get_Country_Dropdown_List();
  }

  loadDropdownData(): void {
    this.dataservice.getDropdownData('LANDED_COST').subscribe((data) => {
      this.landedcost = data;
      console.log(this.landedcost, 'LANDEDCOST');
    });
  }

  listSupplier() {
    this.dataservice.getSupplierData().subscribe((response) => {
      this.supplier = response;
      console.log(response);
    });
  }

  listCountry() {
    this.dataservice.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }

    get_Country_Dropdown_List() {
    this.dataservice.get_Country_Dropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.CountryDropdownData = response;
      console.log(this.Country,'Country dropdown')
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

  onPayTermSelectionChanged(event:any){
  this.PaymentId = event.value
}

    get_PaymentTerms_Dropdown_List() {
    this.dataservice.PaymentTerms_Dropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.PaymentTerms = response;
      console.log(this.PaymentTerms,'Country dropdown')
    });
  }

  onSelectionChanged(event: any): void {
    this.selectedLandedCostKeys = event.selectedRowKeys;
    const selectedRows = event.selectedRowsData;

    // Map the selected rows to only include the COST_IDs
    this.formSupplierData.Supplier_cost = selectedRows.map((row: any) => {
      return { COST_ID: row.ID , SUPP_ID : 0};
    });

    // Debug log to verify the binding
    console.log('Updated Supplier_cost:', this.formSupplierData.Supplier_cost);
  }

  getVATRuleDropDown() {
    const dropdownvat = 'VATRULE';
    this.dataservice.getDropdownData(dropdownvat).subscribe((data: any) => {
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
     this.CountryId = event.value
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

   get_State_Dropdown_List() {
    // console.log('function working');
const CountryId = this.supplierData?.COUNTRY_ID;
console.log(CountryId, 'country id of selected state id')
    this.dataservice
      .get_State_Dropdown_Api('STATE_NAME', CountryId)
      .subscribe((response: any) => {
        console.log(response, 'response++++++++++');
        this.State = response;
        
      });
  }

// get_State_Dropdown_List() {
//   if (!this.supplierData?.COUNTRY_ID) {
//     console.warn('COUNTRY_ID is not ready');
//     return; // Skip until COUNTRY_ID is set
//   }

//   const payload = {
//     NAME: 'STATE_NAME',
//     COUNTRY_ID: this.supplierData.COUNTRY_ID
//   };

//   this.dataservice.get_State_Dropdown_Api(payload).subscribe((response: any) => {
//     this.State = response;

//     // Optional: set default or patch if needed
//     this.cdr.detectChanges();
//   });
// }


    onStateValue(event: any) {
    this.selectedStateId = event.value;
    
    console.log(this.selectedStateId,'seleted state')
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
        SUPP_ID:0,
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
    const payload = this.supplierData;
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
            'success'
          );
          this.dataGrid.instance.refresh();
        } catch (error) {
          notify(
            {
              message: 'Add operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        console.log(response, 'RESPONSE IN UPDATE');
        this.closeForm();
      });
  }

  closeForm(): void {
    this.formClosed.emit();
  }

    getCurrency_Dropdown(){
  this.dataservice.getCurrencyDropdown().subscribe(
   (response)=>{
         this.CurrencyDropdownData=response;
         console.log('count==================================',this.CurrencyDropdownData);
   }
  )
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
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    SupplierFormModule,
  ],
  providers: [],
  exports: [SupplierEditComponent],
  declarations: [SupplierEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierEditModule {}
