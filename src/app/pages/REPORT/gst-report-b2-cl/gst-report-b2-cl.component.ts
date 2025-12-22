import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, NgModule } from '@angular/core';
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
import { EditMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/edit-misc-receipt/edit-misc-receipt.component';
import { AddMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { PurchaseReturnDebitFormModule } from '../../purchase-return-debit-form/purchase-return-debit-form.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { PrepaymentPostingEditModule } from '../../PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
import { TransferOutInventoryAddModule } from '../../transfer-out-inventory-add/transfer-out-inventory-add.component';
import { TransferInInventoryModule } from '../../transfer-in-inventory/transfer-in-inventory.component';
import { TransferInInventoryFormModule } from '../../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { EditCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';



@Component({
  selector: 'app-gst-report-b2-cl',
  templateUrl: './gst-report-b2-cl.component.html',
  styleUrls: ['./gst-report-b2-cl.component.scss']
})
export class GstReportB2CLComponent {
  GST_datasource:any[]=[];
      readonly allowedPageSizes: any = [ 5,10, 'all'];
    displayMode: any = 'full';
      formatted_from_date: string;
  formatted_To_date: string;
   defaultDate: Date = new Date();
loadingInvoice = false;

   isViewDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  isViewInvoice: boolean = false;
  isViewReceipt: boolean = false;
  editMiscPopup:boolean = false;
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selected_Company_id:any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = true;
  editPrePaymentPopupOpened :boolean = false;
  isReadOnlyPayment:boolean = true;
  isEditReceipt : boolean = false;
  isReadOnlyReceipt : boolean=true;
   editMiscPopupOpened :boolean = false;
  isReadOnlyPurchaseReturn: boolean = true;
  isEditPurchaseReturn: boolean = false;
  selectedmiscellaneousData: any;
  selectedPrePayment: any;
  selectedSupplierPayment: any;
  selectedPurchaseReturn: any;
selectedMiscPayment: any;
  selecte_prepayment_Data: any;
  isEditPopupPrepaymentPosting: boolean = false;
  selectedTrOut: any;
  isEditTransferOut:boolean = false;
  isReadOnlyTrOut : boolean= true;
  selectedTrIn: any;
  isEditTransferIn: boolean = false;
isReadOnlyTrIn: boolean = true;
isEditCustomerReceipt:boolean = false;
  editLedgerPopup: boolean = false;
   isViewJournalVoucher: boolean = false;
   isEditReadOnly: boolean = true;
  selected_fin_id: any;
  fin_id: any;
    savedUserData: any;
  selected_from_date: string;
  selected_To_date: string;
   popupReady = false;
  ledgerSummaryData:any=[]

   constructor(
       private dataService: DataService,
       private router: Router,
        private cdr: ChangeDetectorRef
     ) {
      this.sesstion_Details();
      this.get_fin_id();
     }

       ngOnInit() {
    // this.loadLedgerData();

    this.ledgerSummaryData=this.GST_datasource
    this.onFromDateChange({ value: this.defaultDate });
    this.onToDateChange({ value: this.defaultDate });

  }
      sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')
    
  }


  get_fin_id() {
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
    if (this.fin_id.length) {
      this.selected_fin_id = this.fin_id[0].FIN_ID;
    }
  console.log(this.selected_fin_id, '========financial year');
    
  }


       onExporting(event: any) {
    const fileName = 'GST Report';
    this.dataService.exportDataGridReport(event, fileName);
  }

      onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDates(cellData: any): string {
  const date = new Date(cellData);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

    handleClose() {
     this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.isEditInvoice = false;
    this.editMiscPopup = false;
  }

    summaryColumnsData = {
    totalItems: [
      // 1. Total Debitṅ
      {
        name: 'totalDr',
        column: 'INVOICE_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'INVOICE_AMOUNT',
        alignment: 'right',
      },
      // 2. Total Credit
      {
        name: 'totalCr',
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CreditAmount',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'INVOICE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TAXABLE_AMOUNT',
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
  };

  load_GST_data(){
       const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date
    };

    console.log(payload, '==========manual payload===========');

    this.dataService.GST_Report_Api_B2CL(payload).subscribe((res: any) => {
      console.log(res)
      this.GST_datasource = res.DATA || [];
         this.ledgerSummaryData=this.GST_datasource
    });
  }

  onViewClick(e: any){
console.log(e,'=======event==========');
 
 const TransType=e.row.data.DOC_TYPE
  const trans_id=e.row.data.TRANS_ID

    this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;
console.log(TransType , trans_id)
if(TransType==4){
    this.dataService
      .selectJournalVoucher(trans_id)
      .subscribe((response: any) => {
        console.log(response)
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
else if(TransType == 36){

    this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
      console.log(response)
    this.selectedDebitNote = response.Data;
     this.loadingInvoice = false;

     this.isViewDebitNote = true;
     this.cdr.detectChanges();
    console.log(this.selectedDebitNote, "SELECTEDJOURNALVOUCHERRRRRRRRRRRR");
  });
}
  else if (TransType == 37) {
 
  console.log('=====navigate to 37-CREDIT NOTE=====');
    this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
      console.log(response)
    this.selectedCreditNote = response.Data;
     this.loadingInvoice = false;

      this.isViewCreditNote = true;
      this.cdr.detectChanges();
    console.log(this.selectedCreditNote, "SELECTEDJOURNALVOUCHERRRRRRRRRRRR");
  });
}
else if (TransType == 25) {
 
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
 else if (TransType == 27) {
 
  console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
     this.dataService
      .selectCustomerReceipt(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isEditCustomerReceipt = true;
          this.cdr.detectChanges();
        console.log(this.selectedReceipt, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
      });
} 

else if (TransType == 2) {
 
  console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
     this.dataService
      .selectMiscReceipt(trans_id).subscribe((response: any) => {
        console.log(response)
          this.selectedmiscellaneousData = response.Data;
          this.editMiscPopup = true;
          this.cdr.detectChanges();
        console.log(this.selectedmiscellaneousData, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
      });
} 
else if (TransType == 38) {
 
  console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
     this.dataService
      .Select_PrePayment(trans_id).subscribe((response: any) => {
        console.log(response)
          this.selectedPrePayment = response.Data;
          this.editPrePaymentPopupOpened = true;
          this.cdr.detectChanges();
          console.log(
            this.selectedPrePayment,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    } else if (TransType == 21) {
      console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
      this.dataService
        .selectSupplierPayment(trans_id)
        .subscribe((response: any) => {
          console.log(response);
          this.selectedSupplierPayment = response.Data;
          console.log(this.selectedSupplierPayment);
          this.isEditReceipt = true;
          this.cdr.detectChanges();
          console.log(
            this.selectedPrePayment,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    } else if (TransType == 20) {
      console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
      this.dataService
        .selectPurchaseReturn(trans_id)
        .subscribe((response: any) => {
          console.log(response);
          this.selectedPurchaseReturn = response;
          this.isEditPurchaseReturn = true;

          this.cdr.detectChanges();
          console.log(
            this.selectedPurchaseReturn,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    } 
    else if (TransType == 14) {
      console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
      this.dataService
        .selectTransferOutForInventory(trans_id)
        .subscribe((response: any) => {
          console.log(response);
          this.selectedTrOut = response;
          console.log(this.selectedTrOut);
          this.isEditTransferOut = true;

          this.cdr.detectChanges();
          console.log(
            this.selectedTrOut,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    }
    else if (TransType == 15) {
  console.log('=====navigate to 25-SALES INVOICE=====');
   this.dataService.selectTransferInForInventory(trans_id).subscribe((response: any) => {
      this.selectedTrIn = response;
       this.loadingInvoice = false;

        this.isEditTransferIn = true;
        this.cdr.detectChanges();
      console.log(this.selectedTrIn, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
    });
}
    else if (TransType == 39) {
      console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
      this.dataService
        .select_Prepayment_Posting(trans_id)
        .subscribe((response: any) => {
          console.log(response);
          this.selecte_prepayment_Data = response.Data;
          this.isEditPopupPrepaymentPosting = true;

          this.cdr.detectChanges();
          console.log(
            this.selecte_prepayment_Data,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    } 
    else if (TransType == 3) {
      console.log('=====navigate to 27-CUSTOMER RECEIPTS=====');
      this.dataService
        .selectMiscPayment(trans_id)
        .subscribe((response: any) => {
          console.log(response);
          this.selectedmiscellaneousData = response;
          console.log(this.selectedmiscellaneousData);
          this.editMiscPopupOpened = true;

          this.cdr.detectChanges();
          console.log(
            this.selectedmiscellaneousData,
            'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
          );
        });
    }
    //else {
    //   console.log(Unknown TRANS_TYPE_ID: ${TransType});
    // }
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
  AddMiscReceiptModule,
  PrePaymentEditModule,
  EditSupplierPaymentModule,
  PurchaseReturnDebitFormModule,
  AddMiscellaneousPaymentModule,
  PrepaymentPostingEditModule,
  TransferOutInventoryAddModule,
  TransferInInventoryFormModule,
  EditCustomerReceiptModule,
  ],
  providers: [],
  exports: [],
  declarations: [GstReportB2CLComponent],
})
export class GstReportB2CLModule {}