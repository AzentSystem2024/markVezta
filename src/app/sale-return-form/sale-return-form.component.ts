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
import { FormTextboxModule } from '../components';
import { PurchaseReturnDebitFormComponent } from '../pages/purchase-return-debit-form/purchase-return-debit-form.component';

@Component({
  selector: 'app-sale-return-form',
  templateUrl: './sale-return-form.component.html',
  styleUrls: ['./sale-return-form.component.scss'],
})
export class SaleReturnFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
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
  customerList: any;
  sameState: boolean = false;
  netAmount: string;
  grandTotal: number;
  // salesReturnFormData: any;
  pendingList: any;
  isSaving: boolean = false;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  salesReturnFormData: any = {
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
    // RET_NO: '',
    VEHICLE_NO: '',
    ROUND_OFF: false,
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
        CGST: 0,
        SGST: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        UOM: '',
        UOM_PURCH: '',
        UOM_MULTIPLE: 0,
        PURCH_DET_ID: 0,
      },
    ],
  };
  constructor() {}

  ngOnInit() {}

  onCustomerChanged(e: any) {}

  onTransferSelectClick() {}

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
    const totalRate = Number(rowData.RATE) || 0;
    const pendingQty = Number(rowData.PENDING_QTY) || 0;
    // const rate = Number(rowData.RATE) || 0;
    // const rate = pendingQty > 0 ? totalRate / pendingQty : 0;

    // const amount = qty * rate;
    const amount = qty * totalRate;
    // also store the calculated amount inside the row (optional)
    rowData.AMOUNT = amount;

    return amount;
  };

  calculateVATAmount = (rowData: any) => {
    if (!rowData) return 0;

    const amount = Number(rowData.AMOUNT) || 0;

    if (this.sameState) {
      const cgst = Number(rowData.CGST) || 0;
      const sgst = Number(rowData.SGST) || 0;

      return (amount * (cgst + sgst)) / 100;
    } else {
      const igst = Number(rowData.VAT_PERC);
      return (amount * igst) / 100;
    }
  };

  calculateTotalAmount = (rowData) => {
    return this.calculateAmount(rowData) + this.calculateVATAmount(rowData);
  };

  onRoundOffChange() {
    if (this.salesReturnFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
    }
  }

  onEditorPreparing(e: any) {}

  openPendingGrnPopup() {}

  onContentReady(e: any) {}

  saveSaleReturn() {}

  cancel() {}

  resetPurchaseReturnForm() {}

  openPDF() {}
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
  declarations: [SaleReturnFormComponent],
  exports: [SaleReturnFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SaleReturnFormModule {}
