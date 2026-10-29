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
  selector: 'app-dispatch-report',
  templateUrl: './dispatch-report.component.html',
  styleUrls: ['./dispatch-report.component.scss'],
})
export class DispatchReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Date Filter Properties (Same as OrderReport / OrderDetailsReport)
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

  // Data Source for DataGrid
  dispatchSummaryDataSource: any[] = [];

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
    { dataField: 'TIME', caption: 'Date & Time' },
    { dataField: 'DEALER', caption: 'Dealer' },
    { dataField: 'SUB_DEALER', caption: 'Sub Dealer' },
    { dataField: 'QUANTITY', caption: 'Quantity' },
  ];

  // Summary Configuration
  summaryColumnsData = {
    totalItems: [
      
      {
        column: 'QUANTITY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
  };

  // Toolbar Buttons Options
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

    // Load filter dropdowns
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
              item.code ||
              item.NAME ||
              item.name,
          }));
        },
        error: (err: any) =>
          console.error('Error fetching UNIT dropdown:', err),
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

    // 4. Status from dropdown ("ORDER_STATUS")
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

    // 5. Dealers & SubDealers
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
    let updated = false;
    this.allSubDealers = this.allSubDealers.map((sub: any) => {
      if (sub.DEALER_ID != null) {
        const parentDesc =
          this.dealerMap.get(sub.DEALER_ID) ||
          this.dealerMap.get(Number(sub.DEALER_ID)) ||
          this.dealerMap.get(String(sub.DEALER_ID));
        if (parentDesc && sub.DEALER_NAME !== parentDesc) {
          updated = true;
          const baseName = sub.RAW_DESCRIPTION || sub.DESCRIPTION;
          return {
            ...sub,
            DEALER_NAME: parentDesc,
            NAME: `${baseName} (${parentDesc})`,
            DESCRIPTION: `${baseName} (${parentDesc})`,
          };
        }
      }
      return sub;
    });

    if (updated) {
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
  }

  private fallbackStatuses(): void {
    this.statusList = [
      { ID: 0, DESCRIPTION: 'Draft' },
      { ID: 1, DESCRIPTION: 'Submitted' },
      { ID: 2, DESCRIPTION: 'Open' },
      { ID: 3, DESCRIPTION: 'Accepted' },
      { ID: 4, DESCRIPTION: 'Rejected' },
      { ID: 5, DESCRIPTION: 'Partial' },
      { ID: 6, DESCRIPTION: 'In Production' },
      { ID: 7, DESCRIPTION: 'Delivered' },
      { ID: 8, DESCRIPTION: 'Cancelled' },
      { ID: 9, DESCRIPTION: 'Allocated' },
    ];
  }

  // ================= DEALER & SUBDEALER CHANGES =================
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

  // ================= DATE HELPERS (CashBook style) =================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();

    if (this.selectedYear === currentYear) {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = today;
    } else if (this.selectedYear) {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = new Date(this.selectedYear, 11, 31);
    }
    this.formatted_from_date = this.formatDate(this.selected_from_date);
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  onMonthValueChanged(e: any): void {
    this.selectedmonth = e.value ?? '';
    const currentYear = this.selectedYear || new Date().getFullYear();

    if (this.selectedmonth === '' || this.selectedmonth === null) {
      this.selected_from_date = new Date(currentYear, 0, 1);
      this.selected_To_date =
        currentYear === new Date().getFullYear()
          ? new Date()
          : new Date(currentYear, 11, 31);
    } else {
      const monthIndex = Number(this.selectedmonth);
      this.selected_from_date = new Date(currentYear, monthIndex, 1);
      this.selected_To_date = new Date(currentYear, monthIndex + 1, 0);
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

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format Date and Time in 12-hour AM/PM format (e.g. 15-09-2026 01:41 PM)
  formatDateTime = (cellInfo: any): string => {
    const val = cellInfo?.value !== undefined ? cellInfo.value : cellInfo;
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return String(val);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  // ================= MAIN DATA LOADING =================
  loadDispatchSummaryData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading dispatch summary...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading(
            'Loading dispatch summary...',
          );
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

    let dateTo = '';
    if (this.selected_To_date) {
      const d = new Date(this.selected_To_date);
      if (!isNaN(d.getTime())) {
        dateTo = d.toISOString();
      }
    }
    if (!dateTo) {
      dateTo = this.formatted_To_date;
    }

    let statusVal: any = 0;
    if (this.selectedStatuses && this.selectedStatuses.length > 0) {
      const formatted = formatValue(this.selectedStatuses);
      statusVal = !isNaN(Number(formatted)) ? Number(formatted) : formatted;
    }

    // Build payload according to exact API specification:
    // api/OrderRpt/DispatchSummary
    const payload = {
      DATE_FROM:
        this.formatted_from_date ||
        this.formatDate(new Date(this.selected_from_date)),
      DATE_TO: dateTo,
      BRAND_ID:
        this.selectedBrand != null && this.selectedBrand !== ''
          ? String(this.selectedBrand)
          : '',
      ORDER_NO: Number(this.orderNumber) || 0,
      STATUS: statusVal,
      STATE_ID: formatValue(this.selectedStates),
      UNIT_ID: formatValue(this.selectedUnits),
      DISTRIBUTOR_ID: formatValue(this.selectedDealers),
      SUBDEALER_ID: formatValue(this.selectedSubDealers),
    };

    this.dataService.getDispatchSummaryReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        if (res && res.Data && Array.isArray(res.Data)) {
          this.dispatchSummaryDataSource = res.Data;
          this.showParameters = false;
        } else if (Array.isArray(res)) {
          this.dispatchSummaryDataSource = res;
          this.showParameters = false;
        } else {
          this.dispatchSummaryDataSource = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error fetching Dispatch Summary report:', err);
        notify(
          'Failed to load dispatch summary report data. Please try again.',
          'error',
          3000,
        );
        this.dispatchSummaryDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ================= TOOLBAR ACTIONS =================
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
    this.loadDispatchSummaryData();
  }

  onExporting(event: any): void {
    const fileName = 'Dispatch Summary Report';
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
  declarations: [DispatchReportComponent],
  exports: [DispatchReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispatchReportModule {}
