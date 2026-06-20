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
    DN_TYPE: 0,
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
  insideCustomers: any;
  outsideCustomers: any;
  customerList: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.sessionData_tax();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getDeliveryNo();
    this.isEditDataAvailable();
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/transfer-out-inventory');
    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();

    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    // this.items = [];
    // this.addEmptyRow();
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

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    // ✅ EditingResponseData IS ALREADY DATA
    const data = this.EditingResponseData;

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
      DN_TYPE: data.DN_TYPE,
      DN_NO: data.DN_NO,
      COMPANY_NAME: data.COMPANY_NAME,

      // ✅ GRID DATA BINDING
      Details: (data.Details || []).map((row: any) => ({
        ...row,
        DELIVERED_QUANTITY: row.DELIVERED_QUANTITY ?? row.QUANTITY ?? 0,
        SO_DETAIL_ID: row.SO_DETAIL_ID ?? 0,
      })),
    };

    this.selectedCustomerId = this.deliveryFormData.CUST_ID;

    this.updateTotalQty();
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

  typeChanged(e: any) {
    const selectedType = e.value;

    // ✔️ Set DN_TYPE based on selected radio
    this.deliveryFormData.DN_TYPE = selectedType;

    if (selectedType === 1) {
      // Transfer Out → Inside Customers
      this.getInsideCustomerList();
    } else if (selectedType === 2) {
      // Delivery Note → Outside Customers
      this.getOutsideCustomerList();
    }

    // Reset customer after type change
    this.deliveryFormData.CUST_ID = null;
  }

  getInsideCustomerList() {
    this.dataService
      .getDropdownData('INSIDE_CUSTOMER')
      .subscribe((response: any) => {
        this.customerList = response;
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

    // Map each selected row into the DETAILS format
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

    // Optionally store all SO_DETAIL_IDs as an array
    // this.deliveryFormData.SO_DETAIL_IDs = selectedRows.map(
    //   (r: any) => r.SO_DETAIL_ID
    // );

    // Refresh main grid after update
    this.itemsGridRef.instance.refresh();

    // Close popup
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
    if (e.dataField === 'DELIVERED_QUANTITY') {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
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
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
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
    if (e.column.dataField === 'DELIVERED_QUANTITY') {
      e.component.validate(); // forces inline validation
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

  saveDeliveryNote() {
    // Basic Validations
    if (!this.selectedCustomerId || this.selectedCustomerId === 0) {
      notify('Please select a customer.', 'warning', 3000);
      return;
    }

    if (!this.deliveryFormData.Details.length) {
      notify('Please add at least one item.', 'warning', 3000);
      return;
    }

    let isValid = true;

    this.deliveryFormData.Details.forEach((item: any, index: number) => {
      if (!item.SO_DETAIL_ID) {
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
          }).`,
        );
        isValid = false;
        return;
      }
    });

    if (!isValid) return;
    const formatDate = (date: any): string => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    };
    // Prepare Payload
    const payload = {
      ...this.deliveryFormData,
      COMPANY_ID: this.companyID,
      STORE_ID: this.storeFromSession,
      FIN_ID: this.finID,
      USER_ID: this.userID,
      DN_DATE: formatDate(this.deliveryFormData.DN_DATE),
      Details: (this.deliveryFormData.Details || []).map((item: any) => ({
        // ITEM_ID: item.ITEM_ID,
        BRAND: item.BRAND,
        ART_NO: item.ART_NO,
        PACKING: item.PACKING,
        ARTICLE_TYPE: item.ARTICLE_TYPE,
        REMARKS: item.REMARKS,
        COLOR: item.COLOR,
        CATEGORY: item.CATEGORY,
        QUANTITY: item.QUANTITY || 0,
        DELIVERED_QUANTITY: item.DELIVERED_QUANTITY,
        SO_DETAIL_ID: item.SO_DETAIL_ID || 0,
        PACKING_ID: item.PACKING_ID || 0,
      })),
    };

    if (this.isEditing && this.deliveryFormData.ID) {
      payload.ID = this.deliveryFormData.ID;
    }
    // Decide API call based on mode
    // Decide API call logic
    if (this.isEditing) {
      // EDIT MODE
      if (this.deliveryFormData.IS_APPROVED) {
        // ✔️ APPROVE existing DN
        const result = confirm(
          'Are you sure you want to approve this Delivery Note?',
          'Confirm Approval',
        );

        result.then((dialogResult: boolean) => {
          if (dialogResult) {
            this.dataService.approveDeliveryNote(payload).subscribe({
              next: () => {
                notify('Delivery Note Approved!', 'success', 2000);
                this.popupClosed.emit();
              },
              error: () => notify('Approval failed!', 'error', 3000),
            });
          }
        });
      } else {
        // ✔️ UPDATE existing DN
        this.dataService.updateDeliveryNote(payload).subscribe({
          next: () => {
            notify('Delivery Note Updated!', 'success', 2000);
            this.popupClosed.emit();
          },
          error: () => notify('Update failed!', 'error', 3000),
        });
      }
    } else {
      // ADD MODE
      if (this.deliveryFormData.IS_APPROVED) {
        // ✔️ Confirm before saving as Approved
        const result = confirm(
          'Are you sure you want to save this Delivery Note as Approved?',
          'Confirm Save',
        );

        result.then((dialogResult: boolean) => {
          if (dialogResult) {
            this.dataService.saveDeliveryNote(payload).subscribe({
              next: () => {
                notify('Delivery Note Saved & Approved!', 'success', 2000);
                this.ngZone.run(() => {
                  this.popupClosed.emit();
                });
              },
              error: () => notify('Save failed!', 'error', 3000),
            });
          }
        });
      } else {
        // ✔️ Save normally without approval
        this.dataService.saveDeliveryNote(payload).subscribe({
          next: () => {
            notify('Delivery Note Saved!', 'success', 2000);
            this.popupClosed.emit();
          },
          error: () => notify('Save failed!', 'error', 3000),
        });
      }
    }
  }

  openPDF() {
    // Call your PDF API or open a URL
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

    // ======================================================
    // LOGO LEFT TOP
    // ======================================================
    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // ===============================================
    // SALES INVOICE HEADING (Centered between logo & reference block)
    // ===============================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    // compute a centered X between left logo and right reference area
    const leftEdge = 10 + logoW; // end of logo box
    const rightEdge = pageWidth - 80; // start of reference block
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('DELIVERY NOTE', centerX, y + 25, { align: 'center' });

    // ======================================================
    // RIGHT-TOP HEADER (Debit Note Info)
    // ======================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const refX = pageWidth - 65; // moved 15mm right

    doc.text(`Invoice No : ${''}`, refX, y + 5);
    doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
    doc.text(`Date: ${data.DN_DATE || ''}`, refX, y + 17);

    // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

    y += 33;

    // ===============================================
    // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
    // ===============================================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // full width line

    y += 5; // small spacing

    // ======================================================
    // BLUE SELLER BOX (LEFT)
    // ======================================================
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

    // ======================================================
    // CONSIGNEE (RIGHT SIDE)
    // ======================================================
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

    // ======================================================
    // BUYER (BILL TO)
    // ======================================================
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

    // ======================================================
    // TABLE — SAME FORMAT AS IMAGE
    // ======================================================
    const tableColumns = ['Item Code', 'Description', 'UOM', 'Quantity'];

    const totalQty = data.Details.reduce(
      (sum: number, item: any) => sum + Number(item.QUANTITY || 0),
      0,
    );

    const tableRows: any[] = [];
    const footerRow = ['', '', '', '₹ ' + totalQty.toFixed(2)];

    data.Details.forEach((item: any, index: number) => {
      tableRows.push([
        // index + 1,
        item.ITEM_CODE || '',
        item.DESCRIPTION || '',
        item.UOM || '',
        item.QUANTITY?.toFixed(2) || '',
      ]);
    });
    // Move y to bottom of Bill-to block
    y = y + 2;

    // ===============================
    // HORIZONTAL LINE LIKE THE FIGURE
    // ===============================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // Full width horizontal line

    y += 5; // small gap before table
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
        fillColor: [230, 230, 230], // same color as header
        textColor: 0,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        5: { halign: 'right' }, // Amount column
        9: { halign: 'right' }, // Total column
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // FOOTER – GST SUMMARY + TOTALS (LIKE generatePDF)
    // ============================================================

    const footStartY = y + 3;

    // ---------------- LEFT GST SUMMARY ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 55, ly);
    doc.text('Total Tax Amount', lx + 95, ly);

    // Sub headers
    doc.setFontSize(8);
    doc.text('Rate', lx + 55, ly + 5);
    doc.text('Amount', lx + 72, ly + 5);

    // Values
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

    // Total row
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // ---------------- RIGHT TOTAL SUMMARY ----------------
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

    // ---------------- REVERSE CHARGE ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text('No', 150, wordsY);

    // ---------------- AMOUNT IN WORDS ----------------
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `INR ${numberToWordsIndianNumber(Math.floor(data.NET_AMOUNT))} Rupees Only`,
      60,
      wordsY,
    );

    // ---------------- DECLARATION & REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.REF_NO || '', 40, blockY);
    // ======================================================
    // RETURN PDF
    // ======================================================
    // const pdfBlob = doc.output('blob');
    // const pdfUrl = URL.createObjectURL(pdfBlob);
    // return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
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
