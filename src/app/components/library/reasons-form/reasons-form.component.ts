import { Component, NgModule, enableProdMode,OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule, DxNumberBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,DxDataGridModule
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';
import { DxSelectBoxTypes } from 'devextreme-angular/ui/select-box';
@Component({
  selector: 'app-reasons-form',
  templateUrl: './reasons-form.component.html',
  styleUrls: ['./reasons-form.component.scss']
})
export class ReasonsFormComponent {
  stores:any;
  customer:boolean=false
  Inv_man_Adj:boolean=false
  now: Date = new Date();
  selectedRows:any[]=[];

  
  
  isInactive:boolean = false ;
  VATRuleDropdownData: any[] = [];
  ReasonTypeDropdownData: any[] = [];
  DiscountTypeDropdownData: any[] = [];
 
  formReasonsData = {
    COMPANY_ID:'',
    CODE: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    START_DATE:this.now,
    END_DATE:this.now,
    REASON_TYPE:'',
    DISCOUNT_TYPE:0,
    AC_HEAD_ID:0,
    DISCOUNT_PERCENT:0,
    REASON_STORES: {
      STORE_ID: ''
    }
  };
  ac_ledger_Data: any;
  finID: any;
  userID: any;
  companyID: any;
  constructor(private service:DataService){}
  newReasons=this.formReasonsData;

  getNewReasonsData = () => ({ ...this.newReasons,
    COMPANY_ID:this.companyID
   });

  showStores(){
    this.service.getStoresData().subscribe(
     (response)=>{
           this.stores=response;
           console.log(response);
     }
    )
 }

 getVATRuleDropDown() {
  this.service
    .getCurrencyData()
    .subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdown',this.VATRuleDropdownData);
    });
}
getReasonTypeDropDown() {
  const dropdownreason = 'REASONTYPES';
  this.service
    .getDropdownData(dropdownreason)
    .subscribe((data: any) => {
      this.ReasonTypeDropdownData = data;
      console.log('dropdown',this.ReasonTypeDropdownData);
    });
}
getDiscountTypeDropDown() {
  const dropdowndiscount = 'DISCOUNTTYPE';
  this.service
    .getDropdownData(dropdowndiscount)
    .subscribe((data: any) => {
      this.DiscountTypeDropdownData = data;
      console.log('dropdown',this.DiscountTypeDropdownData);
    });
}
 ngOnInit(): void {
   this.showStores();
   this.getReasonTypeDropDown();
   this.getVATRuleDropDown();
   this.getDiscountTypeDropDown();
   this.ledger_Data_Drp()
   this.session_Data()
 }
 onValueChangedReason(event:any) {
    console.log('customer',event);
    if(event.value===1){
    this.customer=true;
        this.Inv_man_Adj=false
  }else if(event.value===2){
    this.Inv_man_Adj=true
      this.customer=false;
  }
  else{
    this.customer=false;
    this.Inv_man_Adj=false
  }
  }


  ledger_Data_Drp(){
    this.service.get_ac_ledger_drp().subscribe((res:any)=>{
      console.log(res)
      this.ac_ledger_Data=res
    })
  }
  onSelectionChanged(e: any) {
    console.log(e)

    const selected_row=e.selectedRowKeys
    const selected_valued=e.selectedRowsData

    console.log(selected_row,'=================selectred row================')
    console.log(selected_valued,'================================value')
const restored_Data = selected_valued.map(item => ({
  ID: item.ID,
  STORE_ID: item.STORE_NO   // 👈 taking STORE_NO as STORE_ID
}));


  console.log(restored_Data)
    this.formReasonsData.REASON_STORES=restored_Data
  }
  onValueChangedSDate(event:any) {

    this.formReasonsData.START_DATE=event.value;
  }
  onValueChangedEDate(event:any) {

    this.formReasonsData.END_DATE=event.value;
  }
  session_Data(){
        const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
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
    DxDataGridModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule
  ],
  declarations: [ReasonsFormComponent],
  exports: [ReasonsFormComponent]

})
export class ReasonsFormModule { }

