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
import { FormTextboxModule } from '../../../components';
import { PurchaseReturnDebitFormModule } from '../../purchase-return-debit-form/purchase-return-debit-form.component';
import { PurchaseReturnDebitComponent } from '../purchase-return-debit/purchase-return-debit.component';
import { DataService } from '../../../services';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import {
  SaleReturnFormComponent,
  SaleReturnFormModule,
} from '../../../sale-return-form/sale-return-form.component';
import { CustomDatePopupModule } from '../../../custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-sale-return',
  templateUrl: './sale-return.component.html',
  styleUrls: ['./sale-return.component.scss'],
})
export class SaleReturnComponent {
  @ViewChild(SaleReturnFormComponent)
  SaleReturnFormComponent!: SaleReturnFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  purchaseReturnList: any;
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
      this.ngZone.run(() => this.addSaleReturn());
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
  isAddDebitNote: boolean = false;
  isEditDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  selectedDebitNote: any;
  isViewDebitNote: boolean = false;
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
  filteredJournalVoucherList: any;
  isEmptyDatagrid: boolean = false;
  sessionData: any;
  selected_vat_id: any;
  saleReturnDataSource: any;
  companyID: any;
  saleReturnArray: any[] = [];
  saleReturnCount = 0;
  isAddSaleReturn: boolean = false;
  selectedSaleReturn: any;
  isEditSaleReturn: boolean = false;
  isReadOnlySaleReturn: boolean = false;
  isViewSaleReturn: boolean = false;
  vatTitle: any;
  canVerify: any;
  isViewSalesReturn: boolean;
  isApproveSalesReturn: boolean;
  isVerifySalesReturn: boolean;
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.sessionData_tax();
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

    this.getSaleReturnList();
    this.sessionData_tax();
  }

  getSaleReturnList(dateRange: string = this.selectedDateRange) {
    const datePayload = this.getDateRangePayload(dateRange);

    const payload = {
      COMPANY_ID: this.companyID,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.saleReturnDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.getSaleReturnMainList(payload).subscribe({
            next: (response: any) => {
              const list = (response?.Data || [])
                .map((item: any) => {
                  let dateValue: Date;

                  if (!isNaN(Date.parse(item.RET_DATE))) {
                    dateValue = new Date(item.RET_DATE);
                  } else {
                    dateValue = this.parseDateString(item.RET_DATE);
                  }

                  return {
                    ...item,
                    RET_DATE: dateValue,
                  };
                })
                .sort((a: any, b: any) => {
                  const extractRunningNo = (docNo: string): number => {
                    const match = docNo?.match(/PR(\d+)$/);
                    return match ? Number(match[1]) : 0;
                  };
                  return (
                    extractRunningNo(b.DOC_NO) - extractRunningNo(a.DOC_NO)
                  );
                });

              this.saleReturnArray = list;
              this.saleReturnCount = list.length;

              resolve(list);
            },
            error: (err) => {
              this.saleReturnArray = [];
              this.saleReturnCount = 0;

              const message =
                err?.status === 0
                  ? 'Network connection lost. Please check your internet.'
                  : 'Something went wrong. Please try again.';

              notify(message, 'error', 3000);

              resolve([]); // unchanged functionality
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

      // 🔑 MISSING PART (SAME AS CREDIT NOTE)
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

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
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
    icon.title = status === 5 ? 'Approved' : status === 2 ? 'Verified' : 'Open';
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
      this.customStartDate = null;
      this.customEndDate = null;
      this.showCustomDatePopup = true;
      return;
    }

    this.getSaleReturnList(e.value);
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.purchaseReturnList) {
      this.filteredJournalVoucherList = this.purchaseReturnList;
      return;
    }

    if (this.selectedDateRange === 'all') {
      this.filteredJournalVoucherList = this.purchaseReturnList; // show full list
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
        this.filteredJournalVoucherList = this.purchaseReturnList;
        return;
    }

    this.filteredJournalVoucherList = this.purchaseReturnList.filter(
      (item: any) => {
        // const journalDate = this.parseDateString(item.RET_DATE);
        const journalDate = item.RET_DATE;
        return journalDate >= startDate && journalDate <= endDate;
      },
    );
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    // 🔑 SAME AS CREDIT NOTE
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    // reload grid
    this.getSaleReturnList('custom');
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
    this.getSaleReturnList();
  }

  onEditSaleReturn(event: any) {
    event.cancel = true;
    const returnId = event.data.TRANS_ID;
    const status = event.data.TRANS_STATUS;
    this.dataService.selectSaleReturn(returnId).subscribe((response: any) => {
      this.selectedSaleReturn = response;
      console.log(this.selectedSaleReturn, 'SELECTEDTROUT');
      this.isEditSaleReturn = true;
      this.isReadOnlySaleReturn = status === 5;
    });
  }

  onVerifySalesReturn(event: any) {
    const rowData = event.row.data;

    const returnId = rowData.TRANS_ID;
    const status = rowData.TRANS_STATUS;

    this.isReadOnlySaleReturn = status === 5;

    this.dataService.selectSaleReturn(returnId).subscribe((response: any) => {
      this.selectedSaleReturn = response;

      // APPROVED -> OPEN VIEW PAGE
      if (status === 5) {
        this.isViewSalesReturn = true;
      }

      // VERIFIED -> OPEN APPROVE PAGE
      else if (status === 2) {
        this.isApproveSalesReturn = true;
      }

      // OPEN VERIFY PAGE
      else {
        this.isVerifySalesReturn = true;
      }
    });
  }

  onDeleteSaleReturn(event: any) {
    const returnId = event.data.TRANS_ID;
    console.log(returnId);
    const status = event.data.TRANS_STATUS;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(returnId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deleteSaleReturn(returnId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getSaleReturnList();
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
    // console.log('DELETEEEEEEEEEE');
    // console.log(e, 'eventttttttttttttttttttt');
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.TRANS_STATUS === 5) {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');

        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  addSaleReturn() {
    this.isAddSaleReturn = true;
  }

  handleClose() {
    this.isAddSaleReturn = false;
    this.isEditSaleReturn = false;
    this.isViewSaleReturn = false;
    this.isVerifySalesReturn = false;
    this.isApproveSalesReturn = false;
    if (this.SaleReturnFormComponent) {
      this.SaleReturnFormComponent.resetSaleReturnForm();
    }
    this.getSaleReturnList();
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
    PurchaseReturnDebitFormModule,
    SaleReturnFormModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [SaleReturnComponent],
  exports: [SaleReturnComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SaleReturnModule {}
