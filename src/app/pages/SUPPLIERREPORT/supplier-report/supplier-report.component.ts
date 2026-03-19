import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { LedgerStatementModule } from '../../REPORT/ledger-statement/ledger-statement.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';

@Component({
  selector: 'app-supplier-report',
  templateUrl: './supplier-report.component.html',
  styleUrls: ['./supplier-report.component.scss'],
})
export class SupplierReportComponent {
  SupplierReport: any[] = [];
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  formatted_from_date: any;
  formatted_To_date: any;
  defaultDate: Date = new Date();
  auto: string = 'auto';
  HeadId: any;
  savedUserData: any;
  selectedInvoice: any;
  fin_id: any;
  company_id: any;
  finID: any;
  company_list: any = [];
  selected_Company_id: any;
  Supplier: any;
  selectedSupplierId: any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = false;
  SuppID: any;
  PurchID: any;
  PurchaseID: any;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
    this.sesstion_Details();
    this.get_Supplier_dropdown();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();
  }

  ngOnInit() {
    // initialize with today's date
    // this.onToDateChange({ value: this.defaultDate });
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
    this.get_DataSource();
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

  handleClose() {
    this.isEditInvoice = false;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.company_list = this.savedUserData.Companies;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    const sessionYear = sessionData.FINANCIAL_YEARS;
    const financialYeaDate = sessionYear[0].DATE_FROM;

    // this.formatted_from_date=financialYeaDate
  }

  onSupplierChanged(event: any) {
    console.log(event, 'event');
    this.selectedSupplierId = event.value;

    // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find(
      (item: any) => item.ID === this.selectedSupplierId,
    );
    if (selectedSupplier) {
      console.log('Selected ID:', selectedSupplier.ID);
      console.log('Selected Description:', selectedSupplier.DESCRIPTION);
    }

    // this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
    // console.log(this.selectedSupplierName,'======supplier name========')
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
    console.log(this.fin_id, '========financial year');
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
    console.log(this.company_id, '=====company id');
  }

  onExporting(event: any) {
    const fileName = 'SupplierReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  onViewClick(e: any) {
    ((this.SuppID = e.row.data.SUPP_ID),
      console.log(this.SuppID, '===SuppID====='));

    sessionStorage.setItem('SUPPID', this.SuppID);
    console.log(sessionStorage.getItem('SUPPID'));

    ((this.PurchID = e.row.data.PURCH_ID),
      console.log(this.PurchID, '===PurchID====='));

    sessionStorage.setItem('PURCHID', this.PurchID);
    console.log(sessionStorage.getItem('PURCHID'));

    // Navigate to ledger-statement route
    this.router.navigate(['/supplier-statement-details']);
    //  const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    // const trans_id = e.row.data.TRANS_ID;

    //   this.dataservice
    //     .selectPurchaseInvoice(trans_id)
    //     .subscribe((response: any) => {
    //       this.selectedInvoice = response.Data;

    //       this.isEditInvoice = true;
    //       this.cdr.detectChanges();
    //       console.log(
    //         this.selectedInvoice,
    //         'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
    //       );
    //     });
    // this.isEditInvoiceReadOnly = transStatus === 'Approved';
  }

  get_Supplier_dropdown() {
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Supplier_Dropdown(payload).subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  get_DataSource() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      SUPP_ID: this.selectedSupplierId || 0,
    };

    sessionStorage.setItem('supplierViewClick', JSON.stringify(payload));

    console.log(JSON.parse(sessionStorage.getItem('supplierViewClick')));

    this.dataservice.Supplier_Report_Api(payload).subscribe((res: any) => {
      this.SupplierReport = res.data;
      console.log(this.SupplierReport, '========SupplierReport=========');
    });
  }

  summaryColumnsData = {
    totalItems: [
      {
        column: 'NET_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'NET_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'PAID_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PAID_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'RETURN_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'RETURN_AMOUNT',
        alignment: 'left',
      },
      {
        column: 'ADJ_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ADJ_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'BALANCE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'BALANCE',
        alignment: 'left',
      },
    ],
    groupItems: [
      {
        column: 'NET_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'PAID_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'RETURN_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ADJ_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'BALANCE',
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
    EditPurchaseInvoiceModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [SupplierReportComponent],
})
export class SupplierReportModule {}
