import { Component, NgModule, OnInit } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-itm-brand-form',
  templateUrl: './itm-brand-form.component.html',
  styleUrls: ['./itm-brand-form.component.scss'],
})
export class ItmBrandFormComponent{
  brandDataSource: any;
  formBrandData = {
    CODE: '',
    BRAND_NAME: '',
    COMPANY_ID: '1',
    COMPANY_NAME: '',
  };
  newBrand = this.formBrandData;

  constructor(
      private dataservice: DataService
    ) {
      dataservice.getBrandData().subscribe((response) => {
      this.brandDataSource = response.data;
    });
    }

  getNewBrandData = () => ({ ...this.newBrand });


  validateBrandCode = (e: any): boolean => {
    const value = (e.value || '').trim();

    if (!value || !this.brandDataSource?.length) return true;

    return !this.brandDataSource.some((item: any) => {
      return (item.CODE || '').trim() === value;
    });
  };
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
