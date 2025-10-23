import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { ValueChangedEvent } from 'devextreme/ui/tag_box';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-store-items-add-form',
  templateUrl: './store-items-add-form.component.html',
  styleUrls: ['./store-items-add-form.component.scss'],
})
export class StoreItemsAddFormComponent {
  @Input() storeId: number;
  @Input() filteredStores: any;
  @Input() defaultStore: boolean = false;
  @Input() itemsList: any;
  @Output() itemAdded = new EventEmitter<void>();
  @Output() storeDataUpdated = new EventEmitter<{
    storeIds: number[];
    items: any[];
  }>();
  @Output() formClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  selectedRadioValue: string = '';
  departmentOptions: any;
  categoryOptions: any;
  brandOptions: any;
  supplierOptions: any;
  allDepartmentsSelected: boolean = false;
  allCategorySelected: boolean = false;
  allBrandSelected: boolean = false;
  allSupplierSelected: boolean = false;
  // itemsList: any;
  showItemsList = false;
  isPopupVisible = false;
  department: any;
  items: any;
  catagory: any;
  brand: any;
  supplier: any;
  selectedItems: any[] = [];
  store: any;
  selectedStoreIds: number[] = [];
  selectedStores: any;
  selectAllItems: any;
  selectedDepartmentId: number[] = [];
  selectedCategoryId: number[] = [];
  selectedBrandId: number[] = [];
  selectedSupplierId: number[] = [];
  allItems: any;
  filteredItemsList: any[] = [];
  category: any;
  isCurrentFormVisible = true;
  itemStoreAssociations: { [itemId: number]: number[] } = {};
  stores: any;
  selectedStoreNames: string[] = [];
  showHeaderFilter = true;
  selectedRowCount: number = 0;
  totalRowCount: number = 0;
  filteredRowCount: number = 0;
  gridData: any;
  selectedRowKeys: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  allStores: any[] = [];
  itemsByStore: any;
  allItemsList: any;
  selectedStoreId: any;
  filteredStoreIds: any;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.listItems();
    this.getStore();
    this.selectedStores = [this.storeId];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedStores = this.storeId;
    this.listItems();
    // this.listItemsByStore(this.storeId)
    if (this.selectedStores == 1) {
      this.listItemsByStore(this.storeId);
    } else {
      // If storeId is 1, display all items
      this.filteredItemsList = this.allItems;
    }
    if (changes.filteredStores && changes.filteredStores.currentValue) {
      this.filteredStoreIds = this.filteredStores.map((store) => store.ID);
      if (this.storeId === 1) {
        this.filteredItemsList = this.allItems;
      }

      const hasDefaultStore = this.filteredStores.some(
        (store) => store.IS_DEFAULT_STORE
      );
      console.log(hasDefaultStore, 'HASDEFAULTSTORE');
      if (hasDefaultStore) {
        this.filteredItemsList = this.allItemsList;
        this.getStore();
      } else {
        this.store = this.filteredStores;
        this.selectedStoreId = this.filteredStores.map(
          (store: any) => store.ID
        );
        this.cdr.detectChanges();
      }
    }
  }

  // getStore() {
  //   this.dataservice.getStoresData().subscribe((response) => {
  //     this.store = response;
  //     console.log(this.store, 'STORESLIST');
  //   });
  // }
  getStore() {
    this.dataservice.getStoresData().subscribe((response) => {
      // Filter the stores to exclude the store with ID 1
      this.store = response.filter((store: any) => store.ID !== 1);

      // Log the filtered stores list
      console.log(this.store, 'STORESLIST (excluding store with ID 1)');
    });
  }

  onRefreshButtonClick() {
    this.refreshItems();
  }
  refreshItems() {
    this.listItems();
    this.selectedRowKeys = null;
    this.selectedStores = null;
  }

  closeForm() {
    this.formClosed.emit();
    this.selectedRowKeys = null;
    this.selectedStores = null;
  }

  listItems() {
    const payload = {};
    this.dataservice.getItemsData().subscribe(
      (items: any) => {
        if (this.filteredStores.IS_DEFAULT_STORE == true) {
          this.filteredItemsList = this.allItems;
        }
        this.allItems = items.data;
        this.allItemsList = this.allItems;
        this.filterItems();
        this.totalRowCount = this.allItems.length;
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }

  filterItems() {
    if (this.itemsList && this.allItems) {
      // Log the filteredStores array
      console.log(
        this.filteredStores,
        'FILTEREDSTORESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS'
      );

      // Check if any store has IS_DEFAULT_STORE set to true
      const isDefaultStore = this.filteredStores.some(
        (store) => store.IS_DEFAULT_STORE
      );

      if (isDefaultStore) {
        // If there's a store with IS_DEFAULT_STORE true, set filteredItemsList to allItems
        this.filteredItemsList = this.allItems;
        console.log(
          'IS_DEFAULT_STORE is true for at least one store. Showing all items.'
        );
      } else {
        // Filter items based on itemsList if no store with IS_DEFAULT_STORE true
        this.filteredItemsList = this.allItems.filter(
          (item) =>
            !this.itemsList.some((excludeItem) => excludeItem.ID === item.ID)
        );
        console.log('Filtering items based on itemsList.');
      }

      this.filteredRowCount = this.filteredItemsList.length;
    }
  }

  listItemsByStore(storeId: number) {
    console.log(`Fetching items for store ID: ${storeId}`);
    this.dataservice.getItemsByStoreId(storeId).subscribe(
      (response: any) => {
        console.log('Response received:', response);
        this.itemsByStore = response.data;
        console.log(this.itemsByStore, 'ITEMS BY STORE');
      },
      (error) => {
        console.error('Error fetching items by store ID:', error);
      }
    );
  }

  onItemSelectionChanged(e: any) {
    this.selectedRowCount = e.selectedRowKeys.length;
    const selectedItems = e.selectedRowsData;
    this.totalRowCount = this.allItems.length;
    console.log(this.totalRowCount, 'total row count');
    this.selectedRowCount = e.selectedRowKeys.length || 0;
    this.selectedItems = e.selectedRowsData;
  }

  onStoreSelectionChanged(e: any) {
    this.selectedStores = e.selectedRowsData;
    this.selectedStoreIds = this.selectedStores.map((store: any) => store.ID);
    if (this.selectedStoreIds.length > 0) {
      this.selectedStoreId = this.selectedStoreIds[0];
    }
  }

  saveItemsToStore() {
    if (this.store.ID == 1) {
      this.confirmMove();
    } else {
      console.log(this.selectedStoreId, 'IN SAVE FUNCTION');
      console.log(this.filteredStores, 'S STORES');
      if (this.selectedItems.length > 0 && this.filteredStores.length > 0) {
        this.filteredStores.forEach((store) => {
          this.selectedItems.forEach((item) => {
            const payload = {
              ITEM_ID: item.ID,
              STORE_ID: this.selectedStoreId,
              STORE_SALE_PRICE: store.SALE_PRICE,
              STORE_SALE_PRICE1: store.SALE_PRICE1,
              STORE_SALE_PRICE2: store.SALE_PRICE2,
              STORE_SALE_PRICE3: store.SALE_PRICE3,
              STORE_SALE_PRICE4: store.SALE_PRICE4,
              STORE_SALE_PRICE5: store.SALE_PRICE5,
              COST: store.COST || item.COST,
              STORE_IS_INACTIVE: store.IS_INACTIVE,
              STORE_IS_NOT_SALE_ITEM: store.IS_NOT_SALE_ITEM,
              STORE_IS_NOT_SALE_RETURN: store.IS_NOT_SALE_RETURN,
              STORE_IS_PRICE_REQUIRED: store.IS_PRICE_REQUIRED,
              STORE_IS_NOT_DISCOUNTABLE: store.IS_NOT_DISCOUNTABLE,
            };

            this.dataservice.pushItemToStore(payload).subscribe(
              (response) => {
                try {
                  notify(
                    {
                      message: 'Item is added successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success'
                  );
                } catch {}
                console.log('Data inserted successfully', response);
                this.closeForm();
                this.filteredItemsList;
                this.refreshDataGrid();
                this.dataGrid.instance.refresh();
              },
              (error) => {
                console.error('Error inserting data', error);
              }
            );
          });
        });
        this.isPopupVisible = false;
      }
    }
  }

  confirmMove(): void {
    console.log(this.selectedStoreId, 'NIBIN');
    if (this.selectedItems.length > 0 && this.selectedStores.length > 0) {
      this.selectedStores.forEach((store) => {
        this.selectedItems.forEach((item) => {
          const payload = {
            ITEM_ID: item.ID,
            STORE_ID: this.selectedStoreId,
            STORE_SALE_PRICE: store.SALE_PRICE,
            STORE_SALE_PRICE1: store.SALE_PRICE1,
            STORE_SALE_PRICE2: store.SALE_PRICE2,
            STORE_SALE_PRICE3: store.SALE_PRICE3,
            STORE_SALE_PRICE4: store.SALE_PRICE4,
            STORE_SALE_PRICE5: store.SALE_PRICE5,
            COST: store.COST || item.COST,
            STORE_IS_INACTIVE: store.IS_INACTIVE,
            STORE_IS_NOT_SALE_ITEM: store.IS_NOT_SALE_ITEM,
            STORE_IS_NOT_SALE_RETURN: store.IS_NOT_SALE_RETURN,
            STORE_IS_PRICE_REQUIRED: store.IS_PRICE_REQUIRED,
            STORE_IS_NOT_DISCOUNTABLE: store.IS_NOT_DISCOUNTABLE,
          };

          this.dataservice.pushItemToStore(payload).subscribe(
            (response) => {
              try {
                notify(
                  {
                    message: 'Item is added successfully',
                    position: { at: 'top right', my: 'top right' },
                  },
                  'success'
                );
                this.dataGrid.instance.refresh();
                this.refreshDataGrid();
                this.onRefreshButtonClick();
              } catch {}
              console.log('Data inserted successfully', response);
              this.closeForm();
            },
            (error) => {
              console.error('Error inserting data', error);
            }
          );
        });
      });
      this.isPopupVisible = false;
    } else {
      console.warn('Please select items and stores.');
    }
  }

  refreshDataGrid() {
    this.listItemsByStore(this.storeId);
  }
  openPopup(): void {
    this.isPopupVisible = true;
  }

  prepareStoreData(): void {
    this.store.forEach((s) => {
      s.isSelected = this.selectedItems.some((item) => item.storeId === s.ID);
    });
  }

  cancelMove() {
    this.isPopupVisible = false;
  }

  close() {
    this.isPopupVisible = false; // Hide the popup

    console.log('Close button clicked');
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
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
  ],
  providers: [],
  exports: [StoreItemsAddFormComponent],
  declarations: [StoreItemsAddFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StoreItemsAddFormModule {}
