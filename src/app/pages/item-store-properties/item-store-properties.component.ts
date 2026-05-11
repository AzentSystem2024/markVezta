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
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;
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
  selectedRowId: any; // Store the selected row ID
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
  selected_Company_id: any;
  Selected_Items_Data: any = [];
  updatedMap: any = {};
  selecte_grid_Data: any;
  User_Id: any;
  updatedRows: any = [];
  selectedStoreIds: any = [];
  selectedNarration: any;
  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private worksheetservice: WorksheetService,
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
    this.sesstion_Details();
    this.listStoreItemProperty();
    this.loadStore();
    this.updateColumnVisibility();
    this.userId = sessionStorage.getItem('UserId');
    this.extractStoreProperties(this.store);
  }

  listStoreItemProperty() {
    this.dataservice.getStoreItemPropertyList().subscribe((response) => {
      this.itemStoresList = response.data;
      console.log(
        this.itemStoresList,
        '================item store list===================',
      );

      // Find items with matching ITEM_IDs from selectedItems
      const matchingItems = this.itemStoresList.filter((itemStore: any) => {
        return this.selectedItems.some(
          (selectedItem: any) => selectedItem.ITEM_ID === itemStore.ITEM_ID,
        );
      });

      // Log the matching items
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.User_Id = sessionData.USER_ID;
  }

  loadStore() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getStoresData(payload).subscribe((response) => {
      this.store = response;
    });
  }
  onEditorPreparing = (e: any) => {
    if (e.parentType === 'dataRow') {
      const original = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        // keep default DevExtreme behavior (important)
        if (original) original(args);
        e.setValue(args.value); // make sure grid data actually updates

        const row = e.row.data;
        const id = row.ITEM_ID;

        if (!this.updatedMap[id]) {
          this.updatedMap[id] = { ...row };
        }
        this.updatedMap[id][e.dataField] = args.value;
      };
    }
  };


  preparePayload() {
    const finalData = this.Selected_Items_Data.map((item: any) => {
      const updated = this.updatedMap[item.ITEM_ID];

      return {
        ...item,
        ...updated, // merge edited values

        // ensure Selected = true
        Selected: true,
        ID: 0,
      };
    });

    const payload = finalData;

    this.selecte_grid_Data = payload;

    console.log('FINAL PAYLOAD:', payload);

    return payload;
  }

  onSelectionChanged(e: any) {
    this.Selected_Items_Data = e.selectedRowsData;
  }


  fetchSelectedItem(id: number): void {
    this.dataservice.selectItems(id).subscribe(
      (response: any) => {
        const item = this.itemStoresList.find((i: any) => i.ID === id);
        if (item) {
          item.item_stores = response.item_stores || [];

          this.filteredRowCount = this.itemStoresList.length;
          // Check if worksheetData exists and match the item ID
          //
          this.extractStoreProperties(item.item_stores);
        }
      },
      (error) => {
        // console.error('Error fetching selected item:', error);
      },
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
      }
    });
  }

  updateEditedItems(property: string, newValue: boolean, rowData: any) {
    // Check if an edited item already exists for the selected store
    let editedItem = this.editedItems.find(
      (item) => item.STORE_ID === this.selectedStoreId,
    );
    if (!editedItem) {
      editedItem = {
        COMPANY_ID: 1,
        USER_ID: 1,
        STORE_ID: this.selectedStoreId.toString(),
        NARRATION: '',
        WS_DATE: new Date(),
        worksheet_item_property: [], // Initialize as an empty array
      };
      this.editedItems.push(editedItem);
    }

    // Iterate over selected row keys to update each corresponding worksheet item
    this.selectedRowKeys.forEach((selectedItem: any) => {
      const selectedId = selectedItem.ID;
      let worksheetItem = editedItem.worksheet_item_property.find(
        (prop: any) => prop.ID === selectedId,
      );

      if (!worksheetItem) {
        // If no worksheetItem exists, initialize it with the current values (old values)
        worksheetItem = {
          ID: 0,
          ITEM_ID: rowData.ITEM_ID, // Use the ITEM_ID from rowData
          IS_PRICE_REQUIRED: rowData.IS_PRICE_REQUIRED ?? false, // Old value
          IS_NOT_DISCOUNTABLE: rowData.IS_NOT_DISCOUNTABLE ?? false, // Old value
          IS_NOT_SALE_ITEM: rowData.IS_NOT_SALE_ITEM ?? false, // Old value
          IS_NOT_SALE_RETURN: rowData.IS_NOT_SALE_RETURN ?? false, // Old value
          IS_INACTIVE: rowData.IS_INACTIVE ?? false, // Old value
          BARCODE: rowData.BARCODE, // Include other necessary fields from rowData
          DESCRIPTION: rowData.DESCRIPTION,
          DEPT_NAME: rowData.DEPT_NAME,
          CAT_NAME: rowData.CAT_NAME,
          BRAND_NAME: rowData.BRAND_NAME,
          Selected: true,
          STORE_ID: rowData.STORE_ID,
          STORE_NAME: rowData.STORE_NAME,
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
    });
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

    this.updateEditedItems(property, newValue, rowData); // Update the edited items with new value
  }

  saveChanges() {
    this.preparePayload();
    console.log(this.dataGrid);
    console.log(this.selecte_grid_Data);
    if (this.selecte_grid_Data.length > 0) {
      const worksheetdata = this.selecte_grid_Data.map((item: any) => ({
        ID: 0,
        ITEM_ID: item.ITEM_ID,
        IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED ?? false,
        IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED_NEW ?? false,
        IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE ?? false,
        IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE_NEW ?? false,
        IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM ?? false,
        IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM_NEW ?? false,
        IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN ?? false,
        IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN_NEW ?? false,
        IS_INACTIVE: item.IS_INACTIVE ?? false,
        IS_INACTIVE_NEW: item.IS_INACTIVE_NEW ?? false,
        BARCODE: item.BARCODE,
        DESCRIPTION: item.DESCRIPTION,
        DEPT_NAME: item.DEPT_NAME,
        CAT_NAME: item.CAT_NAME,
        BRAND_NAME: item.BRAND_NAME,
        Selected: item.Selected ?? true,
        STORE_ID: item.STORE_ID,
        STORE_NAME: item.STORE_NAME,
      }));
      const payload = {
        WS_DATE: new Date().toISOString(), // dynamic date
        STORE_ID: this.selectedStoreId.toString(),
        USER_ID: this.User_Id,
        COMPANY_ID: this.selected_Company_id,
        NARRATION: this.selectedNarration,
        worksheet_item_property: worksheetdata,
        worksheet_item_store: this.selectedStoreIds.map((storeId: number) => ({
          ID: 0,
          WS_ID: 0,
          STORE_ID: storeId,
        })),
      };
      console.log(payload);
      this.dataservice.saveWorksheetItemPropertyData(payload).subscribe(
        (response: any) => {
          this.savedWorksheet = response;
          this.editedItems = []; // Clear edited items after successful save
          this.selectedRowKeys = [];
          if (response) {
            notify(
              {
                message: 'Worksheet Added Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.dataGrid.instance.refresh();
            this.selecte_grid_Data = [];

            this.router.navigate(['/item-change-property']);
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        },
        (error) => {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        },
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
    // Prepare the verification payload based on the saved worksheet
    const verificationPayload = {
      ID: this.savedWorksheet.ID, // Use appropriate fields from the savedWorksheet
      COMPANY_ID: this.savedWorksheet.COMPANY_ID,
      USER_ID: this.savedWorksheet.USER_ID,
      STORE_ID: this.savedWorksheet.STORE_ID,
      worksheet_item_property: this.editedItems.map((item) => ({
        ID: 0,
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
        this.isVerified = true;
      },
      (error) => {
        // Handle error
        console.error('Verification failed:', error);
      },
    );
  }
  onApprove() {
    const approvePayload = {
      ID: this.savedWorksheet.ID, // Use appropriate fields from the savedWorksheet
      COMPANY_ID: this.savedWorksheet.COMPANY_ID,
      USER_ID: this.savedWorksheet.USER_ID,
      STORE_ID: this.savedWorksheet.STORE_ID,
      worksheet_item_property: this.editedItems.map((item) => ({
        ID: 0,
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
            'success',
          );
          this.router.navigate(['/item-change-property']);
          this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      });
  }

  onPropertiesChange(event: any) {
    this.selectedProperties = event.value;
    this.updateColumnVisibility();
  }


  getStoresById(storeId: any) {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getStoresData(payload).subscribe((response) => {
      this.filteredStores = response.filter(
        (store: any) => store.ID === storeId,
      );
      if (this.filteredStores.length > 0) {
        // this.listItemsByStoreId(storeId);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/item-change-property']);
    this.selectedRowKeys = [];

    this.dataGrid.instance.refresh();
  }
  onDropdownValueChanged(e: any) {
    this.selectedStoreIds = Array.isArray(e?.value) ? e.value : [];
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
export class ItemStorePropertiesModule { }
