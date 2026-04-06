import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormComponent,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-employee-salary-settings-add',
  templateUrl: './employee-salary-settings-add.component.html',
  styleUrls: ['./employee-salary-settings-add.component.scss'],
})
export class EmployeeSalarySettingsAddComponent {
  @Output() formClosed = new EventEmitter<boolean>();
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('effectFromValidator', { static: false }) effectFromValidator: any;

  @ViewChild('formValidationGroup', { static: true })
  formValidationGroup!: DxValidationGroupComponent;
  @ViewChild(DxFormComponent, { static: false }) formRef:
    | DxFormComponent
    | undefined;
  @ViewChild('salaryGrid', { static: false })
  salaryGridRef: DxDataGridComponent | undefined;
  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;

  EmployeeDropdown: any;
  selectedEmployee: any;
  batchId: number | undefined;
  SalaryHeadList: any;
  salaryGridData: any = {};
  EmployeeSalarySettingsDatasource: any = {}; //  not array

  selectedFilterAction: number = 4; // default is "All"
  selectedEmployeeId: any = null;
  SalaryDetails: any[] = [];
  PreviousRevision: any;
  minDate: Date | undefined;

  selected_Company_id: any;
  // CompanyID = 1;
  FinID = 1;
  selectedRows: any[] = [];
  employeeFormData: any = {
    EMP_CODE: '',
    FIN_ID: '',
    BASIC_SALARY: null,
    PREV_REVISION: '',
    EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // always 1st of current month
  };

  constructor(private dataservice: DataService) {
    this.EmployeeListDropDown();
    this.get_SalaryHead_List();
  }

  ngOnInit() {
    this.sessionDetails();
    this.EmployeeListDropDown();
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getFirstDayDateString(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    const day = 1;
    const localDate = new Date(year, month, day);
    return localDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }

  onEffectFromChanged(e: any) {
    if (!e.value) return;

    // Use noon to avoid timezone rollback
    const selectedMonthFirstDate = new Date(
      e.value.getFullYear(),
      e.value.getMonth(),
      1,
      12,
      0,
      0, // Set time to 12:00 noon
    );

    const currentMonthFirstDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
      12,
      0,
      0, // Also set this to noon
    );

    // if (selectedMonthFirstDate < currentMonthFirstDate) {
    //   e.component.option('value', currentMonthFirstDate);
    //   this.employeeFormData.EFFECT_FROM = currentMonthFirstDate;
    // } else {
    //   e.component.option('value', selectedMonthFirstDate);
    //   this.employeeFormData.EFFECT_FROM = selectedMonthFirstDate;
    // }
  }
  getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 1-based
    const day = '01'; // Always first day
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  }

  onEmployeeChanged(event: any) {
    this.selectedEmployeeId = event.value;

    const selectedEmp = this.EmployeeDropdown.find(
      (emp: any) => emp.ID === event.value,
    );
    if (selectedEmp) {
      const empCode = selectedEmp.DESCRIPTION.split('-')[0]; // "102" from "102-Anusri"
      this.selectedEmployee = {
        ...selectedEmp,
        EMP_CODE: empCode,
      };
    }

    this.get_SalaryHead_List(); //  Move this here
  }

  validateEffectFrom = (e: any): boolean => {
    const effectFrom = e.value;
    const prev = this.PreviousRevision;

    if (!effectFrom || !prev) return true;

    const eff = new Date(effectFrom.getFullYear(), effectFrom.getMonth(), 1);
    const previous = new Date(prev.getFullYear(), prev.getMonth(), 1);

    return eff > previous;
  };

  EmployeeListDropDown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'Employee',
    };
    this.dataservice.getEmployeeDropDown(payload).subscribe((response: any) => {
      this.EmployeeDropdown = response;
    });
  }

  get_SalaryHead_List() {
    if (!this.selectedEmployeeId) {
      console.warn('No employee selected');
      return;
    }

    const payload = {
      EMP_ID: this.selectedEmployeeId,
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.get_SalaryHeadList_Api(payload).subscribe((res: any) => {
      this.salaryGridData = res.Data[0];
      this.selectedRows = [];

      const selecteddata = this.salaryGridData.Details;

      this.selectedRows = selecteddata
        .filter((item: any) => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0)
        .map((item: any) => item.HEAD_ID); // or your row's unique identifier

      this.SalaryDetails = this.salaryGridData.Details || [];
      // this.PreviousRevision = this.salaryGridData.EFFECT_FROM || '';
      this.PreviousRevision = this.salaryGridData.EFFECT_FROM
  ? new Date(this.salaryGridData.EFFECT_FROM)
  : null;

      this.employeeFormData.BASIC_SALARY = this.salaryGridData.SALARY || 0;
      this.effectFromValidator?.instance?.validate(); // force revalidate
    });
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
  }

  cancel() {
    this.employeeFormData = {
      EMP_CODE: '',
      FIN_ID: '',
      BASIC_SALARY: '',
      PREV_REVISION: '',
      EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // always 1st of current month
    };

    this.PreviousRevision = null;
    this.selectedEmployee = null;
    this.selectedEmployeeId = null;
    this.selectedRows = [];
    this.salaryGridData = [];
    this.SalaryDetails = [];
    this.formClosed.emit(true);

    this.formValidationGroup.instance.reset(); // Works
  }

  onEditorPreparing(e: any) {
    //  this.selectedRows = e.row?.data
    const headNature = e.row?.data.HEAD_NATURE;

    const headId = e.row?.data.HEAD_ID;

    const isRowSelected = this.selectedRows?.includes(headId);

    if (e.dataField === 'HEAD_AMOUNT') {
      e.editorOptions.disabled = !(isRowSelected && headNature === '1'); // Enable only if selected and HEAD_NATURE === '1'
    }

    if (e.dataField === 'HEAD_PERCENT') {
      e.editorOptions.disabled = !(isRowSelected && headNature === '2'); // Enable only if selected and HEAD_NATURE === '2'
    }
  }

  resetForm() {
    this.employeeFormData = {
      EMP_CODE: '',
      EMP_NAME: '',
      DESIGNATION: '',
      BASIC_SALARY: '',
      EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      IS_INACTIVE: false,
    };

    this.selectedEmployee = null;
    this.selectedEmployeeId = null;
    this.selectedRows = [];
    this.salaryGridData = [];
    this.SalaryDetails = [];

    // Optional: reset form instance if you're using <dx-form #formRef>
    if (this.formRef?.instance) {
      this.formRef.instance.resetValues();
    }

    // Optional: clear grid selection
    if (this.salaryGridRef?.instance) {
      this.salaryGridRef.instance.clearSelection();
      this.salaryGridRef.instance.refresh();
    }
    this.formValidationGroup.instance.reset(); // Works
    this.formValidationGroup?.instance?.validate(); // Will pass since validator was reset
    this.effectFromValidator?.instance?.reset();
  }

  onCellValueChanged(e: any) {
    const { data, column, value } = e;

    if (column.dataField === 'HEAD_AMOUNT') {
      data.HEAD_AMOUNT = value;
    }

    if (column.dataField === 'HEAD_PERCENT') {
      data.HEAD_PERCENT = value;
    }
  }

  // stripToDateOnly(date: Date): string {
  //   return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // }
  stripToDateOnly(date: Date | null): string | null {
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }
  isValid() {
    return this.SalaryHeadValidation?.instance.validate().isValid;
  }

  saveEmployee() {
    if (!this.isValid()) return;
    const effectFrom = new Date(this.employeeFormData.EFFECT_FROM);
    const previousRevision = new Date(this.PreviousRevision);

    // Convert to yyyy-mm-dd for clean comparison
    const effectStr: any = this.stripToDateOnly(effectFrom);
    const prevStr = this.stripToDateOnly(previousRevision);

    if (prevStr && effectStr <= prevStr) {
      notify(
        {
          message:
            'Effect From date must be greater than Previous Revision date.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 3000,
        },
        'error',
      );
      return;
    }

    const payload = {
      ID: 0,
      // BATCH_ID :this.selectedEmployee.batchId,
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.FinID,
      EMP_ID: this.selectedEmployee ? this.selectedEmployee.ID : 0,

      // EMP_CODE: String(this.selectedEmployee),
      SALARY: Number(this.employeeFormData.BASIC_SALARY) || 0,
      // PREV_REVISION: this.employeeFormData.PREV_REVISION,
      // EFFECT_FROM: this.employeeFormData.EFFECT_FROM,
      EFFECT_FROM: this.getLocalDateString(this.employeeFormData.EFFECT_FROM),

      Details: this.SalaryDetails.filter(
        (item) =>
          this.selectedRows.includes(item.HEAD_ID) &&
          (Number(item.HEAD_AMOUNT) > 0 || Number(item.HEAD_PERCENT) > 0),
      ).map((item) => ({
        HEAD_ID: item.HEAD_ID,
        HEAD_NAME: item.HEAD_NAME,
        HEAD_NATURE: item.HEAD_NATURE,
        HEAD_PERCENT: Number(item.HEAD_PERCENT) || 0,
        HEAD_AMOUNT: Number(item.HEAD_AMOUNT) || 0,
        // EFFECT_FROM: item.EFFECT_FROM,
        IS_INACTIVE: !!item.IS_INACTIVE,
      })),
    };

    this.dataservice
      .Insert_EmployeeSalarySettings_Api(payload)
      .subscribe((res: any) => {
        if (res.message === 'Success') {
          notify(
            {
              message: 'Employee Salary Settings saved successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.popupClosed?.emit();
          this.formClosed.emit(true);

          // Reset data model
          // this.employeeFormData = {
          //   FIN_ID: '',
          //   BASIC_SALARY: '',
          //   PREV_REVISION: '',
          //   EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          // };
          this.PreviousRevision = null;
          this.selectedEmployee = null;
          this.selectedEmployeeId = null;
          this.selectedRows = [];
          this.salaryGridData = [];

          //   // Reset DevExtreme Form
          //   if (this.formRef?.instance) {
          //     this.formRef.instance.resetValues();
          //   }

          //   // Clear Grid selection (optional)
          if (this.salaryGridRef?.instance) {
            this.salaryGridRef.instance.clearSelection();
            this.salaryGridRef.instance.refresh();
          }
          // this.formValidationGroup?.instance?.reset(); // Optional, to clear validation summary
        } else {
          notify(
            {
              message: 'Failed to save Employee Salary Settings',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error',
          );
        }
      });
  }
}
@NgModule({
  imports: [
    DxSelectBoxModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [EmployeeSalarySettingsAddComponent],
  exports: [EmployeeSalarySettingsAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsAddModule {}
