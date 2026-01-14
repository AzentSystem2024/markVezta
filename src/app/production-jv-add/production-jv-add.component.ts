import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
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
  styleUrls: ['./production-jv-add.component.scss'],
})
export class ProductionJvAddComponent {
  @ViewChild('itemsGridRef', { static: false })
  itemsGrid!: DxDataGridComponent;
  @Output() formClosed = new EventEmitter<void>();

  Article: any;
  gridData: any[] = [];
  totalAmount: number = 0;
  finalCost: number = 0;
  additionalCost: number = 0;
  unitProductCost: number = 0;

  productionJVFormData: any = {
    DOC_NO: '',
    COMPANY_ID: '',
    FIN_ID: '',
    USER_ID: '',
    REF_NO: '',
    PRODUCTION_DATE: new Date(),
    REMARKS: '',
    TOTAL_ITEM_COST: 0,
    ADDL_COST: 0,
    COST_OF_PRODUCTION: 0,
    PRODUCT_ID: 0,
    UNIT_PRODUCT_COST: 0,
    PROD_QTY: 0,
    RawMaterials: [
      {
        ID: 0,
        UOM: '',
        REQUIRED_QTY: 0,
        USED_QTY: 0,
        QUANTITY: 0,
        COST: 0,
        AMOUNT: 0,
      },
    ],
  };
  selected_Company_id: any;
  selected_fin_id: any;
  user_id: any;

  constructor(private dataservice: DataService, private ngZone: NgZone) {}

  ngOnInit() {
    this.sesstion_Details();
    this.get_ProductDropdown();
    this.getPendingNo();
  }

  //==================== Production Qty Change Handler ===================//
  onProductionQtyChange() {}

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

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
    this.user_id = sessionData.USER_ID;
    console.log(this.user_id, '============user id==================');
    //
  }

  onRowRemoved(e: any) {}

  onEditorPreparing(e: any) {
    // Only for data rows & USED_QTY column
    if (e.parentType === 'dataRow' && e.dataField === 'USED_QTY') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        // 🔥 Update USED_QTY
        e.row.data.USED_QTY = Number(args.value) || 0;

        // 🔥 Recalculate amount
        this.calculateAmount(e.row.data);

        // 🔥 Update totals
        this.calculateTotalAmount();

        // Call default handler (important!)
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }
      };
    }
  }

  Cancel() {
    this.resetForm();
    this.formClosed.emit();
  }

  calculateAmount(row: any) {
    const qtyUsed = Number(row.USED_QTY) || 0;
    const price = Number(row.COST) || 0;
    row.AMOUNT = qtyUsed * price;
  }

  fillComponents() {
    const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
    console.log('Production Qty:', prodQty);

    this.gridData.forEach((item) => {
      const bomQty = Number(item.QUANTITY) || 0;
      console.log('BOM Qty for item', bomQty);

      // 🔥 Calculation
      item.REQUIRED_QTY = prodQty * bomQty;
      console.log('Updated REQUIRED_QTY for item:', item.REQUIRED_QTY);
      item.USED_QTY = item.REQUIRED_QTY;
      item.COST = 1000;
      this.calculateAmount(item);
    });
    // 🔥 FORCE summary recalculation
    this.calculateTotalAmount();

    this.itemsGrid.instance.refresh();
  }

  // onCellValueChanged(e: any) {
  //   console.log('Cell Value Changed Event:', e);

  //   // React only to editable / relevant fields
  //   if (e.dataField === 'USED_QTY' || e.dataField === 'COST') {
  //     this.calculateAmount(e.data);
  //   }
  //    this.calculateTotalAmount();

  //    this.itemsGrid.instance.refresh();
  // }

  onCellValueChanged(e: any) {
    console.log('Cell Value Changed Event:', e);
    const field = e?.column?.dataField;

    console.log('Changed field:', field, 'Row:', e.data);

    if (field === 'USED_QTY' || field === 'COST') {
      this.calculateAmount(e.data);
      this.calculateTotalAmount();
    }
  }

  calculateFinalCost() {
    this.finalCost =
      (Number(this.totalAmount) || 0) + (Number(this.additionalCost) || 0);

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

  getPendingNo() {
    const payload = {
      TRANS_TYPE: 103,
      COMPANY_ID: this.selected_Company_id,
    };
    console.log('Payload for Doc No:', payload);
    this.dataservice.getDocNo(payload).subscribe((response: any) => {
      console.log('Doc No Response Data:', response);
      // this.pendingNo = response.PAYMENT_NO;
      this.productionJVFormData.DOC_NO = response.DOC_NO;
      console.log('Assigned DOC_NO:', this.productionJVFormData.DOC_NO);
    });
  }

  get_ProductDropdown() {
    this.dataservice.getDropdownData('ARTICLE').subscribe((response: any) => {
      console.log('Article Dropdown Data:', response);
      this.Article = response;
    });
  }

  get_Product_In_Article_Production() {
    const payload = {
      ARTICLE_ID: this.productionJVFormData.PRODUCT_ID,
    };
    console.log('Payload for Product In Article Production:', payload);
    this.dataservice
      .get_Product_In_Article_Production_Api(payload)
      .subscribe((response: any) => {
        console.log('Product In Article Production Data:', response);
        this.gridData = response.Data;
      });
  }

  onSave() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      USER_ID: this.user_id,
      REMARKS: this.productionJVFormData.REMARKS,
      PRODUCTION_DATE: this.productionJVFormData.PRODUCTION_DATE,
      TOTAL_ITEM_COST: this.totalAmount,
      COST_OF_PRODUCTION: this.finalCost,
      UNIT_PRODUCT_COST: this.unitProductCost,
      REF_NO: this.productionJVFormData.REF_NO,
      ADDL_COST: this.additionalCost,
      PRODUCT_ID: this.productionJVFormData.PRODUCT_ID,
      PROD_QTY: this.productionJVFormData.PROD_QTY,
      RawMaterials: this.gridData,
    };
    console.log('Payload being sent:', payload);
    this.dataservice
      .Insert_Article_Production_Api(payload)
      .subscribe((res: any) => {
        console.log('Insert success:', res);
        this.resetForm();
        this.formClosed.emit();
        // reset + close only AFTER success
      });
  }

  //   onSave() {
  //   const payload = {
  //     COMPANY_ID: this.productionJVFormData.COMPANY_ID,
  //     FIN_ID: this.productionJVFormData.FIN_ID,
  //     USER_ID: this.productionJVFormData.USER_ID,
  //     REF_NO: this.productionJVFormData.REF_NO,
  //     ADDL_COST: this.additionalCost,
  //     ADDL_DESCRIPTION: this.productionJVFormData.ADDL_DESCRIPTION,
  //     PRODUCT_ID: this.productionJVFormData.PRODUCT_ID,
  //     PROD_QTY: this.productionJVFormData.PROD_QTY,
  //     DETAILS: this.gridData
  //   };

  //   console.log('Payload being sent:', payload);

  //   this.dataservice.Insert_Article_Production_Api(payload).subscribe({
  //     next: (res: any) => {
  //       console.log('Insert success:', res);

  //       // reset + close only AFTER success
  //       this.resetForm();
  //       this.formClosed.emit();
  //     },
  //     error: (err: any) => {
  //       console.error('Insert failed:', err);
  //     }
  //   });
  // }

  resetForm() {
    // 🔹 Reset form model
    this.productionJVFormData = {
      COMPANY_ID: '',
      FIN_ID: '',
      USER_ID: '',
      REF_NO: '',
      ADDL_COST: '',
      ADDL_DESCRIPTION: '',
      PRODUCT_ID: '',
      PROD_QTY: 0,
      gridData: [],
    };

    // 🔹 Reset grid
    this.gridData = [];

    // 🔹 Reset calculated values
    this.totalAmount = 0;
    this.additionalCost = 0;
    this.finalCost = 0;
    this.unitProductCost = 0;

    // 🔹 Reset grid UI safely
    if (this.itemsGrid) {
      this.itemsGrid.instance.cancelEditData();
      this.itemsGrid.instance.refresh();
    }

    console.log('Form reset completed');
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
