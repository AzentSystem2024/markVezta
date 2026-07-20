import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

// Module Imports
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { AddMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { PurchaseReturnDebitFormModule } from '../../purchase-return-debit-form/purchase-return-debit-form.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { PrepaymentPostingEditModule } from '../../PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
import { TransferOutInventoryAddModule } from '../../transfer-out-inventory-add/transfer-out-inventory-add.component';
import { TransferInInventoryFormModule } from '../../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { EditCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import { SaleReturnFormModule } from 'src/app/sale-return-form/sale-return-form.component';
import { ProductionJvViewModule } from 'src/app/production-jv-view/production-jv-view.component';
import { PayrollViewModule } from 'src/app/components/HR/Masters/payroll-view/payroll-view.component';
import { MiscSalesInvoiceFormModule } from '../../Operations/POPUP PAGES/misc-sales-invoice-form/misc-sales-invoice-form.component';
import { PayrollViewReportModule } from 'src/app/components/HR/Masters/payroll-view-report/payroll-view-report.component';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';

@Component({
  selector: 'app-journal-book',
  templateUrl: './journal-book.component.html',
  styleUrls: ['./journal-book.component.scss'],
})
export class JournalBookComponent implements OnInit, AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  // Grid Data
  JournalBookDataSource: DataSource;
  journalBookArray: any[] = [];
  journalBookCount = 0;
  ledgerSummaryData: any = [];

  // Pagination & Filtering
  readonly allowedPageSizes: any = [5, 10, 'all'];
  isFilterOpened = false;
  defaultDate: Date = new Date();

  // App State Data
  savedUserData: any;
  company_list: any[] = [];
  fin_id: any[] = [];
  HEAD_ID_LIST: any[] = [];
  Store: any;
  vat_title: any;

  // Selected Context
  selected_Company_id: any;
  company_id: any;
  selected_fin_id: any;
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string;
  formatted_To_date: string;
  selected_Head_Id: any;
  selectedStoreid: any;
  storeHint: string = '';

  // Date Filters
  years: number[] = [];
  selectedYear: number | null = null;
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';

  // Popup Flags
  editLedgerPopup = false;
  isViewJournalVoucher = false;
  isViewDebitNote = false;
  isViewCreditNote = false;
  isViewInvoice = false;
  isRetailInvoice = false;
  isViewReceipt = false;
  isEditInvoice = false;
  isEditCustomerReceipt = false;
  editMiscPopup = false;
  editMiscPopupOpened = false;
  editPrePaymentPopupOpened = false;
  isEditReceipt = false;
  isEditPurchaseReturn = false;
  isEditTransferOut = false;
  isEditTransferIn = false;
  isEditPopupPrepaymentPosting = false;
  isEditSaleReturn = false;
  isMiscViewInvoice = false;
  viewPayrollPopupOpened = false;
  isViewProduction = false;
  isEditPopUp = false;

  // Read-Only Flags
  isEditReadOnly: boolean = true;
  isReadOnlyInvoice: boolean = true;
  isEditInvoiceReadOnly: boolean = true;
  isReadOnlyPayment: boolean = true;
  isReadOnlyReceipt: boolean = true;
  isReadOnlySaleReturn: boolean = true;
  isReadOnlyPurchaseReturn: boolean = true;
  isReadOnlyTrOut: boolean = true;
  isReadOnlyTrIn: boolean = true;

  // Selected Data (Popups)
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selectedmiscellaneousData: any;
  selectedPrePayment: any;
  selectedSupplierPayment: any;
  selectedPurchaseReturn: any;
  selectedMiscPayment: any;
  selecte_prepayment_Data: any;
  selectedTrOut: any;
  selectedTrIn: any;
  selectedSaleReturn: any;
  selectedProduction: any;
  selectedPayroll: any;
  selected_Data: any;

  // Loading States
  loadingInvoice = false;
  popupReady = false;

  // Summaries
  summaryColumnsData = {
    totalItems: [
      {
        name: 'totalDr',
        column: 'DebitAmount',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DebitAmount',
        alignment: 'right',
      },
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
    ],
    calculateCustomSummary: (options: any) => {
      // Custom logic if needed
    },
  };

  // Toolbar Configs
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    this.monthDataSource = this.dataService.getMonths();
    this.selectedmonth = new Date().getMonth();
  }

  ngOnInit() {
    this.resetPopups();
    const raw = sessionStorage.getItem('savedUserData');

    if (!raw) return;

    this.savedUserData = JSON.parse(raw);
    this.company_list = this.savedUserData?.Companies ?? [];
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS ?? [];
    this.selected_Company_id = this.savedUserData?.SELECTED_COMPANY?.COMPANY_ID ?? null;
    this.selected_fin_id = this.savedUserData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? null;
    this.vat_title = this.savedUserData?.GeneralSettings?.VAT_TITLE;

    if (!this.selected_Company_id || !this.selected_fin_id) return;

    const today = new Date();
    const SystemDate = this.formatDate(today);

    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;
    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;

    this.load_JournalBook_data();
    this.store_dropdown();
  }

  ngAfterViewInit() {
    setTimeout(() => this.resetPopups());
  }

  private reloadJournalBook() {
    if (!this.dataGrid?.instance) return;
    this.load_JournalBook_data();
  }

  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    
    if (this.selectedYear === currentYear) {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = today;
    } else {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = new Date(this.selectedYear, 11, 31);
    }
    this.reloadJournalBook();
  }

  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = new Date(this.selectedYear, 11, 31);
    } else {
      this.selected_from_date = new Date(this.selectedYear, this.selectedmonth, 1);
      this.selected_To_date = new Date(this.selectedYear, this.selectedmonth + 1, 0);
    }
    this.reloadJournalBook();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  resetPopups() {
    this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isRetailInvoice = false;
    this.isViewReceipt = false;
    this.isEditInvoice = false;
    this.isEditCustomerReceipt = false;
    this.editMiscPopup = false;
    this.editMiscPopupOpened = false;
    this.editPrePaymentPopupOpened = false;
    this.isEditReceipt = false;
    this.isEditPurchaseReturn = false;
    this.isEditTransferOut = false;
    this.isEditTransferIn = false;
    this.isEditPopupPrepaymentPosting = false;
    this.isEditSaleReturn = false;
    this.isMiscViewInvoice = false;
    this.viewPayrollPopupOpened = false;
    this.isViewProduction = false;
    this.isEditPopUp = false;
  }

  handleClose() {
    this.resetPopups();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.load_JournalBook_data();
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
    this.dataService.HeadId_Dropdown_api(this.selected_fin_id).subscribe((res: any) => {
      this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
    });
    this.reloadJournalBook();
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    this.reloadJournalBook();
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    this.reloadJournalBook();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  load_JournalBook_data() {
    const payload = {
      CompanyId: this.selected_Company_id,
      FinId: this.selected_fin_id,
      DateFrom: this.formatted_from_date ?? this.selected_from_date,
      DateTo: this.formatted_To_date ?? this.selected_To_date,
      STORE_ID: this.selectedStoreid?.length ? this.selectedStoreid.join(',') : '',
    };

    this.JournalBookDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.Journal_Booking_Api(payload).subscribe({
            next: (res: any) => {
              const list = res?.data || [];
              this.journalBookArray = list;
              this.journalBookCount = list.length;
              this.ledgerSummaryData = list;
              resolve(list);
            },
            error: () => {
              this.journalBookArray = [];
              this.journalBookCount = 0;
              this.ledgerSummaryData = [];
              resolve([]);
            },
          });
        }),
    });
  }

  onViewClick(e: any) {
    const TransType = e.row.data.TransType;
    const trans_id = e.row.data.TransID;

    this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;

    switch (TransType) {
      case 2:
        this.dataService.selectMiscReceipt(trans_id).subscribe((response: any) => {
          this.selectedmiscellaneousData = response.Data;
          this.editMiscPopup = true;
          this.cdr.detectChanges();
        });
        break;
      case 3:
        this.dataService.selectMiscPayment(trans_id).subscribe((response: any) => {
          this.selectedmiscellaneousData = response;
          this.editMiscPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;
      case 4:
        this.dataService.selectJournalVoucher(trans_id).subscribe((response: any) => {
          this.selectedJournalVoucher = response.Data;
          this.loadingInvoice = false;
          this.isViewJournalVoucher = true;
          this.cdr.detectChanges();
        });
        break;
      case 14:
        this.dataService.selectTransferOutForInventory(trans_id).subscribe((response: any) => {
          this.selectedTrOut = response;
          this.isEditTransferOut = true;
          this.cdr.detectChanges();
        });
        break;
      case 15:
        this.dataService.selectTransferInForInventory(trans_id).subscribe((response: any) => {
          this.selectedTrIn = response;
          this.loadingInvoice = false;
          this.isEditTransferIn = true;
          this.cdr.detectChanges();
        });
        break;
      case 19:
        this.dataService.selectPurchaseInvoice(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          this.isEditInvoice = true;
          this.cdr.detectChanges();
        });
        break;
      case 20:
        this.dataService.selectPurchaseReturn(trans_id).subscribe((response: any) => {
          this.selectedPurchaseReturn = response.Data;
          this.isEditPurchaseReturn = true;
          this.cdr.detectChanges();
        });
        break;
      case 21:
        this.dataService.selectSupplierPayment(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data || null;
          this.isEditReceipt = true;
          this.cdr.detectChanges();
        });
        break;
      case 25:
        if (this.vat_title === 'GST') {
          this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
            this.selectedInvoice = response.Data;
            this.isViewInvoice = true;
            this.isRetailInvoice = false;
            this.cdr.detectChanges();
          });
        } else {
          this.dataService.selectInvoiceRetail(trans_id).subscribe((response: any) => {
            this.selectedInvoice = response.Data;
            this.isRetailInvoice = true;
            this.isViewInvoice = false;
            this.cdr.detectChanges();
          });
        }
        break;
      case 26:
        this.dataService.selectSaleReturn(trans_id).subscribe((response: any) => {
          this.selectedSaleReturn = response;
          this.isEditSaleReturn = true;
          this.cdr.detectChanges();
        });
        break;
      case 27:
        this.dataService.selectCustomerReceipt(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isEditCustomerReceipt = true;
          this.cdr.detectChanges();
        });
        break;
      case 28:
        this.dataService.select_Advance(trans_id).subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
          this.cdr.detectChanges();
        });
        break;
      case 29:
        this.dataService.viewSelectedPayrollForReport(trans_id).subscribe((response: any) => {
          this.selectedPayroll = response;
          this.viewPayrollPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;
      case 36:
        this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
          this.selectedDebitNote = response.Data;
          this.loadingInvoice = false;
          this.isViewDebitNote = true;
          this.cdr.detectChanges();
        });
        break;
      case 37:
        this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
          this.selectedCreditNote = response.Data;
          this.loadingInvoice = false;
          this.isViewCreditNote = true;
          this.cdr.detectChanges();
        });
        break;
      case 38:
        this.dataService.Select_PrePayment(trans_id).subscribe((response: any) => {
          this.selectedPrePayment = response.Data;
          this.editPrePaymentPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;
      case 39:
        this.dataService.select_Prepayment_Posting(trans_id).subscribe((response: any) => {
          this.selecte_prepayment_Data = response.Data;
          this.isEditPopupPrepaymentPosting = true;
          this.cdr.detectChanges();
        });
        break;
      case 103:
      case 104:
        const apiCall = TransType === 104 
          ? this.dataService.selectBoxProduction(trans_id) 
          : this.dataService.selectProduction(trans_id);
        
        apiCall.subscribe((response: any) => {
          this.selectedProduction = response;
          this.isViewProduction = true;
          this.cdr.detectChanges();
        });
        break;
      case 105:
        this.dataService.getMiscSalesInvoiceByID(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response;
          this.isMiscViewInvoice = true;
          this.cdr.detectChanges();
        });
        break;
    }
  }

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store.filter((x: any) =>
      this.selectedStoreid.includes(x.ID),
    ).map((x: any) => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
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
    DxPopupModule,
    DxFormModule,
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
    SaleReturnFormModule,
    ProductionJvViewModule,
    PayrollViewModule,
    MiscSalesInvoiceFormModule,
    PayrollViewReportModule,
    DxTagBoxModule,
    AddInvoiceRetailModule,
  ],
  providers: [],
  exports: [],
  declarations: [JournalBookComponent],
})
export class JournalBookModule {}
