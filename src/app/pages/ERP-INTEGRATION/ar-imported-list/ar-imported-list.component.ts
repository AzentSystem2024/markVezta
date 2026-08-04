import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxDataGridModule,
  DxButtonModule,
  DxPopupModule,
  DxTextBoxModule,
  DxFormModule,
  DxCheckBoxModule,
  DxValidatorModule,
  DxLoadPanelModule,
  DxDataGridComponent,
  DxSelectBoxModule,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services/data.service';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import {
  ERPJVModule,
  ERPJVComponent,
} from '../POPUP-PAGES/erp-jv/erp-jv.component';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-ar-imported-list',
  templateUrl: './ar-imported-list.component.html',
  styleUrls: ['./ar-imported-list.component.scss'],
})
export class ARImportedListComponent {
  @ViewChild('detailGrid', { static: false })
  detailGrid!: DxDataGridComponent;

  @ViewChild(ERPJVComponent)
  JournalVoucherFormComponent!: ERPJVComponent;

  isFilterOpened: boolean = false;
  showFilterRow: boolean = false;
  currentFilter: string = 'auto';

  importDataList: DataSource | null = null;
  detailViewColumns: any[] = [];

  // Store all detail data
  importDetailData: any[] = [];
  filteredDetailData: any[] = [];
  detailsDataColumns: any[] = [];

  expandedRowKeys: any[] = [];
  detailDataMap: { [key: string]: any[] } = {};

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },

    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },

    text: '',
  };

  ReProcessButtonOptions = {
    text: 'Process',
    icon: '',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Import AR Data',

    onClick: () => {
      this.processPendingRows();
    },

    elementAttr: { class: 'add-button' },
  };

  ValidateButtonOptions = {
    text: 'Validate',
    icon: '',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Validate AR Data',

    onClick: () => {
      this.validatePendingRows();
    },

    elementAttr: { class: 'add-button mx-2' },
  };
  // ================= Progress Variables =================
  isProcessingRows: boolean = false;
  progressMessage: string = 'Processing Pending Rows...';
  totalRequestCount: number = 0;
  completedRequestCount: number = 0;
  failedRequestCount: number = 0;
  pendingRequestCount: number = 0;

  isViewJournalVoucher: boolean = false;
  selectedJournalVoucher: any[] = [];
  selectedTransID: any;

  isValidationPopupVisible: boolean = false;
  transactionTypes: string[] = [];
  selectedTransactionType: string = '';
  allValidationErrors: any[] = [];
  allMissingMasterData: any[] = [];
  filteredValidationGridData: any[] = [];

  isLoading: boolean = false;
  loadingMessage: string = 'Loading...';

  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedDateRange: any = 'last7';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup: boolean = false;

  constructor(
    private ngZone: NgZone,
    private srvce: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetch_Full_import_list();
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    this.fetch_Full_import_list();
  }

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  private getDateRange(): { fromDate: string | null; toDate: string | null } {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'all':
        return { fromDate: null, toDate: null };

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return {
      fromDate: fromDate ? this.formatDate(fromDate) : null,
      toDate: toDate ? this.formatDate(toDate) : null,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.fetch_Full_import_list();
  }

  // ====== Fetch Import data list =======
  fetch_Full_import_list() {
    //  Common Formatter
    const formatData = (data: any[] = []) => {
      return data.map((item: any) => {
        const updatedItem: any = { ...item };

        Object.keys(updatedItem).forEach((key: string) => {
          const value = updatedItem[key];

          // Verified Field
          if (key === 'Verified') {
            updatedItem[key] =
              value === true
                ? 1
                : value === false
                  ? ''
                  : value == null
                    ? null
                    : String(value);

            return;
          }

          // Date Field Conversion
          if (
            value &&
            typeof value === 'string' &&
            key.toLowerCase().includes('date')
          ) {
            const date = new Date(value);

            if (!isNaN(date.getTime())) {
              updatedItem[key] = [
                String(date.getDate()).padStart(2, '0'),
                String(date.getMonth() + 1).padStart(2, '0'),
                date.getFullYear(),
              ].join('-');
            }
          }
        });

        return updatedItem;
      });
    };

    // DataSource
    this.importDataList = new DataSource({
      store: new CustomStore({
        key: 'HeaderID',

        load: async () => {
          try {
            const { fromDate, toDate } = this.getDateRange();

            const payload = {
              DATE_FROM: fromDate,
              DATE_TO: toDate,
            };
            const response: any = await this.srvce
              .import_AR_Full_List(payload)
              .toPromise();

            // Header Data
            const headerData = formatData(response?.header || []);

            // Detail Data
            this.importDetailData = formatData(response?.detail || []);

            // Dynamic Detail Columns
            this.detailsDataColumns = Object.keys(
              this.importDetailData?.[0] || {},
            );

            // Dynamic Header Columns
            this.detailViewColumns = Object.keys(headerData?.[0] || {});

            return headerData;
          } catch (error) {
            console.error(error);
            return [];
          }
        },
      }),
    });
  }

  // ================= Row Expanding =================
  onRowExpanding(e: any) {
    const headerID = e.key;
    // Prevent duplicate keys
    if (!this.expandedRowKeys.includes(headerID)) {
      this.expandedRowKeys.push(headerID);
    }
    // Load only if not already loaded
    if (!this.detailDataMap[headerID]) {
      this.detailDataMap[headerID] = this.importDetailData.filter(
        (x: any) => x.HeaderID === headerID,
      );
    }
  }

  // ================= Row Collapsing =================
  onRowCollapsing(e: any) {
    const headerID = e.key;
    this.expandedRowKeys = this.expandedRowKeys.filter((x) => x !== headerID);
    delete this.detailDataMap[headerID];
  }

  refreshGrid() {
    if (this.detailGrid?.instance) {
      this.detailGrid.instance.refresh();
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.detailGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onCellPrepared(e: any) {
    // ===== Disable Selection Checkbox =====
    if (
      e.rowType === 'data' &&
      e.column.command === 'select' &&
      e.data.Status?.trim() === 'Posted'
    ) {
      // Disable selection cell
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';
      e.cellElement.setAttribute('title', 'Click to open journal voucher');

      // Hide checkbox
      const checkbox = e.cellElement.querySelector('.dx-select-checkbox');

      if (checkbox) {
        (checkbox as HTMLElement).style.display = 'none';
      }
    }

    // ===== Status Column Color =====
    if (e.rowType === 'data' && e.column.dataField === 'Status') {
      const status = e.value?.trim();

      // Open
      if (status === 'Open') {
        e.cellElement.style.color = '#ff6f0f';
        e.cellElement.style.fontWeight = '600';
      }

      // Posted
      else if (status === 'Posted') {
        e.cellElement.style.color = '#03b12b';
        e.cellElement.style.fontWeight = '600';
      }

      // Failed
      else if (status === 'Failed') {
        e.cellElement.style.color = '#ff2929';
        e.cellElement.style.fontWeight = '600';
      }
    }
  }

  onCellClick(e: any) {
    console.log('clicked row data:', e.data);

    if (e.rowType !== 'data') {
      return;
    }

    // Only Status column
    if (e.column?.dataField !== 'Status') {
      return;
    }

    // Only Posted status
    if (e.data?.Status !== 'Posted') {
      return;
    }

    this.selectedTransID = e.data?.AcTransID;

    if (!this.selectedTransID) {
      notify('Transaction ID not found', 'warning', 3000);
      return;
    }

    this.isLoading = true;

    this.srvce.select_Erp_JournalVoucher(this.selectedTransID).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.flag === 1) {
          this.selectedJournalVoucher = res?.Data || null;
          this.isViewJournalVoucher = true;
        } else {
          notify('Journal Voucher not found', 'error', 3000);
        }
      },

      error: (err: any) => {
        this.isLoading = false;

        console.error(err);
        notify('Failed to load Journal Voucher', 'error', 3000);
      },
    });
  }

  handleClose() {
    this.isViewJournalVoucher = false;
  }

  // ================= Allow Checkbox Only For Pending / Failed =================
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.command === 'select') {
      const status = e.row?.data?.Status;
      if (status !== 'Open' && status !== 'Failed') {
        e.editorOptions.disabled = true;
      }
    }
  }

  // ================= Process Pending Rows =================
  async processPendingRows() {
    // Selected Rows
    const selectedRows = this.detailGrid?.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select rows', 'warning', 3000);
      return;
    }

    //  Pending Rows Only
    const pendingRows = selectedRows.filter(
      (x: any) => x.Status === 'Open' || x.Status === 'Failed',
    );

    if (pendingRows.length === 0) {
      notify('Please select pending rows only', 'warning', 3000);
      return;
    }

    //  Initialize Counters
    this.isProcessingRows = true;
    this.progressMessage = 'Processing Pending Rows...';

    this.totalRequestCount = pendingRows.length;
    this.completedRequestCount = 0;
    this.failedRequestCount = 0;
    this.pendingRequestCount = pendingRows.length;

    // Force initial UI update
    this.cdr.detectChanges();

    //  Process One By One
    for (const row of pendingRows) {
      try {
        const response: any = await this.srvce
          .process_pending_rows(row)
          .toPromise();

        //  Success
        if (response?.flag === '1') {
          this.completedRequestCount++;
        } else {
          this.failedRequestCount++;
        }
      } catch (error: any) {
        console.error(error);
        //  Failed
        this.failedRequestCount++;
      }
      //  Update Pending Count
      this.pendingRequestCount =
        this.totalRequestCount -
        (this.completedRequestCount + this.failedRequestCount);
      // Force UI Update
      this.cdr.detectChanges();
    }
    //  Completed
    this.isProcessingRows = false;
    // Final UI refresh
    this.cdr.detectChanges();
    //  Wait for Loader Removal
    await new Promise((resolve) => setTimeout(resolve, 500));
    //  Clear Selection
    this.detailGrid?.instance.clearSelection();
    await new Promise((resolve) => setTimeout(resolve, 100));
    //  Clear Filters
    this.detailGrid?.instance.clearFilter();
    await new Promise((resolve) => setTimeout(resolve, 100));
    //  Clear Search
    this.detailGrid?.instance.searchByText('');
    //  Notification
    notify(
      `Processing completed.
      Success : ${this.completedRequestCount}
      Failed : ${this.failedRequestCount}`,
      'success',
      5000,
    );
    //  Refresh Grid
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.refreshGrid();
  }

  // ================= Validate Pending Rows =================
  async validatePendingRows() {
    // Selected Rows
    const selectedRows = this.detailGrid?.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select rows', 'warning', 3000);
      return;
    }

    // Pending Rows Only
    const pendingRows = selectedRows.filter(
      (x: any) => x.Status === 'Open' || x.Status === 'Failed',
    );

    if (pendingRows.length === 0) {
      notify('Please select pending rows only', 'warning', 3000);
      return;
    }

    const transactionIDs = pendingRows
      .map((row: any) => row.HeaderID)
      .join(',');

    this.loadingMessage = 'Validating...';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const response: any = await this.srvce
        .getValidationARData({ TransactionIDs: transactionIDs })
        .toPromise();

      this.isLoading = false;
      this.loadingMessage = 'Loading...';

      if (response?.flag === '1') {
        this.transactionTypes = response.transactionTypes || [];
        this.allValidationErrors = response.errors || [];
        this.allMissingMasterData = response.notFoundValues || [];

        if (this.transactionTypes.length > 0) {
          this.selectedTransactionType = this.transactionTypes[0];
          this.updateValidationGrid();
        } else {
          this.filteredValidationGridData = [];
        }

        this.isValidationPopupVisible = true;
      } else {
        notify(response?.message || 'Validation failed', 'error', 3000);
      }
    } catch (error: any) {
      this.isLoading = false;
      console.error(error);
      notify('Failed to validate AR data', 'error', 3000);
    }
    this.cdr.detectChanges();
  }

  // ================= Validation Helpers =================
  updateValidationGrid() {
    const filteredErrors = this.allValidationErrors.filter(
      (e) => e.TransactionType === this.selectedTransactionType,
    );

    const map = new Map<string, any>();
    filteredErrors.forEach((err) => {
      const key = err.ErrorMessage;
      if (!map.has(key)) {
        map.set(key, {
          ErrorMessage: key,
          MissingCount: 0,
          Particular: err.Particular,
        });
      }
      const current = map.get(key);
      current.MissingCount += Number(err.ErrorCount) || 0;
    });

    this.filteredValidationGridData = Array.from(map.values());
  }

  hasMissingData(particular: string): boolean {
    return this.allMissingMasterData.some(
      (x) =>
        x.Particular === particular &&
        x.TransactionType === this.selectedTransactionType,
    );
  }

  onTransactionTypeChange(e: any) {
    this.selectedTransactionType = e.value;
    this.updateValidationGrid();
  }

  async downloadMissingParticulars(particular: string) {
    const missingValues = this.allMissingMasterData.filter(
      (x) =>
        x.Particular === particular &&
        x.TransactionType === this.selectedTransactionType,
    );

    if (missingValues.length === 0) {
      notify('No missing values found for this particular.', 'info', 3000);
      return;
    }

    let masterKey = '';

    if (['ApexTPACode', 'ApexInsuCode', 'ApexInstCode'].includes(particular)) {
      masterKey = 'Customer';
    } else if (
      ['ApexReportingDoctor', 'ApexReferringDoctor'].includes(particular)
    ) {
      masterKey = 'Clinician';
    } else if (
      ['ApexReportingDoctorDept', 'ApexReferringDoctorDept'].includes(
        particular,
      )
    ) {
      masterKey = 'Department';
    } else if (['Paymode'].includes(particular)) {
      masterKey = 'chartOfAccounts';
    } else if (['CPTCode'].includes(particular)) {
      masterKey = 'Cpt';
    }

    try {
      const response: any = await this.srvce.getImportMasterList().toPromise();

      let headers: string[] = [];
      let templateColumns: any[] = [];

      if (response && response[masterKey]) {
        templateColumns = response[masterKey];
        templateColumns.sort((a: any, b: any) => a.ID - b.ID);
        headers = templateColumns.map((col: any) => col.ColumnName);
      } else {
        headers = ['Particular', 'NotFoundValue'];
      }

      let csv = headers.join(',') + '\n';

      missingValues.forEach((row) => {
        const val = (row.NotFoundValue || '').toString();

        const rowData = headers.map((header, index) => {
          let cellValue = '';

          if (
            masterKey === 'Clinician' &&
            (header === 'ClinicianLicense' || header === 'ClinicianName')
          )
            cellValue = val;
          else if (masterKey === 'Department' && header === 'Department')
            cellValue = val;
          else if (masterKey === 'chartOfAccounts' && header === 'LedgerName')
            cellValue = val;
          else if (masterKey === 'Cpt' && header === 'CPTCode') cellValue = val;
          else if (masterKey === 'Customer' && header === 'Particular')
            cellValue = particular;
          else if (masterKey === 'Customer' && header === 'NotFoundValue')
            cellValue = val;
          else if (
            index === 0 &&
            masterKey === 'Customer' &&
            headers[0] !== 'Particular'
          )
            cellValue = val;

          return `"${cellValue.replace(/"/g, '""')}"`;
        });

        csv += rowData.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${masterKey || 'Missing'}_${particular}_Template.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download template', error);
      notify('Failed to generate template.', 'error', 3000);
    }
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
    ERPJVModule,
    CustomDatePopupModule,
    DxSelectBoxModule,
  ],
  providers: [],
  declarations: [ARImportedListComponent],
  exports: [ARImportedListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARImportedListModule {}
