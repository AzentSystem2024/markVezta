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

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getSupplierDropdown();
    // this.getPendingGRNList();
    this.getPurchNo();
    this.sessionData_tax();
  }

      sessionData_tax(){
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData']) {
      console.log('Changed invoiceFormData:', this.invoiceFormData);
      this.purchaseInvoiceFormData = this.invoiceFormData;
      this.mainGridData = this.purchaseInvoiceFormData.PurchDetails;
      console.log(
        this.purchaseInvoiceFormData.PurchDetails,
        'PURCHASEEEEEEEEEEEEEEEEEEEEEEEE'
      );
      this.purchaseInvoiceFormData.SUPP_ID = Number(
        this.invoiceFormData.SUPP_ID
      );
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

  validateQuantity = (e: any) => {
    const quantity = e.value;
    const pendingQty = e.data?.PENDING_QTY ?? 0;
    return quantity <= pendingQty;
  };

  onEditorPreparing(e: any) {
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

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);
    const vatPerc = parseFloat(row.VAT_PERC) || 0;
    return amt * (vatPerc / 100);
  };

  calculateTotal = (row: any) => {
    return this.calculateAmount(row) + this.calculateGstAmount(row);
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
            GRN_NO: row.GRN_NO,
            GRN_DATE: row.GRN_DATE, // if needed
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
  declarations: [EditPurchaseInvoiceComponent],
  exports: [EditPurchaseInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditPurchaseInvoiceModule {}
