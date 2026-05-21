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
  timesheetList: any[] = [];
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
  VerifyButtonOptions: any = {
    text: 'Verify',
    type: 'default',
    stylingMode: 'contained',
    width: 100,
    disabled: false,
    onClick: () => this.VerifyBulkRows(),
  };

  // selectedMonth: string | number | Date = new Date();
  selectedMonth: Date = new Date();
  // selectedRowKeys: any[] = [];
  timesheetData: any;
  timesheet: any;
  selectedMonthForAdd: any;
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
  canAdd: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canPrint: boolean = false;
  canView: boolean = false;
  canApprove: boolean = false;

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
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // global style
    onClick: () => this.toggleFilters(),
  };
  popupTitle: any;
  isViewMode: boolean = false;
  selectedStatus: any;
  canVerify: boolean = false;
  SessioncanApprove: boolean = false;
  SessioncanVerify: boolean = false;
  PopupTitle: string;
  constructor(
    private dataService: DataService,
    private zone: NgZone,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.CompanyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.SessioncanApprove = packingRights.CanApprove;

      this.SessioncanVerify = packingRights.CanVerify;

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
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onExporting(event: any) {
    const fileName = 'Timesheet';
    this.dataService.exportDataGrid(event, fileName);
  }

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
        return 'flag-orange';
      case 'Verified':
        return 'flag-verified'; // blue
      case 'Approved':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  getPayTimeEntries() {
    this.dataService
      .getDropdownData('PAYTIME_ENTRY')
      .subscribe((res: any) => { });
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();

    this.fetchTimesheetList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();
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

  onEditingStart(e: any) {
    e.cancel = true;
    console.log(e, '============mingcute:certificate-fill=====================')

    this.editTimesheetPopupOpened = true;

    // this.editTimesheetPopupOpened = true;
    const timesheetId = e.data.ID;
    const status = e.data.STATUS;

    this.dataService.selectTimesheet(timesheetId).subscribe((response: any) => {
      this.selectedTimesheet = response;
    });
  }
  onEditingStartVerify(e: any) {
    console.log("call this function")
    e.cancel = true;

    if (e.row?.data?.STATUS == 'Approved') {
      this.PopupTitle = 'View Timesheet'
      this.viewTimesheetPopupOpened = true;
    } else {
      this.editTimesheetPopupOpened = true;
      this.PopupTitle = 'Edit Timesheet'

    }
    // this.editTimesheetPopupOpened = true;
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

  //   const selectedRows = e.selectedRowsData;

  //   if (!selectedRows || selectedRows.length === 0) {
  //     this.canApprove = false;
  //     this.canVerify = false;
  //     this.selectedRowKeys = [];
  //     return;
  //   }

  //   // Take first selected row status
  //   const firstStatus = selectedRows[0].STATUS;

  //   // Allow only same status rows
  //   const validRows = selectedRows.filter(
  //     (row: any) => row.STATUS === firstStatus
  //   );

  //   // If mixed status selected, remove invalid selections
  //   if (validRows.length !== selectedRows.length) {

  //     this.selectedRowKeys = validRows.map(
  //       (row: any) => row.ID
  //     );

  //     this.dataGrid.instance.selectRows(
  //       this.selectedRowKeys,
  //       false
  //     );
  //   }

  //   // Button visibility
  //   if (firstStatus === 'Verified') {

  //     this.canApprove = true;
  //     this.canVerify = false;

  //   } else if (firstStatus === 'Open') {

  //     this.canApprove = false;
  //     this.canVerify = true;

  //   } else {

  //     this.canApprove = false;
  //     this.canVerify = false;
  //   }

  //   this.selectedRowKeys = validRows.map(
  //     (row: any) => row.ID
  //   );
  // }

  onSelectionChanged(e: any) {

    const selectedRows = e.selectedRowsData;

    if (!selectedRows || selectedRows.length === 0) {
      this.canApprove = false;
      this.canVerify = false;
      this.selectedRowKeys = [];
      return;
    }

    // First selected row status
    const firstStatus = selectedRows[0].STATUS;

    // Allow only same status rows
    const validRows = selectedRows.filter(
      (row: any) => row.STATUS === firstStatus
    );

    // Remove mixed status selection
    if (validRows.length !== selectedRows.length) {

      this.selectedRowKeys = validRows.map(
        (row: any) => row.ID
      );

      this.dataGrid.instance.selectRows(
        this.selectedRowKeys,
        false
      );
    }

    // Reset buttons
    this.canApprove = false;
    this.canVerify = false;

    // Open -> Verify button only if session verify permission exists
    if (
      firstStatus === 'Open' &&
      this.SessioncanVerify
    ) {

      this.canVerify = true;
    }

    // Verified -> Approve button only if session approve permission exists
    if (
      firstStatus === 'Verified' &&
      this.SessioncanApprove
    ) {

      this.canApprove = true;
    }

    this.selectedRowKeys = validRows.map(
      (row: any) => row.ID
    );
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
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verified'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approved' ? 'Approved' : status === 'Verified' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }
  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
    {
      text: 'Verified',
      value: 'Verified',
    },
  ];

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
  }

  fetchTimesheetList() {
    this.timesheetList = [];
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
  VerifyBulkRows() {
    //  Check if nothing selected
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
      .verifyTimesheet(payload)
      .subscribe((response: any) => {
        // this.timesheetList = response;
        this.selectedRowKeys = []; // Clear selection after success
        notify(
          {
            message: `Verified Successfully`,
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.fetchTimesheetList();
      });
  }
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
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
export class TimesheetListModule { }
