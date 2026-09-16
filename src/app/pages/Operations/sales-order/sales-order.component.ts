import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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
  DxTagBoxModule,
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
import { Router } from '@angular/router';
import { SalesOrderFormModule } from '../../sales-order-form/sales-order-form.component';
import notify from 'devextreme/ui/notify';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.scss'],
})
export class SalesOrderComponent implements OnInit {
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
      this.zone.run(() => this.addSalesOrder());
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
  filteredSalesOrderList: any;
  isReadOnlySalesOrder: boolean = false;
  isEditSalesOrder: boolean = false;
  selectedSalesOrder: any;
  salesOrderList: any;
  isAddSalesOrder: boolean;
  companyID: any;

  showTemplatePopup: boolean = false;
  templateList: any[] = [];
  selectedTemplate: any;
  isPreviewPopupVisible: boolean = false;
  isLoadingPdf: boolean = false;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  pdfBlobUrl: string | null = null;
  currentPdfBlob: Blob | null = null;
  selectedRowData: any = null;

  isEmailPopupVisible: boolean = false;
  emailReceivers: string[] = [];
  selectedEmails: string[] = [];
  emailSubject: string = '';
  emailBody: string = '';
  emailSettingsData: any = null;
  isSendingEmail: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSSSSSSSSSSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      console.log('packingRights.CanAdd:', packingRights.CanAdd);
      console.log('this.canAdd after assign:', this.canAdd);
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    this.getsalesOrderList();
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  getsalesOrderList() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload = {
      COMPANY_ID: this.companyID,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    this.dataService.getSalesOrderMainList(payload).subscribe({
      next: (response: any) => {
        this.salesOrderList = (response.Data || [])
          .sort((a: any, b: any) => b.ID - a.ID)
          .map((item: any) => {
            let dateValue: Date;

            if (!isNaN(Date.parse(item.SO_DATE))) {
              dateValue = new Date(item.SO_DATE);
            } else {
              dateValue = this.parseDateString(item.SO_DATE);
            }

            return {
              ...item,
              SO_DATE: dateValue,
            };
          });

        // ✅ SAME AS PRODUCTION JV
        this.filteredSalesOrderList = this.salesOrderList;
      },
      error: () => { },
      complete: () => {
        grid?.endCustomLoading();
      },
    });
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
      fromDate: fromDate ? this.formatDateForList(fromDate) : null,
      toDate: toDate ? this.formatDateForList(toDate) : null,
    };
  }
  private formatDateForList(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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

    this.getsalesOrderList();
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.salesOrderList) {
      this.filteredSalesOrderList = this.salesOrderList;
      return;
    }

    if (this.selectedDateRange === 'all') {
      this.filteredSalesOrderList = this.salesOrderList;
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
        this.filteredSalesOrderList = this.salesOrderList;
        return;
    }

    // Filter from the original list, not the previously filtered one
    this.filteredSalesOrderList = this.salesOrderList.filter((item: any) => {
      if (!item.SO_DATE) return false;

      const invoiceDate = new Date(item.SO_DATE); // ensure it's a Date object
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

    this.getsalesOrderList();
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onEditSalesOrder(event: any) {
    event.cancel = true;
    const orderId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    this.dataService.selectSalesOrder(orderId).subscribe((response: any) => {
      this.selectedSalesOrder = response.Data;
      console.log(this.selectedSalesOrder, 'SELECTEDTROUT');
      this.isEditSalesOrder = true;
      this.isReadOnlySalesOrder = status === 5;
    });
  }
  onDeleteSalesOrder(event: any) {
    const orderId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(orderId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deleteSalesOrder(orderId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getsalesOrderList();
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
  addSalesOrder() {
    this.isAddSalesOrder = true;
  }
  handleClose() {
    this.isAddSalesOrder = false;
    this.isEditSalesOrder = false;
    this.getsalesOrderList();
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  onPrintClick = (e: any) => {
    this.selectedRowData = e.row.data;
    this.getTemplates();
    this.showTemplatePopup = true;
  };

  getTemplates(): void {
    // Sales order category ID is 11
    this.dataService.getTemplateList(11).subscribe({
      next: (res: any) => {
        if (res && res.Data) {
          this.templateList = res.Data;
          if (this.templateList.length > 0) {
            this.selectedTemplate = this.templateList[0].name;
          } else {
            this.selectedTemplate = null;
          }
        }
      },
      error: (err) => console.error('Error fetching templates:', err)
    });
  }

  previewSelectedTemplate(): void {
    if (!this.selectedTemplate) return;
    this.showTemplatePopup = false;
    this.isPreviewPopupVisible = true;
    this.isLoadingPdf = true;

    const soId = this.selectedRowData?.ID || 0;

    const url = `${environment.apiUrl}Reports/${encodeURIComponent(this.selectedTemplate)}/export?salesOrderId=${soId}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.currentPdfBlob = blob;
        const objectUrl = URL.createObjectURL(blob);
        this.pdfBlobUrl = objectUrl;
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.isLoadingPdf = false;
      },
      error: (err) => {
        console.error('Error fetching PDF:', err);
        this.isLoadingPdf = false;
      }
    });
  }

  printPdf(): void {
    if (!this.pdfBlobUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = this.pdfBlobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  }

  downloadPdf(): void {
    if (!this.pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.pdfBlobUrl;
    a.download = `${this.selectedTemplate || 'SalesOrder'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  sendPdf(): void {
    this.isEmailPopupVisible = true;
    this.emailReceivers = [];
    this.selectedEmails = [];
    this.emailSubject = '';
    this.emailBody = '';
    this.emailSettingsData = null;
    
    // Sales Order Email Type ID is 11
    this.dataService.selectEmailSettings(11).subscribe((res: any) => {
      if (res && res.Data) {
        this.emailSettingsData = res.Data;
        this.emailSubject = res.Data.EMAIL_SUBJECT || '';
        this.emailBody = res.Data.EMAIL_CONTENT || '';
        if (res.Data.RECEIVER_ID) {
          const emails = res.Data.RECEIVER_ID.split(/[,\s]+/).filter((e: string) => e.trim().length > 0);
          this.emailReceivers = emails;
        }
      }
    });
  }

  sendEmailConfirm(): void {
    if (this.selectedEmails.length === 0) {
      notify('Please select at least one recipient.', 'warning', 3000);
      return;
    }
    if (!this.currentPdfBlob) {
      notify('No PDF generated to attach.', 'warning', 3000);
      return;
    }
    this.isSendingEmail = true;
    const toEmail = this.selectedEmails[0];
    const bccEmails = this.selectedEmails.slice(1).join(',');
    const formData = new FormData();
    formData.append('To', toEmail);
    formData.append('Bcc', bccEmails);
    formData.append('Subject', this.emailSubject || ' ');
    formData.append('Body', this.emailBody || ' ');
    formData.append('EmailType', '11');
    const fileName = `${this.selectedTemplate || 'SalesOrder'}.pdf`;
    formData.append('Attachment', this.currentPdfBlob, fileName);
    this.dataService.sendEmailWithAttachment(formData).subscribe({
      next: () => {
        this.isSendingEmail = false;
        notify('Email sent successfully!', 'success', 3000);
        this.isEmailPopupVisible = false;
      },
      error: (error) => {
        this.isSendingEmail = false;
        console.error('Email send error', error);
        notify('Error sending email.', 'error', 3000);
      }
    });
  }

  closePdfPreview(): void {
    this.isPreviewPopupVisible = false;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
      this.pdfPreviewUrl = null;
      this.currentPdfBlob = null;
    }
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
    SalesOrderFormModule,
    CustomDatePopupModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [SalesOrderComponent],
  exports: [SalesOrderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesOrderModule { }
