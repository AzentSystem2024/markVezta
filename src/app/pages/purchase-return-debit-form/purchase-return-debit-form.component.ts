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
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddModule } from '../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-purchase-return-debit-form',
  templateUrl: './purchase-return-debit-form.component.html',
  styleUrls: ['./purchase-return-debit-form.component.scss'],
})
export class PurchaseReturnDebitFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  customer: any;
  mainReturnGridList: any;
  distributorList: any;
  sessionData: any;
  selected_vat_id: any;
  isTrOutPopupVisible: any;
  supplierList: any;
  mainGridData: any[] = [];
  isApproved: boolean = false;
  purchaseReturnFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    RET_DATE: new Date(),
    SUPP_ID: 0,
    GRN_ID: 0,
    GRN_NO: '',
    IS_CREDIT: true,
    GROSS_AMOUNT: 0,
    VAT_AMOUNT: 0,
    NET_AMOUNT: 0,
    USER_ID: 0,
    NARRATION: '',
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    RET_NO: '',
    PurchDetail: [
      {
        COMPANY_ID: 0,
        STORE_ID: 0,
        BAR_CODE: '',
        GRN_DET_ID: 0,
        ITEM_ID: 0,
        BATCH_NO: '',
        EXPIRY_DATE: 2025 - 11 - 20,
        PENDING_QTY: 0,
        QUANTITY: 0,
        RATE: 0,
        AMOUNT: 0,
        VAT_PERC: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        UOM: '',
        UOM_PURCH: '',
        UOM_MULTIPLE: 0,
        PURCH_DET_ID: 0,
      },
    ],
  };
  selectedSupplierId: any;
  pendingList: any;
  companyList: any[];
  pendingQtyValidation = 0;
  HSNCODE: any;
  GST: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      console.log(this.HSNCODE, this.GST, 'HSNCODEANDGST');
      if (selectedCompany?.COMPANY_ID) {
        this.purchaseReturnFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; //  Show only selected company
      }
      console.log(
        this.purchaseReturnFormData.COMPANY_ID,
        'COMPANYIDDDDDDDDDDDDDDDDDDD'
      );
      if (userData.USER_ID) {
        this.purchaseReturnFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.purchaseReturnFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    console.log(this.EditingResponseData, 'EDITINGRESPONSEDATA');
    this.sessionData_tax();
    // this.isEditDataAvailable();
    if (this.isEditing) {
      this.isEditDataAvailable(); // load edit data
    } else {
      this.getDocNo(); // only fetch new number in add mode
    }
    this.getSupplierDropdown();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) {
      return; // Not edit mode → nothing to load
    }

    const data = this.EditingResponseData;
    console.log(data, 'DATAINEDITFORM');
    // Populate header fields
    this.purchaseReturnFormData = {
      ID: data.ID,
      COMPANY_ID: this.purchaseReturnFormData.COMPANY_ID,
      STORE_ID: data.STORE_ID,
      // RET_DATE: new Date(data.RET_DATE),
      RET_DATE: data.RET_DATE,
      SUPP_ID: data.SUPP_ID,
      GRN_ID: data.GRN_ID,
      GRN_NO: data.GRN_NO,
      IS_CREDIT: data.IS_CREDIT,
      GROSS_AMOUNT: data.GROSS_AMOUNT,
      VAT_AMOUNT: data.VAT_AMOUNT,
      NET_AMOUNT: data.NET_AMOUNT,
      USER_ID: this.purchaseReturnFormData.USER_ID,
      NARRATION: data.NARRATION,
      CURRENCY_SYMBOL: data.CURRENCY_SYMBOL,
      PurchDetail: data.PurchDetail || [],
      SUPPPLIER_NAME: data.SUPPPLIER_NAME,
      RETURN_AMOUNT: data.RETURN_AMOUNT,
      FIN_ID: this.purchaseReturnFormData.FIN_ID,
      RET_NO: data.RET_NO,
    };

    // Populate supplier selection
    this.selectedSupplierId = data.SUPP_ID;

    // Populate grid rows from PurchDetail
    this.mainGridData = (data.PurchDetail || []).map((item) => ({
      DETAIL_ID: item.PURCH_DET_ID,
      ITEM_ID: item.ITEM_ID,
      GRN_DET_ID: item.GRN_DET_ID,
      TRANSFER_NO: item.DOC_NO || '',
      TRANSFER_DATE: item.PURCH_DATE || '',
      ITEM_NAME: item.ITEM_NAME || '',
      PENDING_QTY: item.PENDING_QTY,
      RATE: item.RATE,
      QUANTITY: item.QUANTITY,
      AMOUNT: item.AMOUNT,
      // VAT_PERC: item.VAT_PERC,
      VAT_AMOUNT: item.VAT_AMOUNT,
      TOTAL_AMOUNT: item.TOTAL_AMOUNT,
      UOM: item.UOM,
      UOM_PURCH: item.UOM_PURCH,
      UOM_MULTIPLE: item.UOM_MULTIPLE,
      BARCODE: item.BAR_CODE,
      HSN_CODE: this.HSNCODE,
      VAT_PERC: this.GST,
    }));

    // Refresh grid
    setTimeout(() => {
      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.refresh();
      }
    }, 200);

    console.log('EDIT MODE - Loaded Data:', this.mainGridData);
  }

  getDocNo() {
    this.dataService.getPurchaseReturnNo().subscribe((response: any) => {
      this.purchaseReturnFormData.RET_NO = response.PURCHASE_NO;
    });
  }
  getSupplierDropdown() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplierList = response;
      console.log(
        this.supplierList,
        'distributorList=============================='
      );
    });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    const selectedSupplier = this.supplierList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId
    );

    if (selectedSupplier) {
      this.purchaseReturnFormData.SUPPPLIER_NAME = selectedSupplier.DESCRIPTION;
    } else {
      this.purchaseReturnFormData.SUPPPLIER_NAME = '';
    }

    console.log('Selected Supplier:', selectedSupplier);
  }

  openPendingGrnPopup() {
    if (!this.selectedSupplierId) {
      notify('Please Select A Supplier', 'warning', 2000);
      return;
    }

    const payload = { SUPP_ID: this.selectedSupplierId };

    this.dataService
      .getPendingInvoicesForReturn(payload)
      .subscribe((response: any) => {
        this.pendingList = response.Data || [];
        console.log(this.pendingList, 'PENDING GRN LIST');

        if (this.pendingList.length === 0) {
          notify('No Data Available', 'warning', 2000);
        } else {
          this.isTrOutPopupVisible = true; // Only open if data exists
        }
      });
  }

  onTransferSelectClick() {
    const selectedRows =
      this.popupGridRef?.instance.getSelectedRowsData() || [];

    if (selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        const exists = this.mainGridData.some(
          (item) => item.DETAIL_ID === row.DETAIL_ID
        );

        if (!exists) {
          this.mainGridData.push({
            DETAIL_ID: row.DETAIL_ID,
            ITEM_ID: row.ITEM_ID,
            GRN_DET_ID: row.GRN_DET_ID,
            TRANSFER_NO: row.DOC_NO,
            TRANSFER_DATE: row.PURCH_DATE,
            ITEM_NAME: row.ITEM_NAME,
            PENDING_QTY: row.PENDING_QTY,
            RATE: row.RATE,
            QUANTITY: 0,
            AMOUNT: row.AMOUNT,
            // VAT_PERC: row.VAT_PERC,
            VAT_AMOUNT: row.TAX_AMOUNT,
            TOTAL_AMOUNT: 0,
            UOM: row.UOM,
            UOM_PURCH: row.UOM_PURCH,
            UOM_MULTIPLE: row.UOM_MULTIPLE,
            BARCODE: row.BARCODE,
            HSN_CODE: this.HSNCODE,
            VAT_PERC: this.GST,
          });
        }
      });

      //  Force grid to detect changes
      this.mainGridData = [...this.mainGridData];

      // Refresh both grids
      this.itemsGridRef.instance.refresh();
      this.popupGridRef.instance.clearSelection();
    }

    // Close popup
    this.isTrOutPopupVisible = false;

    // Focus the Qty cell
    setTimeout(() => {
      this.itemsGridRef.instance.editCell(0, 'QUANTITY');
    }, 200);
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'QUANTITY' || e.dataField === 'VAT_PERC') {
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
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }

  validateQuantity = (e) => {
    const row = e.data;
    const qty = e.value;
    const pendingQty = row?.PENDING_QTY ?? 0;

    // Allow empty value while typing
    if (qty == null || qty === '') return true;

    return qty <= pendingQty;
  };

  calculateAmount = (rowData: any) => {
    const qty = Number(rowData.QUANTITY) || 0;
    const rate = Number(rowData.RATE) || 0;

    const amount = qty * rate;

    // also store the calculated amount inside the row (optional)
    rowData.AMOUNT = amount;

    return amount;
  };

  calculateVATAmount = (rowData) => {
    const amount = Number(rowData.AMOUNT) || 0;
    const vatPerc = Number(rowData.VAT_PERC) || 0;

    const vatAmount = (amount * vatPerc) / 100;
    rowData.VAT_AMOUNT = vatAmount;

    return vatAmount;
  };
  calculateTotalAmount = (rowData) => {
    return this.calculateAmount(rowData) + this.calculateVATAmount(rowData);
    // const amount = Number(rowData.AMOUNT) || 0;
    // const vat = Number(rowData.VAT_AMOUNT) || 0;
    // console.log(amount, vat, 'AMOUNT AND VAT');
    // const total = amount + vat;
    // console.log(total, 'total');
    // rowData.TOTAL_AMOUNT = total;

    // return total;
  };
  private toDateOnlyString(value: any): string {
    if (!value) return '';

    const dt = new Date(value); // works if value is Date or ISO-ish string
    if (isNaN(dt.getTime())) return ''; // invalid date guard

    const y = dt.getFullYear();
    const m = ('0' + (dt.getMonth() + 1)).slice(-2);
    const d = ('0' + dt.getDate()).slice(-2);

    return `${y}-${m}-${d}`;
  }

  savePurchaseReturn() {
    // Validate Supplier
    if (!this.purchaseReturnFormData.SUPP_ID) {
      notify('Please select a supplier.', 'warning', 2000);
      return;
    }

    // Validate grid items
    if (!this.mainGridData || this.mainGridData.length === 0) {
      notify('Please add at least one item.', 'warning', 2000);
      return;
    }

    // Validate quantity
    const invalidQtyRow = this.mainGridData.find(
      (row) => !row.QUANTITY || row.QUANTITY <= 0
    );
    if (invalidQtyRow) {
      notify('Please enter a valid Quantity for all items.', 'warning', 2000);
      return;
    }
    let totalAmount = 0;
    let totalVAT = 0;
    let totalNet = 0;
    // --- Map PurchDetail ---
    this.purchaseReturnFormData.PurchDetail = this.mainGridData.map(
      (row: any) => {
        const amount = this.calculateAmount(row);
        const vat = this.calculateVATAmount(row);
        totalAmount += amount;
        totalVAT += vat;
        totalNet += amount + vat;
        return {
          COMPANY_ID: this.purchaseReturnFormData.COMPANY_ID,
          STORE_ID: this.purchaseReturnFormData.STORE_ID,
          BAR_CODE: row.BARCODE ?? '',
          GRN_DET_ID: row.GRN_DET_ID ?? 0,
          ITEM_ID: row.ITEM_ID ?? 0,
          PURCH_DET_ID: row.DETAIL_ID ?? 0,
          BATCH_NO: '',
          EXPIRY_DATE: new Date(),
          PENDING_QTY: row.PENDING_QTY ?? 0,
          QUANTITY: row.QUANTITY ?? 0,
          RATE: row.RATE ?? 0,
          AMOUNT: row.AMOUNT ?? 0,
          VAT_PERC: row.VAT_PERC ?? 0,
          VAT_AMOUNT: row.VAT_AMOUNT ?? 0,
          TOTAL_AMOUNT: totalAmount,
          UOM: row.UOM ?? '',
          UOM_PURCH: row.UOM_PURCH ?? '',
          UOM_MULTIPLE: row.UOM_MULTIPLE ?? 0,
        };
      }
    );

    this.purchaseReturnFormData.GROSS_AMOUNT = totalAmount;
    this.purchaseReturnFormData.VAT_AMOUNT = totalVAT;
    this.purchaseReturnFormData.NET_AMOUNT = totalNet;
    this.purchaseReturnFormData.RETURN_AMOUNT = totalNet;
    this.purchaseReturnFormData.COMPANY_ID =
      this.purchaseReturnFormData.COMPANY_ID;
    this.purchaseReturnFormData.FIN_ID = this.purchaseReturnFormData.FIN_ID;
    this.purchaseReturnFormData.USER_ID = this.purchaseReturnFormData.USER_ID;
    this.purchaseReturnFormData.RET_DATE = this.toDateOnlyString(
      this.purchaseReturnFormData.RET_DATE
    );

    // --- ADD MODE vs EDIT MODE ---
    if (this.isEditing) {
      // Only for edit: ensure Return ID is passed (if backend needs it)
      if (this.EditingResponseData?.RETURN_ID) {
        this.purchaseReturnFormData.RETURN_ID =
          this.EditingResponseData.RETURN_ID;
      }

      // UPDATE API
      // If approved → call APPROVE API
      // If Approved → Ask confirmation before calling APPROVE API
      if (this.purchaseReturnFormData.IS_APPROVED === true) {
        const result = confirm(
          `Are you sure you want to approve this Purchase Return?`,
          'Confirm Approval'
        );

        result.then((dialogResult) => {
          if (dialogResult) {
            // user clicked OK → call APPROVE API
            this.dataService
              .approvePurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  notify(
                    {
                      message: 'Purchase Return Approved Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success'
                  );

                  this.popupClosed.emit();
                },
                (error) => {
                  console.error('APPROVE ERROR:', error);
                  notify('Error approving purchase return.', 'error');
                }
              );
          } else {
            // user clicked Cancel → do nothing
            return;
          }
        });

        return; // prevent continuing to update API block
      } else {
        // Otherwise → UPDATE API
        this.dataService
          .updatePurchaseReturn(this.purchaseReturnFormData)
          .subscribe(
            (response: any) => {
              notify(
                {
                  message: 'Purchase Return Updated Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success'
              );

              this.popupClosed.emit();
            },
            (error) => {
              console.error('UPDATE ERROR:', error);
              notify('Error updating purchase return.', 'error');
            }
          );
      }
    } else {
      // ---------------------------------------
      // INSERT MODE — **UPDATED PART**
      // ---------------------------------------

      if (this.purchaseReturnFormData.IS_APPROVED === true) {
        const result = confirm(
          'Are you sure you want to approve and commit this invoice?',
          'Confirmation'
        );

        result.then((confirmed) => {
          if (confirmed) {
            // User clicked YES → Save
            this.dataService
              .insertPurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  notify(
                    {
                      message: 'Purchase Return Saved Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success'
                  );
                  this.resetPurchaseReturnForm();

                  // Fetch new Doc No and THEN close popup
                  this.dataService
                    .getPurchaseReturnNo()
                    .subscribe((resp: any) => {
                      this.purchaseReturnFormData.RET_NO = resp.PURCHASE_NO;
                      this.popupClosed.emit();
                    });
                },
                (error) => {
                  console.error('SAVE ERROR:', error);
                  notify('Error saving purchase return.', 'error');
                }
              );
          }
        });
      } else {
        // Not approved → Direct INSERT
        this.dataService
          .insertPurchaseReturn(this.purchaseReturnFormData)
          .subscribe(
            (response: any) => {
              notify(
                {
                  message: 'Purchase Return Saved Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success'
              );
              this.resetPurchaseReturnForm();
              this.getDocNo();
              this.popupClosed.emit();
            },
            (error) => {
              console.error('SAVE ERROR:', error);
              notify('Error saving purchase return.', 'error');
            }
          );
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
    return `${date.getDate().toString().padStart(2, '0')}-${
      months[date.getMonth()]
    }-${date.getFullYear().toString().slice(-2)}`;
  }

  openPDF() {
    // Call your PDF API or open a URL
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.ID;
    // Example:
    this.dataService.selectPurchaseReturn(returnId).subscribe((res: any) => {
      this.generatePDF(res);
    });
  }

  generatePDF(data: any) {
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

    const purchDate = (data.RET_DATE || '').split('T')[0];

    const headerLines = [
      `Debit Note No : ${data.RET_NO}`,
      `e-Way Bill No :`,
      `Original Invoice No. & Date:`,
      `Dated : ${this.formatDateDDMMMyyyy(purchDate)}`,
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    headerLines.forEach((txt) => {
      doc.text(txt, rightX, ty, { align: 'right' });
      ty += 6;
    });

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
      `State Name : ${data.SUPP_STATE_NAME}, Code : 32`,
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
      data.SUPP_NAME,
      data.SUPP_ADDRESS1,
      data.SUPP_ADDRESS2,
      `${data.SUPP_CITY} - ${data.SUPP_ZIP}`,
      `GSTIN/UIN : ${data.SUPP_CODE}`,
      `State Name : ${data.SUPP_STATE_NAME}, Code : 32`,
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

    const rows = data.PurchDetail.map((item: any, index: number) => [
      index + 1, // Sl No
      item.ITEM_NAME, // Description
      item.QUANTITY, // Quantity
      item.RATE.toFixed(2), // Rate
      'pairs', // Per
      item.VAT_PERC.toFixed(2) + ' %', // GST%
      item.TOTAL_AMOUNT.toFixed(2), // Total Amount
    ]);

    autoTable(doc, {
      startY: tableStartY,
      theme: 'grid',

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
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 25, halign: 'right' },
      },

      head: [
        [
          'Sl No',
          'Description of goods',
          'Quantity',
          'Rate',
          'Per',
          'GST%',
          'Total Amount',
        ],
      ],

      body: rows,

      // ⭐ PERFECTLY ALIGNED TOTAL ROW
      foot: [
        [
          {
            content: 'Total',
            colSpan: 6,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: data.NET_AMOUNT.toFixed(2),
            styles: { fontStyle: 'bold' },
          },
        ],
      ],
    });

    // ============================================================
    // 6) FOOTER TEXT BLOCK (LEFT SIDE BELOW TABLE)
    // ============================================================

    // Y-position immediately after table
    const footerY = (doc as any).lastAutoTable.finalY + 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // E. & O.E
    doc.text('E. & O.E', 15, footerY);

    // User
    doc.text(`User: ${data.USER_NAME || ''}`, 15, footerY + 5);

    // Company PAN
    doc.text("Company's PAN", 15, footerY + 10);
    doc.setFont('helvetica', 'bold');
    doc.text(`: ${data.PAN_NO || ''}`, 45, footerY + 10);

    // restore normal
    doc.setFont('helvetica', 'normal');

    // THANK YOU
    // doc.text('Thank you for your business!', pageWidth / 2, finalY + 25, {
    //   align: 'center',
    // });

    doc.output('dataurlnewwindow');
  }

  // generatePDF(data: any) {
  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   const pageWidth = doc.internal.pageSize.getWidth();

  //   // =========================================================
  //   // CENTERED INVOICE TITLE
  //   // =========================================================
  //   doc.setFontSize(20);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('INVOICE', pageWidth / 2, 18, { align: 'center' });

  //   // =========================================================
  //   // HEADER TWO-COLUMN LAYOUT
  //   // =========================================================

  //   const leftX = 14;
  //   const rightX = pageWidth / 2 + 5;
  //   let leftY = 32;
  //   let rightY = 32;
  //   const rowGap = 12;

  //   const printLeft = (label: string, value: string) => {
  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(10);
  //     doc.text(label, leftX, leftY);

  //     doc.setFont('helvetica', 'normal');
  //     doc.text(value, leftX, leftY + 5);

  //     leftY += rowGap;
  //   };

  //   const printRight = (label: string, value: string) => {
  //     doc.setFont('helvetica', 'bold');
  //     doc.setFontSize(10);
  //     doc.text(label, rightX, rightY);

  //     doc.setFont('helvetica', 'normal');
  //     doc.text(value, rightX, rightY + 5);

  //     rightY += rowGap;
  //   };

  //   // LEFT SECTION
  //   printLeft('INVOICE DATE', data.RET_DATE.split('T')[0]);
  //   printLeft('INVOICE NO.', data.RET_NO);
  //   printLeft(
  //     'CUSTOMER ID',
  //     data.SUPPLIER_ID ? data.SUPPLIER_ID.toString() : '-'
  //   );

  //   // RIGHT SECTION
  //   printRight('PLACE OF SUPPLY', '--');
  //   printRight('ORDER TYPE', 'Purchase Return');
  //   printRight('NARRATION', data.NARRATION || '--');

  //   // =========================================================
  //   // BILL TO / BILL FROM CLEAN ROW
  //   // =========================================================
  //   const yBill = Math.max(leftY, rightY) + 5;

  //   doc.setFont('helvetica', 'bold');
  //   doc.text('BILL TO', leftX, yBill);
  //   doc.text('BILL FROM', rightX, yBill);

  //   doc.setFont('helvetica', 'normal');
  //   doc.text(data.SUPPLIER_NAME || '-', leftX, yBill + 6);
  //   doc.text(data.COMPANY_NAME || '-', rightX, yBill + 6);

  //   const tableStartY = yBill + 15;

  //   // =========================================================
  //   // ITEM TABLE
  //   // =========================================================
  //   const rows = data.PurchDetail.map((item, idx) => [
  //     (idx + 1).toString(),
  //     item.ITEM_NAME,
  //     item.PENDING_QTY.toString(),
  //     item.RATE.toFixed(2),
  //     item.DISC_PERCENT + '%',
  //     item.VAT_PERC.toFixed(2),
  //     item.AMOUNT.toFixed(2),
  //   ]);

  //   autoTable(doc, {
  //     startY: tableStartY,
  //     head: [
  //       ['#', 'Item Name', 'Qty', 'Price/Unit', 'Discount', 'GST%', 'Amount'],
  //     ],
  //     body: rows,
  //     theme: 'grid',
  //     headStyles: {
  //       fillColor: [210, 230, 255],
  //       textColor: 0,
  //       fontStyle: 'bold',
  //       halign: 'center',
  //     },
  //     styles: {
  //       fontSize: 9,
  //       cellPadding: 3,
  //       lineWidth: 0.1,
  //     },
  //     columnStyles: {
  //       0: { halign: 'center', cellWidth: 10 },
  //       1: { halign: 'left', cellWidth: 65 },
  //       2: { halign: 'center', cellWidth: 15 },
  //       3: { halign: 'right', cellWidth: 25 },
  //       4: { halign: 'right', cellWidth: 20 },
  //       5: { halign: 'center', cellWidth: 15 },
  //       6: { halign: 'right', cellWidth: 25 },
  //     },
  //   });

  //   const finalY = (doc as any).lastAutoTable.finalY + 10;

  //   // =========================================================
  //   // TOTALS SECTION (RIGHT SIDE)
  //   // =========================================================
  //   const totalsX = pageWidth - 60;
  //   let tY = finalY;

  //   const printTotal = (label: string, value: string) => {
  //     doc.setFont('helvetica', 'bold');
  //     doc.text(label, totalsX - 20, tY);
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(value, totalsX + 25, tY, { align: 'right' });
  //     tY += 7;
  //   };

  //   printTotal('SUBTOTAL', data.GROSS_AMOUNT.toFixed(2));
  //   printTotal('GST', data.VAT_AMOUNT.toFixed(2));

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(12);
  //   doc.text('TOTAL', totalsX - 20, tY + 3);
  //   doc.text(data.NET_AMOUNT.toFixed(2), totalsX + 25, tY + 3, {
  //     align: 'right',
  //   });

  //   // =========================================================
  //   // FOOTER
  //   // =========================================================
  //   doc.setFontSize(9);
  //   doc.setFont('helvetica', 'italic');
  //   doc.text('Generated by BOYZONE System', pageWidth / 2, tY + 25, {
  //     align: 'center',
  //   });

  //   doc.output('dataurlnewwindow');
  // }

  cancel() {
    this.popupClosed.emit();
  }

  resetPurchaseReturnForm() {
    this.purchaseReturnFormData = {
      COMPANY_ID: 0,
      STORE_ID: 0,
      RET_DATE: new Date(),
      SUPP_ID: 0,
      GRN_ID: 0,
      GRN_NO: '',
      IS_CREDIT: true,
      GROSS_AMOUNT: 0,
      VAT_AMOUNT: 0,
      NET_AMOUNT: 0,
      USER_ID: 0,
      NARRATION: '',
      CURRENCY_SYMBOL: '',
      PurchDetail: [], // ✔ empty detail list
      SUPPPLIER_NAME: '',
      RETURN_AMOUNT: 0,
    };

    this.selectedSupplierId = null;

    this.mainGridData = []; // ✔ clear grid
    if (this.itemsGridRef && this.itemsGridRef.instance) {
      this.itemsGridRef.instance.refresh();
    }

    this.pendingList = []; // ✔ clear pending list

    this.isApproved = false; // ✔ reset approve checkbox

    // Ensure UI updates
    this.cdr.detectChanges();
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
  declarations: [PurchaseReturnDebitFormComponent],
  exports: [PurchaseReturnDebitFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseReturnDebitFormModule {}
