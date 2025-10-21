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
  dataGrid: DxDataGridComponent;
  logList: any;
  showHeaderFilter = true;
  isVerified: boolean = false;
  isApproved: boolean = false;
  verifiedRows: Set<number> = new Set();
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  customButtons = [
    // {
    //   hint: 'Verify',
    //   icon: 'check',
    //   text: 'Verify',
    //   onClick: (e) => this.onVerifyClick(e),
    //   visible: (e) => !e.row.data.isVerified && !e.row.data.isApproved,
    // },
    {
      hint: 'Approve',
      icon: 'check',
      text: 'Approve',
      onClick: (e) => this.onApproveClick(e),
      visible: (e) => e.row.data.isVerified && !e.row.data.isApproved,
    },
  ];
  allButtonsEditDelete = [
    {
      name: 'edit',
      visible: true,
    },
    {
      name: 'delete',
      visible: (e) => !e.row.data.isVerified && !e.row.data.isApproved,
    },
  ];
  selectWorksheetData: any;
  selectedWorksheetData: any;
  logStatusMap: { [key: number]: string } = {};
  status: any;
  AllowCommitWithSave: string;
  dateFormat: string;
  currencyFormt: string;
  isFormVisible: boolean;
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
        this.onAddClick();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  constructor(
    private dataservice: DataService,
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
    // this.sessionData_tax();
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
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/change-price') {
          this.getLoglist();
        }
      });
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    // console.log(this.AllowCommitWithSave,"ALLOW")
    this.dateFormat = sessionStorage.getItem('dateFormat');
    this.currencyFormt = sessionStorage.getItem('currencyFormat');
    // console.log(this.dateFormat,"DATE")
    this.getLoglist();
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      // this.getLoglist();
    }
  }
  getLoglist() {
    this.dataservice
      .getWorksheetItemStorePrices()
      .subscribe((response: any) => {
        this.logList = response.dataworksheet
          .map((item) => {
            this.logStatusMap[item.WS_NO] = item.Status;
            return {
              ...item,
              isVerified: item.Status === 'Verified',
              isApproved: item.Status === 'Approved',
            };
          })
          .sort((a, b) => b.WS_NO - a.WS_NO);
        console.log(this.logList, 'LOGLIST');
        this.logList.forEach((item) => {
          if (item.isVerified) {
          } else if (item.isApproved) {
            // console.log(`Record ${item.WS_NO} is Approved.`);
          } else {
            // console.log(`Record ${item.WS_NO} is Open.`);
          }
        });
        // console.log(this.logList, 'LOGLIST');
      });
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
          (worksheet) => worksheet.ID == response.ID
        );
        this.status = ws.Status;
        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        console.log('Navigating to edit page with:', {
          worksheetData: this.selectedWorksheetData,
        });
        if (this.status == 'Approved') {
          this.goToView(worksheetId);
        }
        if (this.status == 'Verified') {
          this.router.navigate(['/item-store-prices-edit'], {
            state: {
              worksheetData: this.selectedWorksheetData,
            },
          });
          console.log(this.selectedWorksheetData, 'SELECTEDWORKSHEETDATA');
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
          (worksheet) => worksheet.ID == response.ID
        );
        this.status = ws.Status;
        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        console.log('Navigating to view page with:', {
          worksheetData: this.selectedWorksheetData,
        });
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
    console.log('add called');
    this.isFormVisible = true;
    this.router.navigate(['/change-price-add']);
  }
  onApproveClick(e: any) {
    if (this.AllowCommitWithSave) {
      const rowData = e.row.data; // Access the row data
      const worksheetId = rowData?.ID;
      if (worksheetId) {
        this.approveWorksheetById(worksheetId);
      } else {
        console.warn('Worksheet ID is invalid.');
      }
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
          (worksheet) => worksheet.ID == response.ID
        );
        this.status = ws.Status;
        console.log(this.status, 'STATUS IN APPROVE');
        console.log(response.worksheet_item_price, 'WORKSHEETRESPONSE');

        this.selectedWorksheetData = { ...response, status: this.status };
        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        console.log('Navigating to edit page with:', {
          worksheetData: this.selectedWorksheetData,
        });
        if (this.status == 'Approved') {
          console.log(this.status, 'STATUSSSSSSSSSSS');
          this.goToView(worksheetId);
        }
        this.router.navigate(['/item-store-prices-approve'], {
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
      (item: any) => item.ID !== 0
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
      (storeID) => storeID.STORE_ID
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
    console.log('Approval payload:', payload);
    this.dataservice.approveworksheetItemPrices(payload).subscribe(
      (response) => {
        console.log(response, 'RESPONSE IN APPROVE FN.');
        if (response) {
          this.isApproved = true;
          const rowIndex = this.logList.findIndex(
            (item) => item.ID === selectedWorksheetData.ID
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
            'success'
          );
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Approved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {}
    );
  }

  onVerifyClick(e: any) {
    if (this.AllowCommitWithSave) {
      console.log('Verify Button clicked');
      const rowData = e.row.data; // Access the row data
      e.row.data.isVerified = true;
      const worksheetId = rowData?.ID;
      console.log('Row ID:', worksheetId);
      if (worksheetId) {
        this.verifyWorksheetById(worksheetId, e);
      } else {
        console.warn('Worksheet ID is invalid.');
      }
    }
  }

  verifyWorksheetById(worksheetId: number, e: any) {
    if (!worksheetId) {
      console.warn('Invalid worksheet ID');
      return;
    }

    this.dataservice.selectWorksheetForPrice(worksheetId).subscribe(
      (response) => {
        const selectedWorksheetData = response;
        console.log(
          'Fetched Worksheet Data for Verification:',
          selectedWorksheetData
        );
        // if (
        //   response.worksheet_item_price &&
        //   response.worksheet_item_price.length > 0
        // ) {
        //   response.worksheet_item_price.forEach((item: any) => {
        //     // console.log('Original Item:', item);
        //     item.SALE_PRICE = item.PRICE_NEW;
        //     item.SALE_PRICE1 = item.PRICE_LEVEL1_NEW; // Optional, if needed
        //     item.SALE_PRICE2 = item.PRICE_LEVEL2_NEW; // Optional, if needed
        //     item.SALE_PRICE3 = item.PRICE_LEVEL3_NEW; // Optional, if needed
        //     item.SALE_PRICE4 = item.PRICE_LEVEL4_NEW; // Optional, if needed
        //     item.SALE_PRICE5 = item.PRICE_LEVEL5_NEW; // Optional, if needed
        //   });
        // }
        this.selectedWorksheetData = response;

        console.log(this.selectedWorksheetData, 'SELECTEDWORKSHEETDATA');
        this.dataservice.setWorksheetData(this.selectedWorksheetData);
        console.log('Navigating to edit page with:', {
          worksheetData: this.selectedWorksheetData,
          status: status,
        });

        this.router.navigate(['/item-store-prices-verify-approve'], {
          state: {
            worksheetData: this.selectedWorksheetData,
            status: status,
          },
        });
        this.verifyItemStore(selectedWorksheetData, e);
        // this.dataGrid.instance.refresh();
      },
      (error) => {
        console.error('Error fetching worksheet for verification:', error);
      }
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
      (item: any) => item.ID !== 0
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
      (storeID) => storeID.STORE_ID
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

    console.log(payload, 'PAYLOAD IN VERIFY');
  }

  onSelectionChanged(event: any) {}
  openEditingStart(event: any) {
    event.cancel = true; // Prevent the default editing action
    const selectedId = event.data.ID; // Get the selected row ID
    console.log('Edit row triggered for ID:', selectedId);
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
    console.log('Delete button clicked for ID:', id);
    if (id) {
      this.dataservice.deleteWorksheetOfStorePrices(id).subscribe(
        (response) => {
          if (response) {
            notify(
              {
                message: 'Worksheet Deleted Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success'
            );
            // this.dataGrid.instance.refresh();
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error'
            );
          }
          console.log('Worksheet deleted successfully:', response);
          const index = this.logList.findIndex((item) => item.ID === id);
          if (index !== -1) {
            this.logList.splice(index, 1); // Remove item from the array
            event.component.refresh(); // Refresh the DataGrid
          }
        },
        (error) => {
          console.error('Error deleting worksheet:', error);
          event.cancel = true; // Prevent row removal if there's an error
        }
      );
    } else {
      console.warn('No valid row data to delete');
      event.cancel = true; // Prevent row removal if there's no valid data
    }
  }

  refreshItems() {
    this.getLoglist();
  }
  onCellPrepared(event: any) {}
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
export class ItemStorePricesLogModule {}
