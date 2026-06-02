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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-transfer-in-inventory-form',
  templateUrl: './transfer-in-inventory-form.component.html',
  styleUrls: ['./transfer-in-inventory-form.component.scss'],
})
export class TransferInInventoryFormComponent {
  @Input() isEditing: boolean = false;
  @Input() status: any

  @Input() selectedDocStatus: any

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
    ISSUE_ID: 0,
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
  selectedStoreId: any;
  netamount: any;
  storename: any;
  hideCost: any;
  IS_HQ_App: boolean = false;
  StoreIDData: any
  transferstores: any[] = []
  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
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
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    this.storename = menuResponse.Configuration[0].STORE_NAME;
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/transfer-in-inventory');
    this.getTransferNo();
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.hideCost = packingRights?.HideCost;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();

    // this.items = [];
    // this.addEmptyRow();
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
    console.log(this.selectedDocStatus, '=================selectedDocStatus=================')
    console.log(this.status, '========================statsu type=======================')
    this.StoreIDData = data.STORE_ID
    this.transferInFormData = {
      TRANS_ID: data.TRANS_ID,
      // ID: data.ID,
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
      IS_APPROVED: data.IS_APPROVED || false,
    };
    this.reindexDetails();
  }

  getTransferNo() {
    const payload = {
      TRANS_TYPE: 15,
      COMPANY_ID: this.companyID,
    };
    this.dataService.getDocNo(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.transferInFormData.DOC_NO = res.DOC_NO;
          console.log('New Transfer No:', res.DOC_NO);
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
      COMPANY_ID: this.companyID,
    };
    this.dataService
      .getItemDetailsForTrInInventory(payload)
      .subscribe((response: any) => {
        this.items = response.data;
        console.log(response, 'RESPONSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
      });
  }
  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'STORE'
    }
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.transferstores = response;
      if (this.IS_HQ_App) {
        // 🔹 HQ App → show only store with ID = 1
        this.stores = response.filter((item: any) => item.ID === 1);


      } else {
        // 🔹 Not HQ → show all stores
        this.stores = response;
      }
    });
  }

  onStoreChange(e: any) {
    this.selectedStoreId = e.value;
    console.log('Selected Store ID:', this.selectedStoreId);
    this.getItemsList();
  }

  getReasonsDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'REASON'
    }
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.reasons = response;
    });
  }

  onSelectItems() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
    console.log(selectedRows, 'SELECTED ROWS');

    if (selectedRows && selectedRows.length > 0) {

      const transferId = selectedRows.map((row: any) => row.TRANSFER_ID).join(',') //  get transfer id
      console.log(transferId, 'Selected Transfer IDs');

      // Call API instead of manually pushing rows
      this.dataService
        .getItemsforTransferIn(transferId, this.companyID)
        .subscribe((res: any) => {
          console.log(res, 'API response');

          if (res?.data && res.data.length > 0) {

            //  Clear existing valid rows if needed
            this.transferInFormData.DETAILS =
              this.transferInFormData.DETAILS.filter(
                (item) => item.BARCODE !== '' && item.DESCRIPTION !== '',
              );

            //  Set ISSUE_ID
            if (!this.transferInFormData.ISSUE_ID && res.data[0].ISSUE_ID) {
              this.transferInFormData.ISSUE_ID = res.data[0].ISSUE_ID;
            }

            //  Map API response → grid (like PO)
            res.data.forEach((item: any) => {
              const exists = this.transferInFormData.DETAILS.some(
                (d) => d.BARCODE === item.BARCODE,
              );

              if (!exists) {
                const qty = Number(item.QUANTITY_ISSUED) || 0;
                const cost = Number(item.COST) || 0;

                this.transferInFormData.DETAILS.push({
                  SL_NO: this.transferInFormData.DETAILS.length + 1,
                  ISSUE_DETAIL_ID: item.ISSUE_DETAIL_ID,
                  ISSUE_ID: item.ISSUE_ID,
                  ITEM_ID: item.ITEM_ID,
                  BARCODE: item.BARCODE,
                  DESCRIPTION: item.DESCRIPTION,
                  UOM: item.UOM,
                  COST: cost,
                  QUANTITY_AVAILABLE: item.QUANTITY_AVAILABLE,
                  QUANTITY_ISSUED: qty,
                  QUANTITY_RECEIVED: 0,
                  BATCH_NO: '0',
                  EXPIRY_DATE: new Date(),

                  // IMPORTANT
                  netAmount: cost * qty,
                });
              }
            });


            // this.recalculateNetAmount();
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

  onPopupHiding() { }

  private formatDateLocal(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  validateQtyReceived = (e: any) => {
    const issued = e.data?.QUANTITY_ISSUED || 0;
    const received = e.value || 0;
    return received <= issued;
  };

  onEditorPreparing(e: any) {
    if (e.dataField === 'QUANTITY_RECEIVED') {
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

  calculateNetAmount(rowData: any) {
    return (Number(rowData.COST) || 0) * (Number(rowData.QUANTITY_RECEIVED) || 0);
  }

  onEditorPrepared(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'QUANTITY_RECEIVED') {
      setTimeout(() => {
        e.editorElement.querySelector('input')?.focus(); // 👈 focus actual input
      });
    }
  }


  updateNetAmount(editingRowIndex?: number, newValue?: number) {
    this.transferInFormData.NET_AMOUNT = 0;

    this.transferInFormData.DETAILS.forEach((item: any, idx: number) => {
      let qty =
        idx === editingRowIndex
          ? Number(newValue) || 0
          : Number(item.QUANTITY_RECEIVED) || 0;

      // Calculate row total
      item.netAmount = (Number(item.COST) || 0) * qty;

      //  Add to grand total
      this.transferInFormData.NET_AMOUNT += item.netAmount;
    });

    this.netamount = this.transferInFormData.NET_AMOUNT;
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
    // 1. Validate required fields
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

    // 2. Calculate totals
    this.transferInFormData.NET_AMOUNT = this.transferInFormData.DETAILS.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.COST) || 0) * (Number(item.QUANTITY_RECEIVED) || 0),
      0,
    );

    // 3. Create payload
    const payload = {
      ...this.transferInFormData,
      REC_DATE: this.formatDateLocal(this.transferInFormData.REC_DATE),
      USER_ID: this.userID,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.StoreIDData,
      ISSUE_DETAIL_ID:
        this.transferInFormData.DETAILS.length > 0
          ? this.transferInFormData.DETAILS[0].ISSUE_DETAIL_ID
          : null,
    };

    console.log('Final payload:', payload);

    // ============================================================
    // ------------------ UPDATED APPROVAL LOGIC -------------------
    // ============================================================

    // ---------- EDIT MODE ----------
    if (this.isEditing) {
      if (this.selectedDocStatus == 'VERIFY') {
        // APPROVE API
        confirm(
          'Are you sure you want to approve this transfer?',
          'Confirm Approval',
        ).then((res) => {
          if (res) {
            this.dataService.approveTransferInForInventory(payload).subscribe({
              next: (result: any) => {
                if (result.Flag === 1) {
                  notify('Transfer approved successfully!', 'success', 3000);
                  this.popupClosed.emit();
                } else {
                  notify(
                    'Error approving transfer: ' + result.message,
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
      } else if

        (this.selectedDocStatus == 'OPEN' && this.status == 'VerifyScreen') {
        // UPDATE API
        confirm(
          'Are you sure you want to approve this transfer?',
          'Confirm verify',
        ).then((res) => {
          if (res) {
            this.dataService.VerifyTransferInForInventory(payload).subscribe({
              next: (result: any) => {
                if (result.Flag === 1) {
                  notify('Transfer verify successfully!', 'success', 3000);
                  this.popupClosed.emit();
                } else {
                  notify(
                    'Error verify transfer: ' + result.message,
                    'error',
                    3000,
                  );
                }
              },
              error: (err) => {
                console.error('verify error:', err);
                notify('Something went wrong while verify.', 'error', 3000);
              },
            });
          }
        });
      } else {
        this.dataService.updateTransferInForInventory(payload).subscribe({
          next: (result: any) => {
            if (result.Flag === 1) {
              notify('Transfer updated successfully!', 'success', 3000);
              this.popupClosed.emit();
            } else {
              notify(
                'Error updating transfer: ' + result.message,
                'error',
                3000,
              );
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
      if (this.transferInFormData.IS_APPROVED) {
        // CONFIRM → INSERT API
        confirm(
          'Do you want to approve & save this transfer?',
          'Confirm Approval',
        ).then((res) => {
          if (res) {
            this.dataService.insertTransferInForInventory(payload).subscribe({
              next: (result: any) => {
                if (result.Flag === 1) {
                  notify(
                    'Transfer saved and approved successfully!',
                    'success',
                    3000,
                  );
                  this.popupClosed.emit();
                } else {
                  notify(
                    'Error saving transfer: ' + result.message,
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
        this.dataService.insertTransferInForInventory(payload).subscribe({
          next: (result: any) => {
            if (result.Flag === 1) {
              notify('Transfer saved successfully!', 'success', 3000);
              this.popupClosed.emit();
            } else {
              notify('Error saving transfer: ' + result.message, 'error', 3000);
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

  // saveTransferIn() {
  //   // 1. Validate required fields before saving
  //   if (!this.transferInFormData.ORIGIN_STORE_ID) {
  //     notify('Please select a store', 'error');
  //     return;
  //   }
  //   if (!this.transferInFormData.REASON_ID) {
  //     notify('Please select a reason', 'error');
  //     return;
  //   }
  //   if (
  //     !this.transferInFormData.DETAILS ||
  //     this.transferInFormData.DETAILS.length === 0
  //   ) {
  //     notify('Please add at least one item', 'error');
  //     return;
  //   }

  //   this.transferInFormData.NET_AMOUNT = this.transferInFormData.DETAILS.reduce(
  //     (sum: number, item: any) =>
  //       sum + (Number(item.COST) || 0) * (Number(item.QUANTITY_RECEIVED) || 0),
  //     0
  //   );

  //   // 2. Format payload
  //   const payload = {
  //     ...this.transferInFormData,
  //     REC_DATE: this.formatDateLocal(this.transferInFormData.REC_DATE),
  //     USER_ID: this.userID,
  //     COMPANY_ID: this.companyID,
  //     FIN_ID: this.finID,
  //     STORE_ID: this.storeFromSession,
  //     ISSUE_DETAIL_ID:
  //       this.transferInFormData.DETAILS.length > 0
  //         ? this.transferInFormData.DETAILS[0].ISSUE_DETAIL_ID
  //         : null,
  //   };

  //   console.log('Final payload:', payload);

  //   // 3. Decide whether to insert or update
  //   if (this.isApproved) {
  //     confirm(
  //       'Are you sure you want to approve this transfer?',
  //       'Confirm Approval'
  //     ).then((dialogResult) => {
  //       if (dialogResult) {
  //         this.dataService.approveTransferInForInventory(payload).subscribe({
  //           next: (res: any) => {
  //             if (res.Flag === 1) {
  //               notify('Transfer approved successfully!', 'success', 3000);
  //               this.popupClosed.emit();
  //             } else {
  //               notify(
  //                 'Error approving transfer: ' + res.message,
  //                 'error',
  //                 3000
  //               );
  //             }
  //           },
  //           error: (err) => {
  //             console.error('Approve error:', err);
  //             notify('Something went wrong while approving.', 'error', 3000);
  //           },
  //         });
  //       }
  //     });
  //   } else if (this.isEditing) {
  //     this.dataService.updateTransferInForInventory(payload).subscribe({
  //       next: (res: any) => {
  //         if (res.Flag === 1) {
  //           notify('Transfer updated successfully!', 'success', 3000);
  //           this.popupClosed.emit();
  //         } else {
  //           notify('Error updating transfer: ' + res.message, 'error', 3000);
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Update error:', err);
  //         notify('Something went wrong while updating.', 'error', 3000);
  //       },
  //     });
  //   } else {
  //     this.dataService.insertTransferInForInventory(payload).subscribe({
  //       next: (res: any) => {
  //         if (res.Flag === 1) {
  //           notify('Transfer saved successfully!', 'success', 3000);
  //           // this.getTransferNo();
  //           this.popupClosed.emit(); // close/reset
  //         } else {
  //           notify('Error saving transfer: ' + res.message, 'error', 3000);
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Save error:', err);
  //         notify('Something went wrong while saving.', 'error', 3000);
  //       },
  //     });
  //   }
  // }

  private reindexDetails() {
    this.transferInFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }

  openPDF() {
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.ID;
    // Example:
    this.dataService
      .selectTransferInForInventory(returnId)
      .subscribe((res: any) => {
        this.generatePDF(res);
      });
  }

  generatePDF(data: any) {
    console.log(data, 'DATA');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // ============================================================
    // 1) TOP HEADER (LOGO + RIGHT DETAILS)
    // ============================================================
    const headerY = 12;

    // LOGO BOX (SMALL)
    const logoX = 18;
    const logoY = headerY;
    const logoW = 55;
    const logoH = 22;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');

    doc.setFontSize(11);
    doc.text('logo', logoX + logoW / 2, logoY + logoH / 2 + 3, {
      align: 'center',
    });

    // RIGHT-TOP DETAILS
    const rightX = pageWidth - 15;
    let ty = headerY + 4;

    const purchDate = (data.TRANSFER_DATE || '').split('T')[0];

    const headerLines = [
      `Debit Note No : ${data.TRANSFER_NO}`,
      `e-Way Bill No :`,
      `Original Invoice No. & Date:`,
      `Dated : ${this.formatDateDDMMMyyyy(purchDate)}`,
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // RIGHT HEADER BLOCK (placed at right side but left-aligned)
    const headerBlockX = pageWidth - 65; // adjust this if needed

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    headerLines.forEach((txt) => {
      doc.text(txt, headerBlockX, ty); // LEFT alignment
      ty += 6;
    });

    // headerLines.forEach((txt) => {
    //   doc.text(txt, rightX, ty, { align: 'right' });
    //   ty += 6;
    // });

    // LINE BELOW HEADER
    const lineY = logoY + logoH + 3;
    doc.setDrawColor(180);
    doc.line(15, lineY, pageWidth - 15, lineY);

    // ============================================================
    // 2) COMPANY BLOCK (LEFT BLUE BOX — DYNAMIC HEIGHT)
    // ============================================================
    const compBoxX = 15;
    const compBoxY = lineY + 3; // reduced spacing
    const compBoxW = 95;

    const companyLines = [
      data.COMPANY_NAME,
      data.ADDRESS1,
      data.ADDRESS2,
      data.ADDRESS3,
      `GSTIN/UIN : ${data.COMPANY_CODE}`,
      `State Name : ${data.STORE_STATE_NAME}, Code : 32`,
      `Email : ${data.EMAIL}`,
    ];

    const lineHeight = 5;
    const topPadding = 8;
    const compBoxH = topPadding + companyLines.length * lineHeight + 4;

    // Draw Box
    doc.setFillColor(210, 230, 255);
    doc.rect(compBoxX, compBoxY, compBoxW, compBoxH, 'F');

    // Print text inside box
    let cy = compBoxY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME || '', compBoxX + 5, cy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    companyLines.slice(1).forEach((line) => {
      cy += lineHeight;
      if (line.startsWith('Email')) doc.setTextColor(0, 0, 255);
      doc.text(line || '', compBoxX + 5, cy);
      doc.setTextColor(0, 0, 0);
    });

    // ============================================================
    // 3) CONSIGNEE (SHIP TO)
    // ============================================================
    let shipX = compBoxX + compBoxW + 15;
    let shipY = compBoxY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Consignee (Ship to)', shipX, shipY);

    shipY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const shipLines = [
      data.STORE_NAME,
      data.STORE_ADDRESS1,
      data.STORE_ADDRESS2,
      `${data.STORE_CITY} - ${data.STORE_ZIP}`,
      `GSTIN/UIN : ${data.STORE_CODE}`,
      `State Name : ${data.STORE_STATE_NAME}, Code : 32`,
    ];

    shipLines.forEach((l) => {
      doc.text(l || '', shipX, shipY);
      shipY += 5;
    });

    // ============================================================
    // 4) BUYER (BILL TO)
    // ============================================================
    let buyerX = shipX;
    let buyerY = compBoxY + compBoxH + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Buyer (Bill to)', buyerX, buyerY);

    buyerY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const buyerLines = [...shipLines];

    buyerLines.forEach((l) => {
      doc.text(l || '', buyerX, buyerY);
      buyerY += 5;
    });

    // LINE BELOW BUYER BLOCK
    const tableLineY = buyerY + 2;
    doc.setDrawColor(180);
    doc.line(15, tableLineY, pageWidth - 15, tableLineY);

    // ============================================================
    // 5) TABLE — EXACT SAME WIDTH AS THE LINE (180mm)
    // ============================================================
    const tableStartY = tableLineY + 4;

    const rows = data.DETAILS.map((item: any, index: number) => [
      index + 1, // Sl No
      item.BARCODE,
      item.DESCRIPTION, // Description
      item.COST.toFixed(2), // Rate
      item.QUANTITY, // Quantity
      item.QUANTITY_AVAILABLE,
    ]);

    autoTable(doc, {
      startY: tableStartY,
      theme: 'grid',
      margin: { left: 15, right: 15 }, //  Ensures table matches the line width
      tableWidth: pageWidth - 30, // 180mm exactly
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontSize: 9,
        halign: 'center',
      },
      bodyStyles: { fontSize: 9 },
      footStyles: {
        fillColor: [255, 255, 255], // same as table
        textColor: 0,
        fontSize: 10,
        halign: 'right',
      },

      columnStyles: {
        0: { cellWidth: 12, halign: 'center' }, // Sl No
        1: { cellWidth: 38, halign: 'center' }, // Barcode
        2: { cellWidth: 70 }, // Description
        3: { cellWidth: 20, halign: 'right' }, // Cost
        4: { cellWidth: 20, halign: 'center' }, // Quantity
        5: { cellWidth: 20, halign: 'center' }, // Quantity Available
      },

      head: [
        [
          'Sl No',
          'Barcode',
          'Description of goods',
          'Cost',
          'Quantity',
          'Quantity Available',
        ],
      ],

      body: rows,

      //  PERFECTLY ALIGNED TOTAL ROW
      foot: [
        [
          {
            content: 'Total',
            colSpan: 5,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: data.NET_AMOUNT.toFixed(2),
            styles: { halign: 'right', fontStyle: 'bold' },
          },
        ],
      ],
    });

    // ============================================================
    // 6) FOOTER TEXT BLOCK (LEFT SIDE BELOW TABLE)
    // ============================================================

    // Y-position immediately after table
    // ============================================================
    // 6) FOOTER POSITION REFERENCE (NO OVERLAP)
    // ============================================================
    const footerY = (doc as any).lastAutoTable.finalY + 10;

    // LEFT column X
    const leftColX = 15;

    // RIGHT column X (slightly right of center)
    const rightColX = pageWidth / 2 + 10;

    // ============================================================
    // 7) LEFT SIDE FOOTER
    // ============================================================

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text('E. & O.E', leftColX, footerY);
    doc.text(`User: ${data.USER_NAME || ''}`, leftColX, footerY + 5);

    doc.text("Company's PAN", leftColX, footerY + 10);
    doc.setFont('helvetica', 'bold');
    doc.text(`: ${data.PAN_NO || ''}`, leftColX + 40, footerY + 10);

    // ============================================================
    // 8) RIGHT SIDE — AMOUNT IN WORDS
    // ============================================================

    let amountTextY = footerY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Amount Chargeable (in words)', rightColX, amountTextY);

    doc.setFont('helvetica', 'bold');
    doc.text(
      `INR ${this.convertNumberToWords(data.NET_AMOUNT)} Only`,
      rightColX,
      amountTextY + 6,
    );

    // ============================================================
    // 9) RIGHT SIDE — SIGNATURE BOX
    // ============================================================

    let boxY = amountTextY + 15;
    let boxHeight = 25;
    let boxWidth = pageWidth - rightColX - 15;

    doc.setDrawColor(0);
    doc.rect(rightColX, boxY, boxWidth, boxHeight);

    // Inside box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const companyText = `for ${data.COMPANY_NAME}`;
    const wrappedCompanyName = doc.splitTextToSize(companyText, boxWidth - 10);

    doc.text(wrappedCompanyName, rightColX + 5, boxY + 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text(
      'Authorised Signatory',
      rightColX + boxWidth - 45,
      boxY + boxHeight - 6,
    );

    // // E. & O.E
    // doc.text('E. & O.E', 15, footerY);

    // // User
    // doc.text(`User: ${data.USER_NAME || ''}`, 15, footerY + 5);

    // // Company PAN
    // doc.text("Company's PAN", 15, footerY + 10);
    // doc.setFont('helvetica', 'bold');
    // doc.text(`: ${data.PAN_NO || ''}`, 45, footerY + 10);

    // // restore normal
    // doc.setFont('helvetica', 'normal');

    // // THANK YOU
    // // doc.text('Thank you for your business!', pageWidth / 2, finalY + 25, {
    // //   align: 'center',
    // // });

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
export class TransferInInventoryFormModule { }
