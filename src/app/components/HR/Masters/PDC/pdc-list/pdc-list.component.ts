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
import { PdcAddFormModule } from '../pdc-add-form/pdc-add-form.component';
import { PdcEditFormModule } from '../pdc-edit-form/pdc-edit-form.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-pdc-list',
  templateUrl: './pdc-list.component.html',
  styleUrls: ['./pdc-list.component.scss'],
})
export class PdcListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  isEditReadOnly: boolean = false;

  PDCListDataSource: any[] = [];
  fullPDCList: any[] = [];
  selectedPDC: any;
  readonly allowedPageSizes: any = [10, 20, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  addPDCPopupOpened: boolean = false;
  editPDCPopupOpened: boolean = false;
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
    { id: 3, name: 'Realized' },
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
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/pdc');

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
      this.startDate = new Date(today.setHours(0, 0, 0, 0));
      this.EndDate = new Date(today.setHours(23, 59, 59, 999));
    } else if (e.value === 'all') {
      this.selectedEntryDateRange = 'all';
      const payload = {
        COMPANY_ID: this.selected_Company_id,
      };
      this.dataservice.get_PDC_List(payload).subscribe((res: any) => {
        console.log(res, 'response of PDC list');
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
    this.applyAllFilters();
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
        console.log(res, 'response of PDC list');
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

    this.applyAllFilters();
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
    this.addPDCPopupOpened = true;
  }

  formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = (cellInfo.data.ENTRY_STATUS || '').trim();

    // Clean up existing content to avoid duplicates
    while (cellElement.firstChild) {
      cellElement.removeChild(cellElement.firstChild);
    }

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';

    icon.style.color = status === 'Approved' ? 'green' : 'orange';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  displayDueDateExpr = (item: any) => {
    if (!item) return '';
    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }
    return item.label;
  };

  displayEntryDateExpr = (item: any) => {
    if (!item) return '';
    if (
      item.value === 'custom' &&
      this.entrycustomStartDate &&
      this.entrycustomEndDate
    ) {
      const from = this.formatAsDDMMYYYY(new Date(this.entrycustomStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.entrycustomEndDate));
      return `${from} to ${to}`;
    }
    return item.label;
  };

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

    this.startDate = start;
    this.EndDate = end;

    // Optional: if you also want to apply to entry date
    this.entrystartDate = start;
    this.entryEndDate = end;

    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);

    this.dateRanges = this.dateRanges.map((range) =>
      range.value === 'custom'
        ? { ...range, label: `${fromLabel} to ${toLabel}` }
        : range,
    );

    this.selectedDateRange = 'custom';

    // this.customStartDate = null;
    // this.customEndDate = null;
    this.showCustomDatePopup = false;

    this.applyAllFilters(); // Handles everything centrally
    this.get_PDC_list('custom');
  }

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

    this.startDate = entrystart;
    this.EndDate = entryend;

    // Optional: if you also want to apply to entry date
    this.entrystartDate = entrystart;
    this.entryEndDate = entryend;

    const fromLabel = this.formatAsDDMMYYYY(entrystart);
    const toLabel = this.formatAsDDMMYYYY(entryend);

    this.entryDateRanges = this.entryDateRanges.map((range) =>
      range.value === 'custom'
        ? { ...range, label: `${fromLabel} to ${toLabel}` }
        : range,
    );

    this.selectedEntryDateRange = 'custom';

    // this.entrycustomStartDate = null;
    // this.entrycustomEndDate = null;
    this.showEntryCustomDatePopup = false;

    this.applyAllFilters(); // Handles everything centrally
    this.get_PDC_list('custom');
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
        (selectedStatus === 3 && item.ENTRY_STATUS === 'Realization');

      return typeMatch && statusMatch;
    });
    console.log('Filtered List:', this.PDCListDataSource);
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
        (status === 3 && item.ENTRY_STATUS?.trim() === 'Realization');

      let chequeDateValid = true;
      if (dueStart && dueEnd && item.CHEQUE_DATE) {
        const chequeDate = this.parseDDMMYYYY(item.CHEQUE_DATE);
        chequeDateValid = chequeDate >= dueStart && chequeDate <= dueEnd;
        console.log(chequeDate, 'chequeDate---');
      }

      let entryDateValid = true;
      if (entryStart && entryEnd && item.ENTRY_DATE) {
        const entryDate = this.parseDDMMYYYY(item.ENTRY_DATE);
        entryDateValid = entryDate >= entryStart && entryDate <= entryEnd;
      }

      return typeMatch && statusMatch && chequeDateValid && entryDateValid;
    });

    console.log('All filters applied:', this.PDCListDataSource);
  }

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.ENTRY_STATUS?.trim() === 'Open',
    },
  ];

  onEditPDC(event: any) {
    event.cancel = true;
    console.log(event, 'event');
    const status = event.data?.ENTRY_STATUS?.trim();
    this.isEditReadOnly = status === 'Approved';
    this.editPDCPopupOpened = true;
    this.selected_PDC(event);
  }

  selected_PDC(event: any) {
    console.log(event, ' event of select');
    const id = event.data.ID;
    this.PDCid = event.data.ID;
    this.selectPDC = id;
    console.log(id, 'id');
    this.dataservice.Select_PDC(id).subscribe((res: any) => {
      console.log('response from select packing api:', res);
      this.selectedPDC = res.Data[0];
      console.log(this.selectedPDC);
      //  Trim and compare status to handle trailing spaces
      const status = (this.selectedPDC.ENTRY_STATUS || '').trim();

      //  Set checkbox based on status
      this.selectedPDC.ENTRY_STATUS = status === 'Approved';

      this.selectedPDC.BENEFICIARY_TYPE =
        this.selectedPDC.BENEFICIARY_TYPE?.id ||
        this.selectedPDC.BENEFICIARY_TYPE ||
        null;
    });
  }

  DeletePDC(event: any) {
    const id = event.data.ID;
    this.dataservice.Delete_PDC(id).subscribe((res: any) => {
      console.log('response from select packing api:', res);
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
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  get_PDC_list(dateRange: string = this.selectedDateRange) {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.get_PDC_List(payload).subscribe((res: any) => {
      console.log(res, 'response of PDC list');
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
    this.selectedDateRange = 'today';
    this.selectedEntryDateRange = 'today';
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
