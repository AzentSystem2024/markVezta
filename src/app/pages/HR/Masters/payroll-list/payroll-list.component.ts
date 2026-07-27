import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
  DxDateRangeBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

import { PayrollAddModule } from '../../../../components/HR/Masters/payroll-add/payroll-add.component';
import { PayrollVerifyModule } from '../../../../components/HR/Masters/payroll-verify/payroll-verify.component';
import { PayrollApproveModule } from '../../../../components/HR/Masters/payroll-approve/payroll-approve.component';
import { PayrollViewModule } from '../../../../components/HR/Masters/payroll-view/payroll-view.component';
import { PayrollEditModule } from '../../../../components/HR/Masters/payroll-edit/payroll-edit.component';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.scss'],
})
export class PayrollListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popup') popupRef!: ElementRef;

  // --- Grid Settings ---
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';

  // --- Data & State ---
  isLoading: boolean = false;
  payrollList: any;
  allPayrollList: any[] = [];
  selectedPayroll: any;
  selectedRows: any;
  selectedRowKeys: any;

  // --- User & Company Info ---
  companyList: any[];
  selectedCompanyId: any;
  userId: any;
  finId: any;

  // --- Permissions ---
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canVerify: any;
  canPrint = false;

  // --- Popup States ---
  addPayrollPopupOpened: boolean = false;
  editPayrollPopupOpened: boolean = false;
  isVerifyMode: boolean = false;
  isApproveMode: boolean = false;
  isReadOnlyMode: boolean = false;
  PopupTitle: string = 'Payroll';

  // --- Calendar & Date Variables ---
  selectedMonth: Date = new Date();
  selectedMonthForAdd: any;
  calendarVisible = false;
  yearSelectorVisible = false;
  selectedYear: number;
  years: number[] = [];
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

  // --- Toolbar & Button Options ---
  approveDisabled = true;

  addButtonOptions = {
    text: 'New',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => {
        this.addPayroll();
      });
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

  approveButtonOptions = {
    text: 'Approve',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Approve selected payrolls',
    disabled: false,
    onClick: () => {
      this.approveSelectedPayroll();
    },
  };

  VerifyButtonOptions: any = {
    text: 'Verify',
    type: 'default',
    stylingMode: 'contained',
    width: 100,
    disabled: false,
    onClick: () => this.VerifyBulkRows(),
  };

  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      visible: (e: any) =>
        e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Paid',
    },
  ];

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

  previousYearButtonOptions = {
    text: '<',
    stylingMode: 'text',
    onClick: () => this.previousYear(),
    elementAttr: { class: 'year-button' },
  };

  nextYearButtonOptions = {
    text: '>',
    stylingMode: 'text',
    onClick: () => this.nextYear(),
    elementAttr: { class: 'year-button' },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  getStatusFilterData = [
    { text: 'Approved', value: 'Approved' },
    { text: 'Pending', value: 'Pending' },
  ];

  constructor(
    private dataService: DataService,
    private zone: NgZone,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================
  // Lifecycle Hooks
  // ==========================================
  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.companyList = [selectedCompany];
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }

      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.selectedYear = this.selectedMonth.getFullYear();

    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
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
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }

    this.getPayrollList();
    this.generateYears();
  }

  // ==========================================
  // Data Loading & API Calls
  // ==========================================
  getPayrollList() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };

    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    }

    this.dataService.getPayrollList(payload).subscribe({
      next: (response: any) => {
        this.allPayrollList = response.Data || [];
        this.filterPayrollByMonth();

        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
      error: (err) => {
        console.error('Failed to fetch payrolls', err);
        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
    });
  }

  filterPayrollByMonth() {
    if (!this.allPayrollList) {
      this.payrollList = [];
      return;
    }
    const selectedMonth = this.selectedMonth.getMonth();
    const selectedYear = this.selectedMonth.getFullYear();

    this.payrollList = this.allPayrollList.filter((item: any) => {
      if (!item.SAL_MONTH) return false;
      const salMonth = new Date(item.SAL_MONTH);
      return (
        salMonth.getMonth() === selectedMonth &&
        salMonth.getFullYear() === selectedYear
      );
    });
  }

  // ==========================================
  // Actions & Popups
  // ==========================================
  addPayroll() {
    this.addPayrollPopupOpened = true;
  }

  onEditOrViewPayroll(e: any) {
    e.cancel = true;
    const payrollId = e.data.SALARY_BILL_NO;
    const payload = {
      PAYDETAIL_ID: payrollId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService.viewSelectedPayroll(payload).subscribe({
      next: (response: any) => {
        this.selectedPayroll = response;
        const actionButton = this.allActionButtons.find(
          (btn) => btn.name === 'edit',
        );
        if (actionButton) {
          let hintText = 'Edit';
          if (
            this.selectedPayroll.STATUS === 'Approved' ||
            this.selectedPayroll.STATUS === 'Paid'
          ) {
            hintText = 'View';
          } else if (this.selectedPayroll.STATUS !== 'Pending') {
            hintText = '';
          }
          actionButton.hint = hintText;
          actionButton.text = hintText;
        }

        this.isVerifyMode = false;
        this.isApproveMode = false;
        this.isReadOnlyMode = false;

        if (
          this.selectedPayroll.STATUS === 'Approved' ||
          this.selectedPayroll.STATUS === 'Paid'
        ) {
          this.isReadOnlyMode = true;
          this.isApproveMode = true;
          this.PopupTitle = 'View Payroll';
        } else {
          this.PopupTitle = 'Edit Payroll';
        }
        this.editPayrollPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onVerifyOrApproveIconClick(e: any): void {
    e.cancel = true;
    const payrollId = e.data?.SALARY_BILL_NO;
    const status = e.data?.STATUS;

    if (!payrollId) {
      console.warn('No Payroll ID found in row data');
      return;
    }

    const payload = {
      PAYDETAIL_ID: payrollId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService.viewSelectedPayroll(payload).subscribe({
      next: (response: any) => {
        this.selectedPayroll = response;
        if (status === 'Pending') {
          this.isVerifyMode = true;
          this.isApproveMode = false;
          this.isReadOnlyMode = false;
          this.PopupTitle = 'Verify Payroll';
        } else if (status === 'Verified') {
          this.isVerifyMode = false;
          this.isApproveMode = true;
          this.isReadOnlyMode = true;
          this.PopupTitle = 'Approve Payroll';
        } else if (status === 'Approved' || status === 'Paid') {
          this.isVerifyMode = false;
          this.isApproveMode = false;
          this.isReadOnlyMode = true;
          this.PopupTitle = 'View Payroll';
        }

        this.editPayrollPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch payroll details:', err);
      },
    });
  }

  async onDeletePayroll(e: any) {
    if (e && e.cancel !== undefined) {
      e.cancel = true;
    }
    const TS_ID = e.data.TIMESHEET_ID;

    const isConfirmed = await confirm(
      'Are you sure you want to delete this payroll?',
      'Confirm Delete',
    );

    if (isConfirmed) {
      this.dataService.deletePayroll(TS_ID).subscribe({
        next: (response: any) => {
          if (response) {
            notify(
              {
                message: 'Payroll Deleted Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.getPayrollList();
          } else {
            notify(
              {
                message: 'Your data was not deleted',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        },
        error: (error: any) => {
          console.error('Error deleting payroll:', error);
          notify(
            {
              message: 'Error deleting payroll',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        },
      });
    }
  }

  approveSelectedPayroll() {
    const selectedRows = this.dataGrid.instance.getSelectedRowsData();
    const validRows = selectedRows.filter(
      (row: any) => row.STATUS === 'Verified' || row.STATUS === 'Pending',
    );
    if (validRows.length === 0) {
      notify('Please select at least one Verified row.', 'warning', 3000);
      return;
    }

    const result = confirm(
      'This will approve the salary. Are you sure?',
      'Confirm Approval',
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const payload = {
          COMPANY_ID: this.selectedCompanyId,
          USER_ID: this.userId,
          FIN_ID: this.finId,
          PAYDETAIL_ID: validRows.map((row: any) => row.SALARY_BILL_NO),
        };

        this.dataService.approvePayroll(payload).subscribe((response: any) => {
          if (response.flag === 1) {
            notify('Payroll approved successfully.', 'success', 3000);
            this.dataGrid.instance.clearSelection();
            this.updateRowStatus(validRows, 'Approved');
          } else {
            notify(response.Message || 'Something went wrong!', 'error', 3000);
          }
        });
      }
    });
  }

  VerifyBulkRows() {
    const selectedRows = this.dataGrid.instance.getSelectedRowsData();
    const validRows = selectedRows.filter(
      (row: any) => row.STATUS === 'Pending',
    );
    if (validRows.length === 0) {
      notify('Please select at least one Pending row.', 'warning', 3000);
      return;
    }

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      USER_ID: this.userId,
      PAYDETAIL_ID: validRows.map((row: any) => row.SALARY_BILL_NO),
    };

    this.dataService.VerifyPayroll(payload).subscribe((response: any) => {
      if (response.flag === 1) {
        notify('Payroll verified successfully.', 'success', 3000);
        this.dataGrid.instance.clearSelection();
        this.updateRowStatus(validRows, 'Verified');
      } else {
        notify(response.Message || 'Something went wrong!', 'error', 3000);
      }
    });
  }

  handleClose() {
    this.addPayrollPopupOpened = false;
    this.editPayrollPopupOpened = false;
    this.getPayrollList();
  }

  // ==========================================
  // Grid Events
  // ==========================================
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.getPayrollList();
  }

  updateRowStatus(rowsToUpdate: any[], newStatus: string) {
    const ids = rowsToUpdate.map((r: any) => r.SALARY_BILL_NO);
    this.allPayrollList.forEach((row: any) => {
      if (ids.includes(row.SALARY_BILL_NO)) {
        row.STATUS = newStatus;
      }
    });
    this.payrollList.forEach((row: any) => {
      if (ids.includes(row.SALARY_BILL_NO)) {
        row.STATUS = newStatus;
      }
    });
    // Force UI refresh without calling the API
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.refresh();
    }
  }

  onSelectionChanged(e: any) {
    // Prevent selection of Approved rows (e.g. from Select All)
    const newlySelectedApprovedKeys = e.currentSelectedRowKeys.filter(
      (key: any) => {
        const row = e.selectedRowsData.find(
          (r: any) => r.SALARY_BILL_NO === key || r === key,
        );
        return row && row.STATUS === 'Approved';
      },
    );

    if (newlySelectedApprovedKeys.length > 0) {
      e.component.deselectRows(newlySelectedApprovedKeys);
      return;
    }

    const selectedRows = e.selectedRowsData || [];

    const hasApproved = selectedRows.some(
      (row: any) => row.STATUS === 'Approved',
    );
    const hasVerified = selectedRows.some(
      (row: any) => row.STATUS === 'Verified',
    );

    this.approveButtonOptions = {
      ...this.approveButtonOptions,
      disabled: selectedRows.length === 0 || hasApproved,
    };

    this.VerifyButtonOptions = {
      ...this.VerifyButtonOptions,
      disabled: selectedRows.length === 0 || hasVerified || hasApproved,
    };
  }

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.STATUS === 'Approved') {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  onEditorPreparing(e: any) {
    if (
      e.parentType === 'dataRow' &&
      e.command === 'select' &&
      e.row?.data?.STATUS === 'Approved'
    ) {
      e.editorOptions.disabled = true;
    }
  }

  onRowClick(e: any) {
    if (e.data.STATUS === 'Approved') {
      const key = e.component.option('keyExpr')
        ? e.data[e.component.option('keyExpr')]
        : e.data;
      e.component.deselectRows([key]);
    }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
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
  }

  getStatusText = (rowData: any) => {
    return rowData.STATUS === 'Approved' ? 'Approved' : '';
  };

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-orange';
      case 'Verified':
        return 'flag-verified';
      case 'Approved':
        return 'flag-approved';
      default:
        return '';
    }
  }

  // ==========================================
  // Calendar & Filters
  // ==========================================
  toggleFilters() {
    this.zone.run(() => {
      const grid = this.dataGrid?.instance;
      if (grid) {
        const current = grid.option('filterRow.visible');
        grid.option('filterRow.visible', !current);
      }
    });
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];
    for (let i = currentYear - 10; i <= currentYear + 4; i++) {
      this.years.push(i);
    }
  }

  previousYear() {
    this.selectedYear--;
  }

  nextYear() {
    this.selectedYear++;
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

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }

  selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12);
    this.onMonthChange({ value: this.selectedMonth });
    this.calendarVisible = false;
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

    this.filterPayrollByMonth();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.filterPayrollByMonth();
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.filterPayrollByMonth();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}-${month}-${year}`;
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
    DxDateBoxModule,
    DxDateRangeBoxModule,
    PayrollAddModule,
    PayrollEditModule,
    PayrollVerifyModule,
    PayrollApproveModule,
    PayrollViewModule,
  ],
  providers: [],
  declarations: [PayrollListComponent],
  exports: [PayrollListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollListModule {}
