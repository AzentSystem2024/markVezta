import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
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
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Router } from '@angular/router';
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
import DataSource from 'devextreme/data/data_source';
import { SaleReturnFormModule } from 'src/app/sale-return-form/sale-return-form.component';
import { ProductionJvViewModule } from 'src/app/production-jv-view/production-jv-view.component';
import { PayrollViewModule } from 'src/app/components/HR/Masters/payroll-view/payroll-view.component';
import { MiscSalesInvoiceFormModule } from '../../OPERATIONS/POPUP PAGES/misc-sales-invoice-form/misc-sales-invoice-form.component';
import { PayrollViewReportModule } from 'src/app/components/HR/Masters/payroll-view-report/payroll-view-report.component';
import notify from 'devextreme/ui/notify';
import { AddSalesInvoiceRetailModule } from '../../OPERATIONS/add-sales-invoice-retail/add-sales-invoice-retail.component';



@Component({
  selector: 'app-discount-wise-sales',
  templateUrl: './discount-wise-sales.component.html',
  styleUrls: ['./discount-wise-sales.component.scss']
})
export class DiscountWiseSalesComponent {


  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  JournalBookDataSource!: DataSource; // ONLY for dx-data-grid
  journalBookArray: any[] = []; // ONLY for logic / checks
  journalBookCount = 0;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any[] = [];
  company_id: any;
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  ledgerSummaryData: any = [];
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_Head_Id: any;
  selected_fin_id: any;
  isEditReadOnly: boolean = true;
  isViewJournalVoucher: boolean = false;
  formatted_from_date: string;
  formatted_To_date: string;
  editLedgerPopup: boolean = false;
  isViewDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  isViewInvoice: boolean = false;
  isViewReceipt: boolean = false;
  editMiscPopup: boolean = false;
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selected_Company_id: any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = true;
  editPrePaymentPopupOpened: boolean = false;
  isReadOnlyPayment: boolean = true;
  isEditReceipt: boolean = false;
  isReadOnlyReceipt: boolean = true;
  loadingInvoice = false;
  popupReady = false;

  selectedSaleReturn: any;
  isReadOnlySaleReturn: boolean = true;
  isEditSaleReturn: boolean = false;

  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';

  editMiscPopupOpened: boolean = false;
  isReadOnlyPurchaseReturn: boolean = true;
  isEditPurchaseReturn: boolean = false;
  // @Input() MiscReceiptId : any;
  isFilterOpened = false;
  defaultDate: Date = new Date();
  selectedmiscellaneousData: any;
  selectedPrePayment: any;
  selectedSupplierPayment: any;
  selectedPurchaseReturn: any;
  selectedMiscPayment: any;
  selecte_prepayment_Data: any;
  isEditPopupPrepaymentPosting: boolean = false;
  selectedTrOut: any;
  isEditTransferOut: boolean = false;
  isReadOnlyTrOut: boolean = true;
  selectedTrIn: any;
  isEditTransferIn: boolean = false;
  isReadOnlyTrIn: boolean = true;
  isMiscViewInvoice: boolean = false;
  isEditCustomerReceipt: boolean = false;
  viewPayrollPopupOpened: boolean = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };
  selectedProduction: any;
  isViewProduction: boolean;
  selectedPayroll: any;
  Store: any;
  selectedStoreid: any;
  selectedCustomer: any;
  selectedReason: any;
  items: any;
  selectedItem: any[] = [];
  itemHint: string = '';

  // Add this variable
  isFilterVisible: boolean = true;
  distributorList: any;
  today: Date = new Date();

  Saletype = [
    { ID: 0, DESCRIPTION: 'All' },
    { ID: 1, DESCRIPTION: 'Sales & Return' },
    { ID: 2, DESCRIPTION: 'Sales' },
    { ID: 3, DESCRIPTION: 'Return' },
    { ID: 4, DESCRIPTION: 'Void Invoice' },
    { ID: 5, DESCRIPTION: 'Cash In & Cash Out' },
    { ID: 6, DESCRIPTION: 'Receipts' }
  ];

  // Optional default selection
  selectedSaletype = [0]; // or [] if nothing selected
  Salesman: any;
  itemProperty2: any;
  itemProperty1: any;
  Brand: any;
  Subcategory: any;
  Category: any;
  Department: any;
  selectedBrand: any;
  selectedDepartment: any;
  selectedCategory: any;
  selectedSubcategory: any;
  selectedSalesman: any;
  selectedItemProperty1: any;
  selectedItemProperty2: any;
  Reason: any;

  //  Toggle function
  toggleFiltersPanel() {
    this.isFilterVisible = !this.isFilterVisible;
  }
  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    // this.get_sessionstorage_data();
    // this.get_fin_id();
    // this.sesstion_Details();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataService.getMonths();
  }

  ngOnInit() {
    this.resetPopups();
    const raw = sessionStorage.getItem('savedUserData');

    // if (!raw) {
    //   // delay navigation until routing is ready
    //   setTimeout(() => {
    //     this.router.navigate(['/login']);
    //   });
    //   return;
    // }

    this.savedUserData = JSON.parse(raw);

    this.company_list = this.savedUserData?.Companies ?? [];
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS ?? [];

    this.selected_Company_id =
      this.savedUserData?.SELECTED_COMPANY?.COMPANY_ID ?? null;

    this.selected_fin_id =
      this.savedUserData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? null;

    if (!this.selected_Company_id || !this.selected_fin_id) return;

    // this.onFromDateChange({ value: this.defaultDate });
    // this.onToDateChange({ value: this.defaultDate });

    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;

    // this.load_JournalBook_data();
    this.store_dropdown();
    this.item_dropdown();
    this.getCustomerOrUnitLst();
    this.department_dropdown()
    this.Catgeory_dropdown();
    this.SubCatgeory_dropdown();
    this.Brand_dropdown();
    this.Salesman_dropdown();
    this.ItemProperty1_dropdown();
    this.ItemProperty2_dropdown();
    this.reason_dropdown();

  }

  ngAfterViewInit() {
    setTimeout(() => this.resetPopups());
  }
  private reloadJournalBook() {
    if (!this.dataGrid?.instance) return;

    this.load_JournalBook_data();
  }
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
    // this.reloadJournalBook();
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
    // this.reloadJournalBook();
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  resetPopups() {
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
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
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.load_JournalBook_data();
  }
  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  sesstion_Details() {
    const sessionDataRaw = sessionStorage.getItem('savedUserData');

    const sessionData = JSON.parse(sessionDataRaw);

    this.selected_Company_id =
      sessionData?.SELECTED_COMPANY?.COMPANY_ID ?? null;

    this.selected_fin_id = sessionData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? null;
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
    this.dataService
      .HeadId_Dropdown_api(this.selected_fin_id)
      .subscribe((res: any) => {
        this.HEAD_ID_LIST = res.LEDGER_HEADS || [];
      });
    this.reloadJournalBook();
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    const today = new Date();

    if (rawDate > today) {
      notify('From Date cannot be greater than today', 'error', 2000);
      this.selected_from_date = today;
      return;
    }
    this.formatted_from_date = this.formatDate(rawDate);
    // this.reloadJournalBook();
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    const today = new Date();

    if (rawDate > today) {
      notify('To Date cannot be greater than today', 'error', 2000);
      this.selected_To_date = today;
      return;
    }
    this.formatted_To_date = this.formatDate(rawDate);
    // this.reloadJournalBook();
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
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
      DATE_TO: this.formatted_To_date ?? this.selected_To_date,
      STORE_ID: this.selectedStoreid?.length
        ? this.selectedStoreid.join(',') // FINAL FIX
        : '',
      CUST_ID: this.selectedCustomer != null
        ? String(this.selectedCustomer)
        : '',
      SALE_TYPE: this.selectedSaletype != null ? Number(this.selectedSaletype)
        : 0,
      BRAND_ID: this.selectedBrand != null
        ? String(this.selectedBrand)
        : '',
      // STATUS_ID:"",--- remove status the base of new payload from Rinu
      ITEM_ID: "",
      SALESMAN_ID: this.selectedSalesman != null ? String(this.selectedSalesman) : '',
      DEPT_ID: this.selectedDepartment != null ? String(this.selectedDepartment) : '',
      CAT_ID: this.selectedCategory != null ? String(this.selectedCategory) : '',
      SUBCAT_ID: this.selectedSubcategory != null ? String(this.selectedSubcategory) : '',
      REASON_ID: this.selectedReason != null ? String(this.selectedReason) : '',
      CUSTOM1: this.selectedItemProperty1 != null ? String(this.selectedItemProperty1) : '',
      CUSTOM2: this.selectedItemProperty2 != null ? String(this.selectedItemProperty2) : '',
      INCLUDE_SUMMARY: 0
    };

    this.JournalBookDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.Discountwise_Sales_Report(payload).subscribe({
            next: (res: any) => {
              const list = res || [];

              // 🔑 cache for logic
              this.journalBookArray = list;
              this.journalBookCount = list.length;

              this.ledgerSummaryData = list;
              if (list.length === 0) {
                notify({
                  message: 'No data available',
                  type: 'warning',
                  displayTime: 2000,
                  position: {
                    at: 'top center',
                    my: 'top center'
                  }
                });
              }
              this.isFilterVisible = false
              resolve(list); // 🔑 grid gets data
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
    console.log(e)
    const trans_id = e.row.data.TRANS_ID;

    this.dataService
      .Select_SalesInvoice_Retail(trans_id)
      .subscribe((response: any) => {
        this.selectedInvoice = response.data;


        this.isViewInvoice = true;
      });
  }

  summaryColumnsData = {
    totalItems: [
      // 1. Total Debitṅ
      {
        name: 'totalDr',
        column: 'PRICE',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PRICE',
        alignment: 'right',
      },
      {
        name: 'totalDr',
        column: 'GROSS_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'GROSS_AMOUNT',
        alignment: 'right',
      },
      {
        name: 'totalDr',
        column: 'VAT_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'VAT_AMOUNT',
        alignment: 'right',
      },
      {
        name: 'totalDr',
        column: 'NET_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'NET_AMOUNT',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'PRICE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'GROSS_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'VAT_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'NET_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
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

  handleClose() {
    this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.isEditInvoice = false;
    this.editMiscPopup = false;
    this.isMiscViewInvoice = false;
    this.viewPayrollPopupOpened = false;
  }

  storeHint: string = '';

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store
      .filter(x => this.selectedStoreid.includes(x.ID))
      .map(x => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

  department_dropdown() {
    const payload = {
      NAME: 'DEPARTMENT',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  Catgeory_dropdown() {
    const payload = {
      NAME: 'ITEMCATEGORY',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Category = res;
    });
  }

  SubCatgeory_dropdown() {
    const payload = {
      NAME: 'SUBCATEGORY',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Subcategory = res;
    });
  }

  Brand_dropdown() {
    const payload = {
      NAME: 'BRAND',
      // COMPANY_ID : this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Brand = res;
    });
  }


  ItemProperty1_dropdown() {
    const payload = {
      NAME: 'ITEMPROPERTY1',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.itemProperty1 = res;
    });
  }

  ItemProperty2_dropdown() {
    const payload = {
      NAME: 'ITEMPROPERTY2',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.itemProperty2 = res;
    });
  }

  Salesman_dropdown() {
    const payload = {
      NAME: 'SALESMAN',
      // COMPANY_ID : this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Salesman = res;
    });
  }

  reason_dropdown() {
    const payload = {
      NAME: 'REASON',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Reason = res;
    });
  }

  item_dropdown() {
    const payload = {
      NAME: 'ITEMS'
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.items = res
    })
  }

  updateItemHint() {
    if (!this.selectedItem || this.selectedItem.length === 0) {
      this.itemHint = 'No item selected';
      return;
    }

    const selectedNames = this.items
      .filter(x => this.selectedItem.includes(x.ID))
      .map(x => x.DESCRIPTION);

    this.itemHint = selectedNames.join(', ');
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'CUSTOMER'
    };
    this.dataService
      .Common_Dropdown
      (payload)
      .subscribe((response: any) => {
        this.distributorList = response;
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
    SaleReturnFormModule,
    ProductionJvViewModule,
    PayrollViewModule,
    MiscSalesInvoiceFormModule,
    PayrollViewReportModule,
    DxTagBoxModule,
    DxFormModule,
    AddSalesInvoiceRetailModule,
  ],
  providers: [],
  exports: [],
  declarations: [DiscountWiseSalesComponent],
})
export class DiscountWiseSalesModule { }