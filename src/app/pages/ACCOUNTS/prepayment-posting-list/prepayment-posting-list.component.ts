// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxLookupModule,
  DxDataGridComponent,
  DxPopupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import {
  PrepaymentPostingAddComponent,
  PrepaymentPostingAddModule,
} from '../../PrePayment Posting/prepayment-posting-add/prepayment-posting-add.component';
import { PrepaymentPostingEditModule } from '../../PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
@Component({
  selector: 'app-prepayment-posting-list',
  templateUrl: './prepayment-posting-list.component.html',
  styleUrls: ['./prepayment-posting-list.component.scss'],
})
export class PrepaymentPostingListComponent {
  @ViewChild(PrepaymentPostingAddComponent)
  PrepaymentPostingAddComponent: PrepaymentPostingAddComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  selectedRows: any[] = [];

  // Paging

  allowedPageSizes: number[] = [5, 10, 20];
  displayMode: any;
  showPageSizeSelector: boolean = true;
  isEditPopupPrepaymentPosting: boolean = false;
  // Calendar/month selector
  selectedMonth: Date = new Date();
  selectedYear: number = new Date().getFullYear();
  calendarVisible: boolean = false;
  yearSelectorVisible: boolean = false;
  isAddPopupPrepaymentPosting: boolean = false;
  selectedMonthForAdd: any;
  StatusType: any
  prepaymentList: any;
  // editPackPopupOpened:boolean
  years: number[] = [];
  months = Array.from({ length: 12 }, (_, i) => new Date(2022, i, 1)); // Example for 2022
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

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.openPopup());
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.TRANS_STATUS?.trim() === 'Open',
    },
  ];

  selecte_prepayment_Data: any;
  isEditReadOnly: boolean = false;
  prepaymentpostingId: any;
  selectedprepaymentposting: any;
  selected_Company_id: any;
  isFilterOpened: boolean;
  companyID: any;
  canVerify: any;
  constructor(
    private ngZone: NgZone,
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
  }
  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify
    }

    // this.getAccountsGroupList();
  }
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verify'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approved' ? 'Approved' : status === 'Verify' ? 'Verify' : 'Open';

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
      text: 'Open',
      value: 'Open',
    },
    {
      text: 'Verified',
      value: 'Verified',
    },
  ];
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.get_prepayment_posting_list();

  }
  get_prepayment_posting_list() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Prepayment_posting_list(payload).subscribe((res: any) => {
      this.prepaymentList = res.Data
        // filter by selectedMonth
        .filter((item: any) =>
          this.isSameMonthYear(item.TRANS_DATE, this.selectedMonth),
        )
        // add serial number
        .map((item: any, index: number) => ({
          ...item,
          SNO: index + 1,
        }));
      if (this.prepaymentList.TRANS_STATUS == 'Approved') {
        this.isEditReadOnly = true;
      }
    });
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  // get_prepayment_posting_list(){
  //   this.dataservice.Prepayment_posting_list().subscribe((res:any)=>{
  //
  //     // this.prepaymentList=res.Data
  //         // Add serial number
  //   this.prepaymentList = res.Data.map((item: any, index: number) => ({
  //     ...item,
  //     SNO: index + 1   // serial number starts from 1
  //   }));

  //   })
  // }

  getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);

    return Status == 'Open' ? 'flag-oranged' : 'flag-green';
  }

  onEditPrePayment(e: any) {
    this.StatusType = 'Editscreen'

    e.cancel = true;
    this.isEditPopupPrepaymentPosting = true;
    this.selected_Data(e);
  }

  selected_Data(e: any) {
    const id = e.data.TRANS_ID;
    this.prepaymentpostingId = e.data.TRANS_ID;
    this.selectedprepaymentposting = id;
    this.dataservice.select_Prepayment_Posting(id).subscribe((Res: any) => {
      this.selecte_prepayment_Data = Res.Data;
    });
  }
  openPopup() {
    this.isAddPopupPrepaymentPosting = true;
    this.PrepaymentPostingAddComponent.get_prepayment_pending_list();
  }
  handleClose() {
    this.isAddPopupPrepaymentPosting = false;
    this.get_prepayment_posting_list();
    this.isEditPopupPrepaymentPosting = false;
  }
  onDeletePrepayment(event: any) {
    event.cancel = true;
    console.log(event, '=============')

    if (event.data.TRANS_STATUS === 'Approved') {
      event.cancel = true;
      notify('Prepayment posting cannot be deleted.', 'error', 2000);
      return;
    }
    const id = event.data.TRANS_ID;
    this.dataservice.Delete_Prepayment_Posting(id).subscribe((res: any) => {
      notify(
        {
          message: 'Prepayment Deleted successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
    });

    this.get_prepayment_posting_list();
  }
  isSameMonthYear(transDate: string, selectedMonth: Date): boolean {
    if (!transDate) return false;

    // TRANS_DATE is dd-MM-yyyy
    const [day, month, year] = transDate.split('-').map(Number);
    const itemDate = new Date(year, month - 1, day);

    return (
      itemDate.getMonth() === selectedMonth.getMonth() &&
      itemDate.getFullYear() === selectedMonth.getFullYear()
    );
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    // this.getTimesheet();

    console.log(
      this.selectedMonth,
      '=========== this.selectedMonth====================',
    );
    console.log(this.formatToQuarterEnd(this.selectedMonth));
    this.get_prepayment_posting_list();
  }
  formatToQuarterEnd(dateInput: Date | string): string {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return ''; // invalid date check

    // Keep the original date as it is
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  }

  toggleCalendar() { }
  selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

    this.calendarVisible = false;

    // Hide calendar after selection (optional)
  }
  onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
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

    // this.getTimesheet();
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }
  nextYear() {
    this.selectedYear++;
  }
  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
    console.log('User selected:', this.selectedRows);
  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }
  previousYear() {
    this.selectedYear--;
  }
  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;

    console.log(
      this.selectedMonth,
      '=========== this.selectedMonth====================',
    );
    console.log(this.formatToQuarterEnd(this.selectedMonth));
    this.get_prepayment_posting_list();
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.cdr.detectChanges(); // optional
      this.get_prepayment_posting_list();
    }
  }
  onVerifyClick(e: any) {
    e.cancel = true;
    this.StatusType = 'verifyscreen'

    this.isEditPopupPrepaymentPosting = true;
    const id = e.row.data.TRANS_ID;
    this.prepaymentpostingId = e.row.data.TRANS_ID;
    this.selectedprepaymentposting = id;
    this.dataservice.select_Prepayment_Posting(id).subscribe((Res: any) => {
      this.selecte_prepayment_Data = Res.Data;
    });
  }


}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule,
    DxPopupModule,
    PrepaymentPostingAddModule,
    PrepaymentPostingEditModule,
  ],
  providers: [],
  declarations: [PrepaymentPostingListComponent],
  exports: [PrepaymentPostingListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrepaymentPostingListModule { }
