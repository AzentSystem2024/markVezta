import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  DxDataGridModule,
  DxButtonModule,
  DxTabsModule,
  DxPopupModule,
  DxTextBoxModule,
  DxDraggableModule,
  DxSortableModule,
  DxSelectBoxModule,
  DxDataGridComponent,
  DxCheckBoxModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import {
  PurchaseOrderApproveFormComponent,
  PurchaseOrderApproveFormModule,
} from 'src/app/pop-up/operations/purchase-order-approve-form/purchase-order-approve-form.component';
import {
  PurchaseOrderEditFormComponent,
  PurchaseOrderEditFormModule,
} from 'src/app/pop-up/operations/purchase-order-edit-form/purchase-order-edit-form.component';
import {
  PurchaseOrderNewFormComponent,
  PurchaseOrderNewFormModule,
} from 'src/app/pop-up/operations/purchase-order-new-form/purchase-order-new-form.component';
import {
  PurchaseOrderVerifyFormComponent,
  PurchaseOrderVerifyFormModule,
} from 'src/app/pop-up/operations/purchase-order-verify-form/purchase-order-verify-form.component';
import {
  PurchaseOrderViewFormComponent,
  PurchaseOrderViewFormModule,
} from 'src/app/pop-up/operations/purchase-order-view-form/purchase-order-view-form.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
})
export class PurchaseOrderComponent {
  @ViewChild('PurchaseOrderNewFormComponent')
  PurchaseOrderNewFormComponent!: PurchaseOrderNewFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @ViewChild(PurchaseOrderNewFormComponent, { static: false })
  poNewForm!: PurchaseOrderNewFormComponent;
  @ViewChild(PurchaseOrderEditFormComponent, { static: false })
  poEditForm!: PurchaseOrderEditFormComponent;
  @ViewChild(PurchaseOrderVerifyFormComponent, { static: false })
  poVerifyForm!: PurchaseOrderVerifyFormComponent;
  @ViewChild(PurchaseOrderApproveFormComponent, { static: false })
  poApproveForm!: PurchaseOrderApproveFormComponent;
  @ViewChild(PurchaseOrderViewFormComponent, { static: false })
  poViewForm!: PurchaseOrderViewFormComponent;
  @ViewChild('paramValue', { static: false })
  public paramValue!: ElementRef;
  isAddPopupOpened: boolean = false;
  isEditPopupOpened: boolean = false;
  isVerifyPopupOpened: boolean = false;
  isApprovePopupOpened: boolean = false;
  isViewPopupOpened: boolean = false;
  isPrintPopupOpened: boolean = false;
  width: any = '92vw';
  height: any = '92vh';
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons: boolean = true;
  orientations: any = 'horizontal';
  stylingMode: any = 'primary';
  netAmount: any;
  netSupplierAmount: any;
  netQuantity: any;
  netEditAmount: any;
  netEditSupplierAmount: any;
  netEditQuantity: any;
  netVerifyAmount: any;
  netVerifySupplierAmount: any;
  netVerifyQuantity: any;
  netApproveAmount: any;
  netApproveSupplierAmount: any;
  netApproveQuantity: any;
  netViewAmount: any;
  netViewSupplierAmount: any;
  netViewQuantity: any;
  showSupplierAmount: any;
  dataSource: any;
  selectedRowData: any;
  formdata: any;
  userRights: any;
  docType: any;
  showTemplatePopup: boolean = false;
  printTemplateData: any[] = [];
  templateOptions = ['po', 'po1', 'po2'];
  selectedTemplate: any;
  doc = 17;
  flag: boolean = false;
  templateList: any;
  refreshPo = false;
  title = 'DXReportDesignerSample';
  id = 1;

  getViewModelAction: any;
  poId: any;

  poDetails: any;


  showReportDesigner: boolean = false;

  showHeaderFilter: boolean = true;
  showFilterRow = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isApproved: boolean = false;

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
      this.ngZone.run(() => this.openPurchaseOrderForm());
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
  sessionData: any;
  selected_vat_id: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  isFilterOpened!: boolean;
  selectedPoId: any;
  GST_PERC: any;
  HSN_CODE: any;
  docNo: any;
  selected_Company_id: any;
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
  showCustomDatePopup = false
  filteredPOList: any;
  isSaving = false;
  selectedStoreId: any;
  storeList: any;
  isHQApp: any;
  filteredStoreList: any;
  canVerify: any;
  isVerifyMode: boolean = false;
  isApproveMode: boolean = false;
  popupTitle: string = 'Edit Purchase Order';
  finId: any;
  userID: any;

  constructor(
    private service: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) { }
  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.userID = sessionData.USER_ID;
  }

  ngOnInit(): void {
    this.sessionDetails();
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log(menuResponse.FINANCIAL_YEARS[0].FIN_ID, 'MENURESPONSEINPO');
    this.finId = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    console.log(packingRights, 'packingRights');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
    const userDataString = localStorage.getItem('userData') || '{}';
    const userData = JSON.parse(userDataString);
    if (userData.USER_ID) {
      this.userID = userData.USER_ID;
    }
    this.getStoreData();
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    this.getPurchaseOrderList();
    this.initializePrintTemplateData();
    this.getDocNo();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.getPurchaseOrderList();
    }
  }
  onStoreChanged(e: any) {
    this.selectedStoreId = e.value;

    this.getPurchaseOrderList();
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton',
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton',
        location: 'after',
        options: {
          icon: 'search',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
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
    {
      text: 'Closed',
      value: 'Closed',
    },
    {
      text: 'Partial',
      value: 'Partial',
    },
  ];

  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      visible: (e: any) =>
        e.row.data.STATUS !== 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
      visible: (e: any) =>
        e.row.data.STATUS == 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'View',
      icon: 'detailslayout',
      text: 'View',
      visible: (e: any) => e.row.data.STATUS === 'Approved',
    },
  ];

  allButtonsEditDelete = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      template: 'verifyTemplate',
      visible: (e: any) =>
        e.row.data.STATUS !== 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      name: 'edit',
      visible: (e: any) => {
        const status = e.row.data.STATUS;

        if (['Approved', 'Closed', 'Partial'].includes(status)) {
          return true;
        }

        return this.canEdit && status === 'Open';
      },
    },
    {
      name: 'delete',
      visible: (e: any) => {
        const status = e.row.data.STATUS;

        return (
          this.canDelete && !['Approved', 'Verified', 'Closed'].includes(status)
        );
      },
    },
  ];

  initializePrintTemplateData() {
    this.printTemplateData = [
      { type: 'main-header', data: 'Purchase Order' },
      { type: 'header', data: [] },
      { type: 'grid', data: [] },
      { type: 'footer', data: 'Thank you for your business!' },
    ];
  }

  onApproveClick = (e: any) => {
    console.log("Approve Badge Clicked");
    const id = e.row.data.ID;
    const status = e.row.data.STATUS;
    this.isApprovePopupOpened = true;
    this.service.selectPoData(id).subscribe((res) => {
      this.selectedRowData = res;
    });
  };

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.STATUS === 5) {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  onEditingRow(event: any): void {
    event.cancel = true;
    this.poId = event.data.ID;
    const Id = event.data.ID;
    this.selectedPoId = Id;
    const status = event.data.STATUS;

    this.sessionDetails();

    this.service.selectPoData(Id).subscribe((res) => {
      this.selectedRowData = res;

      if (
        status === 'Verified' ||
        status === 'Approved' ||
        status === 'Closed' ||
        status === 'Partial'
      ) {
        this.isViewPopupOpened = true;
      } else {
        this.isEditPopupOpened = true;
      }
    });
  }

  onVerifyClick(e: any) {
    console.log("Badge Clicked");
    const rowData = e.row.data;
    console.log(rowData, 'ROWDATA');
    const id = rowData.ID;
    const status = rowData.STATUS;

    this.service.selectPoData(id).subscribe((res) => {
      this.selectedRowData = res;

      if (
        status === 'Approved' ||
        status === 'Closed' ||
        status === 'Partial'
      ) {
        this.isViewPopupOpened = true;
        return;
      }

      if (status === 'Verified') {
        this.isApproved = true;
        this.isVerifyMode = false;

        this.isApprovePopupOpened = true;
        return;
      }

      this.isVerifyMode = true;

      this.isVerifyPopupOpened = true;
    });
  }
  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };

    this.service.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const configStore = userData.Configuration?.[0];

      if (this.isHQApp && configStore) {
        this.filteredStoreList = [
          {
            ID: configStore.STORE_ID,
            DESCRIPTION: configStore.STORE_NAME,
          },
        ];

        this.selectedStoreId = configStore.STORE_ID;
      } else {
        this.filteredStoreList = this.storeList;

        if (!this.selectedStoreId && this.storeList?.length) {
          this.selectedStoreId = this.storeList[0].ID;
        }
      }

      this.getPurchaseOrderList();
    });
  }

  getPurchaseOrderList() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
      STORE_ID: this.selectedStoreId,
      USER_ID: this.userID || this.sessionData?.USER_ID || null,
    };

    this.service.getPurchaseOrderList(payload).subscribe({
      next: (res: any) => {
        this.dataSource = (res.data || [])
          .map((item: any) => {
            let dateValue: Date | null = null;

            if (item.PO_DATE) {
              if (typeof item.PO_DATE === 'string') {
                const parts = item.PO_DATE.split('T')[0].split('-');

                if (parts[0].length === 2) {
                  const day = Number(parts[0]);
                  const month = Number(parts[1]) - 1;
                  const year = Number(parts[2]);
                  dateValue = new Date(year, month, day);
                } else {
                  dateValue = new Date(item.PO_DATE);
                }
              } else {
                dateValue = new Date(item.PO_DATE);
              }
            }

            return {
              ...item,
              PO_DATE: dateValue,
            };
          })
          .sort((a: any, b: any) => {
            const numA = a.DOC_NO ? parseInt(String(a.DOC_NO).split('/').pop() || '0', 10) : 0;
            const numB = b.DOC_NO ? parseInt(String(b.DOC_NO).split('/').pop() || '0', 10) : 0;
            if (numA && numB && !isNaN(numA) && !isNaN(numB) && numA !== numB) {
              return numB - numA;
            }
            return (b.ID || 0) - (a.ID || 0);
          });

        this.filteredPOList = this.dataSource;
      },
      error: () => { },
      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    this.getPurchaseOrderList();
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.dataSource) {
      this.filteredPOList = this.dataSource;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredPOList = this.dataSource;
      return;
    }
    const today = new Date();
    let startDate: Date;
    const endDate = new Date();

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
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
        this.filteredPOList = this.dataSource;
        return;
    }

    this.filteredPOList = this.dataSource.filter((item: any) => {
      if (!item.PO_DATE) {
        console.warn('Missing PO_DATE in item:', item);
        return false;
      }

      if (!(item.PO_DATE instanceof Date)) return false;
      const invoiceDate = item.PO_DATE;

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

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getPurchaseOrderList();
  }

  private parseDateString(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date string:', dateStr);
      return new Date('Invalid');
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
        innerList.off('itemClick');
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

  openPurchaseOrderForm() {
    this.isApproved = false;
    this.isAddPopupOpened = true;
    this.getDocNo();
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 17,
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  onTemplateReorder(event: any): void {
    const movedItem = this.printTemplateData[event.fromIndex];
    this.printTemplateData.splice(event.fromIndex, 1);
    this.printTemplateData.splice(event.toIndex, 0, movedItem);
  }

  ClosePrintPopup() {
    this.isPrintPopupOpened = false;
  }

  onCancelNewData() {
    if (this.poNewForm) {
      this.poNewForm.resetForm();
    } else {
      console.warn('poNewForm reference not found!');
    }
  }

  onClickSaveNewData() {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    const data = this.poNewForm.getNewPoData();

    const suppCode = this.poNewForm.supplierCountryCode?.replace('+', '');
    const contactCode = this.poNewForm.shippingCountryCode?.replace('+', '');

    if (data.SUPP_MOBILE && !data.SUPP_MOBILE.includes('-')) {
      data.SUPP_MOBILE = `${suppCode}-${data.SUPP_MOBILE}`;
    }

    if (data.CONTACT_MOBILE && !data.CONTACT_MOBILE.includes('-')) {
      data.CONTACT_MOBILE = `${contactCode}-${data.CONTACT_MOBILE}`;
    }
    data.IS_APPROVED = this.isApproved;
    data.FIN_ID = this.finId;
    if (!data.STORE_ID) {
      notify(
        {
          message: 'Please select Store',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    if (!data.SUPP_ID) {
      notify(
        {
          message: 'Please select Supplier',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    if (!data.PO_DATE) {
      notify(
        {
          message: 'Please select PO Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    if (!data.DELIVERY_DATE) {
      notify(
        {
          message: 'Please select Delivery Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    if (
      !this.poNewForm.poData.PoDetails ||
      this.poNewForm.poData.PoDetails.length === 0
    ) {
      notify(
        {
          message: 'Please add quantity',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    const poDetails = this.poNewForm.poData.PoDetails.map((item: any) => {
      if (this.poNewForm.isInterState) {
        return {
          ...item,
          TAX_PERCENT: item.VAT_PERC,
          CGST: 0,
          SGST: 0,
          PRICE: item.SUPP_PRICE,
        };
      }

      return {
        ...item,
        TAX_PERCENT: 0,
        CGST: item.CGST,
        SGST: item.SGST,
      };
    });
    const invalidPriceItem = data.PoDetails.find(
      (item: any) =>
        item.SUPP_PRICE === null ||
        item.SUPP_PRICE === undefined ||
        item.SUPP_PRICE === '' ||
        Number(item.SUPP_PRICE) <= 0,
    );

    if (invalidPriceItem) {
      notify(
        {
          message: 'Please enter price for all items',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }
    data.PoDetails = poDetails;

    const executeSave = () => {
      this.service
        .savePoData(data)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
        )
        .subscribe({
          next: (res: any) => {
            if (res.message === 'Success' && res.flag === 1) {
              notify(
                {
                  message: data.IS_APPROVED
                    ? 'Data Saved & Approved Successfully'
                    : 'Data Saved Successfully',
                },
                'success',
              );

              this.refreshPo = true;
              setTimeout(() => (this.refreshPo = false), 0);

              this.dataGrid.instance.refresh();
              this.isAddPopupOpened = false;

              this.poNewForm?.resetForm();
              this.poNewForm?.getDocNo();
              this.getPurchaseOrderList();
            } else {
              notify({ message: 'Your Data Not Saved' }, 'error');
            }
          },
          error: () => {
            notify({ message: 'Server error while saving data' }, 'error');
          },
        });
    };

    if (this.isApproved) {
      confirm(
        'Are you sure you want to approve this Purchase Order?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          executeSave();
        } else {
          this.isSaving = false;
        }
      });
    } else {
      executeSave();
    }
  }

  UpdatePurchaseOrder() {
    if (this.isSaving) return;
    this.isSaving = true;
    const data = this.poEditForm.getNewPoData();
    data.FIN_ID = this.finId;
    this.poEditForm.preparePoDetailsForSubmit();
    const suppCode = (this.poEditForm.supplierCountryCode || '+91').replace(
      '+',
      '',
    );
    const contactCode = (this.poEditForm.shippingCountryCode || '+91').replace(
      '+',
      '',
    );

    if (data.SUPP_MOBILE && !data.SUPP_MOBILE.includes('-')) {
      data.SUPP_MOBILE = `${suppCode}-${data.SUPP_MOBILE}`;
    }

    if (data.CONTACT_MOBILE && !data.CONTACT_MOBILE.includes('-')) {
      data.CONTACT_MOBILE = `${contactCode}-${data.CONTACT_MOBILE}`;
    }

    data.PoDetails = [...this.poEditForm.poData.PoDetails];
    data.PoDetails = data.PoDetails.map((item: any) => ({
      ...item,
      PRICE: item.SUPP_PRICE,
    }));
    const invalidPriceItem = data.PoDetails.find(
      (item: any) =>
        item.SUPP_PRICE === null ||
        item.SUPP_PRICE === undefined ||
        item.SUPP_PRICE === '' ||
        Number(item.SUPP_PRICE) <= 0,
    );

    if (invalidPriceItem) {
      notify(
        {
          message: 'Please enter price for all items',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      this.isSaving = false;
      return;
    }
    if (this.isApproved) {
      confirm(
        'Are you sure you want to approve this Purchase Order?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          this.service
            .ApprovePoData(data)
            .pipe(
              finalize(() => {
                this.isSaving = false;
              }),
            )
            .subscribe((res) => {
              if (res && res.flag === 1) {
                notify(
                  {
                    message: 'Purchase Order Approved',
                    position: { at: 'top center', my: 'top center' },
                  },
                  'success',
                );
                this.CloseEditForm();
                this.getPurchaseOrderList();
              } else {
                notify(
                  {
                    message: res?.Message || 'Approval Failed',
                    position: { at: 'top center', my: 'top center' },
                  },
                  'error',
                );
              }
            });
        } else {
        }
      });
    } else {
      const apiCall = this.service.updatePoData(data);

      apiCall
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
        )
        .subscribe((res) => {
          if (res) {
            notify(
              {
                message: this.isVerifyMode
                  ? 'Purchase Order Verified Successfully'
                  : 'Data Updated Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.CloseEditForm();
            this.getPurchaseOrderList();
          } else {
            notify(
              {
                message: this.isVerifyMode
                  ? 'Verification Failed'
                  : 'Your Data Not Updated',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
    }
  }

  VerifyPurchaseOrder() {
    const result = confirm(
      'Are you sure you want to verify this Purchase Order?',
      'Confirm Verification',
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const data = this.poEditForm.getNewPoData();
        data.FIN_ID = this.finId;
        this.poEditForm.preparePoDetailsForSubmit();

        const suppCode = (this.poEditForm.supplierCountryCode || '+91').replace(
          '+',
          '',
        );

        const contactCode = (
          this.poEditForm.shippingCountryCode || '+91'
        ).replace('+', '');

        if (data.SUPP_MOBILE && !data.SUPP_MOBILE.includes('-')) {
          data.SUPP_MOBILE = `${suppCode}-${data.SUPP_MOBILE}`;
        }

        if (data.CONTACT_MOBILE && !data.CONTACT_MOBILE.includes('-')) {
          data.CONTACT_MOBILE = `${contactCode}-${data.CONTACT_MOBILE}`;
        }

        data.PoDetails = [...this.poEditForm.poData.PoDetails];

        data.PoDetails = data.PoDetails.map((item: any) => ({
          ...item,
          PRICE: item.SUPP_PRICE,
        }));

        const invalidPriceItem = data.PoDetails.find(
          (item: any) =>
            item.SUPP_PRICE === null ||
            item.SUPP_PRICE === undefined ||
            item.SUPP_PRICE === '' ||
            Number(item.SUPP_PRICE) <= 0,
        );

        if (invalidPriceItem) {
          notify(
            {
              message: 'Please enter price for all items',
              position: { at: 'top center', my: 'top center' },
            },
            'error',
          );
          return;
        }

        this.service.verifyPoData(data).subscribe((res) => {
          if (res) {
            notify(
              {
                message: 'Purchase Order Verified Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.CloseEditForm();
            this.getPurchaseOrderList();
          } else {
            notify(
              {
                message: 'Verification Failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
      }
    });
  }

  ApprovePurchaseOrder() {
    const result = confirm(
      'Are you sure you want to approve this Purchase Order?',
      'Confirm Approval',
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        const data = this.poEditForm.getNewPoData();
        data.FIN_ID = this.finId;
        this.poEditForm.preparePoDetailsForSubmit();

        const suppCode = (this.poEditForm.supplierCountryCode || '+91').replace(
          '+',
          '',
        );

        const contactCode = (
          this.poEditForm.shippingCountryCode || '+91'
        ).replace('+', '');

        if (data.SUPP_MOBILE && !data.SUPP_MOBILE.includes('-')) {
          data.SUPP_MOBILE = `${suppCode}-${data.SUPP_MOBILE}`;
        }

        if (data.CONTACT_MOBILE && !data.CONTACT_MOBILE.includes('-')) {
          data.CONTACT_MOBILE = `${contactCode}-${data.CONTACT_MOBILE}`;
        }

        data.PoDetails = [...this.poEditForm.poData.PoDetails];
        data.PoDetails = data.PoDetails.map((item: any) => ({
          ...item,
          PRICE: item.SUPP_PRICE,
        }));

        this.service.ApprovePoData(data).subscribe((res) => {
          if (res) {
            notify(
              {
                message: 'Data Approved Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.CloseEditForm();
            this.getPurchaseOrderList();
          } else {
            notify(
              {
                message: 'Your Data Not Approved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
      }
    });
  }

  deletePOData(event: any) {
    if (event.data.STATUS === 5) {
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
        const invoiceId = event.data.ID;

        this.service.DeletePoData(invoiceId).subscribe(
          (response: any) => {
            if (response) {
              notify(
                {
                  message: 'Purchase Order Deleted Successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success',
              );

              this.getPurchaseOrderList();

              setTimeout(() => {
                this.dataGrid.instance.refresh();
              }, 100);
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

  CloseEditForm() {
    this.isEditPopupOpened = false;
    this.isVerifyPopupOpened = false;
    this.isApprovePopupOpened = false;
    this.dataGrid.instance.refresh();
  }

  ClearFormData() {
    this.isAddPopupOpened = false;
    this.dataGrid.instance.refresh();
  }

  formatPoDate(rowData: any): string {
    const celldate = rowData.PO_DATE;
    if (!celldate) return '';

    const date = new Date(celldate);

    const formattedDate = date.toLocaleDateString();

    return formattedDate;
  }

  applyTemplate() {
    this.flag = false;
    if (this.selectedTemplate) {
      this.flag = true;
      this.showTemplatePopup = false;
      this.showReportDesigner = true;
    } else {
      alert('Please select a template before applying');
    }
  }

  clearData() {
    this.poNewForm.close();
  }

  OnParametersInitialized(event: any) {
    var invisibleIntParamValue = 42;
    var intParam = event.args.ActualParametersInfo.filter(
      (x: any) => x.parameterDescriptor.name == 'intParam',
    )[0];
    intParam.value = invisibleIntParamValue;
  }

  viewPdf(log: any) { }
}

@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemsFormModule,
    DxTabsModule,
    CommonModule,
    DxPopupModule,
    PurchaseOrderNewFormModule,
    PurchaseOrderEditFormModule,
    DxTextBoxModule,
    PurchaseOrderVerifyFormModule,
    PurchaseOrderApproveFormModule,
    PurchaseOrderViewFormModule,
    DxDraggableModule,
    DxSortableModule,
    DxSelectBoxModule,
    DxDataGridModule,
    PurchaseOrderEditFormModule,
    DxCheckBoxModule,
    CustomDatePopupModule,
    DxDateBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [PurchaseOrderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseOrderModule { }
