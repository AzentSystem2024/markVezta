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
import { BoxproductionJvAddModule } from 'src/app/boxproduction-jv-add/boxproduction-jv-add.component';
import { DeliveryNoteFormModule } from 'src/app/pages/delivery-note-form/delivery-note-form.component';
import { ViewInvoiceModule } from 'src/app/pages/INVOICE/view-invoice/view-invoice.component';
import { PurchaseReturnDebitFormModule } from 'src/app/pages/purchase-return-debit-form/purchase-return-debit-form.component';
import { GrnViewFormModule } from 'src/app/pop-up/operations/grn-view-form/grn-view-form.component';
import { ProductionJvAddModule } from 'src/app/production-jv-add/production-jv-add.component';
import { ProductionJvViewModule } from 'src/app/production-jv-view/production-jv-view.component';
import { SaleReturnFormModule } from 'src/app/sale-return-form/sale-return-form.component';
import { DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-stock-movement-report',
  templateUrl: './stock-movement-report.component.html',
  styleUrls: ['./stock-movement-report.component.scss'],
})
export class StockMovementReportComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];

  StockMovementDatasource: any[] = [];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  auto: string = 'auto';
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  months: any[] = [];
  selectedMonth!: string;
  payloadDate!: string;
  pdfData: any;
  ItemList: any;

  formatted_To_date!: string;
  formatted_from_date!: string;
  defaultDate: Date = new Date();
  selected_Company_id: any;
  selected_Company_name: any;
  financialYeaDate: any;
  selected_fin_id: any;
  selectedstoreId: any;
  selected_item_Id: any;
  selectedYear!: any | null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth!: any;
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
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
  fromDate!: Date | string | number;
  toDate!: Date | string | number;
  selected_To_date!: any;
  selected_from_date!: any;
  isProductionPopupVisible: boolean = false;
  selectedRowData: any = null;
  selectedItemId: any;
  popupType:
    | 'grn'
    | 'purchReturn'
    | 'production'
    | 'consumption'
    | 'delivery'
    | 'deliveryReturn'
    | 'saleReturn'
    | 'salesInvoice'
    | 'adjusted'
    | null = null;
  isPopupVisible: boolean = false;
  GrnDetails: any[] = [];
  productionDetails: any[] = [];
  PurchReturnDetails: any[] = [];
  consumptionDetails: any[] = [];
  deliveryDetails: any[] = [];
  deliveryReturnDetails: any[] = [];
  saleReturnDetails: any[] = [];
  salesInvoiceDetails: any[] = [];
  adjustedDetails: any[] = [];
  isEditProductionPopupVisible: boolean = false;
  selectedProduction: any;
  isReadOnlyInvoice: boolean = false;
  selectedProductionType: any;
  selectedGrnId: any;
  isViewGrnPopupOpened: boolean = false;
  selectedPurchaseReturnId: any;
  isEditPurchaseReturn: boolean = false;
  selectedPurchaseReturn: any;
  selectedDelivery: any;
  isReadOnlyPurchaseReturn: boolean = false;
  isEditSaleReturn: boolean = false;
  isEditDelivery: boolean = false;
  selectedSaleReturn: any;
  isReadOnlySaleReturn = true;
  isReadOnlyDelivery = true;
  selectedInvoice: any;
  isViewInvoice: boolean = false;
  fin_id: any;
  finID: any;
  selectedStoreid: any[] = [];
  storeHint: string = '';
  Store: any;

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
    this.store_dropdown();
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
    this.store_dropdown();

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
    this.getStockMovement();

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
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.fin_id = sessionData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_Company_name = sessionData.SELECTED_COMPANY.COMPANY_NAME;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
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

   store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

    updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store
      .filter(x => this.selectedStoreid.includes(x.ID))
      .map(x => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
    this.getStockMovement();
  }

  //   refreshButtonOptions = {
  //   icon: 'refresh',
  //   hint: 'Refresh',
  //   elementAttr: { class: 'toolbar-icon-btn' },
  //   onClick: () => this.refreshGrid(),
  //   text: '',
  // };

  onItemIdChange(event: any) {
    this.selected_item_Id = event.value;
    this.triggerStockReload();
  }

  get_Item_Dropdown() {
    const payload = {
      NAME: 'ITEMTYPE',
    };
    this.dataService.Item_Dropdown(payload).subscribe((res: any) => {
      this.ItemList = res;
    });
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    this.triggerStockReload();
    // example: "2025-04-01"
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    // example: "2025-04-01"
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
      STORE_ID:this.selectedStoreid.join(','),
      FIN_ID: this.finID,
    };
    this.dataService.StockMovement_Api(payload).subscribe({
      next: (res: any) => {
        this.StockMovementDatasource = res.data || [];

        //  FORCE GRID REFRESH
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

  summaryColumnsData = {
    totalItems: [
      {
        column: 'OPENING_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'OPENING_QTY',
        alignment: 'Right',
      },
      {
        column: 'GRN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'GRN_QTY',
        alignment: 'Right',
      },
      {
        column: 'BALANCE_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'BALANCE_STOCK',
        alignment: 'Right',
      },
      {
        column: 'PURCHASE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'PURCHASE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFEROUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'TRANSFEROUT_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFERIN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'TRANSFERIN_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'DELIVERY_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'DELIVERY_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'SALE_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'SALE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'ADJUSTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'ADJUSTED',
        alignment: 'Right',
      },
      {
        column: 'TRANSFER_OUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'TRANSFER_OUT_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFER_IN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'TRANSFER_IN_QTY',
        alignment: 'Right',
      },
      {
        column: 'PRODUCTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'PRODUCTION_QTY',
        alignment: 'Right',
      },
      {
        column: 'CONSUMPTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        showInColumn: 'CONSUMPTION_QTY',
        alignment: 'Right',
      },
    ],
    groupItems: [
      {
        column: 'OPENING_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'GRN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'BALANCE_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'PURCHASE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'TRANSFEROUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'TRANSFERIN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'DELIVERY_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'DELIVERY_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'SALE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'SALE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'ADJUSTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'TRANSFER_OUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'TRANSFER_IN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'PRODUCTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
      {
        column: 'CONSUMPTION_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options: any) => {
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
    if (field === 'GRN_QTY') {
      this.popupType = 'grn';
      this.loadGrnDetails(itemId);
      this.isPopupVisible = true;
    }
    if (field === 'PURCHASE_RETURN_QTY') {
      this.popupType = 'purchReturn';
      this.loadPurchReturnDetails(itemId);
      this.isPopupVisible = true;
    }
    if (field === 'SALE_RETURN_QTY') {
      this.popupType = 'saleReturn';
      this.loadSaleReturnDetails(itemId);
      this.isPopupVisible = true;
    }
    if (field === 'SALE_QTY') {
      this.popupType = 'salesInvoice';
      this.loadSalesInvoiceDetails(itemId);
      this.isPopupVisible = true;
    }
    if (field === 'ADJUSTED') {
      this.popupType = 'adjusted';
      this.loadAdjustedDetails(itemId);
      this.isPopupVisible = true;
    }
  }

  loadProductionDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'PRODUCTION',
    };
    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.productionDetails = res.data || [];
    });
  }

  loadConsumptionDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'CONSUMPTION',
    };

    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.consumptionDetails = res.data || [];
    });
  }

  loadDeliveryDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'DELIVERY',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.deliveryDetails = res.data || [];
    });
  }

  loadDeliveryReturnDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'DELIVERY_RETURN',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.deliveryReturnDetails = res.data || [];
    });
  }

  loadGrnDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'GRN',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.GrnDetails = res.data || [];
    });
  }

  loadPurchReturnDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'PURCHASE_RETURN',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.PurchReturnDetails = res.data || [];
    });
  }

  loadSaleReturnDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'SALE_RETURN_QTY',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.saleReturnDetails = res.data || [];
    });
  }

  loadSalesInvoiceDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'SALE_QTY',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.salesInvoiceDetails = res.data || [];
    });
  }

  loadAdjustedDetails(itemId: number) {
    const payload = {
      ITEM_ID: itemId,
      DATE_FROM: this.selected_from_date,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
      TRANS_TYPE: 'ADJUSTMENT',
    };

    // API CALL HERE
    this.dataService.Fetch_StockMovement_Details(payload).subscribe((res) => {
      this.adjustedDetails = res.data || [];
    });
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
      case 'grn':
        return 'Grn Details';
      case 'purchReturn':
        return 'Purch Return Details';
      case 'salesInvoice':
        return 'Sales Invoice Details';
      case 'saleReturn':
        return 'Sale Return Details';
      case 'adjusted':
        return 'Stock Adjustment Details';
      default:
        return '';
    }
  }

  onPopupRowClick(e: any, type: string) {
    const row = e.data;
    const id = row.ID;
    const status = row.STATUS;

    if (!id) return;

    this.isEditProductionPopupVisible = false;

    let api$: any | undefined;
    const productionId = row.TRANS_ID;
    switch (type) {
      // SAME logic for Production & Consumption
      case 'production':
      case 'consumption': {
        // TYPE: 1 = Article, 2 = Box
        api$ =
          row.PRODUCTION_TYPE === 1
            ? this.dataService.selectProduction(productionId)
            : this.dataService.selectBoxProduction(productionId);
        break;
      }

      // 🔹 GRN → View / Verify popup
      case 'grn': {
        this.selectedGrnId = id;

        this.dataService.selectGrnData(id).subscribe((res: any) => {
          this.selectedRowData = res;

          // Approved → View only
          this.isViewGrnPopupOpened = true;
        });
        break;
      }

      case 'purchReturn': {
        const returnId = row.TRANS_ID; // Purchase Return uses TRANS_ID
        const status = row.TRANS_STATUS; // same as your original logic

        if (!returnId) return;

        // reset popup first
        this.isEditPurchaseReturn = false;

        this.dataService
          .selectPurchaseReturn(returnId)
          .subscribe((response: any) => {
            this.selectedPurchaseReturn = response;
            this.isReadOnlyPurchaseReturn = true;

            // open existing Purchase Return popup
            this.isEditPurchaseReturn = true;
          });

        break;
      }

      case 'delivery': {
        this.selectedDelivery = id; //  Purchase Return uses TRANS_ID
        const status = row.TRANS_STATUS; // same as your original logic

        // reset popup first
        this.isEditDelivery = false;

        this.dataService.selectDeliveryNote(id).subscribe((response: any) => {
          this.selectedDelivery = response.Data;
          this.isReadOnlyDelivery = true;

          //  open existing Purchase Return popup
          this.isEditDelivery = true;
        });

        break;
      }
      case 'saleReturn': {
        const returnId = row.TRANS_ID; // Sale Return uses TRANS_ID
        const status = row.TRANS_STATUS;

        if (!returnId) return;

        // reset popup first
        this.isEditSaleReturn = false;

        this.dataService
          .selectSaleReturn(returnId)
          .subscribe((response: any) => {
            this.selectedSaleReturn = response;
            this.isReadOnlySaleReturn = true;

            // open existing Sale Return popup
            this.isEditSaleReturn = true;
          });

        return; // important → stop further execution
      }

      case 'salesInvoice': {
        const returnId = row.TRANS_ID; //  Sale Return uses TRANS_ID
        const status = row.TRANS_STATUS;

        if (!returnId) return;

        // reset popup first
        this.isEditSaleReturn = false;

        this.dataService.selectInvoice(returnId).subscribe((response: any) => {
          this.selectedInvoice = response.Data;

          // Open view popup
          this.isViewInvoice = true;
        });

        return; // important → stop further execution
      }

      default:
        return;
    }

    api$.subscribe((res: any) => {
      this.selectedProduction = res;
      this.isReadOnlyInvoice = status === '5';

      //  open popup after data is ready
      this.isEditProductionPopupVisible = true;
    });
  }

  handleClose() {
    //  Close main details popup
    this.isPopupVisible = false;
    this.popupType = null;

    //  Production / Consumption
    this.isEditProductionPopupVisible = false;
    this.selectedProduction = null;

    //  GRN view
    this.isViewGrnPopupOpened = false;
    this.selectedRowData = null;
    this.selectedGrnId = null;

    // Purchase Return
    this.isEditPurchaseReturn = false;
    this.selectedPurchaseReturn = null;
    this.isReadOnlyPurchaseReturn = false;

    //  Sale Return
    this.isEditSaleReturn = false;
    this.selectedSaleReturn = null;
    this.isReadOnlySaleReturn = false;

    // Debit note
    this.isEditDelivery = false;
    this.selectedDelivery = null;
    this.isReadOnlyDelivery = false;

    //  Invoice View
    this.isViewInvoice = false;
    this.selectedInvoice = null;

    // Optional: reset common flags
    this.isReadOnlyInvoice = false;
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
    ProductionJvAddModule,
    ProductionJvViewModule,
    BoxproductionJvAddModule,
    GrnViewFormModule,
    PurchaseReturnDebitFormModule,
    SaleReturnFormModule,
    DeliveryNoteFormModule,
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [StockMovementReportComponent],
  exports: [StockMovementReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockMovementReportModule {}
