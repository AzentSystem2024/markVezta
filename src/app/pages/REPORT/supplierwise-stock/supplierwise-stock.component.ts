import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
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
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxTagBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { StockMovementReportComponent } from '../stock-movement-report/stock-movement-report.component';
import { DataService } from '../../../services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-supplierwise-stock',
  templateUrl: './supplierwise-stock.component.html',
  styleUrls: ['./supplierwise-stock.component.scss']
})
export class SupplierwiseStockComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  purchaseReturnList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  sessionData: any;
  selected_vat_id: any;
  companyID: any;
  fin_id: any;
  finID: any;
  storeHint: string = '';

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  stockViewList: any;
  Store: any;
  selectedStoreid: any;
  distributorList: any;
  selectedSupplier: any;
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.fin_id = menuResponse.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }

    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/debit');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getStockViewList();
    this.sessionData_tax();
    this.store_dropdown();
    this.getSupplierOrUnitLst();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || " ");
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.companyID = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(this.companyID)
  }
  refreshGrid() {
    // if (this.dataGrid?.instance) {
    //   this.dataGrid.instance.refresh(); // Or reload data from API if needed
    this.getStockViewList();
    // }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  getSupplierOrUnitLst() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'SUPPLIER',
    };
    this.dataService.Common_Dropdown(payload).subscribe((response: any) => {
      this.distributorList = response;
    });
  }

  onSupplierChange() {
    this.getStockViewList();
  }

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store.filter((x) =>
      this.selectedStoreid.includes(x.ID),
    ).map((x) => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
    this.getStockViewList();
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.companyID,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

  getStockViewList() {
    const payload = {
      FIN_ID: this.finID,
      STORE_ID: this.selectedStoreid?.length
        ? this.selectedStoreid.join(',') // FINAL FIX
        : '',
      SUPP_ID: this.selectedSupplier != null ? Number(this.selectedSupplier) : 0,
    };
    this.stockViewList = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.SupplierwiseStock_Report(payload).subscribe({
            next: (response: any) => {
              const list = response?.Data || [];

              this.stockViewList = list;

              if (list.length === 0) {
                notify({
                  message: 'No data available',
                  type: 'warning',
                  displayTime: 2000,
                  position: {
                    at: 'top center',
                    my: 'top center',
                  },
                });
              }

              resolve(list);
            },
            error: () => {
              this.stockViewList = [];
              resolve([]);
            },
          });
        }),
    });
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
  declarations: [SupplierwiseStockComponent],
  exports: [SupplierwiseStockComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierwiseStockModule { }