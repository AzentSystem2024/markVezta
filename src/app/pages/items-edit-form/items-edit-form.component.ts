import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  NgModule,
  OnInit,
  SimpleChanges,
  ViewChild,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import {
  ItemsFormComponent,
  ItemsFormModule,
} from 'src/app/components/library/items-form/items-form.component';
import { AuthService, DataService } from 'src/app/services';
import { CountryServiceService } from 'src/app/services/country-service.service';
import {
  ItemsListComponent,
  ItemsListModule,
} from '../MASTER/items-list/items-list.component';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import { BrowserModule } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';
import { isNullOrEmptyString } from '@devexpress/analytics-core/analytics-internal';

@Component({
  selector: 'app-items-edit-form',
  templateUrl: './items-edit-form.component.html',
  styleUrls: ['./items-edit-form.component.scss'],
})
export class ItemsEditFormComponent implements OnInit {
  @Input() itemData: any;
  @Output() formClosed: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(ItemsFormComponent) itemsComponent: ItemsFormComponent;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @Input() width = 480;
  @ViewChild('validationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  selectedParentItemId: any;
  selectedParentItemDescription: any;
  ENABLE_Matrix_Code: boolean = false;
  edit_Suplier: any;
  Edit_Store: any;
  selected_Company_id: any;
  companyId: any;
  selectedStoresMap: any;

  get buttonContainerHtml() {
    return `
      <div class="button-container1">
        <dx-button text="Save" type="default" (onClick)="onSave()"></dx-button>
        <dx-button text="Cancel" type="normal" (onClick)="onCancel()"></dx-button>
      </div>
    `;
  }
  toolbarItems = [
    {
      widget: 'dxButton',
      toolbar: 'bottom',
      location: 'after',
      options: {
        text: 'Save',
        type: 'default',
        stylingMode: 'contained',
        onClick: this.saveItem.bind(this),
      },
    },
    {
      widget: 'dxButton',
      toolbar: 'bottom',
      location: 'after',
      options: {
        text: 'Cancel',
        type: 'normal',
        onClick: this.cancelPopup.bind(this),
      },
    },
  ];
  previouslySelectedStoreIDs: any[] = [];
  // checkedStoreIDs: string[] = [];
  components: any[] = [];
  selectedItemId: any = null;
  gridColumns: any[] = [];

  selectedUom: any;
  isLoading: boolean;
  itemsList: any;
  selectedItem: any;
  newItemList: any;
  selectedItemCode: any;
  selectedId: any;
  gridData: any[] = [];

  popupVisible: boolean = true;
  imageSource: string = ''; // To display the uploaded image
  isDropZoneActive: boolean = false;
  textVisible: boolean = true; // Controls the visibility of text instructions
  progressVisible: boolean = false; // Controls the visibility of progress bar
  progressValue: number = 0;
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  imageUploaded: boolean = false;
  uploadUrl: string = '';
  completeFetchedData: any = {};

  selectedFile: File = null;

  url: any;
  items: any[] = [];
  store: any;
  currencydata: any;
  CURRENCY: any;
  itemtype: any;
  country: any;
  parentitem: any;
  catagory: any;
  uom: any;
  department: any;
  subcatagory: any;
  brand: any;
  vat: any;
  supplier: any;
  datasource: any = [];
  Aliasdatasource: any = [];
  uploadedImage = false;
  price: any = '';
  cost: any = '';
  selectedStorePriceLevel1: any = '';
  selectedStorePriceLevel2: any = '';
  selectedStorePriceLevel3: any = '';
  selectedStorePriceLevel4: any = '';
  selectedStorePriceLevel5: any = '';
  primarycheckbox: boolean = false;
  consignment: boolean = false;
  showCheckbox: boolean = true;
  showSupplier: any = false;
  showSuppliers: boolean = true;
  showSupplierTab: boolean = true;
  isParentItemSelected: boolean = false;
  itemlabel1: any;
  itemlabel2: any;
  itemlabel3: any;
  itemlabel4: any;
  itemlabel5: any;
  itemprop1: any;
  itemprop2: any;
  itemprop3: any;
  itemprop4: any;
  itemprop5: any;
  suppliergridData: any[] = [];
  POSDescription: any = '';
  COSTING_METHOD: any = '';
  countryFlag: any[] = [];
  countries: any[];
  selectedPriority: any = 1;
  public costingMethodOptions: any[] = [];
  packing: any[] = [];

  item_alias: any[] = [
    {
      ALIAS: '',
      ALIAS_TYPE_ID: this.selectedPriority,
    },
  ];

  ITEM_ALIAS: any[] = [{ ALIAS: '', ALIAS_TYPE_ID: this.selectedPriority }];
  item_stores: any[] = [];
  item_suppliers: any[] = [];
  combinedStores: any[] = [];
  // selectedRowKeys: number[] = [];
  selectedRowData: any;

  existingItems: any = {};
  // selectedItem: any;
  selectedData: any = {};
  selectedItemData: any = {};
  // itemsList: any;
  newAliasArray: any[] = [];
  newAlias: any;
  selectedRowKeys: number[] = [];
  checkedStoreIDs: number[] = [];
  salePrice: any;

  formItemsData: any = {
    ID: '',
    ITEM_CODE: '',
    BARCODE: '',
    IMAGE_NAME: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    TYPE_ID: null,
    DEPT_ID: '',
    CAT_ID: '',
    SUBCAT_ID: '',
    BRAND_ID: '',
    ITEM_PROPERTY1: '',
    ITEM_PROPERTY2: '',
    ITEM_PROPERTY3: '',
    MATRIX_CODE: '',
    ITEM_PROPERTY4: '',
    ITEM_PROPERTY5: '',
    VAT_CLASS_ID: null,
    UNIT_ID: isNullOrEmptyString,
    PACKING_ID: '',
    LONG_DESCRIPTION: '',
    SALE_PRICE: '',
    COST: 0,
    PROFIT_MARGIN: '',
    SALE_PRICE1: '',
    SALE_PRICE2: '',
    SALE_PRICE3: '',
    SALE_PRICE4: '',
    SALE_PRICE5: '',
    QTY_STOCK: '',
    QTY_COMMITTED: '',
    CREATED_DATE: '',
    LAST_PO_DATE: '',
    LAST_GRN_DATE: '',
    LAST_SALE_DATE: '',
    RESTOCK_LEVEL: '',
    REORDER_POINT: '',
    PARENT_ITEM_ID: '',
    CHILD_QTY: '',
    ORIGIN_COUNTRY: '',
    BIN_LOCATION: '',
    SHELF_LIFE: '',
    NOTES: '',
    IS_INACTIVE: '',
    IS_PRICE_REQUIRED: false,
    IS_NOT_DISCOUNTABLE: false,
    IS_NOT_PURCH_ITEM: false,
    IS_NOT_SALE_ITEM: false,
    IS_CONSIGNMENT: false,
    IS_NOT_SALE_RETURN: false,
    COSTING_METHOD: '',
    POS_DESCRIPTION: '',
    IS_DIFFERENT_UOM_PURCH: false,
    UOM_PURCH: '',
    UOM_MULTPLE: '',
    ITEM_STORES: [
      {
        ID: 0,
        STORE_ID: '',
        SALE_PRICE: '',
        SALE_PRICE1: '',
        SALE_PRICE2: '',
        SALE_PRICE3: '',
        SALE_PRICE4: '',
        SALE_PRICE5: '',
        STORE_CODE: '',
        STORE_NAME: '',
        COST: '',
        IS_INACTIVE: false,
        IS_NOT_SALE_ITEM: false,
        IS_NOT_SALE_RETURN: false,
        IS_PRICE_REQUIRED: false,
        IS_NOT_DISCOUNTABLE: false,
        LAST_MODIFIED_DATE: '',
        QTY_AVAILABLE: '',
        IS_SELECTED: false,
      },
    ],
    ITEM_ALIAS: [
      {
        ALIAS: '',
        ALIAS_TYPE_ID: this.selectedPriority,
      },
    ],
    ITEM_SUPPLIERS: [
      {
        SUPP_ID: '',
        REORDER_NO: '',
        COST: '',
        IS_PRIMARY: false,
        IS_CONSIGNMENT: false,
        CURRENCY: '',
      },
    ],
    ITEM_COMPONENTS: [
      {
        COMPONENT_ITEM_ID: '',
        QUANTITY: '',
        UOM: '',
      },
    ],
  };

  newItems = this.formItemsData;

  selectedStoreIds: any[] = [];
  formData = {
    COMPONENT_ITEM_ID: '',
    ITEM_CODE: '',
    DESCRIPTION: '',
    UOM: '',
    QUANTITY: null,
  };
  selectedStores: any;
  selectedRows: any;
  itemStores: any;
  isPopupVisible: boolean;
  showComponentTab: boolean;
  itemComponents: any[] = [];
  filteredDropdownOptions = [];
  filteredUOM: any;
  filteredUOMs: any;
  sessionData: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  isParentItemDropdownOpen: boolean;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private countryFlagService: CountryServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.selectedPriority = 1;
    this.onDropZoneEnter = this.onDropZoneEnter.bind(this);
    this.onDropZoneLeave = this.onDropZoneLeave.bind(this);
    this.onUploaded = this.onUploaded.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onUploadStarted = this.onUploadStarted.bind(this);
    this.itemlabel1 = authservice.getsettingsData().ITEM_PROPERTY1;
    this.itemlabel2 = authservice.getsettingsData().ITEM_PROPERTY2;
    this.itemlabel3 = authservice.getsettingsData().ITEM_PROPERTY3;
    this.itemlabel4 = authservice.getsettingsData().ITEM_PROPERTY4;
    this.itemlabel5 = authservice.getsettingsData().ITEM_PROPERTY5;
    const parentItemPayload = {
      COMPANY_ID: 0,
      NAME: 'PARENTITEM',
    };
    dataservice.getDropdownData(parentItemPayload).subscribe((data) => {
      this.parentitem = data;
    });
    const payload1 = {
      // COMPANY_ID: this.selected_Company_id,
      COMPANY_ID: 0,
      NAME: 'ITEMTYPE',
    };
    dataservice.getDropdownData(payload1).subscribe((data) => {
      this.itemtype = data;
    });
    const brand = {
      NAME: 'BRAND',
    };
    dataservice.getDropdownData(brand).subscribe((data) => {
      this.brand = data;
    });
    dataservice.getDropdownData('COUNTRY').subscribe((data) => {
      this.country = data;
    });
    const store = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'STORE',
    };
    dataservice.getDropdownData(store).subscribe((data) => {
      this.store = data;
      console.log(this.store);
      this.bindStoreData(); // ✅ call here also
    });
    const itemProp1Payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getItemProperty1Data(itemProp1Payload).subscribe((data) => {
      this.itemprop1 = data;
    });
    const itemProp2Payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getItemProperty2Data(itemProp2Payload).subscribe((data) => {
      this.itemprop2 = data;
    });
    const itemProp3Payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getItemProperty3Data(itemProp3Payload).subscribe((data) => {
      this.itemprop3 = data;
    });
    const itemProp4Payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getItemProperty4Data(itemProp4Payload).subscribe((data) => {
      this.itemprop4 = data;
    });
    const itemProp5Payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getItemProperty5Data(itemProp5Payload).subscribe((data) => {
      this.itemprop5 = data;
    });

    // dataservice.getDepartmentData().subscribe((data) => {
    //   this.department = data;
    // });
    const department = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'DEPARTMENT',
    };
    dataservice.getDropdownData(department).subscribe((data) => {
      this.department = data;
    });
    const subcategory = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getSubCategoryData(subcategory).subscribe((data) => {
      this.subcatagory = data;
    });
    // dataservice.getBrandData().subscribe((data) => {
    //   this.brand = data;
    // });
    // const vatClassPayload = {
    //   COMPANY_ID: this.selected_Company_id,
    // };
    // dataservice.getVatclassData(vatClassPayload).subscribe((data) => {
    //   this.vat = data;
    // });
    const Dropdown_ItemTaxPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'VAT_CLASS',
    };
    dataservice.Dropdown_ItemTax(Dropdown_ItemTaxPayload).subscribe((data) => {
      this.vat = data;
    });
    const payload = { COMPANY_ID: this.selected_Company_id };
    dataservice.getSupplierData(payload).subscribe((data) => {
      this.supplier = data;
    });
    const category = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ITEMCATEGORY',
    };
    dataservice.getDropdownData(category).subscribe((data) => {
      this.catagory = data;
    });

    dataservice.getItemsData().subscribe((data) => {
      this.items = data;
    });
    const costiingmethod = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'COSTINGMETHOD',
    };
    dataservice.getDropdownData(costiingmethod).subscribe((data) => {
      this.costingMethodOptions = data;
    });
    const packing = {
      NAME: 'PACKING',
    };
    dataservice.getDropdownData(packing).subscribe((data) => {
      this.packing = data;
    });
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
    });
  }


  isValid() {
  if (!this.validationGroup || !this.validationGroup.instance) {
    return true; // or false based on your need
  }

  return this.validationGroup.instance.validate().isValid;
}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemData'] && this.itemData) {
      this.salePrice = this.itemData.SALE_PRICE;
      this.formItemsData = this.itemData;
      if (this.itemData.IMAGE_NAME) {
        this.imageSource = this.itemData.IMAGE_NAME; // Set the Base64 string to the imageSource
        this.textVisible = false; // Hide "Upload Image" text
        this.imageUploaded = true; // Mark the image as uploaded
      } else {
        this.imageSource = ''; // No image available
        this.textVisible = true; // Show "Upload Image" text
        this.imageUploaded = false; // Mark as no image uploaded
      }

      if(this.itemData.ITEM_CODE === 0){
        this.itemData.ITEM_CODE = null;
      }

      if (this.itemData.TYPE_ID === 0) {
        this.itemData.TYPE_ID = null;
      }

      if (this.itemData.VAT_CLASS_ID === 0){
        this.itemData.VAT_CLASS_ID = null;
      }

      if(this.itemData.UNIT_ID === 0){
        this.itemData.UNIT_ID = null;
      }

      this.showComponentTab = this.itemData.TYPE_ID === 8; // Show the Component tab if TYPE_ID is 8
      this.showSupplierTab = this.itemData.TYPE_ID !== 8;
      const data = this.uom;
      this.filteredUOM = this.uom;
      this.selectedData = this.itemData.UOM_PURCH;
      if (
        this.itemData.item_components &&
        this.itemData.item_components.length > 0
      ) {
        this.gridData = this.itemData.item_components.map((component: any) => ({
          ITEM_CODE: component.ITEM_CODE, // Map the item code if needed
          DESCRIPTION: component.DESCRIPTION, // Map description if available
          UOM: component.UOM,
          QUANTITY: component.QUANTITY,
        }));
      } else {
        this.gridData = []; // Reset if no components
      }
    }
    if (changes['itemData'] && this.itemData) {
      this.formData = { ...this.itemData };

      this.edit_Suplier = this.itemData.item_suppliers;

      this.Edit_Store = this.itemData.item_stores || [];

      // ✅ selection based on ID
      this.selectedRowKeys = this.Edit_Store.map((x: any) => x.STORE_ID);

      console.log(this.Edit_Store, '===========edit store================');
      console.log(
        this.selectedRowKeys,
        '==================selecte key=================',
      );
      console.log('=========current store====', this.store);
      this.bindStoreData(); // ✅ call here

      console.log(this.store, '=======afte bindg');
    }
    this.sesstion_Details();
  }
  bindStoreData() {
    if (!this.store || !this.Edit_Store) return;

    // 🔹 Merge store + edit data
    this.store = this.store.map((storeItem: any) => {
      const matched = this.Edit_Store.find(
        (x: any) => x.STORE_ID === storeItem.ID,
      );

      return matched ? { ...storeItem, ...matched } : storeItem;
    });

    // 🔹 Set selected keys
    this.selectedRowKeys = [...this.Edit_Store.map((x: any) => x.STORE_ID)];

    // 🔹 Force UI refresh (important)
    this.store = [...this.store];
    this.selectedRowKeys = [...this.selectedRowKeys];
  }
  onPriceChange(event: any) {
    const newPrice = event.value;
    this.salePrice = newPrice;

    this.Edit_Store.forEach((s) => (s.SALE_PRICE = newPrice));
  }

  onCostChange(event: any) {
    const newPrice = event.value;
    this.itemData.COST_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.COST_PRICE = newPrice));
  }
  onProfitmarginChange(event: any) {
    const newPrice = event.value;
    // this.itemData.SALE_PRICE = newPrice;
    // this.Edit_Store.forEach(s => s.SALE_PRICE = newPrice);
  }
  onSalesPrice1Change(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.SALE_PRICE1 = newPrice));
  }
  onSalesPrice2Change(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.SALE_PRICE2 = newPrice));
  }
  onSalesPrice3Change(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.SALE_PRICE3 = newPrice));
  }
  onSalesPrice4Change(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.SALE_PRICE4 = newPrice));
  }
  onSalesPrice5Change(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    this.Edit_Store.forEach((s) => (s.SALE_PRICE5 = newPrice));
  }
  ngOnInit() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyId = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    if (state?.data) {
      this.itemData = state.data;
    }
    this.getUOM();
    this.refreshItems();
    this.showItems();
    this.filteredUom();
    this;
  }
  mapStoreData() {
    this.selectedRowKeys = this.Edit_Store.map((x: any) => x.STORE_ID);

    this.store = this.store.map((storeItem: any) => {
      const matched = this.Edit_Store.find(
        (x: any) => x.STORE_ID === storeItem.ID,
      );

      return matched ? { ...storeItem, ...matched } : storeItem;
    });
  }
  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;

    this.ENABLE_Matrix_Code =
      this.sessionData.GeneralSettings.ENABLE_MATRIX_CODE;
    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
  onRowUpdated(e: any) {}

  onParentItemChanged(event: any) {
    const selectedParentItem = event.selectedRowsData[0]; // Access the first selected item
    if (selectedParentItem) {
      // this.selectedParentItemId = selectedParentItem.ID;
      this.itemData.PARENT_ITEM_ID = selectedParentItem.ID;
      this.selectedParentItemDescription = selectedParentItem.DESCRIPTION;
      this.isParentItemSelected = this.itemData.PARENT_ITEM_ID;
    }
  }

  getUOM() {
    const uom = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'UOM',
    };
    this.dataservice.getDropdownData(uom).subscribe((data) => {
      this.uom = data;
      this.filteredUOMs = this.uom.filter(
        (option) => option.ID !== this.itemData.UNIT_ID,
      );
      this.filterDropdownOptions();
    });
  }

  filteredUom() {
    this.filteredUOM = this.uom.filter(
      (option) => option.ID !== this.itemData.UNIT_ID,
    );
  }

  filterDropdownOptions() {
    this.filteredDropdownOptions = this.uom.filter(
      (option) => option.ID !== this.selectedUom,
    );
  }

  onUOMChange(event: any) {
    this.selectedUom = this.newItems.UNIT_ID;
    this.formItemsData.UOM_PURCH = this.selectedUom;
    this.filterDropdownOptions(); // Filter the options when the selection changes
  }

  onTypeIdChange(event: any): void {
    this.showComponentTab = event.value === 8; // Check if TYPE_ID is 8
  }

  loadItemStores() {
    // Extract STORE_IDs where IS_SELECTED is true
    this.selectedRowKeys = this.itemData.item_stores
      .filter((store) => store.IS_SELECTED) // Filter based on IS_SELECTED
      .map((store) => store.STORE_ID); // Map to STORE_ID

    // Set initial data in the grid
    this.itemStores = this.itemData.item_stores;
  }

  onSelectionChanged(event: any) {
    this.selectedStoreIds = event.selectedRowKeys;
    this.updatePriceLevel(event.selectedRowsData);
  }
  updatePriceLevel(selectedRows: any[]) {
    if (!this.store) return;

    // 🔹 Get selected IDs from grid
    const selectedIds = selectedRows.map((row: any) => row.ID);

    // 🔹 Update store (MAIN SOURCE)
    this.store = this.store.map((row: any) => {
      const isSelected = selectedIds.includes(row.ID);

      if (isSelected) {
        return {
          ...row,
          SALE_PRICE: this.salePrice || '',
          SALE_PRICE1: this.itemData.SALE_PRICE1 || '',
          SALE_PRICE2: this.itemData.SALE_PRICE2 || '',
          SALE_PRICE3: this.itemData.SALE_PRICE3 || '',
          SALE_PRICE4: this.itemData.SALE_PRICE4 || '',
          SALE_PRICE5: this.itemData.SALE_PRICE5 || '',
          CREATED_DATE: this.itemData.CREATED_DATE || '',
          IS_SELECTED: true,
          COST: this.itemData.COST ?? 0,
          IS_INACTIVE: row.IS_INACTIVE ?? false,
          IS_NOT_SALE_ITEM: row.IS_NOT_SALE_ITEM ?? false,
          IS_PRICE_REQUIRED: row.IS_PRICE_REQUIRED ?? false,
          IS_NOT_DISCOUNTABLE: row.IS_NOT_DISCOUNTABLE ?? false,
          IS_NOT_SALE_RETURN: row.IS_NOT_SALE_RETURN ?? false,
          LAST_MODIFIED_DATE: new Date().toISOString(),
          QTY_AVAILABLE: row.QTY_AVAILABLE,
        };
      } else {
        return {
          ...row,
          IS_SELECTED: false,
        };
      }
    });

    // 🔹 Sync with itemData.item_stores (optional but safe)
    this.itemData.item_stores = this.store.map((row: any) => ({
      ID: 0,
      STORE_ID: row.ID,
      SALE_PRICE: row.SALE_PRICE,
      SALE_PRICE1: row.SALE_PRICE1,
      SALE_PRICE2: row.SALE_PRICE2,
      SALE_PRICE3: row.SALE_PRICE3,
      SALE_PRICE4: row.SALE_PRICE4,
      SALE_PRICE5: row.SALE_PRICE5,
      STORE_CODE: row.STORE_CODE,
      STORE_NAME: row.STORE_NAME,
      COST: row.COST ?? 0,
      IS_INACTIVE: row.IS_INACTIVE ?? false,
      IS_NOT_SALE_ITEM: row.IS_NOT_SALE_ITEM ?? false,
      IS_PRICE_REQUIRED: row.IS_PRICE_REQUIRED ?? false,
      IS_NOT_DISCOUNTABLE: row.IS_NOT_DISCOUNTABLE ?? false,
      IS_NOT_SALE_RETURN: row.IS_NOT_SALE_RETURN ?? false,

      LAST_MODIFIED_DATE: new Date().toISOString(),
      QTY_AVAILABLE: row.QTY_AVAILABLE,
      IS_SELECTED: selectedIds.includes(row.ID),
    }));

    // 🔹 Force UI refresh (VERY IMPORTANT for DevExtreme)
    this.store = [...this.store];
    this.selectedRowKeys = [...selectedIds];
  }

  saveData() {

    const result = this.validationGroup.instance.validate();
    if (!result.isValid) {
      return;
    }
    console.log(this.selectedRowKeys, '==========selectedRowKeys============');

    const storeData = this.store
      .filter((s: any) => this.selectedRowKeys.includes(s.ID)) // ✅ only selected
      .map((s: any) => ({
        ID: 0,
        STORE_ID: s.ID,
        SALE_PRICE: this.toNumber(s.SALE_PRICE),
        SALE_PRICE1: this.toNumber(s.SALE_PRICE1),
        SALE_PRICE2: this.toNumber(s.SALE_PRICE2),
        SALE_PRICE3: this.toNumber(s.SALE_PRICE3),
        SALE_PRICE4: this.toNumber(s.SALE_PRICE4),
        SALE_PRICE5: this.toNumber(s.SALE_PRICE5),
        STORE_CODE: s.STORE_CODE,
        STORE_NAME: s.STORE_NAME, 
        COST: s.COST ?? 0,
        IS_INACTIVE: s.IS_INACTIVE ?? false,
        IS_NOT_SALE_ITEM: s.IS_NOT_SALE_ITEM ?? false,
        IS_PRICE_REQUIRED: s.IS_PRICE_REQUIRED ?? false,
        IS_NOT_DISCOUNTABLE: s.IS_NOT_DISCOUNTABLE ?? false,
        IS_NOT_SALE_RETURN: s.IS_NOT_SALE_RETURN ?? false,
        LAST_MODIFIED_DATE: new Date().toISOString(),
        QTY_AVAILABLE: s.QTY_AVAILABLE,
        IS_SELECTED: true,
      }));

    const select_supplier = this.itemData.item_suppliers;

    const convertedData: any[] = [];

    select_supplier.forEach((item) => {
      convertedData.push({
        ID: 0,
        SUPP_ID: item.SUPP_ID?.toString() || '',
        // REORDER_NO: item.REORDER_NO || '',
        REORDER_NO:
          item.REORDER_NO !== null && item.REORDER_NO !== undefined
            ? String(item.REORDER_NO)
            : '',

        COST: item.COST || 0,
        IS_PRIMARY: item.IS_PRIMARY || false,
        IS_CONSIGNMENT: item.IS_CONSIGNMENT || true,
      });
    });

    const itemAliasDAta = this.itemData.item_alias;
    const convertedAliasData: any[] = [];

    itemAliasDAta.forEach((item) => {
      convertedAliasData.push({
        ID: item.ID || 0,
        ALIAS: item.ALIAS,
        IS_DEFAULT: item.IS_DEFAULT,
        ALIAS_TYPE_ID: item.ALIAS_TYPE_ID || 1,
      });
    });

    const items = this.itemData; // Adjust if needed based on your form structure
    const payload = {
      ...this.itemData,
      item_stores: storeData || this.itemData.item_stores,
      item_suppliers: convertedData,
      item_alias: convertedAliasData,
      UOM_PURCH: this.selectedData,
      COMPANY_ID: this.selected_Company_id,
      SALE_PRICE: this.salePrice,
      COST: this.itemData.COST ?? 0,
    };
    // Call the service to update the items
    this.dataservice.updateItems(payload.ID, payload).subscribe(
      (response) => {
        if (response) {
          notify(
            {
              message: 'Item updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.closeForm();
          this.dataGrid.instance.refresh();
          this.store = '';
          this.Edit_Store = '';
          // this.getItemList();
        } else {
          notify(
            {
              message: 'Your Data Not Updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => {
        console.error('Update failed:', error);
        // Handle the error if needed, e.g., show an error message
      },
    );
  }

  toNumber(value: any): number {
  if (value === '' || value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imageSource = URL.createObjectURL(file); // Display the selected file as an image
      this.imageUploaded = true;
    }
  }
  onFileChanged(event) {}
  onUploadStarted(event: any) {
    this.imageSource = '';
    this.progressVisible = true;
  }
  onProgress(e) {
    this.progressValue = (e.bytesLoaded / e.bytesTotal) * 100;
  }
  onUploaded(e) {
    const file = e.file;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.isDropZoneActive = false;
      this.imageSource = fileReader.result as string;
      this.imageUploaded = true;
    };
    fileReader.readAsDataURL(file);
    this.textVisible = false;
    this.progressVisible = false;
    this.progressValue = 0;
  }
  onDropZoneLeave(event) {}
  onDropZoneEnter({
    component,
    dropZoneElement,
    event,
  }: {
    component: any;
    dropZoneElement: any;
    event?: any;
  }) {
    if (dropZoneElement.id === 'dropzone-external') {
      if (event && event.originalEvent && event.originalEvent.dataTransfer) {
        const items = event.originalEvent.dataTransfer.items;

        // Check for allowed file extensions and process the upload
        const allowedFileExtensions = component.option('allowedFileExtensions');
        const draggedFileExtension = `.${items[0].type.replace(
          /^image\//,
          '',
        )}`;

        const isSingleFileDragged = items.length === 1;
        const isValidFileExtension =
          allowedFileExtensions.includes(draggedFileExtension);

        if (isSingleFileDragged && isValidFileExtension) {
          this.isDropZoneActive = true;
        }
      }
    }
  }
  openModal(event) {}
  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  refreshItems() {
    const payload = {};
    // Implement this method to refresh the items from the server
    this.dataservice.getItemsData().subscribe(
      (data) => {
        this.items = data; // Assuming 'items' is the data source for your grid
      },
      (error) => {
        console.error('Failed to refresh items:', error);
      },
    );
  }

  closeForm(): void {
    this.formClosed.emit();
  }

  closeModal() {}

  clearImage() {
    this.imageSource = '';
    this.selectedFile = null;
    this.imageUploaded = false; // Reset imageUploaded when image is cleared
    this.textVisible = true;
  }

  calculateProfitMargin(): any {
    if (this.salePrice > 0 && this.itemData.COST > 0) {
      return (this.itemData.PROFIT_MARGIN =
        ((this.salePrice - this.itemData.COST) / this.itemData.COST) * 100);
    } else {
      return 0;
    }
  }

  showItems() {
    this.isLoading = true;
    this.cdr.detectChanges();
    const payload = {};
    this.dataservice.getItemsData().subscribe(
      (response: any) => {
        // Sort items by 'createdAt' in descending order
        this.itemsList = response.data.reverse();
        this.newItemList = this.itemsList.map((item) => {
          return {
            ID: item.ID,
            ITEM_CODE: item.ITEM_CODE,
            DESCRIPTION: item.DESCRIPTION,
            UOM: item.UOM,
          };
        });
        this.isLoading = false;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching items:', error);
        this.isLoading = false;
      },
    );
  }

  onItemSelected(event: any): void {
    // Get the selected item from the event's selectedRowsData
    const selectedItem = event.selectedRowsData[0]; // Access the first selected item

    if (selectedItem) {
      this.selectedItemId = selectedItem.ID; // Bind the selected ID
      this.selectedItemCode = selectedItem.ITEM_CODE; // Optionally capture the ITEM_CODE
      // Optionally, bind them to your form data or use them in your application
      const selectedItemDetails = this.newItemList.find(
        (item) => item.ID === this.selectedItemId,
      );
      this.newItemList.forEach((item) => {
        item.displayValue = `${item.ITEM_CODE} - ${item.DESCRIPTION}`;
      });
      this.formData.ITEM_CODE = selectedItemDetails.ITEM_CODE;
      this.formData.DESCRIPTION = selectedItemDetails.DESCRIPTION;
      this.formData.UOM = selectedItemDetails.UOM;
    }
  }

  saveItem(): void {
    if (
      !this.formData.ITEM_CODE ||
      !this.formData.UOM ||
      !this.formData.QUANTITY
    ) {
      console.error('Please fill all fields');
      return;
    }

    // Get the description for the selected item
    const selectedItem = this.newItemList.find(
      (item) => item.ID === this.selectedItemId,
    );
    const newComponent = {
      COMPANY_ID: this.companyId,
      COMPONENT_ITEM_ID: this.selectedItemId,
      ITEM_CODE: this.formData.ITEM_CODE,
      DESCRIPTION: this.formData.DESCRIPTION,
      UOM: this.formData.UOM,
      QUANTITY: Number(this.formData.QUANTITY),
    };

    // Add the component data to the components array
    this.gridData.push(newComponent);

    if (this.itemData && Array.isArray(this.itemData.item_components)) {
      this.itemData.item_components = [
        ...this.itemData.item_components,
        newComponent,
      ]; // Merging arrays
    }

    // Close the popup after saving
    this.isPopupVisible = false;

    // Reset the form data
    this.formData = {
      COMPONENT_ITEM_ID: '',
      ITEM_CODE: null,
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: null,
    };
  }

  editComponent(rowData: any) {
    // Implement the edit logic here, using the rowData to populate the form or open an edit modal
  }

  addComponent() {
    this.isPopupVisible = true;
    this.cdr.detectChanges();
  }

  cancelPopup() {
    this.isPopupVisible = false;
    this.formData = {
      COMPONENT_ITEM_ID: '',
      ITEM_CODE: '',
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: '',
    };
    this.selectedItemId = null;
  }

  onRowUpdatedStore(e: any) {
    const index = this.store.findIndex((item: any) => item.ID === e.data.ID);

    if (index > -1) {
      this.store[index] = {
        ...this.store[index],
        ...e.data,
      };
    }

    // 🔥 IMPORTANT: sync with item_stores
    const itemIndex = this.itemData.item_stores.findIndex(
      (x: any) => x.STORE_ID === e.data.ID,
    );

    if (itemIndex > -1) {
      this.itemData.item_stores[itemIndex] = {
        ...this.itemData.item_stores[itemIndex],
        ...e.data,
      };
    }
  }

  // onRowUpdatedStore(e: any) {
  //   console.log('Row updated:', e.data);
  //   const storeId = e.data.ID;

  //   const createDummyItemStore = (storeData: any) => {
  //     return {
  //       STORE_ID: storeData.ID || 0,
  //       SALE_PRICE: storeData.SALE_PRICE || 0,
  //       SALE_PRICE1: storeData.SALE_PRICE1 || 0,
  //       SALE_PRICE2: storeData.SALE_PRICE2 || 0,
  //       SALE_PRICE3: storeData.SALE_PRICE3 || 0,
  //       SALE_PRICE4: storeData.SALE_PRICE4 || 0,
  //       SALE_PRICE5: storeData.SALE_PRICE5 || 0,
  //       STORE_CODE: storeData.STORE_CODE || '',
  //       STORE_NAME: storeData.DESCRIPTION || storeData.STORE_NAME || '',
  //       COST: storeData.COST || 0,
  //       IS_INACTIVE: storeData.IS_INACTIVE || false,
  //       IS_NOT_SALE_ITEM: storeData.IS_NOT_SALE_ITEM || false,
  //       IS_NOT_SALE_RETURN: storeData.IS_NOT_SALE_RETURN || false,
  //       IS_PRICE_REQUIRED: storeData.IS_PRICE_REQUIRED || false,
  //       IS_NOT_DISCOUNTABLE: storeData.IS_NOT_DISCOUNTABLE || false,
  //       LAST_MODIFIED_DATE: new Date().toISOString(),
  //       QTY_AVAILABLE: storeData.QTY_AVAILABLE || '',
  //       IS_SELECTED: true,
  //     };
  //   };

  //   // Initialize array if not yet created
  //   // if (!this.selectedStoresMap) {
  //   //   this.selectedStoresMap = [];
  //   // }

  //   // const existingIndex = this.selectedStoresMap.findIndex(
  //   //   (item: any) => item.STORE_ID === e.data.ID,
  //   // );

  //   // if (existingIndex > -1) {
  //   //   // Replace existing with mapped dummy object
  //   //   this.selectedStoresMap[existingIndex] = createDummyItemStore(e.data);
  //   // } else {
  //   //   // Add new mapped dummy object
  //   //   this.selectedStoresMap.push(createDummyItemStore(e.data));
  //   // }
  // }
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
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemsFormModule,
    DxTabsModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DxTemplateModule,
    CommonModule,
    DxoFormItemModule,
    DxDataGridModule,
    DxToolbarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule
  ],
  providers: [],
  exports: [ItemsEditFormComponent],
  declarations: [ItemsEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemsEditFormModule {}
