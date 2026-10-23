import {
  Component,
  OnInit,
  ViewChild,
  NgModule,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDataGridComponent,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { ExportService } from 'src/app/services/export.service';
import { NewOrderModule } from '../new-order/new-order.component';
import { DxPopupModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

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
  statusHeaderFilter: any = {
    dataSource: [
      { text: 'Submitted', value: 0 },
      { text: 'Draft', value: 1 },
      { text: 'Open', value: 2 },
      { text: 'Accepted', value: 3 },
      { text: 'Rejected', value: 4 },
      { text: 'In Production', value: 5 },
      { text: 'Production Completed', value: 6 },
      { text: 'Partial', value: 7 },
      { text: 'In Transit', value: 8 },
      { text: 'Delivered', value: 9 },
      { text: 'Cancelled', value: 10 },
      { text: 'Allocated', value: 11 },
    ],
  };

  isNewOrderPopupVisible: boolean = false;
  selectedEditOrderId: number | null = null;
  selectedEditDealerId: number | null = null;
  selectedEditParentDealerId: number | null = null;
  selectedEditLocationId: number | null = null;
  selectedEditWarehouseId: number | null = null;
  selectedEditTab: 'dealer' | 'subdealer' = 'dealer';
  selectedEditOrderData: any = null;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStatusFilterData();
    this.loadOrders();
  }

  loadStatusFilterData() {
    this.dataService.getDropdownData({ name: 'ORDER_STATUS' }).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.getStatusFilterData = res.map((item: any) => ({
            ...item,
            text: item.DESCRIPTION || item.text,
            value: item.ID !== undefined ? item.ID : item.value,
          }));
          this.statusHeaderFilter = {
            dataSource: this.getStatusFilterData.map((item: any) => ({
              text: item.text,
              value: item.value,
            })),
          };
        } else {
          this.getStatusFilterData = res || [];
        }
      },
      error: (err) => {
        console.error('Error fetching order statuses:', err);
      },
    });
  }

  loadOrders() {
    this.isLoading = true;
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    } else {
      setTimeout(() => {
        if (this.isLoading) {
          this.dataGrid?.instance?.beginCustomLoading('Loading...');
        }
      }, 0);
    }
    this.cdr.detectChanges();
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
      IS_FROM_WEB: true,
    };

    this.dataService.getNewOrderList(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        // Ensure robust parsing depending on typical response structure
        this.orderList = Array.isArray(res) ? res : res?.Data || [];
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.dataGrid?.instance?.endCustomLoading();
        console.error('Error fetching orders:', error);
        this.cdr.detectChanges();
      },
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.loadOrders();
    this.refreshExpandedOrderDetails();
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
      const from = this.formatAsDDMMYYYY(this.customStartDate);
      const to = this.formatAsDDMMYYYY(this.customEndDate);
      return `${from} to ${to}`;
    }

    return item.label;
  };

  private formatAsDDMMYYYY(date: any): string {
    if (!date) return '';

    if (typeof date === 'string') {
      const ymdMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
      }
      const dmyMatch = date.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (dmyMatch) {
        return `${dmyMatch[1]}-${dmyMatch[2]}-${dmyMatch[3]}`;
      }
    }

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private formatDate(date: any): string | null {
    if (!date) return null;

    if (typeof date === 'string') {
      const ymdMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
      }
      const dmyMatch = date.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (dmyMatch) {
        return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
      }
    }

    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDateRangePayload(range: string) {
    const today = new Date();
    let fromDate: any = null;
    let toDate: any = null;

    switch (range) {
      case 'today':
        fromDate = new Date();
        toDate = new Date();
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        toDate = new Date();
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        toDate = new Date();
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        toDate = new Date();
        break;

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = this.customStartDate;
          toDate = this.customEndDate;
        }
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: this.formatDate(fromDate),
      DATE_TO: this.formatDate(toDate),
    };
  }

  addNewOrder() {
    this.selectedEditOrderId = null;
    this.selectedEditDealerId = null;
    this.selectedEditParentDealerId = null;
    this.selectedEditLocationId = null;
    this.selectedEditWarehouseId = null;
    this.selectedEditTab = 'dealer';
    this.selectedEditOrderData = null;
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
    if (status === 1 || status === '1' || status === 2 || status === '2') {
      const orderId = order.OrderId || order.ORDER_ID || order.Id || order.ID;
      if (!orderId) {
        notify('Order ID not found', 'error', 3000);
        return;
      }

      this.isLoading = true;
      this.dataService.selectNewOrder(orderId).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (
            res &&
            (res.Flag === 1 || res.flag === 1 || res.Flag === '1' || res.flag === '1') &&
            res.Data &&
            Array.isArray(res.Data) &&
            res.Data.length > 0
          ) {
            const orderData = res.Data[0];
            const orderIdVal = orderData.ORDER_ID || orderId;
            const subDealerId = orderData.SUBDEALER_ID;
            const dealerId = orderData.DEALER_ID;
            const locationId =
              orderData.LOCATION_ID !== undefined && orderData.LOCATION_ID !== null
                ? orderData.LOCATION_ID
                : order.LOCATION_ID;
            const warehouseId =
              orderData.WAREHOUSE_ID !== undefined && orderData.WAREHOUSE_ID !== null
                ? orderData.WAREHOUSE_ID
                : order.WAREHOUSE_ID;

            this.selectedEditOrderId = orderIdVal;
            this.selectedEditDealerId = subDealerId ? subDealerId : dealerId;
            this.selectedEditParentDealerId = subDealerId ? dealerId : null;
            this.selectedEditTab = subDealerId ? 'subdealer' : 'dealer';
            this.selectedEditLocationId =
              locationId !== undefined && locationId !== null
                ? Number(locationId)
                : null;
            this.selectedEditWarehouseId =
              warehouseId !== undefined && warehouseId !== null
                ? Number(warehouseId)
                : null;
            this.selectedEditOrderData = orderData;
            this.isNewOrderPopupVisible = true;
            this.cdr.detectChanges();
          } else {
            notify(res?.Message || 'Failed to fetch order details', 'error', 3000);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error fetching order details', err);
          notify('Error fetching order details', 'error', 3000);
        },
      });
    }
  }

  onNewOrderClosed() {
    const editedOrderId = this.selectedEditOrderId;
    this.isNewOrderPopupVisible = false;
    if (editedOrderId) {
      this.refreshOrderDetail(editedOrderId);
    }
    this.refreshGrid();
    this.selectedEditOrderId = null;
    this.selectedEditDealerId = null;
    this.selectedEditParentDealerId = null;
    this.selectedEditLocationId = null;
    this.selectedEditWarehouseId = null;
    this.selectedEditTab = 'dealer';
    this.selectedEditOrderData = null;
  }

  async submitOrder(rowData: any) {
    const result = await confirm(
      'Are you sure you want to submit this order?',
      'Confirm Order',
    );
    if (!result) return;

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;
    const orderDate = new Date().toISOString();

    const payload = {
      USER_ID: userId,
      ORDER_ID: rowData.ORDER_ID || 0,
      DEALER_ID: rowData.DEALER_ID || 0,
      SUBDEALER_ID: rowData.SUBDEALER_ID || 0,
      ORDER_STATUS: 0,
      ORDER_DATE: orderDate,
      REMARKS: '',
      EXPECTED_DELIVERY: orderDate,
      STATUS_DESCRIPTION: 'Open',
      IS_FROM_WEB: true,
      LOCATION_ID: rowData.LOCATION_ID || 0,
      BRAND_ID: null,
      WAREHOUSE_ID: rowData.WAREHOUSE_ID || 0,
    };

    this.dataService.saveNewOrderCartToOrder(payload).subscribe(
      (res: any) => {
        if (res.Flag === 1) {
          notify('Order Submitted Successfully!', 'success', 3000);
          this.refreshGrid();
        } else {
          const errMsg = res.Message || 'Failed to submit order';
          console.error('Failed to submit order:', errMsg);
          notify(errMsg, 'error', 3000);
        }
      },
      (error) => {
        console.error('Error submitting order', error);
        notify('Error submitting order', 'error', 3000);
      },
    );
  }

  refreshOrderDetail(orderId: number): Promise<void> {
    if (!orderId) return Promise.resolve();
    this.detailLoadingMap[orderId] = true;
    return new Promise<void>((resolve) => {
      this.dataService.getNewOrderDetail({ ORDER_ID: orderId }).subscribe({
        next: (res: any) => {
          this.detailDataMap[orderId] = res?.Data?.ORDER_DETAILS || [];
          this.detailLoadingMap[orderId] = false;
          this.detailDataMap = { ...this.detailDataMap };
          resolve();
        },
        error: (err) => {
          console.error(
            'Error fetching order details for orderId:',
            orderId,
            err,
          );
          this.detailLoadingMap[orderId] = false;
          this.detailDataMap = { ...this.detailDataMap };
          resolve();
        },
      });
    });
  }

  refreshExpandedOrderDetails() {
    const orderIdsToRefresh = new Set<number>();

    if (this.selectedEditOrderId) {
      orderIdsToRefresh.add(Number(this.selectedEditOrderId));
    }

    if (this.expandedRowKeys && this.expandedRowKeys.length > 0) {
      this.expandedRowKeys.forEach((key) => {
        const num = Number(key);
        if (!isNaN(num) && num > 0) {
          orderIdsToRefresh.add(num);
        }
      });
    }

    if (this.detailDataMap) {
      Object.keys(this.detailDataMap).forEach((key) => {
        const num = Number(key);
        if (!isNaN(num) && num > 0) {
          orderIdsToRefresh.add(num);
        }
      });
    }

    const grid = this.dataGrid?.instance;
    if (grid && this.orderList && this.orderList.length > 0) {
      this.orderList.forEach((order) => {
        const id = order.ORDER_ID || order.OrderId || order.Id || order.ID;
        if (id && grid.isRowExpanded(id)) {
          orderIdsToRefresh.add(Number(id));
        }
      });
    }

    orderIdsToRefresh.forEach((orderId) => {
      this.refreshOrderDetail(orderId);
    });
  }

  onRowExpanding(e: any) {
    const orderId = e.key;
    if (!this.expandedRowKeys.includes(orderId)) {
      this.expandedRowKeys.push(orderId);
    }

    this.refreshOrderDetail(orderId);
  }

  onRowCollapsed(e: any) {
    const orderId = e.key;
    this.expandedRowKeys = this.expandedRowKeys.filter((k) => k !== orderId);
    delete this.detailDataMap[orderId];
  }

  onExporting(e: any) {
    this.exportService.onExporting(e, 'order data');
  }

  onDetailEditorPreparing(e: any, masterData: any) {
    if (e.parentType === 'dataRow') {
      const parentStatus = Number(masterData.data.ORDER_STATUS);
      // Only allow editing if status is 1 (Draft) or 2 (Open)-- && parentStatus !== 2
      if (parentStatus !== 1) {
        e.editorOptions.disabled = true;
        return;
      }

      if (e.dataField === 'ORDER_QTY') {
        const orderQty = Number(e.row.data.ORDER_QTY);
        const openQty = Number(e.row.data.OPEN_QTY);

        // Only allow if ORDER_QTY is equal to OPEN_QTY
        if (orderQty !== openQty) {
          e.editorOptions.disabled = true;
        }
      } else {
        // Other columns are read-only
        e.editorOptions.disabled = true;
      }
    }
  }

  onDetailRowUpdating(e: any, masterData: any) {
    const newQty = e.newData.ORDER_QTY;
    if (newQty === undefined) return;

    const rowData = { ...e.oldData, ...e.newData };
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userId = sessionData.USER_ID || sessionData.ID || 0;

    const payload = {
      ...rowData,
      USER_ID: userId,
      ORDER_ID: masterData.key,
    };

    e.cancel = new Promise<void>((resolve, reject) => {
      this.dataService.updateOrderEntryQty(payload).subscribe({
        next: (res: any) => {
          if (res.Flag === 1) {
            notify('Quantity updated successfully!', 'success', 3000);

            // Refresh the main grid and details grid
            this.refreshGrid();
            this.refreshOrderDetail(masterData.key).then(() => resolve());
          } else {
            notify(res.Message || 'Failed to update quantity', 'error', 3000);
            reject(res.Message);
          }
        },
        error: (err) => {
          console.error(err);
          notify('Error updating quantity', 'error', 3000);
          reject(err);
        },
      });
    });
  }

  onDetailCellPrepared(e: any, masterData: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      const parentStatus = Number(masterData.data.ORDER_STATUS);
      const orderQty = Number(e.data?.ORDER_QTY);
      const openQty = Number(e.data?.OPEN_QTY);

      // Hide edit/delete icons if parent is not Draft (1) or if item has been partially processed
      if (parentStatus !== 1 || orderQty !== openQty) {
        const editLink = e.cellElement.querySelector('.dx-link-edit');
        if (editLink) editLink.style.display = 'none';

        const deleteLink = e.cellElement.querySelector('.dx-link-delete');
        if (deleteLink) deleteLink.style.display = 'none';
      }
    }
  }

  onDetailRowRemoving(e: any, masterData: any) {
    const parentStatus = Number(masterData.data.ORDER_STATUS);
    if (parentStatus !== 1) {
      e.cancel = true;
      notify('Cannot delete item for this order status.', 'warning', 3000);
      return;
    }

    const orderQty = Number(e.data?.ORDER_QTY);
    const openQty = Number(e.data?.OPEN_QTY);
    if (orderQty !== openQty) {
      e.cancel = true;
      notify(
        'Cannot delete item as it is already partially processed.',
        'warning',
        3000,
      );
      return;
    }

    const orderEntryId =
      e.data?.ORDER_ENTRY_ID ||
      e.data?.orderEntryId ||
      e.data?.OrderEntryId ||
      e.key;

    if (!orderEntryId) {
      e.cancel = true;
      notify('Order Entry ID not found.', 'error', 3000);
      return;
    }

    const payload = {
      ORDER_ENTRY_ID: orderEntryId,
    };

    e.cancel = new Promise<void>((resolve, reject) => {
      this.dataService.deleteOrderDetail(payload).subscribe({
        next: (res: any) => {
          if (res.Flag === 1 || res.flag === 1 || res.flag === '1') {
            notify(
              res.Message || 'Order detail deleted successfully.',
              'success',
              3000,
            );

            // Refresh the main grid and details grid
            this.refreshGrid();
            this.refreshOrderDetail(masterData.key).then(() => resolve());
          } else {
            notify(
              res.Message || 'Failed to delete order detail',
              'error',
              3000,
            );
            reject(res.Message);
          }
        },
        error: (err) => {
          console.error('Error deleting order detail', err);
          notify('Error deleting order detail', 'error', 3000);
          reject(err);
        },
      });
    });
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
    DxLoadPanelModule,
    CustomDatePopupModule,
    NewOrderModule,
    DxPopupModule,
  ],
  declarations: [OrderViewComponent],
  exports: [OrderViewComponent],
})
export class OrderViewModule {}
