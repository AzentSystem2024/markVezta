import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
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
  DxValidationGroupComponent,
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
import DataSource from 'devextreme/data/data_source';

// Modules
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
import { ViewSalaryAdvanceModule } from 'src/app/components/HR/Masters/view-salary-advance/view-salary-advance.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { PurchaseReturnDebitFormModule } from '../../purchase-return-debit-form/purchase-return-debit-form.component';
import { TransferOutInventoryAddModule } from '../../transfer-out-inventory-add/transfer-out-inventory-add.component';
import { TransferInInventoryFormModule } from '../../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { EditCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import { SaleReturnFormModule } from 'src/app/sale-return-form/sale-return-form.component';
import { ProductionJvViewModule } from 'src/app/production-jv-view/production-jv-view.component';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { PayrollViewReportModule } from 'src/app/components/HR/Masters/payroll-view-report/payroll-view-report.component';
import { MiscSalesInvoiceFormModule } from '../../Operations/POPUP PAGES/misc-sales-invoice-form/misc-sales-invoice-form.component';

@Component({
  selector: 'app-ledger-statement',
  templateUrl: './ledger-statement.component.html',
  styleUrls: ['./ledger-statement.component.scss'],
})
export class LedgerStatementComponent implements OnInit {
  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup!: DxValidationGroupComponent;

  // -------------------------------------------------------------
  // Data Sources & Core Lists
  // -------------------------------------------------------------
  Ledger_statement_datasource!: DataSource;
  ledgerSummaryData: any = [];
  ledgerRowCount: number = 0;
  
  company_list: any[] = [];
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  Store: any;
  monthDataSource: { name: string; value: any }[];
  years: number[] = [];

  // -------------------------------------------------------------
  // Application State & Selection
  // -------------------------------------------------------------
  savedUserData: any;
  vat_title: any;
  
  selectedCompanyId: any;
  company_id: any;
  selected_Company_id: any;
  
  selected_Head_Id: any;
  selected_fin_id: any;
  selectedStoreid: any[] = [];
  storeHint: string = '';
  
  selectedYear: number | null = null;
  selectedmonth: any = '';
  
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: any;
  formatted_To_date: any;
  transtypeId: any;
  
  // -------------------------------------------------------------
  // Read-Only Flags
  // -------------------------------------------------------------
  isReadOnlyReceipt: boolean = true;
  isReadOnlyInvoice: boolean = true;
  isReadOnlyPayment: boolean = true;
  isEditReadOnly: boolean = true;
  isEditInvoiceReadOnly: boolean = true;
  isReadOnlyPurchaseReturn: boolean = true;
  isReadOnlyTrOut: boolean = true;
  isReadOnlyTrIn: boolean = true;
  isReadOnlySaleReturn: boolean = true;

  // -------------------------------------------------------------
  // Popup Visibility Flags
  // -------------------------------------------------------------
  isEditPopUp: boolean = false;
  editLedgerPopup: boolean = false;
  isViewJournalVoucher: boolean = false;
  isEditJournalVoucher: boolean = false;
  isViewDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  isViewInvoice: boolean = false;
  isRetailInvoice: boolean = false;
  isViewReceipt: boolean = false;
  isEditReceipt: boolean = false;
  editMiscPopupOpened: boolean = false;
  editMiscPopup: boolean = false;
  EditDepreciationPopupVisible: boolean = false;
  editPrePaymentPopupOpened: boolean = false;
  viewPayrollPopupOpened: boolean = false;
  editSalaryPopup: boolean = false;
  isEditInvoice: boolean = false;
  isEditPurchaseReturn: boolean = false;
  isEditTransferOut: boolean = false;
  isEditTransferIn: boolean = false;
  isEditCustomerReceipt: boolean = false;
  isEditSaleReturn: boolean = false;
  isViewBoxProduction: boolean = false;
  isViewProduction: boolean = false;
  isMiscViewInvoice: boolean = false;
  
  // -------------------------------------------------------------
  // Selected Data for Popups
  // -------------------------------------------------------------
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selectedmiscellaneousData: any;
  Selected_Depreciation_data: any;
  selectedPrePayment: any;
  selectedSalaryData: any;
  selected_Data: any;
  selectedPurchaseReturn: any;
  selectedTrOut: any;
  selectedTrIn: any;
  selectedSaleReturn: any;
  selectedProduction: any;
  selectedPayroll: any;

  // -------------------------------------------------------------
  // Loading & UI States
  // -------------------------------------------------------------
  loadingInvoice: boolean = false;
  popupReady: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this.router.url.includes('ledger-statement')) {
          this.loadLedgerData();
        }
      });

    // Initialize Year DataSource
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    
    // Initialize Month DataSource
    this.monthDataSource = this.dataService.getMonths();
    this.selectedmonth = new Date().getMonth();
  }

  ngOnInit() {
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;

    this.initSessionData();
    this.store_dropdown();

    if (this.selected_Company_id) {
      this.loadHeadList();
    }

    setTimeout(() => {
      this.popupReady = false;
      this.cdr.detectChanges();
    });

    this.loadLedgerData();
  }

  // -------------------------------------------------------------
  // Initialization & Session Handling
  // -------------------------------------------------------------
  initSessionData() {
    const sessionDataStr = sessionStorage.getItem('savedUserData');
    const localDataStr = localStorage.getItem('userData');
    
    this.savedUserData = sessionDataStr ? JSON.parse(sessionDataStr) : null;
    
    if (this.savedUserData) {
      this.company_list = this.savedUserData.Companies || [];
      this.fin_id = this.savedUserData.FINANCIAL_YEARS || [];
      
      if (this.fin_id.length) {
        this.selected_fin_id = this.fin_id[0].FIN_ID;
      }
      this.vat_title = this.savedUserData.GeneralSettings?.VAT_TITLE;
    }
    
    if (localDataStr) {
      const userData = JSON.parse(localDataStr);
      this.selected_Company_id = userData?.SELECTED_COMPANY?.COMPANY_ID;
    } else if (this.savedUserData?.SELECTED_COMPANY) {
       this.selected_Company_id = this.savedUserData.SELECTED_COMPANY.COMPANY_ID;
    }
  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  loadHeadList() {
    this.dataService
      .HeadId_Dropdown_api(this.selected_Company_id)
      .subscribe((res: any) => {
        this.HEAD_ID_LIST = res?.LEDGER_HEADS || [];
        console.log("ledger head id fetched",this.HEAD_ID_LIST)
      });
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
      const storeid = Number(sessionStorage.getItem('STOREID'));
      this.selectedStoreid = storeid ? [storeid] : [];
      this.updateStoreHint();
    });
  }

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }
    const selectedNames = this.Store
      ?.filter((x: any) => this.selectedStoreid.includes(x.ID))
      .map((x: any) => x.DESCRIPTION);
    this.storeHint = selectedNames ? selectedNames.join(', ') : 'No store selected';
  }

  // -------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------
  createLedgerDataSource(payload: any) {
    this.Ledger_statement_datasource = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          this.dataService.get_ladger_statement_api(payload).subscribe({
            next: (res: any) => {
              const data = res?.data || [];
              this.ledgerSummaryData = data;
              this.ledgerRowCount = data.length;
              resolve(data);
            },
            error: () => {
              this.ledgerRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  loadLedgerData() {
    const sessiondata = this.getSessionData('viewclickvalue');
    if (!sessiondata) return;

    const headid = this.getSessionData('HEADID');
    const storeid = this.getSessionData('STOREID');

    const payload = {
      COMPANY_ID: Number(sessiondata.companyId),
      FIN_ID: Number(sessiondata.finId),
      HEAD_ID: headid,
      DATE_FROM: sessiondata.dateFrom,
      DATE_TO: sessiondata.dateTo,
      STORE_ID: storeid ? String(storeid) : '',
    };

    this.selectedCompanyId = payload.COMPANY_ID;
    this.selected_Head_Id = payload.HEAD_ID;
    this.selected_from_date = payload.DATE_FROM;
    this.selected_To_date = payload.DATE_TO;
    this.selectedStoreid = storeid ? [storeid] : [];
    
    this.updateStoreHint();
    this.createLedgerDataSource(payload);
    this.cdr.detectChanges();
  }

  load_Ledgre_data() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    if (!validationResult?.isValid) return;

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      HEAD_ID: this.selected_Head_Id,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date,
      STORE_ID: this.selectedStoreid?.length ? this.selectedStoreid.join(',') : '',
    };

    this.createLedgerDataSource(payload);
  }

  // -------------------------------------------------------------
  // Event Handlers
  // -------------------------------------------------------------
  onCompanyChange(event: any) {
    this.company_id = event.value;
    this.selected_Company_id = event.value;
    this.loadHeadList();
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
  }

  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear!, 0, 1);
      this.selected_To_date = new Date(this.selectedYear!, 11, 31);
    } else {
      this.selected_from_date = new Date(this.selectedYear!, this.selectedmonth, 1);
      this.selected_To_date = new Date(this.selectedYear!, this.selectedmonth + 1, 0);
    }
  }

  onFromDateChange(event: any) {
    this.formatted_from_date = this.formatDate(new Date(event.value));
  }

  onToDateChange(event: any) {
    this.formatted_To_date = this.formatDate(new Date(event.value));
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

  isViewVisible(e: any): boolean {
    this.transtypeId = e.row.data.TRANS_TYPE_ID;
    return this.transtypeId !== 0 && this.transtypeId !== 1;
  }

  onExporting(event: any) {
    const fileName = 'Ledger Statement Report';
    this.dataService.exportDataGridReport(event, fileName);
  }

  // -------------------------------------------------------------
  // Popup Management
  // -------------------------------------------------------------
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }

  handleClose() {
    this.resetPopups();
  }

  resetPopups() {
    this.isEditPopUp = false;
    this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isEditJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isRetailInvoice = false;
    this.isViewReceipt = false;
    this.isEditReceipt = false;
    this.editMiscPopupOpened = false;
    this.editMiscPopup = false;
    this.EditDepreciationPopupVisible = false;
    this.editPrePaymentPopupOpened = false;
    this.viewPayrollPopupOpened = false;
    this.editSalaryPopup = false;
    this.isEditInvoice = false;
    this.isEditPurchaseReturn = false;
    this.isEditTransferOut = false;
    this.isEditTransferIn = false;
    this.isEditCustomerReceipt = false;
    this.isEditSaleReturn = false;
    this.isViewBoxProduction = false;
    this.isViewProduction = false;
    this.isMiscViewInvoice = false;
    
    this.selectedInvoice = null;
    this.loadingInvoice = false;
    this.popupReady = false;
    this.cdr.detectChanges();
  }

  onViewClick(e: any) {
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    const trans_id = e.row.data.TRANS_ID;
    
    this.resetPopups();
    this.loadingInvoice = true;

    switch (TRANS_TYPE_ID) {
      case 1: // Opening Balance
        this.dataService.selectOpeningBalance(trans_id).subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
          this.cdr.detectChanges();
        });
        break;

      case 2: // Misc Receipt
        this.dataService.selectMiscReceipt(trans_id).subscribe((response: any) => {
          this.selectedmiscellaneousData = response.Data;
          this.editMiscPopup = true;
          this.cdr.detectChanges();
        });
        break;

      case 3: // Misc Payment
        this.dataService.selectMiscPayment(trans_id).subscribe((response: any) => {
          this.selectedmiscellaneousData = response;
          this.editMiscPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;

      case 4: // Journal Voucher
        this.dataService.selectJournalVoucher(trans_id).subscribe((response: any) => {
          this.selectedJournalVoucher = response.Data;
          this.isViewJournalVoucher = true;
          this.cdr.detectChanges();
        });
        break;

      case 9: // Depreciation Asset
        this.dataService.select_Depreciation_Asset(trans_id).subscribe((response: any) => {
          this.Selected_Depreciation_data = response.Data;
          this.EditDepreciationPopupVisible = true;
          this.cdr.detectChanges();
        });
        break;

      case 14: // Transfer Out
        this.dataService.selectTransferOutForInventory(trans_id).subscribe((response: any) => {
          this.selectedTrOut = response;
          this.isEditTransferOut = true;
          this.cdr.detectChanges();
        });
        break;

      case 15: // Transfer In
        this.dataService.selectTransferInForInventory(trans_id).subscribe((response: any) => {
          this.selectedTrIn = response;
          this.loadingInvoice = false;
          this.isEditTransferIn = true;
          this.cdr.detectChanges();
        });
        break;

      case 19: // Purchase Invoice
        this.dataService.selectPurchaseInvoice(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          this.loadingInvoice = false;
          this.isEditInvoice = true;
          this.cdr.detectChanges();
        });
        break;

      case 20: // Purchase Return
        this.dataService.selectPurchaseReturn(trans_id).subscribe((response: any) => {
          this.selectedPurchaseReturn = response;
          this.isEditPurchaseReturn = true;
          this.cdr.detectChanges();
        });
        break;

      case 21: // Supplier Payment
        this.dataService.selectSupplierPayment(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isEditReceipt = true;
          this.cdr.detectChanges();
        });
        break;

      case 25: // Sales Invoice
        if (this.vat_title === 'GST') {
          this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
            this.selectedInvoice = response.Data;
            this.isViewInvoice = true;
            this.cdr.detectChanges();
          });
        } else {
          this.dataService.selectInvoiceRetail(trans_id).subscribe((response: any) => {
            this.selectedInvoice = response.Data;
            this.isRetailInvoice = true;
            this.cdr.detectChanges();
          });
        }
        break;

      case 26: // Sale Return
        this.dataService.selectSaleReturn(trans_id).subscribe((response: any) => {
          this.selectedSaleReturn = response;
          this.isEditSaleReturn = true;
          this.cdr.detectChanges();
        });
        break;

      case 27: // Customer Receipt
        this.dataService.selectCustomerReceipt(trans_id).subscribe((response: any) => {
          this.selectedReceipt = response.Data;
          this.isEditCustomerReceipt = true;
          this.cdr.detectChanges();
        });
        break;

      case 28: // Advance
        this.dataService.select_Advance(trans_id).subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
          this.cdr.detectChanges();
        });
        break;

      case 29: // Payroll Report
        this.dataService.viewSelectedPayrollForReport(trans_id).subscribe((response: any) => {
          this.selectedPayroll = response;
          this.viewPayrollPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;

      case 30: // Salary Payment
        this.dataService.selectSalaryPayment(trans_id).subscribe((response: any) => {
          this.selectedSalaryData = response.Data;
          this.editSalaryPopup = true;
          this.cdr.detectChanges();
        });
        break;

      case 36: // Debit Note
        this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
          this.selectedDebitNote = response.Data;
          this.isViewDebitNote = true;
          this.cdr.detectChanges();
        });
        break;

      case 37: // Credit Note
        this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
          this.selectedCreditNote = response.Data;
          this.isViewCreditNote = true;
          this.cdr.detectChanges();
        });
        break;

      case 38: // Pre-Payment
        this.dataService.Select_PrePayment(trans_id).subscribe((response: any) => {
          this.selectedPrePayment = response.Data;
          this.editPrePaymentPopupOpened = true;
          this.cdr.detectChanges();
        });
        break;

      case 103: // Production
        this.dataService.selectProduction(trans_id).subscribe((response: any) => {
          this.selectedProduction = response;
          this.isViewProduction = true;
          this.cdr.detectChanges();
        });
        break;

      case 104: // Box Production
        this.dataService.selectBoxProduction(trans_id).subscribe((response: any) => {
          this.selectedProduction = response;
          this.isViewProduction = true;
          this.cdr.detectChanges();
        });
        break;

      case 105: // Misc Sales Invoice
        this.dataService.getMiscSalesInvoiceByID(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response;
          this.isMiscViewInvoice = true;
          this.cdr.detectChanges();
        });
        break;

      default:
        this.loadingInvoice = false;
        break;
    }
  }

  // -------------------------------------------------------------
  // DataGrid Summaries
  // -------------------------------------------------------------
  summaryColumnsData = {
    totalItems: [
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
      {
        name: 'totalCr',
        column: 'CR_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CR_AMOUNT',
        alignment: 'right',
      },
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

        const totalDr = items.reduce((sum: number, item: any) => {
          const val = parseFloat(
            String(item?.DR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const totalCr = items.reduce((sum: number, item: any) => {
          const val = parseFloat(
            String(item?.CR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const closingBalance = totalDr - totalCr;

        if (options.name === 'closingBalanceCr') {
          options.totalValue = closingBalance > 0 ? closingBalance : 0;
        }
        if (options.name === 'closingBalanceDr') {
          options.totalValue = closingBalance < 0 ? Math.abs(closingBalance) : 0;
        }
        if (options.name === 'grandTotalCr') {
          options.totalValue = totalCr + (closingBalance > 0 ? closingBalance : 0);
        }
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
    DxToolbarModule,
    DxiItemModule,
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
    EditCustomerReceiptModule,
    EditSupplierPaymentModule,
    AddMiscReceiptModule,
    DepreciationEditModule,
    PrePaymentEditModule,
    AddMiscellaneousPaymentModule,
    AddSalaryPaymentModule,
    ViewSalaryAdvanceModule,
    EditPurchaseInvoiceModule,
    PurchaseReturnDebitFormModule,
    TransferOutInventoryAddModule,
    TransferInInventoryFormModule,
    SaleReturnFormModule,
    ProductionJvViewModule,
    MiscSalesInvoiceFormModule,
    AddInvoiceRetailModule,
    PayrollViewReportModule,
  ],
  declarations: [LedgerStatementComponent],
  exports: [LedgerStatementComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LedgerStatementModule {}
