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
  selector: 'app-dispatch-state-wise-report',
  templateUrl: './dispatch-state-wise-report.component.html',
  styleUrls: ['./dispatch-state-wise-report.component.scss'],
})
export class DispatchStateWiseReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;


  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // ================= DATE FILTER PROPERTIES (Same as Order Summary / Order Report) =================
  years: number[] = [];
  selectedYear: number;
  monthDataSource: { name: string; value: any }[] = [];
  selectedmonth: any = '';
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string = '';
  formatted_To_date: string = '';

  // ================= COUNTRY & STATES FILTER PROPERTIES =================
  countryList: any[] = [];
  selectedCountryId: any = 107; // Default India (107)

  statesList: any[] = [];
  selectedStates: any[] = [];

  // ================= REPORT DATA & DYNAMIC COLUMNS =================
  reportDataSource: any[] = [];
  dynamicStateColumns: string[] = [];

  // Paging
  readonly allowedPageSizes: any = [20, 50, 100, 200, 'all'];
  displayMode :any = 'full';

  // Summary Configuration
  summaryColumnsData: any = {
    totalItems: [
      {
        column: 'ART_NO',
        summaryType: 'count',
        displayFormat: 'Total: {0} Items',
        alignment: 'left',
      },
      {
        column: 'STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'TOTAL_QTY',
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
    { dataField: 'IMAGE', caption: 'Image' },
    { dataField: 'UNIT', caption: 'Unit' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'SIZE', caption: 'Size' },
    { dataField: 'STOCK', caption: 'Stock' },
    { dataField: 'TOTAL_QTY', caption: 'Total Qty' },
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

    this.monthDataSource = this.dataService.getMonths();
  }

  ngOnInit(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const systemDate = this.formatDate(today);

    this.selectedYear = currentYear;
    this.selectedmonth = '';

    // Default to Jan 1 of current year to today
    this.selected_from_date = new Date(currentYear, 0, 1);
    this.formatted_from_date = this.formatDate(this.selected_from_date);

    this.selected_To_date = today;
    this.formatted_To_date = systemDate;

    // Load filter dropdowns
    this.loadDropdowns();
  }

  // ================= LOAD FILTER DROPDOWNS =================
  loadDropdowns(): void {
    // 1. Country from common dropdown "COUNTRY"
    this.dataService
      .getDropdownData({ NAME: 'COUNTRY', name: 'COUNTRY' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          if (raw.length > 0) {
            this.countryList = raw.map((item: any) => ({
              ID: item.ID !== undefined ? item.ID : item.COUNTRY_ID !== undefined ? item.COUNTRY_ID : item.id,
              DESCRIPTION:
                item.DESCRIPTION || item.COUNTRY_NAME || item.NAME || item.name,
            }));

            // Check if 107 exists in the loaded list
            const foundIndia = this.countryList.find(
              (c: any) => c.ID === 107 || c.DESCRIPTION?.toLowerCase() === 'india',
            );
            if (foundIndia) {
              this.selectedCountryId = foundIndia.ID;
            } else if (!this.selectedCountryId && this.countryList.length > 0) {
              this.selectedCountryId = this.countryList[0].ID;
            }
          } else {
            // Fallback country list
            this.countryList = [{ ID: 107, DESCRIPTION: 'India' }];
            this.selectedCountryId = 107;
          }

          // Load states for the active country
          this.loadStatesDropdown(this.selectedCountryId);
        },
        error: (err: any) => {
          console.error('Error fetching COUNTRY dropdown:', err);
          this.countryList = [{ ID: 107, DESCRIPTION: 'India' }];
          this.selectedCountryId = 107;
          this.loadStatesDropdown(this.selectedCountryId);
        },
      });
  }

  // 2. States for Country using { NAME: 'STATE_NAME', COUNTRY_ID: countryId }
  loadStatesDropdown(countryId: any): void {
    const payload = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: countryId != null ? countryId : 107,
    };

    this.dataService.getDropdownData(payload).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : res?.Data || [];
        if (raw.length > 0) {
          this.statesList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.STATE_ID !== undefined ? item.STATE_ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.STATE_NAME || item.NAME || item.name,
          }));
        } else {
          // Fallback to common STATE dropdown as in order-report
          this.fallbackStateDropdown();
        }
      },
      error: () => this.fallbackStateDropdown(),
    });
  }

  private fallbackStateDropdown(): void {
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
        error: (err: any) => console.error('Error fetching fallback STATE dropdown:', err),
      });
  }

  onCountryChanged(event: any): void {
    const countryId = event.value;
    this.selectedCountryId = countryId;
    this.selectedStates = [];
    if (this.selectedCountryId) {
      this.loadStatesDropdown(this.selectedCountryId);
    } else {
      this.statesList = [];
    }
  }

  // ================= DATE CHANGED HANDLERS (Same as Order Summary / Order Report) =================
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

  // ================= BUILD FILTER PAYLOAD =================
  buildFilterPayload(): any {
    const formatStateValue = (val: any): string => {
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
      COUNTRY_ID:
        this.selectedCountryId != null && this.selectedCountryId !== ''
          ? Number(this.selectedCountryId)
          : 107,
      STATE_ID: formatStateValue(this.selectedStates),
    };
  }

  // ================= LOAD DATA (OrderRpt/DispatchReportStateWise) =================
  loadReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading state wise report data...');
    }

    const payload = this.buildFilterPayload();
    console.log('Dispatch State Wise Report Payload:', payload);

    this.dataService.getDispatchReportStateWise(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();

        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        const stateSet = new Set<string>();

        const processed = rawData.map((item: any) => {
          let totalQty = 0;
          const row: any = {
            IMAGE: item.IMAGE || '',
            UNIT: item.UNIT || '',
            ART_NO: item.ART_NO || '',
            COLOR: item.COLOR || '',
            CATEGORY: item.CATEGORY || '',
            SIZE: item.SIZE || '',
            STOCK: Number(item.STOCK) || 0,
            TOTAL_QTY: 0,
          };

          if (item.STATE_QUANTITY && typeof item.STATE_QUANTITY === 'object') {
            for (const [stateName, qty] of Object.entries(item.STATE_QUANTITY)) {
              const cleanState = stateName.trim();
              if (cleanState) {
                stateSet.add(cleanState);
                const val = Number(qty) || 0;
                row[cleanState] = val;
                totalQty += val;
              }
            }
          }

          row.TOTAL_QTY = totalQty;
          return row;
        });

        this.dynamicStateColumns = Array.from(stateSet).sort();

        // Ensure each row has 0 for missing state columns
        this.reportDataSource = processed.map((row: any) => {
          for (const state of this.dynamicStateColumns) {
            if (row[state] === undefined) {
              row[state] = 0;
            }
          }
          return row;
        });

        this.updateSummaryConfig();
        this.initAvailableColumns();

        if (this.reportDataSource.length > 0) {
          this.showParameters = false;
          notify({
            message: `Report loaded: ${this.reportDataSource.length} items found across ${this.dynamicStateColumns.length} states.`,
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
        console.error('Error fetching Dispatch State Wise Report:', err);
        notify({
          message: 'Failed to load report data. Please check connection.',
          type: 'error',
          displayTime: 4000,
          position: { at: 'top right', my: 'top right', offset: '-20 20' },
        });
      },
    });
  }

  // ================= SUMMARY CONFIGURATION =================
  updateSummaryConfig(): void {
    const totalItems: any[] = [
      {
        column: 'ART_NO',
        summaryType: 'count',
        displayFormat: 'Total: {0} Items',
        alignment: 'left',
      },
      {
        column: 'STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      ...this.dynamicStateColumns.map((state) => ({
        column: state,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      })),
      {
        column: 'TOTAL_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ];

    this.summaryColumnsData = { totalItems };
  }

  // ================= EXCEL EXPORT =================
  onExporting(e: any): void {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('State Wise Report');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `Dispatch_State_Wise_Report_${this.formatted_from_date}_to_${this.formatted_To_date}.xlsx`,
        );
      });
    });
    e.cancel = true;
  }

  // ================= CUSTOM COLUMN CHOOSER =================
  initAvailableColumns(): void {
    const fixedCols = [
      { dataField: 'IMAGE', caption: 'Image' },
      { dataField: 'UNIT', caption: 'Unit' },
      { dataField: 'ART_NO', caption: 'Art No' },
      { dataField: 'COLOR', caption: 'Color' },
      { dataField: 'CATEGORY', caption: 'Category' },
      { dataField: 'SIZE', caption: 'Size' },
      { dataField: 'STOCK', caption: 'Stock' },
    ];

    const stateCols = this.dynamicStateColumns.map((state) => ({
      dataField: state,
      caption: state,
    }));

    const allCols = [...fixedCols, ...stateCols, { dataField: 'TOTAL_QTY', caption: 'Total Qty' }];

    this.availableColumns = allCols.map((col) => {
      const gridCol = this.dataGrid?.instance?.columnOption(col.dataField);
      return {
        dataField: col.dataField,
        caption: col.caption,
        visible: gridCol !== undefined ? !!gridCol.visible : col.dataField !== 'IMAGE',
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
      c.visible = c.dataField !== 'IMAGE';
    });
  }

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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
  declarations: [DispatchStateWiseReportComponent],
  exports: [DispatchStateWiseReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DispatchStateWiseReportModule {}
