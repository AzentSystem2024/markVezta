import { Component, NgModule, enableProdMode,OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule } from 'devextreme-angular';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxRadioGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-landed-cost-form',
  templateUrl: './landed-cost-form.component.html',
  styleUrls: ['./landed-cost-form.component.scss']
})
export class LandedCostFormComponent {
  currencyOptions: any[] = [{ text: 'Local', value: true }, { text: 'Supplier', value: false }];
  amountOptions:any[]=[{ text: 'Fixed Amount', value: true }, { text: 'Percentage', value: false }];
  isInactive:boolean = false ;
  isLocalCurency:boolean=true;
  isFixedAmount:boolean=true;

  formLandedcostData:any = {
    DESCRIPTION:'',
    IS_LOCAL_CURRENCY: true,
    IS_FIXED_AMOUNT: true,
    VALUE:'',
    COMPANY_ID:'1',
    IS_INACTIVE:false
  };
  newLandedCost=this.formLandedcostData;

  getNewLandedcost = () => ({ ...this.newLandedCost });

  onValueChangedInactive(event:any) {
    this.formLandedcostData.IS_INACTIVE=event;
    console.log('Inactive',event);
    console.log('value',this.formLandedcostData.IS_INACTIVE);
  }

 onValueChangedCurrency(event:any) {
  this.formLandedcostData.IS_LOCAL_CURRENCY=event.value.value;
  console.log('Currency',event.value.value);
}
onValueChangedAmount(event:any) {
  this.formLandedcostData.IS_FIXED_AMOUNT=event.value.value;
  console.log('Amount',event.value.value);
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
    DxRadioGroupModule
  ],
  declarations: [LandedCostFormComponent],
  exports: [LandedCostFormComponent]

})
export class LandedCostFormModule { }