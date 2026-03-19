import { Component, Input, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-item-property1-form',
  templateUrl: './item-property1-form.component.html',
  styleUrls: ['./item-property1-form.component.scss'],
})
export class ItemProperty1FormComponent {
  formItemProperty1Data = {
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: 0,
  };
  @Input() companyId!: number;
  newItemProperty1 = this.formItemProperty1Data;
  isEditItemProperty1PopupOpened: boolean = false;
  isEditing: boolean = false;
  getNewItemProperty1Data = () => ({ ...this.newItemProperty1 });
  @Input() EditingResponseData;
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  selected_Company_id: any;
  poData: any;

  ngOnInit() {
    this.sessionDetails();
  }
  ngOnChanges() {
    if (this.companyId) {
      this.formItemProperty1Data.COMPANY_ID = this.companyId;
    }
  }
  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
    this.poData.COMPANY_ID = this.companyID;
    this.poData.USER_ID = sessionData.USER_ID;
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
  declarations: [ItemProperty1FormComponent],
  exports: [ItemProperty1FormComponent],
})
export class ItemProperty1FormModule {}
