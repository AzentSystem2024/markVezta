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
  selector: 'app-payment-terms-form',
  templateUrl: './payment-terms-form.component.html',
  styleUrls: ['./payment-terms-form.component.scss']
})
export class PaymentTermsFormComponent {
  formPaymentTermsData = {
    CODE: '',
    DESCRIPTION: ''
  };
  newPaymentTerms=this.formPaymentTermsData;

  getNewPaymentTerms = () => ({ ...this.newPaymentTerms });
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
  declarations: [PaymentTermsFormComponent],
  exports: [PaymentTermsFormComponent],
})
export class PaymentTermsFormModule {}
