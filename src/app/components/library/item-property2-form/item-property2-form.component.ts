import { Component,NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-item-property2-form',
  templateUrl: './item-property2-form.component.html',
  styleUrls: ['./item-property2-form.component.scss']
})
export class ItemProperty2FormComponent {
  formItemProperty2Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  newItemProperty2=this.formItemProperty2Data;

  getNewItemProperty2Data = () => ({ ...this.newItemProperty2 });
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
  declarations: [ItemProperty2FormComponent],
  exports: [ItemProperty2FormComponent],
})
export class ItemProperty2FormModule {}
