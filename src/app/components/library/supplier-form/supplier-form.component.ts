import { Component, NgModule, enableProdMode,OnInit,ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule, DxDataGridComponent, DxValidationGroupComponent, DxValidatorModule } from 'devextreme-angular';
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
  styleUrls: ['./supplier-form.component.scss']
})
export class SupplierFormComponent implements OnInit {
  @ViewChild(DxValidationGroupComponent) validationGroup: DxValidationGroupComponent;

  @ViewChild('landedCostGrid', { static: false })
  landedCostGrid!: DxDataGridComponent;   // ✅ reference to dx-data-grid

 
  CountryDropdownData: any[] = [];
  VATRuleDropdownData: any[] = [];
  PaymentTermsDropdownData: any[] = [];
  CurrencyDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: any;
  DEFAULT_COUNTRY_CODE: any;
  sessionData: any;
  stateLabel:any;
   Country: any[] = [];
   State:any[]=[];
   selected_Company_id: number
   selectedStateId: any[] = [];
   StateId :any;
  isCurrencyAccepted: boolean = true;
  selectedLandedCosts: { COST_ID: number }[] = [];
  selectedSupp : {SUPP_ID:number}[]=[];
  formSupplierData = {
     COMPANY_ID: 0,
    HQID:1,
    SUPP_CODE: '',
    SUPP_NAME: '',
    CONTACT_NAME: '',
    ADDRESS1:'',
    ADDRESS2:'',
    ADDRESS3:'',
    ZIP:'',
    STATE_ID:null,
    CITY:'',
    COUNTRY_ID:null,
    PHONE:'',
    EMAIL:'',
    IS_INACTIVE:0,
    MOBILE_NO:'',
    NOTES:'',
    FAX_NO:'',
    VAT_REGNO:'',
    CURRENCY_ID:'',
    PAY_TERM_ID:'',
    VAT_RULE_ID:'',
    IS_COMPANY_BRANCH: false,
    // Supplier_cost:''
    Supplier_cost: [] as { COST_ID: number; SUPP_ID: number }[]
    
  };
  landedcost: any[] = [];
  costFactors: any[] = [];
  CountryId: any;
  PaymentTerms:any;
  PaymentId:any;

  constructor(private service:DataService,authservice:AuthService){
    this.stateLabel=authservice.getsettingsData().STATE_LABEL;
    this.countryCode=authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
     this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    console.log(
      this.countryCode,
      '===========================country Code============'
    );
    // this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    this.get_PaymentTerms_Dropdown_List();
    this.sesstion_Details()
    this.sessionData_tax()

     service.getCountryWithFlags().subscribe((data) => {
      this.CountryDropdownData = data;
      console.log(this.CountryDropdownData,"COUNTRY;;;;;;;;;;")
    });
  }
  newSupplier=this.formSupplierData;

  getNewSupplierData = () => ({ ...this.newSupplier });

  toggleCurrencyDropdown(checked: boolean) {
    this.isCurrencyAccepted =checked;
}

private loadDropdownData(): void {
  this.service.getDropdownData('LANDED_COST').subscribe((data) => {
    this.landedcost = data;
    console.log(this.landedcost,"LANDEDCOST")
  });
}


// in SupplierFormComponent (Add/Edit form)
resetPartialForm() {
  this.newSupplier.ADDRESS2 = '';
  this.newSupplier.ADDRESS3 = '';
  this.newSupplier.NOTES = '';
  this.newSupplier.PHONE = '';
   // ✅ Clear Supplier_cost
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
    return { COST_ID: row.ID , SUPP_ID : 0} 
  });

  // Debug log to verify the binding
  console.log('Updated Supplier_cost:', this.formSupplierData.Supplier_cost);
}

  get_Country_Dropdown_List() {
    this.service.CountryDropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.CountryDropdownData = response;
      console.log(this.CountryDropdownData,'Country dropdown')
    });
  }

    get_PaymentTerms_Dropdown_List() {
    this.service.PaymentTerms_Dropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.PaymentTerms = response;
      console.log(this.PaymentTerms,'Country dropdown')
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

  showCountry(){
    this.service.getCountryData().subscribe(
     (response)=>{
           this.CountryDropdownData=response;
           console.log('count',this.CountryDropdownData);
     }
    )
 }
 getVATRuleDropDown() {
  const dropdownvat = 'VATRULE';
  this.service
    .getDropdownData(dropdownvat)
    .subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdown',this.VATRuleDropdownData);
    });
}
  getPaymentTerms(){
  this.service.getPaymentTermsData().subscribe(
   (response)=>{
         this.PaymentTermsDropdownData=response;
         console.log('count==================================',this.PaymentTermsDropdownData);
   }
  )
}
  getCurrency(){
  this.service.getCurrencyData().subscribe(
   (response)=>{
         this.CurrencyDropdownData=response;
         console.log('count',this.CurrencyDropdownData);
   }
  )
}

  getCurrency_Dropdown(){
  this.service.getCurrencyDropdown().subscribe(
   (response)=>{
         this.CurrencyDropdownData=response;
         console.log('count==================================',this.CurrencyDropdownData);
   }
  )
}

getStateDropDown() {
  this.service
    .getStateData()
    .subscribe((data: any) => {
      this.StateDropdownData = data;
      console.log('dropdown',this.StateDropdownData);
    });
}
 onCountrySelectionChanged(event: any) {
  this.CountryId = event.value
  console.log(this.CountryId,'country selection change ')
  const selectedCountry = this.CountryDropdownData.find(country => country.ID === event.value);
  console.log('selected country',selectedCountry);
  if (selectedCountry) {
    this.countryCode = selectedCountry.CODE;
  }
  // this.get_Country_Dropdown_List();
  this.get_State_Dropdown_List();
}

onPayTermSelectionChanged(event:any){
  this.PaymentId = event.value
}

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    console.log(this.selectedStateId,'seleted state')
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
   this.getCurrency_Dropdown();
 }
 keyPressNumbers(event: any) {
  var charCode = (event.which) ? event.which : event.keyCode;
  var inputElement = event.target as HTMLInputElement;

  // Only Numbers 0-9
  if ((charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  } else if (inputElement.value.length === 0 && charCode === 48) { // Check if first character is '0'
    event.preventDefault();
    return false;
  } else {
    return true;
  }
}

sessionData_tax(){
        // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'" 
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
        console.log(this.sessionData,'=================session data==========')
        // this.selected_vat_id=this.sessionData.VAT_ID
        this.DEFAULT_COUNTRY_CODE=this.sessionData.DEFAULT_COUNTRY_CODE
  }

  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    // this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    // console.log(this.selected_fin_id,'===========selected fin id===================')
                const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
//  this.financialYeaDate=sessionYear[0].DATE_FROM
// console.log(this.financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
// this.formatted_from_date=this.financialYeaDate

    
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
    DxDataGridModule
  ],
  declarations: [SupplierFormComponent],
  exports: [SupplierFormComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class SupplierFormModule { }
