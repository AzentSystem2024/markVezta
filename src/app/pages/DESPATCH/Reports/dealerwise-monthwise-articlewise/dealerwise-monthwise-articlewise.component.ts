import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DxDataGridComponent,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-dealerwise-monthwise-articlewise',
  templateUrl: './dealerwise-monthwise-articlewise.component.html',
  styleUrls: ['./dealerwise-monthwise-articlewise.component.scss'],
})
export class DealerwiseMonthwiseArticlewiseComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  @ViewChild('filterValidationGroup', { static: false })
  filterValidationGroup?: DxValidationGroupComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto = 'auto';

  // ================= FILTER PROPERTIES =================
  financialYearList: any[] = [];
  selectedFinId: any = null;

  warehouseList: any[] = [];
  selectedWarehouses: any[] = [];

  // ================= REPORT DATA & COLUMNS =================
  reportDataSource: any[] = [];
  gridColumns: any[] = [];
  summaryColumnsData: any = { totalItems: [] };

  // Paging
  readonly allowedPageSizes: any = [20, 50, 100, 200, 'all'];
  displayMode: any = 'full';

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
      this.loadReportData(this.filterValidationGroup);
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

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.initDefaultFinancialYear();
    this.configureColumnsFromData([]);
    this.loadDropdowns();
  }

  private initDefaultFinancialYear(): void {
    try {
      const raw = sessionStorage.getItem('savedUserData');
      if (raw) {
        const sessionData = JSON.parse(raw);
        const defaultFinId = sessionData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
        if (defaultFinId != null) {
          this.selectedFinId = defaultFinId;
        }
      }
    } catch (err) {
      console.error('Error reading session financial year:', err);
    }
  }

  // ================= LOAD FILTER DROPDOWNS =================
  loadDropdowns(): void {
    this.dataService.financial_year_api().subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : res?.Data || [];
        this.financialYearList = raw.map((item: any) => ({
          ID: item.ID !== undefined ? item.ID : item.id,
          DESCRIPTION:
            item.DESCRIPTION || item.description || item.NAME || item.name,
        }));

        if (this.selectedFinId == null && this.financialYearList.length > 0) {
          const currentYear = new Date().getFullYear().toString();
          const matched = this.financialYearList.find((yr: any) =>
            String(yr.DESCRIPTION || '').includes(currentYear),
          );
          this.selectedFinId = matched
            ? matched.ID
            : this.financialYearList[0].ID;
        }
      },
      error: (err: any) =>
        console.error('Error fetching Financial Year dropdown:', err),
    });

    this.dataService.get_Warehouse_Dropdown_Api().subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : res?.Data || [];
        this.warehouseList = raw.map((item: any) => ({
          ID: item.ID !== undefined ? item.ID : item.id,
          DESCRIPTION:
            item.DESCRIPTION || item.description || item.NAME || item.name,
        }));
      },
      error: (err: any) =>
        console.error('Error fetching Warehouse dropdown:', err),
    });
  }

  // ================= BUILD FILTER PAYLOAD =================
  buildFilterPayload(): any {
    const warehouseIds = Array.isArray(this.selectedWarehouses)
      ? this.selectedWarehouses
          .filter((item) => item !== null && item !== undefined && item !== '')
          .join(',')
      : '';

    return {
      FIN_ID: this.selectedFinId,
      WAREHOUSE_ID: warehouseIds,
    };
  }

  // ================= LOAD DATA (OrderRpt/DealerWiseReport) =================
  loadReportData(validationGroup?: DxValidationGroupComponent): void {
    if (validationGroup?.instance) {
      const result = validationGroup.instance.validate();
      if (!result.isValid) {
        notify({
          message: 'Please select a Financial Year.',
          type: 'warning',
          displayTime: 3000,
          position: { at: 'top right', my: 'top right', offset: '-20 20' },
        });
        return;
      }
    }

    if (this.selectedFinId == null || this.selectedFinId === '') {
      notify({
        message: 'Financial Year is mandatory.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right', offset: '-20 20' },
      });
      return;
    }

    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading report data...');
    }

    const payload = this.buildFilterPayload();

    this.dataService.getDealerWiseReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();

        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.configureColumnsFromData(rawData);
        this.reportDataSource = rawData;

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
        console.error('Error fetching Dealerwise Report:', err);
        notify({
          message: 'Failed to load report data. Please check connection.',
          type: 'error',
          displayTime: 4000,
          position: { at: 'top right', my: 'top right', offset: '-20 20' },
        });
      },
    });
  }

  private configureColumnsFromData(rows: any[]): void {
    const keys = rows && rows.length > 0 ? Object.keys(rows[0]) : [];
    const upperKeyMap = new Map<string, string>();
    keys.forEach((k) => upperKeyMap.set(k.toUpperCase(), k));

    const resolveField = (aliases: string[], fallback: string): string => {
      for (const alias of aliases) {
        const match = upperKeyMap.get(alias.toUpperCase());
        if (match) return match;
      }
      return fallback;
    };

    const usedKeys = new Set<string>();
    const markUsed = (field: string) => {
      if (upperKeyMap.has(field.toUpperCase())) {
        usedKeys.add(field);
      }
    };

    const dealerDefs = [
      {
        aliases: [
          'DEALER_NAME',
          'DEALER',
          'DISTRIBUTOR_NAME',
          'DISTRIBUTOR',
          'CUSTOMER_NAME',
        ],
        fallback: 'DEALER_NAME',
        caption: 'Dealer Name',
        width: 100,
      },
      {
        aliases: ['STATE', 'STATE_NAME'],
        fallback: 'STATE',
        caption: 'State',
        width: 100,
      },
      {
        aliases: ['ZONE', 'ZONE_NAME'],
        fallback: 'ZONE',
        caption: 'Zone',
        width: 100,
      },
    ];

    const articleDefs = [
      {
        aliases: ['UNIT', 'UNIT_CODE', 'UNIT_NAME'],
        fallback: 'UNIT',
        caption: 'Unit',
        width: 100,
      },
      {
        aliases: ['ART_NO', 'ARTICLE_NO', 'ARTNO'],
        fallback: 'ART_NO',
        caption: 'Art No',
      },
      { aliases: ['COLOR', 'COLOR_NAME'], fallback: 'COLOR', caption: 'Color' },
      {
        aliases: ['CATEGORY', 'CATEGORY_NAME'],
        fallback: 'CATEGORY',
        caption: 'Category',
      },
      {
        aliases: ['SIZE', 'PACKING', 'SIZE_NAME', 'PACK_NAME'],
        fallback: 'SIZE',
        caption: 'Size',
      },
    ];

    const qtyDefs = [
      { aliases: ['APR', 'APRIL'], fallback: 'APR', caption: 'April' },
      { aliases: ['MAY'], fallback: 'MAY', caption: 'May' },
      { aliases: ['JUN', 'JUNE'], fallback: 'JUN', caption: 'June' },
      { aliases: ['JUL', 'JULY'], fallback: 'JUL', caption: 'July' },
      { aliases: ['AUG', 'AUGUST'], fallback: 'AUG', caption: 'August' },
      {
        aliases: ['SEP', 'SEPT', 'SEPTEMBER'],
        fallback: 'SEP',
        caption: 'September',
      },
      { aliases: ['OCT', 'OCTOBER'], fallback: 'OCT', caption: 'October' },
      { aliases: ['NOV', 'NOVEMBER'], fallback: 'NOV', caption: 'November' },
      { aliases: ['DEC', 'DECEMBER'], fallback: 'DEC', caption: 'December' },
      { aliases: ['JAN', 'JANUARY'], fallback: 'JAN', caption: 'January' },
      { aliases: ['FEB', 'FEBRUARY'], fallback: 'FEB', caption: 'February' },
      { aliases: ['MAR', 'MARCH'], fallback: 'MAR', caption: 'March' },
      {
        aliases: ['TOTAL', 'TOTAL_QTY', 'GRAND_TOTAL'],
        fallback: 'TOTAL',
        caption: 'Total',
      },
    ];

    const dealerColumns = dealerDefs.map((def) => {
      const dataField = resolveField(def.aliases, def.fallback);
      markUsed(dataField);
      return {
        dataField,
        caption: def.caption,
        cssClass: 'band-dealer',
        allowGrouping: true,
        ...(def.width !== undefined ? { width: def.width } : {}),
      };
    });

    const articleColumns = articleDefs.map((def) => {
      const dataField = resolveField(def.aliases, def.fallback);
      markUsed(dataField);
      return {
        dataField,
        caption: def.caption,
        cssClass: 'band-article',
        allowGrouping: true,
        ...(def.width !== undefined ? { width: def.width } : {}),
      };
    });

    const totalItems: any[] = [];
    const groupItems: any[] = [];

    const qtyColumns = qtyDefs.map((def) => {
      const dataField = resolveField(def.aliases, def.fallback);
      markUsed(dataField);

      totalItems.push({
        column: dataField,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      });

      groupItems.push({
        column: dataField,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        showInGroupFooter: false,
        alignByColumn: true,
      });

      return {
        dataField,
        caption: def.caption,
        cssClass: 'band-qty',
        dataType: 'number',
        alignment: 'right',
        allowGrouping: false,
        format: { type: 'fixedPoint', precision: 0, useGrouping: true },
      };
    });

    const bands: any[] = [
      {
        caption: 'Dealer',
        alignment: 'center',
        cssClass: 'band-dealer',
        columns: dealerColumns,
      },
      {
        caption: 'Article',
        alignment: 'center',
        cssClass: 'band-article',
        columns: articleColumns,
      },
      {
        caption: 'QTY IN CASES',
        alignment: 'center',
        cssClass: 'band-qty',
        columns: qtyColumns,
      },
    ];

    // Append any extra columns returned by the API that weren't matched above
    const extraKeys = keys.filter((k) => !usedKeys.has(k));
    if (extraKeys.length > 0) {
      extraKeys.forEach((key) => {
        const sampleVal = rows.find(
          (r) => r[key] !== null && r[key] !== undefined,
        )?.[key];
        const isNumeric = typeof sampleVal === 'number';
        const caption = key
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());

        if (isNumeric) {
          totalItems.push({
            column: key,
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: {
              type: 'fixedPoint',
              precision: 0,
              useGrouping: true,
            },
            alignment: 'right',
          });
          groupItems.push({
            column: key,
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: {
              type: 'fixedPoint',
              precision: 0,
              useGrouping: true,
            },
            showInGroupFooter: false,
            alignByColumn: true,
          });
          bands.push({
            dataField: key,
            caption,
            dataType: 'number',
            alignment: 'right',
            format: { type: 'fixedPoint', precision: 0, useGrouping: true },
          });
        } else {
          bands.push({
            dataField: key,
            caption,
            allowGrouping: true,
          });
        }
      });
    }

    this.gridColumns = bands;
    this.summaryColumnsData = { totalItems, groupItems };
  }

  // ================= EXCEL EXPORT =================
  onExporting(e: any): void {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Dealerwise Report');

    exportDataGridToXLSX({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          `Dealerwise_Monthwise_Articlewise_Report.xlsx`,
        );
      });
    });
    e.cancel = true;
  }

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }
}
