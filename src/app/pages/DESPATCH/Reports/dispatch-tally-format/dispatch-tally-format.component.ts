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
  selector: 'app-dispatch-tally-format',
  templateUrl: './dispatch-tally-format.component.html',
  styleUrls: ['./dispatch-tally-format.component.scss'],
})
export class DispatchTallyFormatComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Date Filter Properties (Same as CashBook / Order Report)
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

  brandList: any[] = [];
  selectedBrand: any = null;

  // Data Source for the DataGrid
  tallyReportDataSource: any[] = [];

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
    { dataField: 'DISPATCH_NO', caption: 'Dispatch No' },
    { dataField: 'DISPATCH_DATE', caption: 'Dispatch Date' },
    { dataField: 'ORDER_NO', caption: 'Order No' },
    { dataField: 'PARTY_CODE', caption: 'Party Code' },
    { dataField: 'PARTY_NAME', caption: 'Party Name' },
    { dataField: 'PLACE', caption: 'Place' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'SERIAL_NO', caption: 'Serial No' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'DESCRIPTION', caption: 'Size' },
    { dataField: 'TOTAL_PAIR', caption: 'Total Pair' },
    { dataField: 'PRICE', caption: 'Price' },
    { dataField: 'DISC_PERCENT', caption: 'Disc %' },
    { dataField: 'PACKING_ALIAS', caption: 'Packing Alias' },
    { dataField: 'WAREHOUSE_ALIAS', caption: 'Warehouse Alias' },
    { dataField: 'CREDIT_LIMIT', caption: 'Credit Limit' },
    { dataField: 'CREDIT_DAYS', caption: 'Credit Days' },
    { dataField: 'STATE_NAME', caption: 'State' },
  ];

  // Summary Configuration
  summaryColumnsData = {
    totalItems: [
     
      {
        column: 'TOTAL_PAIR',
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

    // 4. Dealers & SubDealers (Cascading method as in order new screen)
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

  // ================= LOAD TALLY REPORT DATA (On Apply Button Click) =================
  loadTallyReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading tally report...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading tally report...');
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

    const payload = {
      DATE_FROM: dateFrom,
      DATE_TO: dateTo,
      BRAND_ID:
        this.selectedBrand != null &&
        this.selectedBrand !== '' &&
        this.selectedBrand !== 'All'
          ? String(this.selectedBrand)
          : '',
      STATE_ID: formatValue(this.selectedStates),
      WAREHOUSE_ID: '',
      UNIT_ID: formatValue(this.selectedUnits),
      DEALER_ID: formatValue(this.selectedDealers),
      SUBDEALER_ID: formatValue(this.selectedSubDealers),
    };

    this.dataService.getDispatchReportTally(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.tallyReportDataSource = rawData.map((item: any) => {
          const stateName =
            this.stateMap.get(item.STATE_ID) ||
            this.stateMap.get(Number(item.STATE_ID)) ||
            (item.STATE_ID != null ? String(item.STATE_ID) : '');
          return {
            ...item,
            STATE_NAME: stateName,
          };
        });

        this.showParameters = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading tally report:', err);
        this.tallyReportDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ================= DATE CHANGED HANDLERS (Same as CashBook / Order Report) =================
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

  formatDates(cellData: any): string {
    if (!cellData) return '';
    if (typeof cellData === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(cellData)) {
      return cellData;
    }
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return cellData ? String(cellData) : '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
    this.loadTallyReportData();
  }

  onExporting(event: any): void {
    const fileName = 'Dispatch Tally Format Report';
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
        (c) => c.dataField === 'DISPATCH_NO',
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
  declarations: [DispatchTallyFormatComponent],
  exports: [DispatchTallyFormatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispatchTallyFormatModule {}
