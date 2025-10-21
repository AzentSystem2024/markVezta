import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { TimesheetEditComponent } from '../timesheet-edit/timesheet-edit.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-timesheet-verify',
  templateUrl: './timesheet-verify.component.html',
  styleUrls: ['./timesheet-verify.component.scss'],
})
export class TimesheetVerifyComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() timesheet: any;
  salaryHead: any[] = [];
  salaryDataSource: any;
  stores: any;
  timesheetDetails: any;
  employee: any;
  tsMonthDate: Date = new Date();
  timesheetFormData: any = {
    TS_MONTH: '',
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
  storeData: any;
  salaryHeadList: { SALARY_HEAD_ID: any; AMOUNT: any }[];

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timesheet'] && changes['timesheet'].currentValue) {
      console.log('Received timesheet:', changes['timesheet'].currentValue);

      // Deep copy to avoid reference issues
      this.timesheetFormData = {
        ...this.timesheetFormData,
        ...changes['timesheet'].currentValue,
      };
      console.log(this.timesheetFormData, 'TIMESHEETFORMDATA');
      this.salaryDataSource = this.timesheetFormData.TIMESHEET_SALARY;
      console.log(this.salaryDataSource, 'SALARYDATASOURCE');
      // this.getSalaryHead();
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
              !this.timesheetDetails.some((ts) => ts.STORE === storeRow.STORE)
          ),
        ];
      }
    }
  }

  ngOnInit() {
    this.loadStores();
    // this.getSalaryHead();
    this.getPayTimeEntries()
    this.getEmployeeDropdown();
  }

  getEmployeeDropdown() {
    this.dataService
      .getDropdownData('EMPLOYEE_REVISION')
      .subscribe((response: any) => {
        this.employee = response;
        console.log(response, 'EMPLOYEEEEE');
        this.setEmployeeName(); // <-- MOVE setEmployeeName here
      });
  }
  
  getPayTimeEntries(){
    this.dataService.getDropdownData('PAYTIME_ENTRY').subscribe((data: any) => {
      console.log(data, "PAYTIME")
      this.salaryHead = data;
      console.log(this.salaryHead, 'SALARYHEADDDDDDDDDDD');
      // Pre-fill the data grid's rows with SALARY_HEAD_ID
      this.salaryHeadList = this.salaryHead.map((item) => ({
        SALARY_HEAD_ID: '',
        AMOUNT: null, // Let user enter this
      }));
      this.salaryDataSource = [
        ...(this.salaryDataSource || []),
        ...this.salaryHeadList,
      ];

      console.log(
        this.salaryDataSource,
        ' Final salaryDataSource after adding salaryHeadList'
      );

      console.log(this.salaryHeadList, 'Salary DataSource');
    });
  }

  setEmployeeName() {
    if (this.timesheetFormData.EMP_ID && this.employee?.length) {
      const matchedEmployee = this.employee.find(
        (emp) => emp.ID == this.timesheetFormData.EMP_ID
      );
      if (matchedEmployee) {
        this.timesheetFormData.EMP_NAME = matchedEmployee.ID; // For value binding
      } else {
        this.timesheetFormData.EMP_NAME = null;
      }
    }
  }

  loadStores() {
    this.dataService.getStoresData().subscribe((response) => {
      // Filter out "CENTRAL STORE" and populate the stores array
      this.stores = response.filter(
        (store: any) => store.STORE_NAME !== 'CENTRAL STORE'
      );
      this.storeData = this.stores.map((store) => ({
        STORE: '', // Store ID to be shown in the grid
        STORE_NAME: '', // Store name for display
        DAYS: null, // Placeholder for user input
        NORMAL_OT: null, // Placeholder for user input
        HOLIDAY_OT: null, // Placeholder for user input
      }));
      this.timesheetDetails = [
        ...this.timesheetDetails,
        ...this.storeData.filter(
          (storeRow) =>
            !this.timesheetDetails.some((ts) => ts.STORE === storeRow.STORE)
        ),
      ];
    });
  }



  onMonthChanged(event: any) {
    this.tsMonthDate = new Date(event.value);
    const year = this.tsMonthDate.getFullYear();
    const month = String(this.tsMonthDate.getMonth() + 1).padStart(2, '0');
    this.timesheetFormData.TS_MONTH = `${year}-${month}`;
  }

  onTimesheetDetailsUpdated(e: any) {
    console.log('Row updated!', e);
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
      console.log(
        'Updated TIMESHEET_DETAIL:',
        this.timesheetFormData.TIMESHEET_DETAIL
      );
    }
  }

  calculateTotalWorkedDays() {
    if (this.timesheetFormData && this.timesheetFormData.TIMESHEET_DETAIL) {
      const totalDays = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.DAYS) || 0
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.WORKED_DAYS = totalDays;

      const totalOTHours = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.NORMAL_OT) || 0
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.NORMAL_OT = totalOTHours;

      const totalHolidayOT = this.timesheetFormData.TIMESHEET_DETAIL.map(
        (detail) => Number(detail.HOLIDAY_OT) || 0
      ).reduce((sum, val) => sum + val, 0);
      this.timesheetFormData.HOLIDAY_OT = totalHolidayOT;

      // Manually trigger change detection to update the view
      // this.cdr.detectChanges();
    }
  }

  onSalaryHeadUpdated(e: any) {
    const updatedRow = e.data;

    const index = this.timesheetFormData.TIMESHEET_SALARY.findIndex(
      (item: any) => item.SALARY_HEAD_ID === updatedRow.SALARY_HEAD_ID
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
        (item) => item.SALARY_HEAD_ID !== '' && item.AMOUNT !== ''
      );

    console.log(
      'Updated TIMESHEET_SALARY:',
      this.timesheetFormData.TIMESHEET_SALARY
    );
  }

  updateTimesheet() {
    // this.timesheetFormData.TIMESHEET_DETAIL =
    //   this.timesheetFormData.TIMESHEET_DETAIL.filter(
    //     (row) => row.STORE_ID && (row.DAYS || row.NORMAL_OT || row.HOLIDAY_OT)
    //   );
    //   const storeIds = this.timesheetFormData.TIMESHEET_DETAIL.map(row => row.STORE_ID);
    //   const duplicates = storeIds.filter((id, index) => storeIds.indexOf(id) !== index);
    
    //   if (duplicates.length > 0) {
    //     notify({
    //       message: 'Duplicate store(s) found in timesheet. Please ensure each store is unique.',
    //       position: { at: 'top center', my: 'top center' },
    //     },
    //     'error')
    //     return;
    //   }

      this.timesheetFormData.TIMESHEET_DETAIL = this.timesheetFormData.TIMESHEET_DETAIL.filter(
    (row) =>
      row.STORE_ID &&
      (row.DAYS || row.NORMAL_OT || row.HOLIDAY_OT)
  );

  // Normalize STORE_IDs to strings and trim whitespace
  const storeIds = this.timesheetFormData.TIMESHEET_DETAIL.map(row =>
    String(row.STORE_ID).trim()
  );

  // Check for duplicates
  const seen = new Set();
  const duplicates = storeIds.filter(id => {
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });

  if (duplicates.length > 0) {
    notify(
      {
        message: 'Duplicate store(s) found in timesheet. Please ensure each store is unique.',
        position: { at: 'top center', my: 'top center' },
      },
      'error'
    );
    return;
  }


      if (
  !this.timesheetFormData.TIMESHEET_SALARY ||
  this.timesheetFormData.TIMESHEET_SALARY.length === 0
) {
  this.timesheetFormData.TIMESHEET_SALARY = [{ SALARY_HEAD_ID: 0, AMOUNT: 0 }];
} else {
  // Force conversion to number (in case bound as strings in UI)
  this.timesheetFormData.TIMESHEET_SALARY = this.timesheetFormData.TIMESHEET_SALARY.map(salary => ({
    SALARY_HEAD_ID: Number(salary.SALARY_HEAD_ID) || 0,
    AMOUNT: Number(salary.AMOUNT) || 0
  }));
}
    this.dataService
      .verifyTimesheet(this.timesheetFormData)
      .subscribe((response: any) => {
        if (response) {
          notify(
            {
              message: 'Timesheet Verified Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.popupClosed.emit();
        } else {
          notify(
            {
              message: 'Your Data Not updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
  }

  handleClose() {
    // console.log('CLOSED');

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
  declarations: [TimesheetVerifyComponent],
  exports: [TimesheetVerifyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetVerifyModule {}
