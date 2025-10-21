import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxCheckBoxModule, DxDateBoxModule, DxFormModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-uom-add-form',
  templateUrl: './uom-add-form.component.html',
  styleUrls: ['./uom-add-form.component.scss']
})
export class UomAddFormComponent implements OnInit {
  @ViewChild(DxValidationGroupComponent) validationGroup: DxValidationGroupComponent;

  formUOMData = {
    UOM:''
  }

  constructor(private service:DataService){}
  newUOM=this.formUOMData

  getNewUomData= () => ({ ...this.newUOM });

  ngOnInit() {
    
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
  declarations: [UomAddFormComponent],
  exports: [UomAddFormComponent]

})

export class UomAddFormModule { }
