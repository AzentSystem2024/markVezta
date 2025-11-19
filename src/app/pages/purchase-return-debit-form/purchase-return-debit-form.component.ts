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
    this.isEditDataAvailable();
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
      VAT_PERC: item.VAT_PERC,
      VAT_AMOUNT: item.VAT_AMOUNT,
      TOTAL_AMOUNT: item.TOTAL_AMOUNT,
      UOM: item.UOM,
      UOM_PURCH: item.UOM_PURCH,
      UOM_MULTIPLE: item.UOM_MULTIPLE,
      BARCODE: item.BAR_CODE,
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
            VAT_PERC: row.VAT_PERC,
            VAT_AMOUNT: row.TAX_AMOUNT,
            TOTAL_AMOUNT: 0,
            UOM: row.UOM,
            UOM_PURCH: row.UOM_PURCH,
            UOM_MULTIPLE: row.UOM_MULTIPLE,
            BARCODE: row.BARCODE,
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
          TOTAL_AMOUNT: row.TOTAL_AMOUNT ?? 0,
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
      if (this.isApproved) {
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
                  this.getDocNo();
                  this.popupClosed.emit();
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

  openPDF() {
    // Call your PDF API or open a URL
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.ID;
    // Example:
    this.dataService.selectPurchaseReturn(returnId).subscribe((res: any) => {
      this.generatePDF(res);
    });
  }

  // generatePDF(data: any) {
  //   const doc = new jsPDF();

  //   // --- HEADER ---
  //   // --- HEADER ---
  //   // --- HEADER ---
  //   doc.setFontSize(16);

  //   const title = 'Purchase Return Invoice';
  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const textWidth = doc.getTextWidth(title);

  //   doc.text(title, (pageWidth - textWidth) / 2, 15);

  //   // ===================================================================
  //   //                 HEADER WITH SPLIT LEFT + RIGHT SECTIONS
  //   // ===================================================================

  //   doc.setFontSize(11);

  //   // LEFT SIDE → Supplier
  //   let leftLabelX = 14;
  //   let leftColonX = 45;
  //   let leftValueX = 50;
  //   let leftY = 25;

  //   // RIGHT SIDE → Return No / Date / Narration
  //   let rightLabelX = pageWidth - 90;
  //   let rightColonX = pageWidth - 60;
  //   let rightValueX = pageWidth - 55;
  //   let rightY = 25;

  //   // LEFT SIDE PRINTER (Only Supplier)
  //   const printLeftRow = (label: string, value: string) => {
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(label, leftLabelX, leftY);
  //     doc.text(':', leftColonX, leftY);
  //     doc.text(value, leftValueX, leftY);
  //     leftY += 7;
  //   };

  //   // RIGHT SIDE PRINTER (Return No / Date / Narration)
  //   const printRightRow = (label: string, value: string) => {
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(label, rightLabelX, rightY);
  //     doc.text(':', rightColonX, rightY);
  //     doc.text(value, rightValueX, rightY);
  //     rightY += 7;
  //   };

  //   // --- PRINT HEADER FIELDS ---
  //   printLeftRow('Supplier', data.SUPPLIER_NAME);

  //   printRightRow('Return No', data.RET_NO);
  //   printRightRow('Return Date', data.RET_DATE.split('T')[0]);
  //   printRightRow('Narration', data.NARRATION || '-');

  //   // --- TABLE ROWS (using your actual API fields) ---
  //   const rows = data.PurchDetail.map((item) => [
  //     item.DOC_NO, // Transfer No
  //     item.PURCH_DATE?.split('T')[0] || '', // Date
  //     item.ITEM_NAME, // Item Description
  //     item.PENDING_QTY, // Pending Qty
  //     item.RATE.toFixed(2), // Price
  //     item.AMOUNT.toFixed(2), // Amount
  //     item.VAT_PERC.toFixed(2), // TAX%
  //     item.VAT_AMOUNT.toFixed(2), // Tax Amount
  //     item.TOTAL_AMOUNT.toFixed(2), // Total Amount
  //   ]);

  //   // --- TABLE ---
  //   autoTable(doc, {
  //     startY: 55,
  //     head: [
  //       [
  //         'Transfer No',
  //         'Date',
  //         'Item Description',
  //         'Pending Qty',
  //         'Price',
  //         'Amount',
  //         'TAX%',
  //         'Tax Amount',
  //         'Total Amount',
  //       ],
  //     ],
  //     body: rows,
  //     theme: 'grid',
  //     headStyles: {
  //       fillColor: [207, 231, 255], // SAME BLUE COLOR AS SAMPLE
  //       textColor: 0,
  //       fontStyle: 'bold',
  //       halign: 'center',
  //       fontSize: 10,
  //     },
  //     bodyStyles: {
  //       halign: 'center',
  //       fontSize: 9,
  //     },
  //     columnStyles: {
  //       2: { halign: 'left' }, // Item Description → left aligned
  //     },
  //     styles: {
  //       lineWidth: 0.1, // ✨ key change — makes table look clean
  //       lineColor: [180, 180, 180],
  //       textColor: 0,
  //     },
  //   });

  //   // --- FOOTER TOTALS ---
  //   // --- FOOTER TOTALS ---
  //   let finalY = (doc as any).lastAutoTable.finalY + 15;

  //   doc.setFontSize(11);

  //   // -------------------------------
  //   // 1. Define alignment columns
  //   // -------------------------------
  //   const labelEndX = pageWidth - 40; // Where labels (ends) align
  //   const amountEndX = pageWidth - 20; // Right edge for values

  //   // -------------------------------
  //   // 2. Helper to print aligned rows
  //   // -------------------------------
  //   const printFooterRow = (label: string, value: string, y: number) => {
  //     // LABEL (right aligned at labelEndX)
  //     doc.setFont('helvetica', 'normal');
  //     doc.text(label, labelEndX, y, { align: 'right' });

  //     // VALUE (right aligned at amountEndX)
  //     doc.setFont('helvetica', 'bold');
  //     doc.text(value, amountEndX, y, { align: 'right' });
  //   };

  //   // -------------------------------
  //   // 3. Print Rows
  //   // -------------------------------
  //   printFooterRow('Gross Amount', data.GROSS_AMOUNT.toFixed(2), finalY);
  //   printFooterRow('VAT Amount', data.VAT_AMOUNT.toFixed(2), finalY + 7);
  //   printFooterRow('Net Amount', data.NET_AMOUNT.toFixed(2), finalY + 14);

  //   // -------------------------------
  //   // 4. Thank You Text
  //   // -------------------------------
  //   let thanksY = finalY + 30;
  //   doc.setFontSize(12);
  //   doc.setFont('helvetica', 'italic');
  //   doc.text('Thank you for your business!', pageWidth / 2, thanksY, {
  //     align: 'center',
  //   });

  //   // --- OPEN PDF ---
  //   doc.output('dataurlnewwindow');
  // }

  generatePDF(data: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // =========================================================
    //   COMPANY NAME (LEFT) + DATE / INVOICE # / CUSTOMER ID (RIGHT SAME ROW)
    // =========================================================

    // LEFT: Company Name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(data.COMPANY_NAME || 'Company Name', 14, 18);

    // RIGHT: Info Block
    doc.setFontSize(10);
    let infoY = 18; // SAME ROW AS COMPANY NAME
    const rightLabelX = pageWidth - 70;
    const rightValueX = pageWidth - 20;

    const printInfo = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, rightLabelX, infoY);

      doc.setFont('helvetica', 'normal');
      doc.text(': ' + value, rightValueX, infoY, { align: 'right' });

      infoY += 6;
    };

    printInfo('DATE', data.RET_DATE.split('T')[0]);
    printInfo('INVOICE #', data.RET_NO);
    printInfo('CUSTOMER ID', data.SUPPLIER_ID || '-');

    // =========================================================
    //                      INVOICE TITLE (BELOW INFO BLOCK)
    // =========================================================
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 60, infoY + 10);

    // =========================================================
    //                  BILL TO & SHIP TO BOXES (LIGHT BLUE)
    // =========================================================
    let blockY = infoY + 25; // move below "INVOICE"

    doc.setFillColor(210, 230, 255);

    // BILL TO
    doc.rect(14, blockY, 80, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 18, blockY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPPLIER_NAME || '-', 18, blockY + 15);

    // SHIP TO
    doc.setFillColor(210, 230, 255);
    doc.rect(110, blockY, 80, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text('SHIP TO:', 114, blockY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.COMPANY_NAME || '-', 114, blockY + 15);

    // =========================================================
    //                        ITEM TABLE
    // =========================================================

    const rows = data.PurchDetail.map((item) => [
      item.DOC_NO,
      item.PURCH_DATE?.split('T')[0] || '',
      item.ITEM_NAME,
      item.PENDING_QTY,
      item.RATE.toFixed(2),
      item.AMOUNT.toFixed(2),
      item.VAT_PERC.toFixed(2),
      item.VAT_AMOUNT.toFixed(2),
      item.TOTAL_AMOUNT.toFixed(2),
    ]);

    autoTable(doc, {
      startY: blockY + 30,
      head: [
        [
          'Transfer No',
          'Date',
          'Item Description',
          'Pending Qty',
          'Price',
          'Amount',
          'TAX%',
          'Tax Amount',
          'Total Amount',
        ],
      ],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [210, 230, 255],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        halign: 'center',
        textColor: 0,
        fontSize: 9,
      },
      columnStyles: {
        2: { halign: 'left' },
      },
      styles: {
        lineWidth: 0.1,
      },
    });

    // =========================================================
    //                   TOTALS SECTION
    // =========================================================
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);

    doc.rect(pageWidth - 70, finalY, 55, 35);

    const printTotal = (label: string, value: string, y: number) => {
      doc.text(label, pageWidth - 66, y);
      doc.text(value, pageWidth - 18, y, { align: 'right' });
    };

    printTotal('SUBTOTAL', data.GROSS_AMOUNT.toFixed(2), finalY + 7);
    printTotal('TAX', data.VAT_AMOUNT.toFixed(2), finalY + 14);
    printTotal('TOTAL', data.NET_AMOUNT.toFixed(2), finalY + 28);

    // =========================================================
    //                        NOTES BOX
    // =========================================================
    doc.rect(14, finalY, 120, 35);

    doc.setFont('helvetica', 'bold');
    doc.text('Other Comments or Special Instructions', 18, finalY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text('1. Total payment due in 30 days', 18, finalY + 15);
    doc.text(
      '2. Please include the invoice number on your check',
      18,
      finalY + 22
    );

    // =========================================================
    //                       FOOTER MESSAGE
    // =========================================================
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank You For Your Business!', pageWidth / 2, finalY + 55, {
      align: 'center',
    });

    doc.output('dataurlnewwindow');
  }

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
