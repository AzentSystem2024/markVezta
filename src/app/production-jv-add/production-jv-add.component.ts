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
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { confirm } from 'devextreme/ui/dialog';
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
import { InvoiceTrOutComponent } from '../pages/OPERATIONS/invoice-tr-out/invoice-tr-out.component';
import { ViewInvoiceModule } from '../pages/INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../services';
import { Router } from '@angular/router';
import { get } from 'jquery';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-production-jv-add',
  templateUrl: './production-jv-add.component.html',
  styleUrls: ['./production-jv-add.component.scss'],
})
export class ProductionJvAddComponent {
  @ViewChild('itemsGridRef', { static: false })
  itemsGrid!: DxDataGridComponent;
  @Output() formClosed = new EventEmitter<void>();
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() selectedProductionType: 'ARTICLE' | 'BOX' = 'ARTICLE';

  Article: any;
  gridData: any[] = [];
  totalAmount: number = 0;
  finalCost: number = 0;
  // additionalCost: number = 0;
  unitProductCost: number = 0;
  isApproved: boolean = false;

  productionJVFormData: any = {
    ID: 0,
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
    STATUS: 1,
    PRODUCTION_TYPE: 1, // 1 = ARTICLE, 2 = BOX

    RawMaterials: [
      {
        ID: 0,
        UOM: '',
        REQUIRED_QTY: 0,
        QTY_AVAILABLE: 0,
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

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.sesstion_Details();
    this.get_ProductDropdown();
    // this.getPendingNo();
    if (!this.isEditing) {
      this.initAddForm();
    }
    if (!this.isEditing) {
      this.productionJVFormData.PRODUCTION_DATE = new Date();
    }

    this.isEditDataAvailable();
  }

  initAddForm() {
    this.productionJVFormData = {
      ID: 0,
      DOC_NO: '',
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      USER_ID: this.user_id,
      REF_NO: '',
      PRODUCTION_DATE: new Date(), // ✅ ALWAYS SET
      REMARKS: '',
      TOTAL_ITEM_COST: 0,
      ADDL_COST: 0,
      COST_OF_PRODUCTION: 0,
      PRODUCT_ID: 0,
      UNIT_PRODUCT_COST: 0,
      PROD_QTY: 0,
      STATUS: 1,
      PRODUCTION_TYPE: 1,
      RawMaterials: [],
    };

    this.gridData = [];
    this.totalAmount = 0;
    // this.additionalCost = 0;
    this.finalCost = 0;
    this.unitProductCost = 0;

    this.getPendingNo(); // ✅ ALWAYS FETCH NEW DOC NO
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

    //  Call API
    // this.get_Product_In_Article_Production();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.user_id = sessionData.USER_ID;
    console.log(this.user_id, '============user id==================');
    //
  }

  onRowRemoved(e: any) {}

  onEditorPreparing(e: any) {
    if (e.dataField === 'USED_QTY') {
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
    }

    // Only for data rows & USED_QTY column
    if (e.parentType === 'dataRow' && e.dataField === 'USED_QTY') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        //  Update USED_QTY
        e.row.data.USED_QTY = Number(args.value) || 0;

        //  Recalculate amount
        this.calculateAmount(e.row.data);

        //  Update totals
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

  //  fillComponents() {
  //   const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
  //   console.log('Production Qty:', prodQty);

  //   this.gridData.forEach(item => {
  //     const bomQty = Number(item.QUANTITY) || 0;
  //     console.log('BOM Qty for item', bomQty);

  //     //  Calculation
  //     item.REQUIRED_QTY = prodQty * bomQty;
  //     console.log('Updated REQUIRED_QTY for item:', item.REQUIRED_QTY);
  //     item.USED_QTY = item.REQUIRED_QTY;
  //     item.COST = 1000;
  //      this.calculateAmount(item);
  //   });
  //  //  FORCE summary recalculation
  //   this.calculateTotalAmount();

  //   this.itemsGrid.instance.refresh();
  // }

  fillComponents() {
    const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;

    //  VALIDATION: Product required
    if (!this.productionJVFormData.PRODUCT_ID) {
      notify(
        {
          message: 'Please select a Product',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return;
    }

    //  VALIDATION: Production Qty required
    if (!prodQty || prodQty <= 0) {
      notify(
        {
          message: 'Please enter Production Quantity',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return; //  STOP execution
    }

    const payload = {
      ARTICLE_ID: this.productionJVFormData.PRODUCT_ID,
    };

    console.log('Payload for Product In Article Production:', payload);

    this.dataservice
      .get_Product_In_Article_Production_Api(payload)
      .subscribe((response: any) => {
        console.log('Product In Article Production Data:', response);

        //  Set grid data ONLY here
        this.gridData = response.Data;

        //  Apply existing logic (UNCHANGED)
        this.gridData.forEach((item) => {
          const bomQty = Number(item.QUANTITY) || 0;
          item.QTY_AVAILABLE = item.QTY_AVAILABLE;
          item.REQUIRED_QTY = prodQty * bomQty;
          item.USED_QTY = item.REQUIRED_QTY;
          // item.COST = 1000;

          this.calculateAmount(item);
        });

        this.calculateTotalAmount();
        this.itemsGrid.instance.refresh();
      });
  }

  onCellValueChanged(e: any) {
    console.log('Cell Value Changed Event:', e);
    const field = e?.column?.dataField;

    console.log('Changed field:', field, 'Row:', e.data);

    if (field === 'USED_QTY' || field === 'COST') {
      this.calculateAmount(e.data);
      this.calculateTotalAmount();
    }
  }

  // calculateFinalCost() {
  //   //  const addlCost = Number(this.productionJVFormData.ADDL_COST) || 0;
  //   this.finalCost =
  //     (Number(this.totalAmount) || 0) + (Number(this.additionalCost) || 0);

  //   console.log('Final Cost:', this.finalCost);
  //   this.calculateUnitProductCost();
  // }

  calculateFinalCost() {
    this.finalCost =
      (Number(this.totalAmount) || 0) +
      (Number(this.productionJVFormData.ADDL_COST) || 0);

    this.calculateUnitProductCost();
  }

  calculateTotalAmount() {
    this.totalAmount = this.gridData.reduce((sum, row) => {
      return sum + (Number(row.AMOUNT) || 0);
    }, 0);

    console.log('Total Amount:', this.totalAmount);
    this.calculateFinalCost();
  }

  // onAdditionalCostChange(e: any) {

  //   this.additionalCost = Number(e.value) || 0;
  //   console.log('Additional Cost Changed:', this.additionalCost);
  //   this.calculateFinalCost();
  // }

  onAdditionalCostChange(e: any) {
    this.productionJVFormData.ADDL_COST = Number(e.value) || 0;
    console.log(
      'Additional Cost Changed:',
      this.productionJVFormData.ADDL_COST,
    );
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

  private formatDateForApi(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // yyyy-MM-dd
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) {
      return; // Not edit mode → nothing to load
    }

    const header = this.EditingResponseData.Header;
    const rawMaterials = this.EditingResponseData.RawMaterials || [];

    console.log('EDIT HEADER:', header);
    console.log('EDIT RAW MATERIALS:', rawMaterials);

    // ================= DATE PARSE =================
    const productionDate = header.PROD_DATE
      ? new Date(header.PROD_DATE)
      : new Date();

    // ================= HEADER BINDING =================
    this.productionJVFormData = {
      ID: header.PRODUCTION_ID,
      DOC_NO: header.PROD_NO,
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      USER_ID: this.user_id,

      REF_NO: header.REF_NO,
      PRODUCTION_DATE: productionDate,
      REMARKS: header.REMARKS || '',
      TOTAL_ITEM_COST: header.TOTAL_COST || 0,
      ADDL_COST: header.ADDL_COST || 0,
      COST_OF_PRODUCTION: header.COST_PRODUCTION || 0,
      STATUS: header.STATUS,
      PRODUCT_ID: header.PRODUCT_ID,
      PROD_QTY: header.PRODUCED_QTY || 0,
      UNIT_PRODUCT_COST: header.UNIT_COST || 0,

      PRODUCTION_TYPE: header.PRODUCTION_TYPE ?? 1,

      RawMaterials: [], // will be set below
    };

    // ================= GRID DATA =================
    this.gridData = rawMaterials.map((item: any) => ({
      ID: item.ITEM_ID,
      // ITEM_ID: item.ITEM_ID,
      ITEM_CODE: item.ITEM_CODE,
      DESCRIPTION: item.DESCRIPTION,
      UOM: item.UOM,

      // BOM_QTY: Number(item.BOM_QTY) || 0,
      REQUIRED_QTY: Number(item.REQUIRED_QTY) || 0,
      USED_QTY: Number(item.USED_QTY) || 0,

      UNIT_COST: Number(item.UNIT_COST) || 0,
      // TOTAL_COST: Number(item.TOTAL_COST) || 0,
      QTY_AVAILABLE: Number(item.QTY_AVAILABLE) || 0,
      // derived / editable fields
      QUANTITY: Number(item.USED_QTY) || 0,
      COST: Number(item.UNIT_COST) || 0,
      AMOUNT: (Number(item.USED_QTY) || 0) * (Number(item.UNIT_COST) || 0),
    }));

    // ================= RECALCULATE TOTALS =================
    this.totalAmount = this.gridData.reduce(
      (sum: number, row: any) => sum + (row.AMOUNT || 0),
      0,
    );

    this.finalCost =
      this.totalAmount + (Number(this.productionJVFormData.ADDL_COST) || 0);

    this.unitProductCost =
      this.productionJVFormData.PROD_QTY > 0
        ? this.finalCost / this.productionJVFormData.PROD_QTY
        : 0;

    // ================= GRID REFRESH =================
    // setTimeout(() => {
    //   if (this.itemsGridRef?.instance) {
    //     this.itemsGridRef.instance.refresh();
    //   }
    // }, 200);

    console.log('EDIT MODE FORM DATA:', this.productionJVFormData);
    console.log('EDIT MODE GRID DATA:', this.gridData);
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
    this.dataservice
      .getDropdownDataforProduct('ARTICLE')
      .subscribe((response: any) => {
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

  // onSave() {

  //   // =====================================================
  // //  VALIDATION 1: PRODUCT MUST BE SELECTED
  // // =====================================================
  // if (!this.productionJVFormData.PRODUCT_ID) {
  //   notify(
  //     {
  //       message: 'Please select a product',
  //       position: { at: 'top right', my: 'top right' },
  //     },
  //     'error',
  //     3000
  //   );
  //   return;
  // }

  // // =====================================================
  // //  VALIDATION 2: PRODUCT QUANTITY MUST BE ENTERED
  // // =====================================================
  // const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
  // if (prodQty <= 0) {
  //   notify(
  //     {
  //       message: 'Please enter a product quantity',
  //       position: { at: 'top right', my: 'top right' },
  //     },
  //     'error',
  //     3000
  //   );
  //   return;
  // }
  //   //  VALIDATION: USED_QTY must be <= AVAILABLE_QTY
  // const invalidRow = this.gridData.find((item: any) => {
  //   const usedQty = Number(item.USED_QTY) || 0;
  //   const availableQty = Number(item.AVAILABLE_QTY) || 0; //  adjust field name if needed

  //   return usedQty > availableQty;
  // });

  // if (invalidRow) {
  //   notify(
  //     {
  //       message: 'Used Quantity cannot be greater than Available Quantity',
  //       position: { at: 'top right', my: 'top right' },
  //     },
  //     'error',
  //     4000
  //   );
  //   return; //  STOP SAVE
  // }

  //   const payload = {
  //     COMPANY_ID: this.selected_Company_id,
  //     FIN_ID: this.selected_fin_id,
  //     USER_ID: this.user_id,
  //     REMARKS: this.productionJVFormData.REMARKS,
  //     PRODUCTION_DATE: this.productionJVFormData.PRODUCTION_DATE,
  //     TOTAL_ITEM_COST: this.totalAmount,
  //     COST_OF_PRODUCTION: this.finalCost,
  //     UNIT_PRODUCT_COST: this.unitProductCost,
  //     REF_NO: this.productionJVFormData.REF_NO,
  //     ADDL_COST: this.additionalCost,
  //     PRODUCT_ID: this.productionJVFormData.PRODUCT_ID,
  //     PROD_QTY: this.productionJVFormData.PROD_QTY,
  //      PRODUCTION_TYPE: this.productionJVFormData.PRODUCTION_TYPE === 'ARTICLE' ? 1 : 2,
  //     RawMaterials: this.gridData,
  //   };
  //   console.log('Payload being sent:', payload);
  //   this.dataservice
  //     .Insert_Article_Production_Api(payload)
  //     .subscribe((res: any) => {
  //       console.log('Insert success:', res);
  //       this.resetForm();
  //       this.formClosed.emit();
  //       // reset + close only AFTER success
  //     });
  // }

  onSave() {
    // =====================================================
    // VALIDATION 1: PRODUCT MUST BE SELECTED
    // =====================================================
    if (!this.productionJVFormData.PRODUCT_ID) {
      notify('Please select a product', 'error', 3000);
      return;
    }

    // =====================================================
    // VALIDATION 2: PRODUCT QUANTITY
    // =====================================================
    const prodQty = Number(this.productionJVFormData.PROD_QTY) || 0;
    if (prodQty <= 0) {
      notify('Please enter a product quantity', 'error', 3000);
      return;
    }

    // =====================================================
    // VALIDATION 3: USED_QTY <= AVAILABLE_QTY
    // =====================================================
    const invalidRow = this.gridData.find((item: any) => {
      const usedQty = Number(item.USED_QTY) || 0;
      const availableQty = Number(item.QTY_AVAILABLE) || 0;
      return usedQty > availableQty;
    });

    if (invalidRow) {
      notify(
        'Used Quantity cannot be greater than Available Quantity',
        'error',
        4000,
      );
      return;
    }

    // =====================================================
    // PREPARE PAYLOAD
    // =====================================================
    const payload: any = {
      ID: this.isEditing ? this.productionJVFormData.ID : 0,
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      USER_ID: this.user_id,
      REMARKS: this.productionJVFormData.REMARKS,
      PRODUCTION_DATE: this.formatDateForApi(
        this.productionJVFormData.PRODUCTION_DATE,
      ),
      TOTAL_ITEM_COST: this.totalAmount,
      COST_OF_PRODUCTION: this.finalCost,
      UNIT_PRODUCT_COST: this.unitProductCost,
      REF_NO: this.productionJVFormData.REF_NO,
      ADDL_COST: this.productionJVFormData.ADDL_COST,
      PRODUCT_ID: this.productionJVFormData.PRODUCT_ID,
      PROD_QTY: this.productionJVFormData.PROD_QTY,
      STATUS: this.productionJVFormData.STATUS ?? 1,
      PRODUCTION_TYPE: this.productionJVFormData.PRODUCTION_TYPE,

      RawMaterials: this.gridData,
      // IS_APPROVED: this.isApproved,
    };

    console.log('Final Payload:', payload);

    // =====================================================
    // API CALL HELPERS
    // =====================================================
    const callInsertAPI = () => {
      this.dataservice.Insert_Article_Production_Api(payload).subscribe(() => {
        notify('Production saved successfully', 'success', 3000);
        this.resetForm();
        this.formClosed.emit();
      });
    };

    const callUpdateAPI = () => {
      this.dataservice.Update_Article_Production_Api(payload).subscribe(() => {
        notify('Production updated successfully', 'success', 3000);
        this.resetForm();
        this.formClosed.emit();
      });
    };

    const callCommitAPI = () => {
      const result = confirm(
        'Are you sure you want to APPROVE this production?',
        'Confirmation',
      );

      result.then((confirmed) => {
        if (confirmed) {
          this.dataservice
            .Commit_Article_Production_Api(payload)
            .subscribe(() => {
              notify('Production approved successfully', 'success', 3000);
              this.formClosed.emit();
            });
        }
      });
    };

    // =====================================================
    // FINAL DECISION LOGIC (STATUS DRIVEN)
    // =====================================================

    if (!this.isEditing) {
      callInsertAPI();
      return;
    }

    if (payload.STATUS === 5) {
      callCommitAPI();
    } else {
      // ✅ Any other status → UPDATE
      callUpdateAPI();
    }
  }

  onApproveChanged(e: any) {
    this.isApproved = e.value;

    // STATUS logic
    this.productionJVFormData.STATUS = this.isApproved ? 5 : 1;

    console.log('Approve checked:', this.isApproved);
    console.log('Current STATUS:', this.productionJVFormData.STATUS);
  }

  resetForm() {
    this.initAddForm();

    if (this.itemsGrid) {
      this.itemsGrid.instance.cancelEditData();
      this.itemsGrid.instance.refresh();
    }

    console.log('Form reset + reinitialized');
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
