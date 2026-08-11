import { CommonModule } from '@angular/common';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import validationEngine from 'devextreme/ui/validation_engine';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxToolbarModule,
  DxButtonModule,
  DxTextAreaModule,
  DxPopupModule,
  DxFormModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxDateBoxModule,
  DxValidatorModule,
  DxLoadPanelModule,
  DxRadioGroupModule,
  DxDropDownBoxModule,
} from 'devextreme-angular';
@Component({
  selector: 'app-leave-salary-payment',
  templateUrl: './leave-salary-payment.component.html',
  styleUrls: ['./leave-salary-payment.component.scss'],
})
export class LeaveSalaryPaymentComponent implements OnInit {
  @ViewChild(DxDataGridComponent, {
    static: false,
  })
  dataGrid: DxDataGridComponent;
  vacationPopupVisible: boolean = false;
  selectedVacationRow: any = null;

  // --- Grid Settings ---
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  showFilterRow = true;
  isFilterOpened = false;

  // Toolbar options
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      if (this.ngZone) {
        this.ngZone.run(() => this.addNewRecord());
      } else {
        this.addNewRecord();
      }
    },
    elementAttr: {
      class: 'add-button',
    },
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.getLeavePaymentList(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.toggleFilters(),
  };

  onExporting(event: any) {
    const fileName = 'Leave Salary Payment';
    this.dataService.exportDataGrid(event, fileName);
  }
  // --- Data & State ---
  isLoading: boolean = false;
  leavePaymentList: any[] = [];
  selectedCompanyId: any;
  userId: any;
  finId: any;

  // --- Permissions ---
  canAdd = true;
  canEdit = true;
  canView = true;
  canDelete = true;
  canApprove = true;
  canVerify = true;

  // --- Popup States ---
  popupVisible: boolean = false;
  isVerifyMode: boolean = false;
  isApproveMode: boolean = false;
  isReadOnlyMode: boolean = false;
  popupTitle: string = 'Leave Salary Payment';
  EmployeeDropdown: any[] = [];
  OriginalEmployeeDropdown: any[] = [];
  ledgerList: any[] = [];
  filteredLedgerList: any[] = [];
  vacationList: any[] = [];

  leaveTypeOptions = [
    {
      id: 1,
      text: 'Leave Encashment',
    },
    {
      id: 2,
      text: 'Vacation Salary',
    },
  ];

  paymentModes = [
    {
      id: 1,
      text: 'Cash',
    },
    {
      id: 2,
      text: 'Bank',
    },
  ];

  leaveFormData: any = {
    TRANS_ID: null,
    VOUCHER_NO: '',
    TRANS_DATE: new Date(),
    EMP_ID: null,
    EMP_CODE: '',
    EMP_NAME: '',
    LEAVE_CREDIT: 0,
    BASIC_PAY: 0,
    ALLOWANCES: 0,
    LEAVE_TYPE: 1,
    // 1 for Leave Encashment, 2 for Vacation Salary
    VACATION_ID: null,
    VACATION_DOC_NO: '',
    VACATION_DEPT_DATE: null,
    VACATION_DAYS: 0,
    VACATION_SALARY: 0,
    LEAVE_DAYS: 0,
    LEAVE_SALARY: 0,
    TOTAL_DAYS: 0,
    TOTAL_PAID: 0,
    PAY_TYPE_ID: 1,
    PAY_HEAD_ID: null,
    CHEQUE_NO: '',
    CHEQUE_DATE: new Date(),
    NARRATION: '',
    STATUS_DESC: 'Open',
    TRANS_STATUS: 1,
  };

  isRevertingEmployee = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) { }
  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }
      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }

    // Permissions (similar to eos-payment-list)
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === this.router.url);
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
    this.loadAllDropdowns();
    this.getLeavePaymentList();
  }

  loadAllDropdowns() {
    this.EmployeeListDropDown();
    this.getLedgerCodeDropdown();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.showFilterRow = this.isFilterOpened;
  }

  private getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || [];
        this.onReceiptModeChange({
          value: this.leaveFormData.PAY_TYPE_ID,
        });
      },
      error: () => { },
    });
  }

  onReceiptModeChange(e: any) {
    this.leaveFormData.PAY_TYPE_ID = Number(e.value);
    if (e.event) {
      this.leaveFormData.PAY_HEAD_ID = null;
    }
    if (this.leaveFormData.PAY_TYPE_ID === 1) {
      this.leaveFormData.CHEQUE_NO = '';
      this.leaveFormData.CHEQUE_DATE = new Date();
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => Number(item.GROUP_ID) === 13,
      );
    } else if (this.leaveFormData.PAY_TYPE_ID === 2) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => Number(item.GROUP_ID) === 14,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList];
    }
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;
    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }
    this.getLeavePaymentList(e.value);
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;
    const fromLabel = this.formatAsDDMMYYYY(this.customStartDate);
    const toLabel = this.formatAsDDMMYYYY(this.customEndDate);
    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom'
        ? { ...opt, label: `${fromLabel} - ${toLabel}` }
        : opt,
    );
    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;
    this.getLeavePaymentList('custom');
  }

  private getDateRangePayload(range: string) {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;
    switch (range) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }
    return {
      DATE_FROM: fromDate ? this.formatAsYYYYMMDD(fromDate) : null,
      DATE_TO: toDate ? this.formatAsYYYYMMDD(toDate) : null,
    };
  }

  private formatAsYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatAsDDMMYYYY(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  displayExpr = (item: any) => {
    if (!item) return '';
    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} - ${to}`;
    }
    return item.label;
  };

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component?._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick');
        innerList.on('itemClick', (clickEvent: any) => {
          if (clickEvent.itemData.value === 'custom') {
            this.customStartDate = null;
            this.customEndDate = null;
            this.showCustomDatePopup = true;
            e.component.close();
          }
        });
      }
    }, 0);
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;
    this.applyCustomDateFilter();
  }

  getLeavePaymentList(range: string = this.selectedDateRange) {
    const datePayload = this.getDateRangePayload(range);
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };
    this.isLoading = true;
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    }
    this.dataService.get_leave_salary_list(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.leavePaymentList = res || [];
        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        notify('Failed to load records', 'error', 2000);
        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
    });
  }

  EmployeeListDropDown() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'Employee',
    };
    this.dataService.getEmployeeDropDown(payload).subscribe({
      next: (response: any) => {
        this.OriginalEmployeeDropdown = response || [];
        this.EmployeeDropdown = [...this.OriginalEmployeeDropdown];
      },
      error: (err) => { },
    });
  }

  clearDependentFields() {
    this.leaveFormData.LEAVE_CREDIT = 0;
    this.leaveFormData.BASIC_PAY = 0;
    this.leaveFormData.ALLOWANCES = 0;
    this.leaveFormData.LEAVE_TYPE = 1;
    this.leaveFormData.VACATION_ID = null;
    this.leaveFormData.VACATION_DOC_NO = '';
    this.leaveFormData.VACATION_DEPT_DATE = null;
    this.leaveFormData.VACATION_DAYS = 0;
    this.leaveFormData.VACATION_SALARY = 0;
    this.leaveFormData.LEAVE_DAYS = 0;
    this.leaveFormData.LEAVE_SALARY = 0;
    this.leaveFormData.TOTAL_DAYS = 0;
    this.leaveFormData.TOTAL_PAID = 0;
    this.leaveFormData.PAY_TYPE_ID = 1;
    this.leaveFormData.PAY_HEAD_ID = null;
    this.leaveFormData.CHEQUE_NO = '';
    this.leaveFormData.CHEQUE_DATE = new Date();
    this.leaveFormData.NARRATION = '';
  }

  onFetchEmployeeDetails(e?: any) {
    if (this.isRevertingEmployee) {
      this.isRevertingEmployee = false;
      return;
    }
    if (e && (!e.value || !e.event)) return;
    if (!this.leaveFormData.EMP_ID) return;

    const hasEnteredData =
      this.leaveFormData.LEAVE_DAYS > 0 ||
      this.leaveFormData.PAY_HEAD_ID ||
      this.leaveFormData.CHEQUE_NO ||
      this.leaveFormData.NARRATION ||
      (this.leaveFormData.LEAVE_TYPE === 2 && this.leaveFormData.VACATION_ID);

    if (e && e.previousValue && hasEnteredData) {
      confirm(
        'Changing the employee will clear all entered fields. Are you sure?',
        'Confirm',
      ).then((res) => {
        if (res) {
          this.clearDependentFields();
          this.fetchEmployeeData();
        } else {
          this.isRevertingEmployee = true;
          this.leaveFormData.EMP_ID = e.previousValue;
        }
      });
    } else {
      if (e && e.previousValue) {
        this.clearDependentFields();
      }
      this.fetchEmployeeData();
    }
  }

  fetchEmployeeData() {
    this.isLoading = true;
    const payload = {
      EMP_ID: this.leaveFormData.EMP_ID,
    };
    this.dataService.get_leave_salary_employee_details(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          const emp = Array.isArray(res) && res.length > 0 ? res[0] : res;
          this.leaveFormData.EMP_CODE = emp.EMP_CODE;
          this.leaveFormData.EMP_NAME = emp.EMP_NAME;
          this.leaveFormData.LEAVE_CREDIT = emp.LEAVE_CREDIT || 0;
          this.leaveFormData.BASIC_PAY = emp.BASIC_PAY || 0;
          this.leaveFormData.ALLOWANCES = emp.ALLOWANCES || 0;
        }
        const vacPayload = {
          EMP_ID: this.leaveFormData.EMP_ID,
        };
        this.dataService.get_leave_salary_vacation_list(vacPayload).subscribe({
          next: (vacRes: any) => {
            this.vacationList = vacRes || [];
          },
          error: (vacErr) => {
            this.vacationList = [];
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        notify('Failed to fetch employee details', 'error', 2000);
      },
    });
  }

  onLeaveTypeChange(e: any) {
    if (e.value === 1) {
      // Leave Encashment
      this.leaveFormData.VACATION_ID = null;
      this.leaveFormData.VACATION_DOC_NO = '';
      this.leaveFormData.VACATION_DEPT_DATE = null;
      this.leaveFormData.VACATION_DAYS = 0;
      this.leaveFormData.VACATION_SALARY = 0;
      this.calculateTotals();
    }
  }

  onSelectVacationClick() {
    if (!this.leaveFormData.EMP_ID) return;
    this.isLoading = true;
    const payload = {
      EMP_ID: this.leaveFormData.EMP_ID,
    };
    this.dataService.get_leave_salary_vacation_list(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.vacationList = res || [];
        this.vacationPopupVisible = true;
      },
      error: (err) => {
        this.isLoading = false;
        notify('Failed to load vacation list', 'error', 2000);
      },
    });
  }

  onVacationSelected(e: any) {
    if (e.selectedRowsData && e.selectedRowsData.length > 0) {
      this.selectedVacationRow = e.selectedRowsData[0];
    } else {
      this.selectedVacationRow = null;
    }
  }

  confirmVacationSelection() {
    if (this.selectedVacationRow) {
      this.isLoading = true;
      const payload = {
        VACATION_ID: this.selectedVacationRow.VACATION_ID,
      };
      this.dataService.get_leave_salary_vacation_details(payload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.vacationPopupVisible = false;
          if (res) {
            const vac = Array.isArray(res) && res.length > 0 ? res[0] : res;
            this.leaveFormData.VACATION_ID =
              vac.VACATION_ID || this.selectedVacationRow.VACATION_ID;
            this.leaveFormData.VACATION_DOC_NO =
              vac.DOC_NO || vac.VACATION_DOC_NO;
            this.leaveFormData.VACATION_DEPT_DATE = vac.DEPT_DATE
              ? new Date(vac.DEPT_DATE)
              : null;
            this.leaveFormData.VACATION_DAYS =
              vac.VAC_DAYS || vac.VACATION_DAYS || 0;
            this.leaveFormData.VACATION_SALARY = 0;
            this.calculateTotals();
          }
        },
        error: (err) => {
          this.isLoading = false;
          notify('Failed to get vacation details', 'error', 2000);
        },
      });
    } else {
      notify('Please select a vacation', 'warning', 2000);
    }
  }

  calculateTotals() {
    const vacDays = this.leaveFormData.VACATION_DAYS || 0;
    const leaveDays = this.leaveFormData.LEAVE_DAYS || 0;
    this.leaveFormData.TOTAL_DAYS = vacDays + leaveDays;
    // const vacSalary = this.leaveFormData.VACATION_SALARY || 0;
    const leaveSalary = this.leaveFormData.LEAVE_SALARY || 0;
    this.leaveFormData.TOTAL_PAID = leaveSalary;
  }

  onTotalDaysChanged(e: any) {
    if (!this.leaveFormData.EMP_ID || !this.leaveFormData.TOTAL_DAYS) {
      this.leaveFormData.LEAVE_SALARY = 0;
      this.calculateTotals();
      return;
    }
    const payload = {
      EMP_ID: this.leaveFormData.EMP_ID,
      LEAVE_DAYS: this.leaveFormData.TOTAL_DAYS,
      PAYMENT_DATE: this.formatAsYYYYMMDD(new Date()),
    };
    this.dataService.get_calculated_leave_salary(payload).subscribe({
      next: (res: any) => {
        if (res && res.LEAVE_SALARY !== undefined) {
          this.leaveFormData.LEAVE_SALARY = res.LEAVE_SALARY;
          this.calculateTotals();
        }
      },
      error: (err) => {
        notify('Failed to calculate leave salary', 'error', 2000);
      },
    });
  }

  addNewRecord() {
    this.popupTitle = 'New Leave Salary Payment';
    this.isReadOnlyMode = false;
    this.isApproveMode = false;
    this.isVerifyMode = false;
    this.resetForm();
    this.loadAllDropdowns();
    this.popupVisible = true;
  }

  mapApiResponseToFormData(res: any) {
    if (!res) return;
    this.leaveFormData.TRANS_ID = res.TRANS_ID;
    this.leaveFormData.VOUCHER_NO = res.VOUCHER_NO || '';
    this.leaveFormData.TRANS_DATE = res.TRANS_DATE
      ? new Date(res.TRANS_DATE)
      : new Date();
    this.leaveFormData.EMP_ID = res.EMP_ID;
    this.leaveFormData.EMP_CODE = res.EMP_CODE || '';
    this.leaveFormData.EMP_NAME = res.EMP_NAME || '';

    // We might need to fetch employee details to get Leave Credit, Basic, Allowances if not in main record
    if (res.LEAVE_CREDIT !== undefined)
      this.leaveFormData.LEAVE_CREDIT = res.LEAVE_CREDIT;
    if (res.BASIC_PAY !== undefined)
      this.leaveFormData.BASIC_PAY = res.BASIC_PAY;
    if (res.ALLOWANCES !== undefined)
      this.leaveFormData.ALLOWANCES = res.ALLOWANCES;
    this.leaveFormData.VACATION_ID =
      res.VACATION_ID === 0 ? null : res.VACATION_ID;
    this.leaveFormData.LEAVE_TYPE = this.leaveFormData.VACATION_ID ? 2 : 1;
    this.leaveFormData.VACATION_DAYS = res.VACATION_DAYS || 0;
    this.leaveFormData.VACATION_SALARY = res.VACATION_SALARY || 0;
    this.leaveFormData.LEAVE_DAYS = res.LEAVE_DAYS || 0;
    this.leaveFormData.LEAVE_SALARY = res.LEAVE_SALARY || 0;
    this.leaveFormData.TOTAL_DAYS = res.TOTAL_DAYS || 0;
    this.leaveFormData.TOTAL_PAID = res.TOTAL_PAID || 0;
    this.leaveFormData.NARRATION = res.NARRATION || '';
    this.leaveFormData.STATUS_DESC = res.STATUS_DESC || 'Open';
    this.leaveFormData.TRANS_STATUS = res.TRANS_STATUS || 1;
    if (res.PAY_TYPE_ID !== undefined && res.PAY_TYPE_ID !== null) {
      this.leaveFormData.PAY_TYPE_ID = Number(res.PAY_TYPE_ID);
      this.onReceiptModeChange({
        value: this.leaveFormData.PAY_TYPE_ID,
      });
    }
    if (res.PAY_HEAD_ID !== undefined && res.PAY_HEAD_ID !== null) {
      this.leaveFormData.PAY_HEAD_ID =
        res.PAY_HEAD_ID === 0 ? null : Number(res.PAY_HEAD_ID);
    }
    if (res.CHEQUE_NO) this.leaveFormData.CHEQUE_NO = res.CHEQUE_NO;
    if (res.CHEQUE_DATE)
      this.leaveFormData.CHEQUE_DATE = new Date(res.CHEQUE_DATE);

    if (this.leaveFormData.VACATION_ID) {
      this.dataService
        .get_leave_salary_vacation_details({
          VACATION_ID: this.leaveFormData.VACATION_ID,
        })
        .subscribe({
          next: (vacRes: any) => {
            if (vacRes) {
              const vac =
                Array.isArray(vacRes) && vacRes.length > 0 ? vacRes[0] : vacRes;
              this.leaveFormData.VACATION_DOC_NO =
                vac.DOC_NO || vac.VACATION_DOC_NO;
              this.leaveFormData.VACATION_DEPT_DATE = vac.DEPT_DATE
                ? new Date(vac.DEPT_DATE)
                : null;
            }
          },
          error: () => { },
        });
    }
  }

  onEditingStart(e: any) {
    this.popupTitle = 'Edit Leave Salary Payment';
    this.isReadOnlyMode = false;
    this.isApproveMode = false;
    this.isVerifyMode = false;
    const row = e.data;
    this.leaveFormData.TRANS_ID = row.TRANS_ID;
    this.loadAllDropdowns();
    this.isLoading = true;
    this.dataService.select_leave_salary(row.TRANS_ID).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          const data = Array.isArray(res) && res.length > 0 ? res[0] : res;
          this.mapApiResponseToFormData(data);
        }
        this.popupVisible = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        notify('Failed to fetch data', 'error', 2000);
      },
    });
  }

  deleteData(e: any) {
    const result = confirm(
      'Are you sure you want to delete this record?',
      'Confirm Delete',
    );
    result.then((dialogResult) => {
      if (dialogResult) {
        this.dataService.delete_leave_salary(e.data.TRANS_ID).subscribe({
          next: () => {
            notify('Record deleted successfully', 'success', 2000);
            this.getLeavePaymentList();
          },
          error: () => notify('Failed to delete record', 'error', 2000),
        });
      }
    });
  }

  onVerifyClick(e: any) {
    const data = e.row.data;
    if (data.STATUS_DESC === 'Open') {
      this.popupTitle = 'Verify Leave Salary Payment';
      this.isVerifyMode = true;
      this.isApproveMode = false;
      this.isReadOnlyMode = true;
    } else if (data.STATUS_DESC === 'Verified') {
      this.popupTitle = 'Approve Leave Salary Payment';
      this.isVerifyMode = false;
      this.isApproveMode = true;
      this.isReadOnlyMode = true;
    } else {
      this.popupTitle = 'View Leave Salary Payment';
      this.isVerifyMode = false;
      this.isApproveMode = false;
      this.isReadOnlyMode = true;
    }

    this.leaveFormData.TRANS_ID = data.TRANS_ID;
    this.loadAllDropdowns();
    this.isLoading = true;
    this.dataService.select_leave_salary(data.TRANS_ID).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          const apiData = Array.isArray(res) && res.length > 0 ? res[0] : res;
          this.mapApiResponseToFormData(apiData);
        }
        this.popupVisible = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        notify('Failed to fetch data', 'error', 2000);
      },
    });
  }

  buildPayload(): any {
    return {
      TRANS_ID: this.leaveFormData.TRANS_ID || 0,
      EMP_ID: this.leaveFormData.EMP_ID || 0,
      TRANS_DATE: this.leaveFormData.TRANS_DATE
        ? new Date(this.leaveFormData.TRANS_DATE).toISOString().split('T')[0]
        : null,
      VACATION_ID:
        this.leaveFormData.LEAVE_TYPE === 2
          ? this.leaveFormData.VACATION_ID || 0
          : 0,
      VACATION_DAYS: this.leaveFormData.VACATION_DAYS || 0,
      LEAVE_CREDIT: this.leaveFormData.LEAVE_CREDIT || 0,
      TOTAL_DAYS: this.leaveFormData.TOTAL_DAYS || 0,
      BASIC_PAY: this.leaveFormData.BASIC_PAY || 0,
      ALLOWANCES: this.leaveFormData.ALLOWANCES || 0,
      TOTAL_PAID: this.leaveFormData.TOTAL_PAID || 0,
      VACATION_SALARY: this.leaveFormData.VACATION_SALARY || 0,
      LEAVE_DAYS: this.leaveFormData.LEAVE_DAYS || 0,
      LEAVE_SALARY: this.leaveFormData.LEAVE_SALARY || 0,
      FIN_ID: this.finId || 0,
      COMPANY_ID: this.selectedCompanyId || 0,
      NARRATION: this.leaveFormData.NARRATION || '',
      USER_ID: this.userId || 0,
      PAY_HEAD_ID: this.leaveFormData.PAY_HEAD_ID || 0,
      PAY_TYPE_ID: this.leaveFormData.PAY_TYPE_ID || 1,
      // Include cheque details if needed, though not in the image payload
      CHEQUE_NO: this.leaveFormData.CHEQUE_NO,
      CHEQUE_DATE: this.leaveFormData.CHEQUE_DATE
        ? new Date(this.leaveFormData.CHEQUE_DATE).toISOString()
        : null,
    };
  }

  validateLeaveCredit(): boolean {
    const leaveCredit = this.leaveFormData.LEAVE_CREDIT || 0;
    const totalDays = this.leaveFormData.TOTAL_DAYS || 0;
    if (totalDays > leaveCredit) {
      notify('Total Days cannot exceed Leave Credit.', 'error', 3000);
      return false;
    }
    return true;
  }

  onSave(e: any) {
    const res = validationEngine.validateGroup('leaveForm');
    if (res && !res.isValid) return;
    if (!this.validateLeaveCredit()) return;
    const payload = this.buildPayload();
    const isUpdate = !!payload.TRANS_ID;
    const apiCall = isUpdate
      ? this.dataService.update_leave_salary(payload)
      : this.dataService.add_leave_salary(payload);
    apiCall.subscribe({
      next: () => {
        notify(
          isUpdate ? 'Updated Successfully' : 'Saved Successfully',
          'success',
          2000,
        );
        this.popupVisible = false;
        this.getLeavePaymentList();
      },
      error: () =>
        notify(isUpdate ? 'Failed to update' : 'Failed to save', 'error', 2000),
    });
  }

  onVerify(e: any) {
    if (!this.validateLeaveCredit()) return;
    const payload = this.buildPayload();
    this.dataService.verify_leave_salary(payload).subscribe({
      next: () => {
        notify('Verified Successfully', 'success', 2000);
        this.popupVisible = false;
        this.getLeavePaymentList();
      },
      error: () => notify('Verification Failed', 'error', 2000),
    });
  }

  onApprove(e: any) {
    const res = validationEngine.validateGroup('leaveForm');
    if (res && !res.isValid) return;

    if (!this.leaveFormData.PAY_HEAD_ID) {
      notify('Ledger is required for approval', 'error', 2000);
      return;
    }

    if (this.leaveFormData.PAY_TYPE_ID == 2) {
      if (!this.leaveFormData.CHEQUE_NO) {
        notify('Cheque No is required for Bank payment', 'error', 2000);
        return;
      }
      if (!this.leaveFormData.CHEQUE_DATE) {
        notify('Cheque Date is required for Bank payment', 'error', 2000);
        return;
      }
    }

    if (!this.validateLeaveCredit()) return;
    const payload = this.buildPayload();
    this.dataService.approve_leave_salary(payload).subscribe({
      next: () => {
        notify('Approved Successfully', 'success', 2000);
        this.popupVisible = false;
        this.getLeavePaymentList();
      },
      error: () => notify('Approval Failed', 'error', 2000),
    });
  }

  handleClose() {
    this.popupVisible = false;
    this.resetForm();
  }

  resetForm() {
    this.leaveFormData = {
      TRANS_ID: null,
      VOUCHER_NO: '',
      TRANS_DATE: new Date(),
      EMP_ID: null,
      EMP_CODE: '',
      EMP_NAME: '',
      LEAVE_CREDIT: 0,
      BASIC_PAY: 0,
      ALLOWANCES: 0,
      LEAVE_TYPE: 1,
      VACATION_ID: null,
      VACATION_DOC_NO: '',
      VACATION_DEPT_DATE: null,
      VACATION_DAYS: 0,
      VACATION_SALARY: 0,
      LEAVE_DAYS: 0,
      LEAVE_SALARY: 0,
      TOTAL_DAYS: 0,
      TOTAL_PAID: 0,
      PAY_TYPE_ID: 1,
      PAY_HEAD_ID: null,
      CHEQUE_NO: '',
      CHEQUE_DATE: new Date(),
      NARRATION: '',
      STATUS_DESC: 'Open',
      TRANS_STATUS: 1,
    };

    // Reset validation state
    setTimeout(() => {
      try {
        validationEngine.resetGroup('leaveForm');
      } catch (e) { }
    }, 0);
  }
}
@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    DxTextAreaModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxRadioGroupModule,
    DxDropDownBoxModule,
    CustomDatePopupModule,
  ],
  declarations: [LeaveSalaryPaymentComponent],
  exports: [LeaveSalaryPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LeaveSalaryPaymentModule { }
