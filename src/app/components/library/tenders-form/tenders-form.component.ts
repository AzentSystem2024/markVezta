import { Component, NgModule, enableProdMode,OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-tenders-form',
  templateUrl: './tenders-form.component.html',
  styleUrls: ['./tenders-form.component.scss']
})
export class TendersFormComponent implements OnInit {
  @ViewChild(DxValidationGroupComponent) validationGroup: DxValidationGroupComponent;
  additionalInformationRequired:boolean = false;
  allowOpening:boolean = false;
  allowDeclaration:boolean = false ;
  isInactive:boolean = false ;
  VATRuleDropdownData: any[] = [];
  TenderTypeDropdownData: any[] = [];
 
  formTenderData = {
    CODE: '',
    IS_INACTIVE:this.isInactive,
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    TENDER_TYPE:'',
    CURRENCY_ID:'',
    DISPLAY_ORDER:'',
    ALLOW_OPENING:false,
    ALLOW_DECLARATION:false,
    ADDITIONAL_INFO_REQUIRED:false,
    
  };
  constructor(private service:DataService){}
  newTender=this.formTenderData;

  getNewTenderData = () => ({ ...this.newTender });

 getVATRuleDropDown() {
  this.service
    .getCurrencyData()
    .subscribe((data: any) => {
      this.VATRuleDropdownData = data;
      console.log('dropdown',this.VATRuleDropdownData);
    });
}
getTenderTypeDropDown() {
  const dropdowntender = 'TENDERTYPE';
  this.service
    .getDropdownData(dropdowntender)
    .subscribe((data: any) => {
      this.TenderTypeDropdownData = data;
      console.log('dropdown',this.TenderTypeDropdownData);
    });
}
 ngOnInit(): void {
   this.getTenderTypeDropDown();
   this.getVATRuleDropDown();
   
 }
 onValueChangedOpening(value:boolean) {
     this.formTenderData.ALLOW_OPENING=value;
     console.log('allow opening',value);
  }
  onValueChangedDeclaration(value:boolean) {
    this.formTenderData.ALLOW_DECLARATION=value;
   
 }
 onValueChangedInformation(value:boolean) {
     this.formTenderData.ADDITIONAL_INFO_REQUIRED=value;
     
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
    DxValidationGroupModule,
    DxValidatorModule
  ],
  declarations: [TendersFormComponent],
  exports: [TendersFormComponent]

})
export class TendersFormModule { }
