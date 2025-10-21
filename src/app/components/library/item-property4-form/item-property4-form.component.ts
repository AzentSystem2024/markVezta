import { Component, Input, NgModule, Output } from '@angular/core';
import { DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-property4-form',
  templateUrl: './item-property4-form.component.html',
  styleUrls: ['./item-property4-form.component.scss']
})
export class ItemProperty4FormComponent {
  @Input() EditingResponseData: any;
  formItemProperty4Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };

  isEditing:boolean=false
  newItemProperty4=this.formItemProperty4Data;

  getNewItemProperty4Data = () => ({ ...this.newItemProperty4 });

  ngOnInit(){
        this.isEditDataAvailable();

  }


    isEditDataAvailable() {
    if (!this.EditingResponseData) return;

    const data = this.EditingResponseData;
    console.log(data,this.EditingResponseData)

    this.formItemProperty4Data = {
    CODE:this.EditingResponseData.CODE,
    DESCRIPTION:this.EditingResponseData.DESCRIPTION,
    COMPANY_ID: '1'
    };

    console.log('Bound transferOutFormData:', this.formItemProperty4Data);
  }

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
  declarations: [ItemProperty4FormComponent],
  exports: [ItemProperty4FormComponent],
})
export class ItemProperty4FormModule {}