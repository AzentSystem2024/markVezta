// import { Component } from '@angular/core';
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
  DxoLoadPanelModule,
} from 'devextreme-angular/ui/nested';
import { filter } from 'rxjs';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';

@Component({
  selector: 'app-output-vat',
  templateUrl: './output-vat.component.html',
  styleUrls: ['./output-vat.component.scss'],
})
export class OutputVatComponent {
  @Input() EditingResponseData: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  CustomerListDataSource: any[] = [];
  auto: string = 'auto';
  isFilterRowVisible: boolean = false;
  isEditJournalVoucher: boolean = false;
  isViewJournalVoucher: boolean = false;
  isViewDebitNote: boolean = false;
  company_list: any[] = [];
  selectedCompanyId: any;
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
  isReadOnlyReceipt: boolean = true;
  isEditReceipt: boolean = false;
  select_customer_id: any;
  customer_list: any;
  loadingInvoice = false;
  popupReady = false;
  // financialYeaDate: any;
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selected_vat_id: any;
  sessionData: any;
  Store: any;
  selectedStoreid: any;
  isReadOnlyInvoice: boolean = false;
  isLoading = false;


  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    this.store_dropdown();

    // Detect when component is revisited
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.router.url.includes('customer-statement-details')) {
          // this.loadLedgerData();
        }
      });

    this.get_customer_list();
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  ngOnInit() {
    this.onToDateChange({ value: this.defaultDate });
    this.onFromDateChange({ value: this.financialYeaDate });
    this.Load_Output_vat();
    // this.get_customer_list()

    // this.loadLedgerData();

    this.customerSummaryData = this.CustomerListDataSource;
    this.dataService
      .HeadId_Dropdown_api(this.selected_Company_id)
      .subscribe((res: any) => {
        this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
        console.log(this.HEAD_ID_LIST);
      });
  }

  get_customer_list() {
    const payload = {
      NAME: 'CUSTOMER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Customer_Dropdown(payload).subscribe((res: any) => {
      this.customer_list = res;
      console.log(this.customer_list);
    });
  }

  storeHint: string = '';

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store.filter((x) =>
      this.selectedStoreid.includes(x.ID),
    ).map((x) => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

  Load_Output_vat() {
     this.isLoading = true;
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      STORE_ID: this.selectedStoreid?.join(',') || '',
      FIN_ID : this.selected_fin_id
    };

    this.dataService.Output_VAT_Report_Api(payload).subscribe({
    next: (res: any) => {
      this.CustomerListDataSource = res.Data || [];
      this.customerSummaryData = this.CustomerListDataSource;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.isLoading = false;
    }
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

    this.dataService
      .HeadId_Dropdown_api(this.selected_Company_id)
      .subscribe((res: any) => {
        this.HEAD_ID_LIST = res;
        console.log('===============ledger=========', res);
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

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
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
    // this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;
    //  this.isViewInvoice= true;

    const TRANS_TYPE_ID = e.row.data.DOC_TYPE;
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
        console.log(this.selectedDebitNote, 'selected debit note');
      });
    } else if (TRANS_TYPE_ID === 37) {
      this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
        this.selectedCreditNote = response.Data;
        this.isViewCreditNote = true;
        this.cdr.detectChanges();
      });
    } else if (TRANS_TYPE_ID === 25) {
      this.dataService
        .selectInvoiceRetail(trans_id)
        .subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          console.log(this.selectedInvoice);
          // this.loadingInvoice = false;
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
    //  else if (TRANS_TYPE_ID === 27) {
    //   this.dataService
    //     .selectCustomerReceipt(trans_id)
    //     .subscribe((response: any) => {
    //       this.selectedReceipt = response.Data;
    //       this.isViewReceipt = true;
    //       this.cdr.detectChanges();
    //     });
    // } else if (TRANS_TYPE_ID === 21) {
    //   this.dataService
    //     .selectSupplierPayment(trans_id)
    //     .subscribe((response: any) => {
    //       this.selectedReceipt = response.Data;
    //       this.isEditReceipt = true;
    //       this.cdr.detectChanges();
    //     });
    // } else {
    // }
  }
  // POPUP shown → allow child to render
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }
  summaryColumnsData = {
    totalItems: [
      {
        column: 'EXEMPTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'EXEMPTED',
        alignment: 'right',
      },
      {
        column: 'ZERO_RATE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ZERO_RATE',
        alignment: 'right',
      },
      {
        column: 'STANDARD_RATE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'STANDARD_RATE',
        alignment: 'right',
      },
      {
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TAXABLE_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'TAX_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TAX_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TOTAL',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'EXEMPTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ZERO_RATE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'STANDARD_RATE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TAX_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TOTAL',
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

  onExporting(event: any) {
    const fileName = 'Output VAT';
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
    ViewCreditNoteModule,
    DxoLoadPanelModule,
    AddInvoiceRetailModule,
  ],
  providers: [],
  declarations: [OutputVatComponent],
  exports: [OutputVatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OutputVatModule {}
