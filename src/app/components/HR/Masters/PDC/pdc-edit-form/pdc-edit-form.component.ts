import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-pdc-edit-form',
  templateUrl: './pdc-edit-form.component.html',
  styleUrls: ['./pdc-edit-form.component.scss']
})
export class PdcEditFormComponent {
      @Output() formClosed = new EventEmitter<void>();
     @Input() selectedPDC: any;
@Input() isReadOnly: boolean = false;
   
     Supplier:any;
     selectedBeneficiaryTypeID: any
     selected_Company_id:any;
     priorities_value:any
      isEnabled = true;
     Bank:any;
     Customer:any;
       priorities = [
       { id: 1, name: 'Issued' },
       { id: 2, name: 'Received' },
     ];
    selectedType = this.priorities.find((p) => p.id === 1);
       BeneficiaryType = [
       { id: 1, name: 'Supplier' ,disabled: false},
       { id: 2, name: 'Customer' ,disabled: false},
       { id: 3, name: 'Others' ,disabled: false},
     ];
     selectedBeneficiaryType : any;
   
     PDCFormData: any = {
       ID: '',
     BANK_HEAD_ID: '',
     CUST_ID: '',
     SUPP_ID: '',
     BENEFICIARY_NAME: '',
     BENEFICIARY_TYPE:'',
     ENTRY_DATE: '',
      ENTRY_NO: '',
     CHEQUE_NO: '',
     CHEQUE_DATE: '',
     AMOUNT: '',
     REMARKS: '',
     IS_PAYMENT: '',
     ENTRY_STATUS: '',
     AC_TRANS_ID: ''
     }
     onBeneficiaryTypeChanged(e :any){
      // console.log(e,'event')
      //  this.selectedBeneficiaryType = e.value
      //  console.log(this.selectedBeneficiaryType,'selected beneficiary type')

       const selectedId = e.value;
  this.selectedBeneficiaryTypeID = selectedId;
  this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === selectedId);
  console.log(this.selectedBeneficiaryType, 'selected beneficiary type');
     }

 onPriorityChanged(e: any) {
  this.selectedType = e.value;
  this.PDCFormData.IS_PAYMENT = e.value; // Keep synced

  const priorityId = e.value?.id || 1;

  if (priorityId === 1) {
    // Issued → Disable Customer, auto-select Supplier
    this.BeneficiaryType = this.BeneficiaryType.map(item => ({
      ...item,
      disabled: item.id === 2,
    }));

    this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === 1);
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
  } else {
    // Received → Disable Supplier, auto-select Customer
    this.BeneficiaryType = this.BeneficiaryType.map(item => ({
      ...item,
      disabled: item.id === 1,
    }));

    this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === 2);
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
  }
}
     isBeneficiaryTypeDisabled = (data: any) => data.disabled;
   
     constructor(private dataservice: DataService) {
       this.get_Supplier_dropdown();
       this.get_Bank_dropdown();
       this.get_Customer_dropdown();
       this.sesstion_Details()
     }
   
     onSupplierChanged(event:any){
       console.log(event.value,'event')
     }
   
      onCustomerChanged(event:any){
       console.log(event.value,'event')
     }
   
     cancel(){
        this.formClosed.emit();

     }

formatDate(date: string | Date): string {
  if (!date) return '';

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // ✅ No timezone involved
}


     sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')
    
  }

     savePDC() {
  const payload = {
    ID: this.PDCFormData.ID ? +this.PDCFormData.ID : 0,
    COMPANY_ID: this.selected_Company_id || 0,
    BANK_HEAD_ID: this.PDCFormData.BANK_HEAD_ID || 0,
    CUST_ID: this.PDCFormData.CUST_ID || 0,
    SUPP_ID: this.PDCFormData.SUPP_ID || 0,
    BENEFICIARY_NAME: this.PDCFormData.BENEFICIARY_NAME || '',
BENEFICIARY_TYPE: this.selectedBeneficiaryTypeID || 0,

    ENTRY_DATE: this.formatDate(this.PDCFormData.ENTRY_DATE),
    CHEQUE_NO: this.PDCFormData.CHEQUE_NO || '',
    CHEQUE_DATE: this.formatDate(this.PDCFormData.CHEQUE_DATE),
    AMOUNT: +this.PDCFormData.AMOUNT || 0,
    REMARKS: this.PDCFormData.REMARKS || '',
    IS_PAYMENT: this.PDCFormData.IS_PAYMENT?.name === 'Issued', // true if Issued
   ENTRY_STATUS: this.PDCFormData.ENTRY_STATUS ? 5 : 1,
    AC_TRANS_ID: this.PDCFormData.AC_TRANS_ID || 0
  };

  console.log(payload, 'Formatted payload to insert PDC');
  


  this.dataservice.Update_PDC(payload).subscribe((res: any) => {
    console.log(res, 'response of insert PDC');
     if (res.Message === 'Success') {
              notify(
                {
                  message: 'Updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success',
                
              );
              this.formClosed.emit();
            }
              
  });
  
}

     get_Supplier_dropdown(){
       this.dataservice.Supplier_Dropdown().subscribe((res: any) => {
         console.log('supplier dropdown', res);
         this.Supplier = res;
       });
     }
   
     get_Bank_dropdown(){
       this.dataservice.Bank_Dropdown().subscribe((res: any) => {
         console.log('bank dropdown', res);
         this.Bank = res;
       });
     }
   
     get_Customer_dropdown(){
       this.dataservice.Customer_Dropdown().subscribe((res: any) => {
         console.log('customer dropdown', res);
         this.Customer = res;
       });
     }

     ngOnInit(): void {
  if (!this.selectedPDC) {
    // Initialize default values for Add mode
    this.selectedType = this.priorities[0];
    this.selectedBeneficiaryType = this.BeneficiaryType[0];
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
   
  }
  console.log(this.selectedBeneficiaryType,'selectedBeneficiaryType=================')
   console.log(this.selectedBeneficiaryTypeID,'selectedBeneficiaryID=======')
}

ngOnChanges(changes: SimpleChanges): void {
  if (changes['selectedPDC'] && changes['selectedPDC'].currentValue) {
    const data = changes['selectedPDC'].currentValue;
console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
    this.PDCFormData = {
      ID: data.ID,
      BANK_HEAD_ID: data.BANK_HEAD_ID,
      CUST_ID: data.CUST_ID === 0 ? null : data.CUST_ID,
      SUPP_ID: data.SUPP_ID === 0 ? null : data.SUPP_ID,
      BENEFICIARY_NAME: data.BENEFICIARY_NAME || '',
      BENEFICIARY_TYPE: data.BENEFICIARY_TYPE,
      ENTRY_DATE: this.parseDate(data.ENTRY_DATE),
      ENTRY_NO : data.ENTRY_NO,
      CHEQUE_NO: data.CHEQUE_NO,
      CHEQUE_DATE: this.parseDate(data.CHEQUE_DATE),
      AMOUNT: data.AMOUNT,
      REMARKS: data.REMARKS,
      IS_PAYMENT: data.IS_PAYMENT
        ? this.priorities.find(p => p.name === 'Issued')
        : this.priorities.find(p => p.name === 'Received'),
      ENTRY_STATUS: data.ENTRY_STATUS,
      AC_TRANS_ID: data.AC_TRANS_ID
    };
console.log(this.PDCFormData,"PDCFORMDATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    this.selectedType = this.PDCFormData.IS_PAYMENT;
    this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === data.BENEFICIARY_TYPE);
this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id

       // ✅ Map numeric type to object for radio group
    // this.selectedBeneficiaryType = this.BeneficiaryType.find(
    //   (p) => p.id === data.BENEFICIARY_TYPE
    // );
        if (data.BENEFICIARY_TYPE) {
      this.selectedBeneficiaryType = this.BeneficiaryType.find(
        b => b.id === data.BENEFICIARY_TYPE
      );
      this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType?.id;
    }
    console.log(this.selectedBeneficiaryTypeID,"SELECTEDBENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN")
  }

  // if (!this.selectedPDC) {
  //   // Initialize default values for Add mode
  //   this.selectedType = this.priorities[0];
  //   this.selectedBeneficiaryType = this.BeneficiaryType[0];
  //   this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
   
  // }
  // console.log(this.selectedBeneficiaryType,'selectedBeneficiaryType=================')
  //  console.log(this.selectedBeneficiaryTypeID,'selectedBeneficiaryID=======')


  if (!this.selectedPDC) {
  setTimeout(() => {
    this.selectedType = this.priorities[0];
    this.selectedBeneficiaryType = this.BeneficiaryType[0];
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
    this.onPriorityChanged({ value: this.selectedType });
    this.onBeneficiaryTypeChanged({ value: this.selectedBeneficiaryTypeID });
  });
}

}




parseDate(dateStr: string): Date {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
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
    DxDataGridModule,
    DxoItemModule,
    DxoFormItemModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    
  ],
  providers: [],
  declarations: [PdcEditFormComponent],
  exports: [PdcEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdcEditFormModule {}