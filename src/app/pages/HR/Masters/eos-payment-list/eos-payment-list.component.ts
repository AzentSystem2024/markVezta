import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
} from 'devextreme-angular';

@Component({
  selector: 'app-eos-payment-list',
  templateUrl: './eos-payment-list.component.html',
  styleUrls: ['./eos-payment-list.component.scss'],
})
export class EosPaymentListComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  // --- Grid Settings ---
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  auto: string = 'auto';

  // Toolbar options matching staff-eos
  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedRange: string = 'all';

  dateRangeOptions = {
    dataSource: this.dateRanges,
    displayExpr: 'label',
    valueExpr: 'value',
    value: this.selectedRange,
    placeholder: 'Date Range',
    onValueChanged: (e: any) => {
      this.selectedRange = e.value;
      this.getEosPaymentList();
    },
  };

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
    onClick: () => this.getEosPaymentList(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.showFilterRow = this.isFilterOpened;
  }

  // --- Data & State ---
  isLoading: boolean = false;
  eosPaymentList: any[] = [];
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
  popupTitle: string = 'New EOS Payment';

  EmployeeDropdown: any[] = [];
  OriginalEmployeeDropdown: any[] = [];
  reson_data: any[] = [];
  ledgerList: any[] = [];
  filteredLedgerList: any[] = [];

  eosFormData: any = {
    ID: null,
    VoucherNo: '',
    Date: new Date(),
    EmployeeId: null,
    EmployeeCode: '',
    EmployeeName: '',
    Reason: '',
    DocNo: '',
    JoinDate: null,
    LastWorkingDay: null,
    Days: 0,
    TotalServiceDays: 0,
    UnPaidLeave: 0,
    PendingSalary: 0,
    EOSAmount: 0,
    UnPaidLeaveSalary: 0,
    Additions: 0,
    Deductions: 0,
    NetAmount: 0,
    Remarks: '',
    Remarks2: '',
    PAY_TYPE_ID: 1,
    PAY_HEAD_ID: null,
    ChequeNo: '',
    DueDate: new Date(),
    Narration: '',
  };

  paymentModes = [
    { id: 1, text: 'Cash' },
    { id: 2, text: 'Bank' },
  ];

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

  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

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

    // Set permissions if implemented via session storage
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

    this.EmployeeListDropDown();
    this.get_reson_dropdown();
    this.getLedgerCodeDropdown();
    this.getEosPaymentList();
  }

  private getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || [];
        this.onReceiptModeChange({ value: this.eosFormData.PAY_TYPE_ID });
      },
      error: () => {},
    });
  }

  onReceiptModeChange(e: any) {
    this.eosFormData.PAY_TYPE_ID = e.value;

    if (this.eosFormData.PAY_TYPE_ID === 1) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => item.GROUP_ID === 13,
      );
    } else if (this.eosFormData.PAY_TYPE_ID === 2) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => item.GROUP_ID === 14,
      );
    } else if (this.eosFormData.PAY_TYPE_ID === 4) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => item.GROUP_ID !== 13 && item.GROUP_ID !== 14,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList];
    }
  }

  get_reson_dropdown() {
    this.isLoading = true;
    const payload = {}; // passing empty object as payload for now
    this.dataService.Dropdown_EOS_reason(payload).subscribe({
      next: (res: any) => {
        this.reson_data = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load reason dropdown', err);
      },
    });
  }

  getEosPaymentList() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      Range: this.selectedRange,
    };

    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    }

    this.dataService.get_EOS_payment_list(payload).subscribe({
      next: (res: any) => {
        this.eosPaymentList = res?.data || res?.Data || res || [];
        this.filterEmployeeDropdown();
        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch EOS payment list', err);
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
      NAME: 'LEFT_EMP',
    };
    this.dataService.getEmployeeDropDown(payload).subscribe((response: any) => {
      this.OriginalEmployeeDropdown = response || [];
      this.filterEmployeeDropdown();
    });
  }

  filterEmployeeDropdown() {
    if (!this.OriginalEmployeeDropdown || !this.eosPaymentList) return;

    // Create a Set of Employee IDs that are already present in the main list
    const existingEmpIds = new Set(
      this.eosPaymentList.map((item: any) => item.EMP_ID || item.EmployeeId)
    );

    // Filter out employees already in the list, UNLESS they are the currently selected employee in the open popup
    this.EmployeeDropdown = this.OriginalEmployeeDropdown.filter(
      (emp: any) =>
        !existingEmpIds.has(emp.ID) || emp.ID === this.eosFormData.EmployeeId
    );
  }

  onEmployeeSelectionChanged(e: any) {
    if (!e.value) return;

    const payload = e.value;

    this.dataService.get_EOS_payment_details(payload).subscribe({
      next: (res: any) => {
        if (res) {
          // If the API still returns the older camelCase fields for some reason, we coalesce.
          // Otherwise, we strictly use the new uppercase fields provided by the user.
          this.eosFormData.EmployeeCode =
            res.EMP_CODE || res.EMP_NO || res.EmployeeCode;
          this.eosFormData.EmployeeName = res.EMP_NAME || res.EmployeeName;
          this.eosFormData.Reason = res.REASON_ID || res.Reason;
          this.eosFormData.DocNo = res.DOC_NO || res.DocNo;
          this.eosFormData.JoinDate = res.DOJ
            ? new Date(res.DOJ)
            : res.JOIN_DATE
              ? new Date(res.JOIN_DATE)
              : res.JoinDate
                ? new Date(res.JoinDate)
                : null;
          this.eosFormData.LastWorkingDay = res.EOS_DATE
            ? new Date(res.EOS_DATE)
            : res.LAST_WORKING_DAY
              ? new Date(res.LAST_WORKING_DAY)
              : res.LastWorkingDay
                ? new Date(res.LastWorkingDay)
                : null;
          this.eosFormData.Days = res.WORKED_DAYS || res.DAYS || res.Days || 0;
          this.eosFormData.TotalServiceDays =
            res.WORKED_DAYS ||
            res.TOTAL_SERVICE_DAYS ||
            res.TotalServiceDays ||
            0;
          this.eosFormData.UnPaidLeave =
            res.UNPAID_LEAVE || res.UnPaidLeave || 0;

          // Map uppercase fields from DB format
          this.eosFormData.PendingSalary =
            res.PENDING_SALARY || res.PendingSalary || 0;
          this.eosFormData.EOSAmount = res.EOS_AMOUNT || res.EOSAmount || 0;
          this.eosFormData.UnPaidLeaveSalary =
            res.LEAVE_AMOUNT || res.UnPaidLeaveSalary || 0;
          this.eosFormData.Additions = res.ADD_AMOUNT || res.Additions || 0;
          this.eosFormData.Deductions = res.DED_AMOUNT || res.Deductions || 0;
          this.eosFormData.NetAmount = res.NET_AMOUNT || res.NetAmount || 0;

          this.eosFormData.Remarks = res.REMARKS || res.Remarks || '';
          this.eosFormData.Remarks2 =
            res.ADD_REMARKS || res.DED_REMARKS || res.Remarks2 || '';

          if (res.VOUCHER_NO) this.eosFormData.VoucherNo = res.VOUCHER_NO;
          if (res.DOC_DATE) this.eosFormData.Date = new Date(res.DOC_DATE);
          if (res.PAY_TYPE_ID) {
            this.eosFormData.PAY_TYPE_ID = res.PAY_TYPE_ID;
            this.onReceiptModeChange({ value: this.eosFormData.PAY_TYPE_ID });
          } else if (res.PAYMENT_MODE) {
            this.eosFormData.PAY_TYPE_ID = res.PAYMENT_MODE === 'Bank' ? 2 : 1;
            this.onReceiptModeChange({ value: this.eosFormData.PAY_TYPE_ID });
          }
          if (res.PAY_HEAD_ID || res.PAYMENT_ACCOUNT_ID)
            this.eosFormData.PAY_HEAD_ID =
              res.PAY_HEAD_ID || res.PAYMENT_ACCOUNT_ID;
          if (res.CHEQUE_NO) this.eosFormData.ChequeNo = res.CHEQUE_NO;
          if (res.CHEQUE_DATE)
            this.eosFormData.DueDate = new Date(res.CHEQUE_DATE);
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch EOS payment data', err);
      },
    });
  }

  addNewRecord() {
    this.popupTitle = 'New EOS Payment';
    this.isReadOnlyMode = false;
    this.isApproveMode = false;
    this.isVerifyMode = false;
    this.resetForm();
    this.EmployeeListDropDown();
    this.popupVisible = true;
  }

  onEditingStart(e: any) {
    this.EmployeeListDropDown();
    this.popupTitle = 'Edit EOS Payment';
    this.isReadOnlyMode = false;
    this.isApproveMode = false;
    this.isVerifyMode = false;

    const row = e.data;
    this.eosFormData = {
      ID: row.ID,
      VoucherNo: row.VOUCHER_NO || row.VoucherNo,
      Date: row.DOC_DATE
        ? new Date(row.DOC_DATE)
        : row.Date
          ? new Date(row.Date)
          : new Date(),
      EmployeeId: row.EMP_ID || row.EmployeeId,
      EmployeeCode: row.EMP_CODE || row.EMP_NO || row.EmployeeCode,
      EmployeeName: row.EMP_NAME || row.EmployeeName,
      Reason: row.REASON_ID || row.Reason,
      DocNo: row.DOC_NO || row.DocNo,
      JoinDate: row.DOJ
        ? new Date(row.DOJ)
        : row.JOIN_DATE
          ? new Date(row.JOIN_DATE)
          : row.JoinDate
            ? new Date(row.JoinDate)
            : null,
      LastWorkingDay: row.EOS_DATE
        ? new Date(row.EOS_DATE)
        : row.LAST_WORKING_DAY
          ? new Date(row.LAST_WORKING_DAY)
          : row.LastWorkingDay
            ? new Date(row.LastWorkingDay)
            : null,
      Days: row.WORKED_DAYS || row.DAYS || row.Days || 0,
      TotalServiceDays:
        row.WORKED_DAYS || row.TOTAL_SERVICE_DAYS || row.TotalServiceDays || 0,
      UnPaidLeave: row.UNPAID_LEAVE || row.UnPaidLeave || 0,
      PendingSalary: row.PENDING_SALARY || row.PendingSalary || 0,
      EOSAmount: row.EOS_AMOUNT || row.EOSAmount || 0,
      UnPaidLeaveSalary: row.LEAVE_AMOUNT || row.UnPaidLeaveSalary || 0,
      Additions: row.ADD_AMOUNT || row.Additions || 0,
      Deductions: row.DED_AMOUNT || row.Deductions || 0,
      NetAmount: row.NET_AMOUNT || row.NetAmount || 0,
      Remarks: row.REMARKS || row.Remarks || '',
      Remarks2: row.ADD_REMARKS || row.DED_REMARKS || row.Remarks2 || '',
      PAY_TYPE_ID:
        row.PAY_TYPE_ID ||
        (row.PAYMENT_MODE === 'Bank' || row.PaymentMode === 'Bank' ? 2 : 1),
      PAY_HEAD_ID: row.PAY_HEAD_ID || row.PAYMENT_ACCOUNT_ID || row.Ledger,
      ChequeNo: row.CHEQUE_NO || row.ChequeNo,
      DueDate: row.CHEQUE_DATE
        ? new Date(row.CHEQUE_DATE)
        : row.DueDate
          ? new Date(row.DueDate)
          : null,
      Narration: row.REMARKS || row.Narration || '',
    };

    this.EmployeeListDropDown();
    this.popupVisible = true;
  }

  deleteData(e: any) {
    const result = confirm(
      'Are you sure you want to delete this record?',
      'Confirm Delete',
    );
    result.then((dialogResult) => {
      if (dialogResult) {
        this.dataService.delete_EOS_payment(e.data.ID).subscribe({
          next: (res) => {
            notify('Record deleted successfully', 'success', 2000);
            this.getEosPaymentList();
          },
          error: (err) => {
            notify('Failed to delete record', 'error', 2000);
          },
        });
      }
    });
  }

  onVerifyClick(e: any) {
    const data = e.row.data;
    // Emulate onEditingStart binding to map uppercase keys properly if needed
    this.onEditingStart({ data: data });

    // Call the select API using the employee ID to fetch the details
    this.onEmployeeSelectionChanged({ value: data.EMP_ID || data.EmployeeId });

    if (data.STATUS === 'Open') {
      this.popupTitle = 'Verify EOS Payment';
      this.isVerifyMode = true;
      this.isApproveMode = false;
      this.isReadOnlyMode = true;
    } else if (data.STATUS === 'Verified') {
      this.popupTitle = 'Approve EOS Payment';
      this.isVerifyMode = false;
      this.isApproveMode = true;
      this.isReadOnlyMode = true;
    } else {
      this.popupTitle = 'View EOS Payment';
      this.isVerifyMode = false;
      this.isApproveMode = false;
      this.isReadOnlyMode = true;
    }
  }

  buildFullPayload(): any {
    const selectedReason = this.reson_data.find(
      (r: any) => r.ID === this.eosFormData.Reason,
    );

    return {
      ID: this.eosFormData.ID || 0,
      DOC_STATUS: this.eosFormData.DOC_STATUS || 0,
      DOC_NO: this.eosFormData.DocNo || '',
      EOS_DATE: this.eosFormData.LastWorkingDay
        ? new Date(this.eosFormData.LastWorkingDay).toISOString()
        : new Date().toISOString(),
      EOS_ID: this.eosFormData.EOS_ID || 0,
      EMP_ID: this.eosFormData.EmployeeId || 0,
      REASON: selectedReason ? selectedReason.DESCRIPTION : '',
      REASON_ID: this.eosFormData.Reason || 0,
      COMPANY_ID: this.selectedCompanyId || 0,
      EMP_NO: this.eosFormData.EmployeeCode || '',
      EMP_CODE: this.eosFormData.EmployeeCode || '',
      EMP_NAME: this.eosFormData.EmployeeName || '',
      WORKED_DAYS: this.eosFormData.Days || 0,
      EOS_DOC_NO: this.eosFormData.EOS_DOC_NO || '',
      DOJ: this.eosFormData.JoinDate
        ? new Date(this.eosFormData.JoinDate).toISOString()
        : new Date().toISOString(),
      EOS_AMOUNT: this.eosFormData.EOSAmount || 0,
      PENDING_SALARY: this.eosFormData.PendingSalary || 0,
      LEAVE_AMOUNT: this.eosFormData.UnPaidLeaveSalary || 0,
      ADD_AMOUNT: this.eosFormData.Additions || 0,
      DED_AMOUNT: this.eosFormData.Deductions || 0,
      ADD_REMARKS: this.eosFormData.Remarks2 || '',
      DED_REMARKS: this.eosFormData.DED_REMARKS || '',
      NET_AMOUNT: this.eosFormData.NetAmount || 0,
      REMARKS: this.eosFormData.Remarks || '',
      STATUS: this.eosFormData.Status || '',
      PAY_HEAD_ID: this.eosFormData.PAY_HEAD_ID || 0,
      PAY_TYPE_ID: this.eosFormData.PAY_TYPE_ID || 0,
      NARRATION: this.eosFormData.Narration || '',
      CHEQUE_NO: this.eosFormData.ChequeNo || '',
      CHEQUE_DATE: this.eosFormData.DueDate
        ? new Date(this.eosFormData.DueDate).toISOString()
        : new Date().toISOString(),
    };
  }

  onSave(e: any) {
    const res = validationEngine.validateGroup('eosForm');
    if (res && !res.isValid) {
      return;
    }

    const payload = this.buildFullPayload();

    console.log("payload",payload)

    const apiCall = payload.ID
      ? this.dataService.update_EOS_payment(payload)
      : this.dataService.add_EOS_payment(payload);

    apiCall.subscribe({
      next: (res) => {
        notify('Saved Successfully', 'success', 2000);
        this.popupVisible = false;
        this.getEosPaymentList();
      },
      error: (err) => {
        notify('Failed to save record', 'error', 2000);
      },
    });
  }

  onVerify(e: any) {
    const res = validationEngine.validateGroup('eosForm');
    if (res && !res.isValid) {
      return;
    }

    const payload = this.buildFullPayload();
    this.dataService.verify_EOS_payment(payload).subscribe({
      next: (res) => {
        notify('Verified Successfully', 'success', 2000);
        this.popupVisible = false;
        this.getEosPaymentList();
      },
      error: (err) => {
        notify('Verification Failed', 'error', 2000);
      },
    });
  }

  onApprove(e: any) {
    const res = validationEngine.validateGroup('eosForm');
    if (res && !res.isValid) {
      return;
    }

    const payload = this.buildFullPayload();
    this.dataService.approve_EOS_payment(payload).subscribe({
      next: (res) => {
        notify('Approved Successfully', 'success', 2000);
        this.popupVisible = false;
        this.getEosPaymentList();
      },
      error: (err) => {
        notify('Approval Failed', 'error', 2000);
      },
    });
  }

  handleClose() {
    this.popupVisible = false;
    this.resetForm();
  }

  resetForm() {
    this.eosFormData = {
      ID: null,
      VoucherNo: '',
      Date: new Date(),
      EmployeeId: null,
      EmployeeCode: '',
      EmployeeName: '',
      Reason: '',
      DocNo: '',
      JoinDate: null,
      LastWorkingDay: null,
      Days: 0,
      TotalServiceDays: 0,
      UnPaidLeave: 0,
      PendingSalary: 0,
      EOSAmount: 0,
      UnPaidLeaveSalary: 0,
      Additions: 0,
      Deductions: 0,
      NetAmount: 0,
      Remarks: '',
      Remarks2: '',
      PAY_TYPE_ID: 1,
      PAY_HEAD_ID: '',
      ChequeNo: '',
      DueDate: null,
      Narration: '',
      Status: 'Open',
    };
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    DxTextAreaModule,
    ReactiveFormsModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxRadioGroupModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [EosPaymentListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EosPaymentListModule {}
