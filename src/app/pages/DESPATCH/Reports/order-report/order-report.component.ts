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
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

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

  dealerDataSource: DataSource = new DataSource({
    store: new ArrayStore({
      data: [],
      key: 'ID',
    }),
    paginate: true,
    pageSize: 50,
  });

  subDealerDataSource: DataSource = new DataSource({
    store: new ArrayStore({
      data: [],
      key: 'ID',
    }),
    paginate: true,
    pageSize: 50,
  });

  private dealerMap = new Map<any, string>();
  private subDealerMap = new Map<any, any>();

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

  // Summary Configuration
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
    hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    stylingMode: 'outlined',
    onClick: () => this.toggleSummary(),
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
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
    const currentYear = today.getFullYear();
    const systemDate = this.formatDate(today);

    // Initial default date: Jan 1 of current year to today (Month: All)
    this.selectedYear = currentYear;
    this.selectedmonth = '';

    this.selected_from_date = new Date(currentYear, 0, 1);
    this.formatted_from_date = this.formatDate(this.selected_from_date);

    this.selected_To_date = today;
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
        this.dealerMap.clear();
        this.allDealers = raw.map((item: any) => {
          const id = item.ID !== undefined ? item.ID : item.id;
          const desc =
            item.DESCRIPTION || item.description || item.NAME || item.name;
          this.dealerMap.set(id, desc);
          return {
            ID: id,
            DESCRIPTION: desc,
          };
        });
        this.dealerList = [...this.allDealers];
        this.dealerDataSource = new DataSource({
          store: new ArrayStore({
            data: this.allDealers,
            key: 'ID',
          }),
          paginate: true,
          pageSize: 50,
        });
        if (this.allSubDealers.length > 0) {
          this.refreshSubDealerDisplayNames();
        }
      },
      error: (err: any) => console.error('Error fetching dealer list:', err),
    });

    this.dataService.getNewOrderSubDealerList({}).subscribe({
      next: (res: any) => {
        const raw = res?.Data || (Array.isArray(res) ? res : []);
        this.subDealerMap.clear();
        this.allSubDealers = raw.map((item: any) => {
          const formatted = this.formatSubDealerItem(item);
          this.subDealerMap.set(formatted.ID, formatted);
          return formatted;
        });
        this.subDealerList = [...this.allSubDealers];
        this.subDealerDataSource = new DataSource({
          store: new ArrayStore({
            data: this.allSubDealers,
            key: 'ID',
          }),
          paginate: true,
          pageSize: 50,
        });
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
    if (!dealerName && item.DEALER_ID != null) {
      dealerName =
        this.dealerMap.get(item.DEALER_ID) ||
        this.dealerMap.get(Number(item.DEALER_ID)) ||
        this.dealerMap.get(String(item.DEALER_ID)) ||
        '';
      if (!dealerName && this.allDealers?.length > 0) {
        const parent = this.allDealers.find((d: any) => d.ID == item.DEALER_ID);
        if (parent) {
          dealerName = parent.DESCRIPTION || parent.NAME || '';
        }
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
    this.subDealerMap.clear();
    this.allSubDealers = this.allSubDealers.map((item: any) => {
      const formatted = this.formatSubDealerItem(item);
      this.subDealerMap.set(formatted.ID, formatted);
      return formatted;
    });
    this.subDealerList = [...this.allSubDealers];
    this.subDealerDataSource = new DataSource({
      store: new ArrayStore({
        data: this.allSubDealers,
        key: 'ID',
      }),
      paginate: true,
      pageSize: 50,
    });
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

  // ================= DEALER & SUBDEALER CHANGED =================
  onDealerChanged(event: any): void {
    const selected = event.value;
    this.selectedDealers = Array.isArray(selected)
      ? selected
      : selected != null
        ? [selected]
        : [];
  }

  onSubDealerChanged(event: any): void {
    const selected = event.value;
    this.selectedSubDealers = Array.isArray(selected)
      ? selected
      : selected != null
        ? [selected]
        : [];
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
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading orders...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading orders...');
        }
      }, 0);
    }
    this.cdr.detectChanges();

    const formatValue = (val: any): string => {
      if (Array.isArray(val)) {
        return val
          .filter((item) => item !== null && item !== undefined && item !== '')
          .join(',');
      }
      return val != null && val !== '' ? String(val) : '';
    };

    // Build payload according to exact API specification:
    // api/OrderRpt/OrderSummary
    const payload = {
      DATE_FROM:
        this.formatted_from_date ||
        this.formatDate(new Date(this.selected_from_date)),
      DATE_TO:
        this.formatted_To_date ||
        this.formatDate(new Date(this.selected_To_date)),
      STATUS: formatValue(this.selectedStatuses),
      BRAND_ID:
        this.selectedBrand != null && this.selectedBrand !== ''
          ? String(this.selectedBrand)
          : '',
      STATE_ID: formatValue(this.selectedStates),
      UNIT_ID: formatValue(this.selectedUnits),
      DEALER_ID: formatValue(this.selectedDealers),
      SUB_DEALER_ID: formatValue(this.selectedSubDealers),
      ORDER_NO: Number(this.orderNumber) || 0,
      ORDER_FILTER: this.orderFilter ? String(this.orderFilter) : '',
    };

    this.dataService.getOrderSummaryReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        if (res && res.Data && Array.isArray(res.Data)) {
          this.orderReportDataSource = res.Data;
          this.showParameters = false;
        } else if (Array.isArray(res)) {
          this.orderReportDataSource = res;
          this.showParameters = false;
        } else {
          this.orderReportDataSource = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading order summary report:', err);
        this.orderReportDataSource = [];
        this.cdr.detectChanges();
      },
    });
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
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedmonth === '' || this.selectedmonth === null) {
      this.selected_from_date = new Date(yr, 0, 1);
      this.selected_To_date =
        yr === currentYear ? today : new Date(yr, 11, 31);
    } else {
      this.selected_from_date = new Date(yr, this.selectedmonth, 1);
      this.selected_To_date = new Date(yr, this.selectedmonth + 1, 0);
    }

    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  onFromDateChange(event: any): void {
    if (event.value) {
      this.selected_from_date = new Date(event.value);
      this.formatted_from_date = this.formatDate(this.selected_from_date);
    }
  }

  onToDateChange(event: any): void {
    if (event.value) {
      this.selected_To_date = new Date(event.value);
      this.formatted_To_date = this.formatDate(this.selected_To_date);
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
    const fileName = 'Order Summary Report';
    this.dataService.exportDataGridReport(event, fileName);
  }

  // ================= SUMMARY TOGGLE =================
  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: 'formula',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  // ================= COLUMN CHOOSER =================
  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

    this.tempColumns = this.chooserColumns.map((column) => {
      const isVisible = grid.columnOption(column.dataField, 'visible');
      return {
        ...column,
        visible: isVisible !== false,
      };
    });

    this.isColumnChooserVisible = true;
    this.cdr.detectChanges();
  }

  selectAllColumns(selectAll: boolean): void {
    this.tempColumns.forEach((column) => {
      column.visible = selectAll;
    });
    this.tempColumns = [...this.tempColumns];
    this.cdr.detectChanges();
  }

  resetColumnSelection(): void {
    this.selectAllColumns(true);
  }

  applyColumnChooser(): void {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

    // Ensure at least one column remains visible so grid layout doesn't collapse
    const hasVisibleColumn = this.tempColumns.some((col) => col.visible);
    if (!hasVisibleColumn) {
      const defaultCol = this.tempColumns.find(
        (c) => c.dataField === 'ORDER_NO',
      );
      if (defaultCol) defaultCol.visible = true;
    }

    this.tempColumns.forEach((column) => {
      grid.columnOption(column.dataField, 'visible', column.visible);
    });

    this.isColumnChooserVisible = false;
  }

  cancelColumnChooser(): void {
    this.isColumnChooserVisible = false;
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
