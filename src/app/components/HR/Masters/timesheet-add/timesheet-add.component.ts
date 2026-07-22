import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
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
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet-add',
  templateUrl: './timesheet-add.component.html',
  styleUrls: ['./timesheet-add.component.scss'],
})
export class TimesheetAddComponent implements OnInit {
  // 1. Angular Decorators & Properties
  // =========================================================================
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;
  @ViewChild('salaryGrid') salaryGrid!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() selectedMonth: string = '';
  @Input() existingTimesheets: any[] = [];

  // Data Collections
  Departments: any[] = [];
  employee: any[] = [];
  salaryHead: any[] = [];
  salaryDataSource: any[] = [];
  Stores_List: any[] = [];
  timesheetDetails: any[] = [];
  timesheetList: any[] = [];

  // State Variables
  employee_leaveperiopd_Data: any;
  paySettings: any = {};
  selectedEmployeeId: any;
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
    LEAVE_FROM: '',
    LEAVE_TO: '',
    WORKED_DAYS: '',
    DAYS_DEDUCTED: 0,
    REMARKS: '',
    TIMESHEET_DETAIL: [
      {
        STORE_ID: null,
        DAYS: null,
        NORMAL_OT: null,
        HOLIDAY_OT: null,
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
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.sesstion_Details();
    this.fetchTimesheetList();
    this.getEmployeeDropdown();
    this.getStoreDropdown();
    this.loadDepartment();
    this.getPayTimeEntries();
    this.getSalaryHead();
    this.getPaySettings();

    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      const formattedDate = new Date(year, month - 1).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          year: 'numeric',
        },
      );
      this.timesheetFormData.TS_MONTH = formattedDate;
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
    const dateObj = new Date(this.selectedMonth);

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
      const employee_res = response;
      if (employee_res) {
        this.employee = employee_res.filter(
          (emp: any) =>
            !this.timesheetList?.some(
              (ts: any) => Number(ts.EMP_ID) === emp.ID,
            ),
        );
      }
    });
  }

  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'STORE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Stores_List = response;
    });
  }

  loadDepartment() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Departments = response;
      this.timesheetDetails = [
        {
          DEPT_ID: null,
          DAYS: null,
          NORMAL_OT: null,
          HOLIDAY_OT: null,
          STORE_ID: null,
        },
      ];
    });
  }

  getPayTimeEntries() {
    const payload = {
      NAME: 'PAYTIME_ENTRY',
    };
    this.dataService.getDropdownData(payload).subscribe((data: any) => {
      this.salaryHead = data;
      this.salaryDataSource = this.salaryHead.map((item: any) => ({
        SALARY_HEAD_ID: item.ID,
        AMOUNT: null,
      }));
    });
  }

  getSalaryHead() {
    this.dataService.getDropdownData('SALARY_HEAD').subscribe((data: any) => {
      this.salaryHead = data;
      this.salaryDataSource = this.salaryHead.map((item: any) => ({
        SALARY_HEAD_ID: item.ID,
        AMOUNT: null,
      }));
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
    this.selectedEmployeeId = e.value;
    this.Employee_leaveperiod();
    const selectedEmployee = this.employee.find(
      (emp) => emp.ID === this.selectedEmployeeId,
    );
    if (selectedEmployee) {
      this.timesheetFormData.EMP_NO = selectedEmployee.EMP_NO;
      this.timesheetFormData.EMP_NAME = selectedEmployee.DESCRIPTION;
    }

    const duplicateTimesheet = this.existingTimesheets.find(
      (ts) =>
        ts.TS_MONTH === this.timesheetFormData.TS_MONTH &&
        ts.EMP_NO === selectedEmployee?.EMP_NO &&
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
      this.timesheetFormData.EMP_NAME = '';
    }
  }

  onMonthChanged(event: any) {
    this.tsMonthDate = new Date(event.value);
    const year = this.tsMonthDate.getFullYear();
    const month = String(this.tsMonthDate.getMonth() + 1).padStart(2, '0');
    this.timesheetFormData.TS_MONTH = `${year}-${month}`;
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'STORE' ||
      e.dataField === 'DAYS' ||
      e.dataField === 'NORMAL_OT' ||
      e.dataField === 'HOLIDAY_OT' ||
      e.dataField === 'SALARY_HEAD_ID' ||
      e.dataField === 'AMOUNT'
    ) {
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.elementAttr = {
        style: `height: 100%; margin: 0; padding: 0; display: flex; align-items: center;`,
      };
      e.editorOptions.inputAttr = {
        style: `height: 100%; padding: 0 4px; box-sizing: border-box;`,
      };
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.dataGrid?.instance;
          const visibleRows = grid.getVisibleRows();
          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
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

  onTimesheetDetailsUpdated(e: any) {
    const rowIndex = e.component.getRowIndexByKey(e.key);
    // Removed old static max check here since validation callback handles it dynamically
    if (rowIndex !== -1) {
      this.timesheetFormData.TIMESHEET_DETAIL[rowIndex] = {
        STORE_ID: e.data.STORE_ID || e.data.STORE,
        DAYS: e.data.DAYS,
        NORMAL_OT: e.data.NORMAL_OT,
        HOLIDAY_OT: e.data.HOLIDAY_OT,
      };
      setTimeout(() => {
        this.calculateTotalWorkedDays();
      }, 0);
    }
  }

  // 6. Data Processing & Helpers
  // =========================================================================
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

      const totalOTHours = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail: any) => Number(detail.NORMAL_OT) || 0,
      ).reduce((sum: number, val: number) => sum + val, 0);
      this.timesheetFormData.NORMAL_OT = totalOTHours;

      const totalHolidayOT = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail: any) => Number(detail.HOLIDAY_OT) || 0,
      ).reduce((sum: number, val: number) => sum + val, 0);
      this.timesheetFormData.HOLIDAY_OT = totalHolidayOT;

      this.cdr.detectChanges();
    }
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

  formatDateOnly(date: any): string | null {
    if (!date) return null;

    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  formatAmount = (cellInfo: any) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cellInfo.value);
  };

  // 7. Action Methods (Submissions)
  // =========================================================================
  saveTimesheet() {
    if (!this.timesheetFormData.EMP_ID) {
      notify(
        {
          message: 'Please select an employee',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    const selectedMonth = this.timesheetFormData.TS_MONTH;
    const alreadyExists = this.existingTimesheets.some(
      (item) =>
        item.EMP_ID === String(this.selectedEmployeeId) &&
        item.TS_MONTH === selectedMonth,
    );

    if (alreadyExists) {
      notify(
        {
          message: `Timesheet already exists for this employee in ${selectedMonth}.`,
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    this.timesheetFormData.TIMESHEET_DETAIL =
      this.timesheetFormData.TIMESHEET_DETAIL.filter(
        (row: any) =>
          row.STORE_ID && (row.DAYS || row.NORMAL_OT || row.HOLIDAY_OT),
      );

    const storeIds = this.timesheetFormData.TIMESHEET_DETAIL.map(
      (row: any) => row.STORE_ID,
    );

    const duplicates = storeIds.filter(
      (id: any, index: number) => storeIds.indexOf(id) !== index,
    );

    if (duplicates.length > 0) {
      notify(
        {
          message:
            'Duplicate store(s) found in timesheet. Please ensure each store is unique.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

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

      const payload = {
        ...this.timesheetFormData,
        TIMESHEET_DETAIL: enteredRows.map((row: any) => ({
          ...row,
          STORE_ID: Number(row.STORE_ID) || 0,
          DAYS: Number(row.DAYS) || 0,
          NORMAL_OT: Number(row.NORMAL_OT) || 0,
          HOLIDAY_OT: Number(row.HOLIDAY_OT) || 0,
        })),
        WORKED_DAYS: totalworkdays,
        COMPANY_ID: this.selected_Company_id,
      };

      this.dataService.saveTimesheetData(payload).subscribe((response: any) => {
        if (response.flag == '1') {
          notify(
            {
              message: 'Timesheet Saved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.popupClosed.emit();
        } else {
          notify(
            {
              message: response.message || 'Your Data Not saved',
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
  declarations: [TimesheetAddComponent],
  exports: [TimesheetAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetAddModule {}
