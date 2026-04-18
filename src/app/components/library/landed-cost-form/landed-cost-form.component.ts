import { Component, NgModule, enableProdMode, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule, DxNumberBoxModule, DxValidatorModule } from 'devextreme-angular';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxRadioGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-landed-cost-form',
  templateUrl: './landed-cost-form.component.html',
  styleUrls: ['./landed-cost-form.component.scss'],
})
export class LandedCostFormComponent implements  OnChanges {
  @Input() formData: any;

  currencyOptions: any[] = [
    { text: 'Local', value: true },
    { text: 'Supplier', value: false },
  ];
  amountOptions: any[] = [
    { text: 'Fixed Amount', value: true },
    { text: 'Percentage', value: false },
  ];
  isInactive: boolean = false;
  isLocalCurency: boolean = true;
  isFixedAmount: boolean = true;

  formLandedcostData: any = {
    DESCRIPTION: '',
    IS_LOCAL_CURRENCY: true,
    IS_FIXED_AMOUNT: true,
    VALUE: '',
    COMPANY_ID: '1',
    IS_INACTIVE: false,
  };
  newLandedCost = this.formLandedcostData;

  getNewLandedcost = () => ({ ...this.newLandedCost });


  ngOnChanges(changes: SimpleChanges) {
  if (changes['formData'] && this.formData) {
    this.newLandedCost = this.formData;

    console.log(this.formData, 'formData received in child');
  }
}

  onValueChangedInactive(event: any) {
    this.formLandedcostData.IS_INACTIVE = event;
  }

  onValueChangedCurrency(event: any) {
    this.formLandedcostData.IS_LOCAL_CURRENCY = event.value.value;
  }
  onValueChangedAmount(event: any) {
    this.formLandedcostData.IS_FIXED_AMOUNT = event.value.value;
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
    DxValidatorModule,
    DxNumberBoxModule
  ],
  declarations: [LandedCostFormComponent],
  exports: [LandedCostFormComponent],
})
export class LandedCostFormModule {}
