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
  selector: 'app-age-wise-report',
  templateUrl: './age-wise-report.component.html',
  styleUrls: ['./age-wise-report.component.scss'],
})
export class AgeWiseReportComponent implements OnInit {
  @ViewChild('dataGrid', { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter Panel Visibility & Grid State
  showParameters = true;
  isFilterRowVisible = false;
  isLoading = false;
  isSummaryVisible = false;
  auto: string = 'auto';

  // Filter Lists
  unitList: any[] = [];
  selectedUnit: any = null;

  exportList: any[] = [];
  selectedExport: any = -1;

  // Data Source for DataGrid
  agewiseOrderDataSource: any[] = [];

  // Pager & Pagination
  readonly allowedPageSizes: any = [10, 20, 50, 'all'];
  displayMode: any = 'full';

  // Image Zoom Popup State
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

  // Column Chooser
  isColumnChooserVisible = false;
  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'IMAGE_NAME', caption: 'Image' },
    { dataField: 'BRAND', caption: 'Brand' },
    { dataField: 'UNIT', caption: 'Unit' },
    { dataField: 'ArtNo', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'PACKING', caption: 'Packing' },
    { dataField: 'TO_30', caption: '<= 30 Days' },
    { dataField: 'TO_60', caption: '31-60 Days' },
    { dataField: 'TO_90', caption: '61-90 Days' },
    { dataField: 'Above_90', caption: '> 90 Days' },
    { dataField: 'In_Transit', caption: 'In Transit' },
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
        column: 'Above_90',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 0, useGrouping: true },
        alignment: 'right',
      },
      {
        column: 'In_Transit',
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
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
  }

  // ================= LOAD FILTER DROPDOWNS =================
  loadDropdowns(): void {
    // 1. Unit from common dropdown "COMPANY_CODE" (with fallback to "UNIT")
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

    // 2. Export filter dropdown
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
            this.exportList.some(
              (item) => item.ID === -1 || item.ID === '-1' || item.ID === 0,
            )
          ) {
            this.selectedExport = -1;
          }
        },
        error: (err: any) =>
          console.error('Error fetching EXPORT_FILTER dropdown:', err),
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

  // ================= LOAD AGE-WISE ORDER DATA (On Apply Button Click) =================
  loadAgewiseOrderData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading age-wise report...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading age-wise report...');
        }
      }, 0);
    }
    this.cdr.detectChanges();

    const payload = {
      UNIT_ID:
        this.selectedUnit != null && this.selectedUnit !== ''
          ? Number(this.selectedUnit) || 0
          : 0,
      EXPORT:
        this.selectedExport != null && this.selectedExport !== ''
          ? Number(this.selectedExport)
          : -1,
    };

    this.dataService.getAgewiseOrderReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.agewiseOrderDataSource = rawData.map((item: any) => ({
          ...item,
          IMAGE_NAME:
            item.IMAGE_NAME ||
            item.imageName ||
            item.IMAGE ||
            item.image ||
            item.IMAGE_URL ||
            '',
          ArtNo: item.ArtNo || item.ART_NO || item.artNo || '',
          TO_30: Number(item.TO_30) || 0,
          TO_60: Number(item.TO_60) || 0,
          TO_90: Number(item.TO_90) || 0,
          Above_90: Number(item.Above_90) || 0,
          TOTAL: Number(item.TOTAL) || 0,
          In_Transit: Number(item.In_Transit) || 0,
          MRP: Number(item.MRP) || 0,
        }));

        this.showParameters = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading age-wise report:', err);
        this.agewiseOrderDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  // ================= IMAGE PREVIEW / ZOOM =================
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
      offset: isNearBottom ? '8 -10' : '8 0',
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
    this.loadAgewiseOrderData();
  }

  onExporting(event: any): void {
    const fileName = 'Age Wise Order Report';
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
        (c) => c.dataField === 'ArtNo',
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
  declarations: [AgeWiseReportComponent],
  exports: [AgeWiseReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AgeWiseReportModule {}
