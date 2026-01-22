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
import { ArticleAddModule } from '../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddPurchaseInvoiceModule } from '../PURCHASE INVOICE/add-purchase-invoice/add-purchase-invoice.component';
import { EditPurchaseInvoiceModule } from '../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { PurchaseInvoiceListComponent } from '../PURCHASE INVOICE/purchase-invoice-list/purchase-invoice-list.component';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import {
  PurchaseReturnDebitFormComponent,
  PurchaseReturnDebitFormModule,
} from '../purchase-return-debit-form/purchase-return-debit-form.component';

@Component({
  selector: 'app-purchase-return-debit',
  templateUrl: './purchase-return-debit.component.html',
  styleUrls: ['./purchase-return-debit.component.scss'],
})
export class PurchaseReturnDebitComponent {
  @ViewChild(PurchaseReturnDebitFormComponent)
  PurchaseReturnDebitFormComponent!: PurchaseReturnDebitFormComponent;
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
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addPurchaseReturn());
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
  isAddDebitNote: boolean = false;
  isEditDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  selectedDebitNote: any;
  isViewDebitNote: boolean;
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

  // refreshButtonOptions = {
  //   icon: 'refresh',
  //   hint: 'Refresh',
  //   onClick: () => this.refreshGrid(),
  //   text: '',
  // };
  isAddPurchaseReturn: boolean;
  isEditPurchaseReturn: boolean;
  isViewPurchaseReturn: boolean;
  selectedPurchaseReturn: any;
  isReadOnlyPurchaseReturn: boolean;
  companyID: any;

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    console.log('Parsed ObjectData:', menuResponse);
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/debit');

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
    this.getpurchaseReturnList();
    this.sessionData_tax();
  }

  getpurchaseReturnList() {
    const payload = {
      COMPANY_ID: this.companyID,
    };
    this.dataService
      .getPurchaseReturnMainList(payload)
      .subscribe((response: any) => {
        this.purchaseReturnList = response.Data.map((item: any) => {
          let dateValue: Date;

          // Case 1: If backend gives ISO format (2025-08-21T14:06:47.85)
          if (!isNaN(Date.parse(item.RET_DATE))) {
            dateValue = new Date(item.RET_DATE);
          } else {
            // Case 2: If backend gives dd-MM-yyyy format
            dateValue = this.parseDateString(item.RET_DATE);
          }

          return {
            ...item,
            RET_DATE: dateValue,
          };
        }).sort((a: any, b: any) => {
          const extractRunningNo = (docNo: string): number => {
            if (!docNo) return 0;

            // Matches PR0023 → 0023
            const match = docNo.match(/PR(\d+)$/);
            return match ? Number(match[1]) : 0;
          };

          return extractRunningNo(b.DOC_NO) - extractRunningNo(a.DOC_NO);
        });

        this.applyDateFilter();
      });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getpurchaseReturnList();
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

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredJournalVoucherList = this.purchaseReturnList.filter(
      (item: any) => {
        // const journalDate = this.parseDateString(item.RET_DATE);
        const journalDate = item.RET_DATE;
        return journalDate >= start && journalDate <= end;
      },
    );

    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} to ${toLabel}` }
        : option,
    );

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

  onEditPurchaseReturn(event: any) {
    event.cancel = true;
    const returnId = event.data.TRANS_ID;
    const status = event.data.TRANS_STATUS;
    this.dataService
      .selectPurchaseReturn(returnId)
      .subscribe((response: any) => {
        this.selectedPurchaseReturn = response;
        console.log(this.selectedPurchaseReturn, 'SELECTEDTROUT');
        this.isEditPurchaseReturn = true;
        this.isReadOnlyPurchaseReturn = status === 5;
      });
  }
  onDeletePurchaseReturn(event: any) {
    console.log(event);
    const returnId = event.data.TRANS_ID;
    console.log(returnId);
    const status = event.data.TRANS_STATUS;
    console.log(status);
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(returnId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deletePurchaseReturn(returnId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getpurchaseReturnList();
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
      if (e.data.TRANS_STATUS === 5) {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }
  addPurchaseReturn() {
    this.isAddPurchaseReturn = true;
  }

  handleClose() {
    this.isAddPurchaseReturn = false;
    this.isEditPurchaseReturn = false;
    this.isViewPurchaseReturn = false;
    if (this.PurchaseReturnDebitFormComponent) {
      this.PurchaseReturnDebitFormComponent.resetPurchaseReturnForm();
    }
    this.getpurchaseReturnList();
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
  ],
  providers: [],
  declarations: [PurchaseReturnDebitComponent],
  exports: [PurchaseReturnDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseReturnDebitModule {}
