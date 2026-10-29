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
import notify from 'devextreme/ui/notify';

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-dispatch-sales-through-report',
  templateUrl: './dispatch-sales-through-report.component.html',
  styleUrls: ['./dispatch-sales-through-report.component.scss'],
})
export class DispatchSalesThroughReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // ================= FILTER PROPERTIES =================
  years: number[] = [];
  selectedYear: number;
  monthDataSource: { name: string; value: any }[] = [];
  selectedmonth: any = '';
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string = '';
  formatted_To_date: string = '';

  // Unit
  unitList: any[] = [];
  selectedUnits: any[] = [];

  // Dealer & SubDealer
  allDealers: any[] = [];
  dealerList: any[] = [];
  selectedDealers: any[] = [];
  dealerDataSource: DataSource = new DataSource({
    store: new ArrayStore({
      data: [],
      key: 'ID',
    }),
    paginate: true,
    pageSize: 50,
  });

  allSubDealers: any[] = [];
  subDealerList: any[] = [];
  selectedSubDealers: any[] = [];
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

  // Brand (with 'All' as default)
  brandList: any[] = [];
  selectedBrand: any = 'ALL';

  // OrderFilter
  orderFilterList: any[] = [];
  orderFilter: string = '';

  // Data Source for the DataGrid
  reportDataSource: any[] = [];

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
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'PACKING', caption: 'Packing' },
    { dataField: 'CONTENT', caption: 'Content' },
    { dataField: 'UNIT', caption: 'Unit' },
    { dataField: 'ORDER_QTY', caption: 'Order Qty' },
    { dataField: 'ISSUED_QTY', caption: 'Issued Qty' },
    { dataField: 'CANCELLED_QTY', caption: 'Cancelled Qty' },
    { dataField: 'BALANCE_QTY', caption: 'Balance Qty' },
    { dataField: 'PACKING_ID', caption: 'Packing ID' },
  ];

  // Summary Configuration
  summaryColumnsData = {
    totalItems: [
     
      {
        column: 'ORDER_QTY',
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
        column: 'CANCELLED_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'BALANCE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
  };

  // Toolbar Button Options
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
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;

    this.monthDataSource = this.dataService.getMonths();
  }

  ngOnInit(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const systemDate = this.formatDate(today);

    this.selectedYear = currentYear;
    this.selectedmonth = '';

    this.selected_from_date = new Date(currentYear, 0, 1);
    this.formatted_from_date = this.formatDate(this.selected_from_date);

    this.selected_To_date = today;
    this.formatted_To_date = systemDate;

    // Load filter dropdowns
    this.loadDropdowns();
  }

  // ================= LOAD ALL FILTER DROPDOWNS =================
  loadDropdowns(): void {
    // 1. Unit from common dropdown "COMPANY_CODE" (with fallback to "UNIT")
    this.dataService
      .getDropdownData({ NAME: 'COMPANY_CODE', name: 'COMPANY_CODE' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          if (raw.length > 0) {
            this.unitList = raw.map((item: any) => ({
              ID: item.ID !== undefined ? item.ID : item.id,
              DESCRIPTION:
                item.DESCRIPTION ||
                item.description ||
                item.CODE ||
                item.code ||
                item.COMPANY_CODE ||
                item.NAME ||
                item.name,
            }));
          } else {
            this.fallbackUnitDropdown();
          }
        },
        error: () => this.fallbackUnitDropdown(),
      });

    // 2. Brand from common dropdown "ARTICLEBRAND"
    this.dataService
      .getDropdownData({ NAME: 'ARTICLEBRAND', name: 'ARTICLEBRAND' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.brandList     = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.description || item.NAME || item.name,
          }));
          
          
        },
        error: (err: any) => {
          console.error('Error fetching ARTICLEBRAND dropdown:', err);
          this.brandList = [{ ID: 'ALL', DESCRIPTION: 'All' }];
          this.selectedBrand = 'ALL';
        },
      });

    // 3. OrderFilter from common dropdown "ORDER_FILTER"
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

    // 4. Dealers & SubDealers
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

  private fallbackUnitDropdown(): void {
    this.dataService.getDropdownData({ NAME: 'UNIT', name: 'UNIT' }).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : res?.Data || [];
        this.unitList = raw.map((item: any) => ({
          ID: item.ID !== undefined ? item.ID : item.id,
          DESCRIPTION:
            item.DESCRIPTION || item.description || item.NAME || item.name,
        }));
      },
      error: (err: any) =>
        console.error('Error fetching fallback UNIT dropdown:', err),
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

  // ================= DATE CHANGED HANDLERS =================
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
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  onMonthValueChanged(e: any): void {
    this.selectedmonth = e.value ?? '';
    const yr = this.selectedYear || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedmonth === '' || this.selectedmonth === null) {
      this.selected_from_date = new Date(yr, 0, 1);
      this.selected_To_date = yr === currentYear ? today : new Date(yr, 11, 31);
    } else {
      this.selected_from_date = new Date(yr, this.selectedmonth, 1);
      this.selected_To_date = new Date(yr, this.selectedmonth + 1, 0);
    }

    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  onFromDateChange(e: any): void {
    if (e.value) {
      this.selected_from_date = new Date(e.value);
      this.formatted_from_date = this.formatDate(this.selected_from_date);
    }
  }

  onToDateChange(e: any): void {
    if (e.value) {
      this.selected_To_date = new Date(e.value);
      this.formatted_To_date = this.formatDate(this.selected_To_date);
    }
  }

  onDealerChanged(event: any): void {
    const selected = event.value;
    this.selectedDealers = Array.isArray(selected)
      ? selected
      : selected != null
        ? [selected]
        : [];

      this.subDealerDataSource = new DataSource({
        store: new ArrayStore({
          data: this.allSubDealers,
          key: 'ID',
        }),
        paginate: true,
        pageSize: 50,
      });
    
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

  // ================= BUILD FILTER PAYLOAD =================
  buildFilterPayload(): any {
    const formatValue = (val: any): string => {
      if (Array.isArray(val)) {
        return val
          .filter((item) => item !== null && item !== undefined && item !== '')
          .join(',');
      }
      return val != null && val !== '' ? String(val) : '';
    };

    let dateFrom = '';
    if (this.selected_from_date) {
      const d = new Date(this.selected_from_date);
      if (!isNaN(d.getTime())) {
        dateFrom = d.toISOString();
      }
    }
    if (!dateFrom && this.formatted_from_date) {
      const d = new Date(this.formatted_from_date);
      if (!isNaN(d.getTime())) {
        dateFrom = d.toISOString();
      }
    }

    let dateTo = '';
    if (this.selected_To_date) {
      const d = new Date(this.selected_To_date);
      if (!isNaN(d.getTime())) {
        dateTo = d.toISOString();
      }
    }
    if (!dateTo && this.formatted_To_date) {
      const d = new Date(this.formatted_To_date);
      if (!isNaN(d.getTime())) {
        dateTo = d.toISOString();
      }
    }

    return {
      DATE_FROM: dateFrom,
      DATE_TO: dateTo,
      BRAND_ID:
        this.selectedBrand != null &&
        this.selectedBrand !== '' &&
        this.selectedBrand !== 'ALL' &&
        this.selectedBrand !== 0
          ? String(this.selectedBrand)
          : '',
      ORDER_FILTER: this.orderFilter ? String(this.orderFilter) : '',
      DEALER_ID: formatValue(this.selectedDealers),
      SUBDEALER_ID: formatValue(this.selectedSubDealers),
      UNIT_ID: formatValue(this.selectedUnits),
    };
  }

  // ================= LOAD DATA (OrderRpt/SalesThrough) =================
  loadReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading report data...');
    }

    const payload = this.buildFilterPayload();
    console.log('Dispatch Sales Through Report Payload:', payload);

    this.dataService.getSalesThroughReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();

        let data: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          data = res.Data;
        } else if (Array.isArray(res)) {
          data = res;
        }

        this.reportDataSource = data.map((item: any) => ({
          ...item,
          BALANCE_QTY:
            item.BALANCE_QTY !== undefined
              ? item.BALANCE_QTY
              : (item.ORDER_QTY || 0) -
                (item.ISSUED_QTY || 0) -
                (item.CANCELLED_QTY || 0),
        }));

        if (this.reportDataSource.length > 0) {
          this.showParameters = false;
        } else {
          notify(res?.Message || 'No records found.', 'info', 3000);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        this.reportDataSource = [];
        notify(
          err?.error?.message || err?.message || 'Error loading report data',
          'error',
          3000,
        );
        this.cdr.detectChanges();
      },
    });
  }

  // ================= UTILITIES & HELPERS =================
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  toggleFilterRow(): void {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  }

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;
    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  refreshGrid(): void {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.loadReportData();
  }

  onExporting(event: any): void {
    const fileName = 'Dispatch Sales Through Report';
    this.dataService.exportDataGridReport(event, fileName);
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

    const hasVisibleColumn = this.tempColumns.some((col) => col.visible);
    if (!hasVisibleColumn) {
      const defaultCol = this.tempColumns.find(
        (c) => c.dataField === 'ART_NO',
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
  declarations: [DispatchSalesThroughReportComponent],
  exports: [DispatchSalesThroughReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispatchSalesThroughReportModule {}
