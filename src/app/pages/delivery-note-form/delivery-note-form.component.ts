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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  logoBase64: string;
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
    IS_APPROVED: false,
    Details: [
      {
        ITEM_ID: 0,
        UOM: '',
        QUANTITY: 0,
      },
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
  insideCustomers: any;
  outsideCustomers: any;
  customerList: any;
  itemsList: any;
  itemsDescriptionList: {
    store: { type: string; data: any; key: string };
    paginate: boolean;
    pageSize: number;
  };
  selectedCompany: any;
  vatTitle: any;
  selectedCompanyId: any;
  distributorList: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;

    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompany = userData?.SELECTED_COMPANY;
      this.vatTitle = userData.GeneralSettings.VAT_TITLE;
      if (this.selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = this.selectedCompany.COMPANY_ID;
        this.deliveryFormData.COMPANY_ID = this.selectedCompanyId;
      }

      if (userData.USER_ID) {
        this.deliveryFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.deliveryFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getStoreDropdown();

    this.sessionData_tax();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getDeliveryNo();
    this.getItemsofDelivery();
    this.getItemsDescription();
    this.getOutsideCustomerList();
    this.getCustomerOrUnitLst();
    this.getPendingNo();

    if (
      !this.isEditing &&
      (!this.deliveryFormData.Details ||
        this.deliveryFormData.Details.length === 0)
    ) {
      this.addEmptyRow();
    }

    const imagePath = 'assets/markLogo.jpg';

    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
  }



  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  getPendingNo() {
    const payload = {
      TRANS_TYPE: 23,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.deliveryFormData.DN_NO = response.DOC_NO;
    });
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;

    this.deliveryFormData = {
      ID: data.ID,
      COMPANY_ID: data.COMPANY_ID || this.companyID,
      STORE_ID: data.STORE_ID || this.selectedStoreId,
      DN_DATE: data.DN_DATE ? new Date(data.DN_DATE) : new Date(),
      REF_NO: data.REF_NO || '',
      DISTRIBUTOR_ID: data.CUST_ID || 0,
      CONTACT_NAME: data.CONTACT_NAME || '',
      CONTACT_PHONE: data.CONTACT_PHONE || '',
      CONTACT_FAX: data.CONTACT_FAX || '',
      CONTACT_MOBILE: data.CONTACT_MOBILE || '',
      SALESMAN_ID: data.SALESMAN_ID || 0,
      FIN_ID: data.FIN_ID || this.finID,
      TOTAL_QTY: data.TOTAL_QTY || 0,
      USER_ID: data.USER_ID || this.userID,
      NARRATION: data.NARRATION || '',
      DN_TYPE: data.DN_TYPE,
      DN_NO: data.DN_NO,
      COMPANY_NAME: data.COMPANY_NAME,



Details: (data.Details || []).map((row: any) => ({
  ...row,
  ITEM_ID: row.ITEM_ID,
  ITEM_CODE: row.ITEM_ID
})),
    };

    this.selectedCustomerId = this.deliveryFormData.CUST_ID;

    this.updateTotalQty();
  }

  addNewRow() {
    this.deliveryFormData.Details.push({
      ITEM_ID: 0,
      ITEM_CODE: '',
      DESCRIPTION: '',
      UOM: '',
      QTY_STOCK: 0,
      PAIR_QTY: 0,
  TOTAL_PAIR_QTY: 0,
      QUANTITY: 0,
    });

    const grid = this.itemsGridRef.instance;

    grid.refresh();

    setTimeout(() => {
      const rowIndex = this.deliveryFormData.Details.length - 1;

      grid.editCell(rowIndex, 'ITEM_CODE');

      setTimeout(() => {
        const cell = grid.getCellElement(rowIndex, 'ITEM_CODE');
        const input = cell?.querySelector('input') as HTMLInputElement;

        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
    }, 100);
  }

  addEmptyRow() {
    this.deliveryFormData.Details = [
      {
        ITEM_ID: 0,
        ITEM_CODE: '',
        DESCRIPTION: '',
        UOM: '',
        QTY_STOCK: 0,
        PAIR_QTY: 0,
  TOTAL_PAIR_QTY: 0,
        QUANTITY: 0,
      },
    ];
  }

  reindexDetails() {}

  onInitNewRow(e: any) {
    if (this.isEditing) return;

    e.data = {
      ITEM_CODE: '',
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: 0,
    };
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

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }

  typeChanged(e: any) {
    const selectedType = e.value;

    this.deliveryFormData.DN_TYPE = selectedType;

    if (selectedType === 1) {
      this.getInsideCustomerList();
    } else if (selectedType === 2) {
      this.getOutsideCustomerList();
    }

    this.deliveryFormData.CUST_ID = null;
  }

  getInsideCustomerList() {
    this.dataService
      .getDropdownData('INSIDE_CUSTOMER')
      .subscribe((response: any) => {
        this.customerList = response;
      });
  }

  getItemsofDelivery() {
    const payload = {
      name: 'ITEMS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.itemsList = {
        store: {
          type: 'array',
          data: response,
          key: 'ID',
        },
        paginate: true,
        pageSize: 50,
      };
      if (this.isEditing) {
        this.isEditDataAvailable();
      }
    });
  }

  getItemsDescription() {
    const payload = {
      name: 'GetItemDesc',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.itemsDescriptionList = {
        store: {
          type: 'array',
          data: response,
          key: 'ID',
        },
        paginate: true,
        pageSize: 50,
      };
    });
  }

  getItemsData(itemId: any, rowData: any) {
    const payload = {
      ITEM_ID: itemId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getItemsDataofDeliveryNote(payload)
      .subscribe((response: any) => {
        const data = response?.Data?.[0];
        console.log(data, 'deliverynoteeeeeeeeeeeeeee');
        if (!data) return;

        const grid = this.itemsGridRef.instance;

        const visibleRows = grid.getVisibleRows();
        const rowIndex = visibleRows.findIndex((r: any) => r.data === rowData);

        if (rowIndex === -1) return;

        grid.cellValue(rowIndex, 'ITEM_ID', data.ITEM_ID);
        grid.cellValue(rowIndex, 'ITEM_CODE', data.ITEM_ID);
        grid.cellValue(rowIndex, 'DESCRIPTION', data.DESCRIPTION);
        grid.cellValue(rowIndex, 'UOM', data.UOM);
        grid.cellValue(rowIndex, 'QTY_STOCK', data.QTY_STOCK);
        grid.cellValue(rowIndex, 'PAIR_QTY', data.PAIR_QTY);
grid.cellValue(rowIndex, 'TOTAL_PAIR_QTY', data.TOTAL_PAIR_QTY);

        grid.cellValue(rowIndex, 'QUANTITY', data.QUANTITY);

        setTimeout(() => {
          grid.repaintRows([rowIndex]);

          setTimeout(() => {
            grid.editCell(rowIndex, 'QUANTITY');

            setTimeout(() => {
              const cell = grid.getCellElement(rowIndex, 'QUANTITY');
              const input = cell?.querySelector('input');

              if (input) {
                input.focus();
                input.select();
              }
            }, 50);
          }, 50);
        }, 50);
      });
  }

  getOutsideCustomerList() {
    this.dataService
      .getDropdownData('OUTSIDE_CUSTOMER')
      .subscribe((response: any) => {
        this.customerList = response;
      });
  }

  getStoreDropdown() {
    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.stores = response.filter(
        (store: any) => store.ID !== this.storeFromSession,
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

    if (selectedRows.length === 0) {
      alert('Please select at least one sales order.');
      return;
    }

    this.deliveryFormData.Details = selectedRows.map((row: any) => ({
      ID: row.ID,
      BRAND: row.BRAND || '',
      ART_NO: row.ART_NO || '',
      PACKING: row.PACKING || '',
      REMARKS: row.REMARKS || '',
      ARTICLE_TYPE: row.ARTICLE_TYPE || '',
      COLOR: row.COLOR || '',
      CATEGORY: row.CATEGORY || '',
      QUANTITY: row.QUANTITY || 0,
      SO_DETAIL_ID: row.SO_DETAIL_ID || 0,
      PACKING_ID: row.PACKING_ID || 0,
    }));


    this.itemsGridRef.instance.refresh();

    this.salesOrderPopupOpened = false;
  }

  getItemsList() {
    const payload = {
      STORE_ID: this.selectedStoreId,
    };
    this.dataService
      .getItemDetailsForTrInInventory(payload)
      .subscribe((response: any) => {
        this.items = response.data;
      });
  }

  onStoreChange(e: any) {
    this.selectedStoreId = e.value;
    this.getItemsList();
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'UOM' ||
      e.dataField === 'QTY_STOCK' ||
      e.dataField === 'QUANTITY'
    ) {
      e.editorOptions = e.editorOptions || {};

      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );

          setTimeout(() => {
          }, 50);
        }
      };
    }

    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'QUANTITY' ||
      e.dataField === 'DISC_PERC'
    ) {
      e.editorOptions = e.editorOptions || {};

      const grid = this.itemsGridRef?.instance;

      if (e.dataField === 'ITEM_CODE' || e.dataField === 'DESCRIPTION') {
        e.editorName = 'dxSelectBox';

        e.editorOptions.dataSource =
          e.dataField === 'ITEM_CODE'
            ? this.itemsList
            : this.itemsDescriptionList;

        e.editorOptions.displayExpr = 'DESCRIPTION';

        e.editorOptions.valueExpr =
          e.dataField === 'ITEM_CODE' ? 'ID' : 'DESCRIPTION';

        e.editorOptions.searchEnabled = true;

        e.editorOptions.onValueChanged = (args: any) => {
          console.log('Selected Value :', args.value);

          if (!args.value) {
            return;
          }

          if (e.dataField === 'ITEM_CODE') {
            this.getItemsData(args.value, e.row.data);
          } else {
            const item = this.itemsDescriptionList.store.data.find(
              (x: any) => x.DESCRIPTION === args.value,
            );

            if (item) {
              this.getItemsData(item.ID, e.row.data);
            }
          }
        };
      }

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key !== 'Enter') return;

        const visibleRows = grid.getVisibleRows();
        const rowIndex = visibleRows.findIndex(
          (r: any) => r.data === e.row.data,
        );

        const editor = event.component;

        if (e.editorName === 'dxSelectBox') {
          event.event.preventDefault();

          if (!editor.option('opened')) {
            editor.open();
          } else {
            const selectedItem = editor.option('selectedItem');

            if (selectedItem) {
              editor.option('value', selectedItem.ID);

              this.getItemsData(selectedItem.ID, e.row.data);
            }

            setTimeout(() => {
              editor.close();

              if (e.dataField === 'ITEM_CODE') {
                grid.editCell(rowIndex, 'QUANTITY');
              }
            }, 100);
          }

          return;
        }

        if (e.dataField === 'QUANTITY') {
          event.event.preventDefault();

          const input = event.event.target as HTMLInputElement;
          const value = Number(input.value);

          e.setValue(value);

          grid.saveEditData();

          setTimeout(() => {
            const visibleRows = grid.getVisibleRows();
            const rowIndex = e.row.rowIndex;
            const isLastRow = rowIndex === visibleRows.length - 1;

            if (isLastRow) {
              this.deliveryFormData.Details.push({
                ITEM_ID: 0,
                ITEM_CODE: '',
                DESCRIPTION: '',
                UOM: '',
                QTY_STOCK: 0,
                QUANTITY: 0,
              });

              grid.refresh();

              setTimeout(() => {
                const newRowIndex = this.deliveryFormData.Details.length - 1;

                grid.editCell(newRowIndex, 'ITEM_CODE');

                setTimeout(() => {
                  const cell = grid.getCellElement(newRowIndex, 'ITEM_CODE');
                  const input = cell?.querySelector('input');

                  input?.focus();
                  input?.select();
                }, 50);
              }, 100);
            } else {
              grid.editCell(rowIndex + 1, 'ITEM_CODE');
            }
          }, 50);

          return;
        }

        if (e.dataField === 'DISC_PERC') {
          event.event.preventDefault();

          const grid = this.itemsGridRef.instance;
          const rowIndex = e.row.rowIndex;

          const input = event.event.target as HTMLInputElement;
          const value = Number(input.value);

          e.setValue(value);

          grid.saveEditData();

          setTimeout(() => {
            const visibleRows = grid.getVisibleRows();
            const isLastRow = rowIndex === visibleRows.length - 1;

            if (isLastRow) {

              setTimeout(() => {
                const newRowIndex = this.deliveryFormData.Details.length - 1;

                grid.editCell(newRowIndex, 'ITEM_CODE');

                setTimeout(() => {
                  const cell = grid.getCellElement(newRowIndex, 'ITEM_CODE');
                  const input = cell?.querySelector('input');
                  input?.focus();
                  input?.select();
                }, 50);
              }, 100);
            } else {
              grid.editCell(rowIndex + 1, 'ITEM_CODE');
            }
          }, 50);

          return;
        }
      };
    }
  }

  onAddItems() {}

  validateQtyReceived = (e: any) => {
    const issued = e.data?.QUANTITY_ISSUED || 0;
    const received = e.value || 0;
    return received <= issued;
  };
  onRowUpdated(e: any) {
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
    console.log('Cell Changed', e);
    if (e.dataField === 'ITEM_CODE') {
      this.getItemsData(e.value, e.data);
      return;
    }

    if (e.dataField === 'DESCRIPTION') {
      const item = this.itemsDescriptionList.store.data.find(
        (x: any) => x.DESCRIPTION === e.value,
      );

      if (item) {
        this.getItemsData(item.ID, e.data);
      }
      return;
    }

    if (e.column.dataField === 'DELIVERED_QUANTITY') {
      e.component.validate();
      this.updateTotalQty();
    }
  }

  updateTotalQty() {
    this.deliveryFormData.TOTAL_QTY = this.deliveryFormData.Details.reduce(
      (sum: number, item: any) => sum + (Number(item.DELIVERED_QUANTITY) || 0),
      0,
    );
  }

  handleClose() {}

  cancel() {
    this.popupClosed.emit();
  }

  validateQuantity = (e: any): boolean => {
    const quantity = Number(e.value || 0);
    const stockQty = Number(e.data?.QTY_STOCK || 0);

    return quantity <= stockQty;
  };

  saveDeliveryNote() {
    this.deliveryFormData.CUST_ID = this.deliveryFormData.DISTRIBUTOR_ID;
    if (!this.deliveryFormData.CUST_ID || this.deliveryFormData.CUST_ID === 0) {
      notify('Please select a customer.', 'warning', 3000);
      return;
    }

    if (
      !this.deliveryFormData.Details ||
      this.deliveryFormData.Details.length === 0
    ) {
      notify('Please add at least one item.', 'warning', 3000);
      return;
    }

    let isValid = true;

    this.deliveryFormData.Details.forEach((item: any, index: number) => {
      if (!item.ITEM_ID || item.ITEM_ID === 0) {
        notify(`Row ${index + 1}: Please select an item.`, 'warning', 3000);
        isValid = false;
        return;
      }

      if (!item.QUANTITY || Number(item.QUANTITY) <= 0) {
        notify(
          `Row ${index + 1}: Quantity should be greater than zero.`,
          'warning',
          3000,
        );
        isValid = false;
        return;
      }
    });

    if (!isValid) {
      return;
    }


    const formatDate = (date: any): string => {
      if (!date) return '';

      const d = new Date(date);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };
    this.deliveryFormData.TOTAL_QTY = this.deliveryFormData.Details.reduce(
      (total: number, item: any) => total + (Number(item.QUANTITY) || 0),
      0,
    );
    const payload: any = {
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: this.storeFromSession,
      DN_DATE: formatDate(this.deliveryFormData.DN_DATE),
      REF_NO: this.deliveryFormData.REF_NO,
      CUST_ID: this.deliveryFormData.CUST_ID,
      CONTACT_NAME: this.deliveryFormData.CONTACT_NAME,
      CONTACT_PHONE: this.deliveryFormData.CONTACT_PHONE,
      CONTACT_FAX: this.deliveryFormData.CONTACT_FAX,
      CONTACT_MOBILE: this.deliveryFormData.CONTACT_MOBILE,
      SALESMAN_ID: this.deliveryFormData.SALESMAN_ID,
      FIN_ID: this.finID,
      TOTAL_QTY: this.deliveryFormData.TOTAL_QTY,
      USER_ID: this.userID,
      NARRATION: this.deliveryFormData.NARRATION,
      IS_APPROVED: this.deliveryFormData.IS_APPROVED,

      Details: this.deliveryFormData.Details.map((item: any) => ({
        ITEM_ID: item.ITEM_ID,
        UOM: item.UOM,
        QUANTITY: Number(item.QUANTITY) || 0,
      })),
    };

    if (this.isEditing && this.deliveryFormData.ID) {
      payload.ID = this.deliveryFormData.ID;
    }

    if (this.isEditing) {
      if (this.deliveryFormData.IS_APPROVED) {
        confirm(
          'Are you sure you want to approve this Delivery Note?',
          'Confirm Approval',
        ).then((dialogResult: boolean) => {
          if (!dialogResult) return;

          this.dataService.approveDeliveryNote(payload).subscribe({
            next: () => {
              notify('Delivery Note Approved!', 'success', 2000);
              this.popupClosed.emit();
            },
            error: () => {
              notify('Approval failed!', 'error', 3000);
            },
          });
        });
      } else {
        this.dataService.updateDeliveryNote(payload).subscribe({
          next: () => {
            notify('Delivery Note Updated!', 'success', 2000);
            this.popupClosed.emit();
          },
          error: () => {
            notify('Update failed!', 'error', 3000);
          },
        });
      }
    }

    else {
      const saveData = () => {
        this.dataService.saveDeliveryNote(payload).subscribe({
          next: () => {
            notify(
              this.deliveryFormData.IS_APPROVED
                ? 'Delivery Note Saved & Approved!'
                : 'Delivery Note Saved!',
              'success',
              2000,
            );

            this.popupClosed.emit();
          },
          error: () => {
            notify('Save failed!', 'error', 3000);
          },
        });
      };

      if (this.deliveryFormData.IS_APPROVED) {
        confirm(
          'Are you sure you want to save this Delivery Note as Approved?',
          'Confirm Save',
        ).then((dialogResult: boolean) => {
          if (dialogResult) {
            saveData();
          }
        });
      } else {
        saveData();
      }
    }
  }

  openPDF() {
    const returnId = this.EditingResponseData.ID;
    this.dataService.selectDeliveryNote(returnId).subscribe((res: any) => {
      this.generatePDF(res.Data);
    });
  }

  generatePDF(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10;

    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    const leftEdge = 10 + logoW;
    const rightEdge = pageWidth - 80;
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('DELIVERY NOTE', centerX, y + 25, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const refX = pageWidth - 65;

    doc.text(`Invoice No : ${''}`, refX, y + 5);
    doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
    doc.text(`Date: ${data.DN_DATE || ''}`, refX, y + 17);


    y += 33;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);

    y += 5;

    const blueX = 10;
    const blueY = y;
    const blueW = 100;
    const blueH = 38;

    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME || '', blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.ADDRESS1 || '', blueX + 3, blueY + 13);
    doc.text(data.ADDRESS2 || '', blueX + 3, blueY + 18);
    doc.text(data.ADDRESS3 || '', blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN: ${data.GSTIN || ''}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data.STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      blueX + 3,
      blueY + 33,
    );
    doc.text(`E-Mail : ${data.EMAIL || ''}`, blueX + 3, blueY + 38);

    const shipX = 115;
    const shipY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship to)', shipX, shipY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.CUSTOMER_NAME || '', shipX, shipY + 11);
    doc.text(data.CUST_ADDRESS1 || '', shipX, shipY + 16);
    doc.text(data.CUST_ADDRESS2 || '', shipX, shipY + 21);
    doc.text(data.CUST_ADDRESS3 || '', shipX, shipY + 26);
    doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, shipX, shipY + 31);
    doc.text(
      `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      shipX,
      shipY + 36,
    );

    y += 48;

    const billX = 115;
    const billY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', billX, billY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.CUSTOMER_NAME || '', billX, billY + 11);
    doc.text(data.CUST_ADDRESS1 || '', billX, billY + 16);
    doc.text(data.CUST_ADDRESS2 || '', billX, billY + 21);
    doc.text(data.CUST_ADDRESS3 || '', billX, billY + 26);
    doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, billX, billY + 31);
    doc.text(
      `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      billX,
      billY + 36,
    );

    y += 50;

    const tableColumns = ['Item Code', 'Description', 'UOM', 'Quantity'];

    const totalQty = data.Details.reduce(
      (sum: number, item: any) => sum + Number(item.QUANTITY || 0),
      0,
    );

    const tableRows: any[] = [];
    const footerRow = ['', '', '', '₹ ' + totalQty.toFixed(2)];

    data.Details.forEach((item: any, index: number) => {
      tableRows.push([
        item.ITEM_CODE || '',
        item.DESCRIPTION || '',
        item.UOM || '',
        item.QUANTITY?.toFixed(2) || '',
      ]);
    });
    y = y + 2;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);

    y += 5;
    (doc as any).autoTable({
      startY: y,
      head: [tableColumns],
      body: tableRows,
      foot: [footerRow],
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        halign: 'center',
      },
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        5: { halign: 'right' },
        9: { halign: 'right' },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;


    const footStartY = y + 3;

    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 55, ly);
    doc.text('Total Tax Amount', lx + 95, ly);

    doc.setFontSize(8);
    doc.text('Rate', lx + 55, ly + 5);
    doc.text('Amount', lx + 72, ly + 5);

    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data.GROSS_AMOUNT || 0);
    const gstAmount = Number(data.TAX_AMOUNT || 0);
    const gstPerc =
      Number(data.Details?.CGST || 0) + Number(data.Details?.SGST || 0);

    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 55, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(Number(data.NET_AMOUNT).toFixed(2), valueX, ry);

    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text('No', 150, wordsY);

    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `INR ${numberToWordsIndianNumber(Math.floor(data.NET_AMOUNT))} Rupees Only`,
      60,
      wordsY,
    );

    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.REF_NO || '', 40, blockY);
    doc.output('dataurlnewwindow');
  }
}

function numberToWordsIndianNumber(num: number) {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (num === 0) return 'Zero';

  let str = '';

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }

  return str.trim();
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
