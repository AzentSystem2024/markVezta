import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule } from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pdc-add-form',
  templateUrl: './pdc-add-form.component.html',
  styleUrls: ['./pdc-add-form.component.scss']
})
export class PdcAddFormComponent {
   @Output() formClosed = new EventEmitter<void>();
   @Input() selectedPDC: any;
   @Output() pdcInserted = new EventEmitter<any>();

  Supplier:any;
  priorities_value:any
  selectedSupplierId: any;
  selectedCustomerId: any;
  selectedSupplierName: any;
  selectedCustomerName: any;
  selectedBeneficiaryCommonName: any;
      selectedBeneficiaryTypeID: any
       selected_Company_id:any;
   isEnabled = true;
  Bank:any;
  Customer:any;
    priorities = [
    { id: 1, name: 'Issued' },{ id: 2, name: 'Received' },   
  ];
  selectedType = this.priorities.find((p) => p.id === 1); // Default value, optional
    BeneficiaryType = [
    { id: 1, name: 'Supplier' ,disabled: false},
    { id: 2, name: 'Customer' ,disabled: false},
    { id: 3, name: 'Others' ,disabled: false},
  ];
  selectedBeneficiaryType = this.BeneficiaryType.find((p) => p.id === 1);

  ngOnInit(): void {
  if (!this.selectedPDC) {
    // Default to 'Issued' (id = 1)
    this.selectedType = this.priorities.find(p => p.id === 1);
    this.PDCFormData.IS_PAYMENT = this.selectedType;
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;

    // Optionally set default BeneficiaryType for Issued
    // this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === 1);

    // Call priority logic manually to apply disabled items
    // this.onPriorityChanged({ value: this.selectedType });
  }
}


  PDCFormData: any = {
    ID: '',
  BANK_HEAD_ID: '',
  CUST_ID: '',
  SUPP_ID: '',
  BENEFICIARY_NAME: '',
  BENEFICIARY_TYPE: '',
  ENTRY_NO: '',
  ENTRY_DATE: '',
  CHEQUE_NO: '',
  CHEQUE_DATE: '',
  AMOUNT: '',
  REMARKS: '',
  IS_PAYMENT: '',
  ENTRY_STATUS: '',
  AC_TRANS_ID: ''
  }
  onBeneficiaryTypeChanged(e :any){
    this.selectedBeneficiaryType = e.value
    
    this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id
    console.log(this.selectedBeneficiaryTypeID,'selected beneficiary type ========')
    //  this.selectedBeneficiaryType = this.BeneficiaryType.find(b => b.id === data.BENEFICIARY_TYPE);
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
    this.sesstion_Details();
  }

  onSupplierChanged(event:any){
    console.log(event,'event')
    this.selectedSupplierId = event.value

      // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find((item: any) => item.ID === this.selectedSupplierId);
    if (selectedSupplier) {
      console.log('Selected ID:', selectedSupplier.ID);
      console.log('Selected Description:', selectedSupplier.DESCRIPTION);
    }

    this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
    console.log(this.selectedSupplierName,'======supplier name========')

  }

   onCustomerChanged(event:any){
    console.log(event.value,'event')

     this.selectedCustomerId = event.value

      // Find and log the selected supplier's DESCRIPTION
    const selectedCustomer = this.Supplier.find((item: any) => item.ID === this.selectedCustomerId);
    if (selectedCustomer) {
      console.log('Selected ID:', selectedCustomer.ID);
      console.log('Selected Description:', selectedCustomer.DESCRIPTION);
    }

    this.selectedBeneficiaryCommonName = selectedCustomer.DESCRIPTION;
    console.log(this.selectedCustomerName,'==========customer name====')
  }

  cancel(){
     this.resetForm();
     this.formClosed.emit();
      // Reset to default priority: Issued (id: 1)
  const defaultType = this.priorities.find(p => p.id === 1);
  this.selectedType = defaultType;

  this.PDCFormData.IS_PAYMENT = defaultType;

  // 👇 Manually trigger the priority change logic with a mock event
  this.onPriorityChanged({ value: defaultType });

  }

formatDate(date: string | Date): string {
  if (!date) return '';

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // ✅ No timezone involved
}


resetForm() {
  this.PDCFormData = {
    ID: 0,
    BANK_HEAD_ID: null,
    CUST_ID: null,
    SUPP_ID: null,
    ENTRY_NO: '',
    BENEFICIARY_NAME: '',
    BENEFICIARY_TYPE: null,
    ENTRY_DATE: null,
    CHEQUE_NO: '',
    CHEQUE_DATE: null,
    AMOUNT: null,
    REMARKS: '',
    IS_PAYMENT: null,
    ENTRY_STATUS: 1,
    AC_TRANS_ID: null
  };

   this.selectedType = this.priorities.find(p => p.id === 1);
    this.PDCFormData.IS_PAYMENT = this.selectedType;

  this.selectedType = null;
  this.selectedBeneficiaryType = null;
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
    ENTRY_NO: this.PDCFormData.ENTRT_NO,
    // BENEFICIARY_NAME: this.PDCFormData.BENEFICIARY_NAME || '',
    BENEFICIARY_NAME: this.selectedBeneficiaryCommonName || '',

    // BENEFICIARY_TYPE: this.PDCFormData.BENEFICIARY_TYPE || 0,
    BENEFICIARY_TYPE: this.selectedBeneficiaryTypeID || 0,
    ENTRY_DATE: this.formatDate(this.PDCFormData.ENTRY_DATE),
    CHEQUE_NO: this.PDCFormData.CHEQUE_NO || '',
    CHEQUE_DATE: this.formatDate(this.PDCFormData.CHEQUE_DATE),
    AMOUNT: +this.PDCFormData.AMOUNT || 0,
    REMARKS: this.PDCFormData.REMARKS || '',
    IS_PAYMENT: this.PDCFormData.IS_PAYMENT?.name === 'Issued', // true if Issued
    ENTRY_STATUS: this.PDCFormData.ENTRY_STATUS || 1,
    AC_TRANS_ID: this.PDCFormData.AC_TRANS_ID || 0
  };

  console.log(payload, 'Formatted payload to insert PDC');
  
  this.dataservice.Insert_PDC(payload).subscribe((res: any) => {
    console.log(res, 'response of insert PDC');
     if (res.Message === 'Success') {
          notify(
            {
              message: 'Inserted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
        }
         this.resetForm(); // ✅ Reset all form fields
        this.formClosed.emit();

         this.selectedType = this.priorities.find(p => p.id === 1);
    this.PDCFormData.IS_PAYMENT = this.selectedType;

     const defaultType = this.priorities.find(p => p.id === 1);
  this.selectedType = defaultType;

  this.PDCFormData.IS_PAYMENT = defaultType;

  // 👇 Manually trigger the priority change logic with a mock event
  this.onPriorityChanged({ value: defaultType });
  
    if (res?.Flag === 1 && res?.Data) {
      // Emit the new data back to the parent (list component)
      this.pdcInserted.emit(res.Data[0]);
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
  declarations: [PdcAddFormComponent],
  exports: [PdcAddFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdcAddFormModule {}