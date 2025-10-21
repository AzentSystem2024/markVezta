import { Component, NgModule } from '@angular/core';
import { DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-property3-form',
  templateUrl: './item-property3-form.component.html',
  styleUrls: ['./item-property3-form.component.scss']
})
export class ItemProperty3FormComponent {

  formItemProperty3Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  newItemProperty3=this.formItemProperty3Data;

  getNewItemProperty3Data = () => ({ ...this.newItemProperty3 });

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
  declarations: [ItemProperty3FormComponent],
  exports: [ItemProperty3FormComponent],
})
export class ItemProperty3FormModule {}