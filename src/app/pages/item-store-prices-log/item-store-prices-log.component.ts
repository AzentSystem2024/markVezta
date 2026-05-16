import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { filter } from 'rxjs/operators';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
interface CustomButton {
  hint?: string;
  icon?: string;
  text?: string;
  onClick?: (e: any) => void;
  visible: (e: any) => boolean;
}
interface NamedButton {
  name: string;
  visible: (e: any) => boolean;
}
type ButtonConfig = CustomButton | NamedButton;
@Component({
  selector: 'app-item-store-prices-log',
  templateUrl: './item-store-prices-log.component.html',
  styleUrls: ['./item-store-prices-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ItemStorePricesLogComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  logList: any;
  showHeaderFilter = true;
  isVerified: boolean = false;
  isApproved: boolean = false;
  verifiedRows: Set<number> = new Set();
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  allButtons = [
    {
      name: 'edit',
      visible: (e: any) => {
        const { isApproved, isEditable } = this.getRowState(e.row.data);
        return this.canEdit && isEditable;
      },
    },
    {
      name: 'delete',
      visible: (e: any) => {
        const status = e.row.data.Status;

        return this.canDelete &&
          (
            (e.row.data.Status == 'Open') || (status === 'Verified' && this.canApprove)

          )

      },
    },
    {
      hint: 'Verify',
      icon: 'check',
      text: 'Verify',
      onClick: (e: any) => this.onVerifyClick(e),
      visible: (e: any) => {
        return this.canVerify && e.row.data.Status === 'Open';


      },
    },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e: any) => this.onApproveClick(e),
      visible: (e: any) => {
        return this.canApprove &&
          (
            e.row.data.Status === 'Verified'
          )

      },
    },
    {
      hint: 'View',
      icon: 'check',
      text: 'View',
      onClick: (e: any) => this.onViewClick(e),
      visible: (e: any) =>
        this.canView &&
        (
          e.row.data.Status === 'Approved' ||
          (e.row.data.Status === 'Verified' && !this.canApprove)
        )

    },
  ];
  selectWorksheetData: any;
  selectedWorksheetData: any;
  logStatusMap: { [key: number]: string } = {};
  status: any;
  AllowCommitWithSave: any;
  dateFormat: any;
  currencyFormt: any;
  isFormVisible: boolean = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
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
        this.onAddClick();
      });
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
  private getRowState(row: any) {
    const status = (row?.Status || '')
    const isEditable = status == 'Open';
    const isApproved = status === 'approved';
    const isVerified = status === 'verified' || status === 'approved';
    return { isVerified, isApproved, isEditable };
  }
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isFilterOpened = false;
  canVerify = false;
  constructor(
    private dataservice: DataService,
    private router: Router,
    private zone: NgZone,
  ) { }

  ngOnInit() {


    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
      console.log(this.canVerify, 'VERIFY RIGHTS');
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/change-price') {
          this.getLoglist();
        }
      });
    this.dateFormat = sessionStorage.getItem('dateFormat');
    this.currencyFormt = sessionStorage.getItem('currencyFormat');
    this.getLoglist();
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getLoglist();
    }
  }

  getStatusFlagClass(status: string): string {
    return status === 'Open'
      ? 'flag-white'
      : status === 'Verified'
        ? 'flag-orange'
        : status === 'Approved'
          ? 'flag-green'
          : '';
  }

  listItemsByMultipleStoreIds() {
    this.dataservice.getItemListByStoreId().subscribe(
      (response) => {
        // this.itemStoresList = response.PriceWizardData;
      },
      (error) => {
        // console.error('Error fetching item list:', error);
      },
    );
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
      text: 'Verified',
      value: 'Verified',
    },
  ];
  getLoglist() {
    this.dataservice
      .getWorksheetItemStorePrices()
      .subscribe((response: any) => {
        this.logList = response.dataworksheet
          .map((item: any) => {
            this.logStatusMap[item.WS_NO] = item.Status;
            return {
              ...item,
              isVerified: item.Status === 'Verified',
              isApproved: item.Status === 'Approved',
            };
          })
          .sort((a: any, b: any) => b.WS_NO - a.WS_NO);
        this.logList.forEach((item: any) => {
          if (item.isVerified) {
          } else if (item.isApproved) {
          } else {
          }
        });
      });
  }
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.Status;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === 'Approved'
        ? '#10B981' // Approved
        : status === 'Verified'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === 'Approved' ? 'Approved' : status === 'verified' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  selectWorksheetById(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice
      .selectWorksheetForPrice(worksheetId)
      .subscribe((response: any) => {
        const ws = this.logList.find(
          (worksheet: any) => worksheet.ID == response.ID,
        );
        this.status = ws.Status;
        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);

        if (this.status == 'Approved') {
          this.goToView(worksheetId);
        }
        if (this.status == 'Verified') {
          this.router.navigate(['/item-store-prices-edit'], {
            state: {
              worksheetData: this.selectedWorksheetData,
            },
          });
        }
        this.router.navigate(['/change-price-edit'], {
          state: {
            worksheetData: this.selectedWorksheetData,
          },
        });
      });
  }

  goToView(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice
      .selectWorksheetForPrice(worksheetId)
      .subscribe((response: any) => {
        const ws = this.logList.find(
          (worksheet: any) => worksheet.ID == response.ID,
        );
        this.status = ws.Status;
        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);

        this.router.navigate(['/change-price-view'], {
          state: {
            worksheetData: this.selectedWorksheetData,
          },
        });
      });
  }

  dateCellTemplate(cellElement: any, cellInfo: any) {
    if (cellInfo.value) {
      const date = new Date(cellInfo.value);
      const dateFormat = sessionStorage.getItem('dateFormat') || 'MM/DD/YYYY';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear());
      let formattedDate = dateFormat
        .replace('dd', day)
        .replace('mm', month)
        .replace('yyyy', year)
        .replace('yy', year.slice(-2));
      cellElement.innerText = formattedDate;
    } else {
      cellElement.innerText = '';
    }
  }

  onAddClick() {
    this.isFormVisible = true;
    this.router.navigate(['/change-price-add']);
    this.listItemsByMultipleStoreIds();
  }
  onApproveClick(e: any) {
    console.log('Approve button clicked for row:', e.row.data);
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    if (worksheetId) {
      this.approveWorksheetById(worksheetId);
    } else {
      console.warn('Worksheet ID is invalid.');
    }

  }
  onViewClick(e: any) {
    console.log('View button clicked for row:', e.row.data);
    const rowData = e.row.data; // Access the row data
    const worksheetId = rowData?.ID;
    if (worksheetId) {
      this.goToView(worksheetId);
    } else {
      console.warn('Worksheet ID is invalid.');
    }
  }

  approveWorksheetById(worksheetId: number) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    this.dataservice
      .selectWorksheetForPrice(worksheetId)
      .subscribe((response: any) => {
        const ws = this.logList.find(
          (worksheet: any) => worksheet.ID == response.ID,
        );
        this.status = ws.Status;

        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);

        if (this.status == 'Approved') {
          this.goToView(worksheetId);
        }
        this.router.navigate(['/item-store-price-approve'], {
          state: {
            worksheetData: this.selectedWorksheetData,
          },
        });
      });
  }

  approveItemStore(selectedWorksheetData: any) {
    const worksheetItems = selectedWorksheetData.worksheet_item_price;

    const worksheetItemPrices = selectedWorksheetData.worksheet_item_price;
    const filteredPrices = worksheetItemPrices.filter(
      (item: any) => item.ID !== 0,
    );

    const updatedPrices = filteredPrices.map((item: any) => {
      return {
        ...item, // Keep other properties unchanged
        SALE_PRICE: item.SALE_PRICE || 0, // Keep existing SALE_PRICE or set to 0 if undefined
        PRICE_NEW: item.PRICE_NEW || '', // Set PRICE_NEW as is
        SALE_PRICE1: item.PRICE_LEVEL1_NEW || item.SALE_PRICE1 || 0,
        SALE_PRICE2: item.PRICE_LEVEL2_NEW || item.SALE_PRICE2 || 0,
        SALE_PRICE3: item.PRICE_LEVEL3_NEW || item.SALE_PRICE3 || 0,
        SALE_PRICE4: item.PRICE_LEVEL4_NEW || item.SALE_PRICE4 || 0,
        SALE_PRICE5: item.PRICE_LEVEL5_NEW || item.SALE_PRICE5 || 0,
      };
    });

    // Create a new payload without the worksheet_item_store
    const { worksheet_item_store, ...cleanedPayload } = selectedWorksheetData;

    const storId = selectedWorksheetData.worksheet_item_store.map(
      (storeID: any) => storeID.STORE_ID,
    );

    const payload = {
      // ...cleanedPayload, // Use cleanedPayload without worksheet_item_store
      ID: selectedWorksheetData.ID,
      COMPANY_ID: 1,
      USER_ID: 1,
      STORE_ID: storId[0],
      NARRATION: '',
      worksheet_item_price: updatedPrices, // Update worksheet_item_price with updated data
    };
    this.dataservice.approveworksheetItemPrices(payload).subscribe(
      (response) => {
        if (response) {
          this.isApproved = true;
          const rowIndex = this.logList.findIndex(
            (item: any) => item.ID === selectedWorksheetData.ID,
          );
          if (rowIndex > -1) {
            this.logList[rowIndex].isApproved = true;
            this.logList = [...this.logList];
          }
          notify(
            {
              message: 'Worksheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Approved',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => { },
    );
  }

  onVerifyClick(e: any) {
    console.log('verify button clicked for row:', e.row.data);
    const rowData = e.row.data; // Access the row data
    e.row.data.isVerified = true;
    const worksheetId = rowData?.ID;
    if (worksheetId) {
      this.verifyWorksheetById(worksheetId, e);
    } else {
      console.warn('Worksheet ID is invalid.');
    }

  }

  verifyWorksheetById(worksheetId: number, e: any) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }
    console.log(e, '=================E===============================')
    this.dataservice.selectWorksheetForPrice(worksheetId).subscribe(
      (response) => {
        const selectedWorksheetData = response;
        this.selectedWorksheetData = response;

        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        if (e.row.data.Status == "Open") {
          this.router.navigate(['/item-store-prices-verify'], {
            state: {
              worksheetData: this.selectedWorksheetData,
              status: status,
            },
          });
        }
        else if (e.row.data.Status == "Verified")
          this.router.navigate(['/item-store-price-approve'], {
            state: {
              worksheetData: this.selectedWorksheetData,
              status: status,
            },
          });
        else {

          this.router.navigate(['/change-price-view'], {
            state: {
              worksheetData: this.selectedWorksheetData,
            },
          });
        }
        this.verifyItemStore(selectedWorksheetData, e);
        // this.dataGrid.instance.refresh();
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      },
    );
  }

  onEditClick(worksheetId: number, e: any) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }

    this.dataservice.selectWorksheetForPrice(worksheetId).subscribe(
      (response) => {
        const selectedWorksheetData = response;
        this.selectedWorksheetData = response;
        const status = response.Status;

        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        this.router.navigate(['/change-price-edit'], {
          state: {
            worksheetData: this.selectedWorksheetData,
            status: status,
          },
        });
        this.verifyItemStore(selectedWorksheetData, e);
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      },
    );
  }
  verifyItemStore(selectedWorksheetData: any, e: any) {
    if (!selectedWorksheetData || !selectedWorksheetData.worksheet_item_price) {
      console.error('Selected worksheet data is missing required properties.');
      return; // Exit the function if data is not valid
    }
    const worksheetItems = selectedWorksheetData.worksheet_item_price;

    const worksheetItemPrices = selectedWorksheetData.worksheet_item_price;
    const filteredPrices = worksheetItemPrices.filter(
      (item: any) => item.ID !== 0,
    );

    const updatedPrices = filteredPrices.map((item: any) => {
      return {
        ...item, // Keep other properties unchanged
        SALE_PRICE: item.SALE_PRICE || 0, // Keep existing SALE_PRICE or set to 0 if undefined
        PRICE_NEW: item.PRICE_NEW || '', // Set PRICE_NEW as is
        SALE_PRICE1: item.PRICE_LEVEL1_NEW || item.SALE_PRICE1 || 0,
        SALE_PRICE2: item.PRICE_LEVEL2_NEW || item.SALE_PRICE2 || 0,
        SALE_PRICE3: item.PRICE_LEVEL3_NEW || item.SALE_PRICE3 || 0,
        SALE_PRICE4: item.PRICE_LEVEL4_NEW || item.SALE_PRICE4 || 0,
        SALE_PRICE5: item.PRICE_LEVEL5_NEW || item.SALE_PRICE5 || 0,
      };
    });

    // Create a new payload without the worksheet_item_store
    const { worksheet_item_store, ...cleanedPayload } = selectedWorksheetData;

    const storId = selectedWorksheetData.worksheet_item_store.map(
      (storeID: any) => storeID.STORE_ID,
    );

    const payload = {
      // ...cleanedPayload, // Use cleanedPayload without worksheet_item_store
      ID: selectedWorksheetData.ID,
      COMPANY_ID: 1,
      USER_ID: 1,
      STORE_ID: storId[0],
      NARRATION: '',
      worksheet_item_price: updatedPrices, // Update worksheet_item_price with updated data
    };
  }

  onSelectionChanged(event: any) { }
  openEditingStart(event: any) {
    event.cancel = true; // Prevent the default editing action
    const selectedId = event.data.ID; // Get the selected row ID
    if (selectedId) {
      this.selectWorksheetById(selectedId);
      // this.router.navigate(['/item-store-properties']);
    } else {
      console.warn('No valid row ID selected');
    }
  }
  onRowRemoving(event: any) {
    const selectedRow = event.data; // Get the data of the selected row
    const id = selectedRow.ID;
    if (id) {
      this.dataservice.deleteWorksheetOfStorePrices(id).subscribe(
        (response) => {
          if (response) {
            notify(
              {
                message: 'Worksheet Deleted Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            // this.dataGrid.instance.refresh();
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
          const index = this.logList.findIndex((item: any) => item.ID === id);
          if (index !== -1) {
            this.logList.splice(index, 1); // Remove item from the array
            event.component.refresh(); // Refresh the DataGrid
          }
        },
        (error) => {
          console.error('Error deleting worksheet:', error);
          event.cancel = true; // Prevent row removal if there's an error
        },
      );
    } else {
      console.warn('No valid row data to delete');
      event.cancel = true; // Prevent row removal if there's no valid data
    }
  }

  //==================toggle filters==================

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshItems() {
    this.getLoglist();
  }
  onCellPrepared(event: any) { }
}
@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemStorePricesLogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePricesLogModule { }
