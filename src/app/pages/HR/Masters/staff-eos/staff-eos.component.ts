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
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-staff-eos',
  templateUrl: './staff-eos.component.html',
  styleUrls: ['./staff-eos.component.scss'],
})
export class StaffEOSComponent {
  // VIEW CHILD & UI COMPONENTS
  // ==========================================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  // STATE FLAGS
  // ==========================================
  isLoading: boolean = false;
  initialLoad: boolean = true;
  isAddPopUp: boolean = false;
  editpopup: boolean = false;
  isviewpopup: boolean = false;
  verifypopup: boolean = false;
  Approvepopup: boolean = false;
  isCustomDatePopupVisible: boolean = false;
  isFilterVisible: boolean = false;
  formSubmitted: boolean = false;
  isFormSubmitted: boolean = false;

  // PERMISSIONS
  // ==========================================
  canAdd: boolean = false;
  canEdit: boolean = false;
  canView: boolean = false;
  canDelete: boolean = false;
  canApprove: boolean = false;
  canPrint: boolean = false;
  canVerify: boolean = false;

  // SESSION & CONFIG
  // ==========================================
  selected_Company_id: any;
  selected_fin_id: any;
  UserId_value: any;
  store_id_value: any;

  // DATA SOURCES
  // ==========================================
  staffEosSource: any = [];
  allStaffEosData: any[] = [];
  filterddata: any;
  reson_data: any;
  EMPLOYEE_ID: any;
  get_Details_Data: any = [];
  payment_Detilas: any = [];

  // FORM & SELECTION VARIABLES
  // ==========================================
  formSource!: FormGroup;
  selected_data: any = [];

  // Specific Form Fields
  id_value: any;
  doc_no_value: any;
  date_value: string | null = null;
  employee_value: any;
  employee_ID: any;
  reason_ID: any;
  reason_id_value: any;
  remarks_value: any;

  // Working Days & Dates
  join_date_value: any;
  days_worked_value: any;
  all_workingdays: any = '0';
  less_service_days: number = 0;

  // Salary/Amounts
  eos_Amount_value: any;
  leave_Amount: any;
  pending_salary: any;
  Add_Amount: any;
  ded_Remarks: any;
  Add_Remarks: any;
  trans_id: any;

  // GRID CONFIGURATION
  // ==========================================
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
      this.onDateRangeChange(e);
    },
  };
  fromDate: string | number | Date = new Date();
  toDate: string | number | Date = new Date();

  getStatusFilterData = [
    { text: 'Approved', value: 'Approved' },
    { text: 'Open', value: 'Open' },
    { text: 'Verified', value: 'Verified' },
  ];

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.add_popup());
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
    onClick: () => this.refreshGrid(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
      visible: (e: any) => this.canEdit && e.row.data.STATUS !== 'Verified',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      visible: (e: any) =>
        this.canDelete && e.row.data.STATUS !== 'Left Service',
    },
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e: any) => {
        setTimeout(() => this.onVerifyClick(e));
      },
      visible: (e: any) =>
        this.canApprove &&
        e.row.data.STATUS !== 'Left Service' &&
        e.row.data.STATUS !== 'Verified',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => {
        setTimeout(() => this.onApproveClick(e));
      },
      visible: (e: any) => this.canApprove && e.row.data.STATUS === 'Verified',
    },
  ];
  isFilterOpened: boolean = false;

  // CONSTRUCTOR
  // ==========================================
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private exportService: ExportService,
  ) {
    this.formSource = this.fb.group({
      id: [null],
      Date: [new Date()],
      employee_ID: [''],
      Join_Date: [''],
      days_Worked: [''],
      reason_ID: [''],
      RELIEVING_DATE: [new Date()],
      Remarks: [''],
    });
    this.get_reson_dropdown();
    this.sesstion_Details();
    this.getStaffEosData();
    this.dropdown_employee();
  }

  // LIFECYCLE HOOKS
  // ==========================================
  ngOnInit() {
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
      this.canPrint = packingRights.CanEdit; // Note: was mapped to CanEdit originally
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
  }

  // INITIALIZATION & SESSION
  // ==========================================
  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
    this.selected_fin_id = sessionData.FINANCIAL_YEARS?.[0]?.FIN_ID;
  }

  get_reson_dropdown() {
    this.isLoading = true;
    this.dataService.Dropdown_EOS_reason(name).subscribe({
      next: (res: any) => {
        this.reson_data = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  dropdown_employee() {
    this.isLoading = true;
    const payload = {
      NAME: 'EMPLOYEE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Dropdown_eos_employee(payload).subscribe({
      next: (res: any) => {
        this.EMPLOYEE_ID = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // DATA GRID & FILTERING
  // ==========================================
  refreshGrid() {
    this.dataGrid.instance.refresh();
    this.getStaffEosData();
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
    this.exportService.onExporting(event, 'Employee EOS');
  }

  getStaffEosData() {
    this.isLoading = true;
    this.dataService.get_Staff_EOS_List().subscribe({
      next: (res: any) => {
        this.allStaffEosData = res.data || [];
        this.filterData(this.selectedRange);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  filterData(filterBy: string = 'all') {
    const data = this.allStaffEosData;

    // On first load or when 'all' is selected, show all data without filtering
    if (filterBy === 'all' || this.initialLoad) {
      this.staffEosSource = data
        .slice()
        .reverse()
        .map((item: any, index: number) => ({
          ...item,
          serialNo: index + 1,
        }));
      this.initialLoad = false;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let startDate: Date;
    let endDate: Date = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (filterBy) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
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
        startDate = new Date(0);
        break;
    }

    // Filter data based on date range
    this.filterddata = data.filter((item: any) => {
      const itemDate = this.parseApiDate(item.DATE);
      if (!itemDate) return false;
      return itemDate >= startDate && itemDate <= endDate;
    });

    // Add serial numbers
    this.staffEosSource = this.filterddata
      .slice()
      .reverse()
      .map((item: any, index: number) => ({
        ...item,
        serialNo: index + 1,
      }));
  }

  resetFilter() {
    this.initialLoad = true;
    this.selectedRange = 'all';
    this.dateRangeOptions = { ...this.dateRangeOptions, value: 'all' };
    this.getStaffEosData();
  }

  onDateRangeChange(event: any) {
    const selected = event.value;
    if (selected === 'custom') {
      this.isCustomDatePopupVisible = true;
    } else {
      this.filterData(selected);
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
    this.filterData('custom');
  }

  toggle() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  // UTILITIES & RENDERERS
  // ==========================================
  parseApiDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(parts[2], 10);

      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open'; // White or gray
      case 'Verified':
        return 'flag-verified'; // Orange
      case 'Left Service':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  calculateWorkingDays(event: any) {
    const joinDate = this.parseApiDate(this.join_date_value);
    const today = event.value;
    if (joinDate) {
      const timeDiff = today.getTime() - joinDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
      this.days_worked_value = dayDiff + 1;
      this.all_workingdays = this.days_worked_value - this.less_service_days;
      this.cdRef.detectChanges();
    } else {
      this.days_worked_value = 0;
    }
  }

  calculateWorkingDaysEdit(event: any) {
    const joinDate = this.parseApiDate(this.join_date_value);
    const today = new Date(event.value);
    if (joinDate) {
      const timeDiff = today.getTime() - joinDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
      this.days_worked_value = dayDiff + 1;
      this.all_workingdays = this.days_worked_value - this.less_service_days;
      this.cdRef.detectChanges();
    } else {
      this.days_worked_value = 0;
    }
  }

  // POPUP CONTROLS
  // ==========================================
  add_popup() {
    this.join_date_value = '';
    this.days_worked_value = '';
    this.all_workingdays = '';
    this.isAddPopUp = true;
    this.selected_data.EOS_DATE = new Date();
    this.selected_data.RELIEVING_DATE = new Date();
    this.get_employes_details_value();
  }

  close() {
    this.isAddPopUp = false;
    this.isviewpopup = false;
    this.editpopup = false;
    this.verifypopup = false;
    this.Approvepopup = false;
    this.isCustomDatePopupVisible = false;
    this.isFormSubmitted = false;
    this.formSubmitted = false;
  }

  closeButton() {
    this.formSource.reset({
      Date: new Date(),
      employee_ID: 0,
      reason_ID: 0,
    });
    this.reason_ID = 0;
  }

  // DATA SELECTION & DETAILS
  // ==========================================
  select_Data_EOS(event: any) {
    const id = event.data.ID;
    this.isLoading = true;
    this.dataService.select_Api_eos(id).subscribe({
      next: (res: any) => {
        this.selected_data = res;
        this.id_value = this.selected_data.ID;
        this.UserId_value = this.selected_data.USER_ID;
        this.store_id_value = this.selected_data.STORE_ID;
        this.doc_no_value = this.selected_data.DOC_NO;
        this.date_value = this.selected_data.EOS_DATE;
        this.employee_value = this.selected_data.EMP_ID;
        this.reason_id_value = this.selected_data.REASON_ID;
        this.remarks_value = this.selected_data.REMARKS;
        this.eos_Amount_value = this.selected_data.EOS_AMOUNT;
        this.leave_Amount = this.selected_data.LEAVE_AMOUNT;
        this.pending_salary = this.selected_data.PENDING_SALARY;
        this.Add_Amount = this.selected_data.ADD_AMOUNT;
        this.Add_Amount = this.selected_data.DED_AMOUNT;
        this.Add_Remarks = this.selected_data.ADD_REMARKS;
        this.ded_Remarks = this.selected_data.DED_REMARKS;
        this.trans_id = this.selected_data.TRANS_ID;
        this.all_workingdays = this.selected_data.DAYS;
        this.payment_functionality();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  onEmployee_Change(event: any) {
    this.employee_ID = event.value;
    this.get_employes_details_value();
    this.employee_value = event.value;
  }

  onReason_Change(event: any) {
    this.reason_id_value = event.value;
  }

  get_employes_details_value() {
    const id = this.employee_ID;
    if (!id) return;
    this.isLoading = true;
    this.dataService.get_employeeDetails(id).subscribe({
      next: (res: any) => {
        this.get_Details_Data = res;
        this.less_service_days = res.LESS_SERVICE_DAYS;
        this.join_date_value = this.get_Details_Data.JOIN_DATE;
        // Convert join date string to Date object
        const joinDate: Date | null = this.parseApiDate(res.JOIN_DATE);
        const today = new Date(
          this.selected_data.RELIEVING_DATE
            ? this.selected_data.RELIEVING_DATE
            : this.selected_data.EOS_DATE,
        );
        if (joinDate) {
          const timeDiff = today.getTime() - joinDate.getTime();
          const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
          this.days_worked_value = dayDiff + 1;
          this.all_workingdays =
            this.days_worked_value - this.less_service_days;
          this.cdRef.detectChanges();
        } else {
          this.days_worked_value = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  get_employes_details_value_select() {
    const id = this.selected_data.EMP_ID;
    if (!id) return;
    this.isLoading = true;
    this.dataService.get_employeeDetails(id).subscribe({
      next: (res: any) => {
        this.get_Details_Data = res;
        this.less_service_days = res.LESS_SERVICE_DAYS;
        this.join_date_value = this.get_Details_Data.JOIN_DATE;
        // Convert join date string to Date object
        const joinDate: Date | null = this.parseApiDate(res.JOIN_DATE);
        const today = this.selected_data.RELIEVING_DATE;
        if (joinDate) {
          const timeDiff = today.getTime() - joinDate.getTime();
          const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
          this.days_worked_value = dayDiff + 1;
          this.all_workingdays =
            this.days_worked_value - this.less_service_days;
          this.cdRef.detectChanges();
        } else {
          this.days_worked_value = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  payment_functionality() {
    const id = this.trans_id;
    if (!id) return;
    this.isLoading = true;
    this.dataService.get_paymentDetails(id).subscribe({
      next: (res: any) => {
        this.payment_Detilas = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // CRUD OPERATIONS
  // ==========================================
  Add_EOS() {
    this.formSubmitted = true;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const date = this.formSource.value.Date;
    const emp_id = this.formSource.value.employee_ID;
    const reason_id = this.formSource.value.reason_ID;
    const remarks = this.formSource.value.Remarks;
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays.toString() || '';

    // Check for duplicate entry based on employee ID
    const duplicate = this.staffEosSource.find(
      (item: any) => item.EMP_ID === emp_id,
    );
    if (duplicate) {
      notify(
        {
          message: 'This employee already exists.....',
          position: {
            at: 'top right',
            my: 'top right',
          },
          displayTime: 500,
        },
        'error',
      );
      return;
    }
    this.isLoading = true;
    this.dataService
      .add_Staff_EOS(
        user_id,
        store_id,
        date,
        emp_id,
        reason_id,
        remarks,
        relieving_date,
        days,
      )
      .subscribe({
        next: (res: any) => {
          notify(
            {
              message: 'Staff EOS Added successfully',
              position: {
                at: 'top right',
                my: 'top right',
              },
              displayTime: 500,
            },
            'success',
          );
          this.getStaffEosData();
          this.isAddPopUp = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }

  getEditActionTitle(row: any): string {
    if (!row) {
      return 'Edit';
    }

    return row.STATUS === 'Verified' ||
      row.STATUS === 'Left Service' ||
      row.STATUS === 'Approved'
      ? 'Detail'
      : 'Edit';
  }

  onEditingStart(event: any) {
    this.all_workingdays = '0';
    event.cancel = true;
    const statusValue = event.data.STATUS;
    const id = event.data.ID;
    this.isLoading = true;
    this.dataService.select_Advance(id).subscribe({
      next: (res: any) => {
        if (
          statusValue === 'Verified' ||
          statusValue === 'Left Service' ||
          statusValue === 'Approved'
        ) {
          this.isviewpopup = true;
        } else {
          this.editpopup = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
    this.select_Data_EOS(event);
  }

  // onVerifyAction(data: any): void {
  //   if (!data) return;

  //   if (data.STATUS === 'Open' && this.canVerify) {
  //     this.onVerifyClick({ row: { data } });
  //     return;
  //   }

  //   if (data.STATUS === 'Verified') {
  //     this.editpopup = false;
  //     this.verifypopup = false;
  //     this.Approvepopup = false;
  //     this.isviewpopup = false;

  //     this.isLoading = true;
  //     this.dataService.select_Api_eos(data.ID).subscribe({
  //       next: (res: any) => {
  //         this.selected_data = res;
  //         this.select_Data_EOS({ data: { ID: data.ID } });
  //         if (this.canApprove) {
  //           this.Approvepopup = true;
  //         } else {
  //           this.verifypopup = true;
  //         }
  //         this.isLoading = false;
  //       },
  //       error: () => {
  //         this.isLoading = false;
  //       },
  //     });
  //     return;
  //   }

  //   if ((data.STATUS === 'Left Service' || data.STATUS === 'Approved') && !this.canEdit) {
  //     this.editpopup = false;
  //     this.verifypopup = false;
  //     this.Approvepopup = false;
  //     this.isviewpopup = false;

  //     this.isLoading = true;
  //     this.dataService.select_Api_eos(data.ID).subscribe({
  //       next: (res: any) => {
  //         this.selected_data = res;
  //         this.isviewpopup = true;
  //         this.isLoading = false;
  //       },
  //       error: () => {
  //         this.isLoading = false;
  //       },
  //     });
  //   }
  // }

  onVerifyAction(data: any): void {
    if (!data) return;

    this.editpopup = false;
    this.verifypopup = false;
    this.Approvepopup = false;
    this.isviewpopup = false;

    this.isLoading = true;

    this.dataService.select_Api_eos(data.ID).subscribe({
      next: (res: any) => {
        this.selected_data = res;
        this.select_Data_EOS({ data: { ID: data.ID } });

        if (data.STATUS === 'Open') {
          this.verifypopup = true;
        } else if (data.STATUS === 'Verified') {
          this.Approvepopup = true;
        } else {
          this.isviewpopup = true;
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  isVerifyApproveDisabled(row: any): boolean {
    if (row.STATUS === 'Open') {
      return !this.canVerify;
    }

    if (row.STATUS === 'Verified') {
      return !(this.canVerify || this.canApprove || this.canEdit);
    }

    if (row.STATUS === 'Left Service' || row.STATUS === 'Approved') {
      return this.canEdit;
    }

    return false;
  }

  showVerifyApproveBadge(row: any): boolean {
    if (row.STATUS === 'Open') {
      return this.canVerify || this.canEdit;
    }

    if (row.STATUS === 'Verified') {
      return this.canVerify || this.canApprove || this.canEdit;
    }

    if (row.STATUS === 'Left Service' || row.STATUS === 'Approved') {
      return true;
    }

    return false;
  }

  getVerifyApproveTitle(row: any): string {
    if (row.STATUS === 'Open') {
      return 'Verify';
    }

    if (row.STATUS === 'Verified') {
      return this.canApprove ? 'Approve' : 'View';
    }

    if (row.STATUS === 'Left Service' || row.STATUS === 'Approved') {
      return 'View';
    }

    return '';
  }

  Edit_EOS() {
    this.isFormSubmitted = true;
    const id = this.id_value;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const emp_id = this.employee_value;
    const reason_id = this.reason_id_value;
    const remarks = this.remarks_value;
    const date = this.selected_data.EOS_DATE;
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays.toString() || '';

    const duplicate = this.staffEosSource.find(
      (item: any) => item.EMP_ID === emp_id && item.ID !== id,
    );
    if (duplicate) {
      notify(
        {
          message: 'This employee already .',
          position: {
            at: 'top right',
            my: 'top right',
          },
          displayTime: 500,
        },
        'error',
      );
      return;
    } else {
      this.isLoading = true;
      this.dataService
        .Update_Staff_EOS_api(
          id,
          user_id,
          store_id,
          date,
          emp_id,
          reason_id,
          remarks,
          relieving_date,
          days,
        )
        .subscribe({
          next: (res: any) => {
            notify(
              {
                message: 'Staff EOS Updated successfully',
                position: {
                  at: 'top right',
                  my: 'top right',
                },
                displayTime: 500,
              },
              'success',
            );
            this.getStaffEosData();
            this.editpopup = false;
            this.isFormSubmitted = false;
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
          },
        });
    }
  }

  deleteData(e: any) {
    const id = e.data.ID;
    this.isLoading = true;
    this.dataService.delete_Eos_data(id).subscribe({
      next: (res: any) => {
        notify(
          {
            message: 'Salary EOS Deleted successfully',
            position: {
              at: 'top right',
              my: 'top right',
            },
            displayTime: 500,
          },
          'success',
        );
        this.getStaffEosData();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  // APPROVAL & VERIFICATION
  // ==========================================
  onVerifyClick(e: any): void {
    e.cancel = true;
    const id = e.row?.data?.ID;
    this.isLoading = true;
    this.dataService.select_Api_eos(id).subscribe({
      next: (res: any) => {
        this.selected_data = res;
        if (this.selected_data.STATUS == 'Open') {
          this.verifypopup = true;
        } else if (this.selected_data.STATUS == 'Verified') {
          this.Approvepopup = true;
        } else {
          this.isviewpopup = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  Verify_EOS() {
    const id = this.selected_data.ID;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const emp_id = this.selected_data.EMP_ID;
    const reason_id = this.selected_data.REASON_ID;
    const remarks = this.selected_data.REMARKS;
    const date = this.selected_data.EOS_DATE;
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays.toString() || '';
    this.isLoading = true;
    this.dataService
      .Verify_Staff_EOS_api(
        id,
        user_id,
        store_id,
        date,
        emp_id,
        reason_id,
        remarks,
        relieving_date,
        days,
      )
      .subscribe({
        next: (res: any) => {
          notify(
            {
              message: 'Staff EOS Verified successfully',
              position: {
                at: 'top right',
                my: 'top right',
              },
              displayTime: 500,
            },
            'success',
          );
          this.getStaffEosData();
          this.verifypopup = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }

  onApproveClick(e: any): void {
    this.Approvepopup = true;
    e.cancel = true;
    const id = e.row?.data?.ID;
    this.isLoading = true;
    this.dataService.select_Api_eos(id).subscribe({
      next: (res: any) => {
        this.selected_data = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  Approve_EOS() {
    const id = this.selected_data.ID;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const emp_id = this.selected_data.EMP_ID;
    const reason_id = this.selected_data.REASON_ID;
    const remarks = this.selected_data.REMARKS;
    const date = this.selected_data.EOS_DATE;
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays ? this.all_workingdays.toString() : '0';
    this.isLoading = true;
    this.dataService
      .Approve_Staff_EOS_api(
        id,
        user_id,
        store_id,
        date,
        emp_id,
        reason_id,
        remarks,
        relieving_date,
        days,
      )
      .subscribe({
        next: (res: any) => {
          notify(
            {
              message: 'Staff EOS Approved successfully',
              position: {
                at: 'top right',
                my: 'top right',
              },
              displayTime: 500,
            },
            'success',
          );
          this.getStaffEosData();
          this.Approvepopup = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    DxTextAreaModule,
    ReactiveFormsModule,
    FormPopupModule,
    DxPopupModule,
    DxFormModule,
    FormTextboxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxLoadPanelModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [StaffEOSComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StaffEOSModule {}
