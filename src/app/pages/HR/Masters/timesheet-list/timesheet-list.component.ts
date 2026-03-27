import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
  DxDateRangeBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionAddModule } from '../../../../components/HR/Masters/pay-revision-add/pay-revision-add.component';
import { PayRevisionApproveModule } from '../../../../components/HR/Masters/pay-revision-approve/pay-revision-approve.component';
import { PayRevisionEditModule } from '../../../../components/HR/Masters/pay-revision-edit/pay-revision-edit.component';
import { PayRevisionVerifyModule } from '../../../../components/HR/Masters/pay-revision-verify/pay-revision-verify.component';
import { PayRevisionViewModule } from '../../../../components/HR/Masters/pay-revision-view/pay-revision-view.component';
import { PayRevisionComponent } from '../../../../components/HR/Masters/pay-revision/pay-revision.component';
import { DataService } from 'src/app/services';
import { TimesheetAddModule } from '../../../../components/HR/Masters/timesheet-add/timesheet-add.component';
import { TimesheetEditModule } from '../../../../components/HR/Masters/timesheet-edit/timesheet-edit.component';
import { TimesheetVerifyModule } from '../../../../components/HR/Masters/timesheet-verify/timesheet-verify.component';
import { TimesheetApproveModule } from '../../../../components/HR/Masters/timesheet-approve/timesheet-approve.component';
import notify from 'devextreme/ui/notify';
import {
  TimesheetViewComponent,
  TimesheetViewModule,
} from '../../../../components/HR/Masters/timesheet-view/timesheet-view.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.scss'],
})
export class TimesheetListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  CompanyID: any;
  selectedRowKeys: any[] = [];

  GridSource: any;
  isLoading: boolean = false;
  addTimesheetPopupOpened: boolean = false;
  editTimesheetPopupOpened: boolean = false;
  verifyTimesheetPopupOpened: boolean = false;
  approveTimesheetPopupOpened: boolean = false;
  viewTimesheetPopupOpened: boolean = false;
  selectedTimesheet: any = null;
  timesheetList = [
    {
      employeeNo: 'EMP001',
      employeeName: 'John Doe',
      workedDays: 22,
      otHours: 5,
      status: 'Approved',
    },
    {
      employeeNo: 'EMP002',
      employeeName: 'Jane Smith',
      workedDays: 20,
      otHours: 3,
      status: 'Open',
    },
    {
      employeeNo: 'EMP003',
      employeeName: 'Alice Johnson',
      workedDays: 18,
      otHours: 7,
      status: 'Verified',
    },
  ];
  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      // onClick: (e) => this.onDeleteTimesheet(e),
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },
    // {
    //   hint: 'Verify',
    //   icon: 'check',
    //   text: 'Verify',
    //   onClick: (e) => {
    //     setTimeout(() => this.onVerifyClick(e));
    //   },
    //   visible: (e) =>
    //     e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified',
    // },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => {
        setTimeout(() => this.onApproveClick(e));
      },
      visible: (e) => e.row.data.STATUS === 'Verified',
    },
  ];

  approveButtonOptions: any = {
    text: 'Approve',
    type: 'default',
    stylingMode: 'contained',
    width: 100,
    disabled: false,
    onClick: () => this.ApproveBulkRows(),
  };

  // selectedMonth: string | number | Date = new Date();
  selectedMonth: Date = new Date();
  // selectedRowKeys: any[] = [];
  timesheetData: any;
  timesheet: any;
  selectedMonthForAdd: string;
  calendarVisible = false;
  months = Array.from({ length: 12 }, (_, i) => new Date(2022, i, 1)); // Example for 2022
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  selectedYear: number;
  yearSelectorVisible = false;
  years: number[] = [];
  // CompanyID: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  onExporting(event: any) {
    const fileName = 'Timesheet';
    this.dataService.exportDataGrid(event, fileName);
  }
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => this.addTimesheet());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify"
              data-icon="formkit:add"
              data-width="20"
              data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `;
    },
  };
  // searchButtonOptions = {
  //   icon: 'search',
  //   hint: 'Show / Hide Filters',
  //   stylingMode: 'contained',
  //   elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
  //   onClick: () => this.toggleFilters(),
  // };
  constructor(
    private dataService: DataService,
    private zone: NgZone,
    private router: Router,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log(menuResponse, 'menu response=========');
    this.CompanyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    const today = new Date();
    this.selectedMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Previous month

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.selectedYear = this.selectedMonth.getFullYear();

    this.sesstion_Details();
    this.getTimesheet();
    this.getPayTimeEntries();
    this.generateYears();
    this.fetchTimesheetList();

    //   const payload ={
    //      CompanyId: this.CompanyID,
    //      Month: this.selectedMonth.toLocaleDateString('en-US', {
    //   month: 'long',
    //   year: 'numeric',
    // }).replace(/\s/g, ''), // removes the space → "July2025"
    //   }
    //   this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
    //     this.timesheetList = response.data
    //   });
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];

    for (let i = currentYear - 10; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }
  previousYear() {
    this.selectedYear--;
  }

  nextYear() {
    this.selectedYear++;
  }
  selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

    this.calendarVisible = false;

    // Hide calendar after selection (optional)
  }

  updateMonthLabel() {
    // This is automatically updated with the selectedMonth binding in the template
  }

  onMonthandYearChanged(e: any) {
    if (e.value) {
      const updatedMonth = new Date(e.value);
      this.selectedMonth = new Date(
        updatedMonth.getFullYear(),
        updatedMonth.getMonth() - 1,
        1,
      );
      this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString(
        'en-US',
        { month: 'long', year: 'numeric' },
      );
    }
  }
  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;

    if (this.calendarVisible) {
      setTimeout(() => {
        document.addEventListener('click', this.outsideClickListener);
      });
    } else {
      document.removeEventListener('click', this.outsideClickListener);
    }
  }

  refreshGrid() {
    // if (this.dataGrid?.instance) {
    //   this.dataGrid.instance.refresh(); // Or reload data from API if needed
    // }
    this.fetchTimesheetList();
  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }

  outsideClickListener = (event: any) => {
    const calendarElement = document.querySelector('.calendar-popup');
    const labelElement = document.querySelector('.month-label');

    if (
      calendarElement &&
      !calendarElement.contains(event.target) &&
      labelElement &&
      !labelElement.contains(event.target)
    ) {
      this.calendarVisible = false;
      document.removeEventListener('click', this.outsideClickListener);
    }
  };

  onCalendarClose() {
    this.calendarVisible = false;
  }

  // onMonthChange(event: any): void {
  //   const selectedDate = new Date(event.value); // Safely create a Date object

  //   if (isNaN(selectedDate.getTime())) return; // Check if valid

  //   // Format the selected month to 'Month YYYY' format
  //   const selectedYear = selectedDate.getFullYear();
  //   const selectedMonth = selectedDate.getMonth(); // 0-indexed month

  //   // Pass the formatted value as 'Month YYYY' to the add page
  //   this.selectedMonthForAdd = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  //   // this.fetchTimesheetData(selectedYear, selectedMonth);
  // }
  onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12,
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    this.getTimesheet();
  }

  getTimesheet() {
    const selectedMonthStr = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }); // e.g. "Apr 2025"
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open';
      case 'Pending':
        return 'flag-pending'; // White or gray
      case 'Verified':
        return 'flag-verified'; // Orange
      case 'Approved':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  getPayTimeEntries() {
    this.dataService
      .getDropdownData('PAYTIME_ENTRY')
      .subscribe((res: any) => {});
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();

    //   const payload ={
    //      CompanyId: this.CompanyID,
    //      Month: this.selectedMonth.toLocaleDateString('en-US', {
    //   month: 'long',
    //   year: 'numeric',
    // }).replace(/\s/g, ''), // removes the space → "July2025"
    //   }
    //   this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
    //     this.timesheetList = response.data
    //
    //   });

    this.fetchTimesheetList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();
    //    const payload ={
    //      CompanyId: this.CompanyID,
    //      Month: this.selectedMonth.toLocaleDateString('en-US', {
    //   month: 'long',
    //   year: 'numeric',
    // }).replace(/\s/g, ''), // removes the space → "July2025"
    //   }
    //   this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
    //     this.timesheetList = response.data
    //     //   this.timesheetList,
    //     //   'Filtered Timesheet for',
    //     //   selectedMonthStr
    //     // );
    //   });
    this.fetchTimesheetList();
  }

  onVerifyClick(e: any): void {
    e.cancel = true;
    const timesheetId = e.row?.data?.ID;

    if (!timesheetId) {
      console.warn('No Employee ID found in row data');
      return;
    }

    this.dataService.selectTimesheet(timesheetId).subscribe({
      next: (response: any) => {
        this.selectedTimesheet = response;
        this.verifyTimesheetPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onApproveClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;

    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }

    this.dataService.selectTimesheet(employeeId).subscribe({
      next: (response: any) => {
        this.selectedTimesheet = response;
        this.approveTimesheetPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  addTimesheet() {
    const year = this.selectedMonth.getFullYear();
    const month = ('0' + (this.selectedMonth.getMonth() + 1)).slice(-2);

    this.selectedMonthForAdd = `${year}-${month}`;

    this.addTimesheetPopupOpened = true;
  }

  // addTimesheet() {
  //   const month = this.selectedMonth.toISOString().slice(0, 7);
  //   this.selectedMonthForAdd = month;
  //   this.addTimesheetPopupOpened = true;
  // }

  onEditingStart(e: any) {
    e.cancel = true;
    this.editTimesheetPopupOpened = true;
    const timesheetId = e.data.ID;
    const status = e.data.STATUS;

    this.dataService.selectTimesheet(timesheetId).subscribe((response: any) => {
      this.selectedTimesheet = response;
    });
  }
  onEditOrViewTimesheet(e: any) {
    e.cancel = true;
    const timesheetId = e.data.ID;
    const status = e.data.STATUS;

    this.dataService.selectTimesheet(timesheetId).subscribe({
      next: (response: any) => {
        this.selectedTimesheet = response;
        const actionButton = this.allActionButtons.find(
          (btn) => btn.name === 'edit',
        );
        if (actionButton) {
          actionButton.hint =
            this.selectedTimesheet.STATUS === 'Approved' ? 'View' : 'Edit';
          actionButton.text = actionButton.hint; // optional: update button text as well
        }
        if (status === 'Approved') {
          this.viewTimesheetPopupOpened = true;
        } else {
          this.editTimesheetPopupOpened = true;
        }
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onDeleteTimesheet(e: any) {
    const timesheetIdId = e.data.ID;
    // Optionally prevent the default delete behavior
    e.cancel = true;

    // Call your delete API
    this.dataService.deleteTimesheet(timesheetIdId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Timesheet Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.fetchTimesheetList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }
  isDeleteVisible = (e: any) => {
    return e.row?.data?.STATUS !== 'Approved';
  };

  handleClose() {
    this.addTimesheetPopupOpened = false; // closes the popup
    this.editTimesheetPopupOpened = false;
    this.verifyTimesheetPopupOpened = false;
    this.approveTimesheetPopupOpened = false;
    this.getTimesheet();
    this.fetchTimesheetList();
  }

  // onSelectionChanged(e: any) {
  //   this.selectedRowKeys = e.selectedRowKeys;
  // }

  onSelectionChanged(e: any) {
    const filteredRows = e.selectedRowsData.filter((row: any) => {
      return row.STATUS !== 'Approved';
    });

    // If you need keys
    this.selectedRowKeys = filteredRows.map((row: any) => row.ID);

    console.log(this.selectedRowKeys);
  }
  onCellPrepared(e: any) {
    if (
      e.rowType === 'data' &&
      e.column.command === 'select' &&
      e.data.STATUS === 'Approved'
    ) {
      // Disable checkbox
      e.cellElement.classList.add('dx-state-disabled');

      // Prevent clicking
      e.cellElement.style.pointerEvents = 'none';
    }
  }
  // ApproveBulkRows(){
  //   const payload = {
  //     // IDs: this.selectedRowKeys,
  //      IDs: this.selectedRowKeys[0]
  //   }
  //   this.dataService.Timesheet_Approval_Api(payload).subscribe((response: any) => {
  //     this.timesheetList = response.data
  //     this.selectedRowKeys = []; // clear selection after success

  //
  //   });

  // }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
  }

  fetchTimesheetList() {
    const payload = {
      COMPANY_ID: this.CompanyID,
      MONTH: this.selectedMonth
        .toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(/\s/g, ''),
    };

    this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
      this.timesheetList = response.data;
      console.log(this.timesheetList, 'time sheeet list');
      this.updateApproveButtonState();
    });
  }

  updateApproveButtonState() {
    if (!this.timesheetList || this.timesheetList.length === 0) {
      this.setApproveDisabled(true);
      return;
    }

    const allApproved = this.timesheetList.every(
      (row: any) => row.STATUS === 'Approved',
    );

    this.setApproveDisabled(allApproved);
  }

  setApproveDisabled(state: boolean) {
    this.approveButtonOptions = {
      ...this.approveButtonOptions,
      disabled: state,
    };
  }

  ApproveBulkRows() {
    //  Check if nothing selected
    console.log(this.selectedRowKeys);
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) {
      notify(
        {
          message: 'Please select at least one row',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return; // stop execution
    }
    const payload = {
      IDs: this.selectedRowKeys,
    };

    this.dataService
      .Timesheet_Approval_Api(payload)
      .subscribe((response: any) => {
        // this.timesheetList = response;
        this.selectedRowKeys = []; // Clear selection after success
        notify(
          {
            message: `Approved Successfully`,
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.fetchTimesheetList();
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
    PayRevisionEditModule,
    PayRevisionAddModule,
    PayRevisionVerifyModule,
    PayRevisionApproveModule,
    PayRevisionViewModule,
    DxDateBoxModule,
    DxDateRangeBoxModule,
    TimesheetAddModule,
    TimesheetEditModule,
    TimesheetVerifyModule,
    TimesheetApproveModule,
    TimesheetViewModule,
  ],
  providers: [],
  declarations: [TimesheetListComponent],
  exports: [TimesheetListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetListModule {}
