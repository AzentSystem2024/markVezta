import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
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
import { PayRevisionAddComponent } from '../pay-revision-add/pay-revision-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet-add',
  templateUrl: './timesheet-add.component.html',
  styleUrls: ['./timesheet-add.component.scss'],
})
export class TimesheetAddComponent {
  @ViewChild('dataGrid') dataGrid: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() selectedMonth: string;
  @Input() existingTimesheets: any[] = [];
  employee: any = [];
  // selectedMonth: any;
  tsMonthDate: Date = new Date();
  timesheetList: any = [];
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
        STORE_ID: '',
        DAYS: '',
        NORMAL_OT: '',
        HOLIDAY_OT: '',
      },
    ],
    TIMESHEET_SALARY: [
      {
        SALARY_HEAD_ID: '',
        AMOUNT: '',
      },
    ],
  };

  salaryHead: any[] = [];
  salaryDataSource: any[] = [];
  Departments: any = [];
  timesheetDetails: any[];
  selectedEmployeeId: any;
  selected_Company_id: any;
  companyID: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  Stores_List: any;
  employee_leaveperiopd_Data: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
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

    this.sesstion_Details();
    this.fetchTimesheetList();

    this.getEmployeeDropdown();
    this.getStoreDropdown();
    this.loadDepartment();
    this.getPayTimeEntries();
    // this.tsMonthDate = new Date(this.timesheetFormData.TS_MONTH + '-01');
    // Ensure the format of the selectedMonth is "Apr 2025"
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
  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,

      NAME: 'STORE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Stores_List = response;
    });
  }

  formatAmount = (cellInfo: any) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cellInfo.value);
  };

  getPayTimeEntries() {
    const payload = {
      NAME: 'PAYTIME_ENTRY',
    };
    this.dataService.getDropdownData(payload).subscribe((data: any) => {
      this.salaryHead = data;
      this.salaryDataSource = this.salaryHead.map((item) => ({
        SALARY_HEAD_ID: item.ID,
        AMOUNT: null, // Let user enter this
      }));
    });
  }

  getSalaryHead() {
    this.dataService.getDropdownData('SALARY_HEAD').subscribe((data) => {
      this.salaryHead = data;

      // Pre-fill the data grid's rows with SALARY_HEAD_ID
      this.salaryDataSource = this.salaryHead.map((item) => ({
        SALARY_HEAD_ID: item.ID,
        AMOUNT: null, // Let user enter this
      }));
    });
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'STORE' ||
      e.dataField === 'DAYS' ||
      e.dataField === 'NORMAL_OT' ||
      e.dataField === 'HOLIDAY_OT' ||
      e.dataField === 'SALARY_HEAD_ID' ||
      e.dataField === 'AMOUNT' ||
      e.dataField === 'AMOUNT'
    ) {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
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
    if (e.parentType === 'dataRow') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          this.addNewRow();
        }
      };
    }
  }
  addNewRow() {
    this.timesheetDetails.push({
      DEPT_ID: null,
      DAYS: 0,
      NORMAL_OT: 0,
      HOLIDAY_OT: 0,
      STORE_ID: 0,
    });

    // refresh grid if needed
    this.timesheetDetails = [...this.timesheetDetails];
  }
  onTimesheetDetailsUpdated(e: any) {
    const updatedStore = e.data.STORE;
    const rowIndex = e.component.getRowIndexByKey(e.key);
    if (e.data.NORMAL_OT > 12 || e.data.HOLIDAY_OT > 12) {
      notify(
        {
          message: 'OT Hours cannot exceed 12.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }
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

    // Clean up empty entries
    this.timesheetFormData.TIMESHEET_SALARY =
      this.timesheetFormData.TIMESHEET_SALARY.filter(
        (item) => item.SALARY_HEAD_ID !== '' && item.AMOUNT !== '',
      );
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  loadDepartment() {
    const payload = {
      NAME: 'DEPARTMENT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDropdownData(payload).subscribe((response) => {
      // Filter out "CENTRAL STORE" and populate the Departments array
      this.Departments = response;
      this.timesheetDetails = [
        {
          DEPT_ID: null,
          DAYS: 0,
          NORMAL_OT: 0,
          HOLIDAY_OT: 0,
          STORE_ID: 0,
        },
      ];
    });
  }

  calculateTotalWorkedDays() {
    if (this.timesheetFormData && this.timesheetFormData.TIMESHEET_DETAIL) {
      const totalDays = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.DAYS) || 0,
      ).reduce((sum, val) => sum + val, 0);
      // this.timesheetFormData.WORKED_DAYS = totalDays;

      const totalOTHours = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.NORMAL_OT) || 0,
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.NORMAL_OT = totalOTHours;

      const totalHolidayOT = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.HOLIDAY_OT) || 0,
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.HOLIDAY_OT = totalHolidayOT;

      // Manually trigger change detection to update the view
      this.cdr.detectChanges();
    }
  }

  onMonthChanged(event: any) {
    this.tsMonthDate = new Date(event.value);
    const year = this.tsMonthDate.getFullYear();
    const month = String(this.tsMonthDate.getMonth() + 1).padStart(2, '0');
    this.timesheetFormData.TS_MONTH = `${year}-${month}`;
  }

  getEmployeeDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'EMPLOYEE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      const employee_res = response;
      if (employee_res) {
        this.employee = employee_res.filter(
          (emp) =>
            !this.timesheetList?.some((ts) => Number(ts.EMP_ID) === emp.ID),
        );
      }
    });
  }

  onEmployeeSelected(e: any) {
    this.selectedEmployeeId = e.value;
    this.Employee_leaveperiod();
    const selectedEmployee = this.employee.find(
      (emp) => emp.ID === this.selectedEmployeeId,
    );
    if (selectedEmployee) {
      this.timesheetFormData.EMP_NO = selectedEmployee.EMP_NO; // If you need EMP_NO also
      this.timesheetFormData.EMP_NAME = selectedEmployee.DESCRIPTION;
    }

    // Now check if employee already has a timesheet for the month
    const duplicateTimesheet = this.existingTimesheets.find(
      (ts) =>
        ts.TS_MONTH === this.timesheetFormData.TS_MONTH &&
        ts.EMP_NO === selectedEmployee?.EMP_NO &&
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
      this.timesheetFormData.EMP_NAME = '';
    }
  }
  onOTValueChanged(e: any) {
    if (e.value > 12) {
      // If the value exceeds 12, reset it to 12
      e.component.option('value', 12);

      // Show a notification (optional)
      notify(
        {
          message: 'OT Hours cannot exceed 12.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
    }
  }

  formatDateOnly(date: any): string | null {
    if (!date) return null;

    const d = new Date(date);

    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  }

  saveTimesheet() {
    if (
      this.timesheetFormData.EMP_ID === '' ||
      !this.timesheetFormData.EMP_ID
    ) {
      notify(
        {
          message: 'Please select an employee',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return; // stops the save function
    }

    const selectedMonth = this.timesheetFormData.TS_MONTH;
    const alreadyExists = this.existingTimesheets.some(
      (item) =>
        item.EMP_ID === String(this.selectedEmployeeId) &&
        item.TS_MONTH === selectedMonth,
      //    &&
      // item.STATUS !== 'Approved'
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
        (row) => row.DEPT_ID && (row.DAYS || row.NORMAL_OT || row.HOLIDAY_OT),
      );
    const storeIds = this.timesheetFormData.TIMESHEET_DETAIL.map(
      (row) => row.DEPT_ID,
    );
    const duplicates = storeIds.filter(
      (id, index) => storeIds.indexOf(id) !== index,
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
    // Ensure TIMESHEET_SALARY has at least one valid object with numbers
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

    const totalworkdays = this.timesheetDetails.reduce(
      (sum, item) => sum + (Number(item.DAYS) || 0),
      0,
    );
    if (Number(this.timesheetFormData.DAYS) == totalworkdays) {
      const payload = {
        ...this.timesheetFormData,
        TIMESHEET_DETAIL: this.timesheetDetails,
        WORKED_DAYS: totalworkdays,
        COMPANY_ID: this.selected_Company_id,
      };

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

      this.dataService.saveTimesheetData(payload).subscribe((response: any) => {
        if ((response.flag = '1')) {
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
          message:
            'Total days worked and Timesheet Details worked days toal must be equal',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
    }
  }

  validateDays = (e: any) => {
    const enteredDays = Number(e.value) || 0;
    const maxDays = Number(this.timesheetFormData.DAYS) || 0;

    return enteredDays <= maxDays;
  };

  handleClose() {
    this.popupClosed.emit();
  }
  validTime = (e: any) => {
    const value = Number(e.value) || 0;
    return value <= 12;
  };
  //====================LIST OF TIMESHEET=================

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
  //============employee--leave-period========
  Employee_leaveperiod() {
    this.dataService.Employee_leave_period().subscribe((res: any) => {
      this.employee_leaveperiopd_Data = res.data[0];
      this.timesheetFormData.LEAVE_FROM =
        this.employee_leaveperiopd_Data.LEAVE_FROM || '';
      this.timesheetFormData.LEAVE_TO =
        this.employee_leaveperiopd_Data.LEAVE_TO || '';
      this.timesheetFormData.DAYS = this.employee_leaveperiopd_Data.TOTAL_DAYS;
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
  declarations: [TimesheetAddComponent],
  exports: [TimesheetAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetAddModule { }
