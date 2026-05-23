import {
  ChangeDetectorRef,
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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { OpeningBalanceComponent } from '../../ACCOUNTS/opening-balance/opening-balance.component';
import { DataService } from 'src/app/services';
import {
  AddPurchaseInvoiceComponent,
  AddPurchaseInvoiceModule,
} from '../../PURCHASE INVOICE/add-purchase-invoice/add-purchase-invoice.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

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
  dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  statusFinder: any;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  filteredPurchaseInvoices: any;
  canAdd = false;
  canEdit = false;
  canVerify = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  buttonText: any
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
      this.ngZone.run(() => this.addPurchaseInvoice());
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
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
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
  isVerifyInvoice: boolean = false;
  isViewInvoice: boolean = false;
  isEditInvoice: boolean = false;
  Approvepopup: boolean = false;
  selectedInvoice: any;
  isEditInvoiceReadOnly: boolean = false;
  selected_Company_id: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log(currentUrl, 'PACKING');
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKING');
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
    this.getPurchaseInvoiceList();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getPurchaseInvoiceList() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    this.dataService.getPurchaseInvoiceList(payload).subscribe({
      next: (response: any) => {
        this.purchaseInvoiceList = (response.PurchHeaders || [])
          .map((item: any) => {
            let dateValue: Date;

            if (!isNaN(Date.parse(item.PURCH_DATE))) {
              dateValue = new Date(item.PURCH_DATE);
            } else {
              dateValue = this.parseDateString(item.PURCH_DATE);
            }

            return {
              ...item,
              PURCH_DATE: dateValue,
            };
          })
          .sort((a: any, b: any) => {
            const numA = parseInt(a.DOC_NO.split('/').pop(), 10);
            const numB = parseInt(b.DOC_NO.split('/').pop(), 10);
            return numB - numA;
          });

        // ✅ SAME AS PRODUCTION JV
        this.filteredPurchaseInvoices = this.purchaseInvoiceList;
      },
      error: (err) => {
        // ✅ ONLY ADDITION
        const message =
          err?.status === 0
            ? 'Network connection lost. Please check your internet.'
            : 'Unable to load purchase invoices. Please try again.';

        notify(message, 'error', 3000);
      },
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

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getPurchaseInvoiceList();
  }

  allActionButtons = [
    {
      name: 'edit',

      hint: 'Edit',

      icon: 'edit',

      text: 'Edit',

      onClick: (e: any) => {
        setTimeout(() => this.onEditInvoice(e));
      },

      visible: (e: any) => this.canEdit && e.row.data.STATUS === 'Open',
    },

    {
      name: 'delete',

      hint: 'Delete',

      icon: 'trash',

      text: 'Delete',

      // onClick: (e) => this.onDeleteClick(e),

      visible: (e: any) =>
        e.row.data.STATUS !== 'Approved' ||
        e.row.data.STATUS === 'Open' ||
        (e.row.data.STATUS !== 'Verified' && this.canApprove),
    },

    {
      hint: 'Verify',

      icon: 'check',

      text: 'Verify',

      onClick: (e: any) => {
        setTimeout(() => this.onVerifyClick(e));
      },

      visible: (e: any) => e.row.data.STATUS !== 'Verified',
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
  ];

  //===================Status flag=========================
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

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verified'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title =
      status === 'Approved'
        ? 'Approved'
        : status === 'Verified'
          ? 'Verified'
          : 'Open';

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

    this.getPurchaseInvoiceList();
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
      },
    );
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

    this.getPurchaseInvoiceList();
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
      if (e.data.STATUS === 'Approved') {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  // ============================Verify Popup function=========================================
  onVerifyClick(e: any): void {
    console.log(e, 'event--------------');
    this.isEditInvoice = false;

    const transStatus = e.row.data.STATUS;
    e.cancel = true;
    this.statusFinder = e.row.data.STATUS;
    const id = e.row.data.TRANS_ID;
    console.log(id, '===================id');
    this.dataService.selectPurchaseInvoice(id).subscribe((res: any) => {
      console.log(res);
      this.selectedInvoice = res.Data;
      console.log(this.selectedInvoice, '==============select data====verify');
      if (this.selectedInvoice.STATUS == "Approved") {
        this.buttonText = 'View Purchase  Invoice'
      } else if (this.selectedInvoice.STATUS == "Open") {
        this.buttonText = 'Verify Purchase  Invoice'
      } else if (this.selectedInvoice.STATUS == "Verified") {
        this.buttonText = 'Approve Purchase  Invoice'

      } else {
        this.buttonText = 'Purchase Invoice'

      }
      // this.get_employes_details_value_select();
      this.isEditInvoiceReadOnly = transStatus === 'Approved';
      this.isVerifyInvoice = true;



    });
  }

  // ============================Approve Popup function=========================================
  onApproveClick(e: any): void {
    this.isVerifyInvoice = true;
    e.cancel = true;
    const id = e.row.data.TRANS_ID;
    this.statusFinder = e.row.data.STATUS;
    const transStatus = e.row.data.STATUS;
    console.log(this.statusFinder);
    console.log(id, '===================id');
    this.dataService.selectPurchaseInvoice(id).subscribe((res: any) => {
      console.log(res);
      this.selectedInvoice = res.Data;
      console.log(this.selectedInvoice, '==============select data====verify');
      // this.get_employes_details_value_select();
      this.isEditInvoiceReadOnly = transStatus === 'Approved';
    });
  }

  onEditInvoice(event: any) {
    console.log(event, 'event------------');
    event.cancel = true;
    const invoiceId = event.data.TRANS_ID;
    const transStatus = event.data.STATUS;
    this.statusFinder = event.data.STATUS;
    this.isVerifyInvoice = false;

    this.dataService
      .selectPurchaseInvoice(invoiceId)
      .subscribe((response: any) => {
        this.selectedInvoice = response.Data;

        this.isEditInvoiceReadOnly = transStatus === 'Approved'; //read-only if Approved
        this.isEditInvoice = true;
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
            'success',
          );
          this.getPurchaseInvoiceList();
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

  handleClose() {
    this.isAddInvoice = false;
    this.isEditInvoice = false;
    this.isVerifyInvoice = false;

    this.Approvepopup = false;
    this.getPurchaseInvoiceList();
    this.addInvoiceComp.resetInvoiceForm();
  }

  addPurchaseInvoice() {
    this.isAddInvoice = true;
    this.cdr.detectChanges();
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    AddPurchaseInvoiceModule,
    EditPurchaseInvoiceModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [PurchaseInvoiceListComponent],
  exports: [PurchaseInvoiceListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseInvoiceListModule { }
