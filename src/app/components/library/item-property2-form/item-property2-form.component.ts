import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';

@Component({
  selector: 'app-item-property2-form',
  templateUrl: './item-property2-form.component.html',
  styleUrls: ['./item-property2-form.component.scss'],
})
export class ItemProperty2FormComponent implements OnChanges {
  @Input() companyId!: number;

  formItemProperty2Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: 0,
  };

  newItemProperty2 = this.formItemProperty2Data;

  getNewItemProperty2Data = () => ({ ...this.newItemProperty2 });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['companyId']?.currentValue) {
      this.formItemProperty2Data.COMPANY_ID = changes['companyId'].currentValue;
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
  ],
  declarations: [ItemProperty2FormComponent],
  exports: [ItemProperty2FormComponent],
})
export class ItemProperty2FormModule {}
