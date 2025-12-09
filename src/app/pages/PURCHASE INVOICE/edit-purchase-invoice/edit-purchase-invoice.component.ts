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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddPurchaseInvoiceComponent } from '../add-purchase-invoice/add-purchase-invoice.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



@Component({
  selector: 'app-edit-purchase-invoice',
  templateUrl: './edit-purchase-invoice.component.html',
  styleUrls: ['./edit-purchase-invoice.component.scss'],
})
export class EditPurchaseInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  distributorList: any;
  isTrOutPopupVisible: boolean = false;
  supplierList: any;
  auto: string = 'auto';
  isFilterRowVisible: boolean = false;
  selectedGRNs: any[] = [];
  mainGridData: any[] = [];
  purchaseInvoiceFormData: any;
  pendingGRNs: any;
  isApproved: boolean = false;
  @Input() readOnly: boolean = false;
  purchaseNo: any;
  selectedSupplierId: any;
  sessionData: any;
  selected_vat_id: any;
  selectedInvoice: any;
  HSNCODE: any;
  GST: any;
  selectedCompany: any;
  companyState: any;
  showCGST:boolean = false;
  showGST:boolean=false;
  showSGST:boolean=false;
  selectedSupplier: any;
  taxAmount: any;
  grandTotal: any;
  totalAmount: any;
  netAmount: string;
  summaryValues: any;
  logoBase64: string;

  constructor(private dataService: DataService) {
    const userDataString = localStorage.getItem('userData');
    // if (userDataString) {
    const userData = JSON.parse(userDataString);
    const selectedCompany = userData?.SELECTED_COMPANY;
    this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    this.GST = userData.GeneralSettings.GST_PERC;
    console.log(this.HSNCODE, this.GST, 'HSNCODEANDGST');
    this.sessionData_tax();
  }

  ngOnInit() {
    // this.getSupplierDropdown();
    this.getSupplierOrUnitLst();
    // this.getPendingGRNList();
    this.getPurchNo();
const imagePath = 'assets/markLogo.jpg';
this.convertToBase64(imagePath).then((base64) => {
  this.logoBase64 = base64;
  console.log("Logo Base64 Loaded");
});

    this.sessionData_tax();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;

      this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
 console.log(this.selectedCompany)
 this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
 console.log(this.companyState)
 this.GST = this.sessionData.GeneralSettings.GST_PERC;
 console.log(this.GST,'GST')
  }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['invoiceFormData']) {
//       console.log('Changed invoiceFormData:', this.invoiceFormData);
//       this.purchaseInvoiceFormData = this.invoiceFormData;
//       this.mainGridData = this.purchaseInvoiceFormData.PurchDetails;
//       console.log(this.mainGridData,'mainGridData')
//       this.mainGridData = this.mainGridData.map((row: any) => ({
//         HSN_CODE: this.HSNCODE, // force-create
//         VAT_PERC: row.GST || this.GST, // already showing
//         ...row, // merge original row at the end
//       }));
      
     
//       this.showCGST = true;
//       this.showSGST = true;
//       this.showGST = false;

// //       this.mainGridData = this.mainGridData.map((row: any) => ({
        
// //   ...row,
// //   HSN_CODE: row.HSN_CODE ?? this.HSNCODE,
// //   GST: row.GST ?? 0,
// //   CGST: row.CGST ?? 0,
// //   SGST: row.SGST ?? 0,
// //   VAT_PERC: row.VAT_PERC ?? this.GST,
// // }));

//       this.purchaseInvoiceFormData.SUPP_ID = Number(
//         this.invoiceFormData.SUPP_ID
//       );
//       this.selectedSupplierId = this.purchaseInvoiceFormData.SUPP_ID;
//       if (this.selectedSupplierId) {
//         this.getPendingGRNList();
//       }
//       console.log('SUPP_ID:', this.purchaseInvoiceFormData.SUPP_ID);
//     }
//   }


ngOnChanges(changes: SimpleChanges): void {
  if (changes['invoiceFormData']) {
    console.log('Changed invoiceFormData:', this.invoiceFormData);

    this.purchaseInvoiceFormData = this.invoiceFormData;

    // Load grid data
    this.mainGridData = this.purchaseInvoiceFormData.PurchDetails;

    // Get company and supplier state names
    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState = this.purchaseInvoiceFormData?.SUPP_STATE_NAME?.trim().toLowerCase();

    console.log("Company:", companyState, "Supplier:", supplierState);

    // GST Percentage from session
    const gstPerc = parseFloat(this.GST) || 0;

    // ---------------------------------------------------------
    // CONDITION: SAME STATE → CGST + SGST, DIFFERENT → GST ONLY
    // ---------------------------------------------------------
    if (companyState === supplierState) {
      console.log("Same state → Apply CGST + SGST");

      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      const half = gstPerc / 2;

      this.mainGridData = this.mainGridData.map((row: any) => ({
        ...row,
        HSN_CODE: row.HSN_CODE ?? this.HSNCODE,
        CGST: row.CGST ?? half,
        SGST: row.SGST ?? half,
        GST: 0,                 // GST disabled for same state
        VAT_PERC: half + half,  // total GST
      }));
    } 
    else {
      console.log("Different state → Apply GST only");

      this.showCGST = false;
      this.showSGST = false;
      this.showGST = true;

      this.mainGridData = this.mainGridData.map((row: any) => ({
        ...row,
        HSN_CODE: row.HSN_CODE ?? this.HSNCODE,
        GST: row.GST ?? gstPerc, // Full GST %
        CGST: 0,
        SGST: 0,
        VAT_PERC: gstPerc,
      }));
    }

    // ---------------------------------------------------------
    // Supplier ID assignment
    // ---------------------------------------------------------
    this.purchaseInvoiceFormData.SUPP_ID = Number(this.invoiceFormData.SUPP_ID);
    this.selectedSupplierId = this.purchaseInvoiceFormData.SUPP_ID;

    if (this.selectedSupplierId) {
      this.getPendingGRNList();
    }

    console.log('SUPP_ID:', this.purchaseInvoiceFormData.SUPP_ID);
  }
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

     getSupplierOrUnitLst() {
    this.dataService.getSupplierWithState().subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'DISTLISTPOPUP');
    });
  }

  getPendingGRNList() {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
    };
    this.dataService.getPendingGRN(payload).subscribe((response: any) => {
      this.pendingGRNs = response.Data;
      console.log(this.pendingGRNs, 'PENDINGGRNSSSSSSSSSSSSSSSSSSSSSSSSS');
    });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    const selectedSupplier = this.distributorList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId
    );

     const company = this.companyState?.trim().toLowerCase();
     console.log(company)
     const supplier = selectedSupplier.STATE_NAME?.trim().toLowerCase();
     console.log(supplier)
     const sessionGst = parseFloat(this.GST) || 0; // main GST%
     console.log(sessionGst)

      if (company === supplier) {
      console.log('Both states SAME → CGST + SGST apply');

      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      //  Split GST into CGST + SGST
      const half = sessionGst / 2;

      // Update all grid rows
      this.mainGridData?.forEach((row: any) => {
        row.CGST = half;
        row.SGST = half;
        row.GST = 0; // GST becomes zero in same-state case
      });
    } else {
      console.log('States DIFFERENT → GST applies');

      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;

      // ⭐ GST only
      this.mainGridData?.forEach((row: any) => {
        row.GST = sessionGst;
        row.CGST = 0;
        row.SGST = 0;
      });
    }
    this.selectedSupplier = selectedSupplier

    if (selectedSupplier) {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME =
        selectedSupplier.DESCRIPTION;
    } else {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME = '';
    }

    console.log('Selected Supplier:', selectedSupplier);
  }

    calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);

    const igst = parseFloat(row.GST) || 0; // GST column = GST
    const cgst = parseFloat(row.CGST) || 0;
    const sgst = parseFloat(row.SGST) || 0;

    let totalGstPercent = 0;

    // GST case
    if (igst > 0) {
      totalGstPercent = igst;
    }
    // CGST + SGST case
    else {
      totalGstPercent = cgst + sgst;
    }

    return amt * (totalGstPercent / 100);
  };

  calculateTotal = (row: any) => {
    const amt = this.calculateAmount(row);
    const gst = this.calculateGstAmount(row);
    return amt + gst;
  };

  
  validateQuantity = (e: any) => {
    const quantity = e.value;
    const pendingQty = e.data?.PO_QUANTITY ?? 0;
    return quantity <= pendingQty;
  };

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
    if (e.parentType === 'dataRow') {
      if (e.dataField === 'QUANTITY' || e.dataField === 'VAT_PERC') {
        e.editorOptions.readOnly = false;
        e.editorOptions.disabled = false;
      }
    }
    if (e.dataField === 'SUPP_PRICE') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'TAX_AMOUNT'));
          }, 50);
        }
      };
    }
  }

  openPendingGrnPopup() {
    this.getPendingGRNList();
    this.isTrOutPopupVisible = true;
  }

  calculateAmount = (row: any) => {
    return (parseFloat(row.RATE) || 0) * (parseFloat(row.QUANTITY) || 0);
  };

  // calculateGstAmount = (row: any) => {
  //   const amt = this.calculateAmount(row);
  //   const vatPerc = parseFloat(row.VAT_PERC) || 0;
  //   return amt * (vatPerc / 100);
  // };

  // calculateTotal = (row: any) => {
  //   return this.calculateAmount(row) + this.calculateGstAmount(row);
  // };

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        // Optional: Check for duplicates based on GRN_ID or GRN_NO
        const exists = this.mainGridData.some(
          (item) => item.GRN_DET_ID === row.GRN_DET_ID
        );
         if (!exists) {
        // Add row into mainGridData
        const newRow: any = {
          GRN_ID: row.GRN_ID,
          ITEM_ID: row.ITEM_ID,
          PO_DET_ID: row.PO_DET_ID,
          COST: row.COST,
          GRN_DET_ID: row.GRN_DET_ID,
          UOM: row.UOM,
          TRANSFER_NO: row.GRN_NO,
          TRANSFER_DATE: row.GRN_DATE,
          ITEM_NAME: row.ITEM_NAME,
          PENDING_QTY: row.PENDING_QTY,
          QUANTITY: 0,
          RATE: row.RATE,
          TAX_AMOUNT: 0,
          AMOUNT: 0,
          TOTAL_AMOUNT: 0,
          HSN_CODE: this.HSNCODE,
          VAT_PERC: this.GST,
          SGST:0,
          CGST:0
        };
        console.log(newRow)
         // -----------------------------------------
        // ✅ ADDING GST / CGST / SGST LOGIC HERE
        // -----------------------------------------
        const sessionGst = parseFloat(this.GST) || 0;
        const company = this.companyState?.trim().toLowerCase();
        const customer = this.purchaseInvoiceFormData?.SUPPPLIER_NAME
          ? this.selectedSupplier?.STATE_NAME?.trim().toLowerCase()
          : null;

          console.log(sessionGst,'sesssionGST')
          console.log(company,'company')
          console.log(customer,'customer')
        if (company === customer) {
          // Same state → CGST + SGST
          const half = sessionGst / 2;
          newRow.CGST = half;
          newRow.SGST = half;
          newRow.GST = 0;
        } else {
          // Different state → GST only
          newRow.GST = sessionGst;
          newRow.CGST = 0;
          newRow.SGST = 0;
        }
        // -----------------------------------------

        this.mainGridData.push(newRow);
        }
      });

      this.itemsGridRef.instance.refresh(); // Refresh main grid
      setTimeout(() => {
        const lastRowIndex = this.mainGridData.length - 1;
        this.itemsGridRef.instance.editCell(lastRowIndex, 'QUANTITY');
      }, 100);
    }

    this.isTrOutPopupVisible = false; // Close popup
  }

  getPurchNo() {
    this.dataService.getPurchaseNo().subscribe((response: any) => {
      console.log(response.PURCHASE_NO, 'PURCHASENOOOOOOOOOOOOOOOOOOOO');
      this.purchaseNo = response.PURCHASE_NO;
    });
  }

  savePurchaseInvoice() {
    if (!this.purchaseInvoiceFormData.SUPP_INV_NO) {
      notify(
        {
          message: 'Please supplier invoice number',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000
      );
      return;
    }
    if (!this.purchaseInvoiceFormData.SUPP_ID) {
      notify(
        {
          message: 'Please select a supplier before saving the invoice.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000
      );
      return; // stop execution here
    }

     // 1. Get updated summary values from the grid
    if (this.itemsGridRef?.instance) {
      this.totalAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef.instance.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
    } else {
      notify({
        message: 'Grid instance not available for summary.',
        type: 'warning',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
    }
    
    if (!this.mainGridData || this.mainGridData.length === 0) {
      notify(
        {
          message: 'Please add at least one item before saving the invoice.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000
      );
      return; // stop execution here
    }
    let grossAmount = 0;
    let vatAmount = 0;
    let netAmount = 0;

    this.purchaseInvoiceFormData.PurchDetails = this.mainGridData.map(
      (item: any) => {
        const amount = this.calculateAmount(item);
        const vat = this.calculateGstAmount(item);

        grossAmount += amount;
        vatAmount += vat;
        netAmount += amount + vat;

        return {
          ID: this.purchaseInvoiceFormData.ID,
          COMPANY_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          STORE_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          PURCH_ID: 0,
          GRN_DET_ID: item.GRN_DET_ID || '',
          ITEM_ID: item.ITEM_ID,
          PACKING: item.PACKING || '',
          QUANTITY: item.QUANTITY || '',
          RATE: item.RATE || '',
          AMOUNT: this.calculateTotal(item),
          RETURN_QTY: 0,
          ITEM_DESC: item.ITEM_DESC || '',
          PO_DET_ID: item.PO_DET_ID,
          UOM: item.UOM,
          DISC_PERCENT: 0,
          COST: item.COST,
          SUPP_PRICE: item.RATE || 0,
          SUPP_AMOUNT: item.AMOUNT,
          VAT_PERC: item.VAT_PERC || 0,
          TAX_AMOUNT: this.calculateGstAmount(item),
          GRN_STORE_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          RETURN_AMOUNT: 0,
          STORE_NAME: '',
          ITEM_NAME: '',
          ITEM_CODE: '',
          PO_QUANTITY: 1,
          GRN_QUANTITY: 1,
          NARRATION: this.purchaseInvoiceFormData.NARRATION,
          SGST: item.SGST,
          CGST: item.CGST,
          GST: item.GST ?? 0
        };
      }
    );

    this.purchaseInvoiceFormData.GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2)
    );
    this.purchaseInvoiceFormData.TAX_AMOUNT = parseFloat(vatAmount.toFixed(2));
    this.purchaseInvoiceFormData.NET_AMOUNT = parseFloat(netAmount.toFixed(2));
    this.purchaseInvoiceFormData.SUPP_GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2)
    );
    this.purchaseInvoiceFormData.SUPP_NET_AMOUNT = parseFloat(
      netAmount.toFixed(2)
    );

    if (this.isApproved) {
      // Ask confirmation only if approving
      const result = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirm Approval'
      );
      result.then((dialogResult) => {
        if (dialogResult) {
          this.submitInvoice(); // Call actual API logic
        }
      });
    } else {
      this.submitInvoice(); // Direct for update
    }
  }

  // Separated logic to keep code clean
  submitInvoice() {
    const apiCall = this.isApproved
      ? this.dataService.approvePurchaseInvoice(this.purchaseInvoiceFormData)
      : this.dataService.updatePurchaseInvoice(this.purchaseInvoiceFormData);

    apiCall.subscribe({
      next: (res) => {
        const message = this.isApproved
          ? 'Invoice approved successfully'
          : 'Invoice updated successfully';

        notify(
          {
            message,
            position: { at: 'top right', my: 'top right' },
          },
          'success',
          3000
        );
        this.popupClosed?.emit();
      },
      error: (err) => {
        console.error('Operation failed', err);
      },
    });
  }


    logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
      console.log('GROSS AMOUNT Summary:', this.totalAmount);
      console.log('TAX_AMOUNT Summary:', this.taxAmount);
      console.log('NET AMOUNT Summary:', this.grandTotal);
    } else {
      console.warn('Summary values not ready yet.'); 
    }
  }
  onContentReady(e: any): void {
    this.logGridSummaries();
  }
  
  onRoundOffChange() {
    if (this.purchaseInvoiceFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
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
    const invId = this.purchaseInvoiceFormData.TRANS_ID;
    // Example:
    this.dataService.selectPurchaseInvoice(invId).subscribe((res: any) => {
      this.selectedInvoice = res.Data;
      this.generatePDF(this.selectedInvoice);
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
    const logoW = 30;
    const logoH = 30;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.setFontSize(11);
    // doc.addImage('../', 'PNG', logoX, logoY, logoW, logoH);
      doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // doc.text('logo', logoX + logoW / 2, logoY + logoH / 2 + 3, {
    //   align: 'center',
    // });

    // RIGHT-TOP DETAILS
    const rightX = pageWidth - 15;
    let ty = headerY + 4;

    const purchDate = (data.PURCH_DATE || '').split('T')[0];

    const headerLines = [
      `GST IN : ${data.PURCH_NO}`,
      `CIN :`,
      `PAN:`,
      `e-Way Bill No. : ${this.formatDateDDMMMyyyy(purchDate)}`,
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
// 3) DISPATCHED FROM (LEFT SIDE)
// ============================================================

let dispX = compBoxX;                   // same left alignment
let dispY = compBoxY + compBoxH + 10;   // positioned below company box


let startX = 15;
let startY =  compBoxY + compBoxH + 50; 
let gap = 7; // space between lines

doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.text('Dispatched from', dispX, dispY);



doc.setFontSize(12);
doc.setFont("helvetica", "bold");

doc.text('Invoice Serial No', startX, startY);

doc.setFont("helvetica", "normal");
doc.text('Invoice Date:', startX, startY + gap);
doc.text('Vehicle No:', startX, startY + gap * 2);
doc.text('Mode of Transport:', startX, startY + gap * 3);
// doc.text('Dispatched From:', startX, startY + gap * 4);
dispY += 6;
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);

const dispatchLines = [
  data.DISPATCH_ADDRESS1,
  data.DISPATCH_ADDRESS2,
  data.DISPATCH_ADDRESS3,
  `Pin: ${data.DISPATCH_PIN}`,
];

// Print lines
dispatchLines.forEach(line => {
  if (line) {
    doc.text(line, dispX, dispY);
    dispY += 5;
  }
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
    const tableLineY = buyerY + 40;
    doc.setDrawColor(180);
    doc.line(15, tableLineY, pageWidth - 15, tableLineY);

    // ============================================================
    // 5) TABLE — EXACT SAME WIDTH AS THE LINE (180mm)
    // ============================================================
    const tableStartY = tableLineY + 5;

    const rows = data.PurchDetails.map((item: any, index: number) => [
      index + 1, // Sl No
      item.ITEM_NAME, // Description
      item.GRN_QUANTITY, // Quantity
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

    let amtY = footerY + 20;

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.text("Amount Chargeable (in words)", 15, amtY);

amtY += 6;
doc.setFont('helvetica', 'bold');
doc.text(`INR ${data.AMOUNT_IN_WORDS || ''}`, 15, amtY);


    // THANK YOU
    // doc.text('Thank you for your business!', pageWidth / 2, finalY + 25, {
    //   align: 'center',
    // });

    doc.output('dataurlnewwindow');
  }

  // Convert amount to words (simple version)
  numberToWords(amount: number): string {
    return 'INR ' + amount.toFixed(0) + ' Only';
  }

  cancel() {
    this.popupClosed?.emit();
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [EditPurchaseInvoiceComponent],
  exports: [EditPurchaseInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditPurchaseInvoiceModule {}
