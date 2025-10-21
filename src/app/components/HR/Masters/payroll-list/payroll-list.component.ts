import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { PayrollAddModule } from '../payroll-add/payroll-add.component';
import notify from 'devextreme/ui/notify';
import { PayrollVerifyModule } from '../payroll-verify/payroll-verify.component';
import { PayrollApproveModule } from '../payroll-approve/payroll-approve.component';
import { PayrollViewModule } from '../payroll-view/payroll-view.component';
import { PayrollEditModule } from '../payroll-edit/payroll-edit.component';
import { confirm } from 'devextreme/ui/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.scss'],
})
export class PayrollListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  GridSource: any;
  isLoading: boolean = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  payrollList: any;
  CompanyID = 1;
   canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addPayroll(),
    onClick: () => {
      this.zone.run(() => {
        this.addPayroll();
      });
    },
    elementAttr: { class: 'add-button' },
  };

  approveButtonOptions = {
    icon: 'check',
    text: 'Approve',
    type: 'default',
    stylingMode: 'outlined',
    hint: 'Approve selected payrolls',
    disabled: true, // Initially disabled
    onClick: () => {
      this.approveSelectedPayroll();
    },
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
      // onClick: (e) => this.onDeleteClick(e),
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },
  ];
  selectedMonth: Date = new Date();
  selectedMonthForAdd: string;
  calendarVisible = false;
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
  selectedYear: number;
  yearSelectorVisible = false;
  years: number[] = [];
  addPayrollPopupOpened: boolean = false;
  editPayrollPopupOpened: boolean = false;
  verifyPayrollPopupOpened: boolean = false;
  approvePayrollPopupOpened: boolean = false;
  viewPayrollPopupOpened: boolean = false;
  selectedPayroll: any;
  startYear = 2010;

  @ViewChild('popup') popupRef!: ElementRef;
  selectedRowCount: any;
  companyList: any[];
  selectedCompanyId: any;
  userId: any;
  finId: any;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

  previousYearButtonOptions = {
    text: '<', // or use icon: 'chevronleft'
    stylingMode: 'text', // or 'outlined'
    onClick: () => this.previousYear(),
    elementAttr: {
      class: 'year-button',
    },
  };

  nextYearButtonOptions = {
    text: '>', // or icon: 'chevronright'
    stylingMode: 'text',
    onClick: () => this.nextYear(),
    elementAttr: {
      class: 'year-button',
    },
  };

  constructor(private dataService: DataService, private zone: NgZone,private router: Router) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.companyList = [selectedCompany]; // Show only selected company
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }

      // Also store USER_ID / FIN_ID if needed later
      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.selectedYear = this.selectedMonth.getFullYear();


      const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/payroll');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.getPayrollList();
    this.generateYears();
  }

  getSelectedRows() {
    const selectedRows = this.dataGrid.instance.getSelectedRowsData();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }
  approveSelectedPayroll() {
    const selectedRows = this.dataGrid.instance.getSelectedRowsData();

    if (selectedRows.length === 0) {
      alert('Please select at least one row to approve.');
      return;
    }

    const result = confirm(
      'This will approve the salary. Are you sure?',
      'Confirm Approval'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const payload = {
          COMPANY_ID: this.selectedCompanyId,
          USER_ID: this.userId,
          PAYDETAIL_ID: selectedRows.map((row: any) => row.SALARY_BILL_NO),
        };

        console.log('Approval Payload:', payload);

        this.dataService.approvePayroll(payload).subscribe((response: any) => {
          notify('Payroll approved successfully.', 'success', 3000);
          this.dataGrid.instance.clearSelection();
          this.getPayrollList();
        });
      }
    });
  }

  onSelectionChanged(event: any) {
    const selected = event.selectedRowKeys?.length > 0;
    this.approveButtonOptions = {
      ...this.approveButtonOptions,
      disabled: !selected,
    };
  }

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
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

    this.calendarVisible = false;

    // Hide calendar after selection (optional)
  }
  updateMonthLabel() {
    // This is automatically updated with the selectedMonth binding in the template
  }
  onMonthandYearChanged(e: any) {
    if (e.value) {
      const updatedMonth = new Date(e.value);
      this.selectedMonth = new Date(
        updatedMonth.getFullYear(),
        updatedMonth.getMonth() - 1,
        1
      );
      this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString(
        'en-US',
        { month: 'long', year: 'numeric' }
      );
    }
  }

  isDisabledYear(year: number): boolean {
    return year < 2010 || year > 2019;
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
    event.stopPropagation(); // Prevent calendar from closing
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

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    this.getPayrollList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.getPayrollList();
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.getPayrollList();
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open'; // White or gray
      case 'Verified':
        return 'flag-verified'; // Orange
      case 'Approved':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  toggleFilterRow(): void {
    setTimeout(() => {
      this.filterRowVisible = !this.filterRowVisible;
    });
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'Approved' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'Approved' ? 'Approved' : 'Pending';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Pending',
      value: 'Pending',
    },
  ];

  getPayrollList() {
    const payload = {
      COMPANY_ID: this.CompanyID,
    };

    this.dataService.getPayrollList(payload).subscribe((response: any) => {
      console.log('Payroll List Response:', response);

      const selectedMonth = this.selectedMonth.getMonth();
      const selectedYear = this.selectedMonth.getFullYear();

      this.payrollList = (response.Data || []).filter((item: any) => {
        const salMonth = new Date(item.SAL_MONTH);
        return (
          salMonth.getMonth() === selectedMonth &&
          salMonth.getFullYear() === selectedYear
        );
      });

      console.log(this.payrollList, 'Filtered payrollList for selected month');
    });
  }

  getStatusText = (rowData: any) => {
    return rowData.STATUS === 'Approved' ? 'Approved' : '';
  };

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}-${month}-${year}`; // ✅ dd-MM-yyyy format
  }

  addPayroll() {
    this.addPayrollPopupOpened = true;
  }

  onEditOrViewPayroll(e: any) {
    e.cancel = true;
    const payrollId = e.data.SALARY_BILL_NO;
    console.log(payrollId, e, 'selectedpayloadid');
    const payload = { PAYDETAIL_ID: payrollId };
    this.dataService.viewSelectedPayroll(payload).subscribe({
      next: (response: any) => {
        this.selectedPayroll = response;
        console.log(this.selectedPayroll, 'SELECTEDPAYROLL');
        const actionButton = this.allActionButtons.find(
          (btn) => btn.name === 'edit'
        );
        if (actionButton) {
          let hintText = 'Edit'; // default
          if (this.selectedPayroll.STATUS === 'Approved') {
            hintText = 'View';
          } else if (this.selectedPayroll.STATUS !== 'Pending') {
            hintText = ''; // or some other default
          }
          actionButton.hint = hintText;
          actionButton.text = hintText;
        }

        if (this.selectedPayroll.STATUS === 'Approved') {
          this.viewPayrollPopupOpened = true;
        } else {
          console.log('editpopup');
          this.editPayrollPopupOpened = true;
        }
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onVerifyClick(e: any): void {
    // console.log('Verify clicked:', e); // <-- Add this

    e.cancel = true;
    const payrollId = e.row?.data?.ID;

    if (!payrollId) {
      console.warn('No Employee ID found in row data');
      return;
    }

    this.dataService.selectPayroll(payrollId).subscribe({
      next: (response: any) => {
        // console.log('Salary revision fetched:', response); // <-- Add this

        this.selectedPayroll = response;
        this.verifyPayrollPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onApproveClick(e: any): void {
    // console.log('Verify clicked:', e); // <-- Add this

    e.cancel = true;
    const payrollId = e.row?.data?.ID;

    if (!payrollId) {
      console.warn('No Employee ID found in row data');
      return;
    }

    this.dataService.selectPayroll(payrollId).subscribe({
      next: (response: any) => {
        // console.log('Salary revision fetched:', response); // <-- Add this

        this.selectedPayroll = response;
        this.approvePayrollPopupOpened = true;
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onDeletePayroll(e: any) {
    console.log(e);
    const TS_ID = e.data.TS_ID;
    e.cancel = true;

    this.dataService.deletePayroll(TS_ID).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Payroll Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getPayrollList();
        } else {
          notify(
            {
              message: 'Your data was not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {
        console.error('Error deleting payroll:', error);
        notify(
          {
            message: 'Error deleting payroll',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    );
  }

  handleClose() {
    this.addPayrollPopupOpened = false; // closes the popup
    this.editPayrollPopupOpened = false;
    this.verifyPayrollPopupOpened = false;
    this.approvePayrollPopupOpened = false;
    this.viewPayrollPopupOpened = false;
    this.getPayrollList();
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
