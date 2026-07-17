import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

// Custom Modules & Components
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionAddModule } from '../../../../components/HR/Masters/pay-revision-add/pay-revision-add.component';
import { PayRevisionApproveModule } from '../../../../components/HR/Masters/pay-revision-approve/pay-revision-approve.component';
import { PayRevisionEditModule } from '../../../../components/HR/Masters/pay-revision-edit/pay-revision-edit.component';
import { PayRevisionVerifyModule } from '../../../../components/HR/Masters/pay-revision-verify/pay-revision-verify.component';
import { PayRevisionViewModule } from '../../../../components/HR/Masters/pay-revision-view/pay-revision-view.component';
import { TimesheetAddModule } from '../../../../components/HR/Masters/timesheet-add/timesheet-add.component';
import { TimesheetEditModule } from '../../../../components/HR/Masters/timesheet-edit/timesheet-edit.component';
import { TimesheetVerifyModule } from '../../../../components/HR/Masters/timesheet-verify/timesheet-verify.component';
import { TimesheetApproveModule } from '../../../../components/HR/Masters/timesheet-approve/timesheet-approve.component';
import { TimesheetViewModule } from '../../../../components/HR/Masters/timesheet-view/timesheet-view.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-timesheet-list',
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.scss'],
})
export class TimesheetListComponent {
  // VIEW CHILD & UI COMPONENTS
  // ==========================================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  // STATE FLAGS & CONFIGURATIONS
  // ==========================================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  showFilterRow = true;
  isFilterOpened = false;
  isFilterRowVisible = false;

  addTimesheetPopupOpened = false;
  editTimesheetPopupOpened = false;
  verifyTimesheetPopupOpened = false;
  approveTimesheetPopupOpened = false;
  viewTimesheetPopupOpened = false;
  calendarVisible = false;
  yearSelectorVisible = false;

  CompanyID: any;
  selectedRowKeys: any[] = [];
  selectedTimesheet: any = null;
  timesheetList: any[] = [];
  PopupTitle: string = '';

  // Month / Year Selection
  selectedMonth: Date = new Date();
  selectedMonthForAdd: any;
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  months = Array.from({ length: 12 }, (_, i) => new Date(2022, i, 1));
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

  // PERMISSIONS
  // ==========================================
  canAdd = false;
  canEdit = false;
  canDelete = false;
  canPrint = false;
  canView = false;
  canVerify = false;
  canApprove = false;
  SessioncanApprove = false;
  SessioncanVerify = false;

  // GRID CONFIGURATION
  // ==========================================
  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
      visible: (e: any) => e.row.data.STATUS !== 'Approved',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      visible: (e: any) => e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => {
        setTimeout(() => this.onApproveClick(e));
      },
      visible: (e: any) => e.row.data.STATUS === 'Verified',
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
        <span class="iconify" data-icon="formkit:add" data-width="20" data-height="20"></span>
        <span class="add-text">New</span>
      </div>`;
    },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  getStatusFilterData = [
    { text: 'Approved', value: 'Approved' },
    { text: 'Open', value: 'Open' },
    { text: 'Verified', value: 'Verified' },
  ];

  // CONSTRUCTOR
  // ==========================================
  constructor(
    private dataService: DataService,
    private zone: NgZone,
    private router: Router,
  ) {}

  // LIFECYCLE HOOKS
  // ==========================================
  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    if (menuResponse && menuResponse.SELECTED_COMPANY) {
      this.CompanyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    }

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

  // UI & GRID UTILS
  // ==========================================
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onExporting(event: any) {
    const fileName = 'Timesheet';
    this.dataService.exportDataGrid(event, fileName);
  }

  refreshGrid() {
    this.fetchTimesheetList();
  }

  statusCellRender = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.data.STATUS;
    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981'
        : status === 'Verified'
          ? '#0073D8'
          : '#FFA500';

    icon.title =
      status === 'Approved'
        ? 'Approved'
        : status === 'Verified'
          ? 'Verified'
          : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';
    cellElement.appendChild(icon);
  };

  onCellPrepared(e: any) {
    if (
      e.rowType === 'data' &&
      e.column.command === 'select' &&
      e.data.STATUS === 'Approved'
    ) {
      e.cellElement.classList.add('dx-state-disabled');
      e.cellElement.style.pointerEvents = 'none';
    }
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

  // CALENDAR & DATE SELECTION
  // ==========================================
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
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12);
    this.onMonthChange({ value: this.selectedMonth });
    this.calendarVisible = false;
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
      setTimeout(() =>
        document.addEventListener('click', this.outsideClickListener),
      );
    } else {
      document.removeEventListener('click', this.outsideClickListener);
    }
  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation();
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

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();
    this.fetchTimesheetList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.getTimesheet();
    this.fetchTimesheetList();
  }

  updateMonthLabel() {}

  // DATA FETCHING
  // ==========================================
  sesstion_Details() {
    // Keep method as placeholder since original had it
  }

  getTimesheet() {
    // Keep placeholder from original
    const selectedMonthStr = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  getPayTimeEntries() {
    this.dataService
      .getDropdownData('PAYTIME_ENTRY')
      .subscribe((res: any) => {});
  }

  fetchTimesheetList() {
    const payload = {
      COMPANY_ID: this.CompanyID,
      MONTH: this.selectedMonth
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        .replace(/\s/g, ''),
    };

    this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
      this.timesheetList = response.data;
      this.updateApproveButtonState();
    });
  }

  // ROW SELECTION & BULK ACTIONS
  // ==========================================
  onSelectionChanged(e: any) {
    const selectedRows = e.selectedRowsData;

    if (!selectedRows || selectedRows.length === 0) {
      this.canApprove = false;
      this.canVerify = false;
      this.selectedRowKeys = [];
      return;
    }

    const firstStatus = selectedRows[0].STATUS;
    const validRows = selectedRows.filter(
      (row: any) => row.STATUS === firstStatus,
    );

    if (validRows.length !== selectedRows.length) {
      this.selectedRowKeys = validRows.map((row: any) => row.ID);
      this.dataGrid.instance.selectRows(this.selectedRowKeys, false);
    }

    this.canApprove = false;
    this.canVerify = false;

    if (firstStatus === 'Open' && this.SessioncanVerify) {
      this.canVerify = true;
    }
    if (firstStatus === 'Verified' && this.SessioncanApprove) {
      this.canApprove = true;
    }

    this.selectedRowKeys = validRows.map((row: any) => row.ID);
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
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) {
      notify(
        {
          message: 'Please select at least one row',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return;
    }
    const payload = { IDs: this.selectedRowKeys };
    this.dataService.Timesheet_Approval_Api(payload).subscribe(() => {
      this.selectedRowKeys = [];
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
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) {
      notify(
        {
          message: 'Please select at least one row',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return;
    }
    const payload = { IDs: this.selectedRowKeys };
    this.dataService.verifyTimesheet(payload).subscribe(() => {
      this.selectedRowKeys = [];
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

  // POPUP OPENERS & ROW ACTIONS
  // ==========================================
  addTimesheet() {
    const year = this.selectedMonth.getFullYear();
    const month = ('0' + (this.selectedMonth.getMonth() + 1)).slice(-2);
    this.selectedMonthForAdd = `${year}-${month}`;
    this.addTimesheetPopupOpened = true;
  }

  onEditingStart(e: any) {
    e.cancel = true;
    const timesheetId = e.data.ID;
    this.dataService.selectTimesheet(timesheetId).subscribe((response: any) => {
      this.selectedTimesheet = response;
      this.verifyTimesheetPopupOpened = false;
      this.approveTimesheetPopupOpened = false;
      this.viewTimesheetPopupOpened = false;
      this.editTimesheetPopupOpened = true;
    });
  }

  onEditingStartVerify(e: any) {
    e.cancel = true;
    const timesheetId = e.data.ID;
    this.PopupTitle =
      e.row?.data?.STATUS == 'Approved' ? 'View Timesheet' : 'Edit Timesheet';

    if (e.row?.data?.STATUS == 'Approved') {
      this.viewTimesheetPopupOpened = true;
    } else {
      this.editTimesheetPopupOpened = true;
    }

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
          actionButton.hint = status === 'Approved' ? 'View' : 'Edit';
          actionButton.text = actionButton.hint;
        }
        if (status === 'Approved') {
          this.viewTimesheetPopupOpened = true;
        } else {
          this.editTimesheetPopupOpened = true;
        }
      },
      error: (err) => console.error('Failed to fetch timesheet:', err),
    });
  }

  onVerifyClick(e: any): void {
    e.cancel = true;
    const timesheetId = e.row?.data?.ID;
    if (!timesheetId) return;

    this.dataService.selectTimesheet(timesheetId).subscribe({
      next: (response: any) => {
        this.selectedTimesheet = response;
        this.verifyTimesheetPopupOpened = true;
      },
      error: (err) => console.error('Failed to fetch timesheet:', err),
    });
  }

  onApproveClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
    if (!employeeId) return;

    this.dataService.selectTimesheet(employeeId).subscribe({
      next: (response: any) => {
        this.selectedTimesheet = response;
        this.approveTimesheetPopupOpened = true;
      },
      error: (err) => console.error('Failed to fetch timesheet:', err),
    });
  }

  onVerifyAction(data: any) {
    const timesheetId = data.ID;
    this.dataService.selectTimesheet(timesheetId).subscribe((response: any) => {
      this.selectedTimesheet = response;
      if (data.STATUS === 'Open') {
        this.verifyTimesheetPopupOpened = true;
      } else if (data.STATUS === 'Verified') {
        this.approveTimesheetPopupOpened = true;
      } else if (data.STATUS === 'Approved') {
        this.viewTimesheetPopupOpened = true;
      }
    });
  }

  isDeleteVisible = (e: any) => {
    return e.row?.data?.STATUS !== 'Approved';
  };

  onDeleteTimesheet(e: any) {
    e.cancel = new Promise<void>((resolve, reject) => {
      confirm(
        'Are you sure you want to delete this Timesheet record?',
        'Confirm Deletion',
      ).then((dialogResult) => {
        if (dialogResult) {
          const timesheetIdId = e.data.ID;
          this.dataService.deleteTimesheet(timesheetIdId).subscribe({
            next: (response: any) => {
              if (response) {
                notify(
                  {
                    message: 'Timesheet Deleted Successfully',
                    position: { at: 'top right', my: 'top right' },
                    displayTime: 500,
                  },
                  'success',
                );
                this.fetchTimesheetList();
                resolve();
              } else {
                notify(
                  {
                    message: 'Your Data Not deleted',
                    position: { at: 'top right', my: 'top right' },
                    displayTime: 2000,
                  },
                  'error',
                );
                reject();
              }
            },
            error: (error) => {
              notify(
                {
                  message: 'Error deleting timesheet',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 2000,
                },
                'error',
              );
              console.error('Error deleting timesheet:', error);
              reject();
            },
          });
        } else {
          reject();
        }
      });
    });
  }

  handleClose() {
    this.addTimesheetPopupOpened = false;
    this.editTimesheetPopupOpened = false;
    this.verifyTimesheetPopupOpened = false;
    this.approveTimesheetPopupOpened = false;
    this.viewTimesheetPopupOpened = false;
    this.getTimesheet();
    this.fetchTimesheetList();
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
    DxToolbarModule,
    DxiItemModule,
    PayRevisionEditModule,
    PayRevisionAddModule,
    PayRevisionVerifyModule,
    PayRevisionApproveModule,
    PayRevisionViewModule,
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
