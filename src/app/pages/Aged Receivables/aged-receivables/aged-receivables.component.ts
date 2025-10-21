// import { Component } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-aged-receivables',
  templateUrl: './aged-receivables.component.html',
  styleUrls: ['./aged-receivables.component.scss']
})
export class AgedReceivablesComponent {

  
  AgedList_Datasource: any[]=[]
  isFilterRowVisible: boolean = false;
  isViewInvoice:boolean=false
  BalanceSheetReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  selected_Company_id: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: string;
  HeadId: any;
  selected_fin_id: any;
customer_list:any[]=[]
  select_customer_id:any
  selectedInvoice: any;
  defaultDate: Date = new Date();   
  customer_details: { CUSTOMER_ID: any; SALE_ID: any; DATE_FROM: any; DATE_TO: string; COMPANY_ID: any; };
  constructor(private dataservice: DataService,private cdr: ChangeDetectorRef,private router:Router)
  {
    this.sesstion_Details()
    this.get_customer_list()
    this.onToDateChange({ value: this.defaultDate });

  }
  ngOnInit() {
  // initialize with today's date
  this.onToDateChange({ value: this.defaultDate });
  this.GET_CUSTOMER_LIST() //get datasource======== function call==========
}

           sesstion_Details(){
        const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
        console.log(sessionData,'=================session data==========')
    
        this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
        console.log(this.selected_Company_id,'============selected_Company_id==============')

            this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;


            const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
const financialYeaDate=sessionYear[0].DATE_FROM
console.log(financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
this.formatted_from_date=financialYeaDate

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );

        
      }
        
            toggleFilterRow = () => {
            this.isFilterRowVisible = !this.isFilterRowVisible;
             this.cdr.detectChanges();
          };
        get_customer_list(){
          this.dataservice.Customer_Dropdown().subscribe((res:any)=>{
            console.log(res)
            this.customer_list=res
            console.log(this.customer_list)
          })
        }
        
        
        
             onExporting(event: any) {
              const fileName = 'BalanceSheetReport';
              this.dataservice.exportDataGridReport(event, fileName);
            }
        
            get_sessionstorage_data(){
        this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
         console.log(this.savedUserData)
        this.company_list=this.savedUserData.Companies
        
        }
        
        get_fin_id(){
          this.fin_id=this.savedUserData.FINANCIAL_YEARS
           if (this.fin_id.length) {
              this.finID = this.fin_id[0].FIN_ID;
            }
        console.log(this.fin_id,'========financial year')
        }
        
        onCompanyChange(event:any){
          console.log(event);
          this.company_id=event.value
          console.log( this.company_id,'=====company id');
        }
        
        
        // onFromDateChange(event: any) {
        //   const rawDate: Date = new Date(event.value);
        //   this.formatted_from_date = this.formatDate(rawDate);
        //   console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
        // }
         
         
        onToDateChange(event: any) {
          const rawDate: Date = new Date(event.value);
          this.formatted_To_date = this.formatDate(rawDate);
          console.log('Formatted Date:', this.formatted_To_date); // example: "2025-04-01"
        }
        
        formatDate(date: Date): string {
          const year = date.getFullYear();
          const month = ('0' + (date.getMonth() + 1)).slice(-2);
          const day = ('0' + date.getDate()).slice(-2);
          return `${year}-${month}-${day}`;
        }
        
  GET_CUSTOMER_LIST() {

        const payload = {
      COMPANY_ID: this.selected_Company_id,
      CUSTOMER_ID:this.select_customer_id||0,
      DATE_FROM: this.formatted_from_date ,
      DATE_TO: this.formatted_To_date 
    };


    console.log(payload,'=====================payload========================================')
    this.dataservice.Aged_receivable_report_Api(payload).subscribe((res:any)=>{
      console.log(res)
     this.AgedList_Datasource=res. Data
    })
  }
    onViewClick(e: any) {
    console.log(e, '=======event==========');
     const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    const trans_id = e.row.data.TRANS_ID;    
const customer_id= e.row.data.CUSTOMER_ID
const invoice_id= e.row.data.BILL_ID

if(customer_id){

  this.customer_details={
    CUSTOMER_ID:customer_id,
    SALE_ID:invoice_id,
    DATE_FROM:this.formatted_from_date,
    DATE_TO:this.formatted_To_date,
    COMPANY_ID: this.selected_Company_id
  }
  sessionStorage.setItem('customerDetails', JSON.stringify(this.customer_details));

  // ✅ Retrieve and parse back into object
  const storedData = sessionStorage.getItem('customerDetails');
  if (storedData) {
    this.customer_details = JSON.parse(storedData);
  }

    this.router.navigate(['/aged-receivable-details']);
   
    }
  }
      formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

    handleClose(){
  this.isViewInvoice = false
    }
      summaryColumnsData = {
        groupItems: [
    {
      column: 'AGE_0_30',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_31_60',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_61_90',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_91_120',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_121_150',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_151_180',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'AGE_ABOVE_180',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'BALANCE',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
  ],
      totalItems: [

            {
          column: 'AGE_0_30',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_0_30',
          alignment: 'right',
        },
        
        {
          column: 'AGE_31_60',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_31_60',
          alignment: 'right',
        },
            {
          column: 'AGE_61_90',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_61_90',
          alignment: 'right',
        },
            {
          column: 'AGE_91_120',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_91_120',
          alignment: 'right',
        },
                    {
          column: 'AGE_151_180',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_151_180',
          alignment: 'right',
        },
                    {
          column: 'AGE_ABOVE_180',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AGE_91_120',
          alignment: 'right',
        },
            {
          column: 'TOTAL_BALANCE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'TOTAL_BALANCE',
          alignment: 'right',
        },
     
      ],
      calculateCustomSummary: (options) => {
        if (options.name === 'summaryRow') {
          // Custom logic if needed
        }
      },
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

    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,

    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule
    
  ],
  providers: [],
  declarations: [AgedReceivablesComponent],
  exports: [AgedReceivablesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgedReceivablesModule {}
