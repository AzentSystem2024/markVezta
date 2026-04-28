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
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { SaleReturnFormComponent } from 'src/app/sale-return-form/sale-return-form.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';
import dxSelectBox from 'devextreme/ui/select_box';

@Component({
  selector: 'app-add-sales-invoice-retail',
  templateUrl: './add-sales-invoice-retail.component.html',
  styleUrls: ['./add-sales-invoice-retail.component.scss']
})
export class AddSalesInvoiceRetailComponent {
 @Input() EditingResponseData: any;
   invoiceFormData: any = {
    DOC_NO: '',
    TRANS_DATE: new Date(),
    STORE_ID: null,
    CUSTOMER_ID: null,
    Details: [
      {
        ITEM_CODE: '',
        DESCRIPTION: '',
        QUANTITY: 0,
        PRICE: 0,
        DISC_PERC: 0,
        TAX_PERC: 0
      }
    ]
  };

  filteredStoreList = [];
  customerList = [];

  tenderList = [
    { TYPE: 'FAB POS CARD', AMOUNT: 138 }
  ];

  totalQty = 2;
  totalExclVAT = 131.43;
  vatAmount = 6.57;
  totalInclVAT = 138;

  calculateAmount = (row: any) => {
    return row.PRICE * row.QUANTITY;
  };

  calculateDiscAmt = (row: any) => {
    return (row.PRICE * row.QUANTITY) * (row.DISC_PERC || 0) / 100;
  };

  calculateTax = (row: any) => {
    const amount = this.calculateAmount(row);
    return amount * (row.TAX_PERC || 0) / 100;
  };

  calculateTotal = (row: any) => {
    const amount = this.calculateAmount(row);
    const tax = this.calculateTax(row);
    const disc = this.calculateDiscAmt(row);
    return amount + tax - disc;
  };

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