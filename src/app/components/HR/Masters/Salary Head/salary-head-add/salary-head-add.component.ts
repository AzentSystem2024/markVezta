import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  Output,
  ViewChild,
  OnInit,
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
import { SelectionChangedEvent } from 'devextreme/ui/data_grid';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-salary-head-add',
  templateUrl: './salary-head-add.component.html',
  styleUrls: ['./salary-head-add.component.scss'],
})
export class SalaryHeadAddComponent implements OnInit {
  @Output() formClosed = new EventEmitter<void>();

  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;

  selectedHeads: any;
  Ac_head_values: any;
  selectedNatureId: any;
  isEnabled = true;
  ApplicableWorkingDay: boolean = false;
  selecteNatureTypeTwo: boolean = false;
  selecteNatureTypeone: boolean = false;
  ApplicableWithBasicRange: boolean = false;
  head_percent: boolean = false;
  head_From: boolean = false;
  head_To: boolean = false;
  is_time_entry: boolean = false;
  selectedPaytime = 1;
  selectedPriority: any;
  selectedType: any;
  selectedRows: any;
  salaryHeadList: any = [];
  selected_Company_id: any;
  payload: any;

  SalaryHeadData = {
    HEAD_NAME: '',
    PAYSLIP_TITLE: '',
    HEAD_ACTIVE: true,
    HEAD_TYPE: 1,
    INSTALLMENT_RECOVERY: false,
    HEAD_PERCENT_INCLUDE_OT: true,
    IS_INACTIVE: false,
    AFFECT_LEAVE: false,
    AC_HEAD_ID: null,
    HEAD_ORDER: 0,
    HEAD_NATURE: 0,
    FIXED_AMOUNT: 0,
    HEAD_PERCENT: 0,
    PERCENT_HEAD_ID: [] as any[],
    RANGE_EXISTS: false,
    RANGE_FROM: 0,
    RANGE_TO: 0,
    IS_TIMESHEET_ENTRY: false,
  };

  priorities = [
    { id: 1, name: 'Gross' },
    { id: 2, name: 'Deduction' },
    { id: 3, name: 'Advance' },
  ];

  RequlerOrpaytime = [
    { name: 'Regular Salary', value: 1 },
    { name: 'Paytime Entry', value: 2 },
  ];

  salaryHeadTypes = [{ label: 'Fixed Amount', value: 'fixed' }];
  salaryHeadTypes2 = [{ label: '', value: 'percentage' }];
  salaryHeadTypes3 = [{ label: 'Others', value: 'others' }];

  constructor(private dataservice: DataService) {}

  ngOnInit() {
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    this.selectedPaytime = 1;
    this.isEnabled = true;
    this.selectedType = 'fixed';

    this.onTypeChange();
    this.get_headnameGrid();
    this.sesstion_Details();
    this.getSalaryHeadList();

    this.dataservice.Dropdown_ac_head(name).subscribe((res: any) => {
      this.Ac_head_values = res;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  get_headnameGrid() {
    this.dataservice.Dropdown_advance_types().subscribe((res: any) => {
      this.selectedHeads = res;
    });
  }

  getSalaryHeadList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.get_salary_head_list(payload).subscribe((res: any) => {
      this.salaryHeadList = res.Data;
      this.setNextHeadOrder();
    });
  }

  setNextHeadOrder() {
    if (this.salaryHeadList && this.salaryHeadList.length > 0) {
      const maxOrder = Math.max(
        ...this.salaryHeadList.map((item: any) => item.HEAD_ORDER || 0),
      );
      this.SalaryHeadData.HEAD_ORDER = maxOrder + 1;
    } else {
      this.SalaryHeadData.HEAD_ORDER = 1;
    }
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedRowsData = event.selectedRowsData;
    this.SalaryHeadData.PERCENT_HEAD_ID = selectedRowsData.map(
      (row: any) => row.ID,
    );
  }

  onHeadNameChanged(e: any) {
    this.SalaryHeadData.HEAD_NAME = e.value;
    if (!this.SalaryHeadData.PAYSLIP_TITLE) {
      this.SalaryHeadData.PAYSLIP_TITLE = e.value;
    }
  }

  onPriorityChanged(e: any) {
    this.selectedPriority = e.value;
    const priorityId = this.selectedPriority?.id || this.selectedPriority;

    this.isEnabled = priorityId === 1 || priorityId === 2;

    if (priorityId === 3) {
      this.SalaryHeadData.FIXED_AMOUNT = 0;
      this.SalaryHeadData.RANGE_EXISTS = false;
      this.SalaryHeadData.RANGE_TO = 0;
      this.SalaryHeadData.RANGE_FROM = 0;
      this.SalaryHeadData.AFFECT_LEAVE = false;
      this.selectedRows = [];
      this.SalaryHeadData.HEAD_PERCENT = 0;
      
      this.selectedType = 'others';
    } else if (priorityId === 1 || priorityId === 2) {
      this.SalaryHeadData.INSTALLMENT_RECOVERY = false;
    }
  }

  setDefaultValues() {
    this.selectedType = 'fixed';
    this.selecteNatureTypeTwo = true;
    this.head_percent = true;
    this.head_From = true;
    this.head_To = true;
    this.ApplicableWithBasicRange = true;
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    this.selectedPaytime = 1;
    this.SalaryHeadData.HEAD_TYPE = 1;
    this.isEnabled = true;
  }

  validateAcLedger = (e: any): boolean => {
    const priorityId = this.selectedPriority?.id || this.selectedPriority;
    if (priorityId === 3) {
      return e.value !== null && e.value !== undefined && e.value !== '';
    }
    return true;
  };

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
      this.SalaryHeadData.RANGE_EXISTS = false;
      this.SalaryHeadData.RANGE_TO = 0;
      this.SalaryHeadData.RANGE_FROM = 0;
      this.selectedRows = [];
    } else if (this.selectedNatureId === 2) {
      this.selecteNatureTypeTwo = true;
      this.head_percent = false;
      this.head_From = false;
      this.head_To = false;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.ApplicableWithBasicRange = false;
      this.SalaryHeadData.FIXED_AMOUNT = 0;
      this.SalaryHeadData.AFFECT_LEAVE = false;
    } else if (this.selectedNatureId === 3) {
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.selecteNatureTypeTwo = true;
      this.SalaryHeadData.FIXED_AMOUNT = 0;
      this.SalaryHeadData.RANGE_EXISTS = false;
      this.SalaryHeadData.RANGE_TO = 0;
      this.SalaryHeadData.RANGE_FROM = 0;
      this.SalaryHeadData.AFFECT_LEAVE = false;
      this.selectedRows = [];
    }
  }

  isValid() {
    return this.SalaryHeadValidation?.instance.validate().isValid;
  }

  saveSalaryHeadData() {
    if (!this.isValid()) return;
    if (this.SalaryHeadData.HEAD_NAME) {
      const isDuplicate = this.salaryHeadList.some(
        (head: any) =>
          head.HEAD_NAME.trim().toLowerCase() ===
          this.SalaryHeadData.HEAD_NAME.trim().toLowerCase(),
      );

      if (isDuplicate) {
        notify(
          {
            message: 'Salary Head already exist',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
        return;
      }

      const priorityId = this.selectedPriority?.id || this.selectedPriority;
      if (priorityId === 3 && this.SalaryHeadData.AC_HEAD_ID == 0) {
        notify(
          {
            message: 'Please select Account Ledger',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
        return;
      }

      if (
        this.selectedNatureId === 2 &&
        (!this.SalaryHeadData.PERCENT_HEAD_ID ||
          this.SalaryHeadData.PERCENT_HEAD_ID.length === 0)
      ) {
        notify(
          {
            message: 'Please select Atleast one Head Name',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
        return;
      }

      this.payload = {
        ...this.SalaryHeadData,
        COMPANY_ID: this.selected_Company_id,
        HEAD_NATURE: this.selectedNatureId,
        HEAD_TYPE: priorityId || 1,
        IS_TIMESHEET_ENTRY: this.is_time_entry,
      };

      if (this.SalaryHeadData.HEAD_NATURE === 3) {
        this.payload.FIXED_AMOUNT = 0;
      }

      this.dataservice.Add_salary_Head_api(this.payload).subscribe((res: any) => {
        this.getSalaryHeadList();
        notify(
          {
            message: 'Salary Head added successfully ',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );

        this.formClosed.emit();
        setTimeout(() => {
          this.SalaryHeadValidation?.instance?.reset();
        });
        this.selectedRows = [];
        this.selectedNatureId = null;
        this.resetForm();
      });
    }
  }

  resetForm() {
    this.SalaryHeadData = {
      HEAD_NAME: '',
      PAYSLIP_TITLE: '',
      HEAD_ACTIVE: true,
      HEAD_TYPE: 1,
      INSTALLMENT_RECOVERY: false,
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

    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    this.isEnabled = true;

    this.selecteNatureTypeTwo = false;
    this.head_percent = false;
    this.head_From = false;
    this.head_To = false;
    this.ApplicableWithBasicRange = false;
    this.ApplicableWorkingDay = false;
    this.selecteNatureTypeone = false;

    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
    this.selectedNatureId = null;
    this.selectedType = null;
  }

  cancel() {
    this.formClosed.emit();
    this.resetForm();
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
  }

  onRequlerOrpaytimeChanged(e: any) {
    this.is_time_entry = e.value === 2;
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
    DxToolbarModule,
    DxiItemModule,
    DxNumberBoxModule,
    DxiGroupModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [SalaryHeadAddComponent],
  exports: [SalaryHeadAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadAddModule {}
