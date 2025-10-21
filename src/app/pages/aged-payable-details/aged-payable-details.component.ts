import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxAutocompleteModule, DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxTabsModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule, DxoLookupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditPurchaseInvoiceModule } from '../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { filter } from 'rxjs/operators';
import { PrePaymentEditModule } from '../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { EditSupplierPaymentModule } from '../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';

@Component({
  selector: 'app-aged-payable-details',
  templateUrl: './aged-payable-details.component.html',
  styleUrls: ['./aged-payable-details.component.scss']
})
export class AgedPayableDetailsComponent {
           AgedPayableDetailsDataSource: any[] = [];
           selected_Head_Id: any;
           selected_Suppier_id: any;
           HEAD_ID_LIST: any[] = [];
           formatted_from_date: string;
           formatted_To_date: string;
           selected_from_date: any;
           selected_To_date: any;
           savedUserData: any;
           company_list: any[] = [];
           selectedCompanyId:any
           company_id: any;
           fin_id: any[] = [];
           selected_fin_id: any;
           selectedDebitNote: any;
           isViewDebitNote: boolean;
           selected_Company_id: any;
             loadingInvoice = false;
  popupReady = false;
           selected_Purch_id: any;
           isEditInvoiceReadOnly: boolean = true;
           isReadOnlyReceipt:boolean = true;
           isEditReadOnly: boolean = true;
           ledgerSummaryData: any = [];
           readonly allowedPageSizes: any = [ 5,10, 'all'];
           displayMode: any = 'full';
            Supplier:any;
          selectedSupplierId: any;
          SuppID: any
          selectedInvoice: any;
          selectedReceipt:any;
          selectedPrePayment:any;
           isEditInvoice: boolean = false;
           isEditReceipt: boolean = false;
           editPrePaymentPopupOpened: boolean = false;

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
                                           if (this.router.url.includes('aged-payable-details')) {
                                             this.loadLedgerData();
                                            
                                           }
                                         });
                                     }

                       onExporting(event: any) {
    const fileName = 'Supplier Statement Details Report';
    this.dataService.exportDataGridReport(event, fileName);
  }

   ngOnInit() {


    this.loadLedgerData();

    this.ledgerSummaryData = this.AgedPayableDetailsDataSource;
    // this.dataService
    //   .HeadId_Dropdown_api(this.selected_Company_id)
    //   .subscribe((res: any) => {
    //     this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
    //     console.log(this.HEAD_ID_LIST);
    //   });
    this.dataService.Supplier_Dropdown().subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  onSupplierChanged(event:any){
    console.log(event,'event')
    this.selectedSupplierId = event.value

      // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find((item: any) => item.ID === this.selectedSupplierId);
    if (selectedSupplier) {
      console.log('Selected ID:', selectedSupplier.ID);
      console.log('Selected Description:', selectedSupplier.DESCRIPTION);
    }

    // this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
    // console.log(this.selectedSupplierName,'======supplier name========')

  }


   handleClose() {
    this.isEditInvoice = false;
    this.isEditReceipt = false;
    this.editPrePaymentPopupOpened = false;
    this.isViewDebitNote = false;
    this.popupReady = false;
    this.selectedInvoice = null;
    this.loadingInvoice = false;
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

  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')

    // this.selected_Purch_id=sessionData.SELECTED_PURCH_ID
    // console.log(this.selected_Purch_id,'============selected_Purch_id==============')

    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')
    
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

    formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }


    async loadLedgerData() {
    // this.ledgerSummaryData=this.Ledger_statement_datasource
    const sessiondata = this.getSessionData('supplierViewClick');
    const suppid = this.getSessionData('SUPPID');
    const purchid = this.getSessionData('PURCHID');
    console.log(suppid, '========suppid=========');
    console.log(purchid, '========purchid=========');

    console.log(sessiondata)
     
    // if (!sessiondata) {
    //   console.log('No session data found!');
    //   return;
    // }

    const payload = {
      COMPANY_ID: Number(sessiondata.COMPANY_ID),
      SUPP_ID: suppid,
      PURCH_ID : purchid,
      DATE_FROM: sessiondata.DATE_FROM,
      DATE_TO: sessiondata.DATE_TO,
    };

    console.log(payload, '=========payload=========');

     this.selectedCompanyId = payload.COMPANY_ID;
    this.selectedSupplierId = payload.SUPP_ID;
    this.selected_from_date = payload.DATE_FROM;
    this.selected_To_date = payload.DATE_TO;
 
   await this.dataService.SupplierDetails_Report_Api(payload).subscribe((res: any) => {
    console.log(res, '========Supplier Statement Details Data=========');
      this.AgedPayableDetailsDataSource = res.data || [];
      this.ledgerSummaryData = this.AgedPayableDetailsDataSource;
      this.cdr.detectChanges();
    });
  }

  load_Ledgre_data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,

      // PURCH_ID: purchid || 0,
      SUPP_ID: this.selectedSupplierId,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date,
    };

    console.log(payload, '==========manual payload===========');

    this.dataService.SupplierDetails_Report_Api(payload).subscribe((res: any) => {
      this.AgedPayableDetailsDataSource = res.data || [];
      this.ledgerSummaryData = this.AgedPayableDetailsDataSource;
    });
  }


//     onViewClick(e: any) {
//     console.log(e, '=======event==========');
//     const trans_id = e.row.data.TRANS_ID;

//   this.selectedInvoice = null;
//     this.loadingInvoice = true;
//     this.popupReady = false;
//      this.isEditInvoice = true;

//       this.dataService
//         .selectPurchaseInvoice(trans_id)
//         .subscribe((response: any) => {
//           this.selectedInvoice = response.Data;
//  this.loadingInvoice = false;

//           this.isEditInvoice = true;
//           this.cdr.detectChanges();
//           console.log(
//             this.selectedInvoice,
//             'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
//           );
//         });
    
//   }

   onViewClick(e: any) {
    console.log(e, '=======event==========');
    const trans_id = e.row.data.TRANS_ID;
const TRANS_TYPE = e.row.data.TRANS_TYPE
  
  this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;
    

     if(TRANS_TYPE == 19){
      this.dataService
        .selectPurchaseInvoice(trans_id)
        .subscribe((response: any) => {
          this.selectedInvoice = response.Data;
 this.loadingInvoice = false;


          this.isEditInvoice = true;
          this.cdr.detectChanges();
         
        });
      }
      else if(TRANS_TYPE == 38){
        this.dataService.Select_PrePayment(trans_id).subscribe((res: any) => {
    console.log(res);

    // Store original string if needed
    this.selectedPrePayment = res.Data;
    this.editPrePaymentPopupOpened = true;
    this.cdr.detectChanges();
    // {
    //   ...res.Data,
    //   TRANS_STATUS: res.Data.TRANS_STATUS === 'Approved' // ✅ boolean for checkbox
    // };

  });
      }
      else if(TRANS_TYPE == 21){
             this.dataService.selectSupplierPayment(trans_id).subscribe((response: any) => {
    this.selectedReceipt = response.Data;

    // Set a flag to determine if the form should be read-only
    this.isEditReceipt = true;
    this.cdr.detectChanges();

    // Navigate to form component or open the form popup (depending on your app)
    console.log(this.selectedReceipt, 'SELECTED RECEIPT');
  });
      }
      else if(TRANS_TYPE == 36){
          this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
    this.selectedDebitNote = response.Data;
    
      // Open view popup
      this.isViewDebitNote = true;
      this.cdr.detectChanges();
    
    console.log(this.selectedDebitNote, "SELECTEDJOURNALVOUCHERRRRRRRRRRRR");
  });
      }
      else {
      console.log(`Unknown TRANS_TYPE_ID: ${TRANS_TYPE}`);
    }
    }

    // POPUP shown → allow child to render
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
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
    const items = this.ledgerSummaryData || [];

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
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
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
    DxTabPanelModule,
    DxTabsModule,
    FormsModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    ViewDebitModule,
    ViewCreditNoteModule,
    ViewInvoiceModule,
    ViewCustomerReceiptModule,
    EditPurchaseInvoiceModule,
    PrePaymentEditModule,
    EditSupplierPaymentModule,
    ViewDebitModule,
  ],
  providers: [],
  declarations: [AgedPayableDetailsComponent],
  exports: [AgedPayableDetailsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgedPayableDetailsModule {}