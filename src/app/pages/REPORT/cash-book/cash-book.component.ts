// import { Component } from '@angular/core';
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
  DxLoadPanelModule,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoLoadPanelModule,
} from 'devextreme-angular/ui/nested';

import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { AddMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { DepreciationEditModule } from '../../Depreciation/depreciation-edit/depreciation-edit.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { AddSalaryPaymentModule } from 'src/app/components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';

@Component({
  selector: 'app-cash-book',
  templateUrl: './cash-book.component.html',
  styleUrls: ['./cash-book.component.scss'],
})
export class CashBookComponent {
  isEditJournalVoucher: boolean = false;
  isViewJournalVoucher: boolean = false;
  isViewDebitNote: boolean = false;
  selected_Company_id: any;
  selected_fin_id: any;
  Cash_book_datasource: any;
  company_list: any[] = [];
  selectedCompanyId = 1;
  company_id: any;
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.selected_To_date = today; // Today's date
    } else {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.selected_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.selected_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';

  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_Head_Id: any;
  Cash_book_Data_Values: any = [];
  selectedJournalVoucher: any;
  formatted_from_date: string;
  formatted_To_date: string;
  editLedgerPopup: boolean = false;
  selectedDebitNote: any;
  isViewCreditNote: boolean = false;
  selectedCreditNote: any;
  isViewInvoice: boolean = false;
  selectedInvoice: any;
  isEditReadOnly: boolean = true;
  selectedReceipt: any;
  editMiscPopup: boolean = false;
  isReadOnlyPayment: boolean = true;
  selectedmiscellaneousData: any;
  EditDepreciationPopupVisible: boolean = false;
  Selected_Depreciation_data: any;
  isViewReceipt: boolean = false;
  selectedPrePayment: any;
  editPrePaymentPopupOpened: boolean = false;
  isEditReceipt: boolean = false;
  isReadOnlyReceipt: boolean = true;
  editMiscPopupOpened: boolean = false;
  editSalaryPopup: boolean = false;
  selectedSalaryData: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataService.getMonths();
    // IMPORTANT: reset popups whenever page is entered again
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetPopups();
      });
  }
  ngOnInit() {
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.selected_from_date = new Date();
    this.selected_To_date = SystemDate;
    this.Cash_book_data();
  }

  resetPopups() {
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.editMiscPopup = false;
    this.editMiscPopupOpened = false;
    this.editSalaryPopup = false;
    this.isEditReceipt = false;
    this.EditDepreciationPopupVisible = false;
    this.editPrePaymentPopupOpened = false;

    this.selectedJournalVoucher = null;
    this.selectedDebitNote = null;
    this.selectedCreditNote = null;
    this.selectedInvoice = null;
    this.selectedReceipt = null;
    this.selectedmiscellaneousData = null;
    this.Selected_Depreciation_data = null;
    this.selectedPrePayment = null;
    this.selectedSalaryData = null;
  }
  ngAfterViewInit() {
    setTimeout(() => this.handleClose());
  }
  handleClose() {
    this.editMiscPopup = false;
    this.EditDepreciationPopupVisible = false;
    this.editPrePaymentPopupOpened = false;
    this.isEditReceipt = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.editMiscPopupOpened = false;
    this.editSalaryPopup = false;
    this.selectedJournalVoucher = null;
    this.selectedDebitNote = null;
    this.selectedCreditNote = null;
    this.selectedInvoice = null;
    this.selectedReceipt = null;
    this.selectedmiscellaneousData = null;
    this.Selected_Depreciation_data = null;
    this.selectedPrePayment = null;
    this.selectedSalaryData = null;

    // Optional but helpful
    this.cdr.detectChanges();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }

  Cash_book_data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date,
    };

    this.dataService.Cash_book_api(payload).subscribe((res: any) => {
      this.Cash_book_datasource = res.data;
    });
    this.Cash_book_Data_Values = this.Cash_book_datasource;
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
  onHeadIdChange(event: any) {}

  formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
  onExporting(event: any) {
    const fileName = 'Ledger Statement Report';
    this.dataService.exportDataGridReport(event, fileName);
  }
  onViewClick(e: any) {
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE;

    const trans_id = e.row.data.TRANS_ID;

    if (TRANS_TYPE_ID == 4) {
      this.dataService
        .selectJournalVoucher(trans_id)
        .subscribe((response: any) => {
          this.selectedJournalVoucher = response.Data;
          this.isViewJournalVoucher = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 36) {
      this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
        this.selectedDebitNote = response.Data;
        this.isViewDebitNote = true;
        this.cdr.detectChanges();
      });
    } else if (TRANS_TYPE_ID === 37) {
      this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
        this.selectedCreditNote = response.Data;
        this.isViewCreditNote = true;
        this.cdr.detectChanges();
      });
    } else if (TRANS_TYPE_ID === 25) {
      this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
        this.selectedInvoice = response.Data;
        this.isViewInvoice = true;
        this.cdr.detectChanges();
      });
    } else if (TRANS_TYPE_ID === 27) {
      this.dataService
        .selectCustomerReceipt(trans_id)
        .subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isViewReceipt = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 3) {
      this.dataService
        .selectMiscPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedmiscellaneousData = response;
          this.editMiscPopupOpened = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 2) {
      this.dataService
        .selectMiscReceipt(trans_id)
        .subscribe((response: any) => {
          this.selectedmiscellaneousData = response;
          this.editMiscPopup = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 9) {
      this.dataService
        .select_Depreciation_Asset(trans_id)
        .subscribe((response: any) => {
          this.Selected_Depreciation_data = response.Data;
          this.EditDepreciationPopupVisible = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 38) {
      this.dataService
        .Select_PrePayment(trans_id)
        .subscribe((response: any) => {
          this.selectedPrePayment = response.Data;
          this.editPrePaymentPopupOpened = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 30) {
      this.dataService
        .selectSalaryPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedSalaryData = response.Data;
          this.editSalaryPopup = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE_ID === 21) {
      this.dataService
        .selectSupplierPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isEditReceipt = true;
          this.cdr.detectChanges();
        });
    } else {
    }
  }

  summaryColumnsData = {
    totalItems: [
      // 1. Total Debitṅ
      {
        column: 'REMARKS',
        summaryType: '',
        displayFormat: ' Total',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'REMARKS',
        alignment: 'right',
      },
      {
        column: 'REMARKS',
        summaryType: '',
        displayFormat: ' Closing Balance',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'REMARKS',
        alignment: 'right',
      },
      {
        column: 'REMARKS',
        summaryType: '',
        displayFormat: ' Grand Total',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'REMARKS',
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
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CR_AMOUNT',
        alignment: 'right',
      },
      // 3. Closing Balance (shows in Debit or Credit column based on value)
      {
        name: 'closingBalanceDr',
        summaryType: 'custom',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DR_AMOUNT',
        alignment: 'right',
      },
      {
        name: 'closingBalanceCr',
        summaryType: 'custom',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CR_AMOUNT',
        alignment: 'right',
      },
      // 4. Grand Total (sum of totals + closing balance)
      {
        name: 'grandTotalDr',
        summaryType: 'custom',
        displayFormat: '{0}',
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
    groupItems: [
      {
        column: 'DR_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'CR_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],

    calculateCustomSummary: (options: any) => {
      if (options.summaryProcess === 'finalize') {
        const items = this.Cash_book_datasource || [];

        const totalDr = items.reduce((sum, item) => {
          const val = parseFloat(
            String(item?.DR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const totalCr = items.reduce((sum, item) => {
          const val = parseFloat(
            String(item?.CR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const closingBalance = totalDr - totalCr;

        // Closing balance logic
        if (options.name === 'closingBalanceDr') {
          options.totalValue =
            closingBalance < 0 ? Math.abs(closingBalance) : 0; // ✅ show "0" instead of null
        }

        if (options.name === 'closingBalanceCr') {
          options.totalValue =
            closingBalance > 0 ? Math.abs(closingBalance) : 0; // ✅ show "0" instead of null
        }

        // Grand totals
        if (options.name === 'grandTotalDr') {
          options.totalValue =
            totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
        }

        if (options.name === 'grandTotalCr') {
          options.totalValue =
            totalCr + (closingBalance > 0 ? Math.abs(closingBalance) : 0);
        }

        // ✅ Always ensure totalValue is not null
        if (options.totalValue == null || isNaN(options.totalValue)) {
          options.totalValue = 0;
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
    ViewJournalVoucherModule,
    ViewDebitModule,
    ViewCreditNoteModule,
    ViewInvoiceModule,
    ViewCustomerReceiptModule,
    AddMiscReceiptModule,
    DepreciationEditModule,
    PrePaymentEditModule,
    EditSupplierPaymentModule,
    AddMiscellaneousPaymentModule,
    AddSalaryPaymentModule,
    DxLoadPanelModule,
    DxoLoadPanelModule,
  ],
  providers: [],
  declarations: [CashBookComponent],
  exports: [CashBookComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CashBookModule {}
