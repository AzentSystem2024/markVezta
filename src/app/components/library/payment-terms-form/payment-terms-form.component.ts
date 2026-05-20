import { Component,Input,NgModule, OnInit, SimpleChanges } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule, DxValidationGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-payment-terms-form',
  templateUrl: './payment-terms-form.component.html',
  styleUrls: ['./payment-terms-form.component.scss']
})
export class PaymentTermsFormComponent implements OnInit {

  @Input() EditingResponseData: any;
  @Input() selectedpaymenttermId: any;

  payment_terms:any;

  
  
  formPaymentTermsData = {
    CODE: '',
    DESCRIPTION: ''
  };
  newPaymentTerms=this.formPaymentTermsData;

  constructor(private dataservice:DataService){}

  getNewPaymentTerms = () => ({ ...this.newPaymentTerms });

  ngOnInit(): void {
    this.showPaymentTerms();
  }
  

ngOnChanges(changes: SimpleChanges) {
  if (changes['EditingResponseData'] && this.EditingResponseData) {
    console.log('Received in child:', this.EditingResponseData);

    this.newPaymentTerms = {
      CODE: this.EditingResponseData.CODE,
      DESCRIPTION: this.EditingResponseData.DESCRIPTION
    };
  }
}

showPaymentTerms() {
    this.dataservice.getPaymentTermsData().subscribe((response) => {
      this.payment_terms = response;
    });
  }

  validatePaymentCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.payment_terms) return true;

    return !this.payment_terms.some((item: any) => {
      const sameCode = item.CODE?.toLowerCase() === value;

      // 🔥 skip current edit record
      const isSameId = Number(item.ID) === Number(this.selectedpaymenttermId);

      return sameCode && !isSameId;
    });
  };

  validatePaymentDescription = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.payment_terms) return true;

    return !this.payment_terms.some((item: any) => {
      const sameCode = item.DESCRIPTION?.toLowerCase() === value;

      // 🔥 skip current edit record
      const isSameId = Number(item.ID) === Number(this.selectedpaymenttermId);

      return sameCode && !isSameId;
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
    DxValidationGroupModule
  ],
  declarations: [PaymentTermsFormComponent],
  exports: [PaymentTermsFormComponent],
})
export class PaymentTermsFormModule {}
