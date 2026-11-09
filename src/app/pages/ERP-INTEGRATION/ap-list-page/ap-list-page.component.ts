import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
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
  DxLoadIndicatorModule,
} from 'devextreme-angular';
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
  selector: 'app-ap-list-page',
  templateUrl: './ap-list-page.component.html',
  styleUrls: ['./ap-list-page.component.scss'],
})
export class ApListPageComponent implements OnInit {
  @ViewChild('detailGrid', { static: false })
  detailGrid!: DxDataGridComponent;

  @ViewChild(ERPJVComponent)
  JournalVoucherFormComponent!: ERPJVComponent;

  isFilterOpened: boolean = false;
  showFilterRow: boolean = false;
  currentFilter: string = 'auto';

  importDataList: any[] = [];
  importDetailData: any[] = [];
  expandedRowKeys: any[] = [];
  detailDataMap: { [key: string]: any[] } = {};
  detailLoadingMap: { [key: string]: boolean } = {};

  isLoading: boolean = false;
  loadingMessage: string = 'Loading AP data...';

  // ================= Progress Variables =================
  isProcessingRows: boolean = false;
  progressMessage: string = 'Processing Pending Rows...';
  totalRequestCount: number = 0;
  completedRequestCount: number = 0;
  failedRequestCount: number = 0;
  pendingRequestCount: number = 0;

  // ================= Journal Voucher Variables =================
  isViewJournalVoucher: boolean = false;
  selectedJournalVoucher: any[] = [];
  selectedTransID: any;

  // ================= Validation Popup Variables =================
  isValidationPopupVisible: boolean = false;
  transactionTypes: string[] = [];
  documentTypes: string[] = [];
  selectedTransactionType: string = '';
  allValidationErrors: any[] = [];
  allMissingMasterData: any[] = [];
  filteredValidationGridData: any[] = [];
  isErrorDetailsPopupVisible: boolean = false;
  errorDetailsGridData: any[] = [];
  selectedErrorSummary: any = null;

  // ================= Date Filter Variables =================
  dateRanges = [
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedDateRange: any = 'last30';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup: boolean = false;

  // ================= Toolbar Buttons =================
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
    hint: 'Process AP Data',
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
    hint: 'Validate AP Data',
    onClick: () => {
      this.verifyPendingRows();
    },
    elementAttr: { class: 'add-button mx-2' },
  };

  constructor(
    private ngZone: NgZone,
    private srvce: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetch_Full_import_list();
  }

  // ======== Date Formatting & Filter Helpers ==========
  private parseLocalDate(
    input: any,
  ): { year: number; month: number; day: number } | null {
    if (!input) return null;
    if (input instanceof Date) {
      if (isNaN(input.getTime())) return null;
      return {
        year: input.getFullYear(),
        month: input.getMonth() + 1,
        day: input.getDate(),
      };
    }
    if (typeof input === 'string') {
      const trimmed = input.trim();
      const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        return {
          year: parseInt(isoMatch[1], 10),
          month: parseInt(isoMatch[2], 10),
          day: parseInt(isoMatch[3], 10),
        };
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmyMatch) {
        return {
          year: parseInt(dmyMatch[3], 10),
          month: parseInt(dmyMatch[2], 10),
          day: parseInt(dmyMatch[1], 10),
        };
      }
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return {
          year: parsed.getFullYear(),
          month: parsed.getMonth() + 1,
          day: parsed.getDate(),
        };
      }
    }
    return null;
  }

  private formatAsPayloadDate(
    input: any,
    isEndDate: boolean = false,
  ): string | null {
    const parts = this.parseLocalDate(input);
    if (!parts) return null;
    const yyyy = String(parts.year).padStart(4, '0');
    const mm = String(parts.month).padStart(2, '0');
    const dd = String(parts.day).padStart(2, '0');
    const time = isEndDate ? '23:59:59.999Z' : '00:00:00.000Z';
    return `${yyyy}-${mm}-${dd}T${time}`;
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(this.customStartDate);
      const to = this.formatAsDDMMYYYY(this.customEndDate);
      return `${from} to ${to}`;
    }

    return item.label;
  };

  private formatAsDDMMYYYY(d: any): string {
    const parts = this.parseLocalDate(d);
    if (!parts) return '';
    const day = String(parts.day).padStart(2, '0');
    const month = String(parts.month).padStart(2, '0');
    const year = parts.year;
    return `${day}-${month}-${year}`;
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

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
        innerList.off('itemClick');
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
    let fromDate: any = null;
    let toDate: any = null;

    switch (this.selectedDateRange) {
      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        toDate = new Date();
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        toDate = new Date();
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        toDate = new Date();
        break;

      case 'all':
        return { fromDate: null, toDate: null };

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = this.customStartDate;
          toDate = this.customEndDate;
        }
        break;
    }

    return {
      fromDate: this.formatAsPayloadDate(fromDate, false),
      toDate: this.formatAsPayloadDate(toDate, true),
    };
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;
    this.applyCustomDateFilter();
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    const fromParts = this.parseLocalDate(this.customStartDate);
    const toParts = this.parseLocalDate(this.customEndDate);

    if (fromParts && toParts) {
      const fromNum =
        fromParts.year * 10000 + fromParts.month * 100 + fromParts.day;
      const toNum = toParts.year * 10000 + toParts.month * 100 + toParts.day;
      if (fromNum > toNum) {
        alert('From date cannot be greater than To date');
        return;
      }
    }

    const fromLabel = this.formatAsDDMMYYYY(this.customStartDate);
    const toLabel = this.formatAsDDMMYYYY(this.customEndDate);

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.fetch_Full_import_list();
  }

  // ====== Fetch AP Data list exclusively from API using DataService =======
  fetch_Full_import_list(): Promise<any> {
    this.isLoading = true;
    this.loadingMessage = 'Loading AP data...';
    this.cdr.detectChanges();

    const { fromDate, toDate } = this.getDateRange();
    const payload = {
      FromDate: fromDate,
      ToDate: toDate,
    };

    // Calling real AP List API (api/APList/aplist) via DataService
    return new Promise((resolve) => {
      this.srvce.import_AP_Full_List(payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const rawHeaders = response?.Header || response?.header || [];
          const rawDetails = response?.Detail || response?.detail || [];

          this.processApiResponse(rawHeaders, rawDetails);
          this.cdr.detectChanges();
          resolve(response);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('api/APList/aplist API call failed:', error);
          this.importDataList = [];
          this.importDetailData = [];
          this.detailDataMap = {};
          this.cdr.detectChanges();
          resolve(null);
        },
      });
    });
  }

  private processApiResponse(headers: any[], details: any[]) {
    const formatData = (data: any[] = [], isHeader: boolean = false) => {
      return data.map((item: any, index: number) => {
        const updatedItem: any = { ...item };

        // Guaranteed unique row key for DevExtreme internal tracking
        if (isHeader) {
          updatedItem._rowKey =
            item.ID != null
              ? item.ID
              : (item.HeaderID != null
                  ? item.HeaderID
                  : (item.InvoiceNo ? `${item.InvoiceNo}_${index}` : `ap_hdr_${index}`));
        } else {
          updatedItem._rowKey =
            item.ID != null
              ? item.ID
              : (item.TransactionID != null
                  ? item.TransactionID
                  : `${item.ApexInvoiceNumber || item.InvoiceNo || 'det'}_${index}`);
        }

        Object.keys(updatedItem).forEach((key: string) => {
          const value = updatedItem[key];

          // Date Field Conversion (e.g. 2021-01-18T16:05:50 -> 18-01-2021)
          if (
            value &&
            typeof value === 'string' &&
            key.toLowerCase().includes('date')
          ) {
            const parts = this.parseLocalDate(value);
            if (parts) {
              updatedItem[key] = [
                String(parts.day).padStart(2, '0'),
                String(parts.month).padStart(2, '0'),
                parts.year,
              ].join('-');
            }
          }
        });

        return updatedItem;
      });
    };

    this.importDataList = formatData(headers, true);
    this.importDetailData = formatData(details, false);

    // Refresh detail maps for any already expanded rows
    if (this.expandedRowKeys.length > 0) {
      this.expandedRowKeys.forEach((rowKey) => {
        const headerRow = this.importDataList.find(
          (x) => x._rowKey === rowKey || String(x._rowKey) === String(rowKey),
        );
        if (headerRow) {
          this.detailDataMap[rowKey] = this.getMatchingDetails(headerRow);
        }
      });
      this.detailDataMap = { ...this.detailDataMap };
    }
  }

  getMatchingDetails = (headerRow: any): any[] => {
    if (
      !headerRow ||
      !this.importDetailData ||
      this.importDetailData.length === 0
    ) {
      return [];
    }

    const headerId = headerRow.ID ?? headerRow.HeaderID ?? headerRow.Id;

    return this.importDetailData.filter((detail: any) => {
      const detailHeaderId =
        detail.HEADER_ID ??
        detail.HeaderID ??
        detail.HeaderId ??
        detail.header_id;

      // 1. Direct join condition: header.ID = details.HeaderID (or HEADER_ID)
      if (headerId != null && detailHeaderId != null) {
        return String(headerId).trim() === String(detailHeaderId).trim();
      }

      // 2. Fallback: match by TransactionID
      if (
        headerRow.TransactionID != null &&
        detail.TransactionID != null &&
        String(headerRow.TransactionID).trim() ===
          String(detail.TransactionID).trim()
      ) {
        return true;
      }

      // 3. Fallback: match by InvoiceNo / ApexInvoiceNumber + SupplierCode + SupplierInvoiceNo
      const headerInv = (
        headerRow.InvoiceNo ||
        headerRow.ApexInvoiceNumber ||
        ''
      )
        .toString()
        .trim()
        .toLowerCase();
      const detailInv = (detail.ApexInvoiceNumber || detail.InvoiceNo || '')
        .toString()
        .trim()
        .toLowerCase();

      const headerSuppCode = (headerRow.SupplierCode || '')
        .toString()
        .trim()
        .toLowerCase();
      const detailSuppCode = (detail.SupplierCode || '')
        .toString()
        .trim()
        .toLowerCase();

      const headerSuppInv = (
        headerRow.SupplierInvoiceNo ||
        headerRow.SupplierInvoiceNumber ||
        ''
      )
        .toString()
        .trim()
        .toLowerCase();
      const detailSuppInv = (
        detail.SupplierInvoiceNumber ||
        detail.SupplierInvoiceNo ||
        ''
      )
        .toString()
        .trim()
        .toLowerCase();

      if (
        headerInv &&
        detailInv &&
        headerInv === detailInv &&
        headerSuppCode &&
        detailSuppCode &&
        headerSuppCode === detailSuppCode &&
        headerSuppInv &&
        detailSuppInv &&
        headerSuppInv === detailSuppInv
      ) {
        return true;
      }

      // Secondary fallback if secondary fields are empty/omitted
      if (headerInv && detailInv && headerInv === detailInv) {
        const suppCodeOk =
          !headerSuppCode ||
          !detailSuppCode ||
          headerSuppCode === detailSuppCode;
        const suppInvOk =
          !headerSuppInv || !detailSuppInv || headerSuppInv === detailSuppInv;
        return suppCodeOk && suppInvOk;
      }

      return false;
    });
  };

  // ===== Master-Detail Row Expanding =====
  ensureDetailsLoaded(masterData: any): boolean {
    const rowKey = masterData?.key;
    if (rowKey == null) return true;
    if (!this.detailDataMap[rowKey] && !this.detailLoadingMap[rowKey]) {
      this.detailLoadingMap[rowKey] = true;
      const headerRow =
        masterData.data ||
        this.importDataList.find(
          (x) => x._rowKey === rowKey || String(x._rowKey) === String(rowKey),
        );

      setTimeout(() => {
        this.detailDataMap[rowKey] = this.getMatchingDetails(headerRow);
        this.detailLoadingMap[rowKey] = false;
        this.detailDataMap = { ...this.detailDataMap };
        this.cdr.detectChanges();
      }, 300);
    }
    return true;
  }

  onRowExpanding(e: any) {
    const rowKey = e.key;
    if (!this.expandedRowKeys.some((k) => String(k) === String(rowKey))) {
      this.expandedRowKeys.push(rowKey);
    }
    const headerRow =
      e.data ||
      this.importDataList.find(
        (x) => x._rowKey === rowKey || String(x._rowKey) === String(rowKey),
      );

    if (!this.detailDataMap[rowKey]) {
      this.detailLoadingMap[rowKey] = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.detailDataMap[rowKey] = this.getMatchingDetails(headerRow);
        this.detailLoadingMap[rowKey] = false;
        this.detailDataMap = { ...this.detailDataMap };
        this.cdr.detectChanges();
      }, 300);
    }
  }

  onRowCollapsing(e: any) {
    const rowKey = e.key;
    this.expandedRowKeys = this.expandedRowKeys.filter(
      (x) => String(x) !== String(rowKey),
    );
    delete this.detailDataMap[rowKey];
    delete this.detailLoadingMap[rowKey];
  }

  refreshGrid(): Promise<any> {
    const fetchPromise = this.fetch_Full_import_list();
    if (this.detailGrid?.instance) {
      this.detailGrid.instance.refresh();
    }
    return fetchPromise;
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.showFilterRow = this.isFilterOpened;
    const grid = this.detailGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
    this.cdr.detectChanges();
  }

  onCellPrepared(e: any) {
    // ===== Disable Selection Checkbox for Posted rows =====
    if (
      e.rowType === 'data' &&
      e.column.command === 'select' &&
      e.data?.Status?.trim() === 'Posted'
    ) {
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';
      e.cellElement.setAttribute('title', 'Click to open journal voucher');

      const checkbox = e.cellElement.querySelector('.dx-select-checkbox');
      if (checkbox) {
        (checkbox as HTMLElement).style.display = 'none';
      }
    }

    // ===== Status Column Color =====
    if (e.rowType === 'data' && e.column.dataField === 'Status') {
      const status = e.value?.trim();

      if (status === 'Open') {
        e.cellElement.style.color = '#ff6f0f';
        e.cellElement.style.fontWeight = '600';
      } else if (status === 'Posted') {
        e.cellElement.style.color = '#03b12b';
        e.cellElement.style.fontWeight = '600';
      } else if (status === 'Failed') {
        e.cellElement.style.color = '#ff2929';
        e.cellElement.style.fontWeight = '600';
      }
    }
  }

  // ====== Allow Checkbox Only For Pending / Failed ======
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.command === 'select') {
      const status = e.row?.data?.Status;
      if (status !== 'Open' && status !== 'Failed') {
        e.editorOptions.disabled = true;
      }
    }
  }

  // ======== Click On Posted Status Cell -> Open Journal Voucher =======
  onCellClick(e: any) {
    if (e.rowType !== 'data') return;
    if (e.column?.dataField !== 'Status') return;
    if (e.data?.Status?.trim() !== 'Posted') return;

    const matching = this.getMatchingDetails(e.data);
    this.selectedTransID =
      e.data?.AcTransID ||
      e.data?.TransactionID ||
      e.data?.ID ||
      matching?.[0]?.AcTransID ||
      matching?.[0]?.TransactionID ||
      matching?.[0]?.ID;

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
        console.error('Failed to load Journal Voucher', err);
        notify('Failed to load Journal Voucher', 'error', 3000);
      },
    });
  }

  handleClose() {
    this.isViewJournalVoucher = false;
  }

  // ======== Verify Pending Rows=====
  async verifyPendingRows() {
    // Selected Rows
    const selectedRows = this.detailGrid?.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select rows', 'warning', 3000);
      return;
    }

    // Pending Rows Only (Open or Failed)
    const pendingRows = selectedRows.filter(
      (x: any) => !x.Status || x.Status === 'Open' || x.Status === 'Failed',
    );

    if (pendingRows.length === 0) {
      notify('Please select pending rows only', 'warning', 3000);
      return;
    }

    const transactionIDs = pendingRows
      .map((row: any) => row.HeaderID ?? row.ID)
      .filter((id: any) => id != null)
      .join(',');

    this.loadingMessage = 'Validating...';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const response: any = await this.srvce
        .getValidationAPData({
          TransactionIDs: transactionIDs,
        })
        .toPromise();

      this.isLoading = false;
      this.loadingMessage = 'Loading AP data...';

      const errors = response?.errors || [];
      const notFoundValues = response?.notFoundValues || [];

      if (errors.length > 0 || notFoundValues.length > 0) {
        this.documentTypes = response?.documentTypes || [];
        this.transactionTypes =
          response?.documentTypes || response?.transactionTypes || [];
        this.allValidationErrors = errors;
        this.allMissingMasterData = notFoundValues;

        this.updateValidationGrid();
        this.isValidationPopupVisible = true;
      } else if (
        response?.flag === '1' ||
        response?.flag === 1 ||
        response?.success === true ||
        response?.Success === true
      ) {
        notify(response?.message || 'Validation successful', 'success', 3000);
      } else {
        notify(response?.message || 'Validation failed', 'error', 3000);
      }

      // Refresh full grid data after validation completes
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.refreshGrid();
    } catch (error: any) {
      this.isLoading = false;
      this.loadingMessage = 'Loading AP data...';
      console.error(error);
      notify('Failed to validate AP data', 'error', 3000);
    }
    this.cdr.detectChanges();
  }

  // ===== Process Pending Rows ======
  async processPendingRows() {
    const selectedRows = this.detailGrid?.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select rows', 'warning', 3000);
      return;
    }

    const pendingRows = selectedRows.filter(
      (x: any) => x.Status === 'Open' || x.Status === 'Failed',
    );

    if (pendingRows.length === 0) {
      notify('Please select pending rows only', 'warning', 3000);
      return;
    }

    this.isProcessingRows = true;
    this.progressMessage = 'Processing Pending Rows...';

    this.totalRequestCount = pendingRows.length;
    this.completedRequestCount = 0;
    this.failedRequestCount = 0;
    this.pendingRequestCount = pendingRows.length;
    const failureMessages: string[] = [];

    this.cdr.detectChanges();

    for (const row of pendingRows) {
      try {
        const response: any = await this.srvce
          .process_pending_ap_rows(row)
          .toPromise();

        const isSuccess =
          response?.flag === '1' ||
          response?.flag === 1 ||
          response?.Flag === '1' ||
          response?.Flag === 1 ||
          response?.Success === true ||
          response?.success === true;

        if (isSuccess) {
          this.completedRequestCount++;
        } else {
          this.failedRequestCount++;
          const msg =
            response?.Message ||
            response?.FailureReason ||
            response?.message ||
            response?.failureReason;
          if (msg && !failureMessages.includes(msg)) {
            failureMessages.push(msg);
          }
        }
      } catch (error: any) {
        this.failedRequestCount++;
        const errorMsg =
          error?.error?.Message ||
          error?.error?.FailureReason ||
          error?.error?.message ||
          error?.error?.failureReason ||
          error?.message;
        if (errorMsg && !failureMessages.includes(errorMsg)) {
          failureMessages.push(errorMsg);
        }
      }

      this.pendingRequestCount =
        this.totalRequestCount -
        (this.completedRequestCount + this.failedRequestCount);

      this.cdr.detectChanges();
    }

    this.isProcessingRows = false;
    this.cdr.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 500));
    this.detailGrid?.instance.clearSelection();
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.detailGrid?.instance.clearFilter();
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.detailGrid?.instance.searchByText('');

    if (this.completedRequestCount === 0 && this.failedRequestCount > 0) {
      const failureMsg =
        failureMessages.length > 0
          ? failureMessages.join('\n')
          : 'Processing failed';

      notify(
        {
          message: failureMsg,
          position: { at: 'top right', my: 'top right' },
          displayTime: 6000,
        },
        'error',
      );
    } else if (this.failedRequestCount > 0) {
      const failureMsg =
        failureMessages.length > 0
          ? `\nReason: ${failureMessages.join('\n')}`
          : '';

      notify(
        {
          message: `Processing completed.
      Success : ${this.completedRequestCount}
      Failed : ${this.failedRequestCount}${failureMsg}`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 6000,
        },
        'warning',
      );
    } else {
      notify(
        {
          message: `Processing completed.
      Success : ${this.completedRequestCount}
      Failed : ${this.failedRequestCount}`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 5000,
        },
        'success',
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.fetch_Full_import_list();
    this.refreshGrid();
  }

  // ======= Validation Helpers =======
  updateValidationGrid() {
    const map = new Map<string, any>();
    const errorList =
      this.allValidationErrors && this.allValidationErrors.length > 0
        ? this.allValidationErrors
        : this.allMissingMasterData || [];

    errorList.forEach((err) => {
      const type = err.DocumentType || err.TransactionType || 'Invoice';
      const particular = err.Particular || '';
      const errorMessage =
        err.ErrorMessage ||
        err.Message ||
        (particular ? `${particular} Not Found` : 'Validation Error');
      const key = `${type}_${errorMessage}_${particular}`;

      if (!map.has(key)) {
        map.set(key, {
          ErrorMessage: errorMessage,
          MissingCount: 0,
          AffectedRowsCount: 0,
          Particular: particular,
          BatchNo: err.BatchNo,
          TransactionType: type,
          DocumentType: type,
          NotFoundValues: [],
          _headerIds: new Set<any>(),
        });
      }
      const current = map.get(key);

      if (err.ErrorCount != null) {
        current.MissingCount += Number(err.ErrorCount) || 0;
      } else if (err.MissingCount != null) {
        current.MissingCount += Number(err.MissingCount) || 0;
      } else {
        current.MissingCount += 1;
      }

      if (err.AffectedRowsCount != null) {
        current.AffectedRowsCount += Number(err.AffectedRowsCount) || 0;
      } else if (err.HeaderID != null) {
        current._headerIds.add(err.HeaderID);
        current.AffectedRowsCount = current._headerIds.size;
      } else {
        current.AffectedRowsCount += 1;
      }
    });

    map.forEach((item) => {
      const missingForParticular = (this.allMissingMasterData || []).filter(
        (x: any) => {
          const matchPart = !item.Particular || x.Particular === item.Particular;
          const matchType =
            !item.DocumentType ||
            x.DocumentType === item.DocumentType ||
            x.TransactionType === item.DocumentType;
          return matchPart && matchType;
        },
      );

      const notFoundVals = Array.from(
        new Set(
          missingForParticular
            .map((x: any) =>
              (x.NotFoundValue ?? x.Value ?? x.ParticularValue ?? x.Code ?? '')
                .toString()
                .trim(),
            )
            .filter((v: string) => v.length > 0),
        ),
      );

      item.NotFoundValues = notFoundVals;
    });

    this.filteredValidationGridData = Array.from(map.values());
  }

  async viewErrorDetails(cellData: any) {
    this.selectedErrorSummary = cellData;
    const type = cellData.TransactionType || cellData.DocumentType;
    const payload = {
      BatchNo: cellData.BatchNo,
      TransactionType: type,
      Particular: cellData.Particular,
    };

    const matchingNotFound = (this.allMissingMasterData || []).filter(
      (x: any) => {
        const matchPart =
          !cellData.Particular || x.Particular === cellData.Particular;
        const matchType =
          !type ||
          x.DocumentType === type ||
          x.TransactionType === type;
        return matchPart && matchType;
      },
    );

    const notFoundVals = Array.from(
      new Set(
        matchingNotFound
          .map((x: any) =>
            (x.NotFoundValue ?? x.Value ?? x.ParticularValue ?? x.Code ?? '')
              .toString()
              .trim(),
          )
          .filter((v: string) => v.length > 0),
      ),
    );

    if (this.allValidationErrors && this.allValidationErrors.length > 0) {
      const matched = this.allValidationErrors.filter((item: any) => {
        const itemType = item.DocumentType || item.TransactionType;
        const matchesType = !type || itemType === type;
        const matchesPart =
          !cellData.Particular || item.Particular === cellData.Particular;
        const matchesBatch =
          !cellData.BatchNo || item.BatchNo === cellData.BatchNo;
        return (
          matchesType &&
          (cellData.Particular ? matchesPart : true) &&
          (cellData.BatchNo ? matchesBatch : true)
        );
      });

      if (matched.length > 0) {
        this.errorDetailsGridData = matched.map((item: any, idx: number) => {
          const row: any = { ...item };
          if (row.hasOwnProperty('Verified')) {
            row.Verified = row.Verified ? 'True' : 'False';
          }
          row.HeaderID = item.HeaderID ?? item.TransactionID ?? '-';
          row.DocumentType = item.DocumentType || item.TransactionType || type;
          row.Particular = item.Particular || cellData.Particular;
          row.NotFoundValue =
            item.NotFoundValue ||
            matchingNotFound[idx]?.NotFoundValue ||
            (notFoundVals.length === 1 ? notFoundVals[0] : (notFoundVals[idx] || '-'));
          row.ErrorMessage = item.ErrorMessage || cellData.ErrorMessage;
          return row;
        });
        this.isErrorDetailsPopupVisible = true;
        this.cdr.detectChanges();
        return;
      }
    }

    this.loadingMessage = 'Loading error details...';
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const response: any = await this.srvce
        .getARErrorData(payload)
        .toPromise();

      this.isLoading = false;
      this.loadingMessage = 'Loading AP data...';

      if (response?.flag === '1') {
        this.errorDetailsGridData = (response.data || []).map(
          (item: any, idx: number) => {
            const row: any = { ...item };
            if (row.hasOwnProperty('Verified')) {
              row.Verified = row.Verified ? 'True' : 'False';
            }
            if (!row.NotFoundValue) {
              row.NotFoundValue =
                matchingNotFound[idx]?.NotFoundValue ||
                (notFoundVals.length === 1 ? notFoundVals[0] : (notFoundVals[idx] || '-'));
            }
            return row;
          },
        );
        this.isErrorDetailsPopupVisible = true;
      } else {
        notify(
          response?.message || 'Failed to load error details',
          'error',
          3000,
        );
      }
    } catch (error: any) {
      this.isLoading = false;
      console.error(error);
      notify('Failed to fetch error details', 'error', 3000);
    }
    this.cdr.detectChanges();
  }

  hasMissingData(particular: string, transactionType: string): boolean {
    return this.allMissingMasterData.some(
      (x) =>
        x.Particular === particular &&
        (!transactionType ||
          x.TransactionType === transactionType ||
          x.DocumentType === transactionType),
    );
  }

  async downloadMissingParticulars(
    particular: string,
    transactionType: string,
  ) {
    const missingValues = this.allMissingMasterData.filter(
      (x) =>
        x.Particular === particular &&
        (!transactionType ||
          x.TransactionType === transactionType ||
          x.DocumentType === transactionType),
    );

    if (missingValues.length === 0) {
      notify('No missing values found for this particular.', 'info', 3000);
      return;
    }

    let masterKey = '';
    if (['HISTPACode', 'HISInsuCode', 'HISInstCode'].includes(particular)) {
      masterKey = 'Customer';
    } else if (
      ['HISReportingDoctor', 'HISReferringDoctor'].includes(particular)
    ) {
      masterKey = 'Clinician';
    } else if (
      ['HISReportingDoctorDept', 'HISReferringDoctorDept'].includes(particular)
    ) {
      masterKey = 'Department';
    } else if (['Paymode'].includes(particular)) {
      masterKey = 'chartOfAccounts';
    } else if (['CPTCode'].includes(particular)) {
      masterKey = 'Cpt';
    } else if (['SupplierCode', 'Supplier'].includes(particular)) {
      masterKey = 'Supplier';
    } else if (['MatlCode', 'ItemCode', 'MaterialCode'].includes(particular)) {
      masterKey = 'Item';
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
        const val = (
          row.NotFoundValue ??
          row.Value ??
          row.ParticularValue ??
          row.Code ??
          ''
        ).toString();

        const rowData = headers.map((header, index) => {
          let cellValue = '';

          if (header === 'Particular') cellValue = particular;
          else if (header === 'NotFoundValue') cellValue = val;
          else if (
            masterKey === 'Clinician' &&
            (header === 'ClinicianLicense' || header === 'ClinicianName')
          )
            cellValue = val;
          else if (masterKey === 'Department' && header === 'Department')
            cellValue = val;
          else if (masterKey === 'chartOfAccounts' && header === 'LedgerName')
            cellValue = val;
          else if (masterKey === 'Cpt' && header === 'CPTCode') cellValue = val;
          else if (
            masterKey === 'Supplier' &&
            (header === 'SupplierCode' ||
              header === 'SupplierName' ||
              header === 'Code')
          )
            cellValue = val;
          else if (
            masterKey === 'Item' &&
            (header === 'ItemCode' ||
              header === 'ItemName' ||
              header === 'MatlCode')
          )
            cellValue = val;
          else if (
            index === 0 &&
            (masterKey === 'Customer' ||
              masterKey === 'Supplier' ||
              masterKey === 'Item') &&
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

  onExporting(event: any) {
    this.srvce.exportDataGridReport(event, 'AP_List_Report');
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
    DxLoadIndicatorModule,
    ERPJVModule,
    CustomDatePopupModule,
    DxSelectBoxModule,
  ],
  providers: [],
  declarations: [ApListPageComponent],
  exports: [ApListPageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ApListPageModule {}
