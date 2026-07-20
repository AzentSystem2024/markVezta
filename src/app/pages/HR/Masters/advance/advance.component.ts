import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { CommonModule } from '@angular/common';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.scss'],
})
export class AdvanceComponent {
  // 1. VIEW CHILDS
  // ==========================================
  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup!: DxValidationGroupComponent;

  @ViewChild('editValidationGroup', { static: false })
  editValidationGroup!: DxValidationGroupComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  // 2. STATE & TOGGLES
  // ==========================================
  isLoading: boolean = true;
  isAddPopUp: boolean = false;
  isEditPopUp: boolean = false;
  isCustomDatePopupVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened: boolean = false;
  isEditReadOnly: boolean = false;
  initialLoad: boolean = true;
  isFormSubmitted: boolean = false;
  approveValue: boolean = false;

  // 3. PERMISSIONS
  // ==========================================
  canAdd: boolean = false;
  canEdit: boolean = false;
  canView: boolean = false;
  canDelete: boolean = false;
  canApprove: boolean = false;
  canVerify: boolean = false;
  canPrint: boolean = false;

  // 4. GLOBAL & SESSION INFO
  // ==========================================
  selected_Company_id: any;
  selected_fin_id: any;
  companyId: any;
  docNo: any;

  // 5. GRID SETTINGS & DATA
  // ==========================================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector: boolean = true;
  buttonText: string = 'Update';

  Advance_Options: any[] = [];
  filterddata: any[] = [];
  selected_Data: any = {};

  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedRange: string = 'select';
  fromDate: string | number | Date = new Date();
  toDate: string | number | Date = new Date();

  getStatusFilterData = [
    { text: 'Approved', value: 'Approved' },
    { text: 'Open', value: 'Open' },
    { text: 'Verified', value: 'Verified' },
  ];

  // 6. FORM & DROPDOWN VARIABLES
  // ==========================================
  formSource!: FormGroup;
  minDate!: Date;
  minDateUpdate!: Date;

  EMPLOYEE_VALUE: any[] = [];
  ADVANCETYPE_VALUE: any[] = [];
  payment_Detilas: any[] = [];

  paymentModes = [
    { value: '13', label: 'Cash' },
    { value: '14', label: 'Bank' },
  ];
  selectedPaymentMode: string = '13';
  selected_pay_type_id: any;

  // Variables bound to Edit/Update Form
  id: any;
  emp_id: any;
  employee_ID: any;
  date_value: any;
  adv_no_value: any;
  adv_type_id_value: any;
  adv_type_name: any;
  Advance_Amount_value: any;
  reco_Amount_value: any;
  reco_install_Amount_value: any;
  reco_inst_count_value: any;
  reco_stat_month: any;
  recoverd_Amt_value: any;
  remark_value: any;
  Payment_Head: any;
  selectTransId: any;
  selected_Cheque_No: any;
  selected_Cheque_Date: any;
  Recovery_Date: any;

  // 7. GRID ACTION BUTTON CONFIGURATIONS
  // ==========================================
  addButtonOptions = {
    text: 'New',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.add_pop());
    },
    elementAttr: { class: 'add-button' },
    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify" data-icon="formkit:add" data-width="20" data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `;
    },
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

  allButtons = [
    {
      name: 'edit',
      onClick: (e: any) => this.onEditStart(e),
      visible: (e: any) => {
        return this.canEdit && e.row.data.STATUS === 'Open';
      },
    },
    {
      name: 'delete',
      visible: (e: any) => {
        const status = e.row.data.STATUS;
        return (
          this.canDelete &&
          (e.row.data.STATUS == 'Open' ||
            (status === 'Verified' && this.canApprove))
        );
      },
    },
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e: any) => this.onVerifyClick(e),
      visible: (e: any) => {
        return this.canVerify && e.row.data.STATUS === 'Open';
      },
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
      visible: (e: any) => {
        return (
          this.canApprove &&
          (e.row.data.STATUS === 'Verified' ||
            (this.canVerify ? false : e.row.data.STATUS === 'Open'))
        );
      },
    },
    {
      hint: 'View',
      icon: 'check',
      text: 'View',
      onClick: (e: any) => this.onViewClick(e),
      visible: (e: any) =>
        this.canView &&
        (e.row.data.STATUS === 'Approved' ||
          (e.row.data.STATUS === 'Verified' && !this.canApprove)),
    },
  ];

  Advance_types_ID: any;

  // 8. CONSTRUCTOR & LIFECYCLE HOOKS
  // ==========================================
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.formSource = this.fb.group({
      Id: [null],
      employee_ID: [''],
      Advance_types_ID: [''],
      Amount: [''],
      Date: [new Date()],
      Net_Amount_recoverd: [''],
      Recovery_Date: [''],
      No_installments: [''],
      installmen_amt: [''],
      Remarks: [''],
    });

    this.sesstion_Details();
    this.setupInstallmentCalculation();
    this.get_Employee_dropdown();
    this.get_advanceType_dropdown();
    this.get_advance_list();
    this.getDocNo();
  }

  ngOnInit() {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyId = menuResponse?.SELECTED_COMPANY?.COMPANY_ID;
    const menuGroups = menuResponse?.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }

    this.get_Employee_dropdown();
    this.get_advance_list();
  }

  // 9. DATA FETCHING METHODS
  // ==========================================
  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
    this.selected_fin_id = sessionData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 28,
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  get_Employee_dropdown() {
    const payload = { COMPANY_ID: this.companyId, NAME: 'EMPLOYEE' };
    this.dataService
      .Dropdown_advance_employee(payload)
      .subscribe((res: any) => {
        this.EMPLOYEE_VALUE = res;
      });
  }

  get_advanceType_dropdown() {
    this.dataService.Dropdown_AdvanceTypes('name').subscribe((res: any) => {
      this.ADVANCETYPE_VALUE = res;
    });
  }

  get_advance_list(filterBy: string = 'all') {
    this.isLoading = true;
    const payload = { COMPANY_ID: this.selected_Company_id, FILTER: filterBy };

    this.dataService.Get_Api_advance(payload).subscribe((res: any) => {
      let data = res.data || [];

      if (this.initialLoad) {
        this.Advance_Options = data
          .reverse()
          .map((item: any, index: number) => ({
            ...item,
            serialNo: index + 1,
          }));
        this.initialLoad = false;
        this.isLoading = false;
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let startDate: Date;
      let endDate: Date = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      switch (filterBy) {
        case 'today':
          startDate = new Date(today);
          break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'custom':
          startDate = new Date(this.fromDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(this.toDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          this.Advance_Options = data
            .reverse()
            .map((item: any, index: number) => ({
              ...item,
              serialNo: index + 1,
            }));
          this.isLoading = false;
          return;
      }

      this.filterddata = data.filter((item: any) => {
        const itemDate = this.parseApiDate(item.DATE);
        if (!itemDate) return false;
        return itemDate >= startDate && itemDate <= endDate;
      });

      this.Advance_Options = this.filterddata
        .reverse()
        .map((item: any, index: number) => ({
          ...item,
          serialNo: index + 1,
        }));

      this.isLoading = false;
    });
  }

  ledgerlist() {
    this.dataService.listledgerlist().subscribe((res: any) => {
      const filterdledgerlist = res.Data || [];
      this.payment_Detilas = filterdledgerlist.filter(
        (item: any) => item.GROUP_ID == this.selectedPaymentMode,
      );
    });
  }

  loadAdvanceDetails(id: any) {
    this.dataService.select_Advance(id).subscribe((res: any) => {
      this.selected_Data = res;

      this.id = this.selected_Data.ID;
      this.Advance_Amount_value = this.selected_Data.ADVANCE_AMOUNT;
      this.adv_no_value = this.selected_Data.ADV_NO;
      this.adv_type_id_value = this.selected_Data.ADV_TYPE_ID;
      this.adv_type_name = this.selected_Data.ADV_TYPE_NAME;
      this.date_value = this.selected_Data.DATE;
      this.Payment_Head = this.selected_Data.PAY_HEAD_ID;
      this.selectTransId = this.selected_Data.TRANS_ID;
      this.selected_Cheque_No = this.selected_Data.CHEQUE_NO;
      this.selected_Cheque_Date = this.selected_Data.CHEQUE_DATE;
      this.selected_pay_type_id = this.selected_Data.PAY_TYPE_ID;

      if (this.selected_pay_type_id === 0 || this.selected_pay_type_id === 1) {
        this.selectedPaymentMode = '13'; // Cash
      } else {
        this.selectedPaymentMode = '14'; // Bank
      }

      this.emp_id = this.selected_Data.EMP_ID;
      this.reco_Amount_value = this.selected_Data.REC_AMOUNT;
      this.reco_install_Amount_value = this.selected_Data.REC_INSTALL_AMOUNT;
      this.reco_inst_count_value = this.selected_Data.REC_INSTALL_COUNT;
      this.reco_stat_month = this.selected_Data.REC_START_MONTH;
      this.remark_value = this.selected_Data.REMARKS;
      this.approveValue = this.selected_Data.STATUS === 'Approved';
      this.recoverd_Amt_value = this.selected_Data.RECOVERED_AMOUNT;

      this.ledgerlist();
      this.cdr.detectChanges();
    });
  }

  // 10. EVENT HANDLERS & ACTIONS
  // ==========================================
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.get_advance_list();
    }
  }

  refreshData() {
    this.dataGrid.instance.refresh();
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onDateRangeChange(event: any) {
    const selected = event.value;
    if (selected === 'custom') {
      this.isCustomDatePopupVisible = true;
    } else {
      this.get_advance_list(selected);
    }
  }

  applyCustomDate() {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both From and To dates.');
      return;
    }
    if (new Date(this.fromDate) > new Date(this.toDate)) {
      alert('From Date cannot be after To Date.');
      return;
    }
    this.isCustomDatePopupVisible = false;
    this.get_advance_list('custom');
  }

  resetFilter() {
    this.initialLoad = true;
    this.selectedRange = 'all';
    this.get_advance_list();
  }

  onPaymentModeChanged(e: any) {
    const value = e.value;
    if (this.selected_pay_type_id === 0) {
      this.selectedPaymentMode = value;
    } else {
      this.selected_pay_type_id = value;
    }
  }

  paymentModesValue(event: any) {
    this.ledgerlist();
  }

  onEmployee_Change(event: any) {
    this.emp_id = event.value;
  }

  onAdvance_type_Change(event: any) {
    this.adv_type_id_value = event.value;
  }

  onAmountInput(e: any) {
    const amount = e.value;
    this.formSource.get('Net_Amount_recoverd')?.setValue(amount);
  }

  onRecoveryDateChanged(event: any): void {
    if (event?.value) {
      const selected = new Date(event.value);
      const normalizedDate = new Date(
        Date.UTC(selected.getFullYear(), selected.getMonth(), 1),
      );
      this.Recovery_Date = normalizedDate;
      this.formSource.get('Recovery_Date')?.setValue(normalizedDate);
    }
  }

  onDateValueChanged(e: any): void {
    this.date_value = e.value;
    if (this.date_value) {
      const d = new Date(this.date_value);
      this.minDateUpdate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
  }

  // 11. GRID FORMATTING & HELPERS
  // ==========================================
  parseApiDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = 2000 + parseInt(parts[2], 10);
      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  }

  getAdvanceTypeName(id: any): string {
    const item = this.ADVANCETYPE_VALUE.find((x) => x.ID === id);
    return item ? item.DESCRIPTION : this.adv_type_name || 'Unknown Type';
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
    icon.title = status;
    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';
    cellElement.appendChild(icon);
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open';
      case 'Verified':
        return 'flag-verified';
      case 'Approved':
        return 'flag-approved';
      default:
        return '';
    }
  }

  // 12. CALCULATIONS
  // ==========================================
  setupInstallmentCalculation() {
    this.formSource.get('Net_Amount_recoverd')?.valueChanges.subscribe(() => {
      this.calculateInstallmentAmount();
    });
    this.formSource.get('No_installments')?.valueChanges.subscribe(() => {
      this.calculateInstallmentAmount();
    });
  }

  calculateInstallmentAmount() {
    const netAmt = this.formSource.get('Net_Amount_recoverd')?.value || 0;
    const installments = this.formSource.get('No_installments')?.value || 0;
    if (installments > 0) {
      const installmentAmt = netAmt / installments;
      this.formSource
        .get('installmen_amt')
        ?.setValue(installmentAmt, { emitEvent: false });
    } else {
      this.formSource.get('installmen_amt')?.setValue(0, { emitEvent: false });
    }
  }

  onNetAmountUpdateChange(): void {
    this.calculateInstallmentAmountUpdate();
  }

  onInstallmentCountChange(): void {
    this.calculateInstallmentAmountUpdate();
  }

  calculateInstallmentAmountUpdate(): void {
    if (this.reco_inst_count_value && this.reco_Amount_value) {
      this.reco_install_Amount_value = parseFloat(
        (this.reco_Amount_value / this.reco_inst_count_value).toFixed(2),
      );
    } else {
      this.reco_install_Amount_value = 0;
    }
  }

  // 13. POPUP MODALS
  // ==========================================
  add_pop() {
    this.isAddPopUp = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  close() {
    this.isAddPopUp = false;
    this.isEditPopUp = false;
    this.isFormSubmitted = false;
    this.formSource.reset({
      Recovery_Date: '',
      Date: new Date(),
      emp_id: 0,
      adv_type_id: 0,
    });
    this.reco_Amount_value = 0;
    this.reco_stat_month = ' ';
    this.employee_ID = 0;
    this.emp_id = 0;
  }

  closeButton() {
    this.formSource.reset({
      Date: new Date(),
      Recovery_Date: '',
    });
  }

  onEditStart(e: any) {
    this.buttonText = 'Update';
    this.isEditPopUp = true;
    this.isEditReadOnly = false;
    this.loadAdvanceDetails(e.data.TRANS_ID);
  }

  onViewClick = (e: any) => {
    e.cancel = true;
    this.isEditReadOnly = true;
    this.buttonText = 'View';
    this.isEditPopUp = true;
    this.loadAdvanceDetails(e.row.data.TRANS_ID);
  };

  onApproveClick = (e: any) => {
    e.cancel = true;
    this.approveValue = true;
    this.isEditPopUp = true;
    this.isEditReadOnly = false;
    this.buttonText = 'Approve';
    this.loadAdvanceDetails(e.row.data.TRANS_ID);
  };

  onVerifyClick = (e: any) => {
    e.cancel = true;
    this.isEditPopUp = true;

    const status = e.row.data.STATUS;
    if (status === 'Verified') {
      this.buttonText = 'Approve';
      this.isEditReadOnly = false;
    } else if (status === 'Open') {
      this.buttonText = 'Verify';
      this.isEditReadOnly = false;
    } else {
      this.isEditReadOnly = true;
      this.buttonText = 'View';
    }
    this.loadAdvanceDetails(e.row.data.TRANS_ID);
  };

  // 14. CRUD OPERATIONS
  // ==========================================
  Add_Advace() {
    const formVals = this.formSource.value;
    const emp_id = formVals.employee_ID;
    const date = formVals.Date;
    const adv_type_id = formVals.Advance_types_ID;
    const advance_Amount = formVals.Amount;
    const rec_amount = formVals.Net_Amount_recoverd;
    const rec_start_month = formVals.Recovery_Date
      ? formVals.Recovery_Date
      : null;
    const rec_install_count = formVals.No_installments
      ? formVals.No_installments
      : null;
    const rec_install_amount = formVals.installmen_amt;
    const remarks = formVals.Remarks;
    const company_id = this.selected_Company_id;
    const fin_id = this.selected_fin_id;

    this.dataService
      .Api_Add_advance(
        emp_id,
        date,
        adv_type_id,
        advance_Amount,
        rec_amount,
        rec_start_month,
        rec_install_count,
        rec_install_amount,
        remarks,
        company_id,
        fin_id,
      )
      .subscribe((res: any) => {
        notify(
          {
            message: 'Advance added successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.get_advance_list();
        this.isAddPopUp = false;
        this.formSource.reset({ Date: new Date() });
      });
  }

  Update_advance() {
    this.isFormSubmitted = true;

    this.selected_pay_type_id =
      this.selectedPaymentMode === '13'
        ? 1
        : this.selectedPaymentMode === '14'
          ? 2
          : this.selected_pay_type_id;

    if (
      !this.date_value ||
      !this.emp_id ||
      !this.adv_type_id_value ||
      !this.Advance_Amount_value ||
      !this.Payment_Head
    ) {
      this.editValidationGroup?.instance?.validate(); // trigger UI highlights
      notify(
        {
          message: 'Please fill all the required fields.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      this.isEditPopUp = true;
      return;
    }

    if (this.buttonText === 'Update') {
      this.dataService
        .Api_Update_advance(
          this.id,
          this.emp_id,
          this.date_value,
          this.adv_type_id_value,
          this.Advance_Amount_value,
          this.reco_Amount_value,
          this.reco_stat_month,
          this.reco_inst_count_value,
          this.reco_install_Amount_value,
          this.remark_value,
          this.Payment_Head,
          this.selectTransId,
          this.selected_Cheque_No,
          this.selected_Cheque_Date,
          this.selected_pay_type_id,
        )
        .subscribe((res: any) => {
          notify(
            {
              message: 'Advance updated successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.isEditPopUp = false;
          this.get_advance_list();
        });
    } else if (this.buttonText === 'Verify') {
      this.dataService
        .Api_Verify_advance(
          this.id,
          this.emp_id,
          this.date_value,
          this.adv_type_id_value,
          this.Advance_Amount_value,
          this.reco_Amount_value,
          this.reco_stat_month,
          this.reco_inst_count_value,
          this.reco_install_Amount_value,
          this.remark_value,
          this.Payment_Head,
          this.selectTransId,
          this.selected_Cheque_No,
          this.selected_Cheque_Date,
          this.selected_pay_type_id,
        )
        .subscribe((res: any) => {
          notify(
            {
              message: 'Advance verified successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.isEditPopUp = false;
          this.get_advance_list();
        });
    } else if (this.buttonText === 'Approve') {
      confirm(
        'It will approve and commit. Are you sure?',
        'Confirm Approve',
      ).then((result) => {
        if (result) {
          this.dataService
            .Api_Approve_advance(
              this.id,
              this.emp_id,
              this.date_value,
              this.adv_type_id_value,
              this.Advance_Amount_value,
              this.reco_Amount_value,
              this.reco_stat_month,
              this.reco_inst_count_value,
              this.reco_install_Amount_value,
              this.remark_value,
              this.Payment_Head,
              this.selectTransId,
              this.selected_Cheque_No,
              this.selected_Cheque_Date,
              this.selected_pay_type_id,
            )
            .subscribe((res: any) => {
              notify(
                {
                  message: 'Advance approved successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success',
              );
              this.isEditPopUp = false;
              this.get_advance_list();
            });
        }
      });
    }
  }

  deleteData(event: any) {
    const id = event.data.ID;
    confirm(
      'Are you sure you want to delete this record?',
      'Confirm Delete',
    ).then((result) => {
      if (result) {
        this.dataService.Api_Delete_advance(id).subscribe((res: any) => {
          notify(
            {
              message: 'Advance Deleted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.get_advance_list();
          this.isLoading = false;
        });
      }
    });
  }
}

// MODULE DEFINITION
// ==========================================
@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    FormPopupModule,
    FormTextboxModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxValidatorModule,
    CommonModule,
    DxRadioGroupModule,
  ],
  declarations: [AdvanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvanceModule {}
