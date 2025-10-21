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
import { SalesOrderFormModule } from '../sales-order-form/sales-order-form.component';
import { SalesOrderComponent } from '../sales-order/sales-order.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { PhysicalInventoryFormModule } from '../physical-inventory-form/physical-inventory-form.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-physical-inventory',
  templateUrl: './physical-inventory.component.html',
  styleUrls: ['./physical-inventory.component.scss'],
})
export class PhysicalInventoryComponent {
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
  isPrePopupVisible = false;
  category = [];
  supplier = [];
  brand = [];
  department = [];
  prePopupData: {
    CAT_ID: any[];
    SUPP_ID: any[];
    BRAND_ID: any[];
    DEPT_ID: any[];
    ALL_ITEMS: boolean;
  } = {
    CAT_ID: [],
    SUPP_ID: [],
    BRAND_ID: [],
    DEPT_ID: [],
    ALL_ITEMS: false,
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.openPrePopup();
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
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  filteredInventoryList: any;
  inventoryList: any;
  isAddInventory: boolean;
  selectedInventory: any;
  isEditSalesOrder: boolean;
  isReadOnlySalesOrder: boolean;
  isEditInventory: boolean;
  isReadOnlyInventory: boolean;
  store: any;

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
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

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
    this.getInventoryList();
    this.getDropdownList();
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  getDropdownList() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplier = response;
    });

    this.dataService
      .getDropdownData('DEPARTMENT')
      .subscribe((response: any) => {
        this.department = response;
      });

    this.dataService.getDropdownData('BRAND').subscribe((response: any) => {
      this.brand = response;
    });

    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.store = response;
    });

    this.dataService
      .getDropdownData('ITEMCATEGORY')
      .subscribe((response: any) => {
        this.category = response;
      });
  }

  getInventoryList() {
    this.dataService.getPhysicalInventoryList().subscribe((response: any) => {
      this.inventoryList = response.Data.map((item: any) => {
        let dateValue: Date;

        // Case 1: If backend gives ISO format (2025-08-21T14:06:47.85)
        if (!isNaN(Date.parse(item.PHYSICAL_DATE))) {
          dateValue = new Date(item.PHYSICAL_DATE);
        } else {
          // Case 2: If backend gives dd-MM-yyyy format
          dateValue = this.parseDateString(item.PHYSICAL_DATE);
        }

        return {
          ...item,
          PHYSICAL_DATE: dateValue,
        };
      });

      this.applyDateFilter();
    });
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
      // Reset the custom label
      const customOpt = this.dateRanges.find((dr) => dr.value === 'custom');
      if (customOpt) {
        customOpt.label = 'Custom';
      }
      this.applyDateFilter();
    }
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.inventoryList) {
      this.filteredInventoryList = this.inventoryList;
      return;
    }

    if (this.selectedDateRange === 'all') {
      this.filteredInventoryList = this.inventoryList;
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
        this.filteredInventoryList = this.inventoryList;
        return;
    }

    // Filter from the original list, not the previously filtered one
    this.filteredInventoryList = this.inventoryList.filter((item: any) => {
      if (!item.PHYSICAL_DATE) return false;

      const invoiceDate = new Date(item.PHYSICAL_DATE); // ensure it's a Date object
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredInventoryList = this.filteredInventoryList.filter(
      (item: any) => {
        const invoiceDate = item.PHYSICAL_DATE;
        return invoiceDate >= start && invoiceDate <= end;
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

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onEditInventory(event: any) {
    event.cancel = true;
    const orderId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    this.dataService
      .selectPhysicalInventory(orderId)
      .subscribe((response: any) => {
        this.selectedInventory = response.Data;
        console.log(this.selectedInventory, 'SELECTEDTROUT');
        this.isEditInventory = true;
        this.isReadOnlyInventory = status === 5;
      });
  }

  onDeleteInventory(event: any) {
    const inventoryId = event.data.ID;
    const status = event.data.TRANS_STATUS;
    if (event.data.TRANS_STATUS === 5) {
      event.cancel = true;
      notify('This cannot be deleted.', 'error', 2000);
      return;
    }
    event.cancel = true;
    console.log(inventoryId, 'CREDITNOTEIDDDDDDDDDDDDDDDDDD');
    // Call your delete API
    this.dataService.deletePhysicalInventory(inventoryId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.getInventoryList();
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

  getTagBoxTooltip(): string {
    if (!this.prePopupData.DEPT_ID || !this.department) return '';
    // Map selected IDs to descriptions
    const selectedNames = this.department
      .filter((d) => this.prePopupData.DEPT_ID.includes(d.ID))
      .map((d) => d.DESCRIPTION);
    return selectedNames.join(', '); // comma-separated tooltip
  }

  getTagBoxTooltipForBrand() {
    if (!this.prePopupData.BRAND_ID || !this.brand) return '';
    // Map selected IDs to descriptions
    const selectedNames = this.brand
      .filter((d) => this.prePopupData.BRAND_ID.includes(d.ID))
      .map((d) => d.DESCRIPTION);
    return selectedNames.join(', ');
  }

  getTagBoxTooltipForSupplier() {
    if (!this.prePopupData.SUPP_ID || !this.brand) return '';
    // Map selected IDs to descriptions
    const selectedNames = this.supplier
      .filter((d) => this.prePopupData.SUPP_ID.includes(d.ID))
      .map((d) => d.DESCRIPTION);
    return selectedNames.join(', ');
  }

  getTagBoxTooltipForCategory() {
    if (!this.prePopupData.CAT_ID || !this.brand) return '';
    // Map selected IDs to descriptions
    const selectedNames = this.category
      .filter((d) => this.prePopupData.CAT_ID.includes(d.ID))
      .map((d) => d.DESCRIPTION);
    return selectedNames.join(', ');
  }

  openPrePopup() {
    this.prePopupData = {
      CAT_ID: [],
      SUPP_ID: [],
      BRAND_ID: [],
      DEPT_ID: [],
      ALL_ITEMS: false,
    };
    this.isPrePopupVisible = true;
  }

  closePrePopup() {
    this.isPrePopupVisible = false;
  }
  applyPrePopup() {
    // const noFiltersSelected =
    //   !this.prePopupData.CAT_ID.length &&
    //   !this.prePopupData.SUPP_ID.length &&
    //   !this.prePopupData.BRAND_ID.length &&
    //   !this.prePopupData.DEPT_ID.length;

    // if (noFiltersSelected) {
    //   alert('Please select at least one filter.');
    //   return;
    // }

    this.isPrePopupVisible = false;
    this.isAddInventory = true;
  }
  // addPhysicalInventory() {
  //   this.isAddInventory = true;
  // }

  handleClose() {
    this.isAddInventory = false;
    this.isEditInventory = false;
    this.getInventoryList();
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
    DxTagBoxModule,
    DxoSummaryModule,
    PhysicalInventoryFormModule,
  ],
  providers: [],
  declarations: [PhysicalInventoryComponent],
  exports: [PhysicalInventoryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PhysicalInventoryModule {}
