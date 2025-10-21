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
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { CreditNoteListComponent } from '../CREDIT-NOTE/credit-note-list/credit-note-list.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { TransferOutInventoryAddModule } from '../transfer-out-inventory-add/transfer-out-inventory-add.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-transfer-out-inventory',
  templateUrl: './transfer-out-inventory.component.html',
  styleUrls: ['./transfer-out-inventory.component.scss'],
})
export class TransferOutInventoryComponent {
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
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.addTransferOut();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  isAddTransferOut: boolean;
  transferOutList: any;
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
  filteredTrOutList: any;
  isReadOnlyTrOut: boolean;
  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    // this.sessionData_tax()
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSSSSSSSSSSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      console.log('packingRights.CanAdd:', packingRights.CanAdd);
      console.log('this.canAdd after assign:', this.canAdd);
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    this.getTransferOutList();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  getTransferOutList() {
    this.dataService
      .getTransferOutForInventoryMainList()
      .subscribe((response: any) => {
        this.transferOutList = response.Header.map((item: any) => {
          let dateValue: Date;

          if (!isNaN(Date.parse(item.TRANSFER_DATE))) {
            dateValue = new Date(item.TRANSFER_DATE);
          } else {
            dateValue = this.parseDateString(item.TRANSFER_DATE);
          }

          return {
            ...item,
            TRANSFER_NO: item.ISSUE_NO,
            TRANSFER_DATE: dateValue,
            DESTINATION_STORE: item.STORE_NAME,
          };
        });

        console.log('TransferOutList after mapping:', this.transferOutList);
        this.applyDateFilter();
      });
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
      this.customStartDate = null;
      this.customEndDate = null;
      this.showCustomDatePopup = true;
    } else {
      // Reset the custom label
      const customOpt = this.dateRanges.find((dr) => dr.value === 'custom');
      if (customOpt) {
        customOpt.label = 'Custom';
      }
      this.applyDateFilter();
    }
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.transferOutList) {
      this.filteredTrOutList = this.transferOutList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredTrOutList = this.transferOutList; // show full list
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
        this.filteredTrOutList = this.transferOutList;
        return;
    }

    this.filteredTrOutList = this.transferOutList.filter((item: any) => {
      if (!item.TRANSFER_DATE) {
        console.warn('Missing TRANSFER_DATE in item:', item);
        return false;
      }

      const invoiceDate = item.TRANSFER_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredTrOutList = this.transferOutList.filter((item: any) => {
      const invoiceDate = item.TRANSFER_DATE;
      return invoiceDate >= start && invoiceDate <= end;
    });

    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} to ${toLabel}` }
        : option
    );

    this.showCustomDatePopup = false;
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addTransferOut() {
    this.isAddTransferOut = true;
  }

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'delete') {
      const status = e.data.STATUS;

      if (status === 'APPROVED') {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          // intercept the click
          deleteButton.addEventListener('click', (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            notify('Approved records cannot be deleted.', 'warning', 2000);
          });

          // style it as disabled if you like
          deleteButton.classList.add('dx-state-disabled');
        }
      }
    }
  }

  onEditTransferOut(event: any) {
    event.cancel = true;
    const trOutId = event.data.ID;
    const status = event.data.STATUS;
    this.dataService
      .selectTransferOutForInventory(trOutId)
      .subscribe((response: any) => {
        this.selectedTrOut = response;
        console.log(this.selecteTrOut, 'SELECTEDTROUT');
        this.isEditTransferOut = true;
        this.isReadOnlyTrOut = status === 'APPROVED';
      });
  }

  onDeleteTrOuT(event: any) {
    const trOutId = event.data.ID;
    const status = event.data.STATUS;
    if (event.data.STATUS === 'APPROVED') {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(trOutId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deleteTrOutForInventory(trOutId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getTransferOutList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      }
    );
  }

  handleClose() {
    this.isAddTransferOut = false;
    this.isEditTransferOut = false;
    this.getTransferOutList();
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
    AddCreditNoteModule,
    EditCreditNoteModule,
    ViewCreditNoteModule,
    TransferOutInventoryAddModule,
  ],
  providers: [],
  declarations: [TransferOutInventoryComponent],
  exports: [TransferOutInventoryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransferOutInventoryModule {}
