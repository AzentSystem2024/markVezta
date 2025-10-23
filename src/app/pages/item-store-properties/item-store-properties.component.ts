import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { ActivatedRoute } from '@angular/router';
import { WorksheetService } from 'src/app/services/worksheet.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-item-store-properties',
  templateUrl: './item-store-properties.component.html',
  styleUrls: ['./item-store-properties.component.scss'],
})
export class ItemStorePropertiesComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  // @Input() selectedWorksheetData: any;
  dataGrid: DxDataGridComponent;
  @Input() selectedWorksheetData: any;
  items: any;
  itemsList: any;
  isListVisible: boolean = false;
  isPopupVisible: boolean = false;
  store: any[] = [];
  selectedStoreId: any = 1;
  selectedData: any = {};
  department: any;
  catagory: any;
  brand: any;
  storeList: any;
  filteredStores: any;
  showHeaderFilter = true;
  storeProperties: any[] = [];
  selectedProperties: string[] = [];
  gridWidth: string = '100%';
  showNewGrid: boolean = false;
  showIsNotSaleItem: boolean = false;
  showIsNotSaleReturn: boolean = false;
  showIsNotDiscountable: boolean = false;
  showIsPriceRequired: boolean = false;
  showIsInactive: boolean = false;
  columns: Array<{ dataField: string; caption: string; width: number }> = [];
  editedItems: any[] = [];
  userId: any;
  AllowCommitWithSave: any;
  selectedRowId: number | null = null; // Store the selected row ID
  selectedItemId: number | null = null;
  storeId: any;
  selectedRowIds: number[] = [];
  oldValues: { [key: string]: { [field: string]: any } } = {};
  NotDiscounteoldValue: any;
  NotSaleoldValue: any;
  NotSaleReturnoldValue: any;
  NotPriceoldValue: any;
  inactiveoldValue: any;
  worksheetData: any;
  selectedRowKeys: number[] = [];
  matchingWorksheetItem: any;
  matchingStore: any;
  matchingItem: any;
  itemIndex: any;
  itemListForWorksheet: any;
  filteredRowCount: any;
  selectedRowCount: any;
  itemStoresList: any;
  savedWorksheet: any;
  selectedItems: any;
  isSaved: boolean = false;
  isVerified: boolean = false;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private worksheetservice: WorksheetService
  ) {
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
      // console.log(this.brand, 'BRAND');
    });
  }

  ngOnInit() {
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    console.log(this.AllowCommitWithSave, 'Allowcommit');
    this.listStoreItemProperty();
    this.loadStore();
    this.updateColumnVisibility();
    this.userId = sessionStorage.getItem('UserId');
    console.log(this.userId, 'USERID');
    this.extractStoreProperties(this.store);
  }

  listStoreItemProperty() {
    console.log('HELLO - No valid worksheetData found, fetching from service.');

    this.dataservice.getStoreItemPropertyList().subscribe((response) => {
      this.itemStoresList = response.data;
      console.log(
        'Using service data for itemStoresList:',
        this.itemStoresList
      );

      // Find items with matching ITEM_IDs from selectedItems
      const matchingItems = this.itemStoresList.filter((itemStore) => {
        return this.selectedItems.some(
          (selectedItem) => selectedItem.ITEM_ID === itemStore.ITEM_ID
        );
      });

      // Log the matching items
      console.log('Matching items with same ITEM_ID:', matchingItems);
    });
  }

  loadStore() {
    this.dataservice.getStoresData().subscribe((response) => {
      this.store = response;
    });
  }
  onEditorPreparing = (e: any) => {
    if (
      e.parentType === 'dataRow' &&
      e.dataField &&
      e.dataField.endsWith('_NEW')
    ) {
      const rowKey = e.row.data['ID']; // Adjust this to match your row identifier
      const oldValue = e.row.data[e.dataField.replace('_NEW', '')];
      if (!this.oldValues[rowKey]) {
        this.oldValues[rowKey] = {};
      }
      this.oldValues[rowKey][e.dataField] = oldValue;
    }
  };

  listItems() {
    const payload = {};
    this.dataservice.getItemsData().subscribe(
      (items: any) => {
        this.items = items;
        this.itemStoresList = items.data;
        console.log(this.itemStoresList, 'ITEMSTORESLIST');
        this.itemStoresList.forEach((item: any) => {
          this.fetchSelectedItem(item.ID);
        });
        this.dataGrid.instance.refresh();
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }

  onSelectionChanged(event: any) {
    this.selectedRowCount = event.selectedRowKeys.length;
    this.selectedRowKeys = event.selectedRowKeys;
    console.log(this.selectedRowKeys, 'IN ONSELECTIONCHANGED');
    const selectedItems = event.selectedRowsData;
    if (selectedItems.length > 0) {
      const selectedRow = selectedItems[0];
      this.selectedRowId = selectedRow.ID;
      this.selectedItemId = selectedRow.ITEM_ID;
      this.inactiveoldValue =
        this.oldValues[this.selectedRowId]?.['IS_INACTIVE_NEW'];
      this.NotDiscounteoldValue =
        this.oldValues[this.selectedRowId]?.['IS_NOT_DISCOUNTABLE_NEW'];
      this.NotSaleoldValue =
        this.oldValues[this.selectedRowId]?.['IS_NOT_SALE_ITEM_NEW'];
      this.NotSaleReturnoldValue =
        this.oldValues[this.selectedRowId]?.['IS_NOT_SALE_RETURN_NEW'];
      this.NotPriceoldValue =
        this.oldValues[this.selectedRowId]?.['IS_PRICE_REQUIRED_NEW'];
      this.fetchSelectedItem(this.selectedRowId);
    } else {
      this.selectedRowId = null;
      this.selectedItemId = null;
    }
  }

  fetchSelectedItem(id: number): void {
    this.dataservice.selectItems(id).subscribe(
      (response: any) => {
        const item = this.itemStoresList.find((i) => i.ID === id);
        if (item) {
          item.item_stores = response.item_stores || [];
          if (item.item_stores.length > 0) {
            item.IS_NOT_SALE_ITEM = this.aggregateProperty(
              item.item_stores,
              'IS_NOT_SALE_ITEM'
            );
            item.IS_NOT_SALE_RETURN = this.aggregateProperty(
              item.item_stores,
              'IS_NOT_SALE_RETURN'
            );
            item.IS_PRICE_REQUIRED = this.aggregateProperty(
              item.item_stores,
              'IS_PRICE_REQUIRED'
            );
            item.IS_NOT_DISCOUNTABLE = this.aggregateProperty(
              item.item_stores,
              'IS_NOT_DISCOUNTABLE'
            );
            item.IS_INACTIVE = this.aggregateProperty(
              item.item_stores,
              'IS_INACTIVE'
            );
          } else {
            item.STORE_NAME = 'No Store';
          }
          this.filteredRowCount = this.itemStoresList.length;
          // Check if worksheetData exists and match the item ID
          //
          this.extractStoreProperties(item.item_stores);
        }
      },
      (error) => {
        // console.error('Error fetching selected item:', error);
      }
    );
  }

  updateColumnVisibility() {
    this.showIsNotSaleItem = this.selectedProperties.includes('Not Sale Item');
    this.showIsNotSaleReturn =
      this.selectedProperties.includes('Not Sale Return');
    this.showIsNotDiscountable =
      this.selectedProperties.includes('Not Discountable');
    this.showIsPriceRequired =
      this.selectedProperties.includes('Price Required');
    this.showIsInactive = this.selectedProperties.includes('Inactive');
  }

  aggregateProperty(stores: any[], property: string): any {
    return stores.some((store) => store[property] === true);
  }

  extractStoreProperties(store: any) {
    const properties = [
      { name: 'Inactive', value: store.IS_INACTIVE },
      { name: 'Not Discountable', value: store.IS_NOT_DISCOUNTABLE },
      { name: 'Not Sale Item', value: store.IS_NOT_SALE_ITEM },
      { name: 'Not Sale Return', value: store.IS_NOT_SALE_RETURN },
      { name: 'Price Required', value: store.IS_PRICE_REQUIRED },
    ];
    properties.forEach((property) => {
      if (!this.storeProperties.find((prop) => prop.name === property.name)) {
        this.storeProperties.push(property);
        console.log(this.storeProperties, 'STOREPROPERTIES');
      }
    });
  }

  updateEditedItems(property: string, newValue: boolean, rowData: any) {
    // Check if an edited item already exists for the selected store
    let editedItem = this.editedItems.find(
      (item) => item.STORE_ID === this.selectedStoreId
    );
    if (!editedItem) {
      editedItem = {
        COMPANY_ID: 1,
        USER_ID: 1,
        STORE_ID: this.selectedStoreId,
        NARRATION: '',
        worksheet_item_property: [], // Initialize as an empty array
      };
      this.editedItems.push(editedItem);
    }

    // Iterate over selected row keys to update each corresponding worksheet item
    this.selectedRowKeys.forEach((selectedItem: any) => {
      const selectedId = selectedItem.ID;
      console.log('Processing ITEM_ID:', selectedId);
      let worksheetItem = editedItem.worksheet_item_property.find(
        (prop) => prop.ID === selectedId
      );

      if (!worksheetItem) {
        // If no worksheetItem exists, initialize it with the current values (old values)
        worksheetItem = {
          ITEM_ID: selectedId,
          IS_PRICE_REQUIRED: rowData.IS_PRICE_REQUIRED ?? false, // Old value
          IS_NOT_DISCOUNTABLE: rowData.IS_NOT_DISCOUNTABLE ?? false, // Old value
          IS_NOT_SALE_ITEM: rowData.IS_NOT_SALE_ITEM ?? false, // Old value
          IS_NOT_SALE_RETURN: rowData.IS_NOT_SALE_RETURN ?? false, // Old value
          IS_INACTIVE: rowData.IS_INACTIVE ?? false, // Old value

          // Initialize new values as null, to be set when the checkbox changes
          IS_PRICE_REQUIRED_NEW: null,
          IS_NOT_DISCOUNTABLE_NEW: null,
          IS_NOT_SALE_ITEM_NEW: null,
          IS_NOT_SALE_RETURN_NEW: null,
          IS_INACTIVE_NEW: null,
        };

        // Add the new worksheet item to the array
        editedItem.worksheet_item_property.push(worksheetItem);
      }

      // Update the new value for the specific property based on the checkbox interaction
      worksheetItem[property + '_NEW'] = newValue;

      // Preserve the old value from rowData if it is undefined or null
      if (
        worksheetItem[property] === null ||
        worksheetItem[property] === undefined
      ) {
        worksheetItem[property] = rowData[property]; // Use current (old) value
      }

      console.log('Updated worksheet item:', worksheetItem);
    });

    console.log('Updated editedItems:', this.editedItems);
  }

  // Checkbox event handlers
  onSaleItemValueChanged = (e: any) =>
    this.handleCheckboxChange(e, 'IS_NOT_SALE_ITEM');
  onSaleReturnValueChanged = (e: any) =>
    this.handleCheckboxChange(e, 'IS_NOT_SALE_RETURN');
  onNotDisountableValueChanged = (e: any) =>
    this.handleCheckboxChange(e, 'IS_NOT_DISCOUNTABLE');
  onPriceRequiredValueChanged = (e: any) =>
    this.handleCheckboxChange(e, 'IS_PRICE_REQUIRED');
  onInactiveValueChanged = (e: any) =>
    this.handleCheckboxChange(e, 'IS_INACTIVE');

  handleCheckboxChange(e: any, property: string) {
    const newValue = e.value; // The new value from the checkbox
    const rowData = e.component.option('value'); // Get the corresponding row data
    // console.log(newValue, 'NEWVALUE');
    // console.log(rowData, 'ROWDATA');
    this.updateEditedItems(property, newValue, rowData); // Update the edited items with new value
  }

  saveChanges() {
    if (this.editedItems.length > 0) {
      const payload = this.editedItems;
      this.dataservice.saveWorksheetItemPropertyData(payload[0]).subscribe(
        (response: any) => {
          this.savedWorksheet = response;
          console.log(response, 'RESPONSEEEEEEEEEEEEE');
          this.editedItems = []; // Clear edited items after successful save
          // this.dataGrid.instance.refresh(); // Refresh grid if needed
          if (response) {
            notify(
              {
                message: 'Worksheet Added Successfully',
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
        },
        (error) => {
          // console.error('Error saving items:', error);
        }
      );
    }
  }

  onSaveButtonClick() {
    this.saveChanges();
    this.isSaved = true;
  }

  onVerify() {
    if (!this.savedWorksheet) {
      console.error('No saved worksheet to verify. Please save first.');
      return; // Prevent verifying if nothing is saved
    }
    console.log(this.savedWorksheet, 'SAVEDWORKSHEETTTT');
    // Prepare the verification payload based on the saved worksheet
    const verificationPayload = {
      ID: this.savedWorksheet.ID, // Use appropriate fields from the savedWorksheet
      COMPANY_ID: this.savedWorksheet.COMPANY_ID,
      USER_ID: this.savedWorksheet.USER_ID,
      STORE_ID: this.savedWorksheet.STORE_ID,
      worksheet_item_property: this.editedItems.map((item) => ({
        ITEM_ID: item.ITEM_ID, // Ensure to use the right fields
        IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED,
        IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED_NEW,
        IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE,
        IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE_NEW,
        IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM,
        IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM_NEW,
        IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN,
        IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN_NEW,
        IS_INACTIVE: item.IS_INACTIVE,
        IS_INACTIVE_NEW: item.IS_INACTIVE_NEW,
      })),
    };

    // Call the verification service with the constructed payload
    this.verifyItemStoreProperties(verificationPayload);
  }

  verifyItemStoreProperties(payload: any) {
    this.dataservice.verifyItemStoreProperties(payload).subscribe(
      (verifyResponse) => {
        if (verifyResponse) {
          notify(
            {
              message: 'Worksheet Verified Successfully',
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
        console.log('Verification successful:', verifyResponse);
        this.isVerified = true;
      },
      (error) => {
        // Handle error
        console.error('Verification failed:', error);
      }
    );
  }
  onApprove() {
    const approvePayload = {
      ID: this.savedWorksheet.ID, // Use appropriate fields from the savedWorksheet
      COMPANY_ID: this.savedWorksheet.COMPANY_ID,
      USER_ID: this.savedWorksheet.USER_ID,
      STORE_ID: this.savedWorksheet.STORE_ID,
      worksheet_item_property: this.editedItems.map((item) => ({
        ITEM_ID: item.ITEM_ID, // Ensure to use the right fields
        IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED,
        IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED_NEW,
        IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE,
        IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE_NEW,
        IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM,
        IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM_NEW,
        IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN,
        IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN_NEW,
        IS_INACTIVE: item.IS_INACTIVE,
        IS_INACTIVE_NEW: item.IS_INACTIVE_NEW,
      })),
    };
    this.ApproveItemStoreProperties(approvePayload);
  }

  ApproveItemStoreProperties(payload: any) {
    this.dataservice
      .approveworksheetItemProperty(payload)
      .subscribe((response: any) => {
        if (response) {
          notify(
            {
              message: 'Worksheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.router.navigate(['/item-store-properties-log']);
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
  }

  onPropertiesChange(event: any) {
    this.selectedProperties = event.value;
    console.log(this.selectedProperties, 'IN ONPROPERTIESCHANGED');
    this.updateColumnVisibility();
  }

  onDropdownValueChanged(event: any) {
    this.storeId = event.value; // Get the selected store ID
    // console.log(this.storeId, 'SELECTED STORE ID');
    if (!this.storeId || this.storeId === null) {
      this.selectedStoreId = null;
      this.itemStoresList = [];
    } else {
      this.selectedStoreId = this.storeId;
      this.getStoresById(this.storeId);
    }
  }

  getStoresById(storeId: any) {
    this.dataservice.getStoresData().subscribe((response) => {
      this.filteredStores = response.filter(
        (store: any) => store.ID === storeId
      );
      if (this.filteredStores.length > 0) {
        this.listItemsByStoreId(storeId);
      }
    });
  }

  listItemsByStoreId(storeId: number) {
    if (storeId == 1) {
      const payload = {};
      this.dataservice.getItemsData().subscribe((response: any) => {
        this.items = response;
        this.itemStoresList = response.data;
        this.dataGrid.instance.refresh();
        this.itemStoresList.forEach((item: any) => {
          this.fetchSelectedItem(item.ID);
        });
      });
    } else {
      this.dataservice.getItemsByStoreId(storeId).subscribe((response: any) => {
        this.items = response;
        this.itemStoresList = response.data;
        this.dataGrid.instance.refresh();
        this.itemStoresList.forEach((item: any) => {
          this.fetchSelectedItem(item.ID);
        });
      });
    }
  }

  onCancel() {
    this.router.navigate(['/item-store-properties-log']);
  }
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
    ItemsFormModule,
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
  declarations: [ItemStorePropertiesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePropertiesModule {}
