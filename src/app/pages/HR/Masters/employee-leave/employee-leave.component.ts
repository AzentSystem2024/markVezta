import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
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
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-employee-leave',
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.scss'],
})
export class EmployeeLeaveComponent {
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
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;

  AddVacationPopup = false;
  UpdateVacationPopup = false;
  VerifyPopup = false;
  ApprovePopup = false;
  TravelPopup = false;
  RejoinPopup = false;
  ViewPopup = false;

  selectedStatusType: string = '';
  StatusType = ['Rejoined', 'Left Service'];
  today = new Date();

  // SESSION DATA
  // ==========================================
  sessionData: any;
  COMPANY_ID: any;
  StoreId: any;
  UserId: any;

  // PERMISSIONS
  // ==========================================
  canAdd = false;
  canEdit = false;
  canVerify = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  // DATA SOURCES
  // ==========================================
  EmployeeLeaveDatasource: any[] = [];
  selectedData: any = {};
  LeaveType: any[] = [];
  Employee: any[] = [];
  Left_service: any[] = [];

  // Employee Selection Data
  Employee_no: any;
  AllEmployeeDetails: any[] = [];
  EmployeeDetails: any = {};
  Leave_credit: any;

  // Existing Leave Validation Data
  ExistingEmployee: any[] = [];
  ExisitngDeparture: any;
  ExistingReturn: any;

  // FORM VARIABLES
  // ==========================================
  formsource: FormGroup;
  private _REJOIN_DATE: Date | null = null;

  // GRID CONFIGURATION
  // ==========================================
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
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.Add_EmployeeLeave());
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

  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
      visible: (e: any) => e.row.data.STATUS !== 'Verified',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      visible: (e: any) =>
        e.row.data.STATUS !== 'Approved' &&
        e.row.data.STATUS !== 'Travelled' &&
        e.row.data.STATUS !== 'Rejoined' &&
        e.row.data.STATUS !== 'Left Service',
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
        e.row.data.STATUS !== 'Approved' &&
        e.row.data.STATUS !== 'Verified' &&
        e.row.data.STATUS !== 'Travelled' &&
        e.row.data.STATUS !== 'Rejoined' &&
        e.row.data.STATUS !== 'Left Service',
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
    {
      hint: 'Travel',
      icon: 'check',
      text: 'Travel',
      onClick: (e: any) => {
        setTimeout(() => this.onTravelClick(e));
      },
      visible: (e: any) => e.row.data.STATUS === 'Approved',
    },
    {
      hint: 'Rejoin',
      icon: 'check',
      text: 'Rejoin',
      onClick: (e: any) => {
        setTimeout(() => this.onRejoinClick(e));
      },
      visible: (e: any) => e.row.data.STATUS === 'Travelled',
    },
  ];

  // CONSTRUCTOR
  // ==========================================
  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.formsource = this.fb.group({
      Doc_no: ['', Validators.required],
      Date: [new Date(), Validators.required],
      Employee_no: ['', Validators.required],
      Employee_name: ['', Validators.required],
      Leave_type: ['', Validators.required],
      Leave_days: ['', Validators.required],
      Leave_credit: ['', Validators.required],
      Dept_date: ['', Validators.required],
      Expected_rejoin_date: ['', Validators.required],
      Remarks: ['', Validators.required],
      Leave_salary_payable: ['', Validators.required],
    });

    this.sesstion_Details();
    this.get_EmployeeLeaveList();
    this.get_Employee_Details();
    this.get_ExistingLeaveByEmployee();

    // AUTO FILL LISTENERS
    this.formsource.get('Leave_days')?.valueChanges.subscribe(() => {
      this.autofillExpectedRejoinDate();
    });

    this.formsource.get('Dept_date')?.valueChanges.subscribe(() => {
      this.autofillExpectedRejoinDate();
    });

    this.get_LeaveType_Dropdown_List();
    this.get_Employee_Dropdown_List();
    this.get_EOS_Dropdown_List();
  }

  // LIFECYCLE HOOKS
  // ==========================================
  ngOnInit(): void {
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
      this.canVerify = packingRights.CanVerify;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    // Property watching for Rejoin Date changes
    Object.defineProperty(this.selectedData, 'REJOIN_DATE', {
      set: (newValue) => {
        this._REJOIN_DATE = newValue;
        this.calculateLeaveDaysTaken();
      },
      get: () => {
        return this._REJOIN_DATE;
      },
      configurable: true,
    });
  }

  sesstion_Details() {
    const savedData = sessionStorage.getItem('savedUserData');
    if (!savedData) {
      this.sessionData = null;
      this.COMPANY_ID = null;
      this.UserId = null;
      this.StoreId = null;
      return;
    }

    this.sessionData = JSON.parse(savedData);
    this.COMPANY_ID = String(this.sessionData.SELECTED_COMPANY.COMPANY_ID);
    this.UserId = this.sessionData.USER_ID;
    this.StoreId = this.sessionData.Configuration[0].STORE_ID;
  }

  // GRID ACTIONS & UTILS
  // ==========================================
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.get_EmployeeLeaveList();
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  // EVENT HANDLERS (POPUP ACTIONS)
  // ==========================================
  onVerifyClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
    if (!employeeId) return;

    this.dataservice
      .Select_EmployeeLeave_Api(employeeId)
      .subscribe((response: any) => {
        this.selectedData = response;
        this.VerifyPopup = true;
      });
  }

  onApproveClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
    if (!employeeId) return;

    this.dataservice
      .Select_EmployeeLeave_Api(employeeId)
      .subscribe((response: any) => {
        this.selectedData = response;
        this.ApprovePopup = true;
      });
  }

  onTravelClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
    if (!employeeId) return;

    this.dataservice
      .Select_EmployeeLeave_Api(employeeId)
      .subscribe((response: any) => {
        // Set TRAVELLED_DATE same as DEPT_DATE if null
        response.TRAVELLED_DATE = response.TRAVELLED_DATE || response.DEPT_DATE;
        this.selectedData = response;
        this.TravelPopup = true;
      });
  }

  onRejoinClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
    if (!employeeId) return;

    this.dataservice
      .Select_EmployeeLeave_Api(employeeId)
      .subscribe((response: any) => {
        this.selectedData = response;
        this.RejoinPopup = true;
      });
  }

  onEditingStart(event: any) {
    event.cancel = true;
    const statusValue = event.data.STATUS;
    const ID = event.data.ID;

    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      response.LEFT_REASON = Number(response.LEFT_REASON);
      this.selectedData = response;
      if (statusValue === 'Open' || statusValue === 'Pending') {
        // Editable
        this.UpdateVacationPopup = true;
      } else {
        // View only
        this.ViewPopup = true;
      }
    });
    // this.selectedStatusType = event.data.StatusType;
    // this.Select_EmployeeLeave(ID);
  }

  closePopup() {
    this.formsource.reset();
    this.selectedStatusType = '';
  }

  // AUTO FILL & VALIDATION LOGIC
  // ==========================================
  autofillExpectedRejoinDate() {
    const deptDate = this.formsource.get('Dept_date')?.value;
    const leaveDays = this.formsource.get('Leave_days')?.value;

    if (deptDate && leaveDays != null && leaveDays !== '') {
      const departure = new Date(deptDate);
      departure.setDate(departure.getDate() + parseInt(leaveDays, 10));
      this.formsource.get('Expected_rejoin_date')?.setValue(departure);
    }
  }

  calculateExpectedRejoinDate() {
    const leaveDays = this.selectedData.VAC_DAYS;
    const departureDate = new Date(this.selectedData.DEPT_DATE);

    if (
      leaveDays &&
      departureDate instanceof Date &&
      !isNaN(departureDate.getTime())
    ) {
      const expectedRejoinDate = new Date(departureDate);
      expectedRejoinDate.setDate(departureDate.getDate() + leaveDays);
      this.selectedData.EXPECT_RETURN = expectedRejoinDate;
    }
  }

  calculateLeaveDaysTaken(): void {
    const departure = new Date(this.selectedData.DEPT_DATE);
    const rejoin = new Date(this.selectedData.REJOIN_DATE);

    if (departure && rejoin && rejoin >= departure) {
      const diffTime = rejoin.getTime() - departure.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      diffDays = diffDays - 1; // reduce one day
      this.selectedData.ACTUAL_DAYS = diffDays >= 0 ? diffDays : 0;
    } else {
      this.selectedData.ACTUAL_DAYS = null;
    }
  }

  isDateDisabled = (data: { date: Date }) => {
    return data.date <= this.today; // Disable past dates and today
  };

  isDateDisabledvalue = (data: { date: Date }) => {
    const dep = this.ExistingEmployee[0]?.DEPT_DATE;
    const ret = this.ExistingEmployee[0]?.EXPECT_RETURN;

    if (!dep || !ret) return false;

    const depDate = new Date(dep);
    const retDate = new Date(ret);
    const current = data.date;

    return current > depDate && current <= retDate;
  };

  autoFillExpectedRejoinDate() {
    const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
    const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

    if (!depRaw || !retRaw) return;

    const depDate = new Date(depRaw);
    const retDate = new Date(retRaw);

    let suggestedDate = new Date(); // Default to today

    // If suggested date overlaps with DEPT_DATE - EXPECT_RETURN range, adjust
    if (suggestedDate > depDate && suggestedDate <= retDate) {
      suggestedDate = new Date(retDate);
      suggestedDate.setDate(suggestedDate.getDate() + 1);
    }

    this.formsource.get('Expected_rejoin_date')?.setValue(suggestedDate);
  }

  validateExpectedRejoin = (e: any) => {
    const value = e.value;
    const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
    const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

    if (!value || !depRaw || !retRaw) return true;

    const depDate = new Date(depRaw);
    const retDate = new Date(retRaw);
    const currentDate = new Date(value);

    return !(currentDate > depDate && currentDate <= retDate);
  };

  expectedRejoinDateValidator = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value = new Date(control.value);
    const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
    const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

    if (!depRaw || !retRaw || !value) return null;

    const depDate = new Date(depRaw);
    const retDate = new Date(retRaw);

    const isOverlapping = value > depDate && value <= retDate;
    return isOverlapping ? { overlap: true } : null;
  };

  fixDate(date: any) {
    if (!date) return date;
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  }

  onStatusChange(status: string) {
    this.selectedStatusType = status;
    if (status === 'Rejoined') {
      if (!this.selectedData.REJOIN_DATE) {
        this.selectedData.REJOIN_DATE = new Date();
      }
    } else {
      this.selectedData.REJOIN_DATE = null;
    }
  }

  onEmployee_Change(event: any) {
    this.Employee_no = event.value;
    this.get_Employee_Details();
    this.get_ExistingLeaveByEmployee();
  }


  onStatusBadgeClick(data: any) {
    switch (data.STATUS) {

      case 'Open':
      case 'Pending':
        this.onVerifyClick({ row: { data } });
        break;

      case 'Verified':
        this.onApproveClick({ row: { data } });
        break;

      case 'Approved':
        this.onTravelClick({ row: { data } });
        break;

      case 'Travelled':
        this.onRejoinClick({ row: { data } });
        break;

      case 'Rejoined':
      case 'Left Service':
        this.ViewPopup = true;
        this.Select_EmployeeLeave(data.ID);
        break;
    }
  }
  // DATA FETCHING & DROPDOWNS
  // ==========================================
  get_EmployeeLeaveList() {
    this.dataservice.get_EmployeeLeave_Api().subscribe((res: any) => {
      if (res && res.data) {
        this.EmployeeLeaveDatasource = res.data.map(
          (item: any, index: any) => ({
            ...item,
            SlNo: index + 1,
          }),
        );
      }
    });
  }

  get_LeaveType_Dropdown_List() {
    const payload = { NAME: 'LEAVE_TYPES' };
    this.dataservice
      .get_LeaveType_Dropdown_Api(payload)
      .subscribe((response: any) => {
        this.LeaveType = response;
      });
  }

  get_Employee_Dropdown_List() {
    const payload = { NAME: 'EMPLOYEE', COMPANY_ID: this.COMPANY_ID };
    this.dataservice
      .Dropdown_eos_employee(payload)
      .subscribe((response: any) => {
        this.Employee = response;
      });
  }

  get_EOS_Dropdown_List() {
    this.dataservice
      .Dropdown_EOS_reason(name)
      .subscribe((response: any) => {
        this.Left_service = response;
      });
  }

  get_Employee_Details() {
    if (!this.Employee_no) return;
    const payload = { EMP_ID: this.Employee_no };

    this.dataservice
      .get_EmployeeDetailsFor_Leave_Api(payload)
      .subscribe((res: any) => {
        this.AllEmployeeDetails = res.data || [];
        const selectedEmployee = this.AllEmployeeDetails.find(
          (item: any) => item.EMP_ID === this.Employee_no,
        );
        if (selectedEmployee) {
          this.EmployeeDetails = selectedEmployee;
          this.Leave_credit = this.EmployeeDetails.LEAVE_CREDIT;
          this.formsource.patchValue({ Leave_credit: this.Leave_credit });
        }
      });
  }

  get_ExistingLeaveByEmployee() {
    if (!this.Employee_no) return;
    const id = this.Employee_no;
    this.dataservice.get_EmployeeLeave_Api().subscribe((res: any) => {
      const datas = res.data || [];
      this.ExistingEmployee = datas.filter((item: any) => item.EMP_ID == id);
      this.ExisitngDeparture = this.ExistingEmployee[0]?.DEPT_DATE;
      this.ExistingReturn = this.ExistingEmployee[0]?.EXPECT_RETURN;
    });
  }

  Select_EmployeeLeave(ID: any) {
    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      response.LEFT_REASON = Number(response.LEFT_REASON);
      this.selectedData = response;
      setTimeout(() => {
        this.selectedStatusType = this.selectedData.STATUS;
      }, 0);
    });
  }

  // POPUP OPENERS
  // ==========================================
  Add_EmployeeLeave() {
    this.AddVacationPopup = true;
    this.formsource.reset({
      Doc_no: '',
      Date: new Date(),
      Employee_no: '',
      Employee_name: '',
      Leave_type: '',
      Leave_days: '',
      Leave_credit: '',
      Dept_date: '',
      Expected_rejoin_date: '',
      Remarks: '',
      Leave_salary_payable: '',
    });
  }

  Update_EmployeeLeave() {
    this.UpdateVacationPopup = true;
  }
  Verify_EmployeeLeave() {
    this.VerifyPopup = true;
  }
  Approve_EmployeeLeave() {
    this.ApprovePopup = true;
  }
  View_EmployeeLeave() {
    this.ViewPopup = true;
  }

  // CRUD OPERATIONS
  // ==========================================
  Add_Data() {
    const formDate = this.formsource.get('Date')?.value;
    const Dept_date = this.fixDate(this.formsource.get('Dept_date')?.value);
    const Expected_rejoin_date = this.fixDate(
      this.formsource.get('Expected_rejoin_date')?.value,
    );

    const User_Id = this.UserId;
    const Store_Id = this.StoreId;
    const Employee_no = this.formsource.get('Employee_no')?.value;
    const Leave_type = this.formsource.get('Leave_type')?.value;
    const Leave_days = this.formsource.get('Leave_days')?.value;
    const Leave_credit = this.formsource.get('Leave_credit')?.value;
    const Remarks = this.formsource.get('Remarks')?.value;
    const Leave_salary_payable =
      this.formsource.get('Leave_salary_payable')?.value === true;

    if (Leave_salary_payable && Leave_days > Leave_credit) {
      notify(
        {
          message: 'Leave days required cannot exceed leave days available',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1500,
        },
        'error',
      );
      return;
    }

    if (
      Employee_no &&
      Leave_type &&
      Leave_days &&
      Dept_date &&
      Expected_rejoin_date
    ) {
      this.dataservice
        .Insert_EmployeeLeave_Api(
          User_Id,
          Store_Id,
          formDate,
          Employee_no,
          Leave_type,
          Leave_days,
          Leave_credit,
          Dept_date,
          Expected_rejoin_date,
          Remarks,
          Leave_salary_payable,
        )
        .subscribe(() => {
          notify(
            {
              message: 'Data successfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.AddVacationPopup = false;
          this.formsource.reset();
          this.get_EmployeeLeaveList();
        });
    } else {
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
    }
  }

  Edit_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        this.selectedData.DOC_DATE,
        this.selectedData.EMP_ID,
        this.selectedData.LEAVE_TYPE_ID,
        this.selectedData.VAC_DAYS,
        this.selectedData.LEAVE_CREDIT,
        this.selectedData.DEPT_DATE,
        this.selectedData.EXPECT_RETURN,
        this.selectedData.REMARKS,
        this.selectedData.LS_PAYABLE,
        this.selectedData.IS_TICKET,
        this.selectedData.LAST_REJOIN_DATE,
        this.selectedData.TRAVELLED_DATE,
        this.selectedData.REJOIN_DATE,
        this.selectedData.ACTUAL_DAYS,
        this.selectedData.DEDUCT_DAYS,
        this.selectedData.LEFT_REASON,
      )
      .subscribe(() => {
        notify(
          {
            message: 'Data updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.UpdateVacationPopup = false;
        this.get_EmployeeLeaveList();
      });
  }

  Verify_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    confirm(
      'Are you sure you want to verify this Employee Leave?',
      'Confirm Verification',
    ).then((dialogResult) => {
      if (dialogResult) {
        this.dataservice
          .Verify_EmployeeLeave_Api(
            User_Id,
            Store_Id,
            ID,
            this.selectedData.DOC_DATE,
            this.selectedData.EMP_ID,
            this.selectedData.LEAVE_TYPE_ID,
            this.selectedData.VAC_DAYS,
            this.selectedData.LEAVE_CREDIT,
            this.selectedData.DEPT_DATE,
            this.selectedData.EXPECT_RETURN,
            this.selectedData.REMARKS,
            this.selectedData.LS_PAYABLE,
            this.selectedData.IS_TICKET,
            this.selectedData.LAST_REJOIN_DATE,
            this.selectedData.TRAVELLED_DATE,
            this.selectedData.REJOIN_DATE,
            this.selectedData.ACTUAL_DAYS,
            this.selectedData.DEDUCT_DAYS,
            this.selectedData.LEFT_REASON,
          )
          .subscribe(() => {
            notify(
              {
                message: 'Data verified successfully',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success',
            );
            this.UpdateVacationPopup = false;
            this.VerifyPopup = false;
            this.get_EmployeeLeaveList();
          });
      }
    });
  }

  Approve_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    confirm(
      'Are you sure you want to approve this Employee Leave?',
      'Confirm Approval',
    ).then((dialogResult) => {
      if (dialogResult) {
        this.dataservice
          .Approve_EmployeeLeave_Api(
            User_Id,
            Store_Id,
            ID,
            this.selectedData.DOC_DATE,
            this.selectedData.EMP_ID,
            this.selectedData.LEAVE_TYPE_ID,
            this.selectedData.VAC_DAYS,
            this.selectedData.LEAVE_CREDIT,
            this.selectedData.DEPT_DATE,
            this.selectedData.EXPECT_RETURN,
            this.selectedData.REMARKS,
            this.selectedData.LS_PAYABLE,
            this.selectedData.IS_TICKET,
            this.selectedData.LAST_REJOIN_DATE,
            this.selectedData.TRAVELLED_DATE,
            this.selectedData.REJOIN_DATE,
            this.selectedData.ACTUAL_DAYS,
            this.selectedData.DEDUCT_DAYS,
            this.selectedData.LEFT_REASON,
          )
          .subscribe(() => {
            notify(
              {
                message: 'Data approved successfully',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success',
            );
            this.ApprovePopup = false;
            this.get_EmployeeLeaveList();
          });
      }
    });
  }

  Travel_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        this.selectedData.DOC_DATE,
        this.selectedData.EMP_ID,
        this.selectedData.LEAVE_TYPE_ID,
        this.selectedData.VAC_DAYS,
        this.selectedData.LEAVE_CREDIT,
        this.selectedData.DEPT_DATE,
        this.selectedData.EXPECT_RETURN,
        this.selectedData.REMARKS,
        this.selectedData.LS_PAYABLE,
        this.selectedData.IS_TICKET,
        this.selectedData.LAST_REJOIN_DATE,
        this.selectedData.TRAVELLED_DATE,
        this.selectedData.REJOIN_DATE,
        this.selectedData.ACTUAL_DAYS,
        this.selectedData.DEDUCT_DAYS,
        this.selectedData.LEFT_REASON,
      )
      .subscribe(() => {
        notify(
          {
            message: 'Data updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.TravelPopup = false;
        this.get_EmployeeLeaveList();
      });
  }

  Rejoin_Data() {
    this.selectedData.STATUS = this.selectedStatusType;

    if (
      this.selectedStatusType === 'Left Service' &&
      !this.selectedData.LEFT_REASON
    ) {
      notify(
        {
          message: 'Please select a reason',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    }

    if (
      this.selectedStatusType === 'Rejoined' &&
      !this.selectedData.REJOIN_DATE
    ) {
      notify(
        {
          message: 'Please select rejoin date',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    }

    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        this.selectedData.DOC_DATE,
        this.selectedData.EMP_ID,
        this.selectedData.LEAVE_TYPE_ID,
        this.selectedData.VAC_DAYS,
        this.selectedData.LEAVE_CREDIT,
        this.selectedData.DEPT_DATE,
        this.selectedData.EXPECT_RETURN,
        this.selectedData.REMARKS,
        this.selectedData.LS_PAYABLE,
        this.selectedData.IS_TICKET,
        this.selectedData.LAST_REJOIN_DATE,
        this.selectedData.TRAVELLED_DATE,
        this.selectedData.REJOIN_DATE,
        this.selectedData.ACTUAL_DAYS,
        this.selectedData.DEDUCT_DAYS,
        this.selectedData.LEFT_REASON,
      )
      .subscribe(() => {
        notify(
          {
            message: 'Data updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.selectedStatusType = '';
        this.RejoinPopup = false;
        this.get_EmployeeLeaveList();
      });
  }

  View_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        this.selectedData.DOC_DATE,
        this.selectedData.EMP_ID,
        this.selectedData.LEAVE_TYPE_ID,
        this.selectedData.VAC_DAYS,
        this.selectedData.LEAVE_CREDIT,
        this.selectedData.DEPT_DATE,
        this.selectedData.EXPECT_RETURN,
        this.selectedData.REMARKS,
        this.selectedData.LS_PAYABLE,
        this.selectedData.IS_TICKET,
        this.selectedData.LAST_REJOIN_DATE,
        this.selectedData.TRAVELLED_DATE,
        this.selectedData.REJOIN_DATE,
        this.selectedData.ACTUAL_DAYS,
        this.selectedData.DEDUCT_DAYS,
        this.selectedData.LEFT_REASON,
      )
      .subscribe(() => {
        notify(
          {
            message: 'Data updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.ViewPopup = false;
        this.get_EmployeeLeaveList();
      });
  }

  Delete_Data(event: any) {
    event.cancel = new Promise<void>((resolve, reject) => {
      confirm(
        'Are you sure you want to delete this Employee Leave record?',
        'Confirm Deletion',
      ).then((dialogResult) => {
        if (dialogResult) {
          const ID = event.data.ID;
          this.dataservice.Delete_EmployeeLeave_Api(ID).subscribe({
            next: (response: any) => {
              notify(
                {
                  message: 'Data successfully deleted',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success',
              );
              this.get_EmployeeLeaveList();
              resolve();
            },
            error: (err: any) => {
              notify(
                {
                  message: 'Failed to delete record.',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 2000,
                },
                'error',
              );
              reject();
            },
          });
        } else {
          reject();
        }
      });
    });
  }

  isBadgeDisabled(status: string): boolean {
    switch (status) {
      case 'Open':
      case 'Pending':
        return !this.canVerify;

      case 'Verified':
      case 'Approved':
      case 'Travelled':
      case 'Rejoined':
      case 'Left Service':
        return !this.canApprove;

      default:
        return true;
    }
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxNumberBoxModule,
    ReactiveFormsModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxValidatorModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    FormPopupModule,
    DxFormModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [EmployeeLeaveComponent],
})
export class EmployeeLeaveModule { }
