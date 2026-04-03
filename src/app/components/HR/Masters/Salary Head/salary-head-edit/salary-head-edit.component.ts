import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  DxDataGridComponent,
  DxValidationGroupModule,
  DxNumberBoxModule,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-salary-head-edit',
  templateUrl: './salary-head-edit.component.html',
  styleUrls: ['./salary-head-edit.component.scss'],
})
export class SalaryHeadEditComponent {
  @Input() selectedSalaryHeadData: any;
  @Output() formClosed = new EventEmitter<void>();

  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;

  selectedHeads: any;
  Ac_head_values: any;
  affective_value: boolean = false;
  grid_value: any = [];
  selectedNatureId: any;
  isDisableNumberbox: boolean = false;
  ApplicableWorkingDay: boolean = false;
  selecteNatureTypeTwo: boolean = false;
  selecteNatureTypeone: boolean = false;
  ApplicableWithBasicRange: boolean = false;
  head_percent: boolean = false;
  head_From: boolean = false;
  head_To: boolean = false;
  SalaryHeadData = {
    ID: 0,
    HEAD_NAME: '',
    PAYSLIP_TITLE: '',
    HEAD_ACTIVE: true,
    HEAD_TYPE: 1,
    INSTALLMENT_RECOVERY: true,
    HEAD_PERCENT_INCLUDE_OT: true,
    IS_INACTIVE: false,
    AFFECT_LEAVE: false,
    AC_HEAD_ID: null,
    HEAD_ORDER: 0,
    HEAD_NATURE: 0,
    FIXED_AMOUNT: 0,
    HEAD_PERCENT: 0,
    PERCENT_HEAD_ID: [],
    RANGE_EXISTS: false,
    RANGE_FROM: 0,
    RANGE_TO: 0,
    IS_TIMESHEET_ENTRY: false,
  };
  priorities = [
    { id: 1, name: 'gross' },
    { id: 2, name: 'Deduction' },
    { id: 3, name: 'Advance' },
  ];
  selectedPriority: any; // or set by id

  salaryHeadTypes = [{ label: 'Fixed Amount', value: 'fixed' }];
  salaryHeadTypes2 = [{ label: '', value: 'percentage' }];
  salaryHeadTypes3 = [{ label: 'Others', value: 'others' }];

  selectedType: any;
  selectedRows: any[] | undefined;
  // salaryHeadList: any;
  salaryHeadList: any[] = [];

  isEnabled: boolean = false;
  HeadType_value: any;
  selected_Company_id: any;
  is_time_entry: boolean = false;
  RequlerOrpaytime = [
    { name: 'Regular Salary', value: 1 },
    { name: 'Paytime Entry', value: 2 },
  ];

  selectedPaytime = 1;

  constructor(private dataservice: DataService) {
    this.sesstion_Details();
    this.get_headnameGrid();

    this.dataservice.Dropdown_ac_head(name).subscribe((res: any) => {
      this.Ac_head_values = res;
    });

    if (this.selectedType == 'fixed') {
      this.isEnabled = false;
    } else if (this.selectedType == 'percentage') {
      this.isEnabled = false;
    } else {
      this.isEnabled = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedSalaryHeadData'] &&
      changes['selectedSalaryHeadData'].currentValue
    ) {
      this.SalaryHeadData = this.selectedSalaryHeadData;
    }

    this.grid_value = this.SalaryHeadData.PERCENT_HEAD_ID;

    this.selectedType =
      this.SalaryHeadData.HEAD_NATURE === 1
        ? 'fixed'
        : this.SalaryHeadData.HEAD_NATURE === 2
          ? 'percentage'
          : 'others';
    const headtype =
      this.priorities.find((p) => p.id === this.SalaryHeadData.HEAD_TYPE) ||
      this.priorities[0];
    this.selectedPriority = headtype.id;

    this.selectedPaytime = this.SalaryHeadData.IS_TIMESHEET_ENTRY ? 2 : 1;
  }

  onPriorityChanged(e: any) {
    console.log('==========function call====================');
    this.selectedPriority = e.value;
    console.log(
      this.selectedPriority,
      '=============selectedPriority=====================',
    );
    this.HeadType_value = e.value;
    this.isEnabled = this.HeadType_value === 1 || this.HeadType_value === 2;

    // If "Advance" is selected
    if (this.selectedPriority?.id === 3 || this.selectedPriority === 3) {
      this.selectedType = 'others'; // auto select "Others"
      this.onTypeChange(); // trigger your type change logic
    }
  }

  get_headnameGrid() {
    this.dataservice.Dropdown_advance_types(name).subscribe((res: any) => {
      this.selectedHeads = res;
    });
  }

  onTypeChange() {
    const headNatureMap: { [key: string]: number } = {
      fixed: 1,
      percentage: 2,
      others: 3,
    };

    this.selectedNatureId = headNatureMap[this.selectedType];

    if (this.selectedNatureId === 1) {
      this.selecteNatureTypeTwo = false;
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
      this.ApplicableWorkingDay = false;
    } else if (this.selectedNatureId === 2) {
      this.selecteNatureTypeTwo = true;
      this.head_percent = false;
      this.head_From = false;
      this.head_To = false;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.ApplicableWithBasicRange = false;
    } else if (this.selectedNatureId === 3) {
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.selecteNatureTypeTwo = true;
    }

    // if(this.selectedNatureId==1){

    // this.selecteNatureTypeTwo=true
    // this.head_percent=true
    // this.head_From=true
    // this.head_To=true

    // }
    // else if(this.selectedNatureId==2){
    //   // this.isDisable=true
    // }
  }

  cancel() {
    this.formClosed.emit();
  }

  //===================grid value=====================
  onSelectionChanged(event: any) {
    this.SalaryHeadData.PERCENT_HEAD_ID = event.selectedRowKeys;
  }

  //=======================list data=============
  getSalaryHeadList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.get_salary_head_list(payload).subscribe((res: any) => {
      this.salaryHeadList = res.Data;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  isValid() {
    return this.SalaryHeadValidation?.instance.validate().isValid;
  }

  UpdateSalaryHeadData() {
    if (!this.isValid()) return;
    const headNatureMap: { [key: string]: number } = {
      fixed: 1,
      percentage: 2,
      others: 3,
    };
    const selectedTypeId = headNatureMap[this.selectedType];

    // Duplicate check
    if (this.SalaryHeadData.HEAD_NAME) {
      const isDuplicate = this.salaryHeadList.some(
        (head: any) =>
          head.HEAD_NAME.trim().toLowerCase() ===
            this.SalaryHeadData.HEAD_NAME.trim().toLowerCase() &&
          head.ID !== this.SalaryHeadData.ID,
      );

      if (isDuplicate) {
        notify(
          {
            message: 'Salary Head already exists',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
        return;
      }

      const payload = {
        ...this.SalaryHeadData,

        // HEAD_TYPE: this.selectedPriority,
        HEAD_TYPE: this.selectedPriority,
        COMPANY_ID: this.selected_Company_id,
        HEAD_NATURE: selectedTypeId,
        IS_TIMESHEET_ENTRY: this.is_time_entry,
      };
      console.log(payload);

      this.dataservice.Update_salary_Head_api(payload).subscribe((res: any) => {
        this.formClosed.emit();
        notify(
          {
            message: 'Salary Head updated successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
      });
    }
    // });
  }
  onRequlerOrpaytimeChanged(e: any) {
    console.log(e.value); // true or false

    this.is_time_entry = e.value === 2;
  }
  onChangeAc_head(e: any) {}
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
    DxiGroupModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [SalaryHeadEditComponent],
  exports: [SalaryHeadEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadEditModule {}
