import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
  DxLoadPanelModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-employee-salary-settings-edit',
  templateUrl: './employee-salary-settings-edit.component.html',
  styleUrls: ['./employee-salary-settings-edit.component.scss'],
})
export class EmployeeSalarySettingsEditComponent {
  @Output() formClosed = new EventEmitter<boolean>();
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxFormComponent, { static: false }) formRef:
    | DxFormComponent
    | undefined;
  @ViewChild('salaryGrid', { static: false })
  salaryGridRef: DxDataGridComponent | undefined;

  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent | undefined;

  @Input() employeeData: any;

  EmployeeDropdown: any;
  selectedEmployee: any;
  SalaryHeadList: any;
  salaryGridData: any = {};
  EmployeeSalarySettingsDatasource: any;
  selectedFilterAction: number = 4; // default is "All"
  selectedEmployeeId: any = null;
  SalaryDetails: any[] = [];
  selected_Batch_id: any;
  selected_Company_id: any;
  FinID = 1;
  selectedRows: any[] = [];
  PreviousRevision: any;
  employeeFormData: any = {
    EMP_CODE: '',
    FIN_ID: '',
    BASIC_SALARY: undefined,
    PREV_REVISION: '',
    EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // always 1st of current month
  };
  isLoading: boolean = false;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.sessionDetails();
    this.EmployeeListDropDown();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['employeeData'] &&
      changes['employeeData'].currentValue &&
      changes['employeeData'].currentValue.ID
    ) {
      this.selectedEmployee = changes['employeeData'].currentValue;
      console.log('selected in changes', this.selectedEmployee);
      this.selectedEmployeeId = this.selectedEmployee.ID;

      this.SalaryDetails = [];
      this.get_SalaryHead_List();

      this.cdr.detectChanges(); // Ensure grid gets new data

      setTimeout(() => {
        this.selectedRows = this.SalaryDetails.filter(
          (item) => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0,
        ).map((item) => item.HEAD_ID);

        // Optional: manually refresh selection
        if (this.salaryGridRef?.instance) {
          this.salaryGridRef.instance.selectRows(this.selectedRows, false);
        }
      }, 100); // Slight delay ensures grid is ready
    }
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

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

    if (!this.selectedEmployee) {
      console.warn('No employee data available');
      return;
    }

    // Extract the employee object (handle both array and object formats)
    const empData = Array.isArray(this.selectedEmployee) 
      ? this.selectedEmployee[0] 
      : this.selectedEmployee;

    if (!empData) return;

    this.selected_Batch_id = empData.BATCH_ID;

    this.employeeFormData = {
      EMP_CODE: empData.EMP_CODE || '',
      EMP_NAME: empData.EMP_NAME || '',
      DESIGNATION: empData.DESG_NAME || '',
      BASIC_SALARY: empData.SALARY ? Number(empData.SALARY) : undefined,
      EFFECT_FROM: empData.EFFECT_FROM 
        ? this.parseDateSafe(empData.EFFECT_FROM) 
        : null,
      PREVIOUS_EFFECT_FROM: empData.PREVIOUS_EFFECT_FROM
        ? this.parseDateSafe(empData.PREVIOUS_EFFECT_FROM)
        : null,
      IS_INACTIVE: empData.IS_INACTIVE || false,
    };

    this.salaryGridData = empData;
    this.SalaryDetails = empData.Details || [];
    this.PreviousRevision = empData.PREVIOUS_EFFECT_FROM || '';

    // Pre-select rows that have a positive amount or percent
    this.selectedRows = this.SalaryDetails
      .filter((item: any) => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0)
      .map((item: any) => item.HEAD_ID);
  }

  onEmployeeChanged(event: any) {
    // Prevent double execution and overwriting of selectedEmployee on load
    if (this.selectedEmployee && this.selectedEmployee.ID === event.value) {
      return;
    }

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
      // this.employeeFormData.BASIC_SALARY = selectedEmp.SALARY || 0;
    }

    this.get_SalaryHead_List(); // Move this here
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
      0, // ✅ Set time to 12:00 noon
    );

    const currentMonthFirstDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
      12,
      0,
      0, // Also set this to noon
    );
  }

  cancel() {
    this.employeeFormData = {
      EMP_CODE: '',
      FIN_ID: '',
      BASIC_SALARY: undefined,
      PREV_REVISION: '',
      EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // always 1st of current month
    };
    this.PreviousRevision = null;
    this.selectedEmployee = null;
    this.selectedEmployeeId = null;
    this.selectedRows = [];
    this.salaryGridData = [];
    this.SalaryDetails = [];
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.formClosed.emit(true);
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
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

  onCellValueChanged(e: any) {
    const { data, column, value } = e;

    if (column.dataField === 'HEAD_AMOUNT') {
      data.HEAD_AMOUNT = value;
    }

    if (column.dataField === 'HEAD_PERCENT') {
      data.HEAD_PERCENT = value;
    }
  }

  getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 1-based
    const day = '01'; // Always first day
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  }

  parseDateSafe(dateString: any): Date | null {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;

    // Parse format like "3/1/2026 12:00:00 AM" (M/D/YYYY)
    const datePart = dateString.split(' ')[0];
    const parts = datePart.split(/[\/\-]/);

    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      // Set to noon to avoid timezone shift backward to previous day
      return new Date(year, month, day, 12, 0, 0);
    }

    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    return null;
  }

  isValid() {
    return this.SalaryHeadValidation?.instance.validate().isValid;
  }
  
  stripToDateOnly(date: Date | null): string | null {
    if (!(date instanceof Date) || isNaN(date.getTime())) return null;
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    return `${yyyy}-${mm.toString().padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
  }

  saveEmployee() {
    if (!this.isValid()) return;
    const effectFrom = new Date(this.employeeFormData.EFFECT_FROM);
    const previousRevision = new Date(this.PreviousRevision);

    const effectStr: any = this.stripToDateOnly(effectFrom);
    const prevStr = this.stripToDateOnly(previousRevision);
    console.log(effectFrom);
    console.log(previousRevision);
    console.log(effectStr);
    console.log(prevStr);

    if (prevStr && effectStr < prevStr) {
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
      EMP_ID: this.selectedEmployee ? this.selectedEmployee.ID : 0,
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.FinID,
      BATCH_ID: this.selected_Batch_id,
      // EMP_CODE: String(this.selectedEmployee.EMP_CODE),
      SALARY: Number(this.employeeFormData.BASIC_SALARY) || null,
      EFFECT_FROM: formatDate(
        this.employeeFormData.EFFECT_FROM,
        'yyyy-MM-dd',
        'en-US',
      ),

      Details: this.SalaryDetails.filter(
        (item) =>
          this.selectedRows.includes(item.HEAD_ID) &&
          (Number(item.HEAD_AMOUNT) > 0 || Number(item.HEAD_PERCENT) > 0),
      ) //
        .map((item) => ({
          HEAD_ID: item.HEAD_ID,
          HEAD_NAME: item.HEAD_NAME,
          HEAD_NATURE: item.HEAD_NATURE,
          HEAD_PERCENT: Number(item.HEAD_PERCENT) || 0,
          HEAD_AMOUNT: item.HEAD_AMOUNT,
          IS_INACTIVE: !!item.IS_INACTIVE,
        })),
    };

    this.dataservice
      .Update_EmployeeSalarySettings_Api(payload)
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
          this.cancel();
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
    DxLoadPanelModule,
  ],
  providers: [],
  declarations: [EmployeeSalarySettingsEditComponent],
  exports: [EmployeeSalarySettingsEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsEditModule {}
