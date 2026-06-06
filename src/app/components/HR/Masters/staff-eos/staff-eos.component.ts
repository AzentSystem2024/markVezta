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
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
@Component({
  selector: 'app-staff-eos',
  templateUrl: './staff-eos.component.html',
  styleUrls: ['./staff-eos.component.scss'],
})
export class StaffEOSComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  isHeaderFilterVisible: boolean = false;

  selected_data: any = [];
  reson_data: any;
  id_value: any;
  days_worked_value: any;
  join_date_value: any;
  employee_id_value: any;
  reason_id_value: any;
  remarks_value: any;
  doc_no_value: any;
  date_value: string | null = null;
  UserId_value: any;
  store_id_value: any;
  eos_Amount_value: any;
  leave_Amount: any;
  pending_salary: any;
  Add_Amount: any;
  ded_Remarks: any;
  Add_Remarks: any;
  employee_value: any;
  EMPLOYEE_ID: any;
  isLoading: boolean;
  selecte_Data_VA: any;
  get_Details_Data: any = [];
  editpopup: boolean = false;
  all_workingdays: any = '0';
  staffEosSource: any = [];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  isAddPopUp: boolean = false;
  formSource!: FormGroup;
  isviewpopup: boolean = false;
  verifypopup: boolean = false;
  Approvepopup: boolean = false;
  reason_ID: any;
  employee_ID: any;
  formSubmitted = false;
  isFormSubmitted = false;
  less_service_days: number = 0;
  selected_Company_id: any;
  selected_fin_id: any;
  all_workingdaysView: any;
  //data box
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.add_popup());
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
  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedRange: string = 'all';

  fromDate: string | number | Date = new Date();
  toDate: string | number | Date = new Date();
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  isCustomDatePopupVisible = false;
  //daatebox end

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
      onClick: (e) => {
        setTimeout(() => this.onApproveClick(e));
      },
      visible: (e) =>
        this.canApprove && e.row.data.STATUS === 'Verified',
    }
  ];
  //====================Header filter=========================

  isFilterVisible = false;
  canVerify: any;

  toggle() {
    if (this.isFilterVisible) {
      this.isFilterVisible = false;
    } else {
      this.isFilterVisible = true;
    }
  }

  filterddata: any;
  trans_id: any;
  payment_Detilas: any = [];
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private router: Router,
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

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify
    }
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

  //--------------Session storage----------------
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    console.log(
      this.selected_fin_id,
      '===========selected fin id===================',
    );
  }
  //=======================Refresh=========================
  refreshGrid() {
    this.dataGrid.instance.refresh();
    this.getStaffEosData();
  }

  initialLoad: boolean = true;

  getStaffEosData(filterBy: string = 'all') {
    this.isLoading = true;
    this.dataService.get_Staff_EOS_List().subscribe((res: any) => {
      let data = res.data;
      console.log(data);

      // On first load or when 'all' is selected, show all data without filtering
      if (this.initialLoad) {
        this.staffEosSource = data
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
          this.staffEosSource = data
            .reverse()
            .map((item: any, index: number) => ({
              ...item,
              serialNo: index + 1,
            }));
          this.isLoading = false;
          return;
      }

      // Filter data based on date range
      this.filterddata = data.filter((item: any) => {
        const itemDate = this.parseApiDate(item.DATE);
        if (!itemDate) return false;
        return itemDate >= startDate && itemDate <= endDate;
      });

      // Add serial numbers
      this.staffEosSource = this.filterddata
        .reverse()
        .map((item: any, index: number) => ({
          ...item,
          serialNo: index + 1,
        }));

      this.isLoading = false;
    });
  }
  // Reset filter to show all data
  resetFilter() {
    this.initialLoad = true;
    this.selectedRange = 'all'; // Add this option to your dateRanges array
    this.getStaffEosData();
  }

  parseApiDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(parts[2], 10); // Assumes full year like 2025

      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  }

  onDateRangeChange(event: any) {
    const selected = event.value;

    if (selected === 'custom') {
      this.isCustomDatePopupVisible = true;
    } else {
      this.getStaffEosData(selected);
    }
  }
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status == null || status === ''
        ? '#000000' :
        status === 'Left Service'
          ? '#EF4444' // Left Service
          : status === 'Verified'
            ? '#0073D8' // Verified
            : '#FFA500'; // Open
    icon.title = status == null || status === ''
      ? 'No Status'
      : status === 'Left Service' ? 'Left Service' : status === 'verified' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
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
    this.getStaffEosData('custom');
  }

  // =======================onEdit====================================

  onEditingStart(event: any) {
    this.all_workingdays = "0";
    event.cancel = true;
    const statusValue = event.data.STATUS;
    const id = event.data.ID;
    this.dataService.select_Advance(id).subscribe((res: any) => {
      if (statusValue === 'Left Service') {
        this.isviewpopup = true;
      } else {
        this.editpopup = true;
      }
    });

    this.select_Data_EOS(event);
  }
  //   add_popup() {

  //     this.isAddPopUp = true;

  //   }
  add_popup() {
    // Also reset any additional variables if needed
    this.join_date_value = '';
    this.days_worked_value = '';
    this.all_workingdays = '';
    this.isAddPopUp = true;
    this.selected_data.EOS_DATE = new Date();
    this.selected_data.RELIEVING_DATE = new Date();
    this.get_employes_details_value();
  }
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  close() {
    console.log('close=======Buttomn clicked');
    this.isAddPopUp = false;
    this.isviewpopup = false;
    this.editpopup = false;
    this.verifypopup = false;
    this.Approvepopup = false;
    this.isCustomDatePopupVisible = false;

    this.isFormSubmitted = false;
    this.formSubmitted = false;
    this.isFormSubmitted = false;
  }

  closeButton() {
    console.log('close=======Button onHiding clicked');
    this.formSource.reset({
      Date: new Date(),
      employee_ID: 0,
      reason_ID: 0,
    });
    // this.employee_ID=0
    this.reason_ID = 0;
    this.employee_ID;
  }

  // =========dropdown data reson=========================

  get_reson_dropdown() {
    this.dataService.Dropdown_EOS_reason(name).subscribe((res: any) => {
      console.log(res);
      this.reson_data = res;
    });
  }

  dropdown_employee() {
    const payload = { NAME: 'EMPLOYEE', COMPANY_ID: this.selected_Company_id };
    console.log(payload);
    this.dataService.Dropdown_eos_employee(payload).subscribe((res: any) => {
      console.log(res);
      this.EMPLOYEE_ID = res;
    });
  }

  //===================Status flag=========================
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

  Add_EOS() {
    this.formSubmitted = true;
    console.log(this.formSource.value);
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const date = this.formSource.value.Date;
    const emp_id = this.formSource.value.employee_ID;
    const join_date = this.formSource.value.Join_Date;
    const days_worked = this.formSource.value.days_Worked;
    const reason_id = this.formSource.value.reason_ID;
    const remarks = this.formSource.value.Remarks;
    const relieving_date = this.formSource.value.RELIEVING_DATE;
    const days = this.all_workingdays.toString() || '';
    console.log(relieving_date, '========relvieing data s payload');

    //  Check for duplicate entry based on employee ID
    const duplicate = this.staffEosSource.find(
      (item: any) => item.EMP_ID === emp_id,
    );

    if (duplicate) {
      notify(
        {
          message: 'This employee already .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    }

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
      .subscribe((res: any) => {
        console.log(res);
        notify(
          {
            message: 'Staff EOS Added successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.getStaffEosData();
        this.isAddPopUp = false;
      });
  }
  //s===========================select EOS ==========================

  select_Data_EOS(event: any) {
    console.log(event);
    const id = event.data.ID;
    console.log(id);

    this.dataService.select_Api_eos(id).subscribe((res: any) => {
      console.log(res);
      this.selected_data = res;
      console.log(this.selected_data);
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
      this.all_workingdaysView = this.selected_data.DAYS;
      this.payment_functionality();
    });
  }
  onEmployee_Change(event: any) {
    this.employee_ID = event.value; // assign selected value
    this.get_employes_details_value();
    this.employee_value = event.value;
    console.log(this.employee_value);
  }
  onReason_Change(event: any) {
    this.reason_id_value = event.value;
    console.log(this.reason_id_value);
  }
  // ============================Edit Popup function=========================================
  Edit_EOS() {
    this.isFormSubmitted = true;
    const id = this.id_value;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const emp_id = this.employee_value;
    const reason_id = this.reason_id_value;
    const remarks = this.remarks_value;
    const date = this.selected_data.EOS_DATE;
    const eos_Amount = this.eos_Amount_value;
    const leave_Amount = this.leave_Amount;
    const pending_salary = this.pending_salary;
    const Add_Amount = this.Add_Amount;
    const ded_Amount = this.Add_Amount;
    const Add_Remarks = this.Add_Remarks;
    const ded_Remarks = this.ded_Remarks;
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays.toString() || '';;

    console.log(
      id,
      user_id,
      store_id,
      emp_id,
      reason_id,
      remarks,
      date,
      eos_Amount,
      leave_Amount,
      pending_salary,
      Add_Amount,
      ded_Amount,
      Add_Remarks,
      ded_Remarks,
      relieving_date,
      days,
    );
    const duplicate = this.staffEosSource.find(
      (item: any) => item.EMP_ID === emp_id && item.ID !== id,
    );

    if (duplicate) {
      notify(
        {
          message: 'This employee already .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    } else {
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
        .subscribe((res: any) => {
          console.log(res);
          notify(
            {
              message: 'Staff EOS Updated successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.getStaffEosData();
          this.editpopup = false;
          this.isFormSubmitted = false;
        });
    }
  }
  get_employes_details_value() {
    console.log('get_employes_details_value CALLED');
    const id = this.employee_ID;
    console.log(id);

    if (!id) return;

    this.dataService.get_employeeDetails(id).subscribe((res: any) => {
      console.log(res, 'API Response');
      this.get_Details_Data = res;
      this.less_service_days = res.LESS_SERVICE_DAYS;
      console.log(this.less_service_days, 'less service days');
      this.join_date_value = this.get_Details_Data.JOIN_DATE;
      console.log(this.join_date_value, 'join date');
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

        this.all_workingdays = this.days_worked_value - this.less_service_days;
        this.cdRef.detectChanges();
        console.log(this.all_workingdays, 'all working days');
      } else {
        this.days_worked_value = 0;
      }

      console.log(this.days_worked_value, 'days worked');
    });
  }
  get_employes_details_value_select() {
    console.log('get_employes_details_value CALLED  Verified');
    const id = this.selected_data.EMP_ID;
    console.log(id);

    if (!id) return;

    this.dataService.get_employeeDetails(id).subscribe((res: any) => {
      console.log(res, 'API Response');
      this.get_Details_Data = res;
      this.less_service_days = res.LESS_SERVICE_DAYS;
      console.log(this.less_service_days, 'less service days');
      this.join_date_value = this.get_Details_Data.JOIN_DATE;
      console.log(this.join_date_value, 'join date');
      // Convert join date string to Date object
      const joinDate: Date | null = this.parseApiDate(res.JOIN_DATE);
      const today = this.selected_data.RELIEVING_DATE;

      if (joinDate) {
        console.log(today, '=================today====================');
        console.log(joinDate, '=================join date====================');
        console.log(
          today.getTime(),
          '=================today time====================',
        );
        console.log(
          this.less_service_days,
          '=================less service days====================',
        );
        const timeDiff = today.getTime() - joinDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
        this.days_worked_value = dayDiff + 1;

        this.all_workingdays = this.days_worked_value - this.less_service_days;
        this.cdRef.detectChanges();
        console.log(this.all_workingdays, 'all working days');
      } else {
        this.days_worked_value = 0;
      }

      console.log(this.days_worked_value, 'days worked');
    });
  }
  // ============================Delete Popup function=========================================
  deleteData(e: any) {
    const id = e.data.ID;

    console.log(id);
    this.dataService.delete_Eos_data(id).subscribe((res: any) => {
      console.log(res);
      notify(
        {
          message: 'Salary EOS Deleted successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
      this.getStaffEosData();
    });
  }
  // ============================Verify Popup function=========================================
  onVerifyClick(e: any): void {
    e.cancel = true;

    const id = e.row?.data?.ID;
    console.log(id, '===================id');
    this.dataService.select_Api_eos(id).subscribe((res: any) => {
      console.log(res);
      this.selected_data = res;
      console.log(this.selected_data, '==============select data====verify');
      if (this.selected_data.STATUS == 'Open') {
        this.verifypopup = true

      } else if (this.selected_data.STATUS == 'Verified') {
        this.Approvepopup = true
      }
      else {
        this.isviewpopup = true
      }
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

    console.log(id, user_id, store_id, emp_id, reason_id, remarks, date);
    console.log('===================verify data');

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
      .subscribe((res: any) => {
        console.log(res, '===================verify data');
        notify(
          {
            message: 'Staff EOS Verified successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.getStaffEosData();
        this.verifypopup = false;
      });
  }
  // ============================Approve Popup function=========================================
  onApproveClick(e: any): void {
    this.Approvepopup = true;
    e.cancel = true;
    const id = e.row?.data?.ID;
    console.log(id, '===================id');
    this.dataService.select_Api_eos(id).subscribe((res: any) => {
      console.log(res);
      this.selected_data = res;
      console.log(this.selected_data, '==============select data====verify');
      // this.get_employes_details_value_select();
    });
  }
  Approve_EOS() {
    console.log('Approve_EOS called');
    const id = this.selected_data.ID;
    const user_id = sessionStorage.getItem('UserId');
    const store_id = sessionStorage.getItem('StoreId');
    const emp_id = this.selected_data.EMP_ID;
    const reason_id = this.selected_data.REASON_ID;
    const remarks = this.selected_data.REMARKS;
    const date = this.selected_data.EOS_DATE;
    console.log(id, user_id, store_id, emp_id, reason_id, remarks, date);
    const relieving_date = this.selected_data.RELIEVING_DATE;
    const days = this.all_workingdays
      ? this.all_workingdays.toString()
      : '0';
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
      .subscribe((res: any) => {
        console.log(res, '===================verify data');
        notify(
          {
            message: 'Staff EOS Approved successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.getStaffEosData();
        this.Approvepopup = false;
      });
  }
  //==========================Payment functionality===================
  payment_functionality() {
    const id = this.trans_id;
    console.log(id, '=================id====================');

    console.log('payment functionality');
    this.dataService.get_paymentDetails(id).subscribe((res: any) => {
      console.log(res);

      this.payment_Detilas = res;
    });
  }

  //==========================calculate working days===================
  calculateWorkingDays(event: any) {
    console.log(event, '=================event value====================');
    const joinDate = this.parseApiDate(this.join_date_value); // Parse the join date value
    const today = event.value; // Assuming this is the relieving date selected in the date box
    if (joinDate) {
      const timeDiff = today.getTime() - joinDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
      this.days_worked_value = dayDiff + 1;

      this.all_workingdays = this.days_worked_value - this.less_service_days;
      this.cdRef.detectChanges();
      console.log(this.all_workingdays, 'all working days');
    } else {
      this.days_worked_value = 0;
    }
  }
  calculateWorkingDaysEdit(event: any) {
    console.log(event, '=================event value====================');
    const joinDate = this.parseApiDate(this.join_date_value); // Parse the join date value
    const today = new Date(event.value); // Assuming this is the relieving date selected in the date box
    if (joinDate) {
      const timeDiff = today.getTime() - joinDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
      this.days_worked_value = dayDiff + 1;

      this.all_workingdays = this.days_worked_value - this.less_service_days;
      this.cdRef.detectChanges();
      console.log(this.all_workingdays, 'all working days');
    } else {
      this.days_worked_value = 0;
    }
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
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [StaffEOSComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StaffEOSModule { }
