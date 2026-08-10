import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
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
  DxDataGridComponent,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';

import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-stock-adjustment-add',
  templateUrl: './stock-adjustment-add.component.html',
  styleUrls: ['./stock-adjustment-add.component.scss'],
})
export class StockAdjustmentAddComponent {
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('validationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() EditingResponseData: any = {};
  @Input() isEditing: boolean = false;
  @Input() status: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isPopupVisible: boolean = false;
  isPopupGridLoading: boolean = false;
  isSaving: boolean = false;
  items: any[] = [];

  deleteRow = (e: any) => {
    const rowData = e.row.data;
    const targetId = rowData.ITEM_ID || rowData.ID;
    const index = this.adjustmentFormData.Details.findIndex(
      (item: any) =>
        (item.ITEM_ID || item.ID) === targetId || item.ITEM_CODE === rowData.ITEM_CODE,
    );
    if (index !== -1) {
      this.adjustmentFormData.Details.splice(index, 1);
      this.adjustmentFormData.Details.forEach((row: any, i: number) => {
        row.SL_NO = i + 1;
      });
      this.adjustmentFormData.Details = [...this.adjustmentFormData.Details];
      this.selectedItemKeys = this.adjustmentFormData.Details.map(
        (item: any) => item.ITEM_ID || item.ID,
      );
    }
  };

  getSaveButtonText(): string {
    if (this.isSaving) {
      return 'Saving...';
    }
    return 'Save';
  }
  // itemsForInventory: any[] = [];
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;

  adjustmentFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    ADJ_NO: '',
    ADJ_DATE: new Date(),
    REASON_ID: 0,
    FIN_ID: 0,
    TRANS_ID: 0,
    CREDIT_HEAD_ID: 0,
    NET_AMOUNT: 0,
    NARRATION: '',
    Details: [],
  };

  userID: any;
  finID: any;
  companyID: any;
  totalAmount: any;
  ENABLE_Matrix_Code: any;
  storename: any;
  hidecost: any;
  IS_HQ_App: boolean = false;
  StoreIDData: any;
  selectedItemKeys: number[] = [];
  Department: any;
  constructor(
    private dataService: DataService,
    private router: Router,
  ) { }
  ngOnInit() {
    this.isEditDataAvailable();
    this.get_item_list_Data();
    // this.getTransferNo(); // always fetch fresh number when popup opens

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.IS_HQ_App = menuResponse.GeneralSettings.IS_HQ_APP;

    this.getStockAdjustNo();
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    this.storename = menuResponse.Configuration[0].STORE_NAME;
    console.log(this.storeFromSession);
    console.log(menuResponse.MenuGroups);
    const packingRights = menuResponse.MenuGroups.flatMap(
      (group) => group.Menus,
    ).find((menu) => menu.Path === '/stock-adjustment');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.hidecost = packingRights.HideCost;
      this.canApprove = packingRights.CanApprove;
    }
    console.log(this.canApprove, '==============');
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.department_dropdown();
    this.getReasonsDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete, this.canApprove);
    // this.items = [];
    // this.addEmptyRow();
    this.ENABLE_Matrix_Code = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;
    console.log(this.ENABLE_Matrix_Code);
  }
  onSelectItems() {
    const selectedRows = this.popupGridRef?.instance?.getSelectedRowsData() || [];
    const selectedItemIds = selectedRows.map((r: any) => r.ITEM_ID || r.ID);

    // 1. Keep items that are currently selected in the popup grid
    const updatedDetails = this.adjustmentFormData.Details.filter((existingItem: any) =>
      selectedItemIds.includes(existingItem.ITEM_ID || existingItem.ID),
    );

    // 2. Add newly selected items from popup
    selectedRows.forEach((row: any) => {
      const rowItemId = row.ITEM_ID || row.ID;
      const exists = updatedDetails.some(
        (item: any) => (item.ITEM_ID || item.ID) === rowItemId,
      );

      if (!exists) {
        let adjQty = 0;
        let amount = 0;

        if (
          row.NEW_QTY !== null &&
          row.NEW_QTY !== undefined &&
          row.NEW_QTY !== ''
        ) {
          adjQty = row.NEW_QTY - (row.STOCK_QTY || 0);
          amount = adjQty * (row.COST || 0);
        }

        const detailItem = {
          SL_NO: updatedDetails.length + 1,
          ITEM_ID: rowItemId,
          ITEM_CODE: row.ITEM_CODE,
          DESCRIPTION: row.DESCRIPTION || row.ITEM_NAME,
          ITEM_NAME: row.ITEM_NAME || row.DESCRIPTION,
          COST: row.COST || 0,
          STOCK_QTY: row.STOCK_QTY || 0,
          NEW_QTY: row.NEW_QTY || null,
          ADJ_QTY: adjQty,
          AMOUNT: amount,
        };

        updatedDetails.push(detailItem);
      }
    });

    // Re-index SL_NO
    updatedDetails.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });

    this.adjustmentFormData.Details = [...updatedDetails];
    this.selectedItemKeys = this.adjustmentFormData.Details.map(
      (item: any) => item.ITEM_ID || item.ID,
    );
    this.isPopupVisible = false;
  }

  department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.companyID,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  getReasonsDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'REASONS',
    };
    console.log(payload);
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.reasons = response;
    });
  }
  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'STORE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      if (this.IS_HQ_App) {
        // 🔹 HQ App → show only store with ID = 1
        this.stores = (response || []).filter((item: any) => item.ID === 1);
        this.adjustmentFormData.STORE_ID = 1;
      } else {
        // 🔹 Not HQ → show all stores
        this.stores = response || [];
        if (this.stores && this.stores.length === 1 && !this.adjustmentFormData.STORE_ID) {
          this.adjustmentFormData.STORE_ID = this.stores[0].ID;
        }
      }
    });
  }

  getStockAdjustNo() {
    const payload = {
      TRANS_TYPE: 49,
      COMPANY_ID: this.companyID,
    };
    this.dataService.getDocNo(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.adjustmentFormData.ADJ_NO = res.DOC_NO;
          console.log('New Transfer No:', res.DOC_NO);
        }
      },
      error: (err) => {
        console.error('Error fetching next transfer no:', err);
      },
    });
  }

  get_item_list_Data() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    console.log(this.storeFromSession);
  }
  cancel() {
    this.popupClosed.emit();
  }

  private storeItemsCache: { [key: string]: any[] } = {};

  onAddItems() {
    const storeId = Number(this.adjustmentFormData.STORE_ID);
    if (!storeId) {
      notify('Please select a Store', 'error');
      return;
    }

    this.isPopupVisible = true;

    if (this.storeItemsCache[storeId]) {
      this.items = this.storeItemsCache[storeId];
      this.selectedItemKeys = this.adjustmentFormData.Details.map(
        (item: any) => item.ITEM_ID,
      );
      return;
    }

    this.isPopupGridLoading = true;

    const payload = {
      STORE_ID: storeId,
    };

    setTimeout(() => {
      this.popupGridRef?.instance.beginCustomLoading('Loading...');

      this.dataService.Get_item_list(payload).subscribe({
        next: (res: any) => {
          let list = res?.Data || [];
          if (Array.isArray(list)) {
            list = [...list].sort((a: any, b: any) => (b.ID || 0) - (a.ID || 0));
          }
          this.storeItemsCache[storeId] = list;
          this.items = list;
          this.selectedItemKeys = this.adjustmentFormData.Details.map(
            (item: any) => item.ITEM_ID,
          );
          this.isPopupGridLoading = false;
          this.popupGridRef?.instance.endCustomLoading();
        },
        error: () => {
          this.isPopupGridLoading = false;
          this.popupGridRef?.instance.endCustomLoading();
          notify('Failed to load items', 'error');
        },
      });
    }, 0);
  }

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.dataField === 'NEW_QTY') {
      const val = e.data?.NEW_QTY;
      if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
        e.cellElement.classList.add('required-qty-cell');
      } else {
        e.cellElement.classList.add('editable-qty-cell');
      }
    }
  }

  onPopupEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.command === 'select') {
      const exists = this.adjustmentFormData.Details.some(
        (item: any) => item.ITEM_ID === e.row.data.ITEM_ID,
      );

      if (exists) {
        e.editorOptions.disabled = true;
      }
    }
  }

  onPopupCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'select') {
      const exists = this.adjustmentFormData.Details.some(
        (item: any) => item.ITEM_ID === e.data.ITEM_ID,
      );

      if (exists) {
        e.cellElement.style.pointerEvents = 'none';
        e.cellElement.style.opacity = '0.5';
      }
    }
  }
  onPopupHiding() { }

  updateNetAmount(event: any) { }

  SaveStockAdjustment() {
    if (!this.adjustmentFormData.STORE_ID) {
      notify('Please select a Store', 'error');
      return;
    }
    if (!this.adjustmentFormData.DEPT_ID) {
      notify('Please select a Department', 'error');
      return;
    }
    if (!this.adjustmentFormData.REASON_ID) {
      notify('Please select a Reason', 'error');
      return;
    }
    if (
      !this.adjustmentFormData.Details ||
      this.adjustmentFormData.Details.length === 0
    ) {
      notify('Please add at least one item', 'error');
      return;
    }

    const invalidIndex = this.adjustmentFormData.Details.findIndex(
      (item: any) =>
        item.NEW_QTY === null ||
        item.NEW_QTY === undefined ||
        item.NEW_QTY === '' ||
        isNaN(Number(item.NEW_QTY)),
    );

    if (invalidIndex !== -1) {
      const invalidItem = this.adjustmentFormData.Details[invalidIndex];
      this.itemsGridRef?.instance?.focus(
        this.itemsGridRef?.instance?.getCellElement(invalidIndex, 'NEW_QTY'),
      );
      this.itemsGridRef?.instance?.editCell(invalidIndex, 'NEW_QTY');
      notify(
        `Please enter New Stock for item: ${invalidItem.DESCRIPTION || invalidItem.ITEM_NAME || invalidItem.ITEM_CODE || ''}`,
        'error',
        3000,
      );
      return;
    }

    const ITEM_Details = this.adjustmentFormData.Details;

    const transformed = ITEM_Details.map((item: any) => ({
      COMPANY_ID: this.companyID,
      STORE_ID: this.adjustmentFormData.STORE_ID,
      ADJ_ID: 0,
      NET_AMOUNT: 0,
      DEPT_ID: this.adjustmentFormData.DEPT_ID,
      REASON_ID: this.adjustmentFormData.REASON_ID,
      ITEM_ID: item.ITEM_ID,
      COST: item.COST,
      STOCK_QTY: item.STOCK_QTY,
      NEW_QTY: Number(item.NEW_QTY),
      ADJ_QTY: item.ADJ_QTY,
      AMOUNT: item.AMOUNT,
      BATCH_NO: '',
      EXPIRY_DATE: new Date().toISOString(),
    }));

    const date = this.formatDate(this.adjustmentFormData.ADJ_DATE);

    const payload = {
      ...this.adjustmentFormData,
      ADJ_DATE: date,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      NET_AMOUNT: this.totalAmount,
      Details: transformed,
    };

    this.isSaving = true;

    this.dataService
      .Insert_Stock_Adjustment_Data(payload)
      .subscribe({
        next: (res: any) => {
          if (res.Flag === '1') {
            notify('Stock Adjustment inserted successfully', 'success', 3000);
            this.popupClosed.emit();
          } else {
            this.isSaving = false;
            notify(res.Message || 'Failed to insert Stock Adjustment', 'error', 3000);
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Save error:', err);
          notify('Something went wrong while saving.', 'error', 3000);
        },
      });
  }
  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
    console.log(data);

    this.adjustmentFormData = {
      ID: data.ID,
      ADJ_DATE: data.ADJ_DATE,
      REASON_ID: data.REASON_ID,
      Details: data.Details ? [...data.Details] : [],
      NARRATION: data.NARRATION || '',
      NET_AMOUNT: data.NET_AMOUNT,
      STORE_ID: data.STORE_ID,
    };
    console.log(this.adjustmentFormData, '================edit==============');
  }
  onEditorPreparing(event: any) {
    if (event.dataField === 'NEW_QTY') {
      event.editorOptions = event.editorOptions || {};

      event.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      event.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      if (event) {
        event.editorOptions.showSpinButtons = false;
      }

      event.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === event.row?.data,
          );

          setTimeout(() => {
            // existing logic untouched
          }, 50);
        }
      };
    }
    const rowData = event.row.data;
    // calculate adj_qty only for this row
    rowData.ADJ_QTY = rowData.NEW_QTY - rowData.STOCK_QTY;
    console.log('Updated row:', rowData);
    rowData.AMOUNT = rowData.ADJ_QTY * rowData.COST;
    rowData.REASON_ID = this.adjustmentFormData.REASON_ID;
    // 🔥 calculate total amount across all rows
    this.totalAmount = this.adjustmentFormData.Details.reduce(
      (sum, item) => sum + (item.AMOUNT || 0),
      0,
    );

    console.log('Updated row:', rowData);
    console.log('Total Amount:', this.totalAmount);
    this.adjustmentFormData.NET_AMOUNT = this.totalAmount;
  }

  onSelectPackAdd(e: any) { }

  onEditPackUpdate(e: any) { }

  onCellValueChanged(e: any) {
    console.log(e, '===============pppppppppp==============  ');

    const row = e.row.data;

    // calculate Adjustment Stock
    row.ADJ_QTY = (row.NEW_QTY || 0) - (row.STOCK_QTY || row.STOCK_QTY || 0);

    // calculate Amount also
    row.AMOUNT = (row.ADJ_QTY || 0) * (row.COST || 0);

    // force UI refresh
    e.component.refresh(true);
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
    FormTextboxModule,
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
  ],
  providers: [],
  declarations: [StockAdjustmentAddComponent],
  exports: [StockAdjustmentAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockAdjustmentAddModule { }