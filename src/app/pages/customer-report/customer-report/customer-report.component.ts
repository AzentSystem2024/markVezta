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
import { CustomerStatementDetailsModule } from '../../custmer-statement-details/customer-statement-details/customer-statement-details.component';

@Component({
  selector: 'app-customer-report',
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss'],
})
export class CustomerReportComponent {


  
  CustomerListDataSource: any[]=[]
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
  formatted_from_date: string;
  formatted_To_date: string;
  HeadId: any;
  selected_fin_id: any;
customer_list:any[]=[]
  select_customer_id:any
  selectedInvoice: any;
  // customer_details: {};
defaultDate: Date = new Date();
financialYeaDate: string 
customer_details:any={
    CUSTOMER_ID:0,
    SALE_ID:0,
    DATE_FROM:'',
    DATE_TO:'',
    COMPANY_ID:0
  }
  constructor(private dataservice: DataService,private cdr: ChangeDetectorRef ,private router:Router)
  {
    this.sesstion_Details()
    this.get_customer_list()
  }
  ngOnInit() {
  // initialize with today's date
  this.onToDateChange({ value: this.defaultDate });
    this.onFromDateChange({ value: this.financialYeaDate });
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
 this.financialYeaDate=sessionYear[0].DATE_FROM
console.log(this.financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
this.formatted_from_date=this.financialYeaDate

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
        
        
        onFromDateChange(event: any) {
          const rawDate: Date = new Date(event.value);
          this.formatted_from_date = this.formatDate(rawDate);
          console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
        }
         
         
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
    this.dataservice.customer_report_Api(payload).subscribe((res:any)=>{
      console.log(res)
     this.CustomerListDataSource=res. Data
    })
  }
    onViewClick(e: any) {
    console.log(e, '=======event==========');
     const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    const trans_id = e.row.data.TRANS_ID;

const customer_id= e.row.data.CUSTOMER_ID
const invoice_id= e.row.data.INVOICE_ID

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

    this.router.navigate(['/customer-statement-details']);
    // this.router.navigate(['/customer-statement-details'], { state: { data: this.customer_details } });
}

    


      // this.dataservice
      //   .selectInvoice(trans_id)
      //   .subscribe((response: any) => {
      //     this.selectedInvoice = response.Data;

      //     this.isViewInvoice = true;
      //     this.cdr.detectChanges();
      //     console.log(
      //       this.selectedInvoice,
      //       'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
      //     );
      //   });
  

    
    }

    handleClose(){
  this.isViewInvoice = false
    }
      summaryColumnsData = {
      totalItems: [

        {
          column: 'NET_AMOUNT',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'NET_AMOUNT',
          alignment: 'right',
        },
        {
          column: 'RECEIVED_AMOUNT',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'RECEIVED_AMOUNT',
          alignment: 'right',
        },
        {
          column: 'RETURN_AMOUNT',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'RETURN_AMOUNT',
          alignment: 'right',
        },
        {
          column: 'ADJUSTED_AMOUNT',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'ADJUSTED_AMOUNT',
          alignment: 'right',
        },
        {
          column: 'BALANCE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'BALANCE',
          alignment: 'right',
        },
       
      ],
      groupItems: [
    {
      column: 'NET_AMOUNT',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'RECEIVED_AMOUNT',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'RETURN_AMOUNT',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'ADJUSTED_AMOUNT',
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
    ViewInvoiceModule,
    CustomerStatementDetailsModule
  ],
  providers: [],
  declarations: [CustomerReportComponent],
  exports: [CustomerReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerReportModule {}
