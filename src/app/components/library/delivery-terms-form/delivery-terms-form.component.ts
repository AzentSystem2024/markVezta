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
  selector: 'app-delivery-terms-form',
  templateUrl: './delivery-terms-form.component.html',
  styleUrls: ['./delivery-terms-form.component.scss']
})
export class DeliveryTermsFormComponent {
  formDeliveryTermsData = {
    CODE: '',
    DESCRIPTION: ''
  };
  newDeliveryTerms=this.formDeliveryTermsData;

  getNewDeliveryTerms = () => ({ ...this.newDeliveryTerms });
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
  declarations: [DeliveryTermsFormComponent],
  exports: [DeliveryTermsFormComponent],
})
export class DeliveryTermsFormModule {}