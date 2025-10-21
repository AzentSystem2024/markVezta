import { Component, NgModule } from '@angular/core';
import { DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-property5-form',
  templateUrl: './item-property5-form.component.html',
  styleUrls: ['./item-property5-form.component.scss']
})
export class ItemProperty5FormComponent {
  
  formItemProperty5Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  newItemProperty5=this.formItemProperty5Data;

  getNewItemProperty5Data = () => ({ ...this.newItemProperty5 });

}
@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
  ],
  declarations: [ItemProperty5FormComponent],
  exports: [ItemProperty5FormComponent],
})
export class ItemProperty5FormModule {}