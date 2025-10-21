import { Component,Input,NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-item-property1-form',
  templateUrl: './item-property1-form.component.html',
  styleUrls: ['./item-property1-form.component.scss']
})
export class ItemProperty1FormComponent {
  formItemProperty1Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  newItemProperty1=this.formItemProperty1Data;
isEditItemProperty1PopupOpened:boolean=false
isEditing:boolean=false
  getNewItemProperty1Data = () => ({ ...this.newItemProperty1 });
  @Input() EditingResponseData


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
  declarations: [ItemProperty1FormComponent],
  exports: [ItemProperty1FormComponent],
})
export class ItemProperty1FormModule {}
