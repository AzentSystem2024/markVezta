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
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { InvoiceListComponent } from '../invoice-list/invoice-list.component';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-invoice-retail',
  templateUrl: './invoice-retail.component.html',
  styleUrls: ['./invoice-retail.component.scss'],
})
export class InvoiceRetailComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: any = DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
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
  InvoiceDataSource: any;
  invoiceArray: any[] = [];
  invoiceCount = 0;
  isEditInvoice: boolean = false;
  selectedInvoice: any;
  isViewInvoice: boolean = false;

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
  canVerify: boolean = false;
  canPrint = false;
  companyID: any;
  vatTitle: any;
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
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
  isReadOnlyInvoice: boolean = false;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  storeList: { ID: any; DESCRIPTION: any }[];
  selectedStoreId: any;
  isVerifyInvoice: boolean = false;
  isApproveInvoice: boolean = false;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    //
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    const menuGroups = menuResponse.MenuGroups || [];
    console.log(menuGroups, 'MENUGROUPSSSSSSSSSSS');
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
    this.getStoreData();
    // if (this.isHQApp && configStore) {
    //   this.filteredStoreList = [
    //     {
    //       ID: configStore.STORE_ID,
    //       DESCRIPTION: configStore.STORE_NAME,
    //     },
    //   ];
    // } else {
    //   this.filteredStoreList = this.storeList;
    // }
    // this.selectedStoreId = configStore.STORE_ID;
    this.getInvoiceList();
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getInvoiceList();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.companyID,
    };

    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const configStore = userData.Configuration?.[0];

      // if (this.isHQApp && configStore) {
      //   this.filteredStoreList = [
      //     {
      //       ID: configStore.STORE_ID,
      //       DESCRIPTION: configStore.STORE_NAME,
      //     },
      //   ];

      //   this.selectedStoreId = configStore.STORE_ID;
      // }
      //  else {
      this.filteredStoreList = this.storeList;

      // default select first store
      if (!this.selectedStoreId && this.storeList?.length) {
        this.selectedStoreId = this.storeList[0].ID;
        // }
      }

      // 🔥 Load data AFTER store is ready
      this.getInvoiceList();
    });
  }
  onStoreChanged(e: any) {
    this.selectedStoreId = e.value;

    // 🔥 Reload list with selected store
    this.getInvoiceList();
  }
  getInvoiceList(dateRange: string = this.selectedDateRange) {
    const datePayload = this.getDateRangePayload(dateRange);

    const payload = {
      COMPANY_ID: this.companyID,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
      STORE_ID: this.selectedStoreId || this.storeList?.[0]?.ID || 0,
    };

    this.InvoiceDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.getSalesInvoiceRetailData(payload).subscribe({
            next: (response: any) => {
              const list = (response?.Data || [])
                .map((item: any) => {
                  let dateValue: Date;

                  if (
                    typeof item.TRANS_DATE === 'string' &&
                    item.TRANS_DATE.includes('-')
                  ) {
                    const [day, month, year] =
                      item.TRANS_DATE.split('-').map(Number);
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
                  const numA = Number(a.VOUCHER_NO.match(/\d+$/)?.[0] || 0);
                  const numB = Number(b.VOUCHER_NO.match(/\d+$/)?.[0] || 0);
                  return numB - numA; // descending
                });

              //  cache for logic
              this.invoiceArray = list;
              this.invoiceCount = list.length;

              resolve(list); //  grid data
            },
            error: () => {
              this.invoiceArray = [];
              this.invoiceCount = 0;
              resolve([]);
            },
          });
        }),
    });
    console.log(this.InvoiceDataSource, 'INVOICEDATASOURCE');
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

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: fromDate ? this.formatAsYYYYMMDD(fromDate) : null,
      DATE_TO: toDate ? this.formatAsYYYYMMDD(toDate) : null,
    };
  }

  private formatAsYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label when switching away
    this.customStartDate = null;
    this.customEndDate = null;

    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom' ? { ...opt, label: 'Custom' } : opt,
    );

    this.getInvoiceList();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.invoiceArray) {
      this.filteredInvoiceList = this.invoiceArray;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredInvoiceList = this.invoiceArray; // show full list
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
        this.filteredInvoiceList = this.invoiceArray;
        return;
    }

    this.filteredInvoiceList = this.invoiceArray.filter((item: any) => {
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

    //  THIS IS THE MAGIC (same as Credit Note)
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getInvoiceList('custom');
  }
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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
    const transStatus = event.data.TRANS_STATUS;

    //  SET FLAG HERE
    this.isReadOnlyInvoice = transStatus === 5;

    this.dataService
      .selectInvoiceRetail(invoiceId)
      .subscribe((response: any) => {
        this.selectedInvoice = response.Data;

        if (transStatus === 5) {
          this.isViewInvoice = true;
        } else {
          this.isEditInvoice = true;
        }
      });
  }

  onVerifyInvoice(e: any) {
    const rowData = e.row.data;

    const invoiceId = rowData.TRANS_ID;
    const transStatus = rowData.TRANS_STATUS;

    this.isReadOnlyInvoice = transStatus === 5;

    this.dataService
      .selectInvoiceRetail(invoiceId)
      .subscribe((response: any) => {
        this.selectedInvoice = response.Data;

        // APPROVED -> OPEN VIEW PAGE
        if (transStatus === 5) {
          this.isViewInvoice = true;
        }

        // VERIFIED -> OPEN APPROVE PAGE
        else if (transStatus === 2) {
          this.isApproveInvoice = true;
        }

        // OPEN VERIFY PAGE
        else {
          this.isVerifyInvoice = true;
        }
      });
  }

  onDeleteInvoice(event: any) {
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;

      notify('Invoice cannot be deleted.', 'error', 2000);

      return;
    }

    event.cancel = true;

    confirm(
      'Are you sure you want to delete this record?',
      'Confirm Delete',
    ).then((dialogResult: boolean) => {
      if (dialogResult) {
        const invoiceId = event.data.TRANS_ID;

        this.dataService.deleteInvoiceRetail(invoiceId).subscribe(
          (response: any) => {
            if (response) {
              notify(
                {
                  message: 'Invoice Deleted Successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success',
              );

              this.getInvoiceList();
            } else {
              notify(
                {
                  message: 'Your Data Not deleted',
                  position: { at: 'top right', my: 'top right' },
                },
                'error',
              );
            }
          },
          (error) => {
            console.error('Error deleting invoice:', error);
          },
        );
      }
    });
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  addInvoice() {
    this.isAddInvoice = true;
    this.cdr.detectChanges();
  }
  handleClose() {
    this.ngZone.run(() => {
      this.isAddInvoice = false;
      this.isEditInvoice = false;
      this.isViewInvoice = false;
      this.isVerifyInvoice = false;
      this.isApproveInvoice = false;
      this.getInvoiceList();
    });
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
    CustomDatePopupModule,
    AddInvoiceRetailModule,
  ],
  providers: [],
  declarations: [InvoiceRetailComponent],
  exports: [InvoiceRetailComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvoiceRetailModule {}
