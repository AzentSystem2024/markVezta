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
import { DataService } from 'src/app/services';
import {
  AddCutomerReceiptComponent,
  AddCutomerReceiptModule,
} from '../../CUSTOMER-RECEIPTS/add-cutomer-receipt/add-cutomer-receipt.component';
import { EditCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-customer-receipts',
  templateUrl: './customer-receipts.component.html',
  styleUrls: ['./customer-receipts.component.scss'],
})
export class CustomerReceiptsComponent {
  @ViewChild(AddCutomerReceiptComponent)
  addReceiptFormRef!: AddCutomerReceiptComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter:boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';

  canAdd = false;
  canEdit = false;
  canVerify = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  ReceiptDataSource!: DataSource;
  receiptArray: any[] = [];
  receiptCount = 0;

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
      this.ngZone.run(() => this.addCustomerReceipt());
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
  isAddCustomerReceipt: boolean = false;
  pendingInvoiceList: any;
  customerReciptList: any;
  selectedReceipt: any;
  isEditReceipt: boolean = false;
  isVerifyReceipt:boolean = false;
  isViewReceipt: boolean = false;
  filteredReceiptList: any;

  isReadOnlyReceipt: boolean = false;
  sessionData: any;
  selectedCompanyId: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
    // this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canVerify = packingRights.CanVerify;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.sessionData_tax();

    this.getCustomerReceipts();
  }

  getCustomerReceipts(dateRange: string = this.selectedDateRange) {
    const datePayload = this.getDateRangePayload(dateRange);

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.ReceiptDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.getCustomerReciptList(payload).subscribe({
            next: (response: any) => {
              const list = (response?.Data || [])
                .map((item: any) => {
                  let dateValue: Date;

                  if (
                    typeof item.REC_DATE === 'string' &&
                    item.REC_DATE.includes('-')
                  ) {
                    const [day, month, year] =
                      item.REC_DATE.split('-').map(Number);
                    dateValue = new Date(year, month - 1, day);
                  } else {
                    dateValue = new Date(item.REC_DATE);
                  }

                  return {
                    ...item,
                    REC_DATE: dateValue,
                  };
                })
                .sort((a: any, b: any) => {
                  const numA = Number(a.DOC_NO.match(/\d+$/)?.[0] || 0);
                  const numB = Number(b.DOC_NO.match(/\d+$/)?.[0] || 0);
                  return numB - numA;
                });

              this.receiptArray = list;
              this.receiptCount = list.length;

              resolve(list);
            },
            error: () => {
              this.receiptArray = [];
              this.receiptCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  private getDateRangePayload(range: string) {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (range) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };

      default:
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: this.formatAsYYYYMMDD(fromDate),
      DATE_TO: this.formatAsYYYYMMDD(toDate),
    };
  }

  private formatAsYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getCustomerReceipts();
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
      status === 5
        ? '#10B981' // Approved
        : status === 2
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 5 ? 'Approved' : status === 2 ? 'Verified' : 'Open';

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

  addCustomerReceipt() {
    this.isAddCustomerReceipt = true;
    this.cdr.detectChanges();
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.customStartDate = null;
      this.customEndDate = null;
      this.showCustomDatePopup = true;
      return;
    }

    this.getCustomerReceipts(e.value);
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.customerReciptList) {
      this.filteredReceiptList = this.customerReciptList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredReceiptList = this.customerReciptList; // show full list
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
        this.filteredReceiptList = this.customerReciptList;
        return;
    }

    this.filteredReceiptList = this.customerReciptList.filter((item: any) => {
      const invoiceDate = item.REC_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: this.formatAsYYYYMMDD(new Date(this.customStartDate)),
      DATE_TO: this.formatAsYYYYMMDD(new Date(this.customEndDate)),
    };

    this.ReceiptDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.getCustomerReciptList(payload).subscribe({
            next: (response: any) => {
              const list = response?.Data || [];
              this.receiptArray = list;
              this.receiptCount = list.length;
              resolve(list);
            },
            error: () => resolve([]),
          });
        }),
    });

    this.showCustomDatePopup = false;
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

  onVerifyInvoice(e:any){
    e.cancel = true;
    const receiptId = e.row.data.TRANS_ID;
    const transStatus = e.row.data.TRANS_STATUS;
    this.dataService
      .selectCustomerReceipt(receiptId)
      .subscribe((response: any) => {
        this.selectedReceipt = response.Data;
        this.isVerifyReceipt = true;
        this.isEditReceipt = false;
        this.isReadOnlyReceipt = transStatus === 5;
      });
  }
  onEditReceiptNote(event: any) {
    event.cancel = true;
    const receiptId = event.data.TRANS_ID;
    const transStatus = event.data.TRANS_STATUS;
    this.dataService
      .selectCustomerReceipt(receiptId)
      .subscribe((response: any) => {
        this.selectedReceipt = response.Data;
        this.isEditReceipt = true;
        this.isReadOnlyReceipt = transStatus === 5;
      });
  }

  // onEditReceiptNote(event: any) {
  //   event.cancel = true; // Prevent default popup editing
  //   const receiptId = event.data.TRANS_ID;
  //   const transStatus = event.data.TRANS_STATUS;

  //   this.dataService
  //     .selectCustomerReceipt(receiptId)
  //     .subscribe((response: any) => {
  //       this.selectedReceipt = response.Data;
  //       if (transStatus === 5) {
  //         // Open view popup
  //         this.isViewReceipt = true;
  //       } else {
  //         // Open edit popup
  //         this.isEditReceipt = true;
  //       }
  //     });
  // }

  onDeleteReceiptNote(event: any) {
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('Customer Receipt cannot be deleted.', 'error', 2000);
      return;
    }
    const receiptId = event.data.TRANS_ID;
    event.cancel = true;
    // Call your delete API
    this.dataService.deleteInvoice(receiptId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Receipt Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getCustomerReceipts();
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
    if (this.addReceiptFormRef) {
      this.addReceiptFormRef.resetForm();
    }
    this.isAddCustomerReceipt = false;
    this.isEditReceipt = false;
    this.isViewReceipt = false;
    this.isVerifyReceipt = false;
    this.getCustomerReceipts();
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
    AddCutomerReceiptModule,
    EditCustomerReceiptModule,
    ViewCustomerReceiptModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [CustomerReceiptsComponent],
  exports: [CustomerReceiptsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerReceiptsModule { }
