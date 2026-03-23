import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { AddCreditNoteModule } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { DeliveryNoteFormModule } from '../../delivery-note-form/delivery-note-form.component';
import notify from 'devextreme/ui/notify';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-delivery-note',
  templateUrl: './delivery-note.component.html',
  styleUrls: ['./delivery-note.component.scss'],
})
export class DeliveryNoteComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  sessionData: any;
  selected_vat_id: any;
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
      this.zone.run(() => this.addDeliveryNote());
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
  isAddTransferOut: boolean;
  selecteTrOut: any;
  isEditTransferOut: boolean;
  selectedTrOut: any;

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
  filteredDeliveryList: any;
  isReadOnlyTrOut: boolean;
  isAddTransferIn: boolean;
  isEditTransferIn: boolean;
  isReadOnlyTrIn: boolean;
  deliveryNoteList: any;
  isAddDelivery: boolean;
  isEditDelivery: boolean;
  selectedDelivery: any;
  isReadOnlyDelivery: boolean;
  selected_Company_id: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax()
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    this.sessionData_tax();
    this.getDeliveryNotes();
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getDeliveryNotes() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    this.dataService.getdeliveryNoteViewist(payload).subscribe({
      next: (response: any) => {
        this.deliveryNoteList = (response.Data || [])
          .map((item: any) => ({
            ...item,
            DN_DATE: new Date(item.DN_DATE),
          }))
          .sort((a: any, b: any) => {
            const numA = parseInt(a.DN_NO.split('/').pop(), 10);
            const numB = parseInt(b.DN_NO.split('/').pop(), 10);
            return numB - numA;
          });

        this.filteredDeliveryList = this.deliveryNoteList;
      },
      complete: () => grid?.endCustomLoading(),
    });
  }

  // getDeliveryNotes() {
  //   const grid = this.dataGrid?.instance;
  //   grid?.beginCustomLoading('Loading...');

  //   const { fromDate, toDate } = this.getDateRange();

  //   const payload = {
  //     COMPANY_ID: this.selected_Company_id,
  //     DATE_FROM: fromDate,
  //     DATE_TO: toDate,
  //   };

  //   this.dataService.getdeliveryNoteViewist(payload).subscribe({
  //     next: (response: any) => {
  //       this.deliveryNoteList = (response.Data || [])
  //         .map((item: any) => {
  //           let dateValue: Date;

  //           if (
  //             typeof item.DN_DATE === 'string' &&
  //             /^\d{2}-\d{2}-\d{4}$/.test(item.DN_DATE)
  //           ) {
  //             const [day, month, year] = item.DN_DATE.split('-').map(Number);
  //             dateValue = new Date(year, month - 1, day);
  //           } else {
  //             dateValue = new Date(item.DN_DATE);
  //           }

  //           return {
  //             ...item,
  //             DN_DATE: dateValue,
  //           };
  //         })
  //         .sort((a: any, b: any) => {
  //           const numA = parseInt(a.DN_NO.split('/').pop(), 10);
  //           const numB = parseInt(b.DN_NO.split('/').pop(), 10);
  //           return numB - numA;
  //         });

  //       // ✅ same pattern everywhere
  //       this.filteredDeliveryList = this.deliveryNoteList;
  //     },
  //     error: () => {},
  //     complete: () => {
  //       grid?.endCustomLoading();
  //     },
  //   });
  // }

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
      fromDate: fromDate ? this.formatDateforList(fromDate) : null,
      toDate: toDate ? this.formatDateforList(toDate) : null,
    };
  }
  private formatDateforList(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'APPROVED' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'APPROVED' ? 'APPROVED' : 'OPEN';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'APPROVED',
    },
    {
      text: 'Open',
      value: 'OPEN',
    },
  ];

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    // ✅ CALL API WITH DATE_FROM & DATE_TO
    this.getDeliveryNotes();
  }

  // onDateRangeChanged(e: any) {
  //   this.selectedDateRange = e.value;

  //   if (e.value === 'custom') {
  //     this.showCustomDatePopup = true;
  //     return;
  //   }

  //   // reset custom label
  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom' ? { ...option, label: 'Custom' } : option,
  //   );

  //   this.customStartDate = null;
  //   this.customEndDate = null;

  //   this.getDeliveryNotes();
  // }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.deliveryNoteList) {
      this.filteredDeliveryList = this.deliveryNoteList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredDeliveryList = this.deliveryNoteList; // show full list
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
        this.filteredDeliveryList = this.deliveryNoteList;
        return;
    }

    this.filteredDeliveryList = this.deliveryNoteList.filter((item: any) => {
      if (!item.DN_DATE) {
        console.warn('Missing DN_DATE in item:', item);
        return false;
      }

      const invoiceDate = item.DN_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      notify('From date cannot be greater than To date', 'error', 2000);
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

    // ✅ CALL API WITH DATE_FROM & DATE_TO
    this.getDeliveryNotes();
  }

  // applyCustomDateFilter() {
  //   if (!this.customStartDate || !this.customEndDate) return;

  //   if (this.customStartDate > this.customEndDate) {
  //     alert('From date cannot be greater than To date');
  //     return;
  //   }

  //   const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
  //   const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom'
  //       ? { ...option, label: `${fromLabel} - ${toLabel}` }
  //       : option,
  //   );

  //   this.selectedDateRange = 'custom';
  //   this.showCustomDatePopup = false;

  //   this.getDeliveryNotes();
  // }

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

  formatDate(date: Date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getDeliveryNotes();
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addDeliveryNote() {
    this.isAddDelivery = true;
  }

  onEditDelivery(event: any) {
    event.cancel = true;

    const deliveryId = event.data.ID;
    const status = event.data.STATUS;

    this.dataService
      .selectDeliveryNote(deliveryId)
      .subscribe((response: any) => {
        this.selectedDelivery = response.Data; // ✅ FIX

        this.isEditDelivery = true;
        this.isReadOnlyDelivery = status === 'APPROVED';
      });
  }

  onDeleteDelivery(event: any) {
    const deliveryId = event.data.ID;
    const status = event.data.STATUS;
    if (event.data.STATUS === 'APPROVED') {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    // Call your delete API
    this.dataService.deleteDeliveryNote(deliveryId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getDeliveryNotes();
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

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.STATUS === 'APPROVED') {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  handleClose() {
    this.isAddDelivery = false;
    this.isEditDelivery = false;
    this.getDeliveryNotes();
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
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DeliveryNoteFormModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [DeliveryNoteComponent],
  exports: [DeliveryNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryNoteModule {}
