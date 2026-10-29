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
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-dispatch-yearly-report',
  templateUrl: './dispatch-yearly-report.component.html',
  styleUrls: ['./dispatch-yearly-report.component.scss'],
})
export class DispatchYearlyReportComponent implements OnInit {
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

  statesList: any[] = [];
  selectedStates: any[] = [];

  unitList: any[] = [];
  selectedUnits: any[] = [];

  // ================= REPORT DATA =================
  reportDataSource: any[] = [];

  // Paging
  readonly allowedPageSizes: any = [20, 50, 100, 200, 'all'];
  displayMode:any = 'full';

  // Month Columns definition
  readonly monthColumns = [
    { dataField: 'APR', caption: 'Apr' },
    { dataField: 'MAY', caption: 'May' },
    { dataField: 'JUN', caption: 'Jun' },
    { dataField: 'JUL', caption: 'Jul' },
    { dataField: 'AUG', caption: 'Aug' },
    { dataField: 'SEP', caption: 'Sep' },
    { dataField: 'OCT', caption: 'Oct' },
    { dataField: 'NOV', caption: 'Nov' },
    { dataField: 'DEC', caption: 'Dec' },
    { dataField: 'JAN', caption: 'Jan' },
    { dataField: 'FEB', caption: 'Feb' },
    { dataField: 'MAR', caption: 'Mar' },
  ];

  // Summary Configuration
  summaryColumnsData: any = {
    totalItems: [
      
      ...['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map(
        (col) => ({
          column: col,
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
          alignment: 'right',
        }),
      ),
      {
        column: 'TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
  };

  // ================= COLUMN CHOOSER POPUP STATE =================
  isColumnChooserVisible = false;

  defaultColumns: any[] = [
    { dataField: 'BRAND', caption: 'Brand' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'PACKING', caption: 'Packing' },
    { dataField: 'UNIT_CODE', caption: 'Unit' },
    { dataField: 'APR', caption: 'Apr' },
    { dataField: 'MAY', caption: 'May' },
    { dataField: 'JUN', caption: 'Jun' },
    { dataField: 'JUL', caption: 'Jul' },
    { dataField: 'AUG', caption: 'Aug' },
    { dataField: 'SEP', caption: 'Sep' },
    { dataField: 'OCT', caption: 'Oct' },
    { dataField: 'NOV', caption: 'Nov' },
    { dataField: 'DEC', caption: 'Dec' },
    { dataField: 'JAN', caption: 'Jan' },
    { dataField: 'FEB', caption: 'Feb' },
    { dataField: 'MAR', caption: 'Mar' },
    { dataField: 'TOTAL', caption: 'Total' },
  ];

  availableColumns: any[] = [];
  tempColumns: any[] = [];

  // ================= TOOLBAR BUTTON OPTIONS =================
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filter Row',
    stylingMode: 'text',
    onClick: () => {
      this.isFilterRowVisible = !this.isFilterRowVisible;
    },
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh Data',
    stylingMode: 'text',
    onClick: () => {
      this.loadReportData();
    },
  };

  columnChooserButtonOptions = {
    icon: 'columnchooser',
    hint: 'Choose Columns',
    stylingMode: 'text',
    onClick: () => {
      this.openColumnChooser();
    },
  };

  summaryButtonOptions = {
    icon: 'formula',
    hint: 'Show / Hide Summary',
    stylingMode: 'text',
    onClick: () => {
      this.isSummaryVisible = !this.isSummaryVisible;
    },
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    // Populate Years (Last 10 years)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
  }

  ngOnInit(): void {
    this.initAvailableColumns();
    this.loadDropdowns();
  }

  // ================= LOAD FILTER DROPDOWNS (Same as Dispatch Summary) =================
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
        error: (err: any) => console.error('Error fetching STATE dropdown:', err),
      });

    // 2. Unit from common dropdown "COMPANY_CODE" (with fallback to "UNIT")
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

  onYearChanged(e: any): void {
    if (e.value != null && e.value !== '') {
      this.selectedYear = Number(e.value);
    }
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

    const yr = Number(this.selectedYear) || new Date().getFullYear();
    const currentYear = new Date().getFullYear();

    // Use Date.UTC to ensure exact Jan 1 to Dec 31 dates without local timezone (+05:30) shift
    const dateFrom = new Date(Date.UTC(yr, 0, 1, 0, 0, 0, 0)).toISOString();
    const dateTo =
      yr === currentYear
        ? new Date().toISOString()
        : new Date(Date.UTC(yr, 11, 31, 23, 59, 59, 0)).toISOString();

    return {
      DATE_FROM: dateFrom,
      DATE_TO: dateTo,
      STATE_ID: formatValue(this.selectedStates),
      UNIT_ID: formatValue(this.selectedUnits),
    };
  }

  // ================= LOAD DATA (OrderRpt/DispatchReportYearly) =================
  loadReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading yearly report data...');
    }

    const payload = this.buildFilterPayload();
    console.log('Dispatch Yearly Report Payload:', payload);

    this.dataService.getDispatchReportYearly(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();

        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.reportDataSource = rawData.map((item: any) => {
          const apr = Number(item.APR) || 0;
          const may = Number(item.MAY) || 0;
          const jun = Number(item.JUN) || 0;
          const jul = Number(item.JUL) || 0;
          const aug = Number(item.AUG) || 0;
          const sep = Number(item.SEP) || 0;
          const oct = Number(item.OCT) || 0;
          const nov = Number(item.NOV) || 0;
          const dec = Number(item.DEC) || 0;
          const jan = Number(item.JAN) || 0;
          const feb = Number(item.FEB) || 0;
          const mar = Number(item.MAR) || 0;

          const total =
            item.TOTAL !== undefined && item.TOTAL !== null
              ? Number(item.TOTAL)
              : apr + may + jun + jul + aug + sep + oct + nov + dec + jan + feb + mar;

          return {
            BRAND: item.BRAND || '',
            ART_NO: item.ART_NO || '',
            COLOR: item.COLOR || '',
            CATEGORY: item.CATEGORY || '',
            PACKING: item.PACKING || '',
            UNIT_CODE: item.UNIT_CODE || item.UNIT || '',
            APR: apr,
            MAY: may,
            JUN: jun,
            JUL: jul,
            AUG: aug,
            SEP: sep,
            OCT: oct,
            NOV: nov,
            DEC: dec,
            JAN: jan,
            FEB: feb,
            MAR: mar,
            TOTAL: total,
          };
        });

        if (this.reportDataSource.length > 0) {
          this.showParameters = false;
          notify({
            message: `Report loaded: ${this.reportDataSource.length} items found.`,
            type: 'success',
            displayTime: 3000,
            position: { at: 'top right', my: 'top right', offset: '-20 20' },
          });
        } else {
          notify({
            message: 'No records found for the selected filter criteria.',
            type: 'warning',
            displayTime: 4000,
            position: { at: 'top right', my: 'top right', offset: '-20 20' },
          });
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error fetching Dispatch Yearly Report:', err);
        notify({
          message: 'Failed to load report data. Please check connection.',
          type: 'error',
          displayTime: 4000,
          position: { at: 'top right', my: 'top right', offset: '-20 20' },
        });
      },
    });
  }

  // ================= EXCEL EXPORT =================
  onExporting(e: any): void {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Yearly Dispatch Report');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `Dispatch_Yearly_Report_${this.selectedYear || new Date().getFullYear()}.xlsx`,
        );
      });
    });
    e.cancel = true;
  }

  // ================= CUSTOM COLUMN CHOOSER =================
  initAvailableColumns(): void {
    this.availableColumns = this.defaultColumns.map((col) => {
      const gridCol = this.dataGrid?.instance?.columnOption(col.dataField);
      return {
        dataField: col.dataField,
        caption: col.caption,
        visible: gridCol !== undefined ? !!gridCol.visible : true,
      };
    });
  }

  openColumnChooser(): void {
    if (!this.availableColumns || this.availableColumns.length === 0) {
      this.initAvailableColumns();
    }
    this.tempColumns = this.availableColumns.map((c) => ({ ...c }));
    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    if (!this.dataGrid?.instance) return;
    this.tempColumns.forEach((tempCol) => {
      this.dataGrid.instance.columnOption(
        tempCol.dataField,
        'visible',
        tempCol.visible,
      );
    });
    this.availableColumns = this.tempColumns.map((c) => ({ ...c }));
    this.isColumnChooserVisible = false;
  }

  cancelColumnChooser(): void {
    this.isColumnChooserVisible = false;
  }

  selectAllColumns(select: boolean): void {
    this.tempColumns.forEach((c) => (c.visible = select));
  }

  resetColumnSelection(): void {
    this.tempColumns.forEach((c) => {
      c.visible = true;
    });
  }

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
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
  declarations: [DispatchYearlyReportComponent],
  exports: [DispatchYearlyReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispatchYearlyReportModule {}
