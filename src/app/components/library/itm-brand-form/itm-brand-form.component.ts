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
  selector: 'app-itm-brand-form',
  templateUrl: './itm-brand-form.component.html',
  styleUrls: ['./itm-brand-form.component.scss']
})
export class ItmBrandFormComponent {
  formBrandData = {
    CODE: '',
    BRAND_NAME: '',
    COMPANY_ID: '1'
  };
  newBrand=this.formBrandData;

  getNewBrandData = () => ({ ...this.newBrand });

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
  declarations: [ItmBrandFormComponent],
  exports: [ItmBrandFormComponent],
})
export class ItmBrandFormModule {}
