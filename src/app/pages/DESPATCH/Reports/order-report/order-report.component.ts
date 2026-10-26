import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  DxSelectBoxModule,
  DxDateBoxModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxButtonModule,
  DxPopupModule,
  DxTagBoxModule,
  DxLoadPanelModule,
  DxLoadIndicatorModule,
  DxDataGridComponent,
} from 'devextreme-angular';

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-order-report',
  templateUrl: './order-report.component.html',
  styleUrls: ['./order-report.component.scss'],
})
export class OrderReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Date Filter Properties (Same as CashBook)
  years: number[] = [];
  selectedYear: number | null = null;
  monthDataSource: { name: string; value: any }[] = [];
  selectedmonth: any = '';
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string = '';
  formatted_To_date: string = '';

  // Filter Lists
  statesList: any[] = [];
  selectedStates: any[] = [];

  unitList: any[] = [];
  selectedUnits: any[] = [];

  allDealers: any[] = [];
  dealerList: any[] = [];
  selectedDealers: any[] = [];

  allSubDealers: any[] = [];
  subDealerList: any[] = [];
  selectedSubDealers: any[] = [];

  private isSyncingDealers = false;
  private autoSelectedDealerIds: Set<any> = new Set<any>();

  statusList: any[] = [];
  selectedStatuses: any[] = [];

  brandList: any[] = [];
  selectedBrand: any = null;

  orderNumber: any = '';

  orderFilterList: any[] = [];
  orderFilter: string = '';

  // Data Source for the DataGrid
  orderReportDataSource: any[] = [];

  // Pager & Pagination
  readonly allowedPageSizes: any = [10, 20, 50, 'all'];
  displayMode: any = 'full';

  // Column Chooser
  isColumnChooserVisible = false;
  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'ORDER_NO', caption: 'Order No' },
    { dataField: 'ORDER_DATE', caption: 'Order Date' },
    { dataField: 'DEALER', caption: 'Dealer' },
    { dataField: 'SUB_DEALER', caption: 'Sub Dealer' },
    { dataField: 'DESCRIPTION', caption: 'Status' },
    { dataField: 'ORDER_QTY', caption: 'Ordered Qty' },
    { dataField: 'ALLOCATED', caption: 'Allocated Qty' },
    { dataField: 'CANCELLED', caption: 'Cancelled Qty' },
    { dataField: 'ISSUED_QTY', caption: 'Issued Qty' },
    { dataField: 'OPEN_QTY', caption: 'Open Qty' },
    { dataField: 'TFF', caption: 'TFF' },
  ];

  // Summary State (Same as CashBook)
  private savedSummaryItems: any = null;
  summaryColumnsData = {
    totalItems: [
      {
        column: 'DEALER',
        summaryType: 'count',
        displayFormat: 'Total: {0} Orders',
        alignment: 'left',
      },
      {
        column: 'ORDER_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'ALLOCATED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'CANCELLED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'ISSUED_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'OPEN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'TFF',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'ORDER_QTY',
        summaryType: 'sum',
        displayFormat: 'Ordered: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ALLOCATED',
        summaryType: 'sum',
        displayFormat: 'Allocated: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'OPEN_QTY',
        summaryType: 'sum',
        displayFormat: 'Open: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
    ],
  };

  // Toolbar Buttons Options (Identical to CashBook)
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'outlined',
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    stylingMode: 'outlined',
    onClick: () => this.refreshGrid(),
  };

  columnChooserButtonOptions = {
    icon: 'columnchooser',
    hint: 'Choose Columns',
    stylingMode: 'outlined',
    onClick: () => this.openColumnChooser(),
  };

  summaryButtonOptions = {
    icon: 'formula',
    hint: 'Hide Summary',
    stylingMode: 'outlined',
    onClick: () => this.toggleSummary(),
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    // Populate Year dropdown (from current year down to 2015)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;

    // Populate Month dropdown
    this.monthDataSource = this.dataService.getMonths();
  }

  ngOnInit(): void {
    const today = new Date();
    const systemDate = this.formatDate(today);

    // Initial default date: 1st of current month to today
    this.selected_from_date = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    this.formatted_from_date = this.formatDate(this.selected_from_date);

    this.selected_To_date = systemDate;
    this.formatted_To_date = systemDate;

    // Load filter dropdowns only (data is loaded only when user clicks Apply)
    this.loadDropdowns();
  }

  // ================= LOAD ALL FILTER DROPDOWNS =================
  loadDropdowns(): void {
    // 1. States from common dropdown "STATE"
    this.dataService
      .getDropdownData({ NAME: 'STATE', name: 'STATE' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.statesList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.description || item.NAME || item.name,
          }));
        },
        error: (err: any) =>
          console.error('Error fetching STATE dropdown:', err),
      });

    // 2. Unit from common dropdown "COMPANY_CODE"
    this.dataService
      .getDropdownData({ NAME: 'COMPANY_CODE', name: 'COMPANY_CODE' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.unitList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION ||
              item.description ||
              item.CODE ||
              item.COMPANY_CODE ||
              item.name,
          }));
        },
        error: (err: any) =>
          console.error('Error fetching COMPANY_CODE dropdown:', err),
      });

    // 3. Brand from common dropdown "ARTICLEBRAND"
    this.dataService
      .getDropdownData({ NAME: 'ARTICLEBRAND', name: 'ARTICLEBRAND' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.brandList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.description || item.NAME || item.name,
          }));
        },
        error: (err: any) =>
          console.error('Error fetching ARTICLEBRAND dropdown:', err),
      });

    // 4. OrderFilter from common dropdown "ORDER_FILTER"
    this.dataService
      .getDropdownData({ NAME: 'ORDER_FILTER', name: 'ORDER_FILTER' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.orderFilterList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.description || item.NAME || item.name,
          }));
        },
        error: (err: any) =>
          console.error('Error fetching ORDER_FILTER dropdown:', err),
      });

    // 5. Status from dropdown used in order screen ("ORDER_STATUS")
    this.dataService
      .getDropdownData({ name: 'ORDER_STATUS', NAME: 'ORDER_STATUS' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          if (raw.length > 0) {
            this.statusList = raw.map((item: any) => ({
              ID: item.ID !== undefined ? item.ID : item.value,
              DESCRIPTION: item.DESCRIPTION || item.text || item.DESCRIPTION_EN,
            }));
          } else {
            this.fallbackStatuses();
          }
        },
        error: () => this.fallbackStatuses(),
      });

    // 6. Dealers & SubDealers (Cascading method as in order new screen)
    this.dataService.getNewOrderDealerList({}).subscribe({
      next: (res: any) => {
        const raw = res?.Data || (Array.isArray(res) ? res : []);
        this.allDealers = raw.map((item: any) => ({
          ID: item.ID !== undefined ? item.ID : item.id,
          DESCRIPTION:
            item.DESCRIPTION || item.description || item.NAME || item.name,
        }));
        this.dealerList = [...this.allDealers];
        if (this.allSubDealers.length > 0) {
          this.refreshSubDealerDisplayNames();
        }
      },
      error: (err: any) => console.error('Error fetching dealer list:', err),
    });

    this.dataService.getNewOrderSubDealerList({}).subscribe({
      next: (res: any) => {
        const raw = res?.Data || (Array.isArray(res) ? res : []);
        this.allSubDealers = raw.map((item: any) =>
          this.formatSubDealerItem(item),
        );
        this.subDealerList = [...this.allSubDealers];
      },
      error: (err: any) => console.error('Error fetching subdealer list:', err),
    });
  }

  private formatSubDealerItem(item: any): any {
    const rawDesc =
      item.RAW_DESCRIPTION ||
      item.DESCRIPTION ||
      item.description ||
      item.NAME ||
      item.name ||
      '';
    let dealerName = item.DEALER_NAME || '';
    if (!dealerName && item.DEALER_ID != null && this.allDealers?.length > 0) {
      const parent = this.allDealers.find((d: any) => d.ID === item.DEALER_ID);
      if (parent) {
        dealerName = parent.DESCRIPTION || parent.NAME || '';
      }
    }
    const displayName = dealerName ? `${rawDesc} (${dealerName})` : rawDesc;

    return {
      ...item,
      ID: item.ID !== undefined ? item.ID : item.id,
      NAME: displayName,
      DESCRIPTION: displayName,
      RAW_DESCRIPTION: rawDesc,
      DEALER_ID: item.DEALER_ID,
      DEALER_NAME: dealerName,
    };
  }

  private refreshSubDealerDisplayNames(): void {
    this.allSubDealers = this.allSubDealers.map((item: any) =>
      this.formatSubDealerItem(item),
    );
    if (this.selectedDealers.length > 0) {
      this.subDealerList = this.allSubDealers.filter((sub) =>
        this.selectedDealers.includes(sub.DEALER_ID),
      );
    } else {
      this.subDealerList = [...this.allSubDealers];
    }
  }

  private fallbackStatuses(): void {
    this.statusList = [
      { ID: 0, DESCRIPTION: 'Submitted' },
      { ID: 1, DESCRIPTION: 'Draft' },
      { ID: 2, DESCRIPTION: 'Open' },
      { ID: 3, DESCRIPTION: 'Accepted' },
      { ID: 4, DESCRIPTION: 'Rejected' },
      { ID: 5, DESCRIPTION: 'In Production' },
      { ID: 6, DESCRIPTION: 'Production Completed' },
      { ID: 7, DESCRIPTION: 'Partial' },
      { ID: 8, DESCRIPTION: 'In Transit' },
      { ID: 9, DESCRIPTION: 'Delivered' },
      { ID: 10, DESCRIPTION: 'Cancelled' },
      { ID: 11, DESCRIPTION: 'Allocated' },
    ];
  }

  // ================= CASCADING DEALER & SUBDEALER =================
  onDealerChanged(event: any): void {
    if (this.isSyncingDealers) return;
    this.isSyncingDealers = true;

    try {
      const selected = event.value;
      const selectedDealerIds = Array.isArray(selected)
        ? selected
        : selected != null
          ? [selected]
          : [];

      this.selectedDealers = selectedDealerIds;

      // Clean up autoSelectedDealerIds if user removed any dealer in the Dealer box
      this.autoSelectedDealerIds.forEach((dId) => {
        if (!selectedDealerIds.includes(dId)) {
          this.autoSelectedDealerIds.delete(dId);
        }
      });

      if (selectedDealerIds.length > 0) {
        // Filter subdealers that belong to selected dealers
        this.subDealerList = this.allSubDealers.filter((sub) =>
          selectedDealerIds.includes(sub.DEALER_ID),
        );

        // Clear any currently selected subdealers that do not belong to the selected dealer(s)
        if (Array.isArray(this.selectedSubDealers)) {
          this.selectedSubDealers = this.selectedSubDealers.filter((subId) =>
            this.subDealerList.some((s) => s.ID === subId),
          );
        }
      } else {
        // Restore all subdealers when no dealer is selected
        this.subDealerList = [...this.allSubDealers];
        this.selectedSubDealers = [];
        this.autoSelectedDealerIds.clear();
      }
    } finally {
      this.isSyncingDealers = false;
    }
  }

  onSubDealerChanged(event: any): void {
    if (this.isSyncingDealers) return;
    this.isSyncingDealers = true;

    try {
      const selected = event.value;
      const selectedSubIds: any[] = Array.isArray(selected)
        ? selected
        : selected != null
          ? [selected]
          : [];

      this.selectedSubDealers = selectedSubIds;

      // Find parent dealer IDs for all currently selected subdealers
      const currentParentDealerIds = new Set<any>();
      selectedSubIds.forEach((subId) => {
        const sub = this.allSubDealers.find((s) => s.ID === subId);
        if (sub && sub.DEALER_ID != null) {
          currentParentDealerIds.add(sub.DEALER_ID);
        }
      });

      const currentDealers = Array.isArray(this.selectedDealers)
        ? [...this.selectedDealers]
        : [];

      // 1. Remove auto-selected dealers that are no longer associated with selected subdealers
      let updatedDealers = currentDealers.filter((dId) => {
        if (
          this.autoSelectedDealerIds.has(dId) &&
          !currentParentDealerIds.has(dId)
        ) {
          this.autoSelectedDealerIds.delete(dId);
          return false;
        }
        return true;
      });

      // 2. Auto-select corresponding parent dealer(s) for newly selected subdealers
      currentParentDealerIds.forEach((parentDId) => {
        if (!updatedDealers.includes(parentDId)) {
          updatedDealers.push(parentDId);
          this.autoSelectedDealerIds.add(parentDId);
        }
      });

      this.selectedDealers = [...updatedDealers];

      // Update subDealerList based on the resulting selected dealers
      if (this.selectedDealers.length > 0) {
        this.subDealerList = this.allSubDealers.filter((sub) =>
          this.selectedDealers.includes(sub.DEALER_ID),
        );
      } else {
        this.subDealerList = [...this.allSubDealers];
      }
    } finally {
      this.isSyncingDealers = false;
    }
  }

  onOrderFilterCustomItemCreating(e: any): void {
    if (!e.text) return;
    const customItem = { ID: e.text, DESCRIPTION: e.text };
    this.orderFilterList = [customItem, ...this.orderFilterList];
    e.customItem = customItem;
  }

  // ================= LOAD ORDER REPORT DATA (On Apply Button Click) =================
  loadOrderReportData(): void {
    this.isLoading = true;

    // Build payload according to exact API specification:
    // api/OrderRpt/OrderSummary
    const payload = {
      DATE_FROM:
        this.formatted_from_date ||
        this.formatDate(new Date(this.selected_from_date)),
      DATE_TO:
        this.formatted_To_date ||
        this.formatDate(new Date(this.selected_To_date)),
      STATUS:
        this.selectedStatuses && this.selectedStatuses.length > 0
          ? this.selectedStatuses.join(',')
          : '',
      BRAND_ID: Number(this.selectedBrand) || 0,
      STATE_ID:
        this.selectedStates && this.selectedStates.length > 0
          ? Number(this.selectedStates[0])
          : 0,
      UNIT_ID:
        this.selectedUnits && this.selectedUnits.length > 0
          ? Number(this.selectedUnits[0])
          : 0,
      DEALER_ID:
        this.selectedDealers && this.selectedDealers.length > 0
          ? Number(this.selectedDealers[0])
          : 0,
      SUB_DEALER_ID:
        this.selectedSubDealers && this.selectedSubDealers.length > 0
          ? Number(this.selectedSubDealers[0])
          : 0,
      ORDER_NO: Number(this.orderNumber) || 0,
      ORDER_FILTER: this.orderFilter ? String(this.orderFilter) : '',
    };

    this.dataService.getOrderSummaryReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.Data && Array.isArray(res.Data)) {
          this.orderReportDataSource = res.Data;
        } else if (Array.isArray(res)) {
          this.orderReportDataSource = res;
        } else {
          this.orderReportDataSource = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading order summary report:', err);
        this.orderReportDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  resetFilters(): void {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const systemDate = this.formatDate(today);

    this.selectedYear = currentYear;
    this.selectedmonth = '';
    this.selected_from_date = new Date(currentYear, today.getMonth(), 1);
    this.selected_To_date = systemDate;
    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = systemDate;

    this.selectedStates = [];
    this.selectedUnits = [];
    this.selectedDealers = [];
    this.selectedSubDealers = [];
    this.autoSelectedDealerIds.clear();
    this.subDealerList = [...this.allSubDealers];
    this.selectedStatuses = [];
    this.selectedBrand = null;
    this.orderNumber = null;
    this.orderFilter = '';

    this.orderReportDataSource = [];
  }

  // ================= DATE CHANGED HANDLERS (Same as CashBook) =================
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

    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = this.formatDate(new Date(this.selected_To_date));
  }

  onMonthValueChanged(e: any): void {
    this.selectedmonth = e.value ?? '';
    const yr = this.selectedYear || new Date().getFullYear();
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(yr, 0, 1);
      this.selected_To_date = new Date(yr, 11, 31);
    } else {
      this.selected_from_date = new Date(yr, this.selectedmonth, 1);
      this.selected_To_date = new Date(yr, this.selectedmonth + 1, 0);
    }

    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  onFromDateChange(event: any): void {
    if (event.value) {
      const rawDate: Date = new Date(event.value);
      this.formatted_from_date = this.formatDate(rawDate);
    }
  }

  onToDateChange(event: any): void {
    if (event.value) {
      const rawDate: Date = new Date(event.value);
      this.formatted_To_date = this.formatDate(rawDate);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatDates(cellData: any): string {
    if (!cellData) return '';
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getStatusBadgeClass(description: string): string {
    if (!description) return 'status-default';
    const normalized = description.toLowerCase().trim().replace(/\s+/g, '-');
    return `status-${normalized}`;
  }

  // ================= GRID ACTIONS & TOOLBAR =================
  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  toggleFilterRow(): void {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  }

  refreshGrid(): void {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.loadOrderReportData();
  }

  onExporting(event: any): void {
    const fileName = 'Order Report';
    this.dataService.exportDataGridReport(event, fileName);
  }

  // ================= SUMMARY TOGGLE (Same as CashBook) =================
  toggleSummary(): void {
    if (this.isSummaryVisible) {
      this.savedSummaryItems = {
        totalItems: this.summaryColumnsData.totalItems,
        groupItems: this.summaryColumnsData.groupItems,
      };

      this.summaryColumnsData = {
        ...this.summaryColumnsData,
        totalItems: [],
        groupItems: [],
      };
    } else if (this.savedSummaryItems) {
      this.summaryColumnsData = {
        ...this.summaryColumnsData,
        ...this.savedSummaryItems,
      };
    }

    this.isSummaryVisible = !this.isSummaryVisible;

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  // ================= COLUMN CHOOSER (Same as CashBook) =================
  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible: grid.columnOption(column.dataField, 'visible') !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

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
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxTagBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
  ],
  declarations: [OrderReportComponent],
  exports: [OrderReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderReportModule {}
