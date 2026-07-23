import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxDateBoxModule,
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
export class EmployeeSalarySettingsAddComponent implements OnInit {
  @Output() formClosed = new EventEmitter<boolean>();
  @Output() popupClosed = new EventEmitter<void>();

  @ViewChild('effectFromValidator', { static: false }) effectFromValidator: any;
  @ViewChild('SalaryHeadValidation', { static: false }) SalaryHeadValidation:
    | DxValidationGroupComponent
    | undefined;

  EmployeeDropdown: any[] = [];
  selectedEmployee: any = null;
  selectedEmployeeId: any = null;
  batchId: number | undefined;

  salaryGridData: any = {};
  EmployeeSalarySettingsDatasource: any = {};
  SalaryDetails: any[] = [];
  selectedRows: any[] = [];

  PreviousRevision: any = null;
  selected_Company_id: any;
  FinID = 1;

  employeeFormData: any = {
    EMP_CODE: '',
    FIN_ID: '',
    BASIC_SALARY: null,
    PREV_REVISION: '',
    EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  };

  constructor(private dataservice: DataService) {}

  async ngOnInit() {
    this.sessionDetails();
    await this.EmployeeListDropDown();
    await this.get_SalaryHead_List();
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
  }

  getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-01`;
  }

  parseDateSafe(dateString: any): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    const datePart = dateString.split(' ')[0];
    const parts = datePart.split(/[\/\-]/);

    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day, 12, 0, 0);
    }

    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  }

  onEmployeeChanged(event: any) {
    this.selectedEmployeeId = event.value;
    const selectedEmp = this.EmployeeDropdown.find(
      (emp: any) => emp.ID === event.value,
    );

    if (selectedEmp) {
      const empCode = selectedEmp.DESCRIPTION.split('-')[0];
      this.selectedEmployee = { ...selectedEmp, EMP_CODE: empCode };
    }

    this.get_SalaryHead_List();
  }

  validateEffectFrom = (e: any): boolean => {
    const effectFrom = e.value;
    const prev = this.PreviousRevision;

    if (!effectFrom || !prev) return true;

    const eff = new Date(effectFrom.getFullYear(), effectFrom.getMonth(), 1);
    const previous = new Date(prev.getFullYear(), prev.getMonth(), 1);

    return eff > previous;
  };

  async EmployeeListDropDown() {
    const payload = { COMPANY_ID: this.selected_Company_id, NAME: 'Employee' };
    try {
      const response: any = await this.dataservice.getEmployeeDropDown(payload).toPromise();
      this.EmployeeDropdown = response;
    } catch (error) {
      console.error('Failed to load Employee DropDown:', error);
    }
  }

  async get_SalaryHead_List() {
    if (!this.selectedEmployeeId) return;

    const payload = {
      EMP_ID: this.selectedEmployeeId,
      COMPANY_ID: this.selected_Company_id,
    };

    try {
      const res: any = await this.dataservice.get_SalaryHeadList_Api(payload).toPromise();
      this.salaryGridData = res?.Data?.[0] || {};
      this.selectedRows = [];

      const selecteddata = this.salaryGridData?.Details || [];
      this.selectedRows = selecteddata
        .filter((item: any) => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0)
        .map((item: any) => item.HEAD_ID);

      this.SalaryDetails = this.salaryGridData?.Details || [];
      this.PreviousRevision = this.salaryGridData?.EFFECT_FROM
        ? this.parseDateSafe(this.salaryGridData.EFFECT_FROM)
        : null;

      this.employeeFormData.BASIC_SALARY = this.salaryGridData?.SALARY || 0;
      this.effectFromValidator?.instance?.validate();
    } catch (error) {
      console.error('Failed to load Salary Head List:', error);
    }
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
  }

  cancel() {
    this.resetForm();
    this.formClosed.emit(true);
  }

  onEditorPreparing(e: any) {
    const headNature = e.row?.data.HEAD_NATURE;
    const headId = e.row?.data.HEAD_ID;
    const isRowSelected = this.selectedRows?.includes(headId);

    if (e.dataField === 'HEAD_AMOUNT') {
      e.editorOptions.disabled = !(isRowSelected && headNature === '1');
    }

    if (e.dataField === 'HEAD_PERCENT') {
      e.editorOptions.disabled = !(isRowSelected && headNature === '2');
    }
  }

  resetForm() {
    this.employeeFormData = {
      EMP_CODE: '',
      EMP_NAME: '',
      DESIGNATION: '',
      BASIC_SALARY: null,
      EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      IS_INACTIVE: false,
    };

    this.selectedEmployee = null;
    this.selectedEmployeeId = null;
    this.PreviousRevision = null;
    this.selectedRows = [];
    this.salaryGridData = {};
    this.SalaryDetails = [];

    this.effectFromValidator?.instance?.reset();
    this.SalaryHeadValidation?.instance?.reset();
  }

  onCellValueChanged(e: any) {
    const { data, column, value } = e;
    if (column.dataField === 'HEAD_AMOUNT') data.HEAD_AMOUNT = value;
    if (column.dataField === 'HEAD_PERCENT') data.HEAD_PERCENT = value;
  }

  stripToDateOnly(date: Date | null): string | null {
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }

  isValid() {
    return this.SalaryHeadValidation?.instance?.validate().isValid;
  }

  saveEmployee() {
    if (!this.isValid()) return;

    const effectFrom = new Date(this.employeeFormData.EFFECT_FROM);
    const previousRevision = new Date(this.PreviousRevision as Date);

    const effectStr = this.stripToDateOnly(effectFrom);
    const prevStr = this.stripToDateOnly(previousRevision);

    if (prevStr && effectStr && effectStr <= prevStr) {
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
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.FinID,
      EMP_ID: this.selectedEmployee ? this.selectedEmployee.ID : 0,
      SALARY: Number(this.employeeFormData.BASIC_SALARY) || 0,
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
          this.resetForm();
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
