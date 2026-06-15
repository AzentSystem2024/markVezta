import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
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
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { PdcAddFormModule } from '../../../components/HR/Masters/PDC/pdc-add-form/pdc-add-form.component';
import { PdcEditFormModule } from '../../../components/HR/Masters/PDC/pdc-edit-form/pdc-edit-form.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { pack } from 'html2canvas/dist/types/css/types/color';

@Component({
  selector: 'app-pdc-list',
  templateUrl: './pdc-list.component.html',
  styleUrls: ['./pdc-list.component.scss'],
})
export class PdcListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  isEditReadOnly: boolean = false;
  popupMode: 'new' | 'edit' | 'verify' | 'approve' | 'view' = 'new';
  popupTitle = 'New PDC';

  setPopupMode(mode: 'new' | 'edit' | 'verify' | 'approve' | 'view') {
    this.popupMode = mode;

    switch (mode) {
      case 'new':
        this.popupTitle = 'New PDC';
        break;
      case 'edit':
        this.popupTitle = 'Edit PDC';
        break;
      case 'verify':
        this.popupTitle = 'Verify PDC';
        break;
      case 'approve':
        this.popupTitle = 'Approve PDC';
        break;
      case 'view':
        this.popupTitle = 'View PDC';
        break;
    }
  }

  PDCListDataSource: any[] = [];
  fullPDCList: any[] = [];
  selectedPDC: any;
  readonly allowedPageSizes: any = [10, 20, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  addPDCPopupOpened: boolean = false;
  editPDCPopupOpened: boolean = false;
  VerifyPDCPopupOpened: boolean = false;
  selectedEmployee: any;
  selectedDateRange: any = 'today';
  selectedEntryDateRange: any = 'today';
  startDate: Date;
  EndDate: Date;
  entrystartDate: Date;
  entryEndDate: Date;
  customStartDate: any = null;
  customEndDate: any = null;
  entrycustomStartDate: any = null;
  entrycustomEndDate: any = null;

  canAdd = false;
  canEdit = false;
  canVerify = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  showCustomDatePopup: boolean = false;
  showEntryCustomDatePopup: boolean = false;
  selectedStatusId: number | null = null;

  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  dateRanges = [
    //  {
    //   label: 'All',
    //   value: 'all',
    // },
    {
      label: 'Today',
      value: 'today',
    },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    {
      label: 'Custom',
      value: 'custom',
    },
  ];

  entryDateRanges = [
    //   {
    //   label: 'All',
    //   value: 'all',
    // },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  priorities = [
    { id: 1, name: 'Issued' },
    { id: 2, name: 'Received' },
  ];

  StatusfilterOptions = [
    { id: 1, name: 'Open' },
    { id: 2, name: 'Approved' },
    { id: 3, name: 'Closed' },
    { id: 4, name: 'Verified' },
  ];

  selectedStatus = this.StatusfilterOptions[0].id;
  selectedType = this.priorities[0]; // default to 'Issued'

  // selectedStatusFilterAction = this.StatusfilterOptions.find((p) => p.id === 1);

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
      this.ngZone.run(() => this.addPDC());
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
  selectPDC: any;
  PDCid: any;
  selected_Company_id: any;
  isFilterOpened: boolean;

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'PDC';
    this.dataservice.exportDataGrid(event, fileName);
  }

  onStatusChanged() {
    // this.applyChequeFilters();  // Call your centralized filtering logic
    this.applyAllFilters();
  }

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

    this.sesstion_Details();

    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.entrycustomStartDate = SystemDate;
    this.entrycustomEndDate = SystemDate;

    //  Initialize default Due Date = Today

    this.startDate = new Date();
    this.startDate.setHours(0, 0, 0, 0);

    this.EndDate = new Date();
    this.EndDate.setHours(23, 59, 59, 999);

    //  Initialize default Entry Date = Today
    this.entrystartDate = new Date();
    this.entrystartDate.setHours(0, 0, 0, 0);

    this.entryEndDate = new Date();
    this.entryEndDate.setHours(23, 59, 59, 999);

    this.get_PDC_list();
  }

  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.entrycustomStartDate = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.entrycustomEndDate = today; // Today's date
    } else {
      this.entrycustomStartDate = new Date(this.selectedYear, 0, 1); // January 1
      this.entrycustomEndDate = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.entrycustomStartDate = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.entrycustomEndDate = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.entrycustomStartDate = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.entrycustomEndDate = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
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

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_PDC_list();
  }

  onDateRangeChanged(e: any) {
    const today = new Date();
    this.selectedDateRange = e.value;

    if (e.value === 'today') {
      const start = new Date();
      start.setDate(today.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      this.startDate = start;
      this.EndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'all') {
      this.selectedEntryDateRange = 'all';
      const payload = {
        COMPANY_ID: this.selected_Company_id,
      };
      this.dataservice.get_PDC_List(payload).subscribe((res: any) => {
        this.PDCListDataSource = res.Data;

        //       this.onDateRangeChanged({ value: this.selectedDateRange });
        //       this.onEntryDateRangeChanged({ value: this.selectedEntryDateRange});
      });
    } else if (e.value === 'last7') {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      this.startDate = start;
      this.EndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'last15') {
      const start = new Date();
      start.setDate(today.getDate() - 14);
      start.setHours(0, 0, 0, 0);
      this.startDate = start;
      this.EndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'last30') {
      this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.startDate.setHours(0, 0, 0, 0);
      this.EndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    this.showCustomDatePopup = false;
    this.get_PDC_list();
  }

  onEntryDateRangeChanged(e: any) {
    const today = new Date();
    this.selectedEntryDateRange = e.value;

    if (e.value === 'today') {
      this.entrystartDate = new Date(today.setHours(0, 0, 0, 0));
      this.entryEndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'all') {
      this.selectedDateRange = 'all';
      const payload = {
        COMPANY_ID: this.selected_Company_id,
      };
      this.dataservice.get_PDC_List(payload).subscribe((res: any) => {
        this.PDCListDataSource = res.Data;

        //       this.onDateRangeChanged({ value: this.selectedDateRange });
        //       this.onEntryDateRangeChanged({ value: this.selectedEntryDateRange});
      });
    } else if (e.value === 'last7') {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      this.entrystartDate = start;
      this.entryEndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'last15') {
      const start = new Date();
      start.setDate(today.getDate() - 14);
      start.setHours(0, 0, 0, 0);
      this.entrystartDate = start;
      this.entryEndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'last30') {
      this.entrystartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.entrystartDate.setHours(0, 0, 0, 0);
      this.entryEndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'custom') {
      this.showEntryCustomDatePopup = true;
      return; // IMPORTANT: exit here to prevent closing popup below
    }

    // Only close popup if NOT custom
    this.showEntryCustomDatePopup = false;

    this.get_PDC_list();
  }

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();
    this.get_PDC_list();
  }

  addPDC() {
    this.setPopupMode('new');
    this.addPDCPopupOpened = true;
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.ENTRY_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Closed'
        ? '#EF4444'
        : status === 'Approved'
          ? '#10B981' // Approved
          : status === 'Verified'
            ? '#0073D8' // Verified
            : '#FFA500'; // Open
    icon.title =
      status === 'Closed'
        ? 'Closed'
        : status === 'Approved'
          ? 'Approved'
          : status === 'Verified'
            ? 'Verified'
            : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  //=========for open custom popup in due ===========
  handleDueDateItemClick(e: any) {
    if (e.itemData.value === 'custom') {
      this.showCustomDatePopup = true;
    }
  }

  //==============for open custom popup in entry============
  handleEntryDateItemClick(e: any) {
    if (e.itemData.value === 'custom') {
      this.showEntryCustomDatePopup = true;
    }
  }

  //====to show the selected custom date range in due==========
  displayDueDateExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.startDate && this.EndDate) {
      const from = this.formatAsDDMMYYYY(this.startDate);
      const to = this.formatAsDDMMYYYY(this.EndDate);
      return `${from} to ${to}`;
    }

    return item.label;
  };

  //====to show the selected custom date range in entry==========
  displayEntryDateExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.entrystartDate && this.entryEndDate) {
      const from = this.formatAsDDMMYYYY(this.entrystartDate);
      const to = this.formatAsDDMMYYYY(this.entryEndDate);
      return `${from} to ${to}`;
    }

    return item.label;
  };

  // ========Due custom date===============
  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) {
      alert('Please select both From and To dates.');
      return;
    }

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      alert('From Date cannot be after To Date.');
      return;
    }

    //  ONLY update Due Date
    this.startDate = start;
    this.EndDate = end;

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.get_PDC_list();
  }

  // =======Entry custom date=============
  applyEntryCustomDateFilter() {
    if (!this.entrycustomStartDate || !this.entrycustomEndDate) {
      alert('Please select both From and To dates.');
      return;
    }

    const entrystart = new Date(this.entrycustomStartDate);
    entrystart.setHours(0, 0, 0, 0);

    const entryend = new Date(this.entrycustomEndDate);
    entryend.setHours(23, 59, 59, 999);

    if (entrystart > entryend) {
      alert('From Date cannot be after To Date.');
      return;
    }

    //  ONLY update Entry Date
    this.entrystartDate = entrystart;
    this.entryEndDate = entryend;

    this.selectedEntryDateRange = 'custom';
    this.showEntryCustomDatePopup = false;

    this.get_PDC_list();
  }

  onTypeChanged(event: any) {
    this.selectedType = event.value;
    // this.applyChequeFilters();
    this.applyAllFilters();
  }

  applyChequeFilters() {
    const selectedType = this.selectedType?.name; // 'Issued' or 'Received'
    const selectedStatus = this.selectedStatus;

    this.PDCListDataSource = this.fullPDCList.filter((item: any) => {
      const isIssued = item.IS_PAYMENT === true;

      const typeMatch =
        !selectedType ||
        (selectedType === 'Issued' && isIssued) ||
        (selectedType === 'Received' && !isIssued);

      const statusMatch =
        !selectedStatus ||
        (selectedStatus === 1 && item.ENTRY_STATUS === 'Open') ||
        (selectedStatus === 2 && item.ENTRY_STATUS === 'Approved') ||
        (selectedStatus === 3 && item.ENTRY_STATUS === 'Closed') ||
        (selectedStatus === 4 && item.ENTRY_STATUS === 'Verified');

      return typeMatch && statusMatch;
    });
  }

  parseDDMMYYYY(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(+year, +month - 1, +day); // month is 0-indexed
  }

  applyAllFilters() {
    const type = this.selectedType?.name;
    const status = this.selectedStatus;

    const dueStart = this.startDate;
    const dueEnd = this.EndDate;

    const entryStart = this.entrystartDate;
    const entryEnd = this.entryEndDate;

    this.PDCListDataSource = this.fullPDCList.filter((item: any) => {
      const isIssued = item.IS_PAYMENT === true;

      const typeMatch =
        !type ||
        (type === 'Issued' && isIssued) ||
        (type === 'Received' && !isIssued);

      const statusMatch =
        !status ||
        (status === 1 && item.ENTRY_STATUS?.trim() === 'Open') ||
        (status === 2 && item.ENTRY_STATUS?.trim() === 'Approved') ||
        (status === 3 && item.ENTRY_STATUS?.trim() === 'Closed') ||
        (status === 4 && item.ENTRY_STATUS?.trim() === 'Verified');

      let chequeDateValid = true;
      if (dueStart && dueEnd && item.CHEQUE_DATE) {
        const chequeDate = this.parseDDMMYYYY(item.CHEQUE_DATE);
        chequeDateValid = chequeDate >= dueStart && chequeDate <= dueEnd;
      }

      let entryDateValid = true;
      if (entryStart && entryEnd && item.ENTRY_DATE) {
        const entryDate = this.parseDDMMYYYY(item.ENTRY_DATE);
        entryDateValid = entryDate >= entryStart && entryDate <= entryEnd;
      }

      return typeMatch && statusMatch && chequeDateValid && entryDateValid;
    });
  }

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.ENTRY_STATUS?.trim() === 'Open',
    },
  ];

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
  ];

  onVerifyInvoice(e: any) {
    e.cancel = true;
    const status = e.row.data?.ENTRY_STATUS?.trim();
    if (status === 'Verified') {
      this.setPopupMode('approve');
      this.isEditReadOnly = false;
    } else if (status === 'Approved' || status === 'Closed') {
      this.setPopupMode('view');
      this.isEditReadOnly = true;
    } else {
      this.setPopupMode('verify');
      this.isEditReadOnly = false;
    }
    //  this.isEditReadOnly =
    // status === 'Approved' || status === 'Closed';
    this.VerifyPDCPopupOpened = true;
    this.selectedVerify_PDC(e);
  }

  onEditPDC(event: any) {
    event.cancel = true;
    const status = event.data?.ENTRY_STATUS?.trim();
    if (status === 'Approved' || status === 'Closed') {
      this.setPopupMode('view');
      this.isEditReadOnly = true;
    } else {
      this.setPopupMode('edit');
      this.isEditReadOnly = false;
    }
    //  this.isEditReadOnly =
    // status === 'Approved' || status === 'Closed';
    this.editPDCPopupOpened = true;
    this.selected_PDC(event);
  }

  selectedVerify_PDC(event: any) {
    const id = event.row.data.ID;
    this.PDCid = id;
    this.selectPDC = id;

    this.dataservice.Select_PDC(id).subscribe((res: any) => {
      this.selectedPDC = {
        ...res.Data[0],
        ENTRY_STATUS: (res.Data[0].ENTRY_STATUS || '').trim(),
      };

      this.selectedPDC.BENEFICIARY_TYPE =
        this.selectedPDC.BENEFICIARY_TYPE?.id ||
        this.selectedPDC.BENEFICIARY_TYPE ||
        null;
    });
  }

  selected_PDC(event: any) {
    const id = event.data.ID;
    this.PDCid = id;
    this.selectPDC = id;

    this.dataservice.Select_PDC(id).subscribe((res: any) => {
      this.selectedPDC = {
        ...res.Data[0],
        ENTRY_STATUS: (res.Data[0].ENTRY_STATUS || '').trim(),
      };

      this.selectedPDC.BENEFICIARY_TYPE =
        this.selectedPDC.BENEFICIARY_TYPE?.id ||
        this.selectedPDC.BENEFICIARY_TYPE ||
        null;
    });
  }

  DeletePDC(event: any) {
    const id = event.data.ID;
    this.dataservice.Delete_PDC(id).subscribe((res: any) => {
      if (res.Message === 'Success') {
        notify(
          {
            message: 'Deleted successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      }
      // this.selectedPDC =res.Data[0]
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDueDateRangePayload(): {
    DUE_DATE_FROM: string | null;
    DUE_DATE_TO: string | null;
  } {
    let fromDate: Date | null = this.startDate || null;
    let toDate: Date | null = this.EndDate || null;

    return {
      DUE_DATE_FROM: fromDate ? this.formatDate(fromDate) : null,
      DUE_DATE_TO: toDate ? this.formatDate(toDate) : null,
    };
  }

  private getEntryDateRangePayload(): {
    ENTRY_DATE_FROM: string | null;
    ENTRY_DATE_TO: string | null;
  } {
    let fromDate: Date | null = this.entrystartDate || null;
    let toDate: Date | null = this.entryEndDate || null;

    return {
      ENTRY_DATE_FROM: fromDate ? this.formatDate(fromDate) : null,
      ENTRY_DATE_TO: toDate ? this.formatDate(toDate) : null,
    };
  }

  get_PDC_list(dateRange: string = this.selectedDateRange) {
    const dueDatePayload = this.getDueDateRangePayload();
    const entryDatePayload = this.getEntryDateRangePayload();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      ...dueDatePayload,
      ...entryDatePayload,
    };
    this.dataservice.get_PDC_List(payload).subscribe((res: any) => {
      this.fullPDCList = res.Data;

      // this.onDateRangeChanged({ value: this.selectedDateRange });
      // this.onEntryDateRangeChanged({ value: this.selectedEntryDateRange });

      // Apply all filters together
      this.applyAllFilters();

      // this.applyChequeFilters(); // Filter after loading
      // // this.applyEntryFilters();
      // this.applyDueDateChequeFilters();
    });
  }

  handleClose() {
    this.addPDCPopupOpened = false;
    this.editPDCPopupOpened = false;
    this.VerifyPDCPopupOpened = false;
    this.get_PDC_list();
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
    DxDataGridModule,
    DxoItemModule,
    DxoFormItemModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    PdcAddFormModule,
    PdcEditFormModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [PdcListComponent],
  exports: [PdcListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdcListModule {}
