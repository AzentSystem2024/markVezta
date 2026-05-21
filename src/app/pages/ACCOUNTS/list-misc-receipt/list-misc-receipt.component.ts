import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AddMiscellaneousPaymentModule } from '../../../components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { ApproveMiscellaneousPaymentModule } from '../../../components/HR/Masters/approve-miscellaneous-payment/approve-miscellaneous-payment.component';
import { EditMiscellaneousPaymentModule } from '../../../components/HR/Masters/edit-miscellaneous-payment/edit-miscellaneous-payment.component';
import { ListMiscellaneousPaymentsComponent } from '../list-miscellaneous-payments/list-miscellaneous-payments.component';
import { VerifyMiscellaneousPaymentModule } from '../../../components/HR/Masters/verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import { ViewMiscellaneousPaymentModule } from '../../../components/HR/Masters/view-miscellaneous-payment/view-miscellaneous-payment.component';
import { AddMiscReceiptModule } from '../../../components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { EditMiscReceiptModule } from '../../../components/HR/Masters/MISC-RECEIPT/edit-misc-receipt/edit-misc-receipt.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-list-misc-receipt',
  templateUrl: './list-misc-receipt.component.html',
  styleUrls: ['./list-misc-receipt.component.scss'],
})
export class ListMiscReceiptComponent {
  miscReceipts: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  addMiscPopupOpened: boolean = false;
  editMiscPopupOpened: boolean = false;
  userId: any;
  selectedmiscellaneousData: any;
  isFilterRowVisible: boolean = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canVerify = false;
  canApprove = false;
  canPrint = false;
  selectedMiscReceipt: any;
  MiscReceiptId: any;
  statusFinder: any;
  PopupTitle: any
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Micellaneous_Receipt';
    this.dataService.exportDataGrid(event, fileName);
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
  addButtonOptions = {
    text: 'New',
    // icon: 'bi bi-file-earmark-plus',

    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => {
        this.addMiscReceipt(); // show your popup here
      });
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
  addMiscPaymentPopup: boolean = false;
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  filteredInvoiceList: any;
  isReadOnlyReceipt: boolean = false;
  isEditReceipt: boolean = false;
  isReadOnlyPayment: boolean = false;
  filteredMiscReceipts: any;
  addMiscReceiptPopup: boolean = false;
  addMiscPopup: boolean = false;
  editMiscPopup: boolean = false;
  verifypopup: boolean = false;
  Approvepopup: boolean = false;

  allActionButtons = [
    {
      name: 'edit',

      hint: 'Edit',

      icon: 'edit',

      text: 'Edit',
      visible: (e) => this.canEdit && e.row.data.TRANS_STATUS === 'Open'
    },

    {
      name: 'delete',

      hint: 'Delete',

      icon: 'trash',

      text: 'Delete',

      // onClick: (e) => this.onDeleteClick(e),

      visible: (e) => e.row.data.TRANS_STATUS !== 'Approve' || e.row.data.TRANS_STATUS === 'Open' || e.row.data.TRANS_STATUS !== 'Verify' && this.canApprove,
    },

    {
      hint: 'Verify',

      icon: 'check',

      text: 'Verify',

      onClick: (e) => {
        setTimeout(() => this.onVerifyClick(e));
      },

      visible: (e) =>
        e.row.data.TRANS_STATUS !== 'Verify',
    },

    {
      hint: 'Approve',

      icon: 'check',

      text: 'Approve',

      onClick: (e) => {
        setTimeout(() => this.onApproveClick(e));
      },

      visible: (e) => e.row.data.TRANS_STATUS === 'Verify',
    },
  ];


  //===================Status flag=========================
  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open'; // White or gray
      case 'Verify':
        return 'flag-verified'; // Orange
      case 'Approve':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) { }

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
      this.canVerify = packingRights.CanVerify;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getMiscReceipts();
  }

  getMiscReceipts() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: JSON.parse(sessionStorage.getItem('savedUserData') || '{}')
        .SELECTED_COMPANY.COMPANY_ID,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    this.dataService.getMiscReceiptList(payload).subscribe({
      next: (response: any) => {
        this.miscReceipts = (response.Data || [])
          .map((item: any) => {
            let dateValue: Date;

            if (
              typeof item.TRANS_DATE === 'string' &&
              /^\d{2}-\d{2}-\d{4}$/.test(item.TRANS_DATE)
            ) {
              const [day, month, year] = item.TRANS_DATE.split('-').map(Number);
              dateValue = new Date(year, month - 1, day);
            } else {
              dateValue = new Date(item.TRANS_DATE);
            }

            return {
              ...item,
              TRANS_DATE: dateValue,
            };
          })
          .sort((a: any, b: any) => {
            const numA = parseInt(a.DOC_NO.split('/').pop(), 10);
            const numB = parseInt(b.DOC_NO.split('/').pop(), 10);
            return numB - numA;
          });

        // ✅ reuse existing variable
        this.filteredMiscReceipts = this.miscReceipts;
      },
      error: () => { },
      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }

  private getDateRange(): { fromDate: string | null; toDate: string | null } {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'all':
        return { fromDate: null, toDate: null };

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return {
      fromDate: fromDate ? this.formatDate(fromDate) : null,
      toDate: toDate ? this.formatDate(toDate) : null,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  addMiscReceipt() {
    this.addMiscPopup = true;
  }

  // ============================Verify Popup function=========================================
  onVerifyClick(e: any): void {
    e.cancel = true;
    const transStatus = e.row.data.TRANS_STATUS;
    const id = e.row.data.TRANS_ID;
    this.statusFinder = transStatus;
    // reset previous data
    this.selectedmiscellaneousData = null;
    this.verifypopup = false;


    this.dataService.selectMiscReceipt(id).subscribe({
      next: (res: any) => {
        this.selectedmiscellaneousData = { ...res.Data };
        this.isReadOnlyPayment = transStatus === 'Approve';
        if (this.selectedmiscellaneousData.TRANS_STATUS == 2) {
          this.PopupTitle = 'Approve Miscellaneous Receipt '
        }
        else if (this.selectedmiscellaneousData.TRANS_STATUS == 5) {
          this.PopupTitle = 'View Miscellaneous Receipt '
        }
        else {
          this.PopupTitle = 'Verify Miscellaneous Receipt'
        }
        // open popup AFTER data arrives
        this.verifypopup = true;

      },
      error: (err) => {
        console.error('Error loading verify data:', err);
      }
    });
  }

  // ============================Approve Popup function=========================================
  onApproveClick(e: any): void {
    e.cancel = true;
    const transStatus = e.row.data.TRANS_STATUS;
    const id = e.row.data.TRANS_ID;
    this.statusFinder = transStatus;
    // Clear stale data
    this.selectedmiscellaneousData = null;
    this.verifypopup = false;
    this.dataService.selectMiscReceipt(id).subscribe({
      next: (res: any) => {
        console.log(res);
        // assign fresh object reference
        this.selectedmiscellaneousData = { ...res.Data };
        this.isReadOnlyPayment = transStatus === 'Approve';
        // open popup only after data is ready
        this.verifypopup = true;
      },
      error: (err) => {
        console.error('Error loading approve data:', err);
      }
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getMiscReceipts();
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
      (item: any) => item.name === 'toggleFilterButton',
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'search',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approve'
        ? '#10B981' // Approved
        : status === 'Verify'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approve' ? 'Approved' : status === 'Verify' ? 'Verified' : 'Open';

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
  ];

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    this.customStartDate = null;
    this.customEndDate = null;

    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom' ? { ...opt, label: 'Custom' } : opt,
    );

    this.getMiscReceipts();
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.miscReceipts) {
      this.filteredInvoiceList = this.miscReceipts;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredInvoiceList = this.miscReceipts; // show full list
      return;
    }
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(); // today

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last15':
        startDate = new Date();
        startDate.setDate(today.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30':
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        this.filteredMiscReceipts = this.miscReceipts;
        return;
    }

    this.filteredMiscReceipts = this.miscReceipts.filter((item: any) => {
      if (!item.TRANS_DATE) {
        console.warn('Missing TRANS_DATE in item:', item);
        return false;
      }

      const invoiceDate = item.TRANS_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getMiscReceipts();
  }

  private parseDateString(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date string:', dateStr);
      return new Date('Invalid'); // or new Date(0) if you want a fallback
    }

    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  get customStartDateFormatted(): string {
    return this.customStartDate
      ? this.formatAsDDMMYYYY(new Date(this.customStartDate))
      : '';
  }

  get customEndDateFormatted(): string {
    return this.customEndDate
      ? this.formatAsDDMMYYYY(new Date(this.customEndDate))
      : '';
  }

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.TRANS_STATUS === 5) {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  onEditOrViewMiscPayment(e: any) {
    e.cancel = true;
    const miscId = e.data.TRANS_ID;
    this.MiscReceiptId = e.data.TRANS_ID;
    this.selectedMiscReceipt = miscId;
    const status = e.data.TRANS_STATUS;
    this.dataService.selectMiscReceipt(miscId).subscribe({
      next: (response: any) => {
        this.selectedmiscellaneousData = { ...response.Data };

        this.editMiscPopup = true;
        this.isReadOnlyPayment = status === 'Approve';
      },
      error: (err) => {
        console.error('Failed to fetch salary revision:', err);
      },
    });
  }

  onDeleteMiscPayment(e: any) {
    const miscId = e.data.TRANS_ID;
    // Optionally prevent the default delete behavior
    e.cancel = true;
    if (e.data.TRANS_STATUS === 5) {
      e.cancel = true;
      notify('This Misc receipt cannot be deleted.', 'error', 2000);
      return;
    }

    // Call your delete API
    this.dataService.deleteMiscReceipt(miscId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Miscellaneous Receipt Log Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getMiscReceipts();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }

  formatAmount = (cellInfo: any) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cellInfo.value);
  };

  handleClose() {
    this.addMiscPopup = false;
    this.editMiscPopup = false;
    this.verifypopup = false;
    this.getMiscReceipts();
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
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
    AddMiscReceiptModule,
    EditMiscReceiptModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [ListMiscReceiptComponent],
  exports: [ListMiscReceiptComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ListMiscReceiptModule { }
