import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, NgModule, NgZone, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pre-payment-add',
  templateUrl: './pre-payment-add.component.html',
  styleUrls: ['./pre-payment-add.component.scss']
})
export class PrePaymentAddComponent {
@ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;
@ViewChild('prepayDetailGrid') prepayDetailGrid: DxDataGridComponent;


  @Output() formClosed = new EventEmitter<void>();
  
    selectedRows: any[] = [];
    ExpenseAmountDetails: any [] = []
    showGrid = false;
    totalExpense: number = 0;
      Supplier:any;
      ExpenseLedger: any;
      selectedSupplierId: any;
      selected_Company_id: any;
      selected_fin_id: any;
      selected_user_id: any;
      PrePaymentLedger: any;
           sessionData: any;
  selected_vat_id: any;

      periodTo: string | number | Date | null = null;
      periodFrom: string | number | Date | null = null;

  PrePaymentFormData: any = {
    COMPANY_ID: '',
    FIN_ID:'',
    
    TRANS_TYPE: 38,
    TRANS_DATE:'',
    REF_NO:'',
      NARRATION: '',
      CREATE_USER_ID:'',
      TAX_PERCENT:'',
      TAX_AMOUNT:'',
      NET_AMOUNT: '',
        SUPP_ID: '',
         EXP_HEAD_ID: '',
         PREPAY_HEAD_ID:'',
           DATE_FROM: this.periodFrom,
  DATE_TO: this.periodTo,
    NO_OF_MONTHS: '',
  NO_OF_DAYS: '',
  EXPENSE_AMOUNT: '',
  PREPAY_DETAIL: [
    {
      DUE_DATE: '',
      DUE_AMOUNT: ''
    }
  ]
  }


  amount: number = 0;

months: number | null = null;
days: number | null = null;


     
gstPercent: number = 0;   // GST %
gstAmount: number = 0; 
netAmount: number = 0;   // Calculated GST Amount

 constructor(private dataservice: DataService,private ngZone: NgZone,) {
  this.get_Supplier_dropdown();
  this.get_ExpenseLedger_dropdown();
  this.sesstion_Details();
  this.get_PrePaymentLedger_dropdown();
  this.sessionData_tax();
 }

updateGSTAmount() {
  if (this.PrePaymentFormData.EXPENSE_AMOUNT && this.PrePaymentFormData.TAX_PERCENT >= 0) {
    // Calculate GST Amount
    this.PrePaymentFormData.TAX_AMOUNT = +(this.PrePaymentFormData.EXPENSE_AMOUNT * (this.PrePaymentFormData.TAX_PERCENT / 100)).toFixed(2);

    // Calculate Net Amount (Amount + GST)
    this.PrePaymentFormData.NET_AMOUNT = +(this.PrePaymentFormData.EXPENSE_AMOUNT + this.PrePaymentFormData.TAX_AMOUNT).toFixed(2);
  } else {
    this.PrePaymentFormData.TAX_AMOUNT = 0;
    this.PrePaymentFormData.NET_AMOUNT = this.PrePaymentFormData.EXPENSE_AMOUNT || 0;
  }
}



updatePeriodTo() {
  if (this.PrePaymentFormData.DATE_FROM) {
    let newDate = new Date(this.PrePaymentFormData.DATE_FROM);

    if (this.PrePaymentFormData.NO_OF_MONTHS) {
      newDate.setMonth(newDate.getMonth() + this.PrePaymentFormData.NO_OF_MONTHS);
    }

    if (this.PrePaymentFormData.NO_OF_DAYS) {
      newDate.setDate(newDate.getDate() + this.PrePaymentFormData.NO_OF_DAYS);
    }

    this.PrePaymentFormData.DATE_TO = newDate;
  } else {
    this.PrePaymentFormData.DATE_TO = null; // Clear if Period From is empty
  }
}

private daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

onCalendarClick() {
  this.showGrid = true;
  this.generateSchedule();
  this.totalExpense = this.PrePaymentFormData.EXPENSE_AMOUNT  || 0; // Copy Amount to Total Expense
}



generateSchedule() {
  if (!this.PrePaymentFormData.DATE_FROM || !this.PrePaymentFormData.DATE_TO || !this.PrePaymentFormData.EXPENSE_AMOUNT ) return;

  const startDate = new Date(this.PrePaymentFormData.DATE_FROM!);
  const endDateFinal = new Date(this.PrePaymentFormData.DATE_TO!);

  const totalDays = this.daysBetween(startDate, endDateFinal);
  const perDayAmount = this.PrePaymentFormData.EXPENSE_AMOUNT  / totalDays;

  let schedule: any[] = [];
  let current = new Date(startDate);

  while (current <= endDateFinal) {
    let periodStart = new Date(current);
    let periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    // Keep end date within overall DATE_TO
    if (periodEnd > endDateFinal) {
      periodEnd = new Date(endDateFinal);
    }

    // ✅ Adjust the start date for the first row to match DATE_FROM
    if (schedule.length === 0) {
      periodStart = new Date(startDate);
    }

    // ✅ Adjust the end date for the last row to match DATE_TO
    if (periodEnd > endDateFinal) {
      periodEnd = new Date(endDateFinal);
    }

    const daysInPeriod = this.daysBetween(periodStart, periodEnd);
    const rowAmount = +(perDayAmount * daysInPeriod).toFixed(2);

    schedule.push({
      HEAD_ID: schedule.length + 1,
     DUE_DATE: periodEnd.toLocaleDateString('en-GB'), // gives dd/MM/yyyy
      DUE_AMOUNT: rowAmount,
      HEAD_PERCENT: null
    });

    // Move to next month's start
    current = new Date(periodEnd);
    current.setDate(current.getDate() + 1);
  }

  this.ExpenseAmountDetails = schedule;
  this.showGrid = true;
}

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
    console.log('User selected:', this.selectedRows);
  }

  onEditorPreparing(e: any) {
    // console.log(e, 'Editor Preparing Event');

    console.log(e, 'Editor Preparing Event');

    const headNature = e.row?.data.HEAD_NATURE;
    console.log(headNature, '=======error===============');
    console.log(headNature, 'HEAD_NATURE in Editor Preparing Event');

    const headId = e.row?.data.HEAD_ID;

  const isRowSelected = this.selectedRows?.includes(headId);


  }

   convertToISO(dateStr: string): string {
  // dateStr is in "DD/MM/YYYY"
  const [day, month, year] = dateStr.split("/").map(Number);

  // Create JS Date (note: month is 0-based)
  const date = new Date(year, month - 1, day +1);

  return date.toISOString();  // Converts to ISO string
}

    onSupplierChanged(event:any){
    console.log(event,'event')
    this.selectedSupplierId = event.value
  }

  get_Supplier_dropdown(){
    this.dataservice.Supplier_Dropdown().subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  get_ExpenseLedger_dropdown(){
    this.dataservice.ExxpenseLedger_Dropdown().subscribe((res: any) => {
      console.log('customer dropdown', res);
      this.ExpenseLedger = res;
    });
  }

 get_PrePaymentLedger_dropdown(){
    this.dataservice.ExxpenseLedger_Dropdown().subscribe((res: any) => {
      console.log('customer dropdown', res);
      this.PrePaymentLedger = res;
    });
  }


  resetForm() {
   this.PrePaymentFormData = {
    COMPANY_ID: '',
    FIN_ID:'',
    
    TRANS_TYPE: 38,
    TRANS_DATE:'',
    REF_NO:'',
      NARRATION: '',
      CREATE_USER_ID:'',
      TAX_PERCENT:'',
      TAX_AMOUNT:'',
      NET_AMOUNT: '',
        SUPP_ID: '',
         EXP_HEAD_ID: '',
         PREPAY_HEAD_ID:'',
           DATE_FROM: this.periodFrom,
  DATE_TO: this.periodTo,
    NO_OF_MONTHS: '',
  NO_OF_DAYS: '',
  EXPENSE_AMOUNT: '',
  PREPAY_DETAIL: [
  { DUE_DATE: null, DUE_AMOUNT: null }
]
  }

  this.ExpenseAmountDetails = [];
  this.showGrid = false;

    // ✅ Reset form validations after value reset
  setTimeout(() => {
     // Reset previous validation results
  this.formValidationGroup?.instance?.reset();
  });
}

  cancel(){
      this.resetForm()
      this.formClosed.emit();
  }

private formatDateDDMMYYYY(date: any): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

private formatToISO(date: any): string | null {
  if (!date) return null;

  // If it's already a Date object
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString();
  }

  // If it's already in dd/MM/yyyy format
  if (typeof date === 'string' && date.includes('/')) {
    const parts = date.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
  }

  // Fallback
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

        sessionData_tax(){
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
  }

sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')

    this.selected_user_id=sessionData.USER_ID
    console.log(this.selected_user_id,'===========selected user id===================')
    
  }

  savePrePayment(){

     const validationResult = this.formValidationGroup?.instance?.validate();
  if (!validationResult?.isValid) {
    console.log('Validation failed');
    return;
  }

    // ✅ Validation before save
  if (Number(this.PrePaymentFormData.EXPENSE_AMOUNT) !== Number(this.totalExpense)) {
    notify({
      message: 'Amount and Total Expense must be the same.',
      type: 'error',
      position: { at: 'top right', my: 'top right' },
      displayTime: 1500,
    });
    return; // stop save
  }
  const result = this.ExpenseAmountDetails.map(item => ({
  DUE_DATE:this.convertToISO(item.DUE_DATE),
  DUE_AMOUNT: item.DUE_AMOUNT
}));
console.log(result)

     const payload = {
    COMPANY_ID: this.selected_Company_id || null,
    FIN_ID: this.selected_fin_id || null,
    TRANS_TYPE: Number(this.PrePaymentFormData.TRANS_TYPE) || null,
    TRANS_DATE: this.formatToISO(this.PrePaymentFormData.TRANS_DATE),
    REF_NO: this.PrePaymentFormData.REF_NO || '',
    NARRATION: this.PrePaymentFormData.NARRATION || '',
    CREATE_USER_ID: this.selected_user_id || null,
    TAX_PERCENT: Number(this.PrePaymentFormData.TAX_PERCENT) || null,
    TAX_AMOUNT: Number(this.PrePaymentFormData.TAX_AMOUNT) || null,
    NET_AMOUNT: Number(this.PrePaymentFormData.NET_AMOUNT) || null,
    SUPP_ID: Number(this.PrePaymentFormData.SUPP_ID) || null,
    EXP_HEAD_ID: Number(this.PrePaymentFormData.EXP_HEAD_ID) || null,
    PREPAY_HEAD_ID: Number(this.PrePaymentFormData.PREPAY_HEAD_ID) || null,
    DATE_FROM: this.formatToISO(this.PrePaymentFormData.DATE_FROM),
    DATE_TO: this.formatToISO(this.PrePaymentFormData.DATE_TO),
    NO_OF_DAYS: Number(this.PrePaymentFormData.NO_OF_DAYS) || null,
    EXPENSE_AMOUNT: Number(this.PrePaymentFormData.EXPENSE_AMOUNT) || null,
    NO_OF_MONTHS: Number(this.PrePaymentFormData.NO_OF_MONTHS) || null,
   
     // ✅ Map from the grid data source, not the form object
    PREPAY_DETAIL:result
  };

  console.log('Payload to save PrePayment:', payload);

 this. dataservice.Insert_PrePayment(payload).subscribe((res: any) => {
    console.log('Response from save PrePayment:', res);
    if (res.Message === 'Success') {
      notify({
        message: 'PrePayment saved successfully',
        type: 'success',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      });
    }
    this.resetForm();
    this.formClosed.emit();
    })
          
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
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    DxValidationGroupModule,
    
    ReactiveFormsModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [PrePaymentAddComponent],
  exports: [PrePaymentAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrePaymentAddModule {}