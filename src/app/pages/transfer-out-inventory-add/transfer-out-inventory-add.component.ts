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
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferOutInventoryComponent } from '../transfer-out-inventory/transfer-out-inventory.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-transfer-out-inventory-add',
  templateUrl: './transfer-out-inventory-add.component.html',
  styleUrls: ['./transfer-out-inventory-add.component.scss'],
})
export class TransferOutInventoryAddComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  isApproved: boolean = false;
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
  items: any[] = [];
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
  transferOutFormData: any = {
    COMPANY_ID: '',
    STORE_ID: '',
    TRANSFER_DATE: new Date(),
    DEST_STORE_ID: '',
    NET_AMOUNT: '',
    FIN_ID: '',
    USER_ID: '',
    NARRATION: '',
    REASON_ID: '',
    DETAILS: [], // <-- start empty
  };
  userID: any;
  finID: any;
  companyID: any;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.isEditDataAvailable();

    this.getTransferNo(); // always fetch fresh number when popup opens

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/transfer-out-inventory');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      this.getItemsList();
    } else {
      this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();
  }
  // ngOnChanges(changes: SimpleChanges) {
  //   if (
  //     changes['EditingResponseData'] &&
  //     this.isEditing &&
  //     this.EditingResponseData
  //   ) {
  //     console.log('✅ EditingResponseData received:', this.EditingResponseData);
  //   }
  // }

  onRowInserted(e: any) {
    // Assign SL_NO as the row count
    e.data.SL_NO = this.transferOutFormData.DETAILS.length;

    // Re-index all rows to keep SL_NO in sequence
    this.transferOutFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;

    this.transferOutFormData = {
      ID: data.ID,
      TRANSFER_DATE: data.TRANSFER_DATE ? new Date(data.TRANSFER_DATE) : null,
      DEST_STORE_ID: data.DEST_STORE_ID,
      REASON_ID: data.REASON_ID,
      DETAILS: data.DETAILS ? [...data.DETAILS] : [],
      NARRATION: data.NARRATION || '',
      NET_AMOUNT: data.NET_AMOUNT,
    };

    console.log('Bound transferOutFormData:', this.transferOutFormData);
  }

  getMatrixListDropdown() {
    this.barcodeList = new CustomStore({
      key: 'ID',
      load: (loadOptions: any) => {
        return this.dataService.getDropdownData('MATRIX').toPromise();
      },
    });
  }
  getItemsListDropdown() {
    this.barcodeList = new CustomStore({
      key: 'ID',
      load: (loadOptions: any) => {
        return this.dataService.getDropdownData('ITEMS').toPromise();
      },
    });
  }

  getStoreDropdown() {
    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.stores = response.filter(
        (store: any) => store.ID !== this.storeFromSession
      );
    });
  }

  getReasonsDropdown() {
    this.dataService.getDropdownData('REASON').subscribe((response: any) => {
      this.reasons = response;
    });
  }

  getItemsList() {
    const payload = {
      STORE_ID: this.storeFromSession,
    };
    this.dataService
      .getItemDetailsForInventory(payload)
      .subscribe((response: any) => {
        this.items = response.Data;
        console.log(response, 'RESPONSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
      });
  }

  onAddItems() {
    this.isPopupVisible = true; // open popup
  }

  onPopupHiding() {}

  onSelectItems() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (selectedRows && selectedRows.length > 0) {
      // 🔥 remove any empty placeholder rows
      this.transferOutFormData.DETAILS =
        this.transferOutFormData.DETAILS.filter(
          (item) => item.BARCODE !== '' && item.DESCRIPTION !== ''
        );

      selectedRows.forEach((row) => {
        const exists = this.transferOutFormData.DETAILS.some(
          (item) => item.BARCODE === row.BARCODE
        );
        if (!exists) {
          this.transferOutFormData.DETAILS.push({
            SL_NO: this.transferOutFormData.DETAILS.length + 1,
            ITEM_ID: row.ID,
            BARCODE: row.BARCODE,
            DESCRIPTION: row.DESCRIPTION,
            UOM: row.UOM,
            COST: row.COST,
            QUANTITY_AVAILABLE: row.QUANTITY_AVAILABLE,
            QUANTITY: 0,
          });
        }
      });

      this.transferOutFormData.DETAILS = [...this.transferOutFormData.DETAILS];
      this.popupGridRef.instance.clearSelection();
      this.isPopupVisible = false;
    }
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'QUANTITY' && e.parentType === 'dataRow') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value); // commit to grid

        // update net amount using current value + grid data
        this.updateNetAmount(e.row.rowIndex, args.value);
      };
    }

    if (e.parentType === 'dataRow' && e.dataField === 'QUANTITY') {
      e.editorOptions.focusStateEnabled = true; // allow focus
      setTimeout(() => {
        e.component.focus(e.row.rowIndex, e.column.index); // move cursor inside cell
      });
    }
  }

  onEditorPrepared(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'QUANTITY') {
      setTimeout(() => {
        e.editorElement.querySelector('input')?.focus(); // 👈 focus actual input
      });
    }
  }

  updateNetAmount(editingRowIndex?: number, newValue?: number) {
    this.transferOutFormData.NET_AMOUNT =
      this.transferOutFormData.DETAILS.reduce(
        (sum: number, item: any, idx: number) => {
          let qty =
            idx === editingRowIndex
              ? Number(newValue) || 0
              : Number(item.QUANTITY) || 0;
          return sum + (Number(item.COST) || 0) * qty;
        },
        0
      );
  }

  onSummaryCalculate(e: any) {
    if (e.name === 'netAmount') {
      if (e.summaryProcess === 'start') {
        e.totalValue = 0;
      }
      if (e.summaryProcess === 'calculate') {
        const cost = e.value.COST || 0;
        const qty = e.value.QUANTITY || 0;
        e.totalValue += cost * qty;
      }
      if (e.summaryProcess === 'finalize') {
        // Update textbox binding
        this.transferOutFormData.NET_AMOUNT = e.totalValue;
      }
    }
  }

  // updateNetAmount(e: any) {
  //   // find the summary for UNIT_COST
  //   const netCostSummary = e.totalValue?.find(
  //     (s: any) => s.name === 'COST' || s.column === 'COST'
  //   );

  //   if (netCostSummary) {
  //     this.transferOutFormData.NET_AMOUNT = netCostSummary.value;
  //   }
  // }

  getTransferNo() {
    this.dataService.getTransferNo().subscribe({
      next: (res: any) => {
        if (res && res.TRANSFER_NO) {
          this.transferOutFormData.TRANSFER_NO = res.TRANSFER_NO;
          console.log('✅ New Transfer No:', res.TRANSFER_NO);
        }
      },
      error: (err) => {
        console.error('Error fetching next transfer no:', err);
      },
    });
  }
  validateQtyIssued = (e: any) => {
    const available = e.data?.QUANTITY_AVAILABLE || 0;
    const issued = e.value || 0;
    return issued <= available;
  };

  private formatDateLocal(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // ✅ preserves local date
  }

  saveTransferOut() {
    // 1. Validate required fields before saving
    if (!this.transferOutFormData.DEST_STORE_ID) {
      notify('Please select a store to transfer to', 'error');
      return;
    }
    if (!this.transferOutFormData.REASON_ID) {
      notify('Please select a reason', 'error');
      return;
    }
    if (
      !this.transferOutFormData.DETAILS ||
      this.transferOutFormData.DETAILS.length === 0
    ) {
      notify('Please add at least one item', 'error');
      return;
    }

    this.transferOutFormData.NET_AMOUNT =
      this.transferOutFormData.DETAILS.reduce(
        (sum: number, item: any) =>
          sum + (Number(item.COST) || 0) * (Number(item.QUANTITY) || 0),
        0
      );

    // 2. Format payload
    const payload = {
      ...this.transferOutFormData,
      TRANSFER_DATE: this.formatDateLocal(
        this.transferOutFormData.TRANSFER_DATE
      ),
      USER_ID: this.userID,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.storeFromSession,
    };

    console.log('Final payload:', payload);

    // 3. Decide whether to insert or update
    if (this.isApproved) {
      confirm(
        'Are you sure you want to approve this transfer?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          this.dataService.approveTransferOutForInventory(payload).subscribe({
            next: (res: any) => {
              if (res.flag === 1) {
                notify('Transfer approved successfully!', 'success', 3000);
                this.popupClosed.emit();
              } else {
                notify(
                  'Error approving transfer: ' + res.message,
                  'error',
                  3000
                );
              }
            },
            error: (err) => {
              console.error('Approve error:', err);
              notify('Something went wrong while approving.', 'error', 3000);
            },
          });
        }
      });
    } else if (this.isEditing) {
      this.dataService.updateTransferOutForInventory(payload).subscribe({
        next: (res: any) => {
          if (res.flag === 1) {
            notify('Transfer updated successfully!', 'success', 3000);
            this.popupClosed.emit();
          } else {
            notify('Error updating transfer: ' + res.message, 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Update error:', err);
          notify('Something went wrong while updating.', 'error', 3000);
        },
      });
    } else {
      this.dataService.insertTransferOutForInventory(payload).subscribe({
        next: (res: any) => {
          if (res.flag === 1) {
            notify('Transfer saved successfully!', 'success', 3000);
            this.getTransferNo();
            this.popupClosed.emit(); // close/reset
          } else {
            notify('Error saving transfer: ' + res.message, 'error', 3000);
          }
        },
        error: (err) => {
          console.error('Save error:', err);
          notify('Something went wrong while saving.', 'error', 3000);
        },
      });
    }
  }

  // saveTransferOut() {
  //   // 1. Validate required fields before saving
  //   if (!this.transferOutFormData.DEST_STORE_ID) {
  //     notify('Please select a store to transfer to', 'error');
  //     return;
  //   }
  //   if (!this.transferOutFormData.REASON_ID) {
  //     notify('Please select a reason', 'error');
  //     return;
  //   }
  //   if (
  //     !this.transferOutFormData.DETAILS ||
  //     this.transferOutFormData.DETAILS.length === 0
  //   ) {
  //     notify('Please add at least one item', 'error');
  //     return;
  //   }
  //   this.transferOutFormData.NET_AMOUNT =
  //     this.transferOutFormData.DETAILS.reduce(
  //       (sum: number, item: any) => sum + (Number(item.COST) || 0),
  //       0
  //     );
  //   // 2. Format the payload (if needed)
  //   const payload = {
  //     ...this.transferOutFormData,
  //     TRANSFER_DATE: this.transferOutFormData.TRANSFER_DATE
  //       ? new Date(this.transferOutFormData.TRANSFER_DATE)
  //           .toISOString()
  //           .split('T')[0]
  //       : null,
  //     USER_ID: this.userID,
  //     COMPANY_ID: this.companyID,
  //     FIN_ID: this.finID,
  //     STORE_ID: this.storeFromSession,
  //   };

  //   console.log('Final payload:', payload);

  //   // 3. Call your API service
  //   this.dataService.insertTransferOutForInventory(payload).subscribe({
  //     next: (res: any) => {
  //       if (res.flag === 1) {
  //         notify('Transfer saved successfully!', 'success', 3000);
  //         this.getTransferNo();
  //         this.popupClosed.emit(); // close/reset form
  //       } else {
  //         notify('Error saving transfer: ' + res.message, 'error', 3000);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Save error:', err);
  //       notify('Something went wrong while saving.', 'error', 3000);
  //     },
  //   });
  // }

  cancel() {
    this.popupClosed.emit();
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
    AddCreditNoteModule,
    EditCreditNoteModule,
    ViewCreditNoteModule,
  ],
  providers: [],
  declarations: [TransferOutInventoryAddComponent],
  exports: [TransferOutInventoryAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransferOutInventoryAddModule {}
