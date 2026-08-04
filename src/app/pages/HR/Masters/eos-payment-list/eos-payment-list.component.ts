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
import { ExportService } from 'src/app/services/export.service';

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


  onExporting(event: any) {
    this.exportService.onExporting(event, 'EOS Payment');
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
    DOC_STATUS: 0,
    DOC_NO: '',
    VOUCHER_NO: '',
    DOC_DATE: new Date(),
    EMP_ID: null,
    EMP_CODE: '',
    EMP_NAME: '',
    REASON_ID: '',
    DOJ: null,
    EOS_DATE: null,
    WORKED_DAYS: 0,
    TOTAL_SERVICE_DAYS: 0,
    UNPAID_LEAVE: 0,
    PENDING_SALARY: 0,
    EOS_AMOUNT: 0,
    LEAVE_AMOUNT: 0,
    ADD_AMOUNT: 0,
    DED_AMOUNT: 0,
    NET_AMOUNT: 0,
    REMARKS: '',
    ADD_REMARKS: '',
    DED_REMARKS: '',
    PAY_TYPE_ID: 1,
    PAY_HEAD_ID: null,
    CHEQUE_NO: '',
    CHEQUE_DATE: new Date(),
    NARRATION: '',
    STATUS: 'Open',
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
    private exportService: ExportService,
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

    this.loadAllDropdowns();
    this.getEosPaymentList();
  }

  loadAllDropdowns() {
    this.EmployeeListDropDown();
    this.get_reson_dropdown();
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
        this.onReceiptModeChange({ value: this.eosFormData.PAY_TYPE_ID });
      },
      error: () => { },
    });
  }

  onReceiptModeChange(e: any) {
    this.eosFormData.PAY_TYPE_ID = Number(e.value);

    if (this.eosFormData.PAY_TYPE_ID === 1) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => Number(item.GROUP_ID) === 13,
      );
    } else if (this.eosFormData.PAY_TYPE_ID === 2) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => Number(item.GROUP_ID) === 14,
      );
    } else if (this.eosFormData.PAY_TYPE_ID === 4) {
      this.filteredLedgerList = this.ledgerList.filter(
        (item) => Number(item.GROUP_ID) !== 13 && Number(item.GROUP_ID) !== 14,
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
        notify('Failed to load reason dropdown', 'error', 2000);
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
    this.isLoading = true;
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'LEFT_EMP',
    };
    this.dataService.getEmployeeDropDown(payload).subscribe({
      next: (response: any) => {
        this.OriginalEmployeeDropdown = response || [];
        this.filterEmployeeDropdown();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        notify('Failed to load employee list', 'error', 2000);
        console.error('Failed to load employee dropdown', err);
      },
    });
  }

  filterEmployeeDropdown() {
    if (!this.OriginalEmployeeDropdown || !this.eosPaymentList) return;

    // Create a Set of Employee IDs that are already present in the main list
    const existingEmpIds = new Set(
      this.eosPaymentList.map((item: any) => item.EMP_ID || item.EmployeeId),
    );

    // Filter out employees already in the list, UNLESS they are the currently selected employee in the open popup
    this.EmployeeDropdown = this.OriginalEmployeeDropdown.filter(
      (emp: any) =>
        !existingEmpIds.has(emp.ID) || emp.ID === this.eosFormData.EMP_ID,
    );
  }

  mapApiResponseToFormData(res: any) {
    if (!res) return;

    // Exact mappings for the provided JSON structure
    if (res.DOC_STATUS !== undefined && res.DOC_STATUS !== null)
      this.eosFormData.DOC_STATUS = res.DOC_STATUS;
    if (res.EOS_ID !== undefined && res.EOS_ID !== null)
      this.eosFormData.EOS_ID = res.EOS_ID;

    this.eosFormData.EMP_CODE =
      res.EMP_CODE || res.EMP_NO || res.EmployeeCode || '';
    this.eosFormData.EMP_NAME = res.EMP_NAME || res.EmployeeName || '';
    this.eosFormData.REASON_ID = res.REASON_ID || res.Reason || '';

    this.eosFormData.DOJ = res.DOJ
      ? new Date(res.DOJ)
      : res.JOIN_DATE
        ? new Date(res.JOIN_DATE)
        : res.JoinDate
          ? new Date(res.JoinDate)
          : null;

    this.eosFormData.EOS_DATE = res.EOS_DATE
      ? new Date(res.EOS_DATE)
      : res.LAST_WORKING_DAY
        ? new Date(res.LAST_WORKING_DAY)
        : res.LastWorkingDay
          ? new Date(res.LastWorkingDay)
          : null;

    this.eosFormData.WORKED_DAYS = res.WORKED_DAYS || res.DAYS || res.Days || 0;
    this.eosFormData.TOTAL_SERVICE_DAYS =
      res.WORKED_DAYS || res.TOTAL_SERVICE_DAYS || res.TotalServiceDays || 0;
    this.eosFormData.UNPAID_LEAVE = res.UNPAID_LEAVE || res.UnPaidLeave || 0;

    this.eosFormData.PENDING_SALARY =
      res.PENDING_SALARY || res.PendingSalary || 0;
    this.eosFormData.EOS_AMOUNT = res.EOS_AMOUNT || res.EOSAmount || 0;
    this.eosFormData.LEAVE_AMOUNT =
      res.LEAVE_AMOUNT || res.UnPaidLeaveSalary || 0;
    this.eosFormData.ADD_AMOUNT = res.ADD_AMOUNT || res.Additions || 0;
    this.eosFormData.DED_AMOUNT = res.DED_AMOUNT || res.Deductions || 0;
    this.eosFormData.NET_AMOUNT = res.NET_AMOUNT || res.NetAmount || 0;

    this.eosFormData.REMARKS = res.REMARKS || res.Remarks || '';
    this.eosFormData.ADD_REMARKS = res.ADD_REMARKS || res.Remarks2 || '';
    this.eosFormData.DED_REMARKS = res.DED_REMARKS || '';

    this.eosFormData.DOC_NO = res.DOC_NO || this.eosFormData.DOC_NO || '';
    this.eosFormData.VOUCHER_NO =
      res.VOUCHER_NO || res.VoucherNo || this.eosFormData.VOUCHER_NO || '';

    if (res.PAY_TYPE_ID) {
      this.eosFormData.PAY_TYPE_ID = res.PAY_TYPE_ID;
      this.onReceiptModeChange({ value: this.eosFormData.PAY_TYPE_ID });
    }

    if (res.PAY_HEAD_ID)
      this.eosFormData.PAY_HEAD_ID = Number(res.PAY_HEAD_ID);

    if (res.CHEQUE_NO) this.eosFormData.CHEQUE_NO = res.CHEQUE_NO;

    if (res.CHEQUE_DATE)
      this.eosFormData.CHEQUE_DATE = new Date(res.CHEQUE_DATE);

    this.eosFormData.NARRATION = res.NARRATION || res.Narration || '';
  }

  onEmployeeSelectionChanged(e: any) {
    if (!e.value) return;

    // Prevent fetching if this change was triggered programmatically (e.g. from onEditingStart)
    if (!e.event) return;

    const payload = e.value;

    this.dataService.get_EOS_payment_details(payload).subscribe({
      next: (res: any) => {
        if (res) {
          this.mapApiResponseToFormData(res);
          if (res.DOC_DATE) this.eosFormData.DOC_DATE = new Date(res.DOC_DATE);
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
    this.loadAllDropdowns();
    this.popupVisible = true;
  }

  onEditingStart(e: any) {
    this.popupTitle = 'Edit EOS Payment';
    this.isReadOnlyMode = false;
    this.isApproveMode = false;
    this.isVerifyMode = false;

    const row = e.data;
    const empId = row.EMP_ID || row.EmployeeId;

    // Set core fields from the grid row
    this.eosFormData.ID = row.ID;
    this.eosFormData.DOC_NO = row.DOC_NO || '';
    this.eosFormData.VOUCHER_NO = row.VOUCHER_NO || row.VoucherNo || '';
    this.eosFormData.DOC_DATE = new Date();
    this.eosFormData.STATUS = row.STATUS || 'Open';
    this.eosFormData.EMP_ID = empId;

    // Fetch the details from API
    this.isLoading = true;
    this.dataService.get_EOS_payment_details(empId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res) {
          this.mapApiResponseToFormData(res);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        notify('Failed to fetch EOS payment data', 'error', 2000);
        console.error('Failed to fetch EOS payment data', err);
      },
    });

    this.loadAllDropdowns();
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

    // Call the select API using the employee ID to fetch the details is now handled inside onEditingStart
    // this.onEmployeeSelectionChanged({ value: data.EMP_ID || data.EmployeeId });

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
      (r: any) => r.ID === this.eosFormData.REASON_ID,
    );

    return {
      ID: this.eosFormData.ID || 0,
      DOC_STATUS: this.eosFormData.DOC_STATUS || 0,
      DOC_NO: this.eosFormData.DOC_NO || '',
      VOUCHER_NO: this.eosFormData.VOUCHER_NO || '',
      EOS_DATE: this.eosFormData.EOS_DATE
        ? new Date(this.eosFormData.EOS_DATE).toISOString()
        : new Date().toISOString(),
      EOS_ID: this.eosFormData.EOS_ID || 0,
      EMP_ID: this.eosFormData.EMP_ID || 0,
      REASON: selectedReason ? selectedReason.DESCRIPTION : '',
      REASON_ID: this.eosFormData.REASON_ID || 0,
      COMPANY_ID: this.selectedCompanyId || 0,
      EMP_NO: this.eosFormData.EMP_CODE || '',
      EMP_CODE: this.eosFormData.EMP_CODE || '',
      EMP_NAME: this.eosFormData.EMP_NAME || '',
      WORKED_DAYS: this.eosFormData.WORKED_DAYS || 0,
      DOJ: this.eosFormData.DOJ
        ? new Date(this.eosFormData.DOJ).toISOString()
        : new Date().toISOString(),
      EOS_AMOUNT: this.eosFormData.EOS_AMOUNT || 0,
      PENDING_SALARY: this.eosFormData.PENDING_SALARY || 0,
      LEAVE_AMOUNT: this.eosFormData.LEAVE_AMOUNT || 0,
      ADD_AMOUNT: this.eosFormData.ADD_AMOUNT || 0,
      DED_AMOUNT: this.eosFormData.DED_AMOUNT || 0,
      ADD_REMARKS: this.eosFormData.ADD_REMARKS || '',
      DED_REMARKS: this.eosFormData.DED_REMARKS || '',
      NET_AMOUNT: this.eosFormData.NET_AMOUNT || 0,
      REMARKS: this.eosFormData.REMARKS || '',
      STATUS: this.eosFormData.STATUS || '',
      PAY_HEAD_ID: this.eosFormData.PAY_HEAD_ID || null,
      PAY_TYPE_ID: this.eosFormData.PAY_TYPE_ID || null,
      NARRATION: this.eosFormData.NARRATION || '',
      CHEQUE_NO: this.eosFormData.CHEQUE_NO || '',
      CHEQUE_DATE: this.eosFormData.CHEQUE_DATE
        ? new Date(this.eosFormData.CHEQUE_DATE).toISOString()
        : new Date().toISOString(),
    };
  }

  onSave(e: any) {
    const res = validationEngine.validateGroup('eosForm');
    if (res && !res.isValid) {
      return;
    }

    console.log('testinggggggg');

    const payload = this.buildFullPayload();

    console.log('payload', payload);

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
      DOC_STATUS: 0,
      DOC_NO: '',
      VOUCHER_NO: '',
      DOC_DATE: new Date(),
      EMP_ID: null,
      EMP_CODE: '',
      EMP_NAME: '',
      REASON_ID: '',
      DOJ: null,
      EOS_DATE: null,
      WORKED_DAYS: 0,
      TOTAL_SERVICE_DAYS: 0,
      UNPAID_LEAVE: 0,
      PENDING_SALARY: 0,
      EOS_AMOUNT: 0,
      LEAVE_AMOUNT: 0,
      ADD_AMOUNT: 0,
      DED_AMOUNT: 0,
      NET_AMOUNT: 0,
      REMARKS: '',
      ADD_REMARKS: '',
      DED_REMARKS: '',
      PAY_TYPE_ID: 1,
      PAY_HEAD_ID: null,
      CHEQUE_NO: '',
      CHEQUE_DATE: new Date(),
      NARRATION: '',
      STATUS: 'Open',
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
export class EosPaymentListModule { }
