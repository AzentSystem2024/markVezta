// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  Output,
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
import { SelectionChangedEvent } from 'devextreme/ui/data_grid';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-salary-head-add',
  templateUrl: './salary-head-add.component.html',
  styleUrls: ['./salary-head-add.component.scss'],
})
export class SalaryHeadAddComponent {
  @Output() formClosed = new EventEmitter<void>();

  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;
  selectedHeads: any;
  Ac_head_values: any;
  affective_value: boolean = false;
  selectedNatureId: any;
  isEnabled = true;
  HeadType_value: any;
  isDisableNumberbox: boolean = false;
  ApplicableWorkingDay: boolean = false;
  selecteNatureTypeTwo: boolean = false;
  selecteNatureTypeone: boolean = false;
  ApplicableWithBasicRange: boolean = false;
  head_percent: boolean = false;
  head_From: boolean = false;
  head_To: boolean = false;
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
  is_time_entry: boolean = false;

  priorities = [
    { id: 1, name: 'Gross' },
    { id: 2, name: 'Deduction' },
    { id: 3, name: 'Advance' },
  ];
  RequlerOrpaytime = [
    { name: 'Regular Salary', value: 1 },
    { name: 'Paytime Entry', value: 2 },
  ];

  selectedPaytime = 1;
  // selectedPriority  = this.priorities[0];
  // // or set by id
  selectedPriority = this.priorities.find((p) => p.id === 1);
  salaryHeadTypes = [{ label: 'Fixed Amount', value: 'fixed' }];
  salaryHeadTypes2 = [{ label: '', value: 'percentage' }];
  salaryHeadTypes3 = [{ label: 'Others', value: 'others' }];

  //  , // Label not shown for second radio
  //
  // selectedType:any
  selectedType: any;
  selectedRows: any[] | undefined;
  salaryHeadList: any = [];
  payload: any = {
    COMPANY_ID: null,
    HEAD_NATURE: null,
    HEAD_TYPE: null,
    HEAD_NAME: '',
    PAYSLIP_TITLE: '',
    HEAD_ACTIVE: true,
    INSTALLMENT_RECOVERY: false,
    HEAD_PERCENT_INCLUDE_OT: true,
    IS_INACTIVE: false,
    AFFECT_LEAVE: false,
    AC_HEAD_ID: 0,
    HEAD_ORDER: 0,
    FIXED_AMOUNT: 0,
    HEAD_PERCENT: 0,
    PERCENT_HEAD_ID: [] as any[],
    RANGE_EXISTS: false,
    RANGE_FROM: 0,
    RANGE_TO: 0,
    IS_TIMESHEET_ENTRY: false,
  };
  selected_Company_id: any;

  constructor(private dataservice: DataService) {}

  ngOnInit() {
    // Default priority
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    this.HeadType_value = 1;
    this.isEnabled = true;

    // Default radio selection
    this.selectedType = 'fixed';

    // 🔥 Apply UI enable/disable logic
    this.onTypeChange();

    // Load dropdowns & lists
    this.get_headnameGrid();
    this.sesstion_Details();
    this.getSalaryHeadList();
    this.selectedPaytime = 1;

    this.dataservice.Dropdown_ac_head(name).subscribe((res: any) => {
      this.Ac_head_values = res;
    });
  }

 
  //=============== head_name dropdown==========
  get_headnameGrid() {
    this.dataservice.Dropdown_advance_types(name).subscribe((res: any) => {
      this.selectedHeads = res;
    });
  }

  //===================grid value=====================
  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedRowsData = event.selectedRowsData;

    this.SalaryHeadData.PERCENT_HEAD_ID = selectedRowsData.map(
      (row: any) => row.ID,
    );
  }
  //================auto fill payslip title=====================
  onHeadNameChanged(e: any) {
    this.SalaryHeadData.HEAD_NAME = e.value;

    // Auto-fill PAYSLIP_TITLE only if it's empty
    if (!this.SalaryHeadData.PAYSLIP_TITLE) {
      this.SalaryHeadData.PAYSLIP_TITLE = e.value;
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  //=======================list data=============
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
    // this.getSalaryHeadList()
    if (this.salaryHeadList && this.salaryHeadList.length > 0) {
      const maxOrder = Math.max(
        ...this.salaryHeadList.map((item: any) => item.HEAD_ORDER || 0),
      );
      this.SalaryHeadData.HEAD_ORDER = maxOrder + 1;
    } else {
      this.SalaryHeadData.HEAD_ORDER = 1; // Default if list is empty
    }
  }

  // onTypeChangedd(e:any){

  // }

  onPriorityChanged(e: any) {
    this.selectedPriority = e.value;
    this.HeadType_value = e.value.id || 1;

    this.isEnabled = this.HeadType_value === 1 || this.HeadType_value === 2;

    if (this.HeadType_value == 3) {
      const defaultNumericValue = 3;

      const defaultTypeMap: { [key: number]: string } = {
        1: 'fixed',
        2: 'percentage',
        3: 'others',
      };
      // Set selectedType based on numeric default
      this.selectedType = defaultTypeMap[defaultNumericValue];
    }
  }

  setDefaultValues() {
    const defaultNumericValue = 1;

    const defaultTypeMap: { [key: number]: string } = {
      1: 'fixed',
      2: 'percentage',
      3: 'others',
    };

    // Set selectedType based on numeric default
    this.selectedType = defaultTypeMap[defaultNumericValue];
    if (this.selectedType == 'fixed') {
      this.selecteNatureTypeTwo = true;
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
    }
    this.selectedPriority = this.priorities.find((p) => p.id === 1); // Allowance
    this.SalaryHeadData.HEAD_TYPE = 1;
    this.HeadType_value = 1;
    this.isEnabled = true;
  }


  validateAcLedger = (e: any): boolean => {
    if (this.HeadType_value === 3) {
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
  }

  isValid() {
    return this.SalaryHeadValidation?.instance.validate().isValid;
  }

  //=============save salary head data========================
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

      if (this.SalaryHeadData.HEAD_NATURE === 3) {
        this.payload = {
          ...this.SalaryHeadData,
          COMPANY_ID: this.selected_Company_id,
          HEAD_NATURE: this.selectedNatureId,
          FIXED_AMOUNT: 0,
          HEAD_TYPE: this.HeadType_value || 1,
          IS_TIMESHEET_ENTRY: this.is_time_entry,
        };
      } else {
        this.payload = {
          ...this.SalaryHeadData,
          COMPANY_ID: this.selected_Company_id,
          HEAD_NATURE: this.selectedNatureId,
          HEAD_TYPE: this.HeadType_value || 1,
          IS_TIMESHEET_ENTRY: this.is_time_entry,
        };
      }
     
      const data = this.payload;

      this.dataservice.Add_salary_Head_api(data).subscribe((res: any) => {
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
        this.selectedPriority;
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

    // Reset to default priority (Allowance)
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    // this.HeadType_value = 1; // Reset HeadType_value as well
    this.isEnabled = true;

    // Reset other UI flags
    this.selecteNatureTypeTwo = false;
    this.head_percent = false;
    this.head_From = false;
    this.head_To = false;
    this.ApplicableWithBasicRange = false;
    this.ApplicableWorkingDay = false;
    this.selecteNatureTypeone = false;

    // Reset validation and selections
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
    this.selectedNatureId = null;
    this.selectedType = null; // Reset the selected type as well

    this.selectedPriority = this.priorities.find((p) => p.id === 1); // Reset to Allowance
    this.HeadType_value = 1;
  }
 

  //=====cancel==============================
  //

  cancel() {
    this.formClosed.emit();
    this.resetForm();
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
  }
  onRequlerOrpaytimeChanged(e: any) {
    console.log(e.value); // true or false

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
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxNumberBoxModule,
    DxiGroupModule,
    DxValidatorModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [SalaryHeadAddComponent],
  exports: [SalaryHeadAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadAddModule {}
