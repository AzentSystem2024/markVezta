import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxHtmlEditorModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { DxoEditingModule } from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { get } from 'http';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pay-settings',
  templateUrl: './pay-settings.component.html',
  styleUrls: ['./pay-settings.component.scss'],
})
export class PaySettingsComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  formsource: FormGroup;
  PaySettings: any;
  Ledger: any;
  isLoading: boolean=false;

  constructor(private fb: FormBuilder, private dataservice: DataService) {
    this.formsource = this.fb.group({
      DAILY_HOURS: ['', Validators.required],
      BANK_AC_NO: ['', Validators.required],
      BANK_CODE: ['', Validators.required],
      EOS_EXPENSE_HEAD_ID: ['', Validators.required],
      EOS_PAYABLE_HEAD_ID: ['', Validators.required],
      HOLIDAY_OT_RATE: ['', Validators.required],
      LEAVE_SAL_DAYS: ['', Validators.required],
      LS_EXPENSE_HEAD_ID: ['', Validators.required],
      LS_PAYABLE_HEAD_ID: ['', Validators.required],
      MAX_OT_MTS: ['', Validators.required],
      NORMAL_OT_RATE: ['', Validators.required],
      SAL_EXPENSE_HEAD_ID: ['', Validators.required],
      SAL_PAYABLE_HEAD_ID: ['', Validators.required],
      UQ_LABOUR_ID: ['', Validators.required],
    });
    this.get_PaySettingsList();
    this.get_DropDown_List();
  }

  formData = {};

  //===============get Dropdown List=======================
  get_DropDown_List() {
    this.dataservice.get_Ledger_Api(name).subscribe((response: any) => {
      console.log(response, 'response++++++++++');
      this.Ledger = response;
      console.log(this.Ledger, 'Ledger++++++++++');

      // this.Ledger = response.Hospitals;
    });
  }

  //===================get data list========================
  get_PaySettingsList() {
    this.isLoading = true;
    console.log('function working');
    this.dataservice.get_PaySettingsList().subscribe((res: any) => {
      console.log(res, 'response================');
      this.PaySettings = res.data;
      console.log(this.PaySettings, 'PaySettings');
      console.log(res, 'response================');
    });
  }

  showFilterRow: boolean = true;
  currentFilter: string = 'auto';

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  editData() {
    const Daily_Hours = this.PaySettings.DAILY_HOURS;
    const Bank_Acc_No = this.PaySettings.BANK_AC_NO;
    const Bank_Code = this.PaySettings.BANK_CODE;
    const EOS_Expense_Head_ID = this.PaySettings.EOS_EXPENSE_HEAD_ID;
    const EOS_Payable_Head_ID = this.PaySettings.EOS_PAYABLE_HEAD_ID;
    const Holiday_OT_Rate = this.PaySettings.HOLIDAY_OT_RATE;
    const Leave_Sal_Days = this.PaySettings.LEAVE_SAL_DAYS;
    const LS_Expense_Head_ID = this.PaySettings.LS_EXPENSE_HEAD_ID;
    const LS_Payable_Head_ID = this.PaySettings.LS_PAYABLE_HEAD_ID;
    const Max_OT_MTS = this.PaySettings.MAX_OT_MTS;
    const Normal_OT_Rate = this.PaySettings.NORMAL_OT_RATE;
    const Sal_Expense_Head_ID = this.PaySettings.SAL_EXPENSE_HEAD_ID;
    const Sal_Payable_Head_ID = this.PaySettings.SAL_PAYABLE_HEAD_ID;
    const UQ_Labour_ID = this.PaySettings.UQ_LABOUR_ID;

    if (Daily_Hours && Max_OT_MTS && Normal_OT_Rate &&
      Holiday_OT_Rate &&
      Leave_Sal_Days&&
      UQ_Labour_ID&&
      Bank_Acc_No &&
      Bank_Code &&
      Sal_Expense_Head_ID &&
      Sal_Payable_Head_ID &&
      LS_Expense_Head_ID &&
      LS_Payable_Head_ID &&
      EOS_Expense_Head_ID &&
      EOS_Payable_Head_ID) {
      this.dataservice
        .Update_PaySettings_Api(
          Daily_Hours,
          Max_OT_MTS,
          Normal_OT_Rate,
          Holiday_OT_Rate,
          Leave_Sal_Days,
          UQ_Labour_ID,
          Bank_Acc_No,
          Bank_Code,
          Sal_Expense_Head_ID,
          Sal_Payable_Head_ID,
          LS_Expense_Head_ID,
          LS_Payable_Head_ID,
          EOS_Expense_Head_ID,
          EOS_Payable_Head_ID
        )
        .subscribe((res: any) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          console.log(res, 'UPDATERESPONSEEEEEEEEEEEEE');
          this.get_PaySettingsList();
        });
    }
    else{
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      }  
      this.get_PaySettingsList()
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxoEditingModule,
    DxHtmlEditorModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    ReactiveFormsModule,
    FormPopupModule,
    DxFormModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [PaySettingsComponent],
})
export class PaySettingsModule {}
