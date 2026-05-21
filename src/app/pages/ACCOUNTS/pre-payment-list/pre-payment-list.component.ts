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
import { confirm } from 'devextreme/ui/dialog';

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
  verifyPrePaymentPopupOpened : boolean = false;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canVerify = false;
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
  popupMode: 'new' | 'edit' | 'verify' | 'approve' | 'view' = 'new';

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_PrePaymentList();
  }

 get popupTitle(): string {
  switch (this.popupMode) {
    case 'new':
      return 'New PrePayment Invoice';

    case 'edit':
      return 'Edit PrePayment Invoice';

    case 'verify':
      return 'Verify PrePayment Invoice';

    case 'approve':
      return 'Approve PrePayment Invoice';

    case 'view':
      return 'View PrePayment Invoice';

    default:
      return 'PrePayment Invoice';
  }
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
    this.popupMode = 'new';
    this.addPrepaymentPopupOpened = true;
  }

  handleClose() {
    this.addPrepaymentPopupOpened = false;
    this.editPrePaymentPopupOpened = false;
    this.verifyPrePaymentPopupOpened = false;
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
      this.canVerify = packingRights.CanVerify;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
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

  onVerifyInvoice(e:any){
     e.cancel = true;
    console.log(e)
     const status = e.row.data?.TRANS_STATUS?.trim();
     if (status === 'Approved') {
    this.popupMode = 'view';
    this.isEditReadOnly = true;
  } else if (status === 'Verify') {
    this.popupMode = 'approve';
  } else {
    this.popupMode = 'verify';
  }

    // this.isEditReadOnly = status === 'Approved';
    this.editPrePaymentPopupOpened = false;
    this.verifyPrePaymentPopupOpened = true;
    this.verifyselectPrePayment(e);
  }

  onApproveInvoice(e:any){
     e.cancel = true;
    console.log(e)
     const status = e.row.data?.TRANS_STATUS?.trim();
    this.isEditReadOnly = status === 'Approved';
    this.verifyPrePaymentPopupOpened = true;
    this.editPrePaymentPopupOpened = false;
    this.verifyselectPrePayment(e);
  }

  onEditingStart(event: any) {
    event.cancel = true;
    const status = event.data?.TRANS_STATUS?.trim();

    if (status === 'Approved') {
    this.popupMode = 'view';
    this.isEditReadOnly = true;
  } else {
    this.popupMode = 'edit';
    this.isEditReadOnly = false;
  }


    // this.isEditReadOnly = status === 'Approved';
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
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verify'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approved' ? 'Approved' : status === 'Verify' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  verifyselectPrePayment(event: any) {
  const rowData = event.row?.data || event.data;

  if (!rowData) {
    console.log('No row data found', event);
    return;
  }

  const id = rowData.TRANS_ID;

  this.PrepaymentId = id;
  this.selectprepayment = id;

  console.log('Calling Select_PrePayment with ID:', id);

  this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
    this.selectedPrePayment = {
      ...res.Data,
      // TRANS_STATUS: res.Data.TRANS_STATUS === 'Approved',
    };
    console.log(this.selectedPrePayment,"eerertrt====")
  });
}
  selectPrePayment(event: any) {
    const id = event.data.TRANS_ID;
    this.PrepaymentId = event.data.TRANS_ID;
    this.selectprepayment = id;
    this.dataservice.Select_PrePayment(id).subscribe((res: any) => {
      console.log(res,)
      // Store original string if needed
      this.selectedPrePayment = {
        ...res.Data,
        TRANS_STATUS: res.Data.TRANS_STATUS === 'Approved', //  boolean for checkbox
      };
      console.log(this.selectedPrePayment)
    });
  }

 DeletePrePayment(e: any) {
  const miscId = e.data.TRANS_ID;
  e.cancel = true;

  if (e.data.TRANS_STATUS === 5) {
    notify('This Prepayment cannot be deleted.', 'error', 2000);
    return;
  }

  confirm(
    'Are you sure you want to delete this Prepayment?',
    'Confirm Delete'
  ).then((result) => {
    if (result) {
      this.dataservice.Delete_PrePayment(miscId).subscribe(
        (response: any) => {
          if (response) {
            notify(
              {
                message: 'Prepayment Deleted Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );

            this.get_PrePaymentList();
          } else {
            notify(
              {
                message: 'Data not deleted',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        },
        (error) => {
          console.error('Delete error:', error);
          notify('Error while deleting', 'error', 2000);
        }
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
export class PrePaymentListModule { }
