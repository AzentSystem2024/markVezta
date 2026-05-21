import { Component, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DxNumberBoxModule, DxSelectBoxModule, DxValidationGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.scss']
})
export class CurrencyFormComponent {
  currency: any;
  stateForm!: FormGroup;
  formCurrencyData: any = {
    CODE: '',
    SYMBOL: '',
    DESCRIPTION: '',
    FRACTION_UNIT: '',
    EXCHANGE: ''
  };
  numericPattern: string = '^-?\\d*\\.?\\d+$';
  exchangeError: string;

  constructor(private fb: FormBuilder, private service: DataService) { }



  newCurrency = this.formCurrencyData;

  getNewCurrencyData = () => ({ ...this.newCurrency });

  ngOnInit(): void {
    this.showCurrency();
  }

  showCurrency() {
    this.service.getCurrencyData().subscribe((response: any) => {
      this.currency = response;
    });
  }

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

  validateCodeExists = (e: any) => {
    if (!e.value) return true;

    const inputCode = e.value.toString().trim().toUpperCase();

    const exists = this.currency?.some(
      (item: any) => item.CODE?.toUpperCase() === inputCode
    );

    return !exists; // return false → validation error
  };


   validateSymbolExists = (e: any) => {
    if (!e.value) return true;

    const inputCode = e.value.toString().trim().toUpperCase();

    const exists = this.currency?.some(
      (item: any) => item.SYMBOL?.toUpperCase() === inputCode
    );

    return !exists; // return false → validation error
  };

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
    ReactiveFormsModule,
    DxNumberBoxModule
  ],
  declarations: [CurrencyFormComponent],
  exports: [CurrencyFormComponent],
})
export class CurrencyFormModule { }

