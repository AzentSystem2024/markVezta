import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
import { AddCreditNoteModule } from '../pages/CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../pages/CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { AddDebitModule } from '../pages/DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from '../pages/DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from '../pages/DEBIT/view-debit/view-debit.component';
import { AddInvoiceModule } from '../pages/INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from '../pages/INVOICE/edit-invoice/edit-invoice.component';
import {
  InvoiceTrOutAddComponent,
  InvoiceTrOutAddModule,
} from '../pages/INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { InvoiceTrOutComponent } from '../pages/INVOICE/invoice-tr-out/invoice-tr-out.component';
import { ViewInvoiceModule } from '../pages/INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../services';
import { Router } from '@angular/router';
import { get } from 'jquery';

@Component({
  selector: 'app-production-jv-add',
  templateUrl: './production-jv-add.component.html',
  styleUrls: ['./production-jv-add.component.scss']
})
export class ProductionJvAddComponent {
  @ViewChild('itemsGridRef', { static: false })
itemsGrid!: DxDataGridComponent;

  Article: any;
  gridData: any[] = [];
  totalAmount: number = 0;
finalCost: number = 0;  
additionalCost: number = 0;
unitProductCost: number = 0;


    productionJVFormData: any = {
    COMPANY_ID: '',
    FIN_ID: '',
    USER_ID: '',
    REF_NO: '',
    ADDL_COST: '',
    ADDL_DESCRIPTION: '',
    PRODUCT_ID: '',
    PROD_QTY: 0,
    gridData: [
      {
        ARTICLE_PRODUCTION_ID: '',
        ARTICLE_ID: '',
        BOX_ID:'',
        BARCODE:'',
        QUANTITY: 0,
        PRICE: 1200,
        PRODUCTION_DATE: '',
      },
    ],
  };

   constructor(private dataservice: DataService, private ngZone: NgZone) {
      
   }

   ngOnInit() {
    this.get_ProductDropdown();
  
   }

   
   //==================== Production Qty Change Handler ===================//
   onProductionQtyChange() {

}

onProductChange(e: any) {
  const selectedProductId = e.value;

  if (!selectedProductId) {
    return;
  }

  // Update form model explicitly (safe)
  this.productionJVFormData.PRODUCT_ID = selectedProductId;

  // 🔥 Call API
  this.get_Product_In_Article_Production();
}


  onRowRemoved(e: any) {
  }

  onEditorPreparing(e: any) {

  }

  Cancel() {

  }

  calculateAmount(row: any) {
  const qtyUsed = Number(row.QTY_USED) || 0;
  const price = Number(row.PRICE) || 0;
  row.AMOUNT = qtyUsed * price;
}

 fillComponents() {
  const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
  console.log('Production Qty:', prodQty);

  this.gridData.forEach(item => {
    const bomQty = Number(item.QUANTITY) || 0;
    console.log('BOM Qty for item', bomQty);

    // 🔥 Calculation
    item.QTY_REQUIRED = prodQty * bomQty;
    console.log('Updated QTY_REQUIRED for item:', item.QTY_REQUIRED);
    item.QTY_USED = item.QTY_REQUIRED;
    item.PRICE = 1000;
     this.calculateAmount(item);
  });
 // 🔥 FORCE summary recalculation
  this.calculateTotalAmount();

  this.itemsGrid.instance.refresh();
}

onCellValueChanged(e: any) {
  console.log('Cell Value Changed Event:', e);

  // React only to editable / relevant fields
  if (e.dataField === 'QTY_USED' || e.dataField === 'PRICE') {
    this.calculateAmount(e.data);
  }
   this.calculateTotalAmount();

   this.itemsGrid.instance.refresh();
}

calculateFinalCost() {
  this.finalCost = (Number(this.totalAmount) || 0) +
                   (Number(this.additionalCost) || 0);

  console.log('Final Cost:', this.finalCost);
  this.calculateUnitProductCost();
}



calculateTotalAmount() {
  this.totalAmount = this.gridData.reduce((sum, row) => {
    return sum + (Number(row.AMOUNT) || 0);
  }, 0);

  console.log('Total Amount:', this.totalAmount);
  this.calculateFinalCost();
}

onAdditionalCostChange(e: any) {
  this.additionalCost = Number(e.value) || 0;
  console.log('Additional Cost Changed:', this.additionalCost);
  this.calculateFinalCost();
}

//==================== Calculate Unit Product Cost ===================//
calculateUnitProductCost() {
  const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
  const totalCost = Number(this.finalCost) || 0;

  if (prodQty > 0) {
    this.unitProductCost = totalCost / prodQty;
  } else {
    this.unitProductCost = 0; // avoid divide-by-zero
  }

  console.log('Unit Product Cost:', this.unitProductCost);
}


  get_ProductDropdown(){
      this.dataservice.getDropdownData('ARTICLE').subscribe((response: any) => {
        console.log('Article Dropdown Data:', response);
        this.Article = response;
      });
  }

  get_Product_In_Article_Production(){
    const payload = {
      ARTICLE_ID: this.productionJVFormData.PRODUCT_ID,
    };
    console.log('Payload for Product In Article Production:', payload);
    this.dataservice.get_Product_In_Article_Production_Api(payload).subscribe((response: any) => {
      console.log('Product In Article Production Data:', response);
      this.gridData = response.Data;
    });
  }

  onSave(){}
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
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    AddInvoiceModule,
    EditInvoiceModule,
    ViewInvoiceModule,
    InvoiceTrOutAddModule,
  ],
  providers: [],
  declarations: [ProductionJvAddComponent],
  exports: [ProductionJvAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductionJvAddModule {}