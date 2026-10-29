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
  selector: 'app-stock-report',
  templateUrl: './stock-report.component.html',
  styleUrls: ['./stock-report.component.scss'],
})
export class StockReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  brandList: any[] = [];
  selectedBrand: any = null;

  exportList: any[] = [];
  selectedExport: any = 0;

  stockReportDataSource: any[] = [];

  readonly allowedPageSizes: any = [10, 20, 50, 'all'];
  displayMode: any = 'full';

  isColumnChooserVisible = false;
  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  isImageZoomVisible = false;
  zoomImageUrl = '';
  imageZoomTarget: any = window;
  imageZoomPosition: any = {
    my: 'left top',
    at: 'right top',
    of: window,
    offset: '8 0',
    collision: 'fit flip',
  };

  private readonly chooserColumns = [
    { dataField: 'IMAGE_NAME', caption: 'Image' },
    { dataField: 'ARTICLE_TYPE', caption: 'Article Type' },
    { dataField: 'BRAND_NAME', caption: 'Brand' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'SIZE', caption: 'Size' },
    { dataField: 'RFC', caption: 'RFC' },
    { dataField: 'RMC', caption: 'RMC' },
    { dataField: 'BYZ', caption: 'BYZ' },
    { dataField: 'BFC', caption: 'BFC' },
    { dataField: 'HFC', caption: 'HFC' },
    { dataField: 'BPI_KL', caption: 'BPI KL' },
    { dataField: 'BPI_TN', caption: 'BPI TN' },
    { dataField: 'PGS', caption: 'PGS' },
    { dataField: 'QTY_STOCK', caption: 'Qty Stock' },
    { dataField: 'QTY_ORDER', caption: 'Qty Order' },
    { dataField: 'QTY_AVAILABLE', caption: 'Qty Available' },
  ];

  summaryColumnsData = {
    totalItems: [
      
      {
        column: 'QTY_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'QTY_ORDER',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'QTY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'QTY_STOCK',
        summaryType: 'sum',
        displayFormat: 'Stock: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'QTY_ORDER',
        summaryType: 'sum',
        displayFormat: 'Order: {0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'QTY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: 'Available: {0}',
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
    this.loadDropdowns();
  }

  loadDropdowns(): void {
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

    this.dataService
      .getDropdownData({ NAME: 'EXPORT_FILTER', name: 'EXPORT_FILTER' })
      .subscribe({
        next: (res: any) => {
          const raw = Array.isArray(res) ? res : res?.Data || [];
          this.exportList = raw.map((item: any) => ({
            ID: item.ID !== undefined ? item.ID : item.id,
            DESCRIPTION:
              item.DESCRIPTION || item.description || item.NAME || item.name,
          }));
          if (
            this.selectedExport == null &&
            this.exportList.some((item) => item.ID === 0 || item.ID === '0')
          ) {
            this.selectedExport = 0;
          }
        },
        error: (err: any) =>
          console.error('Error fetching EXPORT_VALUES dropdown:', err),
      });
  }

  loadStockReportData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading stock...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading stock...');
        }
      }, 0);
    }
    this.cdr.detectChanges();

    const payload = {
      BRAND_ID:
        this.selectedBrand != null && this.selectedBrand !== ''
          ? String(this.selectedBrand)
          : '',
      EXPORT:
        this.selectedExport != null && this.selectedExport !== ''
          ? Number(this.selectedExport)
          : 0,
    };

    this.dataService.getStockViewReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        if (res && res.Data && Array.isArray(res.Data)) {
          this.stockReportDataSource = res.Data;
          this.showParameters = false;
        } else if (Array.isArray(res)) {
          this.stockReportDataSource = res;
          this.showParameters = false;
        } else {
          this.stockReportDataSource = [];
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading stock report:', err);
        this.stockReportDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  getImageUrl(imageName: string): string {
    return imageName ? `https://mmarkonline.com/artimages/${imageName}` : '';
  }

  openImageZoom(event: MouseEvent, imageName: string): void {
    if (!imageName) return;
    event.stopPropagation();
    this.zoomImageUrl = this.getImageUrl(imageName);
    this.imageZoomTarget = event.currentTarget || event.target;

    const clickY = event.clientY || 0;
    const windowHeight = window.innerHeight || 800;
    const isNearBottom = clickY > windowHeight - 340;

    this.imageZoomPosition = {
      my: isNearBottom ? 'left bottom' : 'left top',
      at: isNearBottom ? 'right bottom' : 'right top',
      of: this.imageZoomTarget,
      offset: '8 0',
      collision: 'fit flip',
    };

    this.isImageZoomVisible = true;
    this.cdr.detectChanges();
  }

  closeImageZoom(): void {
    this.isImageZoomVisible = false;
    this.zoomImageUrl = '';
    this.imageZoomTarget = window;
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
    this.loadStockReportData();
  }

  onExporting(event: any): void {
    this.dataService.exportDataGridReport(event, 'Stock Report');
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
  declarations: [StockReportComponent],
  exports: [StockReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockReportModule {}
