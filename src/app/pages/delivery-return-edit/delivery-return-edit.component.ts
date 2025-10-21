import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
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
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-delivery-return-edit',
  templateUrl: './delivery-return-edit.component.html',
  styleUrls: ['./delivery-return-edit.component.scss']
})
export class DeliveryReturnEditComponent {
@Input() SelectDeliveryReturnData: any = {};
 @Output() formClosed = new EventEmitter<void>();
 readOnlyMode: boolean = false;

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
 approveValue: boolean = false;
ENABLE_Matrix_Code:boolean
        DeliveryReturnFormData: any = {
           ID:'',
  COMPANY_ID: null,
  STORE_ID: null,
  DR_DATE: '',
  REF_NO: "",
  DR_NO: '',
  CUST_ID: '',
  CONTACT_NAME: "",
  CONTACT_PHONE: '',
  CONTACT_FAX: '',
  CONTACT_MOBILE: '',
  SALESMAN_ID: 0,
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
      QUANTITY: '',
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
    }
    
    

     sesstion_Details(){
        const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
        console.log(sessionData,'=================session data==========')
    
        this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
        console.log(this.selected_Company_id,'============selected_Company_id==============')

        this.store_id = sessionData.Configuration[0].STORE_ID
        console.log(this.store_id)
 this.fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID
        

        const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
const financialYeaDate=sessionYear[0].DATE_FROM
console.log(financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
this.formatted_from_date=financialYeaDate


 this.ENABLE_Matrix_Code= sessionData.GeneralSettings.ENABLE_MATRIX_CODE
    console.log(this.ENABLE_Matrix_Code)
        
      }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['SelectDeliveryReturnData'] && changes['SelectDeliveryReturnData'].currentValue) {
          this.DeliveryReturnFormData = this.SelectDeliveryReturnData;
    
          console.log('SelectDeliveryReturnData :', this.SelectDeliveryReturnData);
          console.log('DeliveryReturnFormData :', this.DeliveryReturnFormData);
          // this.pendingDN = this.DeliveryReturnFormData.DETAILS

          this.customerID=this.SelectDeliveryReturnData.CUST_ID

          this.get_DN_Data()
          this.approveValue = this.SelectDeliveryReturnData.STATUS == 'APPROVED';

           // ✅ Set read-only mode based on status
    if (this.SelectDeliveryReturnData.STATUS === 'APPROVED') {
      this.readOnlyMode = true;
    } else {
      this.readOnlyMode = false;
    }
      }
    }

      getSalesmanDropdown() {
    this.dataService.getDropdownData('SALESMAN').subscribe((response: any) => {
      this.salesman = response;
    });
  }

   ngOnInit(){
      this.get_DN_Data();
      this.sesstion_Details();
    }

  onCustomerChange(e: any) {
  // e.value gives you the selected value (customer ID)
  console.log('Selected Customer ID:', e.value);
  this.customerID = e.value
  console.log(this.customerID)
  
  }

  onSalesmanChange(e:any){
console.log(e.value)

  }

  onApprovedChanged(e:any){

  }

      getCustomerDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.customer = response;
    });
  }

    togglePendingDN(){
    this.get_DN_Data()
  }

  // get_DN_Data(){
  //   console.log(this.DeliveryReturnFormData,'delivery return form data')
  //   const payload = {
  //     CUST_ID : this.customerID
  //   }
  //   console.log(payload ,'payload of DNList')
  //    this.dataService.get_DNList_Data(payload).subscribe((response:any)=>{
  //       this.DNDatasource = response.Data;
  //       console.log("DN List",this.DNDatasource);
  //     })
  // }

  get_DN_Data() {
  console.log(this.DeliveryReturnFormData, 'delivery return form data');
  const payload = {
    CUST_ID: this.customerID
  };
  console.log(payload, 'payload of DNList');

  this.dataService.get_DNList_Data(payload).subscribe((response: any) => {
    this.DNDatasource = response.Data;
    console.log("DN List", this.DNDatasource);

    // ✅ Now merge QUANTITY from the selected response
    if (this.DeliveryReturnFormData && this.DeliveryReturnFormData.DETAILS?.length) {
      const details = this.DeliveryReturnFormData.DETAILS;

      this.DNDatasource = this.DNDatasource.map(dnItem => {
        const matched = details.find(
          detail =>
            detail.DN_DETAIL_ID === dnItem.DN_DETAIL_ID &&
            detail.ITEM_ID === dnItem.ITEM_ID
        );
        return {
          ...dnItem,
          QUANTITY: matched ? matched.QUANTITY : 0 // or null if you prefer
        };
      });

      console.log('Merged DNDatasource with QUANTITY:', this.DNDatasource);
    }
  });
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
     this.formClosed.emit();
  }
  editDeliveryreturn(){
      // this.DeliveryReturnFormData.DETAILS = this.DNDatasource;

      const invalidRows = this.DNDatasource.filter(
    (item: any) => item.QUANTITY > item.QTY_AVAILABLE
  );

  if (invalidRows.length > 0) {
    notify('One or more rows have Qty Returned greater than Qty Available', 'error', 3000);
    return; // stop saving
  }

      
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

      if (this.approveValue === true) {
          confirm(
            'It will approve and commit. Are you sure you want to commit?',
            'Confirm Commit'
          ).then((result) => {
            if (result) {
              this.dataService
                .Approve_DeliveryRteurn_Data(payload)
                .subscribe((res: any) => {
                  console.log('Approved & Committed:', res);
                 
                 
                 
                  notify(
                    {
                      message: 'Depreciation approved and committed successfully',
                      position: { at: 'top right', my: 'top right' },
                      displayTime: 500,
                    },
                    'success'
                  );
                  // this.resetFormAfterUpdate();
                     
              setTimeout(() => {
                this.formClosed.emit();
              }, 500);
    
                });
            } else {
              notify('Approval cancelled.', 'info', 2000);
            }
          });
        } 
    else{
        this.dataService.Update_DeliveryReturn_Data(payload).subscribe((res:any)=>{
          console.log(res,'inserted data')
           notify(
                      {
                        message: 'Delivery Return updated successfully .',
                        position: { at: 'top right', my: 'top right' },
                        displayTime: 500,
                      },
                      'success'
                    );
              setTimeout(() => {
          this.formClosed.emit();
        }, 500);
        })
      }
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
  declarations: [DeliveryReturnEditComponent],
  exports: [DeliveryReturnEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryReturnEditModule {}
