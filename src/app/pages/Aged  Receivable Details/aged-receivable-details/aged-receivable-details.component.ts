// import { Component } from '@angular/core';

import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  SimpleChanges,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';

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
import { filter } from 'rxjs';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';

@Component({
  selector: 'app-aged-receivable-details',
  templateUrl: './aged-receivable-details.component.html',
  styleUrls: ['./aged-receivable-details.component.scss']
})
export class AgedReceivableDetailsComponent {


    CustomerListDataSource:any[]=[]
    isEditJournalVoucher: boolean = false;
    isViewJournalVoucher: boolean = false;
    isViewDebitNote: boolean = false;
    company_list: any[] = [];
    selectedCompanyId:any
    company_id: any;
    HEAD_ID_LIST: any[] = [];
    fin_id: any[] = [];
    customerSummaryData: any = [];
    savedUserData: any;
    selected_from_date: any;
    selected_To_date: any;
    selected_Head_Id: any;
    selected_fin_id: any;
    selectedJournalVoucher: any;
    formatted_from_date: string;
    formatted_To_date: string;
    editLedgerPopup: boolean = false;
    selectedDebitNote: any;
    isViewCreditNote: boolean = false;
    selectedCreditNote: any;
    isViewInvoice: boolean = false;
    selectedInvoice: any;
    isViewReceipt: boolean = false;
    selectedReceipt: any;
    selected_Company_id: any;
    isReadOnlyReceipt:boolean=true
    isEditReceipt:boolean=false
  select_customer_id:any
  customer_list:any
  
    constructor(
      private dataService: DataService,
      private router: Router,
      private cdr: ChangeDetectorRef
    ) {
      this.get_sessionstorage_data();
      this.get_fin_id();
      this.sesstion_Details()
  
      // Detect when component is revisited
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          if (this.router.url.includes('customer-statement-details')) {
            this.loadLedgerData();
          }
        });
  
        this.get_customer_list()
    }
  
    ngOnInit() {
  
  this.get_customer_list()
  
      this.loadLedgerData();
  
      this.customerSummaryData = this.CustomerListDataSource;
      this.dataService
        .HeadId_Dropdown_api(this.selected_Company_id)
        .subscribe((res: any) => {
          this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
          console.log(this.HEAD_ID_LIST);
        });
    }
  
    // getSessionData(key: string) {
    //   const data = sessionStorage.getItem(key);
    //   return data ? JSON.parse(data) : null;
    // }
  
    async loadLedgerData() {
  
  
      
      // this.customerSummaryData=this.Ledger_statement_datasource
      // const sessiondata = this.getSessionData('customerDetails');
      // const headid = this.getSessionData('HEADID');
      const session=JSON.parse(sessionStorage.getItem('customerDetails'))
  
      console.log(session)
  
      this.select_customer_id=session.CUSTOMER_ID
      this.selected_from_date=session.DATE_FROM
      this.selected_To_date=session.DATE_TO
       
     await this.dataService.Customer_statement_Details_Api(session).subscribe((res: any) => {
        this.CustomerListDataSource = res.Data || [];
        this.cdr.detectChanges();
        this.customerSummaryData = this.CustomerListDataSource;
        
      });
    }
  
          get_customer_list(){
            this.dataService.Customer_Dropdown().subscribe((res:any)=>{
              console.log(res)
              this.customer_list=res
              console.log(this.customer_list)
            })
          }
  
  
  
    getSessionData(key: string) {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  
  
  
  
  
    get_sessionstorage_data() {
      this.savedUserData = this.getSessionData('savedUserData');
      if (this.savedUserData) {
        this.company_list = this.savedUserData.Companies || [];
      }
    }
  
    get_fin_id() {
      this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
      if (this.fin_id.length) {
        this.selected_fin_id = this.fin_id[0].FIN_ID;
      }
    }
  
    onCompanyChange(event: any) {
      this.company_id = event.value;
      console.log(this.company_id, 'COMPANYOD');
      this.dataService
        .HeadId_Dropdown_api(this.selected_Company_id)
        .subscribe((res: any) => {
          this.HEAD_ID_LIST = res
          console.log('===============ledger=========',res);
          
        });
    }
  
    onFromDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_from_date = this.formatDate(rawDate);
    }
  
    onToDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_To_date = this.formatDate(rawDate);
    }
  
    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
  
    onHeadIdChange(event: any) {
      // Optional: Update sessionStorage if needed
    }
  
    sesstion_Details(){
      const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
      console.log(sessionData,'=================session data==========')
  
      this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
      console.log(this.selected_Company_id,'============selected_Company_id==============')
  
  
      this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID
  
      console.log(this.selected_fin_id,'===========selected fin id===================')
      
    }
  
  
    formatDates(cellData: any): string {
      const date = new Date(cellData);
      if (isNaN(date.getTime())) return '';
  
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
  
      return `${day}-${month}-${year}`;
    }
  
    handleClose() {
      this.editLedgerPopup = false;
      this.editLedgerPopup = false;
      this.isViewJournalVoucher = false;
      this.isViewDebitNote = false;
      this.isViewCreditNote = false;
      this.isViewInvoice = false;
      this.isViewReceipt = false;
    }
  
  
    onViewClick(e: any) {
      console.log(e, '=======event==========');
  
      const TRANS_TYPE_ID = e.row.data.TRANS_TYPE;
      const trans_id = e.row.data.TRANS_ID;
  
      if (TRANS_TYPE_ID == 4) {
        this.dataService
          .selectJournalVoucher(trans_id)
          .subscribe((response: any) => {
            this.selectedJournalVoucher = response.Data;
  
            this.isViewJournalVoucher = true;
            this.cdr.detectChanges();
            console.log(
              this.selectedJournalVoucher,
              'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
            );
          });
      } else if (TRANS_TYPE_ID === 36) {
        this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
          this.selectedDebitNote = response.Data;
          this.isViewDebitNote = true;
          this.cdr.detectChanges();
          console.log(this.selectedDebitNote, 'selected debit note');
        });
      } else if (TRANS_TYPE_ID === 37) {
        console.log('=====navigate to 37-CREDIT NOTE=====');
        this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
          this.selectedCreditNote = response.Data;
          this.cdr.detectChanges();
          console.log(this.selectedCreditNote, 'selected credit note');
        });
      } else if (TRANS_TYPE_ID === 25) {
        console.log('=====navigate to 25-SALES INVOICE=====');
        this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          this.isViewInvoice = true;
          this.cdr.detectChanges();
          console.log(this.selectedInvoice, 'SELECTE SALES INVOICE');
        });
      } else if (TRANS_TYPE_ID === 27) {
        console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
        this.dataService
          .selectCustomerReceipt(trans_id)
          .subscribe((response: any) => {
            this.selectedReceipt = response.Data;
            this.isViewReceipt = true;
            this.cdr.detectChanges();
            console.log(this.selectedReceipt, 'Custom receipts=====');
          });
      }         else if (TRANS_TYPE_ID === 21) {
        console.log('=====navigate =====');
        this.dataService
          .selectSupplierPayment(trans_id)
          .subscribe((response: any) => {
            this.selectedReceipt = response.Data;
            this.isEditReceipt = true;
            this.cdr.detectChanges();
            console.log(
              this.selectedReceipt,
              'Selected_Depreciation_data====='
            );
          });
      }
      
      else {
        console.log(`Unknown TRANS_TYPE_ID: ${TRANS_TYPE_ID}`);
      }
  
      
    }
  
    summaryColumnsData = {
      totalItems: [
        // 1. Total Debitṅ
                         {
  
          column: 'NARRATION',
          summaryType: '',
          displayFormat: ' Total',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'NARRATION',
          alignment: 'right',
        },
                   {
  
          column: 'NARRATION',
          summaryType: '',
          displayFormat: ' Closing Balance',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'NARRATION',
          alignment: 'right',
        },
                   {
  
          column: 'NARRATION',
          summaryType: '',
          displayFormat: ' Grand Total',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'NARRATION',
          alignment: 'right',
        },
        {
          name: 'totalDr',
          column: 'DR_AMOUNT',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        // 2. Total Credit
        {
          name: 'totalCr',
          column: 'CR_AMOUNT',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
        // 3. Closing Balance (shows in Debit or Credit column based on value)
        {
          name: 'closingBalanceDr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        {
          name: 'closingBalanceCr',
          summaryType: 'custom',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
        // 4. Grand Total (sum of totals + closing balance)
        {
          name: 'grandTotalDr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        {
          name: 'grandTotalCr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
      ],
  
  calculateCustomSummary: (options: any) => {
    if (options.summaryProcess === 'finalize') {
      const items = this.customerSummaryData || [];
  
      const totalDr = items.reduce((sum, item) => {
        const val = parseFloat(
          String(item?.DR_AMOUNT || '0').replace(/,/g, '').trim()
        );
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  
      const totalCr = items.reduce((sum, item) => {
        const val = parseFloat(
          String(item?.CR_AMOUNT || '0').replace(/,/g, '').trim()
        );
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  
      const closingBalance = totalDr - totalCr;
  
      // Closing Balance Cr
      if (options.name === 'closingBalanceCr') {
        options.totalValue = closingBalance > 0 ? closingBalance : 0;
      }
  
      // Closing Balance Dr
      if (options.name === 'closingBalanceDr') {
        options.totalValue = closingBalance < 0 ? Math.abs(closingBalance) : 0;
      }
  
      // Grand Total Cr
      if (options.name === 'grandTotalCr') {
        options.totalValue = totalCr + (closingBalance > 0 ? closingBalance : 0);
      }
  
      // Grand Total Dr
      if (options.name === 'grandTotalDr') {
        options.totalValue = totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
      }
    }
  }
  
  
      // calculateCustomSummary: (options: any) => {
      //   if (options.summaryProcess === 'finalize') {
      //     const items = this.customerSummaryData || [];
  
      //     console.log(items, 'items in custom summary calculation');
  
      //     const totalDr = items.reduce((sum, item) => {
      //       const val = parseFloat(
      //         String(item?.DR_AMOUNT || '0')
      //           .replace(/,/g, '')
      //           .trim()
      //       );
      //       return sum + (isNaN(val) ? 0 : val);
      //     }, 0);
  
      //     const totalCr = items.reduce((sum, item) => {
      //       const val = parseFloat(
      //         String(item?.CR_AMOUNT || '0')
      //           .replace(/,/g, '')
      //           .trim()
      //       );
      //       return sum + (isNaN(val) ? 0 : val);
      //     }, 0);
  
      //     console.log('Total Debit:', totalDr, 'Total Credit:', totalCr);
      //     const closingBalance = totalDr - totalCr;
      //     console.log('Closing Balance:', closingBalance);
  
      //     if (options.name === 'closingBalanceCr') {
      //       options.totalValue = closingBalance > 0 ? closingBalance : null;
      //     }
  
      //     if (options.name === 'closingBalanceDr') {
      //       options.totalValue =
      //         closingBalance < 0 ? Math.abs(closingBalance) : null;
      //     }
  
      //     // Grand Total logic
      //     if (options.name === 'grandTotalCr') {
      //       options.totalValue =
      //         totalCr + (closingBalance > 0 ? closingBalance : 0);
      //     }
      //     if (options.name === 'grandTotalDr') {
      //       options.totalValue =
      //         totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
      //     }
      //   }
      // },
    };
  
    onExporting(event: any) {
      const fileName = 'Ledger Statement Report';
      this.dataService.exportDataGridReport(event, fileName);
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
    ViewCustomerReceiptModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule,
    ViewCreditNoteModule
  ],
  providers: [],
  declarations: [AgedReceivableDetailsComponent],
  exports: [AgedReceivableDetailsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgedReceivableDetailsModule {}
