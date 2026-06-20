import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NgModule, SimpleChanges } from '@angular/core';
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

@Component({
  selector: 'app-add-sales-invoice-retail',
  templateUrl: './add-sales-invoice-retail.component.html',
  styleUrls: ['./add-sales-invoice-retail.component.scss']
})
export class AddSalesInvoiceRetailComponent {
 @Input() EditingResponseData: any;
  
    // MAIN FORM MODEL
  invoiceFormData: any = {
    DOC_NO: '',
    TRANS_DATE: null,
    STORE_NAME: '',
    CUST_NAME: '',
    SALESMAN: '',
    Details: []
  };

  // ✅ TENDER LIST
  tenderList: any[] = [];

  // ✅ TOTALS
  totalQty = 0;
  totalExclVAT = 0;
  vatAmount = 0;
  totalInclVAT = 0;
  totalTender =0;

ngOnChanges(changes: SimpleChanges) {
    if (changes['EditingResponseData'] && this.EditingResponseData) {
      this.bindData(this.EditingResponseData);
    }
  }

  // ✅ MAIN BIND FUNCTION
  bindData(data: any) {
    console.log('Incoming Data:', data);

    const header = data?.Header;
    if (!header) return;

    // 🔹 Assign values (DO NOT replace whole object)
    this.invoiceFormData.DOC_NO = header.INVOICE_NO;
    this.invoiceFormData.TRANS_DATE = header.SALE_DATE ? new Date(header.SALE_DATE) : null;
    this.invoiceFormData.STORE_NAME = header.STORE_NAME || '';
    this.invoiceFormData.CUST_NAME = header.CUST_NAME || '';
    this.invoiceFormData.SALESMAN = header.EMP_NAME || '';

    // 🔹 DETAILS GRID
    this.invoiceFormData.Details = (data.Details || []).map((d: any) => ({
      ITEM_CODE: d.ITEM_CODE,
      DESCRIPTION: d.DESCRIPTION,
      QUANTITY: d.QUANTITY,
      PRICE: d.PRICE,
      DISC_PERC: d.DISCOUNT || 0,
      AMOUNT_INCL_VAT: d.AMOUNT_INCL_VAT || 0,
      TAX_PERC: d.VAT_PERCENT || 0,
      TAX_AMOUNT: d.VAT_AMOUNT || 0,
      TOTAL_AMOUNT: d.AMOUNT_INCL_VAT || 0,
      AMOUNT_EXCL_VAT:
    (d.AMOUNT_INCL_VAT || 0) - (d.VAT_AMOUNT || 0)
    }));

    // 🔹 TENDER GRID
    this.tenderList = (data.Tenders || []).map((t: any) => ({
      TYPE: t.DESCRIPTION,
      AMOUNT: t.AMOUNT
    }));

    // 🔹 TOTALS
    this.totalQty = this.invoiceFormData.Details.reduce(
      (sum: number, x: any) => sum + (x.QUANTITY || 0), 0
    );

     this.vatAmount = this.invoiceFormData.Details.reduce(
  (sum: number, x: any) => sum + (x.TAX_AMOUNT || 0),
  0
);
    this.totalInclVAT = this.invoiceFormData.Details.reduce(
  (sum: number, x: any) => sum + (x.AMOUNT_INCL_VAT || 0),
  0
);

   this.totalExclVAT =
  this.totalInclVAT - this.vatAmount;

   

this.totalTender = this.tenderList.reduce(
  (sum: number, t: any) => sum + (t.AMOUNT || 0),
  0
);
  }

  cancel() {
    console.log('Cancelled');
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
  declarations: [AddSalesInvoiceRetailComponent],
  exports: [AddSalesInvoiceRetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddSalesInvoiceRetailModule {}