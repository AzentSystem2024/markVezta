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

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-transfer-out-report',
  templateUrl: './transfer-out-report.component.html',
  styleUrls: ['./transfer-out-report.component.scss'],
})
export class TransferOutReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  selected_from_date: any;
  selected_To_date: any;

  brandList: any[] = [];
  selectedBrand: any = null;

  transferOutList: any[] = [];
  selectedTransferOut: any = null;

  transferOutDataSource: any[] = [];

  readonly allowedPageSizes: any = [10, 20, 50, 'all'];
  displayMode: any = 'full';

  isColumnChooserVisible = false;
  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'TRANSFER_NO', caption: 'Transfer No' },
    { dataField: 'TRANSFER_TIME', caption: 'Transfer Time' },
    { dataField: 'WORK_ORDER', caption: 'Work Order' },
    { dataField: 'CUST_NAME', caption: 'Customer' },
    { dataField: 'UNIT', caption: 'Unit' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'SIZE', caption: 'Size' },
    { dataField: 'PACKING', caption: 'Packing' },
    { dataField: 'QTY', caption: 'Qty' },
    { dataField: 'BOX_PRICE', caption: 'Box Price' },
    { dataField: 'BRAND', caption: 'Brand' },
  ];

  summaryColumnsData = {
    totalItems: [
      {
        column: 'QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'BOX_PRICE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'QTY',
        summaryType: 'sum',
        displayFormat: 'Qty: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
    ],
  };

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
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const currentYear = today.getFullYear();

    this.selected_from_date = new Date(currentYear, 0, 1);
    this.selected_To_date = today;

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    // Same Unit source as Dispatch Summary (COMPANY_CODE) — labeled Transfer Out here
    this.dataService
      .getDropdownData({ NAME: 'COMPANY_CODE', name: 'COMPANY_CODE' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.transferOutList = raw.map((item: any) => ({
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
          console.error('Error fetching Transfer Out (COMPANY_CODE):', err),
      });

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
  }

  onFromDateChange(e: any): void {
    if (e.value) {
      this.selected_from_date = new Date(e.value);
    }
  }

  onToDateChange(e: any): void {
    if (e.value) {
      this.selected_To_date = new Date(e.value);
    }
  }

  private toIsoDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  }

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

  loadTransferOutReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading transfer out...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading(
            'Loading transfer out...',
          );
        }
      }, 0);
    }
    this.cdr.detectChanges();

    const payload = {
      DATE_FROM: this.toIsoDate(this.selected_from_date),
      DATE_TO: this.toIsoDate(this.selected_To_date),
      BRAND_ID:
        this.selectedBrand != null && this.selectedBrand !== ''
          ? String(this.selectedBrand)
          : '',
      UNIT_ID:
        this.selectedTransferOut != null && this.selectedTransferOut !== ''
          ? Number(this.selectedTransferOut)
          : 0,
    };

    this.dataService.getTransferOutReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        if (res && res.Data && Array.isArray(res.Data)) {
          this.transferOutDataSource = res.Data;
          this.showParameters = false;
        } else if (Array.isArray(res)) {
          this.transferOutDataSource = res;
          this.showParameters = false;
        } else {
          this.transferOutDataSource = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error fetching Transfer Out report:', err);
        notify(
          'Failed to load transfer out report data. Please try again.',
          'error',
          3000,
        );
        this.transferOutDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

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
    this.loadTransferOutReportData();
  }

  onExporting(event: any): void {
    this.dataService.exportDataGridReport(event, 'Transfer Out Report');
  }

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: 'formula',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

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
        (c) => c.dataField === 'TRANSFER_NO',
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
  declarations: [TransferOutReportComponent],
  exports: [TransferOutReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransferOutReportModule {}
