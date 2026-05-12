import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
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

import notify from 'devextreme/ui/notify';
import { QuotationFormModule } from '../../quotation-form/quotation-form.component';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.scss'],
})
export class QuotationComponent {
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
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  sessionData: any;
  selected_vat_id: any;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => this.addQuotation());
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
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  matrixCode: any;
  userID: any;
  finID: any;
  companyID: any;
  storeFromSession: any;
  selectedCompanyId: any;
  canVerify: any;
  isViewInvoice: boolean;
  isApproveInvoice: boolean;
  isVerifyInvoice: boolean;
  isVerifyQuotation: boolean;
  isApproveQuotation: boolean;
  isViewQuotation: boolean;
  onExporting(event: any) {
    const fileName = 'Credit_Note';
    this.dataService.exportDataGrid(event, fileName);
  }
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
  // addButtonOptions = {
  //   text: 'New',
  //   icon: 'bi bi-file-earmark-plus',
  //   // icon: 'add',
  //   type: 'default',
  //   stylingMode: 'contained',
  //   hint: 'Add new entry',
  //   // onClick: () => this.addCreditNote(),
  //   onClick: () => {
  //     this.zone.run(() => {
  //       this.addQuotation();
  //     });
  //   },
  //   elementAttr: { class: 'add-button' },
  // };

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
  filteredQuotationInList: any;
  isReadOnlyQuotation: boolean = false;
  isAddQuotation: boolean = false;
  isEditQuotation: boolean = false;
  selectedQuotation: any;
  quotationList: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    console.log(this.companyID, 'COMPANYIDDDDDDDDDDDDDDDDDDDDDDDDDDD');
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
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
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getQuotationList();
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  getQuotationList() {
    const payload = this.buildDatePayload();

    this.dataService
      .getQuotationMainList(payload)
      .subscribe((response: any) => {
        this.quotationList = response.Data.map((item: any) => {
          let dateValue: Date;

          if (!isNaN(Date.parse(item.QTN_DATE))) {
            dateValue = new Date(item.QTN_DATE);
          } else {
            dateValue = this.parseDateString(item.QTN_DATE);
          }

          return {
            ...item,
            QTN_DATE: dateValue,
          };
        });

        //  Backend already filtered
        this.filteredQuotationInList = this.quotationList;
      });
  }

  private toDateOnly(d: Date | null): string | null {
    if (!d) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // yyyy-MM-dd
  }

  private buildDatePayload() {
    const today = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    switch (this.selectedDateRange) {
      case 'today':
        from = new Date();
        to = new Date();
        break;

      case 'last7':
        from = new Date();
        from.setDate(today.getDate() - 6);
        to = new Date();
        break;

      case 'last15':
        from = new Date();
        from.setDate(today.getDate() - 14);
        to = new Date();
        break;

      case 'last30':
        from = new Date();
        from.setDate(today.getDate() - 29);
        to = new Date();
        break;

      case 'custom':
        from = this.customStartDate ? new Date(this.customStartDate) : null;
        to = this.customEndDate ? new Date(this.customEndDate) : null;
        break;

      case 'all':
      default:
        from = null;
        to = null;
    }

    return {
      COMPANY_ID: this.companyID,
      DATE_FROM: this.toDateOnly(from),
      DATE_TO: this.toDateOnly(to),
    };
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 5 ? 'APPROVED' : 'OPEN';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 5,
    },
    {
      text: 'Open',
      value: 1,
    },
  ];

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.customStartDate = null;
      this.customEndDate = null;
      this.showCustomDatePopup = true;
    } else {
      this.getQuotationList(); // 🔥 API call
    }
  }
  onCustomDateApplied(event: any) {
    this.customStartDate = event.startDate;
    this.customEndDate = event.endDate;

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getQuotationList(); // 🔥 API call with custom dates
  }
  applyDateFilter() {
    if (!this.selectedDateRange || !this.quotationList) {
      this.filteredQuotationInList = this.quotationList;
      return;
    }

    if (this.selectedDateRange === 'all') {
      this.filteredQuotationInList = this.quotationList;
      return;
    }

    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last15':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last30':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        this.filteredQuotationInList = this.quotationList;
        return;
    }

    // Filter from the original list, not the previously filtered one
    this.filteredQuotationInList = this.quotationList.filter((item: any) => {
      if (!item.QTN_DATE) return false;

      const invoiceDate = new Date(item.QTN_DATE); // ensure it's a Date object
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredQuotationInList = this.filteredQuotationInList.filter(
      (item: any) => {
        const invoiceDate = item.QTN_DATE;
        return invoiceDate >= start && invoiceDate <= end;
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

  formatDate(date: Date) {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getQuotationList();
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addQuotation() {
    this.isAddQuotation = true;
  }

  onEditQuotation(event: any) {
    event.cancel = true;
    const quotationId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    this.dataService
      .selectSalesQuotation(quotationId)
      .subscribe((response: any) => {
        this.selectedQuotation = response.Data;
        console.log(this.selectedQuotation, 'SELECTEDTROUT');
        this.isEditQuotation = true;
        this.isReadOnlyQuotation = status === 5;
      });
  }

  onVerifyQuotation(event: any) {
    const rowData = event.row.data;
    console.log(rowData);
    const quotationId = rowData.ID;
    const transStatus = rowData.TRANS_STATUS;
    console.log(quotationId, transStatus, 'IDANDSTATUS');
    this.isReadOnlyQuotation = transStatus === 5;
    this.dataService
      .selectSalesQuotation(quotationId)
      .subscribe((response: any) => {
        this.selectedQuotation = response.Data;
        if (transStatus === 5) {
          this.isViewQuotation = true;
        } else if (transStatus === 2) {
          this.isApproveQuotation = true;
        } else {
          this.isVerifyQuotation = true;
        }
      });
  }

  onDeleteQuotation(event: any) {
    const quotationId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(quotationId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deleteSalesQuotation(quotationId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getQuotationList();
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
      const buttons = e.cellElement.querySelectorAll('.dx-link');

      buttons.forEach((btn: HTMLElement) => {
        if (
          btn.classList.contains('dx-link-delete') &&
          e.data.TRANS_STATUS === 5
        ) {
          btn.title = 'Approved records cannot be deleted'; // tooltip
          btn.classList.add('dx-state-disabled'); // make it look disabled

          // Remove DevExtreme’s default click first (avoid multiple triggers)
          const newBtn = btn.cloneNode(true) as HTMLElement;
          btn.parentNode?.replaceChild(newBtn, btn);

          // Attach our custom click handler
          newBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            notify('Approved records cannot be deleted.', 'error', 2000);
          });
        }
      });
    }
  }

  handleClose() {
    this.isAddQuotation = false;
    this.isEditQuotation = false;
    this.isVerifyQuotation= false;
    this.isApproveQuotation= false;
    this.isViewQuotation= false;
    this.getQuotationList();
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
    QuotationFormModule,
  ],
  providers: [],
  declarations: [QuotationComponent],
  exports: [QuotationComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuotationModule {}
