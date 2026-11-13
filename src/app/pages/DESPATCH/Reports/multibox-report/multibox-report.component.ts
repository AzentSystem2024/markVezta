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

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-multibox-report',
  templateUrl: './multibox-report.component.html',
  styleUrls: ['./multibox-report.component.scss'],
})
export class MultiboxReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Year / Month / Date Filters
  years: number[] = [];
  selectedYear: number | null = null;
  monthDataSource: { name: string; value: any }[] = [];
  selectedmonth: any = '';
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string = '';
  formatted_To_date: string = '';

  // Data Source for DataGrid
  multiboxDataSource: any[] = [];

  // Master-Detail Data Mapping
  detailDataMap: { [key: string]: any[] } = {};
  detailLoadingMap: { [key: string]: boolean } = {};
  expandedRowKeys: (string | number)[] = [];

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
    { dataField: 'COMPANY_CODE', caption: 'Unit' },
    { dataField: 'PRODUCTION_ID', caption: 'Production ID' },
    { dataField: 'BARCODE', caption: 'Barcode' },
    { dataField: 'PRODUCTION_TIME', caption: 'Production Time' },
  ];

  // Summary Configuration
 

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

    // Default dates: Jan 1 of current year to today (Month: All)
    this.selectedYear = currentYear;
    this.selectedmonth = '';

    this.selected_from_date = new Date(currentYear, 0, 1);
    this.formatted_from_date = this.formatDate(this.selected_from_date);

    this.selected_To_date = today;
    this.formatted_To_date = this.formatDate(this.selected_To_date);
  }

  // ================= DATE HELPERS (Year / Month / Date) =================
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
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  formatDateTime = (data: any): string => {
    if (!data) return '';
    let val: any = data;
    if (typeof data === 'object' && data !== null) {
      if ('PRODUCTION_TIME' in data) {
        val = data.PRODUCTION_TIME;
      } else if ('value' in data) {
        val = data.value;
      }
    }
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour converted to 12
    const strHours = String(hours).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
  };

  // ================= LOAD MULTIBOX REPORT DATA =================
  loadMultiboxData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading multibox report...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading(
            'Loading multibox report...',
          );
        }
      }, 0);
    }
    this.cdr.detectChanges();

    let dateFrom = '';
    if (this.selected_from_date) {
      const d = new Date(this.selected_from_date);
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

    const payload = {
      DATE_FROM: dateFrom,
      DATE_TO: dateTo,
    };

    this.detailDataMap = {};
    this.detailLoadingMap = {};
    this.expandedRowKeys = [];

    this.dataService.getMultiboxReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.multiboxDataSource = rawData.map((item: any, index: number) => {
          const barcode = item.BARCODE || item.barcode || '';
          const prodId =
            item.PRODUCTION_ID ||
            item.productionId ||
            item.PACK_PRODUCTION_ID ||
            item.packProductionId ||
            '';
          return {
            ...item,
            ID: barcode
              ? String(barcode)
              : prodId
                ? String(prodId) + '_' + index
                : 'row_' + index,
            PRODUCTION_ID: prodId,
            COMPANY_CODE:
              item.COMPANY_CODE ||
              item.companyCode ||
              item.UNIT ||
              item.unit ||
              '',
            BARCODE: barcode,
            PRODUCTION_TIME: item.PRODUCTION_TIME || item.productionTime || '',
          };
        });

        this.showParameters = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading multibox report:', err);
        this.multiboxDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ================= MASTER-DETAIL ROW EXPANSION =================
  onRowExpanding(e: any): void {
    const rowKey = e.key;
    if (!this.expandedRowKeys.includes(rowKey)) {
      this.expandedRowKeys.push(rowKey);
    }

    let rowData = e.data;
    if (!rowData && this.multiboxDataSource && this.multiboxDataSource.length > 0) {
      rowData = this.multiboxDataSource.find(
        (item: any) =>
          item.ID === rowKey ||
          item.BARCODE === rowKey ||
          item.PRODUCTION_ID === rowKey,
      );
    }

    const prodId =
      rowData?.PRODUCTION_ID ||
      rowData?.PACK_PRODUCTION_ID ||
      rowData?.production_id ||
      rowData?.productionId ||
      e.data?.PRODUCTION_ID ||
      e.data?.PACK_PRODUCTION_ID ||
      rowKey;

    this.loadMultiBoxDetails(prodId, rowKey);
  }

  ensureDetailsLoaded(masterData: any): string {
    const key = masterData?.key;
    const prodId =
      masterData?.data?.PRODUCTION_ID ||
      masterData?.data?.PACK_PRODUCTION_ID ||
      masterData?.data?.production_id ||
      masterData?.data?.productionId ||
      key;

    if (
      key &&
      prodId &&
      !this.detailDataMap[key] &&
      !this.detailDataMap[String(prodId)] &&
      !this.detailLoadingMap[key] &&
      !this.detailLoadingMap[String(prodId)]
    ) {
      setTimeout(() => {
        this.loadMultiBoxDetails(prodId, key);
      }, 0);
    }
    return '';
  }

  onRowCollapsed(e: any): void {
    const rowKey = e.key;
    const index = this.expandedRowKeys.indexOf(rowKey);
    if (index !== -1) {
      this.expandedRowKeys.splice(index, 1);
    }
    delete this.detailDataMap[rowKey];
    delete this.detailLoadingMap[rowKey];
    this.detailDataMap = { ...this.detailDataMap };
    this.detailLoadingMap = { ...this.detailLoadingMap };
    this.cdr.detectChanges();
  }

  loadMultiBoxDetails(productionId: any, rowKey: any): void {
    const packProdId = Number(productionId);
    if (!packProdId || isNaN(packProdId)) {
      console.warn('Invalid productionId for multibox details:', productionId);
      this.detailDataMap[rowKey] = [];
      this.detailLoadingMap[rowKey] = false;
      this.detailDataMap = { ...this.detailDataMap };
      this.cdr.detectChanges();
      return;
    }

    this.detailLoadingMap[rowKey] = true;
    this.detailLoadingMap[String(packProdId)] = true;
    this.cdr.detectChanges();

    const payload = {
      PACK_PRODUCTION_ID: packProdId,
    };

    this.dataService.getMultiBoxDetails(payload).subscribe({
      next: (res: any) => {
        let details: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          details = res.Data;
        } else if (Array.isArray(res)) {
          details = res;
        }
        const mapped = details.map((d: any) => ({
          ...d,
          ART_NO: d.ART_NO || d.artNo || '',
          COLOR: d.COLOR || d.color || '',
          CATEGORY: d.CATEGORY || d.category || '',
          SIZE: d.SIZE != null ? String(d.SIZE) : '',
          QUANTITY: Number(d.QUANTITY) || 0,
        }));

        this.detailDataMap[rowKey] = mapped;
        this.detailDataMap[String(packProdId)] = mapped;
        this.detailLoadingMap[rowKey] = false;
        this.detailLoadingMap[String(packProdId)] = false;
        this.detailDataMap = { ...this.detailDataMap };
        this.detailLoadingMap = { ...this.detailLoadingMap };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching multibox details for id:', packProdId, err);
        this.detailDataMap[rowKey] = [];
        this.detailDataMap[String(packProdId)] = [];
        this.detailLoadingMap[rowKey] = false;
        this.detailLoadingMap[String(packProdId)] = false;
        this.detailDataMap = { ...this.detailDataMap };
        this.detailLoadingMap = { ...this.detailLoadingMap };
        this.cdr.detectChanges();
      },
    });
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
    this.loadMultiboxData();
  }

  onExporting(event: any): void {
    const fileName = 'Multibox Report';
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
        (c) => c.dataField === 'COMPANY_CODE',
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
  declarations: [MultiboxReportComponent],
  exports: [MultiboxReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MultiboxReportModule {}
