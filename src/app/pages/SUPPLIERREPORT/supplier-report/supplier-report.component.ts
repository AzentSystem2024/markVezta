import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, ViewChild } from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
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
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-supplier-report',
  templateUrl: './supplier-report.component.html',
  styleUrls: ['./supplier-report.component.scss'],
})
export class SupplierReportComponent {

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  // Controls whether the report parameters are expanded or collapsed.
  showParameters = true;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'SUPP_NAME', caption: 'Supplier Name' },
    { dataField: 'DOC_NO', caption: 'Doc No' },
    { dataField: 'PURCH_DATE', caption: 'Date' },
    { dataField: 'SUPP_INV_NO', caption: 'Supplier invoice no' },
    { dataField: 'NET_AMOUNT', caption: 'Net Amount' },
    { dataField: 'PAID_AMOUNT', caption: 'Paid Amount' },
    { dataField: 'RETURN_AMOUNT', caption: 'Return Amount' },
    { dataField: 'ADJ_AMOUNT', caption: 'Adjusted Amount' },
    { dataField: 'BALANCE', caption: 'Balance' },
  ];

  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible: grid.columnOption(column.dataField, 'visible') !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns.forEach((column) => {
      grid.columnOption(column.dataField, 'visible', column.visible);
    });

    this.isColumnChooserVisible = false;
  }

  cancelColumnChooser(): void {
    this.tempColumns = [];
    this.isColumnChooserVisible = false;
  }

  resetColumnSelection(): void {
    this.tempColumns = this.tempColumns.map((column) => ({
      ...column,
      visible: true,
    }));
  }

  SupplierReport: any;
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
  isLoading = false;
  hasData = false;
  isSummaryVisible = true;

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
    const currentMonth = new Date().getMonth(); // 0 = Jan, 6 = Jul, 11 = Dec
    this.selectedmonth = currentMonth;
  }

  ngOnInit() {
    this.updateSummaryColumnsData();
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


  // Expand or collapse the parameter panel.
  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_DataSource();
    }
  }

  columnChooserButtonOptions = {
    icon: 'columnchooser',
    hint: 'Choose Columns',
    stylingMode: 'outlined',
    onClick: () => this.openColumnChooser(),
  };

  summaryButtonOptions = {
    icon: 'chevrondown',
    hint: 'Hide Summary',
    stylingMode: 'outlined',
    onClick: () => this.toggleSummary(),
  };

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;

    this.updateSummaryColumnsData();

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };

    this.cdr.detectChanges();
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
    this.showParameters = false;
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      SUPP_ID: this.selectedSupplierId || 0,
    };

    sessionStorage.setItem('supplierViewClick', JSON.stringify(payload));

    this.SupplierReport = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.Supplier_Report_Api(payload).subscribe({
            next: (res: any) => {
              const list = res.data || [];

              this.hasData = list.length > 0;
              resolve(list);

              if (list.length === 0) {
                notify({
                  message: 'No data available',
                  type: 'warning',
                  displayTime: 2000,
                  position: {
                    at: 'top center',
                    my: 'top center',
                  },
                });
              }

              resolve(list);
            },
            error: () => {
              resolve([]);
            },
          });
        }),
    });
  }

  summaryColumnsData: any = {
    totalItems: [],
    groupItems: [],
  };

  updateSummaryColumnsData(): void {
    const moneyFormat = {
      type: 'fixedPoint',
      precision: 2,
      useGrouping: true,
    };

    const summaryFields = [
      'NET_AMOUNT',
      'PAID_AMOUNT',
      'RETURN_AMOUNT',
      'ADJ_AMOUNT',
      'BALANCE',
    ];

    this.summaryColumnsData = {
      totalItems: this.isSummaryVisible
        ? summaryFields.map((field) => ({
          column: field,
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          showInColumn: field,
          alignment: 'right',
        }))
        : [],

      groupItems: this.isSummaryVisible
        ? summaryFields.map((field) => ({
          column: field,
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          alignByColumn: true,
        }))
        : [],
    };

    this.cdr.detectChanges();
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
    EditPurchaseInvoiceModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [SupplierReportComponent],
})
export class SupplierReportModule { }
