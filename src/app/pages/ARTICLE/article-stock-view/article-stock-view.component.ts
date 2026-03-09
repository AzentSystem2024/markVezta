import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-article-stock-view',
  templateUrl: './article-stock-view.component.html',
  styleUrls: ['./article-stock-view.component.scss'],
})
export class ArticleStockViewComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  Datasource: any[];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  ArticleStockDataSource: DataSource; // ONLY for dx-data-grid
  articleStockArray: any[] = []; // ONLY for logic / summary
  articleStockCount = 0;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  addPackingPopupVisible: boolean = false;
  editPackPopupOpened: boolean = false;
  formsource: any;
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, //  global style
    onClick: () => this.toggleFilters(),
  };

  //========================Export data ==========================

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };
  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private zone: NgZone,
  ) {
    this.formsource = this.fb.group({});
    this.get_ArticleStock_List();
  }

  get_ArticleStock_List() {
    const payload = { USER_ID: 0 };

    this.ArticleStockDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.get_ArticleStock_Api(payload).subscribe({
            next: (res: any) => {
              const list = res?.Data || [];

              //  cache for summary / logic
              this.articleStockArray = list;
              this.articleStockCount = list.length;

              resolve(list); //  grid gets data
            },
            error: () => {
              this.articleStockArray = [];
              this.articleStockCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onExporting(event: any) {
    const fileName = 'Article Stock';
    this.dataservice.exportDataGrid(event, fileName);
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_ArticleStock_List();
  }
  summaryColumnsData = {
    totalItems: [
      {
        column: 'QTY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: '{0}',

        showInColumn: 'QTY_AVAILABLE',
        alignment: 'Right',
      },
      {
        column: 'QTY_MULTIBOX',
        summaryType: 'sum',
        displayFormat: '{0}',

        showInColumn: 'QTY_MULTIBOX',
        alignment: 'right',
      },
      {
        column: 'QTY_TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',

        showInColumn: 'QTY_TOTAL',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'QTY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: '{0}',

        alignByColumn: true,
      },
      {
        column: 'QTY_MULTIBOX',
        summaryType: 'sum',
        displayFormat: ' {0}',

        alignByColumn: true,
      },
      {
        column: 'QTY_TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',

        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };
}

@NgModule({
  imports: [BrowserModule, DxDataGridModule],
  providers: [],
  declarations: [ArticleStockViewComponent],
  exports: [ArticleStockViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleStockViewModule {}
