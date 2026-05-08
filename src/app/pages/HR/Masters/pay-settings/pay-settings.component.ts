import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
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
  Ledger: any;
  isLoading: boolean = false;
  PaySettings: any = {
    COMPANY_ID: 0,
    DAILY_HOURS: 0,
    MAX_OT_MTS: 0,
    NORMAL_OT_RATE: 0,
    HOLIDAY_OT_RATE: 0,
    LEAVE_SAL_DAYS: 0,
    UQ_LABOUR_ID: '',
    BANK_AC_NO: '',
    BANK_CODE: '',
    SAL_EXPENSE_HEAD_ID: 0,
    SAL_PAYABLE_HEAD_ID: 0,
    LS_EXPENSE_HEAD_ID: 0,
    LS_PAYABLE_HEAD_ID: 0,
    EOS_EXPENSE_HEAD_ID: 0,
    EOS_PAYABLE_HEAD_ID: 0
  }
  selected_Company_id: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private router: Router,

  ) {
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
    this.sesstion_Details();
    this.get_PaySettingsList();
    this.get_DropDown_List();

  }
  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  formData = {};

  //===============get Dropdown List=======================
  get_DropDown_List() {
    const payload = {
      NAME: 'ACCOUNT_HEAD'
    }
    this.dataservice.get_Ledger_Api(payload).subscribe((response: any) => {
      this.Ledger = response;
      console.log(this.Ledger)
      // this.Ledger = response.Hospitals;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
  //===================get data list========================
  get_PaySettingsList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id
    }
    this.isLoading = true;
    this.dataservice.get_PaySettingsList(payload).subscribe((res: any) => {
      this.PaySettings = res.data;
    });
  }

  showFilterRow: boolean = true;
  currentFilter: string = 'auto';

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  editData() {
    console.log("Button clicked");

    console.log("Payload:", this.PaySettings);
    const payload = {
      ...this.PaySettings,
      COMPANY_ID: this.selected_Company_id,

      SAL_EXPENSE_HEAD_ID: this.PaySettings.SAL_EXPENSE_HEAD_ID || 0,
      SAL_PAYABLE_HEAD_ID: this.PaySettings.SAL_PAYABLE_HEAD_ID || 0,
      LS_EXPENSE_HEAD_ID: this.PaySettings.LS_EXPENSE_HEAD_ID || 0,
      LS_PAYABLE_HEAD_ID: this.PaySettings.LS_PAYABLE_HEAD_ID || 0,
      EOS_EXPENSE_HEAD_ID: this.PaySettings.EOS_EXPENSE_HEAD_ID || 0,
      EOS_PAYABLE_HEAD_ID: this.PaySettings.EOS_PAYABLE_HEAD_ID || 0
    };
    this.dataservice
      .Update_PaySettings_Api(
        payload
      )
      .subscribe({
        next: (res: any) => {
          console.log("Success:", res);

          notify(
            {
              message: res.message,
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.get_PaySettingsList();
        },
        error: (err) => {
          console.error(err);
        }
      });
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
export class PaySettingsModule { }
