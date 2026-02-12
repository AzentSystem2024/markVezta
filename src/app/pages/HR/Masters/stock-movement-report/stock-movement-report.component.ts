import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxiGroupModule,
  DxiItemModule,
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-stock-movement-report',
  templateUrl: './stock-movement-report.component.html',
  styleUrls: ['./stock-movement-report.component.scss'],
})
export class StockMovementReportComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];

  StockMovementDatasource: any[] = [];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  auto: string = 'auto';
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  months: any[] = [];
  selectedMonth: string;
  payloadDate: string;
  pdfData: any;
  ItemList: any;

  formatted_To_date: string;
  formatted_from_date: string;
  defaultDate: Date = new Date();
  selected_Company_id: any;
  selected_Company_name: any;
  financialYeaDate: any;
  selected_fin_id: any;
  selectedstoreId: any;
  selected_item_Id: any;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
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
  fromDate: Date | string | number;
  toDate: Date | string | number;
  selected_To_date: any;
  selected_from_date: any;
  isProductionPopupVisible: boolean = false;
  selectedRowData: any = null;
  selectedItemId: any;
  popupType:
    | 'production'
    | 'consumption'
    | 'delivery'
    | 'deliveryReturn'
    | null = null;
  isPopupVisible: boolean = false;
  productionDetails: any[] = [];
  consumptionDetails: any[] = [];
  deliveryDetails: any[] = [];
  deliveryReturnDetails: any[] = [];

  onExporting(event: any) {
    this.exportService.onExporting(event, 'stock-movement-report');
  }

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    private exportService: ExportService,
    private zone: NgZone,
  ) {
    this.sesstion_Details();
    this.get_Item_Dropdown();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataService.getMonths();
  }

  ngOnInit() {
    this.sesstion_Details();
    this.get_Item_Dropdown();

    //  SET TODAY AS DEFAULT
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;
    this.getStockMovement;

    // this.formatted_To_date = this.formatDate(today);
  }

  ngAfterViewInit() {
    //  Grid is now ready → show loading
    setTimeout(() => {
      this.dataGrid?.instance?.beginCustomLoading('Loading...');
      this.getStockMovement();
    });
  }

  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.selected_To_date = today; // Today's date
    } else {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
    this.triggerStockReload();
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.selected_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.selected_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
    this.triggerStockReload();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
    this.selected_Company_name = sessionData.SELECTED_COMPANY.COMPANY_NAME;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    console.log(sessionYear, '==================session year==========');
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    console.log(
      this.financialYeaDate,
      '=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[',
    );

    this.formatted_from_date = this.financialYeaDate;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id===================',
    );

    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
    console.log(
      this.selectedstoreId,
      '===========selected store id===================',
    );
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getStockMovement();
  }
  toggleFilters() {
    const grid = this.dataGrid?.instance;
    if (!grid) return;

    this.isFilterOpened = !this.isFilterOpened;

    grid.beginUpdate();
    grid.option({
      filterRow: { visible: this.isFilterOpened },
      headerFilter: { visible: this.isFilterOpened },
    });
    grid.endUpdate();
  }

  //   refreshButtonOptions = {
  //   icon: 'refresh',
  //   hint: 'Refresh',
  //   elementAttr: { class: 'toolbar-icon-btn' },
  //   onClick: () => this.refreshGrid(),
  //   text: '',
  // };

  onItemIdChange(event: any) {
    console.log(event, '=================item id===================');
    this.selected_item_Id = event.value;
    this.triggerStockReload();
    console.log(
      this.selected_item_Id,
      '=================selected item id===================',
    );
  }

  get_Item_Dropdown() {
    const payload = {
      NAME: 'ITEMTYPE',
    };
    this.dataService.Item_Dropdown(payload).subscribe((res: any) => {
      console.log('Item dropdown', res);
      this.ItemList = res;
    });
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    this.triggerStockReload();
    console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    console.log('Formatted Date:', this.formatted_To_date); // example: "2025-04-01"
    this.triggerStockReload();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  private triggerStockReload() {
    // Optional guard – prevents API call before grid is ready
    if (!this.dataGrid?.instance) return;

    this.getStockMovement();
  }
  getStockMovement() {
    const grid = this.dataGrid?.instance;

    grid?.beginCustomLoading('Loading...'); // optional but recommended

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      ITEM_TYPE: this.selected_item_Id || 0,
    };
    console.log(payload, 'PAYLOADDDDDDDDDDDDDDDDDDDD');
    this.dataService.StockMovement_Api(payload).subscribe({
      next: (res: any) => {
        this.StockMovementDatasource = res.data || [];

        // 🔑 FORCE GRID REFRESH
        grid?.refresh();
      },
      complete: () => {
        grid?.endCustomLoading();
      },
      error: () => {
        grid?.endCustomLoading();
      },
    });
  }

  // getStockMovement() {
  //   const payload = {
  //     COMPANY_ID: this.selected_Company_id,
  //     DATE_FROM: this.formatted_from_date,
  //     DATE_TO: this.formatted_To_date,
  //     // STORE_ID: this.selectedstoreId,
  //     ITEM_TYPE: this.selected_item_Id || 0,
  //   };
  //   console.log(payload, '================payload===================');
  //   this.dataService.StockMovement_Api(payload).subscribe((res: any) => {
  //     console.log(
  //       res,
  //       '=================Stock Movement Report===================',
  //     );
  //     this.StockMovementDatasource = res.data;
  //     console.log(
  //       this.StockMovementDatasource,
  //       '=================Stock Movement Report DataSource===================',
  //     );
  //   });
  // }

  summaryColumnsData = {
    totalItems: [
      {
        column: 'OPENING_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'OPENING_QTY',
        alignment: 'Right',
      },
      {
        column: 'GRN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'GRN_QTY',
        alignment: 'Right',
      },
      {
        column: 'BALANCE_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'BALANCE_STOCK',
        alignment: 'Right',
      },
      {
        column: 'PURCHASE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PURCHASE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFEROUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TRANSFEROUT_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFERIN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TRANSFERIN_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DELIVERY_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DELIVERY_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'SALE_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'SALE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'ADJUSTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ADJUSTED',
        alignment: 'Right',
      },
      {
        column: 'PRODUCTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PRODUCTION_QTY',
        alignment: 'Right',
      },
      {
        column: 'CONSUMPTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CONSUMPTION_QTY',
        alignment: 'Right',
      },
    ],
    groupItems: [
      {
        column: 'OPENING_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'GRN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'BALANCE_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'PURCHASE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TRANSFEROUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TRANSFERIN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'DELIVERY_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'DELIVERY_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'SALE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'SALE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ADJUSTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'PRODUCTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'CONSUMPTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };

  onCellClick(e: any) {
    if (e.rowType !== 'data') return;

    const field = e.column?.dataField;
    const itemId = e.data.ITEM_ID;

    if (!itemId) return;

    this.selectedRowData = e.data;
    this.selectedItemId = itemId;

    if (field === 'PRODUCTION_QTY') {
      this.popupType = 'production';
      this.loadProductionDetails(itemId);
      this.isPopupVisible = true;
    }

    if (field === 'CONSUMPTION_QTY') {
      this.popupType = 'consumption';
      this.loadConsumptionDetails(itemId);
      this.isPopupVisible = true;
    }

    if (field === 'DELIVERY_QTY') {
      this.popupType = 'delivery';
      this.loadDeliveryDetails(itemId);
      this.isPopupVisible = true;
    }
    if (field === 'DELIVERY_RETURN_QTY') {
      this.popupType = 'deliveryReturn';
      this.loadDeliveryReturnDetails(itemId);
      this.isPopupVisible = true;
    }
  }
  loadProductionDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
    };

    console.log(payload, 'PRODUCTION DETAIL PAYLOAD');

    // API CALL HERE
    // this.dataService.getProductionDetails(payload).subscribe(res => {
    //   this.productionDetails = res.data || [];
    // });
  }

  loadConsumptionDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
    };

    console.log(payload, 'CONSUMPTION DETAIL PAYLOAD');

    // API CALL HERE
    // this.dataService.getConsumptionDetails(payload).subscribe(res => {
    //   this.consumptionDetails = res.data || [];
    // });
  }
  loadDeliveryDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
    };

    console.log(payload, 'PRODUCTION DETAIL PAYLOAD');

    // API CALL HERE
    // this.dataService.getProductionDetails(payload).subscribe(res => {
    //   this.productionDetails = res.data || [];
    // });
  }

  loadDeliveryReturnDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
    };

    console.log(payload, 'PRODUCTION DETAIL PAYLOAD');

    // API CALL HERE
    // this.dataService.getProductionDetails(payload).subscribe(res => {
    //   this.productionDetails = res.data || [];
    // });
  }

  get popupTitle(): string {
    switch (this.popupType) {
      case 'production':
        return 'Production Details';
      case 'consumption':
        return 'Consumption Details';
      case 'delivery':
        return 'Delivery Details';
      case 'deliveryReturn':
        return 'Delivery Return Details';
      default:
        return '';
    }
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [StockMovementReportComponent],
  exports: [StockMovementReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockMovementReportModule {}
