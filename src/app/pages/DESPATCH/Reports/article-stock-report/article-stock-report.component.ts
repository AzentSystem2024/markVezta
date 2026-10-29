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
  selector: 'app-article-stock-report',
  templateUrl: './article-stock-report.component.html',
  styleUrls: ['./article-stock-report.component.scss'],
})
export class ArticleStockReportComponent implements OnInit {
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

  // Data Source for DataGrid
  articleStockDataSource: any[] = [];

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
    { dataField: 'BRAND_NAME', caption: 'Brand' },
    { dataField: 'ART_NO', caption: 'Art No' },
    { dataField: 'COLOR', caption: 'Color' },
    { dataField: 'CATEGORY', caption: 'Category' },
    { dataField: 'TYPE_NAME', caption: 'Type' },
    { dataField: 'SIZE', caption: 'Size' },
    { dataField: 'ORDER_NO', caption: 'Order No' },
    { dataField: 'MRP', caption: 'MRP' },
    { dataField: 'QUANTITY', caption: 'Quantity' },
    { dataField: 'MULTIBOX_QTY', caption: 'Multibox Qty' },
    { dataField: 'TOTAL_QTY', caption: 'Total Qty' },
    { dataField: 'ARTICLE_ID', caption: 'Article ID' },
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
      {
        column: 'MULTIBOX_QTY',
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
    // Unit from common dropdown "COMPANY_CODE" (with fallback to "UNIT")
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

  // ================= LOAD ARTICLE STOCK DATA (On Apply Button Click) =================
  loadArticleStockData(): void {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading article stock report...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading(
            'Loading article stock report...',
          );
        }
      }, 0);
    }
    this.cdr.detectChanges();

    const payload = {
      UNIT_ID:
        this.selectedUnit != null && this.selectedUnit !== ''
          ? Number(this.selectedUnit) || 0
          : 0,
    };

    this.dataService.getArticleStockReport(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        let rawData: any[] = [];
        if (res && res.Data && Array.isArray(res.Data)) {
          rawData = res.Data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.articleStockDataSource = rawData.map((item: any) => ({
          ...item,
          ARTICLE_ID:
            item.ARTICLE_ID != null
              ? item.ARTICLE_ID
              : item.articleId != null
                ? item.articleId
                : item.article_id,
          ART_NO: item.ART_NO || item.ArtNo || item.artNo || '',
          COLOR: item.COLOR || item.color || '',
          CATEGORY: item.CATEGORY || item.category || '',
          BRAND_NAME:
            item.BRAND_NAME ||
            item.brandName ||
            item.BRAND ||
            item.brand ||
            '',
          TYPE_NAME:
            item.TYPE_NAME ||
            item.typeName ||
            item.TYPE ||
            item.type ||
            '',
          SIZE: item.SIZE != null ? String(item.SIZE) : '',
          ORDER_NO: item.ORDER_NO || item.orderNo || item.order_no || '',
          MRP: Number(item.MRP) || 0,
          QUANTITY:
            Number(item.QUANTITY != null ? item.QUANTITY : item.quantity) || 0,
          MULTIBOX_QTY:
            Number(
              item.MULTIBOX_QTY != null
                ? item.MULTIBOX_QTY
                : item.multiboxQty,
            ) || 0,
          TOTAL_QTY:
            Number(
              item.TOTAL_QTY != null ? item.TOTAL_QTY : item.totalQty,
            ) || 0,
        }));

        this.showParameters = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error loading article stock report:', err);
        this.articleStockDataSource = [];
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
    this.loadArticleStockData();
  }

  onExporting(event: any): void {
    const fileName = 'Article Stock Report';
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
  declarations: [ArticleStockReportComponent],
  exports: [ArticleStockReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleStockReportModule {}
