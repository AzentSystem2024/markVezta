import { Component, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxCheckBoxModule, DxDateBoxModule, DxFormModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-packing-add-form',
  templateUrl: './packing-add-form.component.html',
  styleUrls: ['./packing-add-form.component.scss']
})
export class PackingAddFormComponent implements OnInit {

  constructor(private dataservice:DataService){}

  formPackingData = {
    DESCRIPTION: '',
    NO_OF_UNITS: ''
  };
  newPacking=this.formPackingData;

  getNewPackingData = () => ({ ...this.newPacking });

  ngOnInit(): void {
    
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
  declarations: [PackingAddFormComponent],
  exports: [PackingAddFormComponent]

})
export class PackingFormModule { }