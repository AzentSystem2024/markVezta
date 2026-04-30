import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxoItemModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { PrePaymentAddModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-add/pre-payment-add.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-pre-payment-list',
  templateUrl: './pre-payment-list.component.html',
  styleUrls: ['./pre-payment-list.component.scss'],
})
export class PrePaymentListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  PrePaymentListDataSource: any[] = [];
  readonly allowedPageSizes: any = [10, 20, 'all'];
  displayMode: any = 'full';
  isEditReadOnly: boolean = false;
  showPageSizeSelector = true;
  selectedPrePayment: any;
  showFilterRow = true;
  showHeaderFilter = true;
  addPrepaymentPopupOpened: boolean = false;
  editPrePaymentPopupOpened: boolean = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  selectprepayment: any;
  PrepaymentId: any;
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

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_PrePaymentList();
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilterRow(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addPrepayment());
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
  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'PrePaymentInvoice';
    this.dataservice.exportDataGrid(event, fileName);
  }

  //=================================refresh=============================
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_PrePaymentList();
    }
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  addPrepayment() {
    this.addPrepaymentPopupOpened = true;
  }

  handleClose() {
    this.addPrepaymentPopupOpened = false;
    this.editPrePaymentPopupOpened = false;
    this.get_PrePaymentList();
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    this.sesstion_Details();
    this.get_PrePaymentList();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  get_PrePaymentList() {
    const datePayload = this.getDateRangePayload();
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };
    this.dataservice.get_PrePayment_List(payload).subscribe((res: any) => {
      console.log(
        'PrePaymentListDataSource=============================:',
        res.Data,
      );
      this.PrePaymentListDataSource = res.Data;
    });
  }

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.TRANS_STATUS?.trim() === 'Open',
    },
  ];

  onEditingStart(event: any) {
    event.cancel = true;
    const status = event.data?.TRANS_STATUS?.trim();
    this.isEditReadOnly = status === 'Approved';
    this.editPrePaymentPopupOpened = true;
    this.selectPrePayment(event);
  }

  // selectPrePayment(event:any){
  //   ;
  // const id = event.data.TRANS_ID;
  //    this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
  //
  //     this.selectedPrePayment = res.Data

  //    })
  // }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = (cellInfo.data.TRANS_STATUS || '').trim();

    // Clean up existing content to avoid duplicates
    while (cellElement.firstChild) {
      cellElement.removeChild(cellElement.firstChild);
    }

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';

    icon.style.color = status === 'Approved' ? 'green' : 'orange';
    icon.title = status === 'Approved' ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  selectPrePayment(event: any) {
    const id = event.data.TRANS_ID;
    this.PrepaymentId = event.data.TRANS_ID;
    this.selectprepayment = id;
    this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
      // Store original string if needed
      this.selectedPrePayment = {
        ...res.Data,
        TRANS_STATUS: res.Data.TRANS_STATUS === 'Approved', //  boolean for checkbox
      };
    });
  }

  DeletePrePayment(event: any) {
    const id = event.data.TRANS_ID;
    this.dataservice.Delete_PrePayment(id).subscribe((res: any) => {
      console.log('response from delete api:', res);
      if (res.Message === 'Success') {
        notify(
          {
            message: 'Deleted successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      }
    });
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom dates
    this.customStartDate = null;
    this.customEndDate = null;

    // reset label back to "Custom"
    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom' ? { ...opt, label: 'Custom' } : opt,
    );

    this.get_PrePaymentList();
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    //  EXACT SAME LOGIC AS CREDIT NOTE
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    // reload grid
    this.get_PrePaymentList();
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
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component?._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');

      if (innerList) {
        innerList.off('itemClick'); // avoid duplicate handlers
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;

          if (clickedValue === 'custom') {
            this.openCustomDatePopup(); // same behavior as Credit Note
            e.component.close();
          }
        });
      }
    }, 0);
  }

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} - ${to}`;
    }

    return item.label;
  };
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
    DxDataGridModule,
    DxoItemModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    PrePaymentAddModule,
    PrePaymentEditModule,
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [PrePaymentListComponent],
  exports: [PrePaymentListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrePaymentListModule {}
