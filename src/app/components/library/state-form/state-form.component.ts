import { Component, NgModule, OnInit } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxPopupModule,
  DxSelectBoxModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.scss'],
})
export class StateFormComponent implements OnInit {
  isAddStatePopupOpened: boolean = false;
  CountryDropdownData: any;
  formStateData = {
    STATE_CODE: '',
    STATE_NAME: '',
    COUNTRY_ID: '',
  };
  appType: any;
  sessionData: any;
  constructor(private service: DataService) { }
  newState = this.formStateData;

  getNewStateData = () => ({ ...this.newState });

  getCountryDropDown() {
    this.service.getCountryData().subscribe((data: any) => {
      this.CountryDropdownData = data;
    });
  }
  ngOnInit(): void {
    this.getCountryDropDown();
    this.sessionData_tax();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.appType = this.sessionData.Configuration[0].APP_TYPE;
  }
  resetStateForm() {
    this.newState = {
      STATE_CODE: '',
      STATE_NAME: '',
      COUNTRY_ID: '',
    };
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
    DxValidationGroupModule,
    DxValidatorModule,
    DxPopupModule,
  ],
  declarations: [StateFormComponent],
  exports: [StateFormComponent],
})
export class StateFormModule { }
