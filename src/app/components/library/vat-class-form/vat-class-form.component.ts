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
  selector: 'app-vat-class-form',
  templateUrl: './vat-class-form.component.html',
  styleUrls: ['./vat-class-form.component.scss']
})
export class VatClassFormComponent {
  formVatclassData = {
    CODE: '',
    VAT_NAME: '',
    VAT_PERC: ''
  };
  newVatclass=this.formVatclassData;

  getNewVatclassData = () => ({ ...this.newVatclass });

  keyPressCode(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
  
    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if ((charCode >= 65 && charCode <= 90) || // A-Z
        (charCode >= 97 && charCode <= 122) || // a-z
        (charCode >= 48 && charCode <= 57)) { // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressVatname(event: any) {
    console.log('key pressed');
    var charCode = (event.which) ? event.which : event.keyCode;
    var inputValue = event.target.value;

  // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
    event.preventDefault();
    return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) || (charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
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
  declarations: [VatClassFormComponent],
  exports: [VatClassFormComponent],
})
export class VatClassFormModule {}
