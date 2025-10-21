import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { TimesheetVerifyComponent } from '../timesheet-verify/timesheet-verify.component';

@Component({
  selector: 'app-timesheet-view',
  templateUrl: './timesheet-view.component.html',
  styleUrls: ['./timesheet-view.component.scss']
})
export class TimesheetViewComponent {
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
    this.getPayTimeEntries();
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
  declarations: [TimesheetViewComponent],
  exports: [TimesheetViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetViewModule {}