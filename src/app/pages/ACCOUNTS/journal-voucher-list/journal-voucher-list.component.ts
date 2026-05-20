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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { ArticleListComponent } from '../../MASTER/article-list/article-list.component';
import { DataService } from 'src/app/services';
import {
  AddJournalVoucharComponent,
  AddJournalVoucharModule,
} from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import notify from 'devextreme/ui/notify';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-journal-voucher-list',
  templateUrl: './journal-voucher-list.component.html',
  styleUrls: ['./journal-voucher-list.component.scss'],
})
export class JournalVoucherListComponent {
  @ViewChild(AddJournalVoucharComponent)
  addJournalVoucherFormComponent!: AddJournalVoucharComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @ViewChild('journalChild') journalChild: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter:boolean= true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isAddJournalVoucher: any;
  journalVoucherList: any;
  userId = 'U001';
  companyId = 'C002';
  transactionId = 'T003';

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  startDate: Date= new Date();
  endDate: Date= new Date();
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, //  global style
    onClick: () => this.toggleFilters(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => this.addJournalVoucher());
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
  selectedJV: any;
  JVid: any;
  sessionData: any;
  selectedCompanyId: any;
  canVerify: any;
  isReadOnlyJV: boolean = false;
  isViewJV: boolean = false;
  isApproveJV: boolean = false;
  isVerifyJV: boolean = false;

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Journal_Voucher';
    this.dataService.exportDataGrid(event, fileName);
  }

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'today';
  showCustomDatePopup = false;
  customStartDate: any = null;
  customEndDate: any = null;
  filteredJournalVoucherList:
    | {
        billNo: string;
        ledgerCode: string;
        ledgerName: string;
        particulars: string;
        debitAmount: number;
        creditAmount: number;
        voucherDate: string;
      }[]
    | undefined;
  isEditJournalVoucher: boolean = false;
  selectedJournalVoucher: any;
  isViewJournalVoucher: boolean = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
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

    this.sessionData_tax();
    this.getJournalVouchers();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getJournalVouchers() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const datePayload = this.getDateRangePayload();

    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.dataService.getJournalVoucherList(payload).subscribe({
      next: (response: any) => {
        this.journalVoucherList = (response.Data || [])
          .map((item: any) => {
            let dateValue: Date;

            if (!isNaN(Date.parse(item.TRANS_DATE))) {
              dateValue = new Date(item.TRANS_DATE);
            } else {
              dateValue = this.parseDateString(item.TRANS_DATE);
            }

            return {
              ...item,
              TRANS_DATE: dateValue,
            };
          })
          .sort((a: any, b: any) => {
            const aNo = parseInt(a.DOC_NO.split('/').pop(), 10);
            const bNo = parseInt(b.DOC_NO.split('/').pop(), 10);
            return bNo - aNo;
          });

        // single binding source
        this.filteredJournalVoucherList = this.journalVoucherList;
      },
      error: (err) => {
        // ONLY ADDITION
        const message =
          err?.status === 0
            ? 'Network connection lost. Please check your internet.'
            : 'Unable to load journal vouchers. Please try again.';

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

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getJournalVouchers();
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
          icon: 'filter',
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

  

  handlePopupShown() {
    setTimeout(() => {
      this.journalChild?.focusRefField(); // Calls method in child component
    }, 100);
  }

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

    this.getJournalVouchers();
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.journalVoucherList) {
      this.filteredJournalVoucherList = this.journalVoucherList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredJournalVoucherList = this.journalVoucherList; // show full list
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
        this.filteredJournalVoucherList = this.journalVoucherList;
        return;
    }

    this.filteredJournalVoucherList = this.journalVoucherList.filter(
      (item: any) => {
        const journalDate = new Date(item.TRANS_DATE);
        return journalDate >= startDate && journalDate <= endDate;
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

    this.getJournalVouchers();
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

  addJournalVoucher() {
    this.isAddJournalVoucher = true;
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

  onEditJournalVoucher(event: any) {
    event.cancel = true; // Prevent default popup editing
    const journalId = event.data.TRANS_ID;
    this.JVid = event.data.TRANS_ID;
    this.selectedJV = journalId;
    const transStatus = event.data.TRANS_STATUS;
    console.log(event, 'JOURNALID');

    this.dataService
      .selectJournalVoucher(journalId)
      .subscribe((response: any) => {
        this.selectedJournalVoucher = response.Data;
        if (transStatus === 5) {
          // Open view popup
          this.isViewJournalVoucher = true;
        } else {
          // Open edit popup
          this.isEditJournalVoucher = true;
        }
        console.log(
          this.selectedJournalVoucher,
          'SELECTEDJOURNALVOUCHERRRRRRRRRRRR',
        );
      });
  }

  onVerifyJV(event: any) {
    const rowData = event.row.data;

    const invoiceId = rowData.TRANS_ID;
    const transStatus = rowData.TRANS_STATUS;

    this.isReadOnlyJV = transStatus === 5;

    this.dataService
      .selectJournalVoucher(invoiceId)
      .subscribe((response: any) => {
        this.selectedJournalVoucher = response.Data;

        // APPROVED -> OPEN VIEW PAGE
        if (transStatus === 5) {
          this.isViewJournalVoucher = true;
        }

        // VERIFIED -> OPEN APPROVE PAGE
        else if (transStatus === 2) {
          this.isApproveJV = true;
        }

        // OPEN VERIFY PAGE
        else {
          this.isVerifyJV = true;
        }
      });
  }

  onDeleteJournalVoucher(event: any) {
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This journal voucher cannot be deleted.', 'error', 2000);
      return;
    }
    const JVId = event.data.TRANS_ID;
    event.cancel = true;

    // Call your delete API
    this.dataService.deleteJournalVoucher(JVId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Journal Voucher Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getJournalVouchers();
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
    this.isAddJournalVoucher = false;
    this.isEditJournalVoucher = false;
    this.isViewJournalVoucher = false;
    this.isVerifyJV = false;
    this.isApproveJV = false;
    if (this.addJournalVoucherFormComponent) {
      this.addJournalVoucherFormComponent.resetJournalVoucherForm();
    }
    this.getJournalVouchers();
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
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [JournalVoucherListComponent],
  exports: [JournalVoucherListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JournalVoucherModule {}
