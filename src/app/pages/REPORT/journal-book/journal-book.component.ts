// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Router, NavigationEnd } from '@angular/router';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';

@Component({
  selector: 'app-journal-book',
  templateUrl: './journal-book.component.html',
  styleUrls: ['./journal-book.component.scss']
})
export class JournalBookComponent {



  Ledger_statement_datasource: any = [];
 readonly allowedPageSizes: any = [ 5,10, 'all'];
    displayMode: any = 'full';
  company_list: any[] = [];
  company_id: any;
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  ledgerSummaryData:any=[]
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_Head_Id: any;
  selected_fin_id: any;
isViewJournalVoucher :boolean = false;
  formatted_from_date: string;
  formatted_To_date: string;
  editLedgerPopup: boolean = false;
  isViewDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  isViewInvoice: boolean = false;
  isViewReceipt: boolean = false;
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selected_Company_id:any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = true;
  loadingInvoice = false;
  popupReady = false;

   defaultDate: Date = new Date();
  constructor(
    private dataService: DataService,
    private router: Router,
     private cdr: ChangeDetectorRef
  ) {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    // Detect when component is revisited
    // this.router.events
    //   .pipe(filter(event => event instanceof NavigationEnd))
    //   .subscribe((event) => {
    //     if (this.router.url.includes('ledger-statement')) {
    //       this.loadLedgerData();
    //     }
    //   });
  }

  ngOnInit() {
    // this.loadLedgerData();

    this.ledgerSummaryData=this.Ledger_statement_datasource
    this.onFromDateChange({ value: this.defaultDate });
    this.onToDateChange({ value: this.defaultDate });

  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }


     sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')
    
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
  console.log(this.selected_fin_id, '========financial year');
    
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
    this.dataService.HeadId_Dropdown_api(this.selected_fin_id).subscribe((res: any) => {
      this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
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

  load_JournalBook_data() {
    const payload = {
      CompanyId: this.selected_Company_id,
      FinId: this.selected_fin_id,
      DateFrom: this.formatted_from_date ?? this.selected_from_date,
      DateTo: this.formatted_To_date ?? this.selected_To_date
    };

    console.log(payload, '==========manual payload===========');

    this.dataService.Journal_Booking_Api(payload).subscribe((res: any) => {
      this.Ledger_statement_datasource = res.data || [];
         this.ledgerSummaryData=this.Ledger_statement_datasource
    });
  }




   

onViewClick(e: any){
console.log(e,'=======event==========');
 
 const TransType=e.row.data.TransType
  const trans_id=e.row.data.TransID

    this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;

if(TransType==4){
    this.dataService
      .selectJournalVoucher(trans_id)
      .subscribe((response: any) => {
          this.selectedJournalVoucher = response.Data;
           this.loadingInvoice = false;


           this.isViewJournalVoucher = true;
           this.cdr.detectChanges();
        console.log(
          this.selectedJournalVoucher,
          'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
        );
      });
}
else if(TransType === 36){

    this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
    this.selectedDebitNote = response.Data;
     this.loadingInvoice = false;

     this.isViewDebitNote = true;
     this.cdr.detectChanges();
    console.log(this.selectedDebitNote, "SELECTEDJOURNALVOUCHERRRRRRRRRRRR");
  });
}
  else if (TransType === 37) {
 
  console.log('=====navigate to 37-CREDIT NOTE=====');
    this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
    this.selectedCreditNote = response.Data;
     this.loadingInvoice = false;

      this.isViewCreditNote = true;
      this.cdr.detectChanges();
    console.log(this.selectedCreditNote, "SELECTEDJOURNALVOUCHERRRRRRRRRRRR");
  });
}
else if (TransType === 25) {
 
  console.log('=====navigate to 25-SALES INVOICE=====');
   this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
      this.selectedInvoice = response.Data;
       this.loadingInvoice = false;

        this.isViewInvoice = true;
        this.cdr.detectChanges();
      console.log(this.selectedInvoice, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
    });
}
     else if(TransType == 19){
      this.dataService
        .selectPurchaseInvoice(trans_id)
        .subscribe((response: any) => {
          this.selectedInvoice = response.Data;
 this.loadingInvoice = false;


          this.isEditInvoice = true;
          this.cdr.detectChanges();
         
        });
      }
 else if (TransType === 27) {
 
  console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
     this.dataService
      .selectCustomerReceipt(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isViewReceipt = true;
          this.cdr.detectChanges();
        console.log(this.selectedReceipt, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
      });
} 
//else {
//   console.log(Unknown TRANS_TYPE_ID: ${TransType});
// }
  } 
  //   totalItems: [
  //     {
  //       column: 'DR_AMOUNT',
  //       summaryType: 'sum',
  //       displayFormat: '{0}',
  //       valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
  //       showInColumn: 'DR_AMOUNT',
  //       alignment: 'right',
  //     },
  //     {
  //       column: 'CR_AMOUNT',
  //       summaryType: 'sum',
  //       displayFormat: '{0}',
  //       valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
  //       showInColumn: 'CR_AMOUNT',
  //       alignment: 'left',
  //     },
  //     {
  //       column: 'BALANCE',
  //       summaryType: 'sum',
  //       displayFormat: '{0}',
  //       valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
  //       showInColumn: 'BALANCE',
  //       alignment: 'right',
  //     },
  //   ],
  //   calculateCustomSummary: (options) => {
  //     if (options.name === 'summaryRow') {
  //       // Add custom logic here
  //     }
  //   },
  // };


summaryColumnsData = {
  totalItems: [
    // 1. Total Debitṅ
    {
      name: 'totalDr',
      column: 'DebitAmount',
      summaryType: 'sum',
      displayFormat: 'Total {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      showInColumn: 'DebitAmount',
      alignment: 'right',
    },
    // 2. Total Credit
    {
      name: 'totalCr',
      column: 'CreditAmount',
      summaryType: 'sum',
      displayFormat: 'Total {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      showInColumn: 'CreditAmount',
      alignment: 'right',
    },

  ],
   groupItems: [
    {
      column: 'DebitAmount',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'CreditAmount',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    // {
    //   column: 'TOTAL_PAIR_QTY',
    //   summaryType: 'sum',
    //   displayFormat: '{0}',
    //   valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
    //   alignByColumn: true,
    // },
  ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },

  // calculateCustomSummary: (options: any) => {
  //   if (options.summaryProcess === 'finalize') {
  //     const dataSource = options.component.getDataSource();
  //     const items = dataSource.items();
      
  //     if (items && items.length) {
  //       // Calculate totals
  //       const totalDr = items.reduce((sum, item) => sum + (Number(item.DR_AMOUNT) || 0), 0);
  //       const totalCr = items.reduce((sum, item) => sum + (Number(item.CR_AMOUNT) || 0), 0);
  //       const closingBalance = totalDr - totalCr;
        
  //       // Closing Balance logic
  //       if (options.name === 'closingBalanceDr') {
  //         options.totalValue = closingBalance > 0 ? closingBalance : null;
  //       }
  //       if (options.name === 'closingBalanceCr') {
  //         options.totalValue = closingBalance < 0 ? Math.abs(closingBalance) : null;
  //       }
        
  //       // Grand Total logic
  //       if (options.name === 'grandTotalDr') {
  //         options.totalValue = totalDr + (closingBalance > 0 ? closingBalance : 0);
  //       }
  //       if (options.name === 'grandTotalCr') {
  //         options.totalValue = totalCr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
  //       }
  //     }
  //   }
  // }


// calculateCustomSummary: (options: any) => {
//   if (options.summaryProcess === 'finalize') {
//     const items = this.ledgerSummaryData || [];
// console.log(items, 'items in custom summary calculation');

//     const totalDr = items.reduce((sum, item) => {
//   const val = parseFloat(String(item?.DR_AMOUNT || '0').replace(/,/g, '').trim());
//   return sum + (isNaN(val) ? 0 : val);
// }, 0);

// const totalCr = items.reduce((sum, item) => {
//   const val = parseFloat(String(item?.CR_AMOUNT || '0').replace(/,/g, '').trim());
//   return sum + (isNaN(val) ? 0 : val);
// }, 0);

// console.log('Total Debit:', totalDr, 'Total Credit:', totalCr);
//     const closingBalance = totalDr - totalCr;
// console.log('Closing Balance:', closingBalance);

//      if (options.name === 'closingBalanceCr') {
//       options.totalValue = closingBalance > 0 ? closingBalance : null;
//     }

//     if (options.name === 'closingBalanceDr') {
//       options.totalValue = closingBalance < 0 ? Math.abs(closingBalance) : null;
//     }

//      // Grand Total logic
//         if (options.name === 'grandTotalCr') {
//           options.totalValue = totalCr + (closingBalance > 0 ? closingBalance : 0);
//         }
//         if (options.name === 'grandTotalDr') {
//           options.totalValue = totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
//         }
//   }
// }




};

  handleClose() {
     this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.isEditInvoice = false;
  }

formatDates(cellData: any): string {
  const date = new Date(cellData);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}


    onExporting(event: any) {
    const fileName = 'Journal_Book';
    this.dataService.exportDataGridReport(event, fileName);
  }

}


@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    CommonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
      DxPopupModule,
      ViewJournalVoucherModule,
      ViewDebitModule,
      ViewCreditNoteModule,
  ViewInvoiceModule,
  ViewCustomerReceiptModule,
  EditPurchaseInvoiceModule,
  ],
  providers: [],
  exports: [],
  declarations: [JournalBookComponent],
})
export class JournalBookModule {}
