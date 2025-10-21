import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
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
import { TransferOutInventoryAddComponent } from '../transfer-out-inventory-add/transfer-out-inventory-add.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-transfer-in-inventory-form',
  templateUrl: './transfer-in-inventory-form.component.html',
  styleUrls: ['./transfer-in-inventory-form.component.scss'],
})
export class TransferInInventoryFormComponent {
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
  transferInFormData: any = {
    COMPANY_ID: '',
    STORE_ID: '',
    REC_DATE: new Date(),
    ORIGIN_STORE_ID: '',
    ISSUE_ID: '',
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
  selectedStoreId: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

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
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
    this.transferInFormData = {
      ID: data.ID,
      REC_DATE: data.REC_DATE
        ? new Date(data.REC_DATE)
        : data.TRANSFER_DATE
        ? new Date(data.TRANSFER_DATE)
        : null,
      ORIGIN_STORE_ID: data.ORIGIN_STORE_ID,
      REASON_ID: data.REASON_ID,
      DETAILS: data.DETAILS ? [...data.DETAILS] : [],
      NARRATION: data.NARRATION || '',
      NET_AMOUNT: data.NET_AMOUNT,
    };
    this.reindexDetails();
  }

  getTransferNo() {
    this.dataService.getTransferNoTrIn().subscribe({
      next: (res: any) => {
        if (res && res.TRANSFER_NO) {
          this.transferInFormData.TRANSFER_NO = res.TRANSFER_NO;
          console.log('New Transfer No:', res.TRANSFER_NO);
        }
      },
      error: (err) => {
        console.error('Error fetching next transfer no:', err);
      },
    });
  }

  onRowInserted(e: any) {
    // Assign SL_NO as the row count
    e.data.SL_NO = this.transferInFormData.DETAILS.length;

    // Re-index all rows to keep SL_NO in sequence
    this.transferInFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }

  getItemsList() {
    const payload = {
      STORE_ID: this.selectedStoreId,
    };
    this.dataService
      .getItemDetailsForTrInInventory(payload)
      .subscribe((response: any) => {
        this.items = response.data;
        console.log(response, 'RESPONSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
      });
  }
  getStoreDropdown() {
    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.stores = response.filter(
        (store: any) => store.ID !== this.storeFromSession
      );
    });
  }

  onStoreChange(e: any) {
    this.selectedStoreId = e.value;
    console.log('Selected Store ID:', this.selectedStoreId);
    this.getItemsList();
  }

  getReasonsDropdown() {
    this.dataService.getDropdownData('REASON').subscribe((response: any) => {
      this.reasons = response;
    });
  }

  onSelectItems() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (selectedRows && selectedRows.length > 0) {
      this.transferInFormData.DETAILS = this.transferInFormData.DETAILS.filter(
        (item) => item.BARCODE !== '' && item.DESCRIPTION !== ''
      );

      if (!this.transferInFormData.ISSUE_ID && selectedRows[0].ISSUE_ID) {
        this.transferInFormData.ISSUE_ID = selectedRows[0].ISSUE_ID;
      }

      selectedRows.forEach((row) => {
        const exists = this.transferInFormData.DETAILS.some(
          (item) => item.BARCODE === row.BARCODE
        );

        if (!exists) {
          this.transferInFormData.DETAILS.push({
            SL_NO: this.transferInFormData.DETAILS.length + 1,
            ISSUE_DETAIL_ID: row.ISSUE_DETAIL_ID,
            ISSUE_ID: row.ISSUE_ID, // stays in detail too if you need it
            ITEM_ID: row.ITEM_ID,
            BARCODE: row.BARCODE,
            DESCRIPTION: row.DESCRIPTION,
            UOM: row.UOM,
            COST: row.COST,
            QUANTITY_AVAILABLE: row.QUANTITY_AVAILABLE,
            QUANTITY_ISSUED: row.QUANTITY_ISSUED || 0,
            QUANTITY_RECEIVED: 0,
            BATCH_NO: '0',
            EXPIRY_DATE: new Date(),
          });
        }
      });
    }

    this.isPopupVisible = false; // close popup
  }

  onAddItems() {
    this.isPopupVisible = true;
  }
  cancel() {
    this.popupClosed.emit();
  }

  onPopupHiding() {}

  private formatDateLocal(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // onCellPrepared(e: any) {
  //   if (e.rowType === 'data' && e.column.dataField === 'QUANTITY_RECEIVED') {
  //     e.cellElement.style.backgroundColor = '#0f4964ff'; // light yellow
  //     e.cellElement.style.fontWeight = 'bold';
  //   }
  // }

  validateQtyReceived = (e: any) => {
    const issued = e.data?.QUANTITY_ISSUED || 0;
    const received = e.value || 0;
    return received <= issued;
  };

  onEditorPreparing(e: any) {
    if (e.dataField === 'QUANTITY_RECEIVED' && e.parentType === 'dataRow') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value); // commit to grid

        // update net amount using current value + grid data
        this.updateNetAmount(e.row.rowIndex, args.value);
      };
    }

    if (e.parentType === 'dataRow' && e.dataField === 'QUANTITY_RECEIVED') {
      e.editorOptions.focusStateEnabled = true; // allow focus
      setTimeout(() => {
        e.component.focus(e.row.rowIndex, e.column.index); // move cursor inside cell
      });
    }
  }

  onEditorPrepared(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'QUANTITY_RECEIVED') {
      setTimeout(() => {
        e.editorElement.querySelector('input')?.focus(); // 👈 focus actual input
      });
    }
  }

  updateNetAmount(editingRowIndex?: number, newValue?: number) {
    this.transferInFormData.NET_AMOUNT = this.transferInFormData.DETAILS.reduce(
      (sum: number, item: any, idx: number) => {
        let qty =
          idx === editingRowIndex
            ? Number(newValue) || 0
            : Number(item.QUANTITY_RECEIVED) || 0;
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
        const qty = e.value.QUANTITY_RECEIVED || 0;
        e.totalValue += cost * qty;
      }
      if (e.summaryProcess === 'finalize') {
        // Update textbox binding
        this.transferInFormData.NET_AMOUNT = e.totalValue;
      }
    }
  }

  saveTransferIn() {
    // 1. Validate required fields before saving
    if (!this.transferInFormData.ORIGIN_STORE_ID) {
      notify('Please select a store', 'error');
      return;
    }
    if (!this.transferInFormData.REASON_ID) {
      notify('Please select a reason', 'error');
      return;
    }
    if (
      !this.transferInFormData.DETAILS ||
      this.transferInFormData.DETAILS.length === 0
    ) {
      notify('Please add at least one item', 'error');
      return;
    }

    this.transferInFormData.NET_AMOUNT = this.transferInFormData.DETAILS.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.COST) || 0) * (Number(item.QUANTITY_RECEIVED) || 0),
      0
    );

    // 2. Format payload
    const payload = {
      ...this.transferInFormData,
      REC_DATE: this.formatDateLocal(this.transferInFormData.REC_DATE),
      USER_ID: this.userID,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.storeFromSession,
      ISSUE_DETAIL_ID:
        this.transferInFormData.DETAILS.length > 0
          ? this.transferInFormData.DETAILS[0].ISSUE_DETAIL_ID
          : null,
    };

    console.log('Final payload:', payload);

    // 3. Decide whether to insert or update
    if (this.isApproved) {
      confirm(
        'Are you sure you want to approve this transfer?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          this.dataService.approveTransferInForInventory(payload).subscribe({
            next: (res: any) => {
              if (res.Flag === 1) {
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
      this.dataService.updateTransferInForInventory(payload).subscribe({
        next: (res: any) => {
          if (res.Flag === 1) {
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
      this.dataService.insertTransferInForInventory(payload).subscribe({
        next: (res: any) => {
          if (res.Flag === 1) {
            notify('Transfer saved successfully!', 'success', 3000);
            // this.getTransferNo();
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

  private reindexDetails() {
    this.transferInFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
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
  declarations: [TransferInInventoryFormComponent],
  exports: [TransferInInventoryFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransferInInventoryFormModule {}
