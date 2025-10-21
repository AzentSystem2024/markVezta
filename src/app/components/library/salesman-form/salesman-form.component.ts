import { Component, NgModule, enableProdMode,OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxCheckBoxModule, DxValidationGroupComponent, DxValidatorModule } from 'devextreme-angular';
import { DxRadioGroupModule } from 'devextreme-angular';
import { DxValidationGroupModule } from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';
@Component({
  selector: 'app-salesman-form',
  templateUrl: './salesman-form.component.html',
  styleUrls: ['./salesman-form.component.scss']
})
export class SalesmanFormComponent {
  @ViewChild(DxValidationGroupComponent) validationGroup: DxValidationGroupComponent;
  genderOptions: { text: string, value: boolean }[] = [
    { text: "Male", value: true },
    { text: "Female", value: false }
  ];

  gender:boolean=true;

  dob:Date=new Date();
  doj:Date=new Date();

  StoreDropdownData: any[] = [];
  
  formSalesmanData = {
    
    EMP_CODE: '',
    EMP_NAME: '',
    DOB:this.dob,
    DOJ:this.doj,
    IS_MALE:true,
    STORE_ID:'',
    ADDRESS1:'',
    ADDRESS2:'',
    ADDRESS3:'',
    CITY:'',
    MOBILE:'',
    EMAIL:'',
    IQAMA_NO:'',
    INCENTIVE_PERCENT:''
    
    
  };
  constructor(private service:DataService){}
  newSalesman=this.formSalesmanData;

  getNewSalesmanData = () => ({ ...this.newSalesman });

  
 getStoreDropDown() {
  const dropdownstore = 'STORE';
  this.service
    .getDropdownData(dropdownstore)
    .subscribe((data: any) => {
      this.StoreDropdownData = data;
      console.log('storedropdown',this.StoreDropdownData);
    });
}
  
 ngOnInit(): void {
   
   this.getStoreDropDown();
   
   
 }
 
 onValueChangedGender(event:any) {
  this.formSalesmanData.IS_MALE=event.value.value;
  console.log('Gender',event.value.value);
}
 
 keyPressNumbers(event: any) {
  var charCode = (event.which) ? event.which : event.keyCode;
  var inputElement = event.target as HTMLInputElement;
  
  // Only Numbers 0-9
  if ((charCode < 48 || charCode > 57)) {
    event.preventDefault();
    return false;
  } else if (inputElement.value.length === 0 && charCode === 48) { // Check if first character is '0'
    event.preventDefault();
    return false;
  } else {
    return true;
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
    DxValidatorModule,
    DxValidationGroupModule
  ],
  declarations: [SalesmanFormComponent],
  exports: [SalesmanFormComponent]

})
export class SalesmanFormModule { }
