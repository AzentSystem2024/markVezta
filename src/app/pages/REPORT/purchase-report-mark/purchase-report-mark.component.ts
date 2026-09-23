import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component, NgModule,
  NgZone,
  ViewChild
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
import { MiscSalesInvoiceFormModule } from '../../Operations/POPUP PAGES/misc-sales-invoice-form/misc-sales-invoice-form.component';
import { PayrollViewReportModule } from 'src/app/components/HR/Masters/payroll-view-report/payroll-view-report.component';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-purchase-report-mark',
  templateUrl: './purchase-report-mark.component.html',
  styleUrls: ['./purchase-report-mark.component.scss']
})
export class PurchaseReportMarkComponent {

  PurchaseReport: any[] = [];
  isFilterRowVisible: boolean = false;
  editPDCPopupOpened: boolean = false;
  BalanceSheetReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;
  isEditReadOnly = true;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  selected_Company_id: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: any;
  HeadId: any;
  selected_fin_id: any;
  customer_list: any[] = [];
  select_customer_id: any;
  selectedPDC: any;
  // customer_details: {};
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  canApprove = false;
  selectedSupplier: any;

  customer_details: any = {
    CUSTOMER_ID: 0,
    SALE_ID: 0,
    DATE_FROM: '',
    DATE_TO: '',
    COMPANY_ID: 0,
  };
  distributorList: any;
  constructor(
    private dataservice: DataService,
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
    this.monthDataSource = this.dataservice.getMonths();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 6 = Jul, 11 = Dec
    this.selectedmonth = currentMonth;
  }
  ngOnInit() {
    // initialize with today's date
    // this.onToDateChange({ value: this.defaultDate });
    //   this.onFromDateChange({ value: this.financialYeaDate });
    //get datasource======== function call==========

    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    setTimeout(() => {
      this.get_Purchase_list();
    }, 0);

    this.getSupplierOrUnitLst();
  }

  onSupplierChanged(event: any) {
    this.selectedSupplier = event.value ?? '';
    const newSupplierId = event.value;

    // // Supplier changed → clear grid
    // if (this.selectedSupplierId && this.selectedSupplierId !== newSupplierId) {
    //   this.clearGridAndChangeSupplier(newSupplierId);
    //   return;
    // }

    // // First-time selection
    // this.applySupplierChange(newSupplierId);
  }

  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.formatted_To_date = today; // Today's date
    } else {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.formatted_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.formatted_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.formatted_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.formatted_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };


  getSupplierOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }


  onExporting(event: any) {
    const fileName = 'BalanceSheetReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData') || '');
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    // example: "2025-04-01"
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    // example: "2025-04-01"
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  get_Purchase_list() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      FIN_ID: this.selected_fin_id,
      SUPP_ID: String(this.selectedSupplier ?? '')
    };

    this.dataservice.Purchase_Report(payload).subscribe((res: any) => {
      this.PurchaseReport = res.Data;
    });
  }
  onViewClick(e: any) {
    console.log(e, 'event')
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE;
    const trans_id = e.row.data.ID;
    this.dataservice
      .Select_PDC(trans_id)
      .subscribe((response: any) => {
        this.selectedPDC = response.Data[0];

        this.editPDCPopupOpened = true;
        this.cdr.detectChanges();
      });
  }

  handleClose() {
    this.editPDCPopupOpened = false;
  }
  summaryColumnsData = {
    totalItems: [
      {
        column: 'GrossTotal',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'GrossTotal',
        alignment: 'right',
      },
      {
        column: 'Disc',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'Disc',
        alignment: 'right',
      },
      {
        column: 'GSTPurchase',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'GSTPurchase',
        alignment: 'right',
      },
      {
        column: 'CGSTPurchaseInput9',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CGSTPurchaseInput9',
        alignment: 'right',
      },
      {
        column: 'SGSTPurchaseInput9',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'SGSTPurchaseInput9',
        alignment: 'right',
      },
      {
        column: 'RoundOff',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'RoundOff',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'GrossTotal',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'Disc',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'GSTPurchase',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'CGSTPurchaseInput9',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'SGSTPurchaseInput9',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'RoundOff',
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
    AddInvoiceRetailModule,
    EditPurchaseInvoiceModule,
  ],
  providers: [],
  exports: [],
  declarations: [PurchaseReportMarkComponent],
})
export class PurchaseReportMarkModule { }