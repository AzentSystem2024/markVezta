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
import { DataService } from 'src/app/services';
import {
  AddSupplierPaymentComponent,
  AddSupplierPaymentModule,
} from '../../SUPPLIER-PAYMENT/add-supplier-payment/add-supplier-payment.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-supplier-payment-list',
  templateUrl: './supplier-payment-list.component.html',
  styleUrls: ['./supplier-payment-list.component.scss'],
})
export class SupplierPaymentListComponent {
  @ViewChild(AddSupplierPaymentComponent)
  addSupplierPaymentComponent!: AddSupplierPaymentComponent;
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
  supplierPaymentList: any;
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
      this.ngZone.run(() => this.addSupplierPayment());
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
  filteredSupplierPaymentList: any;
  addSupllierPayment: boolean = false;
  selectedReceipt: any;
  isViewReceipt: boolean = false;
  isEditReceipt: boolean = false;
  isReadOnlyReceipt: boolean = false;
  selectedSupplierPayment: any;
  supplierPaymentId: any;
  sessionData: any;
  selectedCompanyId: any;
  companyID: any;
  isReadOnlyJV: boolean = false;
  isReadOnlyPayment: boolean = false;
  isViewPayment: boolean = false;
  isApprovePayment: boolean = false;
  isVerifyPayment: boolean = false;
  canVerify: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.sessionData_tax();
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }

    this.getSupplierPayments();
    this.sessionData_tax();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getSupplierPayments() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const datePayload = this.getDateRangePayload();

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.dataService.getSupplierPaymentList(payload).subscribe({
      next: (response: any) => {
        this.supplierPaymentList = (response.Data || [])
          .map((item: any) => {
            let dateValue: Date;

            if (
              typeof item.PAY_DATE === 'string' &&
              /^\d{2}-\d{2}-\d{4}$/.test(item.PAY_DATE)
            ) {
              const [day, month, year] = item.PAY_DATE.split('-').map(Number);
              dateValue = new Date(year, month - 1, day);
            } else {
              dateValue = new Date(item.PAY_DATE);
            }

            return {
              ...item,
              PAY_DATE: dateValue,
            };
          })
          .sort((a: any, b: any) => {
            const numA = parseInt(a.DOC_NO.split('/').pop(), 10);
            const numB = parseInt(b.DOC_NO.split('/').pop(), 10);
            return numB - numA;
          });

        // ✅ single binding variable
        this.filteredSupplierPaymentList = this.supplierPaymentList;
      },

      error: (err) => {
        //  ONLY ADDITION
        const message =
          err?.status === 0
            ? 'Network connection lost. Please check your internet.'
            : 'Unable to load supplier payments. Please try again.';

        notify(message, 'error', 3000);
      },
      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }

  private getDateRangePayload(): {
    DATE_FROM: string | null;
    DATE_TO: string | null;
  } {
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
        return { DATE_FROM: null, DATE_TO: null };

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
      DATE_FROM: fromDate ? this.formatDate(fromDate) : null,
      DATE_TO: toDate ? this.formatDate(toDate) : null,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

  refreshGrid() {
    this.getSupplierPayments();
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    // icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.style.color =
      status === 5
        ? '#10B981' // Approved
        : status === 2
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
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

    this.getSupplierPayments();
  }

  applyDateFilter() {
    console.log('Applying filter for:', this.selectedDateRange);
    console.log('Sample PAY_DATE:', this.supplierPaymentList?.[0]?.PAY_DATE);

    if (!this.selectedDateRange || !this.supplierPaymentList) {
      this.filteredSupplierPaymentList = this.supplierPaymentList;
      return;
    }

    if (this.selectedDateRange === 'all') {
      this.filteredSupplierPaymentList = this.supplierPaymentList;
      return;
    }

    const today = new Date();
    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last15':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        this.filteredSupplierPaymentList = this.supplierPaymentList;
        return;
    }

    this.filteredSupplierPaymentList = this.supplierPaymentList.filter(
      (item: any) => {
        const payDate = new Date(item.PAY_DATE);
        return payDate >= startDate && payDate <= endDate;
      },
    );

    console.log(
      'Filtered list count:',
      this.filteredSupplierPaymentList.length,
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

    this.getSupplierPayments();
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

  onEditPayment(event: any) {
    event.cancel = true; // Prevent default popup editing

    const receiptId = event.data.TRANS_ID;
    const transStatus = event.data.TRANS_STATUS;

    this.supplierPaymentId = event.data.TRANS_ID;
    this.selectedSupplierPayment = receiptId;
    this.dataService
      .selectSupplierPayment(receiptId)
      .subscribe((response: any) => {
        this.selectedReceipt = response.Data;

        // Set a flag to determine if the form should be read-only
        this.isEditReceipt = true;
        this.isReadOnlyReceipt = transStatus === 5; // true if status is approved

        // Navigate to form component or open the form popup (depending on your app)
        console.log(this.selectedReceipt, 'SELECTED RECEIPT');
      });
  }

  onVerifyPayment(event: any) {
    const rowData = event.row.data;
    console.log(event, 'ROWDATAAAAAAAAAAAAA');
    console.log(rowData, 'ROWDATAAAAAAAAAAAAA');
    const invoiceId = rowData.TRANS_ID;
    const transStatus = rowData.TRANS_STATUS;

    this.isReadOnlyPayment = transStatus === 5;

    this.dataService
      .selectSupplierPayment(invoiceId)
      .subscribe((response: any) => {
        this.selectedReceipt = response.Data;
        console.log(this.selectedReceipt, '-------------');
        console.log(typeof this.selectedReceipt[0].TRANS_STATUS);
        this.isReadOnlyReceipt = transStatus === 5;
        // APPROVED -> OPEN VIEW PAGE
        if (transStatus === 5) {
          this.isViewPayment = true;
        }

        // VERIFIED -> OPEN APPROVE PAGE
        else if (transStatus === 2) {
          this.isApprovePayment = true;
        }

        // OPEN VERIFY PAGE
        else {
          this.isVerifyPayment = true;
        }
      });
  }

  // onDeletePayment(event: any) {
  //   if (event.data.TRANS_STATUS === 5) {
  //     event.cancel = true;
  //     notify('Customer Receipt cannot be deleted.', 'error', 2000);
  //     return;
  //   }
  //   const receiptId = event.data.TRANS_ID;
  //   event.cancel = true;
  //   // Call your delete API
  //   this.dataService.deleteSupplierPayment(receiptId).subscribe(
  //     (response: any) => {
  //       if (response) {
  //         notify(
  //           {
  //             message: 'Receipt Deleted Successfully',
  //             position: { at: 'top center', my: 'top center' },
  //           },
  //           'success',
  //         );
  //         this.getSupplierPayments();
  //         // this.dataGrid.instance.refresh();
  //       } else {
  //         notify(
  //           {
  //             message: 'Your Data Not deleted',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'error',
  //         );
  //       }
  //       // or whatever method you use to refresh `employeeList`
  //     },
  //     (error) => {
  //       console.error('Error deleting employee:', error);
  //     },
  //   );
  // }

  onDeletePayment(event: any) {
  if (event.data.TRANS_STATUS === 5) {
    event.cancel = true;
    notify('Customer Receipt cannot be deleted.', 'error', 2000);
    return;
  }

  event.cancel = true; // prevent default delete immediately

  const receiptId = event.data.TRANS_ID;

  const result = confirm(
    'Are you sure you want to delete this Supplier payment?',
    'Confirm Delete'
  );

  result.then((dialogResult: boolean) => {
    if (!dialogResult) {
      return; // user clicked No
    }

    this.dataService.deleteSupplierPayment(receiptId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Receipt Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );

          this.getSupplierPayments();
        } else {
          notify(
            {
              message: 'Data not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => {
        console.error('Delete error:', error);

        notify(
          {
            message: 'Delete failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      },
    );
  });
}

  addSupplierPayment() {
    this.addSupllierPayment = true;
  }

  handleClose() {
    this.addSupllierPayment = false;
    this.isEditReceipt = false;
    this.isVerifyPayment = false;
    this.isApprovePayment = false;
    this.isViewPayment = false;
    this.getSupplierPayments();
    if (this.addSupplierPaymentComponent) {
      this.addSupplierPaymentComponent.resetForm();
    }
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
    AddSupplierPaymentModule,
    EditSupplierPaymentModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [SupplierPaymentListComponent],
  exports: [SupplierPaymentListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SupplierPaymentListModule {}
