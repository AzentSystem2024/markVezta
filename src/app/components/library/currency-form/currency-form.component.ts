import { Component,NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,ValidationErrors,ValidatorFn  } from '@angular/forms';
import { DxSelectBoxModule, DxValidationGroupModule } from 'devextreme-angular';

@Component({
  selector: 'app-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.scss']
})
export class CurrencyFormComponent {
  stateForm: FormGroup;
  formCurrencyData = {
    CODE: '',
    SYMBOL:'',
    DESCRIPTION: '',
    FRACTION_UNIT:'',
    EXCHANGE:'',
    COMPANY_ID: '1'
  };
  numericPattern: string = '^-?\\d*\\.?\\d+$';
  exchangeError: string;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stateForm = this.fb.group({
      STATE_NAME: ['', Validators.required],
      COUNTRY_ID: ['', Validators.required],
      FRACTION_UNIT: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      EXCHANGE: ['', [Validators.pattern('^\\d+$')]]
    });
  }
  newCurrency=this.formCurrencyData;

  getNewCurrencyData = () => ({ ...this.newCurrency });

  get f() {
    return this.stateForm.controls;
  }

  validateExchange(value: string) {
    const numericPattern = /^\d+$/;
    if (!numericPattern.test(value)) {
      this.exchangeError = 'Exchange must be a number.';
    } else {
      this.exchangeError = '';
    }
  }

  get exchangeControl() {
    return this.stateForm.get('EXCHANGE');
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
    DxValidatorModule,
    DxValidationGroupModule,
    ReactiveFormsModule
  ],
  declarations: [CurrencyFormComponent],
  exports: [CurrencyFormComponent],
})
export class CurrencyFormModule {}

