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
import { ArticleListComponent } from '../../ARTICLE/article-list/article-list.component';
import { DataService } from 'src/app/services';
import {
  AddJournalVoucharComponent,
  AddJournalVoucharModule,
} from '../add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../edit-journal-voucher/edit-journal-voucher.component';
import notify from 'devextreme/ui/notify';
import { ViewJournalVoucherModule } from '../view-journal-voucher/view-journal-voucher.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-journal-voucher-list',
  templateUrl: './journal-voucher-list.component.html',
  styleUrls: ['./journal-voucher-list.component.scss'],
})
export class JournalVoucherListComponent {
  @ViewChild(AddJournalVoucharComponent)
  addJournalVoucherFormComponent!: AddJournalVoucharComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('journalChild') journalChild: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
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

  startDate: Date;
  endDate: Date;
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addJournalVoucher(),
    onClick: () => {
      this.zone.run(() => {
        this.addJournalVoucher();
      });
    },
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
  showCustomDatePopup = false;
  customStartDate: any = null;
  customEndDate: any = null;
  filteredJournalVoucherList: {
    billNo: string;
    ledgerCode: string;
    ledgerName: string;
    particulars: string;
    debitAmount: number;
    creditAmount: number;
    voucherDate: string;
  }[];
  isEditJournalVoucher: boolean;
  selectedJournalVoucher: any;
  isViewJournalVoucher: boolean = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

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

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/journal-voucher');

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
    this.getJournalVouchers();
  }

  getJournalVouchers() {
    this.dataService.getJournalVoucherList().subscribe((response: any) => {
      this.journalVoucherList = response.Data.map((item: any) => {
        let dateValue: Date;

        // Case 1: If backend gives ISO format (2025-08-21T14:06:47.85)
        if (!isNaN(Date.parse(item.TRANS_DATE))) {
          dateValue = new Date(item.TRANS_DATE);
        } else {
          // Case 2: If backend gives dd-MM-yyyy format
          dateValue = this.parseDateString(item.TRANS_DATE);
        }

        return {
          ...item,
          TRANS_DATE: dateValue,
        };
      });

      this.applyDateFilter();
    });
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

  handlePopupShown() {
    setTimeout(() => {
      this.journalChild?.focusRefField(); // ✅ Calls method in child component
    }, 100);
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
      }
    );
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredJournalVoucherList = this.journalVoucherList.filter(
      (item: any) => {
        const journalDate = item.TRANS_DATE;
        return journalDate >= start && journalDate <= end;
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

  onEditJournalVoucher(event: any) {
    // If TRANS_STATUS is true, cancel the editing and show a message

    // Otherwise proceed with your normal logic
    event.cancel = true; // Prevent default popup editing
    const journalId = event.data.TRANS_ID;
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
          'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
        );
      });
  }

  onDeleteJournalVoucher(event: any) {
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This journal voucher cannot be edited.', 'error', 2000);
      return;
    }
    const JVId = event.data.ID;
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
            'success'
          );
          this.getJournalVouchers();
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
    this.isAddJournalVoucher = false;
    this.isEditJournalVoucher = false;
    this.isViewJournalVoucher = false;
    if (this.addJournalVoucherFormComponent) {
      this.addJournalVoucherFormComponent.resetJournalVoucherForm();
    }
    this.getJournalVouchers();
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
  ],
  providers: [],
  declarations: [JournalVoucherListComponent],
  exports: [JournalVoucherListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JournalVoucherModule {}
