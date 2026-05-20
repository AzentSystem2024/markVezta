import { Component,NgModule, OnInit } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-delivery-terms-form',
  templateUrl: './delivery-terms-form.component.html',
  styleUrls: ['./delivery-terms-form.component.scss']
})
export class DeliveryTermsFormComponent implements OnInit {
  delivery_terms: any;
  formDeliveryTermsData = {
    CODE: '',
    DESCRIPTION: ''
  };
  newDeliveryTerms=this.formDeliveryTermsData;

  constructor(private service:DataService){}

  getNewDeliveryTerms = () => ({ ...this.newDeliveryTerms });

  ngOnInit(): void {
    this.showDeliveryTerms();
  }

  showDeliveryTerms() {
    this.service.getDeliveryTermsData().subscribe((response) => {
      this.delivery_terms = response;
    });
  }

  validateDeliveryCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.delivery_terms) return true;

    return !this.delivery_terms.some((item: any) => {
      return item.CODE?.toLowerCase() === value;
    });
  };

  validateDeliveryName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.delivery_terms) return true;

    return !this.delivery_terms.some((item: any) => {
      return item.DESCRIPTION?.toLowerCase() === value;
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
  declarations: [DeliveryTermsFormComponent],
  exports: [DeliveryTermsFormComponent],
})
export class DeliveryTermsFormModule {}