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
  ValidatorFn,
} from '@angular/forms';
import { DataService } from 'src/app/services';
import { name } from '@devexpress/analytics-core/analytics-diagram';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-employee-leave',
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.scss'],
})
export class EmployeeLeaveComponent {
  VerifyPopup: boolean = false;
  ApprovePopup: boolean = false;
  ExistingEmployee: any = [];
  selectedData: any = {};
  LeaveType: any;
  Employee: any;
  ViewPopup: boolean = false;
  Is_ticket: any;
  Left_service: any;
  TravelPopup: boolean = false;
  RejoinPopup: boolean = false;
  selectedStatusType: string = '';
  selectedData1: number | undefined;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  isTravelled: boolean = false;
  StatusType = ['Rejoined', 'Left Service'];
  EmployeeDetails: any = [];
  Leave_credit: any;
  existingLeave: any = [];
  ExisitngDeparture: any;
  ExistingReturn: any;
  sessionData: any;
  COMPANY_ID: any;
  StoreId: any;
  UserId: any;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  AllEmployeeDetails: any = [];
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  editingRowData: any = {}; // To store the selected row's data
  AddVacationPopup = false;
  UpdateVacationPopup = false;
  formData: any;
  Leave_type: any;
  Employee_no: any;
  formsource: FormGroup;
  isFilterOpened = false;
  EmployeeLeaveDatasource: any[] | undefined;

  minDate: Date | undefined;
  today = new Date();
  canAdd = false;
  canEdit = false;
  canVerify = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
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

      // onClick: (e:any) => this.onDeleteClick(e),

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

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router
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
      // },
    });
    this.sesstion_Details();
    this.get_EmployeeLeaveList();
    this.get_Employee_Details();
    this.get_ExistingLeaveByEmployee();
    const UserID = sessionStorage.getItem('UserId');

    //=====================AUTO FILL===================================

    this.formsource.get('Leave_days')?.valueChanges.subscribe((leaveDays) => {
      this.autofillExpectedRejoinDate();
    });

    this.formsource.get('Dept_date')?.valueChanges.subscribe((deptDate) => {
      this.autofillExpectedRejoinDate();
    });

    this.get_LeaveType_Dropdown_List();
    this.get_Employee_Dropdown_List();
    this.get_EOS_Dropdown_List();
  }
  // Inside your component
  ngOnInit(): void {
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
      this.canVerify = packingRights.CanVerify;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    // Watch manually if using template-driven form
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

    const today = new Date();
    // Set minDate to the 1st day of the next month
  }


 statusCellRender(cellElement: any, cellInfo: any) {
  const status = cellInfo.data.STATUS;

  const icon = document.createElement('i');
  icon.className = 'fas fa-flag';
  icon.style.fontSize = '18px';

  switch (status) {
    case 'Approved':
      icon.style.color = '#10B981'; // Green
      icon.title = 'Approved';
      break;

    case 'Verified':
      icon.style.color = '#0073D8'; // Blue
      icon.title = 'Verified';
      break;

    case 'Travelled':
      icon.style.color = '#FFD700'; // Yellow
      icon.title = 'Travelled';
      break;

    case 'Rejoined':
      icon.style.color = '#8B4513'; // Brown
      icon.title = 'Rejoined';
      break;

    case 'Left Service':
      icon.style.color = '#DC2626'; // Red
      icon.title = 'Left Service';
      break;

    default:
      icon.style.color = '#FFA500'; // Open = Orange
      icon.title = 'Open';
  }

  icon.style.display = 'flex';
  icon.style.justifyContent = 'center';
  icon.style.alignItems = 'center';

  cellElement.appendChild(icon);
}

  //========================STATUS====================
  onVerifyClick(e: any): void {
    e.cancel = true;
    e.cancel = true;
    const employeeId = e.row?.data?.ID;

    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }

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

    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }

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

    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }

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

    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }

    this.dataservice
      .Select_EmployeeLeave_Api(employeeId)
      .subscribe((response: any) => {
        this.selectedData = response;
        this.RejoinPopup = true;
      });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_EmployeeLeaveList();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  //====================AUTO FILL===================
  autofillExpectedRejoinDate() {
    const deptDate = this.formsource.get('Dept_date')?.value;
    const leaveDays = this.formsource.get('Leave_days')?.value;

    if (deptDate && leaveDays != null && leaveDays !== '') {
      const departure = new Date(deptDate);
      departure.setDate(departure.getDate() + parseInt(leaveDays, 10));

      // Set the calculated rejoin date
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

  //================AUTO FILL REJOIN DATEE==============


  // Backup for setter/getter
  private _REJOIN_DATE: Date | null = null;

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

  // Function to disable past dates
  isDateDisabled = (data: { date: Date }) => {
    const date = data.date;

    // Check if the provided date is before today
    if (date <= this.today) {
      return true; // Disable the date if it's today or in the past
    }

    return false;
  };

  //=============================

  onEditingStart(event: any) {
    event.cancel = true;
    const statusValue = event.data.STATUS;
    const ID = event.data.ID;

    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      if (
        statusValue === 'Approved' ||
        statusValue === 'Travelled' ||
        statusValue === 'Rejoined' ||
        statusValue === 'Left Service'
      ) {
        this.ViewPopup = true;
      } else {
        this.UpdateVacationPopup = true;
      }
    });
    this.selectedStatusType = event.data.StatusType;

    this.Select_EmployeeLeave(ID);
  }

  refresh = () => {
    this.dataGrid?.instance.refresh();
  };

  closePopup() {
    this.formsource.reset();
    this.selectedStatusType = '';
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  Add_EmployeeLeave() {
    this.AddVacationPopup = true;
    this.formsource.reset({
      Id: null,

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

  //===================get data list========================
  get_EmployeeLeaveList() {
    this.dataservice.get_EmployeeLeave_Api().subscribe((res: any) => {
      if (res) {
        this.EmployeeLeaveDatasource = res.data.map(
          (item: any, index: any) => ({
            ...item,
            SlNo: index + 1, // Assign serial number
          }),
        );
      }
    });
  }

  onEmployee_Change(event: any) {
    this.Employee_no = event.value; // assign selected value
    this.get_Employee_Details();
    this.get_ExistingLeaveByEmployee(); //onEmployyee change work avumbo id kittum aa id kittitt athinnee ee functionill vilikkaa
  }

  get_Employee_Details() {
    const Id = this.Employee_no;

    const payload = {
      EMP_ID: this.Employee_no,
    };
    this.dataservice
      .get_EmployeeDetailsFor_Leave_Api(payload)
      .subscribe((res: any) => {
        this.AllEmployeeDetails = res.data;

        const selectedEmployee = this.AllEmployeeDetails.find(
          (item: any) => item.EMP_ID === Id,
        );

        this.EmployeeDetails = selectedEmployee;
        this.Leave_credit = this.EmployeeDetails.LEAVE_CREDIT;
        this.formsource.patchValue({
          Leave_credit: this.EmployeeDetails.LEAVE_CREDIT,
        });
      });
  }

  //===================DUPLICATION FOR VACATION===========================
  get_ExistingLeaveByEmployee() {
    const id = this.Employee_no;
    //ini ee id use cheyuthitt filter cheyuthitt
    this.dataservice.get_EmployeeLeave_Api().subscribe((res: any) => {
      const datas = res.data;

      this.ExistingEmployee = datas.filter((item: any) => item.EMP_ID == id);
      this.ExisitngDeparture = this.ExistingEmployee[0]?.DEPT_DATE;
      this.ExistingReturn = this.ExistingEmployee[0]?.EXPECT_RETURN;
    });
  }

  minSelectableDate: Date = new Date(); // Or any logic

  isDateDisabledvalue = (data: { date: Date }) => {
    const dep = this.ExistingEmployee[0]?.DEPT_DATE;
    const ret = this.ExistingEmployee[0]?.EXPECT_RETURN;
    // const rejoinRaw = this.ExistingEmployee[0]?.REJOIN_DATE;

    if (!dep || !ret) return false;

    const depDate = new Date(dep);
    const retDate = new Date(ret);
    const current = data.date;
    // const rejoinDate = new Date(rejoinRaw)

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
      // Move it to the next day after EXPECT_RETURN
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

    return !(currentDate > depDate && currentDate <= retDate); // return false if overlapping
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

  //===================STATUS FLAG========================
  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open'; // White or gray
      case 'Verified':
        return 'flag-verified'; // Orange
      case 'Approved':
        return 'flag-approved'; // Green
      case 'Travelled':
        return 'flag-travelled'; // Blue
      case 'Rejoined':
        return 'flag-rejoined'; // Yellow
      case 'Left Service':
        return 'flag-left-service'; // Red
      default:
        return '';
    }
  }

  fixDate(date: any) {
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  }

  //==================Add Employee Leave========================
  Add_Data() {
    const currentDate = new Date(); // Instead of today
    currentDate.setHours(0, 0, 0, 0);

    let errors: string[] = [];

    // Get the selected date from the form safely
    const formDate = this.formsource.get('Date')?.value; // <-- Renamed from "Date"
    const Dept_date = this.fixDate(this.formsource.get('Dept_date')?.value);
    const Expected_rejoin_date = this.fixDate(
      this.formsource.get('Expected_rejoin_date')?.value,
    );

    const User_Id = this.UserId;
    const Store_Id = this.StoreId;
    // const DateControl = this.formsource.get('Date')?.value;
    // const Date = DateControl ? this.formatDate(DateControl) : null;
    //  const Date = this.formsource.get('Date')?.value;
    const selectedDate = this.formsource.get('Date')?.value;
    const Employee_no = this.formsource.get('Employee_no')?.value;
    const Leave_type = this.formsource.get('Leave_type')?.value;
    const Leave_days = this.formsource.get('Leave_days')?.value;
    const Leave_credit = this.formsource.get('Leave_credit')?.value;
    // const Dept_date = this.formsource.get('Dept_date')?.value;
    // const Expected_rejoin_date = this.formsource.get('Expected_rejoin_date')?.value;
    const Remarks = this.formsource.get('Remarks')?.value;
    const Leave_salary_payable =
      this.formsource.get('Leave_salary_payable')?.value === true;

    if (Leave_salary_payable && Leave_days > Leave_credit) {
      notify(
        {
          message: 'Leave days required cannot exceed leave days available',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return; // stop saving
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
        .subscribe((res: any) => {
          notify(
            {
              message: 'Data succesfully added',
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
    this.get_EmployeeLeaveList();
  }

  //==================Update Employee Leave========================
  Edit_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        Date,
        Employee_ID,
        Leave_type,
        Leave_days,
        Leave_credit,
        Dept_date,
        Expected_rejoin_date,
        Remarks,
        Leave_salary_payable,
        Is_ticket,
        Last_rejoin_date,
        Travelled_date,
        Rejoin_date,
        Actual_days,
        Deduct_days,
        Left_reason,
      )
      .subscribe((res: any) => {
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
        this.autofillExpectedRejoinDate();
      });
  }

  //===================Verify Employee Leave========================
Verify_Data() {
  const User_Id = sessionStorage.getItem('UserId');
  const Store_Id = sessionStorage.getItem('StoreId');
  const ID = this.selectedData.ID;
  const Date = this.selectedData.DOC_DATE;
  const Employee_ID = this.selectedData.EMP_ID;
  const Leave_type = this.selectedData.LEAVE_TYPE_ID;
  const Leave_days = this.selectedData.VAC_DAYS;
  const Leave_credit = this.selectedData.LEAVE_CREDIT;
  const Dept_date = this.selectedData.DEPT_DATE;
  const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
  const Remarks = this.selectedData.REMARKS;
  const Leave_salary_payable = this.selectedData.LS_PAYABLE;
  const Is_ticket = this.selectedData.IS_TICKET;
  const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
  const Travelled_date = this.selectedData.TRAVELLED_DATE;
  const Rejoin_date = this.selectedData.REJOIN_DATE;
  const Actual_days = this.selectedData.ACTUAL_DAYS;
  const Deduct_days = this.selectedData.DEDUCT_DAYS;
  const Left_reason = this.selectedData.LEFT_REASON;

  const result = confirm(
    'Are you sure you want to verify this Employee Leave?',
    'Confirm Verification'
  );

  result.then((dialogResult) => {
    if (dialogResult) {
      this.dataservice
        .Verify_EmployeeLeave_Api(
          User_Id,
          Store_Id,
          ID,
          Date,
          Employee_ID,
          Leave_type,
          Leave_days,
          Leave_credit,
          Dept_date,
          Expected_rejoin_date,
          Remarks,
          Leave_salary_payable,
          Is_ticket,
          Last_rejoin_date,
          Travelled_date,
          Rejoin_date,
          Actual_days,
          Deduct_days,
          Left_reason,
        )
        .subscribe((res: any) => {
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
  //===================Approve Employee Leave========================
 Approve_Data() {
  const User_Id = sessionStorage.getItem('UserId');
  const Store_Id = sessionStorage.getItem('StoreId');
  const ID = this.selectedData.ID;
  const Date = this.selectedData.DOC_DATE;
  const Employee_ID = this.selectedData.EMP_ID;
  const Leave_type = this.selectedData.LEAVE_TYPE_ID;
  const Leave_days = this.selectedData.VAC_DAYS;
  const Leave_credit = this.selectedData.LEAVE_CREDIT;
  const Dept_date = this.selectedData.DEPT_DATE;
  const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
  const Remarks = this.selectedData.REMARKS;
  const Leave_salary_payable = this.selectedData.LS_PAYABLE;
  const Is_ticket = this.selectedData.IS_TICKET;
  const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
  const Travelled_date = this.selectedData.TRAVELLED_DATE;
  const Rejoin_date = this.selectedData.REJOIN_DATE;
  const Actual_days = this.selectedData.ACTUAL_DAYS;
  const Deduct_days = this.selectedData.DEDUCT_DAYS;
  const Left_reason = this.selectedData.LEFT_REASON;

  const result = confirm(
    'Are you sure you want to approve this Employee Leave?',
    'Confirm Approval'
  );

  result.then((dialogResult) => {
    if (dialogResult) {
      this.dataservice
        .Approve_EmployeeLeave_Api(
          User_Id,
          Store_Id,
          ID,
          Date,
          Employee_ID,
          Leave_type,
          Leave_days,
          Leave_credit,
          Dept_date,
          Expected_rejoin_date,
          Remarks,
          Leave_salary_payable,
          Is_ticket,
          Last_rejoin_date,
          Travelled_date,
          Rejoin_date,
          Actual_days,
          Deduct_days,
          Left_reason,
        )
        .subscribe((res: any) => {
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

  //===================View Employee Leave========================
  View_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        Date,
        Employee_ID,
        Leave_type,
        Leave_days,
        Leave_credit,
        Dept_date,
        Expected_rejoin_date,
        Remarks,
        Leave_salary_payable,
        Is_ticket,
        Last_rejoin_date,
        Travelled_date,
        Rejoin_date,
        Actual_days,
        Deduct_days,
        Left_reason,
      )
      .subscribe((res: any) => {
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

  //===============get Dropdown List=======================
  get_LeaveType_Dropdown_List() {
    const payload = {
      NAME: 'LEAVE_TYPES',
    };
    this.dataservice
      .get_LeaveType_Dropdown_Api(payload)
      .subscribe((response: any) => {
        this.LeaveType = response;

        // this.Ledger = response.Hospitals;
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

  //=================get Employee dropdown list=================
  get_Employee_Dropdown_List() {
    const payload = {
      NAME: 'EMPLOYEE',
      COMPANY_ID: this.COMPANY_ID,
    };
    this.dataservice
      .Dropdown_eos_employee(payload)
      .subscribe((response: any) => {
        this.Employee = response;

        // this.Ledger = response.Hospitals;
      });
  }

  //=====================get EOS dropdown list===================
  get_EOS_Dropdown_List() {
    const payload = {
      NAME: 'EOS_REASON',
    };
    this.dataservice
      .get_EOS_Dropdown_Api(payload)
      .subscribe((response: any) => {
        this.Left_service = response;

        // this.Ledger = response.Hospitals;
      });
  }

  Select_EmployeeLeave(event: any) {
    const ID = event;

    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      // Convert LEFT_REASON to a number if needed (depends on your Left_service ID types)
      response.LEFT_REASON = Number(response.LEFT_REASON);

      this.selectedData = response;
      // Set the selected status type based on the response
      setTimeout(() => {
        this.selectedStatusType = this.selectedData.STATUS;
      }, 0);
    });
  }

  Delete_Data(event: any) {
    const ID = event.data.ID;
    this.dataservice.Delete_EmployeeLeave_Api(ID).subscribe((response: any) => {
      notify(
        {
          message: 'Data succesfully deleted',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );

      this.get_EmployeeLeaveList();
    });
  }

  Travel_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;

    this.dataservice
      .Update_EmployeeLeave_Api(
        User_Id,
        Store_Id,
        ID,
        Date,
        Employee_ID,
        Leave_type,
        Leave_days,
        Leave_credit,
        Dept_date,
        Expected_rejoin_date,
        Remarks,
        Leave_salary_payable,
        Is_ticket,
        Last_rejoin_date,
        Travelled_date,
        Rejoin_date,
        Actual_days,
        Deduct_days,
        Left_reason,
      )
      .subscribe((res: any) => {
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
        this.autofillExpectedRejoinDate();
      });
  }

 Rejoin_Data() {
  this.selectedData.STATUS = this.selectedStatusType;

  // Validation BEFORE API
  if (this.selectedStatusType === 'Left Service' && !this.selectedData.LEFT_REASON) {
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

  if (this.selectedStatusType === 'Rejoined' && !this.selectedData.REJOIN_DATE) {
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
  const CurrentDate = this.selectedData.DOC_DATE;
  const Employee_ID = this.selectedData.EMP_ID;
  const Leave_type = this.selectedData.LEAVE_TYPE_ID;
  const Leave_days = this.selectedData.VAC_DAYS;
  const Leave_credit = this.selectedData.LEAVE_CREDIT;
  const Dept_date = this.selectedData.DEPT_DATE;
  const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
  const Remarks = this.selectedData.REMARKS;
  const Leave_salary_payable = this.selectedData.LS_PAYABLE;
  const Is_ticket = this.selectedData.IS_TICKET;
  const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
  const Travelled_date = this.selectedData.TRAVELLED_DATE;
  const Rejoin_date = this.selectedData.REJOIN_DATE;
  const Actual_days = this.selectedData.ACTUAL_DAYS;
  const Deduct_days = this.selectedData.DEDUCT_DAYS;
  const Left_reason = this.selectedData.LEFT_REASON;

  this.dataservice
    .Update_EmployeeLeave_Api(
      User_Id,
      Store_Id,
      ID,
      CurrentDate,
      Employee_ID,
      Leave_type,
      Leave_days,
      Leave_credit,
      Dept_date,
      Expected_rejoin_date,
      Remarks,
      Leave_salary_payable,
      Is_ticket,
      Last_rejoin_date,
      Travelled_date,
      Rejoin_date,
      Actual_days,
      Deduct_days,
      Left_reason,
    )
    .subscribe((res: any) => {
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
      this.autofillExpectedRejoinDate();
    });
}
  onStatusChange(status: string) {
    this.selectedStatusType = status;

    if (status === 'Rejoined') {
      // Only set today's date if REJOIN_DATE is empty
      if (!this.selectedData.REJOIN_DATE) {
        this.selectedData.REJOIN_DATE = new Date();
      }
    } else {
      this.selectedData.REJOIN_DATE = null;
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
