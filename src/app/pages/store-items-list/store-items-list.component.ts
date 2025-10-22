import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import {
  StoreItemsComponent,
  StoreItemsModule,
} from '../store-items/store-items.component';
import { DxoPopupModule } from 'devextreme-angular/ui/nested';
import { AuthService, DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { StoreItemsAddFormModule } from '../store-items-add-form/store-items-add-form.component';

@Component({
  selector: 'app-store-items-list',
  templateUrl: './store-items-list.component.html',
  styleUrls: ['./store-items-list.component.scss'],
})
export class StoreItemsListComponent {
  @ViewChild(StoreItemsComponent) StoreItemsComponent: StoreItemsComponent;
  // @ViewChild(DxDataGridComponent, { static: true })
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @Output()
  editingStart = new EventEmitter<any>();

  isListVisible: boolean = false;
  isPopupVisible: boolean = false;
  addFormPopupVisible: boolean = false;
  items: any;
  itemsList: any;
  store: any[] = [];
  selectedStoreId: number = 1;
  popupTitle: string = 'Item Details';
  selectedData: any = {};
  storeName: any;
  department: any;
  catagory: any;
  brand: any;
  supplier: any;
  departmentOptions: any;
  storeList: any;
  filteredStores: any;
  isDefaultStore: boolean = true;
  itemsByStore: any;
  allItems: any;
  allItemsList: any;
  totalRowCount: any;
  filteredStoreList: any[];
  filteredStoreId: any;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    dataservice.getDropdownData('STORE').subscribe((data) => {
      this.store = data;
    });
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
      console.log(this.brand, 'BRAND');
    });
    dataservice.getDropdownData('SUPPLIER').subscribe((data) => {
      this.supplier = data;
    });
  }

  ngOnInit() {
    this.loadStores();
    console.log(this.selectedStoreId, 'NAME');
    this.getStoresById(this.selectedStoreId);
    // if (this.selectedData && this.selectedData.ID) {
    this.getSelectedItemsData(this.selectedData);

    // }
    this.getDepartment();
  }

  getDepartment() {
    this.dataservice.getDepartmentData().subscribe(
      (response: any) => {
        this.departmentOptions = response.map((item: any) => ({
          ...item,
          selected: false, // Initialize a 'selected' property for each item
        }));
      },
      (error) => {
        console.error('Error fetching departments:', error);
      }
    );
  }

  listAllItems() {
    const payload = {};
    this.dataservice.getItemsData().subscribe(
      (items: any) => {
        this.allItems = items.data;
        this.allItemsList = this.allItems;

        console.log(this.itemsList, 'ITEMLIST');
        this.totalRowCount = this.allItems.length;
      },
      (error) => {
        console.error('Error fetching items:', error);
      }
    );
  }

  refreshItems() {
    if (this.selectedData && this.selectedData.ID) {
      this.getSelectedItemsData(this.selectedData);
    }
  }

  openPopup() {
    this.isPopupVisible = true;
    this.cdr.detectChanges();
  }

  openAddFormPopup() {
    console.log('hi');
    this.addFormPopupVisible = true;
    this.cdr.detectChanges();
  }

  closePopup() {
    this.isPopupVisible = false;
    this.cdr.detectChanges();
  }

  closeAddFormPopup() {
    this.addFormPopupVisible = false;
    this.cdr.detectChanges();
  }

  onDropdownValueChanged(event: any) {
    const storeId = event.value; // Get the selected store ID
    console.log(storeId, 'SELECTED STORE ID');

    // Call the function to filter the stores by the same ID
    this.getStoresById(storeId);
  }

  // Step 2: Function to filter stores by the same storeId
  getStoresById(storeId: any) {
    this.dataservice.getStoresData().subscribe((response) => {
      console.log(response, '=====================');
      this.filteredStores = response.filter(
        (store: any) => store.ID === storeId
      ); // Filter stores by ID
      console.log(this.filteredStores, 'FILTERED STORES WITH SAME ID');
      if (this.filteredStores && this.filteredStores.length > 0) {
        this.filteredStores.forEach((store: any) => {
          console.log('Filtered Store ID:', store.ID);
        });
        this.filteredStoreId = this.filteredStores[0].ID;
        this.listItemsByStoreId(storeId);
      } else {
        console.log('No stores found with this ID');
      }
    });
  }

  loadStores() {
    this.dataservice.getStoresData().subscribe((response) => {
      this.store = response;
      console.log(this.store, '=========');
      // Filter out the default store (ID = 1) from the dropdown list
      this.filteredStoreList = this.store.filter((store) => store.ID !== 1);

      console.log(this.filteredStoreList, 'FILTERED STORE LIST');
    });
  }

  listItemsByStoreId(storeId: number) {
    if (storeId == 1) {
      const payload = {};
      this.dataservice.getItemsData().subscribe((response: any) => {
        this.items = response;
        this.itemsList = response.data;
      });
    } else {
      this.dataservice.getItemsByStoreId(storeId).subscribe(
        (response: any) => {
          this.items = response;
          this.itemsList = response.data;
          console.log(this.itemsList, 'ITEMLIST');
          this.dataGrid.instance.refresh();
          // this.filterItems();
        },
        (error) => {
          console.error('Error fetching items:', error);
        }
      );
    }
  }

  onDetailsButtonClick = (e: any) => {
    e.event.stopPropagation();
    this.openPopup();
    this.getSelectedItemsData(e.row.data.ID);
  };

  onPopupHiding() {
    this.refreshDataGrid();
    this.isPopupVisible = false;
  }

  getSelectedItemsData(data: any): void {
    if (data) {
      this.dataservice.selectItems(data).subscribe((response: any) => {
        this.selectedData = response;
      });
    } else {
      console.warn('No valid data ID provided:', data);
    }
  }

  handleFormClosed() {
    this.addFormPopupVisible = false;
    this.dataGrid.instance.refresh();
    this.refreshDataGrid();
  }
  refreshDataGrid() {
    if (this.selectedStoreId) {
      // Call the method to fetch items by store ID
      this.listItemsByStoreId(this.selectedStoreId);
    }
  }

  updateItems(newItems: any[]) {
    this.items = newItems;
  }

  // Add this method to handle added items from the AddFormComponent
  onItemAdded(item: any) {
    this.itemsList.push(item); // Push the new item into the storeList array
  }

  addItems() {}
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    StoreItemsModule,
    DxPopupModule,
    DxSelectBoxModule,
    StoreItemsAddFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [StoreItemsListComponent],
  bootstrap: [StoreItemsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StoreItemsListModule {}
