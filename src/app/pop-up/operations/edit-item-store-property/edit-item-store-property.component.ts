import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
  Input,
  NgModule,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
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
  DxBoxModule,
  DxDataGridComponent,
  DxValidationGroupComponent,
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
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-item-store-property',
  templateUrl: './edit-item-store-property.component.html',
  styleUrls: ['./edit-item-store-property.component.scss'],
})
export class EditItemStorePropertyComponent implements OnInit, OnChanges {
  @Input() selectedData: any = {};
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('dataGrid') dataGrid!: any;

  // Grid data
  items: any;
  itemsList: any;
  isListVisible: boolean = false;
  isPopupVisible: boolean = false;
  store: any[] = [];
  selectedStoreId: any = null;
  department: any;
  catagory: any;
  brand: any;
  filteredStores: any;
  showHeaderFilter = true;
  storeProperties: any[] = [];
  selectedProperties: any[] = [];
  gridWidth: string = '100%';
  showNewGrid: boolean = false;

  // Column visibility flags
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
  selectedRowId: any;
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
  itemStoresList: any[] = [];
  savedWorksheet: any;
  selectedItems: any[] = [];
  isSaved: boolean = false;
  AllowCommitWithSave: any;
  isVerified: boolean = false;
  selected_Company_id: any;
  private previousDataKey: string = '';
  selectedGridData: any;
  updatedRows: any[] = [];
  selectedId: any;

  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.sesstion_Details();
  }

  ngOnInit() {
    this.loadStore();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const newData = changes['selectedData'].currentValue;
      const newDataKey = newData?.ID || JSON.stringify(newData);
      this.selectedStoreId = newData.STORE_ID || this.selectedStoreId;
      this.selectedId = newData.ID || this.selectedId;

      if (
        newData &&
        newDataKey !== this.previousDataKey &&
        newData.worksheet_item_property
      ) {
        console.log('Processing new worksheet data:', newData);
        this.processWorksheetData(newData);
        this.previousDataKey = newDataKey;
      }
    }
  }

  private processWorksheetData(data: any) {
    if (!data?.worksheet_item_property) return;

    // Clear existing data
    this.itemStoresList = [];
    this.selectedRowKeys = [];

    // Remove duplicates using ITEM_ID
    const uniqueItems = new Map();
    data.worksheet_item_property.forEach((item: any) => {
      if (!uniqueItems.has(item.ITEM_ID)) {
        uniqueItems.set(item.ITEM_ID, {
          ...item,
          IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM ?? false,
          IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN ?? false,
          IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE ?? false,
          IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED ?? false,
          IS_INACTIVE: item.IS_INACTIVE ?? false,
          IS_NOT_SALE_ITEM_NEW:
            item.IS_NOT_SALE_ITEM_NEW ?? item.IS_NOT_SALE_ITEM ?? false,
          IS_NOT_SALE_RETURN_NEW:
            item.IS_NOT_SALE_RETURN_NEW ?? item.IS_NOT_SALE_RETURN ?? false,
          IS_NOT_DISCOUNTABLE_NEW:
            item.IS_NOT_DISCOUNTABLE_NEW ?? item.IS_NOT_DISCOUNTABLE ?? false,
          IS_PRICE_REQUIRED_NEW:
            item.IS_PRICE_REQUIRED_NEW ?? item.IS_PRICE_REQUIRED ?? false,
          IS_INACTIVE_NEW: item.IS_INACTIVE_NEW ?? item.IS_INACTIVE ?? false,
        });
      }
    });

    this.itemStoresList = Array.from(uniqueItems.values());

    // Set selected rows
    this.selectedRowKeys = this.itemStoresList
      .filter((x: any) => x.Selected === true)
      .map((x: any) => x.ITEM_ID);

    // Extract store properties
    if (this.itemStoresList.length > 0 && this.itemStoresList[0].STORE_ID) {
      this.selectedStoreId = this.itemStoresList[0].STORE_ID;
      this.extractStoreProperties(this.itemStoresList[0]);
    }

    // Refresh grid
    setTimeout(() => {
      if (this.dataGrid?.instance) {
        this.dataGrid.instance.refresh();
        if (this.selectedRowKeys.length > 0) {
          this.dataGrid.instance.selectRows(this.selectedRowKeys, true);
        }
      }
      this.cdr.detectChanges();
    }, 100);
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
  }

  loadStore() {
    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataservice.getStoresData(payload).subscribe((response: any) => {
      this.store = response;
    });
  }

  onDropdownValueChanged(event: any) {
    this.storeId = event.value;
    if (!this.storeId || this.storeId === null) {
      this.selectedStoreId = null;
      this.itemStoresList = [];
    } else {
      this.selectedStoreId = this.storeId;
      this.getStoresById(this.storeId);
      this.extractStoreProperties(this.storeId);
    }
  }

  getStoresById(storeId: any) {
    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataservice.getStoresData(payload).subscribe((response: any) => {
      this.filteredStores = response.filter(
        (store: any) => store.ID === storeId,
      );
    });
  }

  extractStorePropertiesFromStoreId(storeId: any) {
    const selectedStore = this.store.find((s: any) => s.ID === storeId);
    if (selectedStore) {
      this.extractStoreProperties(selectedStore);
    }
  }

  extractStoreProperties(storeData: any) {
    if (!storeData) return;

    this.storeProperties = [];
    this.selectedProperties = [];

    const properties = [
      { name: 'Inactive', value: storeData.IS_INACTIVE },
      { name: 'Not Discountable', value: storeData.IS_NOT_DISCOUNTABLE },
      { name: 'Not Sale Item', value: storeData.IS_NOT_SALE_ITEM },
      { name: 'Not Sale Return', value: storeData.IS_NOT_SALE_RETURN },
      { name: 'Price Required', value: storeData.IS_PRICE_REQUIRED },
    ];

    properties.forEach((property) => {
      if (property.value !== null && property.value !== undefined) {
        this.storeProperties.push(property);
        if (property.value === true) {
          this.selectedProperties.push(property.name);
        }
      }
    });

    this.updateColumnVisibility();
  }

  onPropertiesChange(event: any) {
    this.selectedProperties = event.value;
    this.updateColumnVisibility();
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

  onInactiveValueChanged(e: any) {
    console.log('Inactive value changed:', e);
  }

  onPriceRequiredValueChanged(e: any) {
    console.log('Price Required value changed:', e);
  }

  onNotDisountableValueChanged(e: any) {
    console.log('Not Discountable value changed:', e);
  }

  onSaleReturnValueChanged(e: any) {
    console.log('Sale Return value changed:', e);
  }

  onSaleItemValueChanged(e: any) {
    console.log('Sale Item value changed:', e);
  }

  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value); // ✅ update grid

        const row = e.row.data;

        // 🔥 update main array
        const index = this.itemStoresList.findIndex(
          (x) => x.ITEM_ID === row.ITEM_ID,
        );

        if (index > -1) {
          this.itemStoresList[index][e.dataField] = args.value;
        }

        // 🔥 store updated row separately
        let existing = this.updatedRows.find((x) => x.ITEM_ID === row.ITEM_ID);

        if (!existing) {
          existing = { ...row }; // full row copy
          this.updatedRows.push(existing);
        }

        // update changed field
        existing[e.dataField] = args.value;

        console.log('Updated Row:', existing);
        console.log('All Updated Rows:', this.updatedRows);
      };
    }
  }

  onSelectionChanged(event: any) {
    this.selectedRowKeys = event.selectedRowKeys;
    console.log('Selection changed:', this.selectedRowKeys);

    console.log('Selected Row event:', event);

    this.selectedGridData = event.selectedRowsData;

    // Update Selected property in data source
    if (this.itemStoresList) {
      this.itemStoresList.forEach((item: any) => {
        item.Selected = this.selectedRowKeys.includes(item.ITEM_ID);
      });
    }
  }

  onSaveButtonClick() {
    const worksheetItemProperty = this.updatedRows.filter((item) =>
      this.selectedRowKeys.includes(item.ITEM_ID),
    );
    console.log('Worksheet Item Property to Save:', worksheetItemProperty);
    const payload = {
      ID: this.selectedId,
      WS_NO: '',
      WS_DATE: new Date().toISOString(),
      STORE_ID: this.selectedStoreId.toString(),
      USER_ID: this.userId || 0,
      COMPANY_ID: this.selected_Company_id || 0,
      NARRATION: '',
      worksheet_item_property: worksheetItemProperty
        ? worksheetItemProperty
        : this.selectedData.worksheet_item_property,
    };
    // Collect changed data
    // console.log('FINAL DATA:', finalData);
    this.dataservice.updateworksheetItemProperty(payload).subscribe(
      (response: any) => {
        if (response) {
          this.isSaved = true;
          notify('Data saved successfully', 'success', 2000);
        }
      },
      (error: any) => {
        console.error('Save error:', error);
        notify('Error saving data', 'error', 2000);
      },
    );
  }

  onVerify() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      USER_ID: sessionStorage.getItem('UserId'),
      STORE_ID: this.selectedStoreId,
      worksheet_item_property: this.itemStoresList.map((item: any) => ({
        ITEM_ID: item.ITEM_ID,
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

    this.dataservice.verifyItemStoreProperties(payload).subscribe(
      (response: any) => {
        if (response) {
          this.isVerified = true;
          notify('Data verified successfully', 'success', 2000);
        }
      },
      (error: any) => {
        console.error('Verify error:', error);
        notify('Error verifying data', 'error', 2000);
      },
    );
  }

  onApprove() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      USER_ID: sessionStorage.getItem('UserId'),
      STORE_ID: this.selectedStoreId,
      worksheet_item_property: this.itemStoresList.map((item: any) => ({
        ITEM_ID: item.ITEM_ID,
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

    this.dataservice.approveworksheetItemProperty(payload).subscribe(
      (response: any) => {
        if (response) {
          notify('Data approved successfully', 'success', 2000);
          this.popupClosed.emit();
        }
      },
      (error: any) => {
        console.error('Approve error:', error);
        notify('Error approving data', 'error', 2000);
      },
    );
  }

  onCancel() {
    this.popupClosed.emit();
  }

  handleClose() {
    this.popupClosed.emit();
  }

  listStoreItemProperty() {
    this.dataservice.getStoreItemPropertyList().subscribe((response: any) => {
      this.itemStoresList = response.data;
    });
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
    DxToolbarModule,
    DxiItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxBoxModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [EditItemStorePropertyComponent],
  exports: [EditItemStorePropertyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditItemStorePropertyModule {}
