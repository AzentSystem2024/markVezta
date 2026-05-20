import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
// import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-item-property1-edit',
  templateUrl: './item-property1-edit.component.html',
  styleUrls: ['./item-property1-edit.component.scss'],
})
export class ItemProperty1EditComponent {
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  @Input() selectedData: any = {};
  @Output() formClosed = new EventEmitter<void>();
  formItemProperty1Data = {
    ID: 0,
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1',
  };
  itemproperty1: any = [];
  HSN_CODE: any;
  companyID: any;
  companyStateID: any;
  GST_PERC: any;
  selected_Company_id: any;
  poData: any;

  constructor(private service: DataService) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;
      this.formItemProperty1Data = data;

      this.sessionDetails()
    }
  }
  showItemProperty1() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getItemProperty1Data(payload).subscribe((response) => {
      this.itemproperty1 = response;
    });
    console.log(this.itemproperty1, '      this.itemproperty1')

  }
  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
    this.showItemProperty1()

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
    this.poData.COMPANY_ID = this.companyID;
    this.poData.USER_ID = sessionData.USER_ID;

  }
  UpdateData() {
    console.log('-----------call this function====================')
    const result = this.validationGroup.instance.validate();
    if (!result.isValid) {
      return;
    }
    const payload = {
      ...this.formItemProperty1Data,
    };


    console.log(this.itemproperty1, '      this.itemproperty1')


    // Exclude the current record (by ID) from duplicate check
    const isCodeDuplicate = this.itemproperty1.some(
      (item: any) =>
        item.ID !== payload.ID &&
        item.CODE?.toLowerCase().trim() ===
        payload.CODE?.toLowerCase().trim(),
    );

    const isDescriptionDuplicate = this.itemproperty1.some(
      (item: any) =>
        item.ID !== payload.ID &&
        item.DESCRIPTION?.toLowerCase().trim() ===
        payload.DESCRIPTION?.toLowerCase().trim(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    this.service.updateItemProperty1(payload).subscribe((res: any) => {
      this.formClosed.emit();
      notify(
        {
          message: 'Data updated successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'success',
      );
    });

  }

  closePopup() {
    this.formClosed.emit();
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
    DxButtonModule,
    DxValidationGroupModule,
  ],
  declarations: [ItemProperty1EditComponent],
  exports: [ItemProperty1EditComponent],
})
export class ItemProperty1EditModule { }
