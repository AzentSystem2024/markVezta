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
import { EditPurchaseInvoiceModule } from '../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { confirm } from 'devextreme/ui/dialog';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss'],
})
export class PurchaseOrderComponent {
  @ViewChild('PurchaseOrderNewFormComponent')
  PurchaseOrderNewFormComponent!: PurchaseOrderNewFormComponent;

  isAddPopupOpened: boolean = false;
  isEditPopupOpened: boolean = false;
  isVerifyPopupOpened: boolean = false;
  isApprovePopupOpened: boolean = false;
  isViewPopupOpened: boolean = false;
  isPrintPopupOpened: boolean = false;
  width: any = '90vw';
  height: any = '100vh';
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

  // getDesignerModelAction: any = `WebDocumentViewer/Invoke/`;
  getViewModelAction: any;
  poId: any;

  poDetails: any;

  // reportName = 'Report';

  // The backend application URL.
  // host = 'http://localhost:49834/';
  showReportDesigner: boolean = false;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(PurchaseOrderNewFormComponent, { static: false })
  poNewForm: PurchaseOrderNewFormComponent;
  @ViewChild(PurchaseOrderEditFormComponent, { static: false })
  poEditForm: PurchaseOrderEditFormComponent;
  @ViewChild(PurchaseOrderVerifyFormComponent, { static: false })
  poVerifyForm: PurchaseOrderVerifyFormComponent;
  @ViewChild(PurchaseOrderApproveFormComponent, { static: false })
  poApproveForm: PurchaseOrderApproveFormComponent;
  @ViewChild(PurchaseOrderViewFormComponent, { static: false })
  poViewForm: PurchaseOrderViewFormComponent;
  // @ViewChild(DxReportViewerComponent, { static: false })
  // viewer!: DxReportViewerComponent;
  @ViewChild('paramValue', { static: false })
  public paramValue!: ElementRef;

  showHeaderFilter: true;
  showFilterRow = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isApproved: boolean = false;

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
  isFilterOpened: boolean;
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
  showCustomDatePopup = false;
  filteredPOList: any;

  constructor(
    private service: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    // const userRights = sessionStorage.getItem('menuUserRightsResponse');
    // this.userRights = JSON.parse(userRights);
    // console.log(this.userRights, 'userRights');
    // const docType = this.userRights[0].DOC_TYPE;
    // console.log(docType, 'doctype');
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    console.log(
      this.HSN_CODE,
      '===========selected HSN CODE===================',
    );
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
    console.log(
      this.GST_PERC,
      '===========selected GST PERC===================',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit(): void {
    this.sessionDetails();
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData:', menuResponse);
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

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
    console.log('PURCHASEORDER');
    this.getPurchaseOrderList();
    this.initializePrintTemplateData();
    this.getTemplateList();
    this.getDocNo();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

    onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getPurchaseOrderList();
    }
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
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'Approved' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

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

  getTemplateList() {
    this.service.getTemplateList(this.doc).subscribe((res: any) => {
      this.templateList = res.data;
      const defaultTemplate = this.templateList.find(
        (item: any) => item.IS_DEFAULT === true,
      );
      if (defaultTemplate) {
        this.selectedTemplate = defaultTemplate.TEMPLATE_NAME;
      } else {
        // Handle the case where no default template is found
        this.selectedTemplate = null;
      }
    });
  }

  customButtons = [
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      // onClick: (e) => this.onVerifyClick(e),
      visible: (e) =>
        e.row.data.STATUS !== 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) =>
        e.row.data.STATUS == 'Verified' && e.row.data.STATUS !== 'Approved',
    },
    {
      hint: 'View',
      icon: 'detailslayout', // You can change this to an appropriate icon
      text: 'View',
      // onClick: (e) => this.onViewClick(e),
      visible: (e) => e.row.data.STATUS === 'Approved',
    },
  ];

  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: (e) =>
        e.row.data.STATUS !== 'Approved' || e.row.data.STATUS !== 'Open',
    },
    {
      name: 'delete',
      visible: (e) =>
        e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified',
    },
  ];

  initializePrintTemplateData() {
    this.printTemplateData = [
      { type: 'main-header', data: 'Purchase Order' },
      { type: 'header', data: [] }, // Example header
      { type: 'grid', data: [] }, // Ensure the 'grid' type exists
      { type: 'footer', data: 'Thank you for your business!' }, // Example footer
    ];
  }

  onApproveClick = (e) => {
    console.log(e, 'EDITCLICKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');
    const id = e.row.data.ID;
    const status = e.row.data.STATUS;
    console.log(id, 'STATUSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS');
    this.isApprovePopupOpened = true;
    this.service.selectPoData(id).subscribe((res) => {
      this.selectedRowData = res;
      console.log(this.selectedRowData, 'select row data');
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

  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    this.poId = event.data.ID;
    const Id = event.data.ID;
    this.selectedPoId = Id;
    const status = event.data.STATUS;
    console.log(Id, 'id');
    this.sessionDetails();
    // this.isEditPopupOpened = true;
    this.service.selectPoData(Id).subscribe((res) => {
      this.selectedRowData = res;
      if (status === 'Approved') {
        // Open view popup
        this.isViewPopupOpened = true;
      } else {
        // Open edit popup
        this.isEditPopupOpened = true;
      }
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
                  // dd-MM-yyyy
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
            const numA = parseInt(a.DOC_NO.split('/').pop(), 10);
            const numB = parseInt(b.DOC_NO.split('/').pop(), 10);
            return numB - numA;
          });

        // ✅ SAME AS PRODUCTION JV
        this.filteredPOList = this.dataSource;
      },
      error: () => {},
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

    // reset custom label
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
      this.filteredPOList = this.dataSource; // show full list
      return;
    }
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(); // today

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

  openPurchaseOrderForm() {
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
      console.log(response.DOC_NO, 'DOCNOOOOOOOOO');
    });
  }

  onTemplateReorder(event: any): void {
    const movedItem = this.printTemplateData[event.fromIndex];
    this.printTemplateData.splice(event.fromIndex, 1); // Remove item from original position
    this.printTemplateData.splice(event.toIndex, 0, movedItem); // Insert item at new position
  }

  ClosePrintPopup() {
    this.isPrintPopupOpened = false;
  }

  onCancelNewData() {
    console.log('RESET CALLED');
    if (this.poNewForm) {
      this.poNewForm.resetForm();
    } else {
      console.warn('poNewForm reference not found!');
    }
  }

  onClickSaveNewData() {
    // debugger;
    const data = this.poNewForm.getNewPoData();
    console.log(data, 'DATA FOR SAVE');
    data.IS_APPROVED = this.isApproved;
    if (!data.STORE_ID) {
      notify(
        {
          message: 'Please select Store',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return false;
    }
    if (!data.SUPP_ID) {
      notify(
        {
          message: 'Please select Supplier',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return false;
    }
    if (!data.PO_DATE) {
      notify(
        {
          message: 'Please select PO Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return false;
    }
    if (!data.DELIVERY_DATE) {
      notify(
        {
          message: 'Please select Delivery Date',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return false;
    }

    if (
      !this.poNewForm.poData.PoDetails ||
      this.poNewForm.poData.PoDetails.length === 0
    ) {
      notify(
        {
          message: 'Please add at least one item',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return false;
    }
    const poDetails = this.poNewForm.poData.PoDetails.map((item: any) => {
      // Inter-state → IGST
      if (this.poNewForm.isInterState) {
        return {
          ...item,
          TAX_PERCENT: item.VAT_PERC, // IGST %
          CGST: 0,
          SGST: 0,
        };
      }

      // Intra-state → CGST + SGST
      return {
        ...item,
        TAX_PERCENT: 0,
        CGST: item.CGST,
        SGST: item.SGST,
      };
    });
    data.PoDetails = poDetails;
    // savePoToServer(data: any) {
    this.service.savePoData(data).subscribe((res) => {
      console.log(res, 'saved data');

      if (res.message === 'Success' && res.flag === 1) {
        if (data.IS_APPROVED === true) {
          notify(
            {
              message: 'Data Saved & Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
        } else {
          notify(
            {
              message: 'Data Saved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
        }

        this.refreshPo = true;
        setTimeout(() => (this.refreshPo = false), 0);

        this.dataGrid.instance.refresh();
        this.isAddPopupOpened = false;

        if (this.PurchaseOrderNewFormComponent?.resetForm) {
          this.PurchaseOrderNewFormComponent.resetForm();
        }

        this.getPurchaseOrderList();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  UpdatePurchaseOrder() {
    console.log('UPDATEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
    const data = this.poEditForm.getNewPoData();
    this.poEditForm.preparePoDetailsForSubmit();
    data.PoDetails = [...this.poEditForm.poData.PoDetails];
    console.log(data, 'PODETAILAAAAAAAAAAAAAAAAAAAAAAAA');

    if (this.isApproved) {
      // 🔹 Show confirmation dialog before approving
      confirm(
        'Are you sure you want to approve this Purchase Order?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          // User confirmed → call approve API
          this.service.ApprovePoData(data).subscribe((res) => {
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
          console.log('Approval cancelled');
        }
      });
    } else {
      // Call update API
      this.service.updatePoData(data).subscribe((res) => {
        if (res) {
          notify(
            {
              message: 'Data Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.CloseEditForm();
          this.getPurchaseOrderList();
        } else {
          notify(
            {
              message: 'Your Data Not Updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
    }
  }

  VerifyPurchaseOrder() {
    const data = this.poVerifyForm.getNewPoData();
    console.log(data);

    this.service.verifyPoData(data).subscribe((res) => {
      console.log('saved data');
      if (res) {
        notify(
          {
            message: 'Data Verified Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.CloseEditForm();
        this.getPurchaseOrderList();
      } else {
        notify(
          {
            message: 'Your Data Not Verified',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  ApprovePurchaseOrder() {
    const data = this.poApproveForm.getNewPoData();
    console.log(data);

    this.service.ApprovePoData(data).subscribe((res) => {
      console.log('saved data');
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

  deletePOData(event: any) {
    const ID = event.data.ID;
    this.service.DeletePoData(ID).subscribe((response: any) => {
      console.log(response, 'deleted');
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

    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

    return formattedDate; // Return only the date part
  }

  applyTemplate() {
    this.flag = false;
    if (this.selectedTemplate) {
      this.flag = true;
      console.log('Selected Template:', this.selectedTemplate);

      // this.reportName = this.selectedTemplate;
      // this.viewer.bindingSender.OpenReport(
      //   this.reportName + '&parameter1=' + this.poId
      // );
      this.showTemplatePopup = false; // Close the popup after applying
      this.showReportDesigner = true;
    } else {
      alert('Please select a template before applying');
    }
  }

  //   OnParametersInitialized(event: any) {
  //     var parameterValue = 12345;
  //     event.args.Parameters.filter(function (p: any) { return p.Key == "parameter4"; })[0].Value = parameterValue;
  //     console.log(parameterValue,"parameter value")
  // }
  clearData() {
    this.poNewForm.close();
    console.log('form closed');
  }

  OnParametersInitialized(event: any) {
    console.log(event, 'event');
    var invisibleIntParamValue = 42;
    var intParam = event.args.ActualParametersInfo.filter(
      (x: any) => x.parameterDescriptor.name == 'intParam',
    )[0];
    intParam.value = invisibleIntParamValue;
    console.log(intParam, 'intparam');
  }

  viewPdf(log: any) {}
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
    // DevexpressReportingModule,
    // DxReportViewerModule,
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
export class PurchaseOrderModule {}
