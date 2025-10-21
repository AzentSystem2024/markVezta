import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxLookupModule,
  DxDataGridComponent,
  DxPopupModule,
  DxDateBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
@Component({
  selector: 'app-prepayment-posting-edit',
  templateUrl: './prepayment-posting-edit.component.html',
  styleUrls: ['./prepayment-posting-edit.component.scss']
})
export class PrepaymentPostingEditComponent {  
  @Input() selecteprepaymentData: any = {};
  @Output() popupClosed = new EventEmitter<void>();
  
 selectedMonthYear: string | number | Date 
PrepaymentList:any
  PREPAY_DETAIL: any;
  selected_Company_id: any;
  selected_fin_id: any;

  Prepoting_Add_Data:any={
  COMPANY_ID: null,
  FIN_ID: null,
  CREATE_USER_ID: null,
  PREPAY_DETAIL: [
    {
      ID: null,
      DUE_DATE: "",  
      DUE_AMOUNT: null
    }
  ]
};
  session_user_id: any;
  selectedRowKeys: any[];
  PREPAY_DETAIL_data: any=[]
  approveValue: boolean=false
  isEditReadOnly:boolean=false
  selected_Rows_data: any;
transDate: Date | string | number | null = null;

constructor(private dataservice:DataService){

this.get_prepayment_pending_list()
this.sesstion_Details()
}

ngOnChanges(changes: SimpleChanges) {
  if (changes['selecteprepaymentData'] && changes['selecteprepaymentData'].currentValue) {
    console.log('Received PackingData:', changes['selecteprepaymentData'].currentValue);

    this.Prepoting_Add_Data = this.selecteprepaymentData;
    this.PREPAY_DETAIL_data = this.selecteprepaymentData[0].PREPAY_DETAIL;
    console.log(this.PREPAY_DETAIL_data, '=============PREPAY_DETAIL data==============');

this.transDate = this.parseDDMMYYYY(this.selecteprepaymentData[0].TRANS_DATE);
console.log("Converted transDate:", this.transDate);


if(this.selecteprepaymentData[0].TRANS_STATUS=='Approved'){
  this.approveValue=true
  this.isEditReadOnly=true
}
else{
  this.approveValue=false

}
  }
}
parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-based
}


DateChange(e:any){
console.log(e)
const myDate =new Date (e.value)

const year = myDate.getFullYear();
const month = String(myDate.getMonth() + 1).padStart(2, '0'); // month is 0-based
// const day = String(myDate.getDate()).padStart(2, '0');
// Get the last day of the month
const lastDay = new Date(year, myDate.getMonth() + 1, 0).getDate();
// const day = String(lastDay).padStart(2, '0');
const formattedDate = `${year}-${month}-${lastDay}`;
console.log(formattedDate); // 👉 2025-07-01
this.selectedMonthYear=formattedDate
// this.get_prepayment_pending_list()
}
ngOnInit(){
   const today = new Date();
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
this.selectedMonthYear = lastDay;

const year = lastDay.getFullYear();
const month = String(lastDay.getMonth() + 1).padStart(2, '0');
const day = String(lastDay.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate); // 👉 2025-08-31t
this.selectedMonthYear=formattedDate

}
  get_prepayment_pending_list(){

    
  const currentdata=this.selectedMonthYear
const payload={
  DUE_DATE:this.selectedMonthYear 

}
// this.dataservice.Prepayment_pending_list(payload).subscribe((res:any)=>{
//   console.log(res)
// this.PrepaymentList=  res.Data
// })
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
  this.session_user_id= sessionData.USER_ID

  }
  
  onSelectionChanged(event:any){
    console.log(event,'==============seleted========event====')
    this.selected_Rows_data=event.selectedRowsData

    console.log(this.selected_Rows_data)
  // // Transform selected rows into required format
  //   this.PREPAY_DETAIL = selected_Rows_data.map((row: any, index: number) => ({
  //   ID: row.ID ,  // use row.ID if exists, else index
  //   DUE_DATE: row.INVOICE_DATE, // ensure ISO format
  //   DUE_AMOUNT: row.DUE_AMOUNT
  // }));

  // console.log(this.PREPAY_DETAIL)
  }

  onApprovedChanged(event: any) {
    console.log(event,'======function chngeeeeeee===')
     console.log(this.approveValue,'======function chngeeeeeee===')
    
    // const isChecked = event.value;
    // if (isChecked) {
    //   this.approveAdvancePopUp = true;
    // } else {
    //   this.approveAdvancePopUp = false;
    // }
  }
  Update_Prepayment() {
    const rawData={
     ...this.Prepoting_Add_Data,
    PREPAY_DETAIL:this.selected_Rows_data
    }
    



  // ✅ Final payload
  const payload = {
    TRANS_ID: this.selecteprepaymentData[0].TRANS_ID,
    COMPANY_ID: this.selected_Company_id,
    FIN_ID: this.selected_fin_id,

    CREATE_USER_ID: this.session_user_id,
      PREPAY_DETAIL:this.PREPAY_DETAIL_data
  };
  console.log(payload)

  if (this.approveValue === true) {
    confirm(
      'It will approve and commit. Are you sure you want to commit?',
      'Confirm Commit'
    ).then((result) => {
      if (result) {
        this.dataservice.Approve_prepayment_data(payload).subscribe((res: any) => {
          console.log('Approved & Committed:', res);

        
          notify(
            {
              message: 'Prepayment approved and committed successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
            this.popupClosed.emit();  
          
        });
      // } else {
      //   notify('Approval cancelled.', 'info', 2000);
      }
    });
  } else {
    this.dataservice.Update_prepayment_data(payload).subscribe((res: any) => {
      console.log('Updated:', res);
      notify(
        {
          message: 'Prepayment posting updated successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      this.popupClosed.emit();
    });
  }
}
closePopup(){
  this.popupClosed.emit();
}
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule, 
    DxPopupModule,
    DxDateBoxModule,
    DxCheckBoxModule
  ],
  providers: [],
  declarations: [PrepaymentPostingEditComponent],
  exports: [PrepaymentPostingEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrepaymentPostingEditModule {}