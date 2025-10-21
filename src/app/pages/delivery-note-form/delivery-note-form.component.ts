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
import { Router } from '@angular/router';
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
import { DataService } from 'src/app/services';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-delivery-note-form',
  templateUrl: './delivery-note-form.component.html',
  styleUrls: ['./delivery-note-form.component.scss'],
})
export class DeliveryNoteFormComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
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
  deliveryFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    DN_DATE: new Date(),
    REF_NO: '',
    CUST_ID: 0,
    CONTACT_NAME: '',
    CONTACT_PHONE: '',
    CONTACT_FAX: '',
    CONTACT_MOBILE: '',
    SALESMAN_ID: 0,
    FIN_ID: 0,
    TOTAL_QTY: 0,
    USER_ID: 0,
    NARRATION: '',
    DETAILS: [
      // {
      //   SO_DETAIL_ID: 0,
      //   ITEM_ID: 0,
      //   REMARKS: '',
      //   UOM: '',
      //   QUANTITY: 0,
      // },
    ],
  };

  userID: any;
  finID: any;
  companyID: any;
  selectedStoreId: any;
  salesman: any;
  customer: any;
  sessionData: any;
  selected_vat_id: any;
  matrixCode: any;
  salesOrderList: any;
  salesOrderPopupOpened: boolean;
  addButtonOptions = {
    text: 'Select',
    icon: 'bi bi-box-arrow-in-up',
    type: 'default',
    stylingMode: 'outlined',
    hint: 'Select Sales Order',
    onClick: () => {
      this.ngZone.run(() => {
        this.selectSalesOrder();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  selectedCustomerId: any;
  customerDetails: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.sessionData_tax();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getDeliveryNo();
    this.isEditDataAvailable();
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
    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;
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
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData.Data;
    console.log(data, 'DATAINDELIVERYEDIT');

    this.deliveryFormData = {
      ID: data.ID,
      COMPANY_ID: data.COMPANY_ID || this.companyID,
      STORE_ID: data.STORE_ID || this.selectedStoreId,
      DN_DATE: data.DN_DATE ? new Date(data.DN_DATE) : new Date(),
      REF_NO: data.REF_NO || '',
      CUST_ID: data.CUST_ID || 0,
      CONTACT_NAME: data.CONTACT_NAME || '',
      CONTACT_PHONE: data.CONTACT_PHONE || '',
      CONTACT_FAX: data.CONTACT_FAX || '',
      CONTACT_MOBILE: data.CONTACT_MOBILE || '',
      SALESMAN_ID: data.SALESMAN_ID || 0,
      FIN_ID: data.FIN_ID || this.finID,
      TOTAL_QTY: data.TOTAL_QTY || 0,
      USER_ID: data.USER_ID || this.userID,
      NARRATION: data.NARRATION || '',
      DETAILS: data.DETAILS
        ? data.DETAILS.map((row: any) => ({
            ...row,
            DELIVERED_QUANTITY: row.DELIVERED_QUANTITY || row.QUANTITY || 0,
            SO_DETAIL_ID: row.SO_DETAIL_ID || 0,
          }))
        : [],
    };

    this.selectedCustomerId = this.deliveryFormData.CUST_ID;

    this.reindexDetails();

    console.log('Edit Mode: deliveryFormData loaded:', this.deliveryFormData);
  }

  reindexDetails() {}

  onInitNewRow(e: any) {
    // Prevent auto-adding empty row
    e.cancel = true;
  }

  getSalesmanDropdown() {
    this.dataService.getDropdownData('SALESMAN').subscribe((response: any) => {
      this.salesman = response;
    });
  }

  getCustomerDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.customer = response;
    });
  }

  getStoreDropdown() {
    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.stores = response.filter(
        (store: any) => store.ID !== this.storeFromSession
      );
    });
  }

  customerChanged(event: any) {
    this.selectedCustomerId = event.value;
    this.getCustomerDetails();
    this.getSalesOrderList();
  }

  getCustomerDetails() {
    if (!this.selectedCustomerId) return;
    const payload = { CUST_ID: this.selectedCustomerId };

    this.dataService.getCustomerDetailDeliveryNote(payload).subscribe({
      next: (response: any) => {
        if (response && response.Flag === 1 && response.Data?.length) {
          const details = response.Data[0];

          // Bind API data into your form object
          this.deliveryFormData.CONTACT_NAME = details.CONTACT_NAME;
          this.deliveryFormData.CONTACT_FAX = details.CONTACT_FAX;
          this.deliveryFormData.CONTACT_PHONE = details.CONTACT_PHONE;
          this.deliveryFormData.CONTACT_MOBILE = details.CONTACT_MOBILE;
          this.deliveryFormData.CONTACT_EMAIL = details.CONTACT_EMAIL;
        }
      },
      error: (err) => console.error('API error:', err),
    });
  }

  getSalesOrderList() {
    const payload = {
      CUST_ID: this.selectedCustomerId,
    };
    this.dataService
      .getDalesOrderListForDeliveryNote(payload)
      .subscribe((response: any) => {
        this.salesOrderList = response.Data;
      });
  }

  getDeliveryNo() {
    this.dataService.getTransferNoTrIn().subscribe({
      next: (res: any) => {
        if (res && res.TRANSFER_NO) {
          this.deliveryFormData.TRANSFER_NO = res.TRANSFER_NO;
          console.log('New Transfer No:', res.TRANSFER_NO);
        }
      },
      error: (err) => {
        console.error('Error fetching next transfer no:', err);
      },
    });
  }

  addSalesOrder() {
    this.salesOrderPopupOpened = true;
  }

  selectSalesOrder() {
    const selectedRows = this.quotationGrid.instance.getSelectedRowsData();
    console.log(selectedRows);

    if (selectedRows.length === 0) {
      alert('Please select at least one quotation.');
      return;
    }

    selectedRows.forEach((row) => {
      // Push quotation ID into QTN_ID array (avoid duplicates)
      if (selectedRows.length > 0) {
        this.deliveryFormData.SO_DETAIL_ID = selectedRows[0].SO_DETAIL_ID; // single ID
      }

      // Push details into sales order
      this.deliveryFormData.DETAILS.push({
        ID: row.ID,
        ITEM_ID: row.ITEM_ID || null,
        ITEM_CODE: row.ITEM_CODE || '',
        DESCRIPTION: row.ITEM_NAME || '',
        MATRIX_CODE: row.MATRIX_CODE || '',
        REMARKS: row.REMARKS || '',
        UOM: row.UOM || '',
        QUANTITY: row.QUANTITY || 0,
        SO_DETAIL_ID: row.SO_DETAIL_ID || 0,
      });
    });

    this.itemsGridRef.instance.refresh(); // Refresh main grid
    this.salesOrderPopupOpened = false; // Close popup

    console.log('Selected SO_DETAIL_ID:', this.deliveryFormData.SO_DETAIL_ID);
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

  onStoreChange(e: any) {
    this.selectedStoreId = e.value;
    console.log('Selected Store ID:', this.selectedStoreId);
    this.getItemsList();
  }

  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow') {
      e.editorOptions.height = 30; // fixed editor height
      e.editorOptions.elementAttr = { style: 'height: 30px;' };
    }
  }

  onAddItems() {}

  validateQtyReceived = (e: any) => {
    const issued = e.data?.QUANTITY_ISSUED || 0;
    const received = e.value || 0;
    return received <= issued;
  };
  onRowUpdated(e: any) {
    console.log('Row updated', e);
    this.updateTotalQty();
  }

  validateDeliveredQuantity = (options: any): boolean => {
    const deliveredQty = Number(options.value);
    const quantity = Number(options.data.QUANTITY);

    return deliveredQty <= quantity;
  };

  validateQtyIssued = (options: any) => {
    const delivered = Number(options.value);
    const ordered = Number(options.data.QUANTITY);

    return delivered <= ordered;
  };

  onCellValueChanged(e: any) {
    if (e.column.dataField === 'DELIVERED_QUANTITY') {
      e.component.validate(); // forces inline validation
      this.updateTotalQty();
    }
  }

  updateTotalQty() {
    this.deliveryFormData.TOTAL_QTY = this.deliveryFormData.DETAILS.reduce(
      (sum: number, item: any) => sum + (Number(item.DELIVERED_QUANTITY) || 0),
      0
    );
    console.log('Updated TOTAL_QTY:', this.deliveryFormData.TOTAL_QTY);
  }

  handleClose() {}

  cancel() {
    this.popupClosed.emit();
  }

  saveDeliveryNote() {
    // Basic Validations
    if (!this.selectedCustomerId || this.selectedCustomerId === 0) {
      notify('Please select a customer.', 'warning', 3000);
      return;
    }

    if (!this.deliveryFormData.DETAILS.length) {
      notify('Please add at least one item.', 'warning', 3000);
      return;
    }

    let isValid = true;

    this.deliveryFormData.DETAILS.forEach((item: any, index: number) => {
      if (!item.ITEM_ID) {
        notify(`Row ${index + 1}: Item is required.`, 'warning', 3000);
        isValid = false;
        return;
      }
      if (!item.DELIVERED_QUANTITY || item.DELIVERED_QUANTITY <= 0) {
        notify(`Row ${index + 1}: Delivered Quantity must be greater than 0.`);
        isValid = false;
        return;
      }
      if (item.DELIVERED_QUANTITY > item.QUANTITY) {
        notify(
          `Row ${
            index + 1
          }: Delivered Quantity cannot exceed Ordered Quantity (${
            item.QUANTITY
          }).`
        );
        isValid = false;
        return;
      }
    });

    if (!isValid) return;

    // Prepare Payload
    const payload = {
      ...this.deliveryFormData,
      COMPANY_ID: this.companyID,
      STORE_ID: this.storeFromSession,
      FIN_ID: this.finID,
      USER_ID: this.userID,
      DETAILS: (this.deliveryFormData.DETAILS || []).map((item: any) => ({
        ITEM_ID: item.ITEM_ID,
        ITEM_CODE: item.ITEM_CODE,
        DESCRIPTION: item.DESCRIPTION,
        REMARKS: item.REMARKS,
        UOM: item.UOM,
        QUANTITY: item.QUANTITY || 0,
        DELIVERED_QUANTITY: item.DELIVERED_QUANTITY,
        SO_DETAIL_ID: item.SO_DETAIL_ID || 0,
      })),
    };

    console.log('Final Payload:', payload);
    if (this.isEditing && this.deliveryFormData.ID) {
      payload.ID = this.deliveryFormData.ID;
    }
    // Decide API call based on mode
    if (this.isEditing && this.isApproved) {
      const result = confirm(
        'Are you sure you want to approve this Delivery Note?',
        'Confirm Approval'
      );

      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          // ✅ User clicked "Yes"
          this.dataService.approveDeliveryNote(payload).subscribe({
            next: (res: any) => {
              notify(
                { message: 'Delivery Note Approved!', type: 'success' },
                'success',
                2000
              );
              this.popupClosed.emit();
            },
            error: (err) => {
              console.error('Approval failed:', err);
              notify(
                { message: 'Approval failed!', type: 'error' },
                'error',
                3000
              );
            },
          });
        }
      });
    } else if (this.isEditing) {
      this.dataService.updateDeliveryNote(payload).subscribe({
        next: (res: any) => {
          notify(
            { message: 'Delivery Note Updated!', type: 'success' },
            'success',
            2000
          );
          this.popupClosed.emit();
        },
        error: (err) => {
          console.error('Update failed:', err);
          notify({ message: 'Update failed!', type: 'error' }, 'error', 3000);
        },
      });
    } else {
      this.dataService.saveDeliveryNote(payload).subscribe({
        next: (res: any) => {
          notify(
            { message: 'Delivery Note Saved!', type: 'success' },
            'success',
            2000
          );
          this.popupClosed.emit();
        },
        error: (err) => {
          console.error('Save failed:', err);
          notify({ message: 'Save failed!', type: 'error' }, 'error', 3000);
        },
      });
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
  declarations: [DeliveryNoteFormComponent],
  exports: [DeliveryNoteFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryNoteFormModule {}
