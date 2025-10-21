import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { OpeningBalanceComponent } from '../../OPENING BALANACE/opening-balance/opening-balance.component';
import { DataService } from 'src/app/services';
import {
  AddPurchaseInvoiceComponent,
  AddPurchaseInvoiceModule,
} from '../add-purchase-invoice/add-purchase-invoice.component';
import { EditPurchaseInvoiceModule } from '../edit-purchase-invoice/edit-purchase-invoice.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-invoice-list',
  templateUrl: './purchase-invoice-list.component.html',
  styleUrls: ['./purchase-invoice-list.component.scss'],
})
export class PurchaseInvoiceListComponent {
  purchaseInvoiceList: any;
  @ViewChild(AddPurchaseInvoiceComponent)
  addInvoiceComp!: AddPurchaseInvoiceComponent;
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
  filteredPurchaseInvoices: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

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
    onClick: () => this.addPurchaseInvoice(),
    elementAttr: { class: 'add-button' },
  };

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
  isAddInvoice: boolean = false;
  isViewInvoice: boolean = false;
  isEditInvoice: boolean = false;
  selectedInvoice: any;
  isEditInvoiceReadOnly: boolean = false;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
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
      .find((menu) => menu.Path === '/purchase-invoice');

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
    this.getPurchaseInvoiceList();
  }

  getPurchaseInvoiceList() {
    this.dataService.getPurchaseInvoiceList().subscribe((response: any) => {
      this.purchaseInvoiceList = response.PurchHeaders.map((item: any) => {
        let dateValue: Date;

        // Case 1: If backend gives ISO format (2025-08-21T14:06:47.85)
        if (!isNaN(Date.parse(item.PURCH_DATE))) {
          dateValue = new Date(item.PURCH_DATE);
        } else {
          // Case 2: If backend gives dd-MM-yyyy format
          dateValue = this.parseDateString(item.PURCH_DATE);
        }

        return {
          ...item,
          PURCH_DATE: dateValue,
        };
      });

      this.applyDateFilter();
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;
    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'Approved' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

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
    if (!this.selectedDateRange || !this.purchaseInvoiceList) {
      this.filteredPurchaseInvoices = this.purchaseInvoiceList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredPurchaseInvoices = this.purchaseInvoiceList; // show full list
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
        this.filteredPurchaseInvoices = this.purchaseInvoiceList;
        return;
    }

    this.filteredPurchaseInvoices = this.purchaseInvoiceList.filter(
      (item: any) => {
        if (!item.PURCH_DATE) {
          console.warn('Missing PURCH_DATE in item:', item);
          return false;
        }

        const invoiceDate = item.PURCH_DATE;
        return invoiceDate >= startDate && invoiceDate <= endDate;
      }
    );
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredPurchaseInvoices = this.purchaseInvoiceList.filter(
      (item: any) => {
        const invoiceDate = item.PURCH_DATE;
        return invoiceDate >= start && invoiceDate <= end;
      }
    );

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

  // onEditInvoice(event: any) {
  //   event.cancel = true;
  //   const invoiceId = event.data.ID;
  //   const transStatus = event.data.STATUS;

  //   this.dataService
  //     .selectPurchaseInvoice(invoiceId)
  //     .subscribe((response: any) => {
  //       this.selectedInvoice = response.Data;

  //       this.isEditInvoice = true;
  //       this.isEditInvoiceReadOnly = transStatus === 'Approved'; // 👈 read-only if Approved
  //     });
  // }

  onEditInvoice(event: any) {
    event.cancel = true;
    const invoiceId = event.data.TRANS_ID;
    const transStatus = event.data.STATUS;

    this.dataService
      .selectPurchaseInvoice(invoiceId)
      .subscribe((response: any) => {
        this.selectedInvoice = response.Data;

        this.isEditInvoice = true;
        this.isEditInvoiceReadOnly = transStatus === 'Approved'; // 👈 read-only if Approved
      });
  }

  onDeleteInvoice(event: any) {
    console.log(event, 'EVENTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT');
    if (event.data.STATUS === 'Approved') {
      event.cancel = true;
      notify('Invoice cannot be deleted.', 'error', 2000);
      return;
    }
    const invoiceId = event.data.ID;
    event.cancel = true;
    // Call your delete API
    this.dataService.deletePurchaseInvoice(invoiceId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Invoice Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getPurchaseInvoiceList();
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
    this.isAddInvoice = false;
    this.isEditInvoice = false;
    this.getPurchaseInvoiceList();
    this.addInvoiceComp.resetInvoiceForm();
  }

  addPurchaseInvoice() {
    this.isAddInvoice = true;
    this.cdr.detectChanges();
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    AddPurchaseInvoiceModule,
    EditPurchaseInvoiceModule,
  ],
  providers: [],
  declarations: [PurchaseInvoiceListComponent],
  exports: [PurchaseInvoiceListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseInvoiceListModule {}
