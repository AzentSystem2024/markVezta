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
import { FormTextboxModule } from 'src/app/components';
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-delivery-return-add',
  templateUrl: './delivery-return-add.component.html',
  styleUrls: ['./delivery-return-add.component.scss']
})
export class DeliveryReturnAddComponent {
 @Output() formClosed = new EventEmitter<void>();
  DNDatasource:any[]=[];
    customer: any;
    salesman: any;
    customerID:any;
     selected_Company_id : any;
     store_id:any;
     formatted_from_date:any
     fin_id:any
     finID: any;
      savedUserData: any;
      user_id:any;
ENABLE_Matrix_Code:boolean
     DeliveryReturnFormData: any = {
     
  COMPANY_ID: '',
  STORE_ID: null,
  DR_DATE: new Date(),
  REF_NO: "",
  DR_NO: '',
  CUST_ID: '',
  CONTACT_NAME: "",
  CONTACT_PHONE: '',
  CONTACT_FAX: '',
  CONTACT_MOBILE: '',
  SALESMAN_ID: '',
  FIN_ID: '',
  TOTAL_QTY: '',
  USER_ID: '',
  NARRATION: '',
  DETAILS: [
    {
      SO_DETAIL_ID: '',
      DN_DETAIL_ID: '',
      ITEM_ID: 0,
      REMARKS: '',
      UOM: '',
      QUANTITY: 0,

    }
  ]
     }

   constructor(
      private dataService: DataService,
      private router: Router,
      private cdr: ChangeDetectorRef,
      private ngZone: NgZone
    ) {
      this.getCustomerDropdown();
      this.getSalesmanDropdown();
      this.get_DN_Data()
    }

    ngOnInit(){
      this.get_DN_Data();
      this.sesstion_Details();
    }

     sesstion_Details(){
        const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
        console.log(sessionData,'=================session data==========')
    
        this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
        console.log(this.selected_Company_id,'============selected_Company_id==============')

        this.store_id = sessionData.Configuration[0].STORE_ID
        console.log(this.store_id)
 this.fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID

 this.user_id = sessionData.USER_ID

        const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
const financialYeaDate=sessionYear[0].DATE_FROM
console.log(financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
this.formatted_from_date=financialYeaDate

 this.ENABLE_Matrix_Code= sessionData.GeneralSettings.ENABLE_MATRIX_CODE
    console.log(this.ENABLE_Matrix_Code)

        
      }

      getSalesmanDropdown() {
    this.dataService.getDropdownData('SALESMAN').subscribe((response: any) => {
      this.salesman = response;
    });
  }

  
  onCustomerChange(e: any) {
  // e.value gives you the selected value (customer ID)
  console.log('Selected Customer ID:', e.value);
  this.customerID = e.value
  console.log(this.customerID)
  
  }

      getCustomerDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.customer = response;
    });
  }

  togglePendingDN(){
    this.get_DN_Data()
  }

  get_DN_Data(){
    console.log(this.DeliveryReturnFormData,'delivery return form data')
    const payload = {
      CUST_ID : this.customerID
    }
    console.log(payload ,'payload of DNList')
     this.dataService.get_DNList_Data(payload).subscribe((response:any)=>{
        this.DNDatasource = response.Data;
        console.log("DN List",this.DNDatasource);
      })
  }

  onCellValueChanged(e: any) {
  // Check only when editing the QUANTITY column
  if (e.dataField === 'QUANTITY') {
    const qtyReturned = e.value;
    const qtyAvailable = e.data.QTY_AVAILABLE;

    if (qtyReturned > qtyAvailable) {
      notify('Qty Returned cannot be greater than Qty Available', 'error', 2000);

      // Reset the invalid value
      e.component.cellValue(e.rowIndex, 'QUANTITY', null);
    }
  }
}

onEditorPreparing(e: any) {
  if (e.dataField === 'QUANTITY' && e.parentType === 'dataRow') {
    e.editorOptions.onValueChanged = (args: any) => {
      const qtyReturned = args.value;
      const qtyAvailable = e.row.data.QTY_AVAILABLE;

      // Real-time validation while typing
      if (qtyReturned > qtyAvailable) {
        notify('Qty Returned cannot be greater than Qty Available', 'error', 2000);
        args.component.option('value', qtyAvailable); // Reset to max allowed value
      }

      // Keep normal grid update behavior
      e.setValue(args.value);
    };
  }
}


  cancel(){
    this.resetFormAfterClose();
     this.formClosed.emit();
  }
  saveDeliveryreturn(){

    const invalidRows = this.DNDatasource.filter(
    (item: any) => item.QUANTITY > item.QTY_AVAILABLE
  );

  if (invalidRows.length > 0) {
    notify('One or more rows have Qty Returned greater than Qty Available', 'error', 3000);
    return; // stop saving
  }

    //  this.DeliveryReturnFormData.DETAILS = this.DNDatasource;
     console.log(this.DeliveryReturnFormData)
const totalQty=Number(this.DeliveryReturnFormData.TOTAL_QTY)
console.log(totalQty)
    const payload = {
      ...this.DeliveryReturnFormData,
      COMPANY_ID : this.selected_Company_id,
      STORE_ID : this.store_id,
      FIN_ID : this.fin_id,
      USER_ID : this.user_id,
      TOTAL_QTY : totalQty,
      DETAILS: this.DNDatasource.map((d: any) => ({
    SO_DETAIL_ID: d.SO_DETAIL_ID || '',
    DN_DETAIL_ID: d.DN_DETAIL_ID || '',
    ITEM_ID: d.ITEM_ID || 0,
    REMARKS: d.REMARKS || '',
    UOM: d.UOM || '',
    QUANTITY: d.QUANTITY || 0
  }))
    }
    console.log(this.DNDatasource)
    console.log(payload)
    this.dataService.Insert_DeliveryReturn_Data(payload).subscribe((res:any)=>{
      console.log(res,'inserted data')
       notify(
                  {
                    message: 'Delivery Return added successfully .',
                    position: { at: 'top right', my: 'top right' },
                    displayTime: 500,
                  },
                  'success'
                );
                this.resetFormAfterClose();
          this.formClosed.emit();
    })
  }

  resetFormAfterClose() {
  this.DeliveryReturnFormData = {
    COMPANY_ID: '',
    STORE_ID: null,
    DR_DATE: new Date(),
    REF_NO: "",
    CUST_ID: '',
    CONTACT_NAME: "",
    CONTACT_PHONE: '',
    CONTACT_FAX: '',
    CONTACT_MOBILE: '',
    SALESMAN_ID: '',
    FIN_ID: '',
    TOTAL_QTY: '',
    USER_ID: '',
    NARRATION: '',
    DETAILS: [
      {
        SO_DETAIL_ID: '',
        DN_DETAIL_ID: '',
        ITEM_ID: 0,
        REMARKS: '',
        UOM: '',
        QUANTITY: 0
      }
    ]
  };

  this.DNDatasource = [];         // ✅ Clear grid data
  this.customerID = null;         // ✅ Clear customer reference
  console.log('Form reset successfully');
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
  declarations: [DeliveryReturnAddComponent],
  exports: [DeliveryReturnAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryReturnAddModule {}
