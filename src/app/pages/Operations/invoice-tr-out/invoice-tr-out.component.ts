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
import { AddCreditNoteModule } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { AddDebitModule } from '../../DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from '../../DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { AddInvoiceModule } from '../../INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from '../../INVOICE/edit-invoice/edit-invoice.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import {
  InvoiceTrOutAddComponent,
  InvoiceTrOutAddModule,
} from '../../INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-invoice-tr-out',
  templateUrl: './invoice-tr-out.component.html',
  styleUrls: ['./invoice-tr-out.component.scss'],
})
export class InvoiceTrOutComponent {
  @ViewChild(InvoiceTrOutAddComponent)
  InvoiceTrOutAddComponent!: InvoiceTrOutAddComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter:boolean= true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
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
      this.ngZone.run(() => this.addInvoice());
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

  isAddInvoice: boolean = false;
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
  invoiceList: any;
  isEditInvoice: boolean = false;
  selectedInvoice: any;
  isViewInvoice: boolean=false;

  sessionData: any;
  selected_Company_id: any;
  selected_fin_id: any;
  financialYeaDate: any;
  formatted_from_date: any;
  selected_vat_id: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isReadOnlyInvoice: boolean = false;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.sesstion_Details();
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/invoice');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getInvoiceList();
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  getInvoiceList() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    this.dataService.getInvoiceMainListTrOut(payload).subscribe({
      next: (response: any) => {
        this.invoiceList = (response.Data || [])
          .map((item: any) => {
            let dateValue: Date;

            if (/^\d{2}-\d{2}-\d{4}$/.test(item.INVOICE_DATE)) {
              const [d, m, y] = item.INVOICE_DATE.split('-').map(Number);
              dateValue = new Date(y, m - 1, d);
            } else {
              dateValue = new Date(item.INVOICE_DATE);
            }

            const match = item.DOC_NO?.match(/\d+$/);
            const docNoNumber = match ? Number(match[0]) : 0;

            return {
              ...item,
              INVOICE_DATE: dateValue,
              _docNoNumber: docNoNumber,
            };
          })
          .sort((a: any, b: any) => b._docNoNumber - a._docNoNumber);

        // ✅ SAME AS PRODUCTION JV
        this.filteredInvoiceList = this.invoiceList;
      },
      error: (err) => {
        // ONLY ADDITION
        const message =
          err?.status === 0
            ? 'Network connection lost. Please check your internet.'
            : 'Unable to load invoices. Please try again.';

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
    this.getInvoiceList();
    // if (this.dataGrid?.instance) {
    //   this.dataGrid.instance.refresh(); // Or reload data from API if needed
    // }
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

    this.getInvoiceList();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData')||'{}');

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  applyDateFilter() {
    if (!this.selectedDateRange || !this.invoiceList) {
      this.filteredInvoiceList = this.invoiceList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredInvoiceList = this.invoiceList; // show full list
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
        this.filteredInvoiceList = this.invoiceList;
        return;
    }

    this.filteredInvoiceList = this.invoiceList.filter((item: any) => {
      const invoiceDate = item.INVOICE_DATE;
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

    // 🔑 update label
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getInvoiceList();
  }

  private parseDateString(dateStr: string): Date {
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

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 5 ? 'Approved' : 'Open';

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

  onEditInvoice(event: any) {
    event.cancel = true;
    const invoiceId = event.data.TRANS_ID;
    const status = event.data.TRANS_STATUS;
    this.dataService
      .selectInvoiceTrOut(invoiceId)
      .subscribe((response: any) => {
        this.selectedInvoice = response;
        this.isEditInvoice = true;
        this.isReadOnlyInvoice = status === 5;
      });
  }

  onDeleteInvoice(event: any) {
    const invoiceId = event.data.TRANS_ID;
    const status = event.data.TRANS_STATUS;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    // Call your delete API
    this.dataService.deleteInvoiceTrOut(invoiceId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getInvoiceList();
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

  addInvoice() {
    this.isAddInvoice = true;
    this.cdr.detectChanges();
  }

  handleClose() {
    this.isAddInvoice = false;
    this.isEditInvoice = false;
    this.isViewInvoice = false;
    this.getInvoiceList();
    if (this.InvoiceTrOutAddComponent) {
      this.InvoiceTrOutAddComponent.resetInvoiceForm();
    }
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
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    AddInvoiceModule,
    EditInvoiceModule,
    ViewInvoiceModule,
    InvoiceTrOutAddModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [InvoiceTrOutComponent],
  exports: [InvoiceTrOutComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvoiceTrOutModule { }
