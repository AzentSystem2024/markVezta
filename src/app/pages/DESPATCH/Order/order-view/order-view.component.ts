import {
  Component,
  OnInit,
  ViewChild,
  NgModule,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDataGridComponent,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxLoadIndicatorModule,
} from 'devextreme-angular';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { ExportService } from 'src/app/services/export.service';
import { NewOrderModule } from '../new-order/new-order.component';
import { DxPopupModule } from 'devextreme-angular';

@Component({
  selector: 'app-order-view',
  templateUrl: './order-view.component.html',
  styleUrls: ['./order-view.component.scss'],
})
export class OrderViewComponent implements OnInit {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;

  orderList: any[] = [];
  isLoading = false;
  isFilterRowVisible = false;
  showFilterRow = false;
  isFilterOpened = false;

  detailDataMap: { [key: number]: any[] } = {};
  detailLoadingMap: { [key: number]: boolean } = {};
  expandedRowKeys: number[] = [];

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

  selectedStatuses: any[] = [];

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new order',
    onClick: () => {
      this.ngZone.run(() => this.addNewOrder());
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
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  getStatusFilterData: any[] = [];

  isNewOrderPopupVisible: boolean = false;
  selectedEditOrderId: number | null = null;
  selectedEditDealerId: number | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.loadStatusFilterData();
    this.loadOrders();
  }

  loadStatusFilterData() {
    this.dataService.getDropdownData({ name: 'ORDER_STATUS' }).subscribe({
      next: (res: any) => {
        this.getStatusFilterData = res || [];
      },
      error: (err) => {
        console.error('Error fetching order statuses:', err);
      },
    });
  }

  loadOrders() {
    this.isLoading = true;
    const datePayload = this.getDateRangePayload(this.selectedDateRange);

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || 0;

    const payload = {
      USER_ID: userId,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
      ORDER_STATUS:
        this.selectedStatuses && this.selectedStatuses.length > 0
          ? this.selectedStatuses.join(',')
          : null,
    };

    this.dataService.getNewOrderList(payload).subscribe(
      (res: any) => {
        this.isLoading = false;
        // Ensure robust parsing depending on typical response structure
        this.orderList = Array.isArray(res) ? res : res?.Data || [];
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error fetching orders:', error);
      },
    );
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.loadOrders();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterRowVisible);
      grid.option('headerFilter.visible', this.isFilterRowVisible);
    }
  };

  onStatusChanged(e: any) {
    this.selectedStatuses = e.value;
    this.loadOrders();
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

    this.loadOrders();
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

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;
    this.loadOrders();
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

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
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
      DATE_FROM: fromDate ? fromDate.toISOString() : null,
      DATE_TO: toDate ? toDate.toISOString() : null,
    };
  }

  addNewOrder() {
    this.selectedEditOrderId = null;
    this.selectedEditDealerId = null;
    this.isNewOrderPopupVisible = true;
  }

  editOrder(order: any) {
    // Get actual status and id fields, accounting for potential case differences
    const status =
      order.Status !== undefined
        ? order.Status
        : order.STATUS !== undefined
          ? order.STATUS
          : order.ORDER_STATUS;
    if (status === 1 || status === '1') {
      // 1 = Draft
      const orderId = order.OrderId || order.ORDER_ID;
      const dealerId = order.DealerId || order.DEALER_ID;
      this.selectedEditOrderId = orderId;
      this.selectedEditDealerId = dealerId;
      this.isNewOrderPopupVisible = true;
    }
  }

  onNewOrderClosed() {
    this.isNewOrderPopupVisible = false;
    this.refreshGrid();
  }

  onRowExpanding(e: any) {
    const orderId = e.key;
    if (!this.expandedRowKeys.includes(orderId)) {
      this.expandedRowKeys.push(orderId);
    }

    if (!this.detailDataMap[orderId]) {
      this.detailLoadingMap[orderId] = true;
      this.dataService.getNewOrderDetail({ ORDER_ID: orderId }).subscribe({
        next: (res: any) => {
          this.detailDataMap[orderId] = res?.Data?.ORDER_DETAILS || [];
          this.detailLoadingMap[orderId] = false;
          // trigger change detection
          this.detailDataMap = { ...this.detailDataMap };
        },
        error: (err) => {
          console.error('Error fetching order details', err);
          this.detailDataMap[orderId] = [];
          this.detailLoadingMap[orderId] = false;
          this.detailDataMap = { ...this.detailDataMap };
        },
      });
    }
  }

  onRowCollapsed(e: any) {
    const orderId = e.key;
    this.expandedRowKeys = this.expandedRowKeys.filter((k) => k !== orderId);
    delete this.detailDataMap[orderId];
  }

  onExporting(e: any) {
    this.exportService.onExporting(e, 'order data');
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTagBoxModule,
    DxLoadIndicatorModule,
    CustomDatePopupModule,
    NewOrderModule,
    DxPopupModule,
  ],
  declarations: [OrderViewComponent],
  exports: [OrderViewComponent],
})
export class OrderViewModule {}
