import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
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
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
@Component({
  selector: 'app-prepayment-posting-add',
  templateUrl: './prepayment-posting-add.component.html',
  styleUrls: ['./prepayment-posting-add.component.scss']
})
export class PrepaymentPostingAddComponent {
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

constructor(private dataservice:DataService){
  // const today = new Date();
  //   // new Date(year, month + 1, 0) gives the last day of the current month
  //   this.selectedMonthYear = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const today = new Date();
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
this.selectedMonthYear = lastDay;

const year = lastDay.getFullYear();
const month = String(lastDay.getMonth() + 1).padStart(2, '0');
const day = String(lastDay.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
console.log(formattedDate); // 👉 2025-08-31t
this.selectedMonthYear=formattedDate
this.get_prepayment_pending_list()
this.sesstion_Details()
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


this.get_prepayment_pending_list()

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
this.dataservice.Prepayment_pending_list(payload).subscribe((res:any)=>{
  console.log(res)
this.PrepaymentList=  res.Data
})
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
    const selected_Rows_data=event.selectedRowsData

    console.log(selected_Rows_data)
  // Transform selected rows into required format
    this.PREPAY_DETAIL = selected_Rows_data.map((row: any, index: number) => ({
    ID: row.ID ,  // use row.ID if exists, else index
    DUE_DATE: row.INVOICE_DATE, // ensure ISO format
    DUE_AMOUNT: row.DUE_AMOUNT
  }));

  console.log(this.PREPAY_DETAIL)
  }
  onEditorPreparing(event:any){
    

  }
    onCellValueChanged(event:any){
    
  }

  AddData(){



    const payload={
      ...this.Prepoting_Add_Data,
      COMPANY_ID: this.selected_Company_id,
  FIN_ID: this.selected_fin_id,
  CREATE_USER_ID: this.session_user_id,
  PREPAY_DETAIL: this.PREPAY_DETAIL

    }
    console.log(payload)

    this.dataservice.Insert_prepayment_data(payload).subscribe((res:any)=>{
      console.log(res)
               notify(
                      {
                        message: 'Prepayment posting Added successfully',
                        position: { at: 'top right', my: 'top right' },
                        displayTime: 500,
                      },
                      'success'
                    );
      this.popupClosed.emit()

    })

  }
  closePopup(){
      this.selectedRowKeys = [];  
    this.popupClosed.emit()

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
    DxDateBoxModule
  
  ],
  providers: [],
  declarations: [PrepaymentPostingAddComponent],
  exports: [PrepaymentPostingAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrepaymentPostingAddModule {}
