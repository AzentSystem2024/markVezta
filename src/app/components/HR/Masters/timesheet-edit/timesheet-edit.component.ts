import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
  OnInit,
  OnChanges,
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
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-timesheet-edit',
  templateUrl: './timesheet-edit.component.html',
  styleUrls: ['./timesheet-edit.component.scss'],
})
export class TimesheetEditComponent implements OnInit, OnChanges {
  // 1. Angular Decorators & Properties
  // =========================================================================
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();

  @Input() timesheet: any;
  @Input() existingTimesheets: any[] = [];
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  @Input() isReadOnlyMode: boolean = false;

  // Data Collections
  Departments: any[] = [];
  employee: any[] = [];
  salaryHead: any[] = [];
  salaryDataSource: any[] = [];
  stores: any[] = [];
  storeData: any[] = [];
  Stores_List: any[] = [];
  timesheetDetails: any[] = [];
  timesheetList: any[] = [];

  // State Variables
  employee_leaveperiopd_Data: any;
  employeeid: any;
  is_approve: boolean = false;
  is_approved: boolean = false;
  is_verify: boolean = false;
  paySettings: any = {};
  selected_Company_id: any;
  tsMonthDate: Date = new Date();

  // Form State
  timesheetFormData: any = {
    TS_MONTH: '',
    COMPANY_ID: 0,
    EMP_ID: '',
    DAYS: '',
    NORMAL_OT: '',
    HOLIDAY_OT: '',
    LEAVE_FROM: null,
    LEAVE_TO: null,
    WORKED_DAYS: '',
    DAYS_DEDUCTED: '',
    REMARKS: '',
    TIMESHEET_DETAIL: [
      {
        STORE_ID: null,
        DAYS: null,
        NORMAL_OT: null,
        HOLIDAY_OT: null,
        ID: 0,
        TS_ID: 0,
        STORE_NAME: '',
        STORE: null,
        DEPT_ID: 0,
      },
    ],
    TIMESHEET_SALARY: [
      {
        SALARY_HEAD_ID: '',
        AMOUNT: '',
      },
    ],
  };

  // 2. Constructor & Lifecycle Hooks
  // =========================================================================
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.sesstion_Details();
    this.loadDepartment();
    this.getSalaryHead(this.timesheetFormData.TIMESHEET_SALARY || []);
    this.getStoreDropdown();
    this.getEmployeeDropdown();
    this.fetchTimesheetList();
    this.getPaySettings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timesheet'] && changes['timesheet'].currentValue) {
      this.timesheetFormData = {
        ...this.timesheetFormData,
        ...changes['timesheet'].currentValue,
      };

      const existingSalary = this.timesheetFormData.TIMESHEET_SALARY || [];
      this.getSalaryHead(existingSalary);

      this.is_verify = this.isVerifyMode;
      this.is_approved = this.isApproveMode;
      this.is_approve = this.isReadOnlyMode || this.isVerifyMode;

      this.timesheetDetails = (
        this.timesheetFormData.TIMESHEET_DETAIL || []
      ).map((detail: any) => ({
        ...detail,
        STORE: String(detail.STORE_ID),
      }));

      if (this.stores && this.stores.length > 0) {
        this.stores = this.stores.map((store: any) => ({
          ...store,
          ID: String(store.ID),
        }));
      }

      if (
        this.stores &&
        this.stores.length > 0 &&
        this.storeData &&
        this.storeData.length > 0
      ) {
        this.timesheetDetails = [
          ...this.timesheetDetails,
          ...this.storeData.filter(
            (storeRow: any) =>
              !this.timesheetDetails.some(
                (ts: any) => ts.STORE === storeRow.STORE,
              ),
          ),
        ];
      }

      this.fetchTimesheetList();
      this.employeeid = this.timesheetFormData.EMP_ID;
    }
  }

  // 3. Initialization & Configuration
  // =========================================================================
  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID || 0;
  }

  getPaySettings() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.get_PaySettingsList(payload).subscribe((res: any) => {
      this.paySettings = Array.isArray(res.data) ? res.data[0] : res.data || {};
    });
  }

  // 4. Data Fetching (API Calls)
  // =========================================================================
  fetchTimesheetList() {
    const dateObj = new Date(this.timesheetFormData.TS_MONTH);

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      MONTH: dateObj
        .toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(/\s/g, ''),
    };

    this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
      this.timesheetList = response.data;
    });
  }

  getEmployeeDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'EMPLOYEE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.employee = response;
      this.setEmployeeName();
    });
  }

  getStoreDropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Stores_List = response;
    });
  }

  loadDepartment() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'DEPT',
    };

    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Departments = response;

      if (
        !this.timesheetFormData.TIMESHEET_DETAIL ||
        this.timesheetFormData.TIMESHEET_DETAIL.length === 0
      ) {
        this.timesheetDetails = this.Departments.map(() => ({
          DEPT_ID: null,
          DAYS: null,
          NORMAL_OT: null,
          HOLIDAY_OT: null,
          STORE_ID: null,
        }));
      }
    });
  }

  getSalaryHead(existingData: any[] = []) {
    const payload = {
      NAME: 'PAYTIME_ENTRY',
    };

    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.salaryHead = response.data || response;

      this.salaryDataSource = this.salaryHead.map((item: any) => {
        const existing = existingData.find(
          (x: any) => Number(x.SALARY_HEAD_ID) === Number(item.ID),
        );

        return {
          SALARY_HEAD_ID: item.ID,
          AMOUNT: existing ? existing.AMOUNT : null,
        };
      });

      this.salaryDataSource = [...this.salaryDataSource];
      setTimeout(() => {
        this.dataGrid?.instance?.refresh();
      });
    });
  }

  Employee_leaveperiod() {
    this.dataService.Employee_leave_period().subscribe((res: any) => {
      this.employee_leaveperiopd_Data = res.data[0];
      this.timesheetFormData.LEAVE_FROM =
        this.employee_leaveperiopd_Data?.LEAVE_FROM || '';
      this.timesheetFormData.LEAVE_TO =
        this.employee_leaveperiopd_Data?.LEAVE_TO || '';
      this.timesheetFormData.DAYS = this.employee_leaveperiopd_Data?.TOTAL_DAYS;
    });
  }

  // 5. Event Handlers
  // =========================================================================
  onEmployeeSelected(e: any) {
    this.employeeid = e.value;
    this.Employee_leaveperiod();
    this.timesheetFormData.EMP_NAME = e.value;
    this.timesheetFormData.DAYS = '30';

    const selectedEmployee = this.employee.find(
      (emp: any) => emp.ID === this.timesheetFormData.EMP_NAME,
    );

    if (selectedEmployee) {
      this.timesheetFormData.EMP_NO = selectedEmployee.EMP_NO;
      this.timesheetFormData.EMP_NAME = selectedEmployee.DESCRIPTION;
    }

    const duplicateTimesheet = this.existingTimesheets.find(
      (ts: any) =>
        ts.TS_MONTH === this.timesheetFormData.TS_MONTH &&
        ts.EMP_NO == selectedEmployee?.EMP_NO &&
        ts.ID !== this.timesheetFormData.ID,
    );

    if (duplicateTimesheet) {
      notify(
        {
          message: `Employee "${selectedEmployee?.DESCRIPTION}" already has a timesheet for ${this.timesheetFormData.TS_MONTH}.`,
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );

      this.timesheetFormData.EMP_ID = null;
      this.timesheetFormData.EMP_NO = null;
      this.timesheetFormData.EMP_NAME = null;
    }
  }

  onMonthChanged(event: any) {
    this.tsMonthDate = new Date(event.value);
    const year = this.tsMonthDate.getFullYear();
    const month = String(this.tsMonthDate.getMonth() + 1).padStart(2, '0');
    this.timesheetFormData.TS_MONTH = `${year}-${month}`;
  }

  onEditorPreparingTImesheetdetails(e: any) {
    if (
      e.parentType !== 'dataRow' ||
      !['STORE_ID', 'DAYS', 'NORMAL_OT', 'HOLIDAY_OT'].includes(e.dataField)
    ) {
      return;
    }

    e.editorOptions = e.editorOptions || {};

    e.editorOptions.elementAttr = {
      style: `
      height:100%;
      margin:0;
      padding:0;
      display:flex;
      align-items:center;
    `,
    };

    e.editorOptions.inputAttr = {
      style: `
      height:100%;
      padding:0 4px;
      box-sizing:border-box;
    `,
    };

    if (e.editorName === 'dxNumberBox') {
      e.editorOptions.showSpinButtons = false;
    }

    if (e.editorName === 'dxSelectBox') {
      e.editorOptions.openOnFieldClick = true;
    }

    e.editorOptions.onKeyDown = (args: any) => {
      if (args.event.key !== 'Enter') {
        return;
      }

      args.event.preventDefault();

      if (typeof e.setValue === 'function') {
        if (
          ['DAYS', 'NORMAL_OT', 'HOLIDAY_OT'].includes(e.dataField) &&
          args.event &&
          args.event.target
        ) {
          let typedValue = args.event.target.value;
          if (typedValue !== undefined && typedValue !== '') {
            e.setValue(Number(typedValue));
          }
        } else {
          e.setValue(args.component.option('value'));
        }
      }

      const grid = this.dataGrid.instance;
      const rowIndex = e.row.rowIndex;

      switch (e.dataField) {
        case 'STORE_ID':
          if (!args.component.option('opened')) {
            args.component.open();
            return;
          }
          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'DAYS');
            }, 50);
          });
          break;

        case 'DAYS':
          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'NORMAL_OT');
            }, 50);
          });
          break;

        case 'NORMAL_OT':
          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'HOLIDAY_OT');
            }, 50);
          });
          break;

        case 'HOLIDAY_OT':
          grid.saveEditData().then(() => {
            const row = this.timesheetDetails[rowIndex];

            if (!row.STORE_ID || !row.DAYS) {
              notify(
                {
                  message: 'Store and Worked Days are mandatory.',
                  position: {
                    at: 'top center',
                    my: 'top center',
                  },
                },
                'warning',
              );
              return;
            }

            this.addNewRow();

            setTimeout(() => {
              const newRowIndex = this.timesheetDetails.length - 1;
              grid.editCell(newRowIndex, 'STORE_ID');
            }, 100);
          });
          break;
      }
    };
  }

  onTimesheetDetailsUpdated(e: any) {
    const rowIndex = e.component.getRowIndexByKey(e.key);

    if (rowIndex !== -1) {
      this.timesheetFormData.TIMESHEET_DETAIL[rowIndex] = {
        STORE_ID: e.data.STORE,
        DAYS: e.data.DAYS,
        NORMAL_OT: e.data.NORMAL_OT,
        HOLIDAY_OT: e.data.HOLIDAY_OT,
      };
      setTimeout(() => {
        this.calculateTotalWorkedDays();
      }, 0);
    }
  }

  onSalaryHeadUpdated(e: any) {
    const updatedRow = e.data;

    const index = this.timesheetFormData.TIMESHEET_SALARY.findIndex(
      (item: any) => item.SALARY_HEAD_ID === updatedRow.SALARY_HEAD_ID,
    );

    if (index > -1) {
      this.timesheetFormData.TIMESHEET_SALARY[index].AMOUNT = updatedRow.AMOUNT;
    } else {
      this.timesheetFormData.TIMESHEET_SALARY.push({
        SALARY_HEAD_ID: updatedRow.SALARY_HEAD_ID,
        AMOUNT: updatedRow.AMOUNT,
      });
    }

    this.timesheetFormData.TIMESHEET_SALARY =
      this.timesheetFormData.TIMESHEET_SALARY.filter(
        (item: any) => item.SALARY_HEAD_ID !== '' && item.AMOUNT !== '',
      );
  }

  // 6. Data Processing & Helpers
  // =========================================================================
  setEmployeeName() {
    if (this.timesheetFormData.EMP_ID && this.employee?.length) {
      const matchedEmployee = this.employee.find(
        (emp: any) => emp.ID == this.timesheetFormData.EMP_ID,
      );
      if (matchedEmployee) {
        this.timesheetFormData.EMP_NAME = matchedEmployee.ID;
      } else {
        this.timesheetFormData.EMP_NAME = null;
      }
    }
  }

  addNewRow() {
    const hasEmptyRow = this.timesheetDetails.some(
      (row: any) =>
        (!row.DAYS || row.DAYS === 0) &&
        (!row.NORMAL_OT || row.NORMAL_OT === 0) &&
        (!row.HOLIDAY_OT || row.HOLIDAY_OT === 0),
    );

    if (hasEmptyRow) {
      notify(
        {
          message:
            'An empty row already exists. Please fill it before adding a new one.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
      );
      return;
    }

    this.timesheetDetails.push({
      DEPT_ID: null,
      DAYS: null,
      NORMAL_OT: null,
      HOLIDAY_OT: null,
      STORE_ID: null,
    });

    this.timesheetDetails = [...this.timesheetDetails];
  }

  calculateTotalWorkedDays() {
    if (this.timesheetFormData && this.timesheetFormData.TIMESHEET_DETAIL) {
      const totalDays = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail: any) => Number(detail.DAYS) || 0,
      ).reduce((sum: number, val: number) => sum + val, 0);
      this.timesheetFormData.WORKED_DAYS = totalDays;

      const totalOTHours = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail: any) => Number(detail.NORMAL_OT) || 0,
      ).reduce((sum: number, val: number) => sum + val, 0);
      this.timesheetFormData.NORMAL_OT = totalOTHours;

      const totalHolidayOT = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail: any) => Number(detail.HOLIDAY_OT) || 0,
      ).reduce((sum: number, val: number) => sum + val, 0);
      this.timesheetFormData.HOLIDAY_OT = totalHolidayOT;
    }
  }

  buildTimesheetPayload() {
    const totalworkdays = this.timesheetDetails.reduce(
      (sum, item) => sum + (Number(item.DAYS) || 0),
      0,
    );

    let actualEmpName = '';
    let actualEmpCode = '';

    const empIdValue = this.timesheetFormData.EMP_ID || this.employeeid;

    const emp = this.employee.find((e: any) => e.ID == empIdValue);

    if (emp) {
      actualEmpName = emp.DESCRIPTION;
      actualEmpCode = emp.EMP_NO || '';
    }

    const formattedDetails = this.timesheetDetails.map((item: any) => ({
      ...item,
      ID: item.ID || 0,
      TS_ID: item.TS_ID || 0,
    }));

    return {
      ...this.timesheetFormData,
      TIMESHEET_DETAIL: formattedDetails,
      WORKED_DAYS: totalworkdays,
      COMPANY_ID: this.selected_Company_id,
      EMP_ID: empIdValue,
      EMP_CODE: actualEmpCode,
      EMP_NAME: actualEmpName,
    };
  }

  validTime = (e: any) => {
    const value = Number(e.value) || 0;
    const maxOt = Number(this.paySettings?.MAX_OT_MTS) || 12;
    const dataField = e.column?.dataField;

    let cellMax = maxOt;
    if (dataField === 'NORMAL_OT') {
      cellMax = Number(this.paySettings?.NORMAL_OT_RATE) || maxOt;
    } else if (dataField === 'HOLIDAY_OT') {
      cellMax = Number(this.paySettings?.HOLIDAY_OT_RATE) || maxOt;
    }

    if (value > cellMax) {
      e.rule.message = `Maximum allowed ${e.column?.caption || 'OT'} is ${cellMax} hours`;
      return false;
    }

    if (e.data) {
      const normalOt =
        dataField === 'NORMAL_OT' ? value : Number(e.data.NORMAL_OT) || 0;
      const holidayOt =
        dataField === 'HOLIDAY_OT' ? value : Number(e.data.HOLIDAY_OT) || 0;

      if (normalOt + holidayOt > maxOt) {
        e.rule.message = `Total OT (Normal + Holiday) cannot exceed ${maxOt} hours`;
        return false;
      }
    }

    return true;
  };

  validateDays = (e: any) => {
    const enteredDays = Number(e.value) || 0;
    const maxDays = Number(this.timesheetFormData.DAYS) || 0;

    return enteredDays <= maxDays;
  };

  formatDateDDMMYYYY(date: any) {
    if (!date) return null;

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // 7. Action Methods (Submissions)
  // =========================================================================
  updateTimesheet() {
    if (
      !this.timesheetFormData.TIMESHEET_SALARY ||
      this.timesheetFormData.TIMESHEET_SALARY.length === 0
    ) {
      this.timesheetFormData.TIMESHEET_SALARY = [
        { SALARY_HEAD_ID: 0, AMOUNT: 0 },
      ];
    } else {
      this.timesheetFormData.TIMESHEET_SALARY =
        this.timesheetFormData.TIMESHEET_SALARY.map((salary: any) => ({
          SALARY_HEAD_ID: Number(salary.SALARY_HEAD_ID) || 0,
          AMOUNT: Number(salary.AMOUNT) || 0,
        }));
    }
    const rawDatefrom = this.timesheetFormData.LEAVE_FROM;
    const dateOnlyfrom = rawDatefrom?.split(' ')[0] || '';

    const rawDateTo = this.timesheetFormData.LEAVE_TO;
    const dateOnlyto = rawDateTo?.split(' ')[0] || '';

    const payload = {
      ...this.timesheetFormData,
      LEAVE_FROM: this.formatDateDDMMYYYY(dateOnlyfrom),
      LEAVE_TO: this.formatDateDDMMYYYY(dateOnlyto),
    };

    const totalworkdays = this.timesheetDetails.reduce(
      (sum, item) => sum + (Number(item.DAYS) || 0),
      0,
    );

    const expectedDays = Number(this.timesheetFormData.DAYS) || 0;

    if (totalworkdays <= expectedDays + 0.001) {
      const enteredRows = this.timesheetDetails.filter(
        (item: any) =>
          item.STORE_ID ||
          Number(item.DAYS) > 0 ||
          Number(item.NORMAL_OT) > 0 ||
          Number(item.HOLIDAY_OT) > 0,
      );

      const invalidStore = enteredRows.some(
        (item: any) => !item.STORE_ID || Number(item.STORE_ID) === 0,
      );

      if (invalidStore) {
        notify(
          {
            message: 'Store is mandatory in Timesheet Details',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
        return;
      }

      this.timesheetDetails = enteredRows;
      const finalPayload = this.buildTimesheetPayload();

      const isEmployeeExists = this.timesheetList?.some(
        (item: any) =>
          Number(item.EMP_ID) === Number(this.employeeid) &&
          item.ID !== this.timesheetFormData.ID,
      );

      if (isEmployeeExists) {
        notify(
          {
            message: 'Employee already exists in this timesheet',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
        return;
      }

      this.dataService
        .updateTimesheet(finalPayload)
        .subscribe((response: any) => {
          if (response) {
            notify(
              {
                message: 'Timesheet Updated Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.popupClosed.emit();
          } else {
            notify(
              {
                message: 'Your Data Not updated',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
    } else {
      notify(
        {
          message: `Entered total days in grid (${totalworkdays}) cannot be greater than total days worked (${expectedDays})`,
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
    }
  }

  verifyTimesheet() {
    confirm(
      'Are you sure you want to verify this timesheet?',
      'Confirm Verification',
    ).then((result) => {
      if (!result) {
        return;
      }

      const payload = {
        IDs: [this.timesheetFormData.ID],
      };

      this.dataService.verifyTimesheet(payload).subscribe((response: any) => {
        notify(
          {
            message: 'Timesheet Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );

        this.popupClosed.emit();
      });
    });
  }

  approveTimesheet() {
    confirm(
      'Are you sure you want to approve this timesheet?',
      'Confirm Approval',
    ).then((result) => {
      if (!result) {
        return;
      }

      const payload = {
        IDs: [this.timesheetFormData.ID],
      };

      this.dataService
        .Timesheet_Approval_Api(payload)
        .subscribe((response: any) => {
          notify(
            {
              message: 'Timesheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );

          this.popupClosed.emit();
        });
    });
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
    DxPopupModule,
    DxDropDownBoxModule,
    DxToolbarModule,
    DxiItemModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [TimesheetEditComponent],
  exports: [TimesheetEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetEditModule {}
