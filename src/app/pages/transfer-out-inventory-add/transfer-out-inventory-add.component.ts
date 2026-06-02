import {
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
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-transfer-out-inventory-add',
  templateUrl: './transfer-out-inventory-add.component.html',
  styleUrls: ['./transfer-out-inventory-add.component.scss'],
})
export class TransferOutInventoryAddComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() selectedDocStatus: any;
  @Input() isReadOnlyMode: any
  @Input() ActionStatus: any = {};
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
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
  hideCost: any;
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
    IS_APPROVED: false,
    DETAILS: [], // <-- start empty
  };
  userID: any;
  finID: any;
  companyID: any;
  storename: any;
  netamount: any;
  StoreIDData: any
  IS_HQ_App: boolean = false;
  transferstores: any[] = [];
  selectedStoreId: any;
  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    console.log('--------------Status-------------:', this.ActionStatus);
    console.log(this.isReadOnlyMode, 'READONLYMODE');
    this.isEditDataAvailable();

    // always fetch fresh number when popup opens

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.IS_HQ_App = menuResponse.GeneralSettings.IS_HQ_APP;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    console.log(this.companyID, 'COMPANYIDDDDDDDDDD');
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    this.storename = menuResponse.Configuration[0].STORE_NAME;
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/transfer-out-inventory');
    if (!this.isEditing) {
      this.getTransferNo();
    }

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.hideCost = packingRights?.HideCost ?? false;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      this.getItemsList();
    } else {
      this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();

    // this.items = [];
    // this.addEmptyRow();
  }

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
    this.StoreIDData = data.STORE_ID; // pre-select store in dropdown

    this.transferOutFormData = {
      TRANS_ID: data.TRANS_ID,
      // ID: data.ID,
      TRANSFER_DATE: data.TRANSFER_DATE ? new Date(data.TRANSFER_DATE) : null,
      DEST_STORE_ID: data.DEST_STORE_ID,
      REASON_ID: data.REASON_ID,
      DETAILS: data.DETAILS ? [...data.DETAILS] : [],
      NARRATION: data.NARRATION || '',
      NET_AMOUNT: data.NET_AMOUNT,
      DOC_NO: data.DOC_NO,
      IS_APPROVED: data.IS_APPROVED || false,

    };
    this.transferOutFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
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
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.companyID
    }
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.transferstores = response;

      if (this.IS_HQ_App) {
        // 🔹 HQ App → show only store with ID = 1
        this.stores = response.filter((item: any) => item.ID === 1);
        this.StoreIDData = 1;


      } else {
        // 🔹 Not HQ → show all stores
        this.stores = response;
      }
    });
  }

  getReasonsDropdown() {
    const payload = {
      NAME: 'REASON',
      COMPANY_ID: this.companyID
    }
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.reasons = response;
    });
  }
  onStoreChange(e: any) {
    this.selectedStoreId = e.value;
    console.log('Selected Store ID:', this.selectedStoreId);
    this.getItemsList();
  }

  getItemsList() {
    const payload = {
      STORE_ID: this.selectedStoreId,
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

  onPopupHiding() { }

  onSelectItems() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (selectedRows && selectedRows.length > 0) {
      // remove any empty placeholder rows
      this.transferOutFormData.DETAILS =
        this.transferOutFormData.DETAILS.filter(
          (item) => item.BARCODE !== '' && item.DESCRIPTION !== '',
        );

      selectedRows.forEach((row) => {
        const exists = this.transferOutFormData.DETAILS.some(
          (item) => item.BARCODE === row.BARCODE,
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
    if (e.dataField === 'QUANTITY') {
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
        e.editorElement.querySelector('input')?.focus(); //  focus actual input
      });
    }
  }

  updateNetAmount(editingRowIndex?: number, newValue?: number) {
    this.transferOutFormData.NET_AMOUNT = 0;

    this.transferOutFormData.DETAILS.forEach((item: any, idx: number) => {
      let qty =
        idx === editingRowIndex
          ? Number(newValue) || 0
          : Number(item.QUANTITY) || 0;

      // Calculate row total
      item.netAmount = (Number(item.COST) || 0) * qty;

      //  Add to grand total
      this.transferOutFormData.NET_AMOUNT += item.netAmount;
    });

    this.netamount = this.transferOutFormData.NET_AMOUNT;
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

  calculateNetAmount(rowData: any) {
    return (Number(rowData.COST) || 0) * (Number(rowData.QUANTITY) || 0);
  }

  getTransferNo() {
    const payload = {
      TRANS_TYPE: 14,
      COMPANY_ID: this.companyID,
    };
    this.dataService.getDocNo(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.transferOutFormData.DOC_NO = res.DOC_NO;
          console.log('✅ New Transfer No:', res.DOC_NO);
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
    // 1. Validate required fields
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

    // 2. Calculate totals
    this.transferOutFormData.NET_AMOUNT =
      this.transferOutFormData.DETAILS.reduce(
        (sum: number, item: any) =>
          sum + (Number(item.COST) || 0) * (Number(item.QUANTITY) || 0),
        0,
      );

    // 3. Create payload (unchanged)
    const payload = {
      ...this.transferOutFormData,
      TRANSFER_DATE: this.formatDateLocal(
        this.transferOutFormData.TRANSFER_DATE,
      ),
      USER_ID: this.userID,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.StoreIDData,
    };

    console.log('Final payload:', payload);

    // ============================================================
    // ------------------ UPDATED APPROVAL LOGIC -------------------
    // ============================================================

    // ---------- EDIT MODE ----------
    if (this.isEditing) {
      console.log(this.selectedDocStatus, '==========')
      if (this.selectedDocStatus == 'VERIFY' || this.transferOutFormData.IS_APPROVED) {
        // APPROVE API
        confirm(
          'Are you sure you want to approve this transfer?',
          'Confirm Approval',
        ).then((result) => {
          if (result) {
            this.dataService.approveTransferOutForInventory(payload).subscribe({
              next: (res: any) => {
                if (res.flag === 1) {
                  notify('Transfer approved successfully!', 'success', 3000);
                  this.ngZone.run(() => {
                    this.popupClosed.emit();
                  });
                } else {
                  notify(
                    'Error approving transfer: ' + res.message,
                    'error',
                    3000,
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
      }
      else if (this.selectedDocStatus == 'OPEN' && this.ActionStatus == 'VerifyScreen') {

        confirm(
          'Are you sure you want to Verify this transfer?',
          'Confirm Verify',
        ).then((result) => {
          if (result) {
            this.dataService.verifyTransferOutForInventory(payload).subscribe({
              next: (res: any) => {
                if (res.flag === 1) {
                  notify('Transfer Verify successfully!', 'success', 3000);
                  this.ngZone.run(() => {
                    this.popupClosed.emit();
                  });
                } else {
                  notify(
                    'Error Verify transfer: ' + res.message,
                    'error',
                    3000,
                  );
                }
              },
              error: (err) => {
                console.error('verifyTransferOutForInventory error:', err);
                notify('Something went wrong while Verify.', 'error', 3000);
              },
            });
          }
        });


      }
      else {
        // UPDATE API
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
      }

      return; // stop here
    }

    // ---------- ADD (INSERT) MODE ----------
    if (!this.isEditing) {
      if (this.transferOutFormData.IS_APPROVED) {
        // CONFIRM → INSERT API
        confirm(
          'Do you want to approve & save this transfer?',
          'Confirm Save',
        ).then((result) => {
          if (result) {
            this.dataService.insertTransferOutForInventory(payload).subscribe({
              next: (res: any) => {
                if (res.flag === 1) {
                  notify(
                    'Transfer saved and approved successfully!',
                    'success',
                    3000,
                  );
                  this.getTransferNo();
                  this.ngZone.run(() => {
                    this.popupClosed.emit();
                  });
                } else {
                  notify(
                    'Error saving transfer: ' + res.message,
                    'error',
                    3000,
                  );
                }
              },
              error: (err) => {
                console.error('Save error:', err);
                notify('Something went wrong while saving.', 'error', 3000);
              },
            });
          }
        });
      } else {
        // DIRECT INSERT
        this.dataService.insertTransferOutForInventory(payload).subscribe({
          next: (res: any) => {
            if (res.flag === 1) {
              notify('Transfer saved successfully!', 'success', 3000);
              this.getTransferNo();
              this.popupClosed.emit();
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
  }

  formatDateDDMMMyyyy(dateStr: string) {
    const date = new Date(dateStr);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate().toString().padStart(2, '0')}-${months[date.getMonth()]
      }-${date.getFullYear().toString().slice(-2)}`;
  }

  openPDF() {
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.TRANS_ID;
    // Example:
    this.dataService
      .selectTransferOutForInventory(returnId)
      .subscribe((res: any) => {
        this.generatePDF(res);
      });
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }

  async generatePDF(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // ============================================================
    // 1) HEADER (LOGO + TITLE + RIGHT DETAILS)
    // ============================================================

    const headerY = 10;

    // --- Logo placeholder (replace with addImage if needed)
    const logoBase64 = await this.getBase64ImageFromURL('assets/images/image16.png');

    doc.addImage(logoBase64, 'PNG', 15, headerY, 35, 50);

    // --- Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TRANSFER OUT', pageWidth / 2, headerY + 25, {
      align: 'center',
    });

    // ============================================================
    // 2) RIGHT SIDE DETAILS (FIXED - WRAPPING ADDED)
    // ============================================================

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB');
    };

    const rightDetails = [
      `ISSUE DATE: ${formatDate(data.TRANSFER_DATE)}`,
      `TRANSFER NO: ${data.DOC_NO}`,
      `TRANSFER FROM: ${data.COMPANY_NAME}`,
      `TRANSFER TO: ${data.STORE_CODE}`,
      `REASON: ${data.REASON_ID || ''}`,
      `NARRATION: ${data.NARRATION || ''}`,
    ];

    const rightMargin = 20;   // distance from right edge
    const maxWidth = 70;      // width of text block

    let y = headerY + 5;

    rightDetails.forEach((line) => {
      //  wrap long text داخل عرض محدد
      const wrappedText = doc.splitTextToSize(line, maxWidth);

      //  draw aligned to right
      doc.text(wrappedText, pageWidth - rightMargin, y, {
        align: 'right',
      });

      //  dynamic spacing
      y += wrappedText.length * 6;
    });

    // ============================================================
    // 2) TABLE
    // ============================================================

    const tableStartY = y + 10;

    const rows = data.DETAILS.map((item: any, index: number) => [
      index + 1,
      item.BARCODE,
      item.DESCRIPTION,
      item.UOM,
      Number(item.QUANTITY_AVAILABLE || 0).toFixed(2),
      Number(item.QUANTITY || 0).toFixed(2),
    ]);

    autoTable(doc, {
      startY: tableStartY,
      theme: 'grid',
      margin: { left: 15, right: 15 },
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },

      headStyles: {
        fillColor: [200, 210, 220],
        textColor: 0,
        halign: 'center',
        fontStyle: 'bold',
      },

      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },

      head: [
        [
          'Sl No',
          'Barcode',
          'Description',
          'UOM',
          'QTY Available',
          'QTY Issued',
        ],
      ],

      body: rows,
    });

    // ============================================================
    // 3) OPEN PDF
    // ============================================================

    doc.output('dataurlnewwindow');
  }

  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';

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

    const inWords = (n: number, suffix: string): string => {
      if (n === 0) return '';
      if (n < 20) return a[n] + ' ' + suffix + ' ';
      return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ' + suffix + ' ';
    };

    let str = '';

    str += inWords(Math.floor(num / 10000000), 'Crore');
    str += inWords(Math.floor((num / 100000) % 100), 'Lakh');
    str += inWords(Math.floor((num / 1000) % 100), 'Thousand');
    str += inWords(Math.floor((num / 100) % 10), 'Hundred');

    if (num > 100 && num % 100 > 0) str += 'and ';

    str += inWords(num % 100, '');

    return str.trim();
  }

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
export class TransferOutInventoryAddModule { }
