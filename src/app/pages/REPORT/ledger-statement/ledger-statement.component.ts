import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormsModule } from '@angular/forms';
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

import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { AddMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { DepreciationEditModule } from '../../Depreciation/depreciation-edit/depreciation-edit.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { AddSalaryPaymentModule } from 'src/app/components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';
import { ViewSalaryAdvanceModule } from 'src/app/HR/Masters/view-salary-advance/view-salary-advance.component';
// import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
// import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
@Component({
  selector: 'app-ledger-statement',
  templateUrl: './ledger-statement.component.html',
  styleUrls: ['./ledger-statement.component.scss'],
})
export class LedgerStatementComponent {
  
  Ledger_statement_datasource: any = [];
  isEditJournalVoucher: boolean = false;
  isViewJournalVoucher: boolean = false;
  isViewDebitNote: boolean = false;
  company_list: any[] = [];
  selectedCompanyId:any
  company_id: any;
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  ledgerSummaryData: any = [];
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
isReadOnlyPayment:boolean=true
  selectedmiscellaneousData:any
  editMiscPopupOpened: boolean = false;
  Selected_Depreciation_data:any
  EditDepreciationPopupVisible:boolean=false
editPrePaymentPopupOpened:boolean=false
selectedSalaryData:any
editSalaryPopup:boolean=false
selectedPrePayment:any
isEditReadOnly:boolean=true
selected_Data:any
isEditPopUp:boolean=false
loadingInvoice = false;
  popupReady = false;
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
        if (this.router.url.includes('ledger-statement')) {
          this.loadLedgerData();
        }
      });
  }

  ngOnInit() {


    this.loadLedgerData();

    this.ledgerSummaryData = this.Ledger_statement_datasource;
    this.dataService
      .HeadId_Dropdown_api(this.selected_Company_id)
      .subscribe((res: any) => {
        this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
        console.log(this.HEAD_ID_LIST);
      });
  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async loadLedgerData() {

    // this.ledgerSummaryData=this.Ledger_statement_datasource
    const sessiondata = this.getSessionData('viewclickvalue');
    const headid = this.getSessionData('HEADID');

    console.log(sessiondata)
     
    // if (!sessiondata) {
    //   console.log('No session data found!');
    //   return;
    // }

    const payload = {
      COMPANY_ID: Number(sessiondata.companyId),
      FIN_ID: Number(sessiondata.finId),
      HEAD_ID: headid,
      DATE_FROM: sessiondata.dateFrom,
      DATE_TO: sessiondata.dateTo,
    };

    console.log(payload, '=========payload=========');

    this.selectedCompanyId = payload.COMPANY_ID;
    this.selected_Head_Id = payload.HEAD_ID;
    this.selected_from_date = payload.DATE_FROM;
    this.selected_To_date = payload.DATE_TO;
 
   await this.dataService.get_ladger_statement_api(payload).subscribe((res: any) => {
      this.Ledger_statement_datasource = res.data || [];
      this.ledgerSummaryData = this.Ledger_statement_datasource;
    });
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
  load_Ledgre_data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      HEAD_ID: this.selected_Head_Id,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date,
    };

    console.log(payload, '==========manual payload===========');

    this.dataService.get_ladger_statement_api(payload).subscribe((res: any) => {
      this.Ledger_statement_datasource = res.data || [];
      this.ledgerSummaryData = this.Ledger_statement_datasource;
    });
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

    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    const trans_id = e.row.data.TRANS_ID;
    this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;
    //  this.isViewInvoice= true;

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
         this.isViewCreditNote=true
        this.cdr.detectChanges();
        console.log(this.selectedCreditNote, 'selected credit note');
      });
    } else if (TRANS_TYPE_ID === 25) {
      console.log('=====navigate to 25-SALES INVOICE=====');
      this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
        this.selectedInvoice = response.Data;
        this.loadingInvoice = false;

          // this.isEditInvoice = true;

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
    }       
     else if (TRANS_TYPE_ID === 3) {
      console.log('=====navigate to 2 mis payament=====');
      this.dataService
        .selectMiscPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedmiscellaneousData = response;
          this.cdr.detectChanges();
          this.editMiscPopupOpened = true;
        });
    } 
        else if (TRANS_TYPE_ID === 9) {
      console.log('=====navigate to 2 mis payament=====');
      this.dataService
        .select_Depreciation_Asset(trans_id)
        .subscribe((response: any) => {
          this.Selected_Depreciation_data = response.Data;
          this.EditDepreciationPopupVisible = true;
          this.cdr.detectChanges();
          console.log(
            this.Selected_Depreciation_data,
            'Selected_Depreciation_data====='
          );
        });
    } else if (TRANS_TYPE_ID === 38) {
      console.log('=====navigate to 2 mis payament=====');
      this.dataService
        .Select_PrePayment(trans_id)
        .subscribe((response: any) => {
          this.selectedPrePayment = response.Data;
          this.editPrePaymentPopupOpened = true;
          this.cdr.detectChanges();
          console.log(
            this.Selected_Depreciation_data,
            'Selected_Depreciation_data====='
          );
        });
    } 
    else if (TRANS_TYPE_ID === 30) {
      console.log('=====navigate =====');
      this.dataService
        .selectSalaryPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedSalaryData = response.Data;
          this.editSalaryPopup = true;
            this.cdr.detectChanges();
          console.log(
            this.selectedSalaryData,
            'Selected_Depreciation_data====='
          );

        });
    }
    else if (TRANS_TYPE_ID === 21) {
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
        else if (TRANS_TYPE_ID === 28) {
      console.log('=====navigate =====');
      this.dataService
        .select_Advance(trans_id)
        .subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
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
// POPUP shown → allow child to render
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }
  summaryColumnsData = {
    totalItems: [
      // 1. Total Debitṅ
                       {

        column: 'PARTICULARS',
        summaryType: '',
        displayFormat: ' Total',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PARTICULARS',
        alignment: 'right',
      },
                 {

        column: 'PARTICULARS',
        summaryType: '',
        displayFormat: ' Closing Balance',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PARTICULARS',
        alignment: 'right',
      },
                 {

        column: 'PARTICULARS',
        summaryType: '',
        displayFormat: ' Grand Total',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PARTICULARS',
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


    // calculateCustomSummary: (options: any) => {
    //   if (options.summaryProcess === 'finalize') {
    //     const items = this.ledgerSummaryData || [];

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

    calculateCustomSummary: (options: any) => {
  if (options.summaryProcess === 'finalize') {
    const items = this.ledgerSummaryData || [];

    const totalDr = items.reduce((sum, item) => {
      const val = parseFloat(
        String(item?.DR_AMOUNT || '0')
          .replace(/,/g, '')
          .trim()
      );
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const totalCr = items.reduce((sum, item) => {
      const val = parseFloat(
        String(item?.CR_AMOUNT || '0')
          .replace(/,/g, '')
          .trim()
      );
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const closingBalance = totalDr - totalCr;

    // Closing Balance
    if (options.name === 'closingBalanceCr') {
      options.totalValue = closingBalance > 0 ? closingBalance : 0;
    }

    if (options.name === 'closingBalanceDr') {
      options.totalValue = closingBalance < 0 ? Math.abs(closingBalance) : 0;
    }

    // Grand Total
    if (options.name === 'grandTotalCr') {
      options.totalValue =
        totalCr + (closingBalance > 0 ? closingBalance : 0);
    }
    if (options.name === 'grandTotalDr') {
      options.totalValue =
        totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
    }
  }
},

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
    FormTextboxModule,
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
    EditSupplierPaymentModule,
    AddMiscReceiptModule,
    DepreciationEditModule,
    PrePaymentEditModule,
    AddMiscellaneousPaymentModule,
    AddSalaryPaymentModule,
    ViewSalaryAdvanceModule,

  ],
  providers: [],
  declarations: [LedgerStatementComponent],
  exports: [LedgerStatementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LedgerStatementModule {}
