import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
import { confirm } from 'devextreme/ui/dialog';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-stock-adjustment-edit',
  templateUrl: './stock-adjustment-edit.component.html',
  styleUrls: ['./stock-adjustment-edit.component.scss'],
})
export class StockAdjustmentEditComponent {
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() EditingResponseData: any = {};
  @Input() status: any;

  @Output() popupClosed = new EventEmitter<void>();
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
  selectedItemKeys: number[] = [];

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
    if (this.readOnlyTrue || this.selectedStatus === 5) {
      return 'PDF';
    }

    if (this.isSaving) {
      if (this.selectedStatus === 2 || this.approveValue) {
        return 'Committing...';
      }
      return 'Updating...';
    }

    if (this.selectedStatus === 2 || this.approveValue) {
      return 'Update & Commit';
    }
    return 'Update';
  }
  // itemsForInventory: any[] = [];
  readOnlyTrue: boolean = false;
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
    ID: 0,
    COMPANY_ID: 0,

    ADJ_NO: '',
    ADJ_DATE: '',
    REASON_ID: 0,
    FIN_ID: 0,
    NET_AMOUNT: 0,
    NARRATION: '',
    Details: [],
  };

  userID: any;
  finID: any;
  companyID: any;
  totalAmount: any;
  selecte_Date_Details: any;
  approveValue: boolean = false;
  ENABLE_Matrix_Code: any;

  summaryColumnsData = {
    totalItems: [
      {
        column: 'AMOUNT',
        summaryType: 'sum',
        displayFormat: ' Net Amount {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AMOUNT',
        alignment: 'right',
      },
    ],

    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };
  storename: any;
  hidecost: any;
  IS_HQ_App: boolean = false;
  selectedStatus: any;
  StoreIDData: any;
  Department: any;
  constructor(
    private dataService: DataService,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.isEditDataAvailable();
    this.get_item_list_Data();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.IS_HQ_App = menuResponse.GeneralSettings.IS_HQ_APP;

    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    console.log(this.userID, 'USERIDINSTOCKADJ');
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    this.storename = menuResponse.Configuration[0].STORE_NAME;
    console.log(this.storeFromSession);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/stock-adjustment');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.hidecost = packingRights.HideCost;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();
    this.department_dropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();
    this.ENABLE_Matrix_Code = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;
    console.log(this.ENABLE_Matrix_Code);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['EditingResponseData'] &&
      changes['EditingResponseData'].currentValue
    ) {
      this.adjustmentFormData = this.EditingResponseData;
      console.log(this.EditingResponseData);
      console.log(this.adjustmentFormData);
      this.selecte_Date_Details = this.adjustmentFormData.Details;
      this.selectedStatus = this.adjustmentFormData.STATUS;
      const editable = this.adjustmentFormData.STATUS;
      this.selectedStatus = this.adjustmentFormData.STATUS;
      console.log(editable);

      if (this.status === 'viewScreen') {
        this.readOnlyTrue = true;
        this.approveValue = this.adjustmentFormData.STATUS == 5;
      } else {
        this.readOnlyTrue = false;
        this.approveValue = false;
      }
      this.selectedItemKeys = (this.adjustmentFormData.Details || []).map(
        (item: any) => item.ITEM_ID || item.ID,
      );
      this.StoreIDData = this.adjustmentFormData.STORE_ID;

      // this.readOnlyTrue=
      // if (editable == 5) {
      //   this.readOnlyTrue = true;
      //   this.approveValue = true;
      // } else {
      //   this.readOnlyTrue = false;
      //   this.approveValue = false;
      // }
      console.log(this.status);
    }
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
        this.stores = (response || []).filter((item: any) => item.ID === 1);
      } else {
        this.stores = response || [];
        if (this.stores && this.stores.length === 1 && !this.adjustmentFormData.STORE_ID) {
          this.adjustmentFormData.STORE_ID = this.stores[0].ID;
        }
      }
    });
  }

  get_item_list_Data() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
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
      this.selectedItemKeys = (this.adjustmentFormData.Details || []).map(
        (item: any) => item.ITEM_ID || item.ID,
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
          this.selectedItemKeys = (this.adjustmentFormData.Details || []).map(
            (item: any) => item.ITEM_ID || item.ID,
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

  UpdateStockAdjustment() {
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
      ADJ_ID: 0,
      NET_AMOUNT: 0,
      REASON_ID: 0,
      ITEM_ID: item.ITEM_ID,
      COST: item.COST,
      STOCK_QTY: item.STOCK_QTY,
      NEW_QTY: Number(item.NEW_QTY),
      ADJ_QTY: item.ADJ_QTY,
      AMOUNT: item.AMOUNT,
      BATCH_NO: '',
      EXPIRY_DATE: this.selecte_Date_Details?.EXPIRY_DATE || new Date().toISOString(),
    }));

    const payload = {
      ...this.adjustmentFormData,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.adjustmentFormData.STORE_ID,
      DEPT_ID: this.adjustmentFormData.DEPT_ID,
      USER_ID: this.userID,
      Details: transformed,
    };

    this.isSaving = true;

    if (this.selectedStatus == 2 || this.approveValue) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        if (result) {
          this.dataService
            .Approve_Stock_Adjustment_Data(payload)
            .subscribe({
              next: (res: any) => {
                if (res.Flag == '1') {
                  notify('Stock Adjustment approved and committed successfully', 'success', 3000);
                  this.popupClosed.emit();
                } else {
                  this.isSaving = false;
                  notify(res.Message || 'Commit failed', 'error', 3000);
                }
              },
              error: (err: any) => {
                this.isSaving = false;
                console.error('Approve error:', err);
                notify('Something went wrong while approving.', 'error', 3000);
              },
            });
        } else {
          this.isSaving = false;
        }
      });
    } else if (this.status == 'verifyscreen') {
      confirm(
        'It will Verify. Are you sure you want to Verify?',
        'Confirm Verify',
      ).then((result) => {
        if (result) {
          this.dataService
            .Verify_Stock_Adjustment_Data(payload)
            .subscribe({
              next: (res: any) => {
                if (res.Flag == '1') {
                  notify('Stock Adjustment verified successfully', 'success', 3000);
                  this.popupClosed.emit();
                } else {
                  this.isSaving = false;
                  notify(res.Message || 'Verify failed', 'error', 3000);
                }
              },
              error: (err: any) => {
                this.isSaving = false;
                console.error('Verify error:', err);
                notify('Something went wrong while verifying.', 'error', 3000);
              },
            });
        } else {
          this.isSaving = false;
        }
      });
    } else {
      this.dataService
        .Update_Stock_Adjustment_Data(payload)
        .subscribe({
          next: (res: any) => {
            if (res.Flag == '1' || res.Flag == 1) {
              notify('Stock Adjustment updated successfully', 'success', 3000);
              this.popupClosed.emit();
            } else {
              this.isSaving = false;
              notify(res.Message || 'Update failed', 'error', 3000);
            }
          },
          error: (err: any) => {
            this.isSaving = false;
            console.error('Update error:', err);
            notify('Something went wrong while updating.', 'error', 3000);
          },
        });
    }
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

    console.log('Updated row:', rowData);
    if (rowData) {
      rowData.ADJ_QTY = rowData.NEW_QTY - rowData.STOCK_QTY;
      rowData.AMOUNT = rowData.ADJ_QTY * rowData.COST;
      rowData.REASON_ID = this.adjustmentFormData.REASON_ID;
    }
    this.totalAmount = this.adjustmentFormData.Details.reduce(
      (sum, item) => sum + (item.AMOUNT || 0),
      0,
    );
    // this.adjustmentFormData.AMOUNT=this.totalAmount
    console.log('Total Amount:', this.totalAmount);
    this.adjustmentFormData.NET_AMOUNT = this.totalAmount;
  }

  onCellValueChanged(e: any) {
    console.log(e, '===============pppppppppp==============  ');

    const row = e.row.data;

    // calculate Adjustment Stock
    row.ADJ_QTY = (row.NEW_QTY || 0) - (row.STOCK_QTY || row.STOCK_QTY || 0);

    // calculate Amount also
    row.AMOUNT = (row.ADJ_QTY || 0) * (row.COST || 0);

    //  reassign array to trigger Angular + DevExtreme refresh
    this.adjustmentFormData.Details = [...this.adjustmentFormData.Details];
    // force UI refresh
    e.component.refresh(true);
  }

  getButtonText(): string {
    if (this.status == 'Editscreen') {
      return 'Update';
    } else if (this.status == 'verifyscreen') {
      if (this.selectedStatus == 1) {
        return 'Verify';
      } else {
        return 'Approve';
      }
    } else {
      return 'Approve';
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
  declarations: [StockAdjustmentEditComponent],
  exports: [StockAdjustmentEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockAdjustmentEditModule { }