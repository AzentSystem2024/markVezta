import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { VerifyMiscellaneousPaymentComponent } from '../verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-approve-miscellaneous-payment',
  templateUrl: './approve-miscellaneous-payment.component.html',
  styleUrls: ['./approve-miscellaneous-payment.component.scss'],
})
export class ApproveMiscellaneousPaymentComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() miscellaneousData: any;
  @ViewChild('miscFormGroup') miscFormGroup: DxValidationGroupComponent;
  miscFormData: any = {
    ID: '',
    DOC_NO: '',
    USER_ID: '',
    STORE_ID: '',
    EMP_ID: '',
    DOC_DATE: null,
    DESCRIPTION: '',
    AC_HEAD_ID: '',
    AMOUNT: '',
    NARRATION: '',
  };
  employee: any;
  salaryHead: any;
  AllowCommitWithSave: any;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.getEmployeeDropdown();
    this.getSalaryHead();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['miscellaneousData'] &&
      changes['miscellaneousData'].currentValue
    ) {
      // console.log(
      //   'Received miscellaneousData:',
      //   changes['miscellaneousData'].currentValue
      // );

      // Deep copy to avoid reference issues
      this.miscFormData = {
        ...this.miscFormData,
        ...changes['miscellaneousData'].currentValue,
      };
    }
  }

  getEmployeeDropdown() {
    this.dataService
      .getDropdownData('EMPLOYEE')
      .subscribe((response: any) => {
        this.employee = response;

      });
  }

  getSalaryHead() {
    this.dataService
      .getDropdownData('SALARY_HEAD')
      .subscribe((response: any) => {
        this.salaryHead = response;

      });
  }

  onEmployeeSelected(event: any) {
    const selected = this.employee.find((e) => e.ID === event.value);
    this.miscFormData.EMP_NAME = selected?.DESCRIPTION || '';
  }

  onSalaryHeadSelected(event: any) {
    const selected = this.salaryHead.find((e) => e.ID === event.value);
    this.miscFormData.AC_HEAD_ID = selected?.ID || '';
  }

  onSave() {
    if (this.AllowCommitWithSave) {
      if (this.miscFormGroup.instance.validate().isValid) {
        this.dataService
          .approveMiscellaneousData(this.miscFormData)
          .subscribe((response: any) => {
            if (response) {
              notify(
                {
                  message: 'Miscellaneous Payment Approved Successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success'
              );
              this.popupClosed.emit();
            } else {
              notify(
                {
                  message: 'Your Data Not updated',
                  position: { at: 'top right', my: 'top right' },
                },
                'error'
              );
            }
          });
      }
    }
  }

  handleClose() {
    this.popupClosed.emit();
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [ApproveMiscellaneousPaymentComponent],
  exports: [ApproveMiscellaneousPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ApproveMiscellaneousPaymentModule {}
