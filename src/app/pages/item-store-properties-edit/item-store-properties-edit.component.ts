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
import { ActivatedRoute, Router } from '@angular/router';
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
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { WorksheetService } from 'src/app/services/worksheet.service';

@Component({
  selector: 'app-item-store-properties-edit',
  templateUrl: './item-store-properties-edit.component.html',
  styleUrls: ['./item-store-properties-edit.component.scss'],
})
export class ItemStorePropertiesEditComponent {
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
  department: any;
  catagory: any;
  brand: any;
  filteredStores: any;
  showHeaderFilter = true;
  storeProperties: any[] = [];
  selectedProperties: any[] = [];
  gridWidth: string = '100%';
  showNewGrid: boolean = false;
  showIsNotSaleItem: boolean = false;
  showIsNotSaleReturn: boolean = false;
  showIsNotDiscountable: boolean = false;
  showIsPriceRequired: boolean = false;
  showIsInactive: boolean = false;
  columns: Array<{
    dataField: string;
    caption: string;
    width: number;
    visible: boolean;
  }> = [];
  editedItems: any[] = [];
  userId: any;
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
  AllowCommitWithSave: any;
  isVerified: boolean;

  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
  }

  ngOnInit() {
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.userId = sessionStorage.getItem('UserId');
    this.subscribeToWorksheetData();
    this.loadStore();
    this.updateColumnVisibility();
    this.extractStoreProperties(this.store);
    this.extractChangedProperties();
  }

  subscribeToWorksheetData() {
    this.dataservice.worksheetData$.subscribe((data) => {
      if (
        data &&
        data.worksheet_item_property &&
        data.worksheet_item_property.length > 0
      ) {
        this.worksheetData = data;
        this.itemStoresList = this.worksheetData.worksheet_item_property;
        this.selectedStoreId =
          this.worksheetData.worksheet_item_store?.[0]?.STORE_ID;
          console.log('All worksheet items:', this.worksheetData.worksheet_item_property);
        this.selectedItems = this.worksheetData.worksheet_item_property.filter(
          (item) => item.Selected === true
        );
        this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
        this.cdr.detectChanges(); 
        console.log('Selected Items:', this.selectedItems);
        console.log('Selected Row Keys:', this.selectedRowKeys);
      } else {
        console.log('No worksheet data, fetching from service');
        // this.listStoreItemProperty();
      }
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
    const payload={

    }
    this.dataservice.getItemsData(payload).subscribe(
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
    this.selectedRowIds = event.selectedRowKeys;
    this.selectedRowKeys = this.selectedRowIds;
    const selectedItems = event.selectedRowsData;
    if (selectedItems.length > 0) {
      const selectedRow = selectedItems[0]; // Get the first selected row
      this.selectedRowId = selectedRow.ID; // Capture the row ID
      this.selectedItemId = selectedRow.ID;
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
          this.extractStoreProperties(item.item_stores);
        }
      },
      (error) => {
        console.error('Error fetching selected item:', error);
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
    console.log(this.selectedProperties, 'SELECTEDPROPERTYYYYYYYYYYYYYYYYYY');
    // this.dataGrid.instance.refresh();
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

  extractChangedProperties() {
    this.worksheetData.worksheet_item_property.forEach((item) => {
      if (item.Selected) {
        if (item.IS_INACTIVE !== item.IS_INACTIVE_NEW) {
          this.addProperty('Inactive', item.IS_INACTIVE_NEW);
        }
        if (item.IS_NOT_DISCOUNTABLE !== item.IS_NOT_DISCOUNTABLE_NEW) {
          this.addProperty('Not Discountable', item.IS_NOT_DISCOUNTABLE_NEW);
        }
        if (item.IS_NOT_SALE_ITEM !== item.IS_NOT_SALE_ITEM_NEW) {
          this.addProperty('Not Sale Item', item.IS_NOT_SALE_ITEM_NEW);
        }
        if (item.IS_NOT_SALE_RETURN !== item.IS_NOT_SALE_RETURN_NEW) {
          this.addProperty('Not Sale Return', item.IS_NOT_SALE_RETURN_NEW);
        }
        if (item.IS_PRICE_REQUIRED !== item.IS_PRICE_REQUIRED_NEW) {
          this.addProperty('Price Required', item.IS_PRICE_REQUIRED_NEW);
        }
      }
    });

    console.log(this.selectedProperties, 'SELECTED PROPERTIES');
    console.log(this.storeProperties, 'STORE PROPERTIES');
  }

  addProperty(name: string, value: any) {
    if (!this.selectedProperties.includes(name)) {
      this.selectedProperties.push(name);
      const existingProperty = this.storeProperties.find(
        (item) => item.name === name
      );
      if (!existingProperty) {
        this.storeProperties.push({ name, value });
      } else {
        existingProperty.value = value;
      }
    }
    this.updateColumnVisibility();
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
    this.handleCheckboxChange(e, 'IS_INACTIVE_NEW');

  handleCheckboxChange(e: any, property: string) {
    const newValue = e.value; // The new value from the checkbox
    const rowData = e.component.option('value'); // Get the corresponding row data
    console.log(newValue, 'NEWVALUE');
    console.log(rowData, 'ROWDATA');
    this.updateEditedItems(property, newValue, rowData); // Update the edited items with new value
  }

  saveChanges() {
    if (this.editedItems.length > 0) {
      const payload = this.editedItems;
      console.log(payload,"PAYLOAD IN EDIT")
      this.dataservice.updateworksheetItemProperty(payload).subscribe(
        (response: any) => {
          this.savedWorksheet = response;
          if (response) {
            notify(
              {
                message: 'Data Updated Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success'
            );
            // this.dataGrid.instance.refresh();
            this.editedItems = [];
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error'
            );
          }
          // Clear edited items after successful save
          // this.dataGrid.instance.refresh(); // Refresh grid if needed
          // this.router.navigate(['/item-store-properties-log']);
        },
        (error) => {
          // console.error('Error saving items:', error);
        }
      );
    }
  }

  updateEditedItems(property: string, newValue: boolean, rowData: any) {
    console.log(rowData,"{{{{{")
    let editedItem = this.editedItems.find(
        (item) => item.STORE_ID === String(this.selectedStoreId) // Ensure STORE_ID is a string
    );
    // If no existing edited item found, create a new one
    if (!editedItem) {
        editedItem = {
            ID: 1,
            COMPANY_ID: 1,
            USER_ID: 1,
            STORE_ID: String(this.selectedStoreId),
            worksheet_item_property: [], // Initialize as an empty array
        };
        this.editedItems.push(editedItem);
    }

    this.selectedRowKeys.forEach((selectedId: number) => {
        let worksheetItem = editedItem.worksheet_item_property.find(
            (prop) => prop.ITEM_ID === selectedId
        );

        if (!worksheetItem) {
            // Create a new worksheet item with all properties initialized to null
            worksheetItem = {
                ITEM_ID: selectedId, // Store only the numeric ID
                IS_PRICE_REQUIRED: null,
                IS_NOT_DISCOUNTABLE: null,
                IS_NOT_SALE_ITEM: null,
                IS_NOT_SALE_RETURN: null,
                IS_INACTIVE: null,

                // Initialize _NEW properties based on the current change
                IS_PRICE_REQUIRED_NEW: property === 'IS_PRICE_REQUIRED_NEW' ? newValue : null,
                IS_NOT_DISCOUNTABLE_NEW: property === 'IS_NOT_DISCOUNTABLE_NEW' ? newValue : null,
                IS_NOT_SALE_ITEM_NEW: property === 'IS_NOT_SALE_ITEM_NEW' ? newValue : null,
                IS_NOT_SALE_RETURN_NEW: property === 'IS_NOT_SALE_RETURN_NEW' ? newValue : null,
                IS_INACTIVE_NEW: property === 'IS_INACTIVE_NEW' ? newValue : null,
            };

            editedItem.worksheet_item_property.push(worksheetItem);
        } else {
            // Update the new value for the specific property only if it is the changed property
            if (property === 'IS_PRICE_REQUIRED') {
                worksheetItem.IS_PRICE_REQUIRED_NEW = newValue;
            } else if (property === 'IS_NOT_DISCOUNTABLE') {
                worksheetItem.IS_NOT_DISCOUNTABLE_NEW = newValue;
            } else if (property === 'IS_NOT_SALE_ITEM') {
                worksheetItem.IS_NOT_SALE_ITEM_NEW = newValue;
            } else if (property === 'IS_NOT_SALE_RETURN') {
                worksheetItem.IS_NOT_SALE_RETURN_NEW = newValue;
            } else if (property === 'IS_INACTIVE') {
                worksheetItem.IS_INACTIVE_NEW = newValue; // Update for IS_INACTIVE
            }
        }
    });
}



  onSaveButtonClick() {
    this.saveChanges();
    this.isSaved = true;
  }

  onVerify() {
    if (!this.savedWorksheet) {
      console.error('No saved worksheet to verify. Please save first.');
      return;
    }
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
    console.log('Selected Properties======:', event.value); 
    this.selectedProperties = event.value;
    this.columns.forEach((column) => {
      column.visible = this.selectedProperties.includes(column.caption); // Match caption with selected properties
    });
    this.updateColumnVisibility();
  }

  onDropdownValueChanged(event: any) {
    this.storeId = event.value;
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
         const payload={

      }
      this.dataservice.getItemsData(payload).subscribe((response: any) => {
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
  declarations: [ItemStorePropertiesEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePropertiesEditModule {}
