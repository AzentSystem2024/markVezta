import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { PurchaseInvoiceListComponent } from '../purchase-invoice-list/purchase-invoice-list.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-add-purchase-invoice',
  templateUrl: './add-purchase-invoice.component.html',
  styleUrls: ['./add-purchase-invoice.component.scss'],
})
export class AddPurchaseInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
    sessionData: any;
  selected_vat_id: any;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  supplierList: any;
  isTrOutPopupVisible: boolean = false;
  pendingGRNs: any;
  selectedGRNs: any[] = [];
  mainGridData: any[] = [];
  purchaseInvoiceFormData: any = {
    COMPANY_ID: 1,
    USER_ID: 1,
    STORE_ID: 1,
    PURCH_NO: '',
    STORE_NAME: '',
    SUPPPLIER_NAME: '',
    NARRATION: '',
    STATUS: '',
    PURCH_DATE: new Date(),
    SUPP_ID: '',
    SUPP_INV_NO: '',
    SUPP_INV_DATE: new Date(),
    PO_ID: 1,
    PO_NO: 1,
    FIN_ID: 1,
    TRANS_ID: 1,
    PURCH_TYPE: 1,
    DISCOUNT_AMOUNT: 0,
    SUPP_GROSS_AMOUNT: 0,
    SUPP_NET_AMOUNT: 0,
    EXCHANGE_RATE: 0,
    GROSS_AMOUNT: 0,
    CHARGE_DESCRIPTION: '',
    CHARGE_AMOUNT: 0,
    VAT_AMOUNT: 0,
    NET_AMOUNT: 0,
    RETURN_AMOUNT: 0,
    ADJ_AMOUNT: 0,
    PAID_AMOUNT: 0,
    PurchDetails: [
      {
        COMPANY_ID: '',
        STORE_ID: '',
        PURCH_ID: '',
        GRN_DET_ID: '',
        ITEM_ID: '',
        PACKING: '',
        QUANTITY: '',
        RATE: '',
        AMOUNT: '',
        RETURN_QTY: '',
        ITEM_DESC: '',
        PO_DET_ID: '',
        UOM: '',
        DISC_PERCENT: '',
        COST: '',
        SUPP_PRICE: '',
        SUPP_AMOUNT: '',
        VAT_PERC: '',
        VAT_AMOUNT: '',
        GRN_STORE_ID: '',
        RETURN_AMOUNT: '',
        STORE_NAME: '',
        ITEM_NAME: '',
        ITEM_CODE: '',
        PO_QUANTITY: '',
        GRN_QUANTITY: '',
      },
    ],
  };
  selectedSupplierId: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getSupplierDropdown();
    this.getPendingGRNList();
    this.sessionData_tax();
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

    sessionData_tax(){
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
  }


  getPendingGRNList() {
    const payload = {
      SUPP_ID: this.selectedSupplierId
    }
    this.dataService.getPendingGRN(payload).subscribe((response: any) => {
      this.pendingGRNs = response.Data;
      console.log(this.pendingGRNs, 'PENDINGGRNSSSSSSSSSSSSSSSSSSSSSSSSS');
    });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    const selectedSupplier = this.supplierList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId
    );

    if (selectedSupplier) {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME =
        selectedSupplier.DESCRIPTION;
    } else {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME = '';
    }

    console.log('Selected Supplier:', selectedSupplier);
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'SUPP_PRICE') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'VAT_AMOUNT'));
          }, 50);
        }
      };
    }
    if (e.dataField === 'QUANTITY' && e.parentType === 'dataRow') {
      e.editorOptions = {
        ...e.editorOptions,
        disabled: false,
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

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);
    const vatPerc = parseFloat(row.VAT_PERC) || 0;
    return amt * (vatPerc / 100);
  };

  calculateTotal = (row: any) => {
    return this.calculateAmount(row) + this.calculateGstAmount(row);
  };

  validateQuantity = (e: any) => {
    const quantity = e.value;
    const pendingQty = e.data?.PENDING_QTY ?? 0;
    return quantity <= pendingQty;
  };

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        // Optional: Check for duplicates based on GRN_ID or GRN_NO
        const exists = this.mainGridData.some(
          (item) => item.GRN_DET_ID === row.GRN_DET_ID
        );
        if (!exists) {
          this.mainGridData.push({
            GRN_ID: row.GRN_ID,
            ITEM_ID: row.ITEM_ID,
            PO_DET_ID: row.PO_DET_ID,
            COST: row.COST,
            GRN_DET_ID: row.GRN_DET_ID,
            UOM: row.UOM,
            TRANSFER_NO: row.GRN_NO,
            TRANSFER_DATE: row.GRN_DATE, // if needed
            ITEM_NAME: row.ITEM_NAME,
            PENDING_QTY: row.PENDING_QTY,
            QUANTITY: 0,
            RATE: row.RATE,
            VAT_PERC: 0,
            TAX_AMOUNT: 0,
            AMOUNT: 0,
            TOTAL_AMOUNT: 0,
          });
        }
      });

      this.itemsGridRef.instance.refresh(); // Refresh main grid
      this.popupGridRef.instance.clearSelection();
      // setTimeout(() => {
      //   const lastRowIndex = this.mainGridData.length - 1;
      //   this.itemsGridRef.instance.editCell(lastRowIndex, 'QUANTITY');
      // }, 100);
    }

    this.isTrOutPopupVisible = false; // Close popup
    setTimeout(() => {
      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.editCell(0, 'QUANTITY');
      }
    }, 100);
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
          COMPANY_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          STORE_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          PURCH_ID: 0, // or a real ID if updating
          GRN_DET_ID: item.GRN_DET_ID || '', // populate based on GRN data
          ITEM_ID: item.ITEM_ID,
          PACKING: item.PACKING || '',
          QUANTITY: item.QUANTITY || '',
          RATE: item.RATE || '',
          AMOUNT: this.calculateTotal(item),
          RETURN_QTY: 0, // optional
          ITEM_DESC: item.ITEM_DESC || '',
          PO_DET_ID: item.PO_DET_ID,
          UOM: item.UOM,
          DISC_PERCENT: 0,
          COST: item.COST,
          SUPP_PRICE: item.RATE || 0,
          SUPP_AMOUNT: item.AMOUNT,
          VAT_PERC: item.VAT_PERC || 0,
          VAT_AMOUNT: this.calculateGstAmount(item),
          GRN_STORE_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          RETURN_AMOUNT: 0,
          STORE_NAME: '',
          ITEM_NAME: '',
          ITEM_CODE: '',
          PO_QUANTITY: 1,
          GRN_QUANTITY: 1,
        };
      }
    );

    this.purchaseInvoiceFormData.GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2)
    );
    this.purchaseInvoiceFormData.VAT_AMOUNT = parseFloat(vatAmount.toFixed(2));
    this.purchaseInvoiceFormData.NET_AMOUNT = parseFloat(netAmount.toFixed(2));
    this.purchaseInvoiceFormData.SUPP_GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2)
    );
    this.purchaseInvoiceFormData.SUPP_NET_AMOUNT = parseFloat(
      netAmount.toFixed(2)
    );
    this.purchaseInvoiceFormData.PURCH_DATE =
      this.purchaseInvoiceFormData.PURCH_DATE;

    console.log('Final Payload:', this.purchaseInvoiceFormData);

    this.dataService
      .insertPurchaseInvoice(this.purchaseInvoiceFormData)
      .subscribe({
        next: (res) => {
          notify(
            {
              message: 'Invoice saved successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
            3000
          );
          this.resetInvoiceForm(); // If you have a reset function
          this.popupClosed?.emit();
        },
        error: (err) => {
          console.error('Save failed', err);
        },
      });
  }

  resetInvoiceForm() {
    this.purchaseInvoiceFormData = {
      COMPANY_ID: this.purchaseInvoiceFormData.COMPANY_ID || null, // keep if needed
      STORE_ID: null,
      PURCH_ID: 0,
      GROSS_AMOUNT: 0,
      VAT_AMOUNT: 0,
      NET_AMOUNT: 0,
      SUPP_GROSS_AMOUNT: 0,
      SUPP_NET_AMOUNT: 0,
      SUPPLIER_ID: null,
      INVOICE_NO: '',
      PURCH_DATE: new Date(),
      REMARKS: '',
      PurchDetails: [], // reset line items
    };

    this.mainGridData = []; // clear grid rows
  }

  cancel(){
     this.popupClosed?.emit();
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
  declarations: [AddPurchaseInvoiceComponent],
  exports: [AddPurchaseInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddPurchaseInvoiceModule {}
