import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { TimesheetAddComponent } from '../timesheet-add/timesheet-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-timesheet-edit',
  templateUrl: './timesheet-edit.component.html',
  styleUrls: ['./timesheet-edit.component.scss'],
})
export class TimesheetEditComponent {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() timesheet: any;
  @Input() existingTimesheets: any[] = [];
  salaryHead: any[] = [];
  salaryDataSource: any;
  stores: any;
  timesheetDetails: any;
  employee: any;
  tsMonthDate: Date = new Date();
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
        STORE_ID: 0,
        DAYS: '',
        NORMAL_OT: 0,
        HOLIDAY_OT: 0,
        ID: 0,
        TS_ID: 0,
        STORE_NAME: '',
        STORE: 0,
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
  storeData: any;
  salaryHeadList: { SALARY_HEAD_ID: any; AMOUNT: any }[];
  selected_Company_id: any;
  Departments: any;
  employeeid: any;
  employee_leaveperiopd_Data: any;
  timesheetList: any = [];
  is_approve: boolean = false;
  Stores_List: any = [];
  is_verify = false;
  is_approved = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  @Input() isReadOnlyMode: boolean = false;
  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('VERIFY');
    if (changes['timesheet'] && changes['timesheet'].currentValue) {
      // Deep copy to avoid reference issues
      this.timesheetFormData = {
        ...this.timesheetFormData,
        ...changes['timesheet'].currentValue,
      };
      console.log(
        'TIMESHEET_SALARY from select',
        this.timesheetFormData.TIMESHEET_SALARY,
      );
      const existingSalary = this.timesheetFormData.TIMESHEET_SALARY || [];
      this.getSalaryHead(existingSalary);
      console.log(this.timesheetFormData);
      // this.is_approve = this.timesheetFormData.STATUS === 'Approved';
      // this.is_verify = this.timesheetFormData.STATUS === 'Open';
      this.is_verify = this.isVerifyMode;
      this.is_approved = this.isApproveMode;
      this.is_approve = this.isReadOnlyMode || this.isVerifyMode;
      this.timesheetDetails = (
        this.timesheetFormData.TIMESHEET_DETAIL || []
      ).map((detail) => ({
        ...detail,
        STORE: String(detail.STORE_ID), // Ensure STORE_ID is treated as a string
      }));
      this.stores = this.stores.map((store) => ({
        ...store,
        ID: String(store.ID), // Convert store ID to string for comparison
      }));

      // this.timesheetFormData.EMP_NAME=

      // Ensure storeData is merged after both timesheetDetails and storeData are available
      if (
        this.stores.length > 0 &&
        this.storeData &&
        this.storeData.length > 0
      ) {
        this.timesheetDetails = [
          ...this.timesheetDetails,
          ...this.storeData.filter(
            (storeRow) =>
              !this.timesheetDetails.some((ts) => ts.STORE === storeRow.STORE),
          ),
        ];
      }

      this.Timesheetlistdata();
      this.employeeid = this.timesheetFormData.EMP_ID;
    }
  }

  ngOnInit() {
    this.sesstion_Details();
    this.loadDepartment();
    this.getSalaryHead();
    this.getStoreDropdown();
    this.getEmployeeDropdown();
    this.Timesheetlistdata();
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
  getPayTimeEntries() {
    this.dataService.getDropdownData('PAYTIME_ENTRY').subscribe((data: any) => {
      this.salaryHead = data;
      // Pre-fill the data grid's rows with SALARY_HEAD_ID
      this.salaryHeadList = this.salaryHead.map((item) => ({
        SALARY_HEAD_ID: '',
        AMOUNT: null, // Let user enter this
      }));
      this.salaryDataSource = [
        ...(this.salaryDataSource || []),
        ...this.salaryHeadList,
      ];
    });
  }
  getEmployeeDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'EMPLOYEE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.employee = response;
      console.log(this.employee);
      console.log(this.timesheetList);

      // if (employee_res) {
      //   this.employee = employee_res.filter(
      //     (emp) =>
      //       !this.timesheetList?.some((ts) => Number(ts.EMP_ID) === emp.ID),
      //   );
      // }

      console.log(this.employee, 'empployeeeeeeeeeee');
      this.setEmployeeName(); // <-- MOVE setEmployeeName here
    });
  }

  setEmployeeName() {
    if (this.timesheetFormData.EMP_ID && this.employee?.length) {
      const matchedEmployee = this.employee.find(
        (emp) => emp.ID == this.timesheetFormData.EMP_ID,
      );
      if (matchedEmployee) {
        this.timesheetFormData.EMP_NAME = matchedEmployee.ID; // For value binding
      } else {
        this.timesheetFormData.EMP_NAME = null;
      }
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  loadDepartment() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'DEPARTMENT',
    };

    this.dataService.getDropdownData(payload).subscribe((response) => {
      this.Departments = response;

      // ✅ Only create empty rows if NOT editing
      if (
        !this.timesheetFormData.TIMESHEET_DETAIL ||
        this.timesheetFormData.TIMESHEET_DETAIL.length === 0
      ) {
        this.timesheetDetails = this.Departments.map(() => ({
          DEPT_ID: 0,
          DAYS: 0,
          NORMAL_OT: 0,
          HOLIDAY_OT: 0,
          STORE_ID: 0,
        }));
      }
    });
  }

  getSalaryHead(existingData = []) {
    const payload = {
      NAME: 'PAYTIME_ENTRY',
    };

    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.salaryHead = response.data || response;

      // ===== DEBUG =====
      console.log('existingData', existingData);
      console.log('salaryHead', this.salaryHead);

      this.salaryDataSource = this.salaryHead.map((item: any) => {
        const existing = existingData.find(
          (x: any) => Number(x.SALARY_HEAD_ID) === Number(item.ID),
        );

        console.log(
          'Matching:',
          'SalaryHead ID =',
          item.ID,
          'Matched =',
          existing,
        );

        return {
          SALARY_HEAD_ID: item.ID,
          AMOUNT: existing ? existing.AMOUNT : null,
        };
      });

      console.log('salaryDataSource', this.salaryDataSource);

      this.salaryDataSource = [...this.salaryDataSource];
      setTimeout(() => {
        this.dataGrid?.instance?.refresh();
      });
      console.log('FINAL salaryDataSource', this.salaryDataSource);
    });
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
      !['STORE_ID', 'DEPT_ID', 'DAYS', 'NORMAL_OT', 'HOLIDAY_OT'].includes(
        e.dataField,
      )
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

      // Ensure the newly typed value is committed to the grid cell before moving focus.
      // Use the raw DOM input value for numeric fields because the DevExtreme component's
      // internal value state is stale during the 'keydown' event if default is prevented.
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
          // For lookup columns (STORE_ID, DEPT_ID), the component value is correct
          // and we MUST NOT use the raw input text because it's just the display string.
          e.setValue(args.component.option('value'));
        }
      }

      const grid = this.dataGrid.instance;
      const rowIndex = e.row.rowIndex;

      switch (e.dataField) {
        //================ STORE =================
        case 'STORE_ID':
          if (!args.component.option('opened')) {
            args.component.open();
            return;
          }

          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'DEPT_ID');
            }, 50);
          });

          break;

        //================ DEPARTMENT =================
        case 'DEPT_ID':
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

        //================ WORKED DAYS =================
        case 'DAYS':
          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'NORMAL_OT');
            }, 50);
          });

          break;

        //================ OT HOURS =================
        case 'NORMAL_OT':
          grid.saveEditData().then(() => {
            setTimeout(() => {
              grid.editCell(rowIndex, 'HOLIDAY_OT');
            }, 50);
          });

          break;

        //================ HOLIDAY OT =================
        case 'HOLIDAY_OT':
          grid.saveEditData().then(() => {
            const row = this.timesheetDetails[rowIndex];

            if (!row.STORE_ID || !row.DEPT_ID || !row.DAYS) {
              notify(
                {
                  message: 'Store, Department and Worked Days are mandatory.',
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

  // addNewRow() {
  //   this.timesheetDetails.push({
  //     DEPT_ID: null,
  //     DAYS: 0,
  //     NORMAL_OT: 0,
  //     HOLIDAY_OT: 0,
  //     STORE_ID: 0,
  //   });

  //   // refresh grid if needed
  //   this.timesheetDetails = [...this.timesheetDetails];
  // }

  onTimesheetDetailsUpdated(e: any) {
    // this.calculateTotalWorkedDays()
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

  calculateTotalWorkedDays() {
    if (this.timesheetFormData && this.timesheetFormData.TIMESHEET_DETAIL) {
      const totalDays = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.DAYS) || 0,
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.WORKED_DAYS = totalDays;

      const totalOTHours = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.NORMAL_OT) || 0,
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.NORMAL_OT = totalOTHours;

      const totalHolidayOT = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.HOLIDAY_OT) || 0,
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.HOLIDAY_OT = totalHolidayOT;

      // Manually trigger change detection to update the view
      // this.cdr.detectChanges();
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

    // Clean up empty entries
    this.timesheetFormData.TIMESHEET_SALARY =
      this.timesheetFormData.TIMESHEET_SALARY.filter(
        (item) => item.SALARY_HEAD_ID !== '' && item.AMOUNT !== '',
      );
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
  updateTimesheet() {
    if (
      !this.timesheetFormData.TIMESHEET_SALARY ||
      this.timesheetFormData.TIMESHEET_SALARY.length === 0
    ) {
      this.timesheetFormData.TIMESHEET_SALARY = [
        { SALARY_HEAD_ID: 0, AMOUNT: 0 },
      ];
    } else {
      // Force conversion to number (in case bound as strings in UI)
      this.timesheetFormData.TIMESHEET_SALARY =
        this.timesheetFormData.TIMESHEET_SALARY.map((salary) => ({
          SALARY_HEAD_ID: Number(salary.SALARY_HEAD_ID) || 0,
          AMOUNT: Number(salary.AMOUNT) || 0,
        }));
    }
    const rawDatefrom = this.timesheetFormData.LEAVE_FROM;
    const dateOnlyfrom = rawDatefrom.split(' ')[0];

    console.log(dateOnlyfrom);
    const rawDateTo = this.timesheetFormData.LEAVE_TO;
    const dateOnlyto = rawDateTo.split(' ')[0];

    console.log(dateOnlyto);
    const payload = {
      ...this.timesheetFormData,
      LEAVE_FROM: this.formatDateDDMMYYYY(dateOnlyfrom),
      LEAVE_TO: this.formatDateDDMMYYYY(dateOnlyto),
    };

    const totalworkdays = this.timesheetDetails.reduce(
      (sum, item) => sum + (Number(item.DAYS) || 0),
      0,
    );
    console.log(totalworkdays, '=======totalworkdays===========');

    if (Number(this.timesheetFormData.DAYS) == totalworkdays) {
      let actualEmpName = '';
      let actualEmpCode = '';
      const empIdValue = this.timesheetFormData.EMP_ID || this.employeeid;
      if (this.employee && this.employee.length) {
        const emp = this.employee.find((e: any) => e.ID == empIdValue);
        if (emp) {
          actualEmpName = emp.DESCRIPTION;
          actualEmpCode = emp.EMP_NO || '';
        }
      }

      const formattedDetails = this.timesheetDetails.map((item: any) => ({
        ...item,
        ID: item.ID || 0,
        TS_ID: item.TS_ID || 0,
      }));

      // const payload = {
      //   ...this.timesheetFormData,
      //   TIMESHEET_DETAIL: formattedDetails,
      //   WORKED_DAYS: totalworkdays,
      //   COMPANY_ID: this.selected_Company_id,
      //   EMP_ID: empIdValue,
      //   EMP_CODE: actualEmpCode,
      //   EMP_NAME: actualEmpName,
      // };
      const payload = this.buildTimesheetPayload();
      console.log(this.timesheetList, '=======timesheetList===========');
      console.log(this.employeeid, '=======employeeid===========');

      const isEmployeeExists = this.timesheetList?.some(
        (item) =>
          Number(item.EMP_ID) === Number(this.employeeid) &&
          item.ID !== this.timesheetFormData.ID, // exclude current editing row
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

      const invalidStore = this.timesheetDetails.some(
        (item) => !item.STORE_ID || Number(item.STORE_ID) === 0,
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
      this.dataService.updateTimesheet(payload).subscribe((response: any) => {
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
          message:
            'Total days worked and Timesheet Details worked days toal must be equal',
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
  validateDays = (e: any) => {
    const enteredDays = Number(e.value) || 0;
    const maxDays = Number(this.timesheetFormData.DAYS) || 0;

    return enteredDays <= maxDays;
  };
  // onEditorPreparingTImesheetdetails(e: any) {
  //   if (
  //     e.dataField === 'DEPT_ID' ||
  //     e.dataField === 'DAYS' ||
  //     e.dataField === 'NORMAL_OT' ||
  //     e.dataField === 'HOLIDAY_OT' ||
  //     e.dataField === 'STORE_ID'
  //   ) {
  //     e.editorOptions = e.editorOptions || {};

  //     e.editorOptions.elementAttr = {
  //       style: `
  //       height: 100%;
  //       margin: 0;
  //       padding: 0;
  //       display: flex;
  //       align-items: center;
  //     `,
  //     };

  //     e.editorOptions.inputAttr = {
  //       style: `
  //       height: 100%;
  //       padding: 0 4px;
  //       box-sizing: border-box;
  //     `,
  //     };

  //     if (e.editorName === 'dxNumberBox') {
  //       e.editorOptions.showSpinButtons = false;
  //     }

  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = this.dataGrid?.instance;
  //         const visibleRows = grid.getVisibleRows();

  //         const rowIndex = visibleRows.findIndex(
  //           (r) => r?.data === e.row?.data,
  //         );

  //         setTimeout(() => {
  //           // existing logic untouched
  //         }, 50);
  //       }
  //     };
  //   }
  //   if (e.parentType === 'dataRow') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         this.addNewRow();
  //       }
  //     };
  //   }
  // }
  addNewRow() {
    this.timesheetDetails.push({
      DEPT_ID: null,
      DAYS: null,
      NORMAL_OT: 0,
      STORE_ID: 0,
      HOLIDAY_OT: 0,
    });

    // refresh grid if needed
    this.timesheetDetails = [...this.timesheetDetails];
    console.log(
      this.timesheetDetails,
      '============time sheet details=========',
    );
  }

  formatDateDDMMYYYY(date: any) {
    if (!date) return null;

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  onEmployeeSelected(e: any) {
    this.employeeid = e.value;
    this.Employee_leaveperiod();
    this.timesheetFormData.EMP_NAME = e.value;
    this.timesheetFormData.DAYS = '30';
    const selectedEmployee = this.employee.find(
      (emp) => emp.ID === this.timesheetFormData.EMP_NAME,
    );
    if (selectedEmployee) {
      this.timesheetFormData.EMP_NO = selectedEmployee.EMP_NO; // If you need EMP_NO also
      this.timesheetFormData.EMP_NAME = selectedEmployee.DESCRIPTION;
    }

    // Now check if employee already has a timesheet for the month
    const duplicateTimesheet = this.existingTimesheets.find(
      (ts) =>
        ts.TS_MONTH === this.timesheetFormData.TS_MONTH &&
        ts.EMP_NO == selectedEmployee?.EMP_NO &&
        ts.ID !== this.timesheetFormData.ID, // ignore self while editing
    );

    if (duplicateTimesheet) {
      notify(
        {
          message: `Employee "${selectedEmployee?.DESCRIPTION}" already has a timesheet for ${this.timesheetFormData.TS_MONTH}.`,
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );

      // Optional: Clear the selected employee if duplicate found
      this.timesheetFormData.EMP_ID = null;
      this.timesheetFormData.EMP_NO = null;
      this.timesheetFormData.EMP_NAME = null;
    }
  }

  Employee_leaveperiod() {
    this.dataService.Employee_leave_period().subscribe((res: any) => {
      this.employee_leaveperiopd_Data = res.data[0];
      console.log(
        this.employee_leaveperiopd_Data,
        '=======leve================',
      );
      this.timesheetFormData.LEAVE_FROM =
        this.employee_leaveperiopd_Data.LEAVE_FROM || '';
      this.timesheetFormData.LEAVE_TO =
        this.employee_leaveperiopd_Data.LEAVE_TO || '';
      this.timesheetFormData.DAYS = this.employee_leaveperiopd_Data.TOTAL_DAYS;
    });
  }
  //====================LIST OF TIMESHEET=================

  //
  Timesheetlistdata() {
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
      console.log(this.timesheetList, 'time sheeet list');
    });
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
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [TimesheetEditComponent],
  exports: [TimesheetEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetEditModule {}
