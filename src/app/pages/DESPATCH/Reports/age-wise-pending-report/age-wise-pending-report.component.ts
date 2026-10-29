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
  selector: 'app-age-wise-pending-report',
  templateUrl: './age-wise-pending-report.component.html',
  styleUrls: ['./age-wise-pending-report.component.scss'],
})
export class AgeWisePendingReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Date Filter Properties (Same as Order Report / CashBook)
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
  private stateMap = new Map<any, string>();

  unitList: any[] = [];
  selectedUnit: any = null;

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

  brandList: any[] = [];
  selectedBrand: any = null;

  orderNumber: any = '';
  orderFilterList: any[] = [];
  orderFilter: string = '';

  // Data Source for the DataGrid
  agewiseReportDataSource: any[] = [];

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
    { dataField: 'DEALER_NAME', caption: 'Dealer' },
    { dataField: 'UNIT', caption: 'Unit' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'PACKING', caption: 'Packing' },
    { dataField: 'TO_30', caption: '<= 30 Days' },
    { dataField: 'TO_60', caption: '31-60 Days' },
    { dataField: 'TO_90', caption: '61-90 Days' },
    { dataField: 'OVER_90', caption: '> 90 Days' },
    { dataField: 'TOTAL', caption: 'Total' },
    { dataField: 'MRP', caption: 'MRP' },
  ];

  // Summary Configuration
  summaryColumnsData = {
    totalItems: [
     
      {
        column: 'TO_30',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'TO_60',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'TO_90',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'OVER_90',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
  };

  // Toolbar Buttons Options (Identical to Order Report)
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
          this.stateMap.clear();
          this.statesList = raw.map((item: any) => {
            const id = item.ID !== undefined ? item.ID : item.id;
            const desc =
              item.DESCRIPTION || item.description || item.NAME || item.name;
            this.stateMap.set(id, desc);
            return {
              ID: id,
              DESCRIPTION: desc,
            };
          });
        },
        error: (err: any) =>
          console.error('Error fetching STATE dropdown:', err),
      });

    // 2. Unit from common dropdown "COMPANY_CODE" (with fallback to "UNIT")
    this.dataService
      .getDropdownData({ NAME: 'COMPANY_CODE', name: 'COMPANY_CODE' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          if (raw && raw.length > 0) {
            this.unitList = raw.map((item: any) => ({
              ID: item.ID !== undefined ? item.ID : item.id,
              DESCRIPTION:
                item.DESCRIPTION ||
                item.description ||
                item.CODE ||
                item.COMPANY_CODE ||
                item.name,
            }));
          } else {
            this.fallbackUnitDropdown();
          }
        },
        error: () => this.fallbackUnitDropdown(),
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

    // 5. Dealers & SubDealers (Cascading method as in order new screen)
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
            item.DESCRIPTION || item.description || item.CODE || item.name,
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

  // ================= LOAD AGE-WISE REPORT DATA (On Apply Button Click) =================
  loadAgewiseReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading age-wise pending report...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading age-wise pending report...');
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

    let dateFrom = this.formatted_from_date || '';
    if (!dateFrom && this.selected_from_date) {
      dateFrom = this.formatDate(this.selected_from_date);
    }

    let dateTo = this.formatted_To_date || '';
    if (!dateTo && this.selected_To_date) {
      dateTo = this.formatDate(this.selected_To_date);
    }

    const payload = {
      DATE_FROM: dateFrom,
      DATE_TO: dateTo,
      STATE_ID: formatValue(this.selectedStates),
      UNIT_ID:
        this.selectedUnit != null && this.selectedUnit !== ''
          ? Number(this.selectedUnit) || 0
          : 0,
      DEALER_ID: formatValue(this.selectedDealers),
      SUBDEALER_ID: formatValue(this.selectedSubDealers),
      BRAND_ID:
        this.selectedBrand != null &&
        this.selectedBrand !== '' &&
        this.selectedBrand !== 'All'
          ? String(this.selectedBrand)
          : '',
      ORDER_NO:
        this.orderNumber != null && this.orderNumber !== ''
          ? Number(this.orderNumber) || 0
          : 0,
      ORDER_FILTER: this.orderFilter ? String(this.orderFilter).trim() : '',
    };

    this.dataService.getAgewisePendingOrder(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.agewiseReportDataSource = rawData.map((item: any) => ({
          ...item,
          TO_30: Number(item.TO_30) || 0,
          TO_60: Number(item.TO_60) || 0,
          TO_90: Number(item.TO_90) || 0,
          OVER_90: Number(item.OVER_90) || 0,
          TOTAL: Number(item.TOTAL) || 0,
          MRP: Number(item.MRP) || 0,
        }));

        this.showParameters = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading age-wise pending report:', err);
        this.agewiseReportDataSource = [];
        this.cdr.detectChanges();
      },
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
      this.selected_from_date = new Date(yr, Number(this.selectedmonth), 1);
      this.selected_To_date = new Date(yr, Number(this.selectedmonth) + 1, 0);
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

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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
    this.loadAgewiseReportData();
  }

  onExporting(event: any): void {
    const fileName = 'Age Wise Pending Order Report';
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

    const hasVisibleColumn = this.tempColumns.some((col) => col.visible);
    if (!hasVisibleColumn) {
      const defaultCol = this.tempColumns.find(
        (c) => c.dataField === 'DEALER_NAME',
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
  declarations: [AgeWisePendingReportComponent],
  exports: [AgeWisePendingReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgeWisePendingReportModule {}
