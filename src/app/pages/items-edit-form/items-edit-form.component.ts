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
} from '../items-list/items-list.component';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import { BrowserModule } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';

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
  selectedParentItemId: any;
  selectedParentItemDescription: any;
  ENABLE_Matrix_Code: boolean=false
  edit_Suplier: any;
  Edit_Store: any;
  
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
  selectedPriority:any=1
  public costingMethodOptions: any[] = [];
  packing: any[] = [];

  item_alias: any[] = [
    {
      ALIAS: '',
       ALIAS_TYPE_ID:this.selectedPriority
    },
  ];
  
  ITEM_ALIAS: any[] = [{ ALIAS: '' , ALIAS_TYPE_ID:this.selectedPriority}];
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

  formItemsData: any = {
    ID: '',
    ITEM_CODE: '',
    BARCODE: '',
    IMAGE_NAME: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    TYPE_ID: '',
    DEPT_ID: '',
    CAT_ID: '',
    SUBCAT_ID: '',
    BRAND_ID: '',
    ITEM_PROPERTY1: '',
    ITEM_PROPERTY2: '',
    ITEM_PROPERTY3: '',
    MATRIX_CODE:'',
    ITEM_PROPERTY4: '',
    ITEM_PROPERTY5: '',
    VAT_CLASS_ID: '',
    UNIT_ID: '',
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
    IS_DIFFERENT_UOM_PURCH:false,
    UOM_PURCH:'',
    UOM_MULTPLE:'',
    ITEM_STORES: [
      {
        STORE_ID: '',
        SALE_PRICE: '',
        SALE_PRICE1: '',
        SALE_PRICE2: '',
        SALE_PRICE3: '',
        SALE_PRICE4: '',
        SALE_PRICE5: '',
        STORE_CODE:'',
        STORE_NAME:'',
        COST:'',
        IS_INACTIVE:false ,
        IS_NOT_SALE_ITEM: false,
        IS_NOT_SALE_RETURN:false,
        IS_PRICE_REQUIRED: false,
        IS_NOT_DISCOUNTABLE: false,
        LAST_MODIFIED_DATE:'',
        QTY_AVAILABLE:'',
        IS_SELECTED: false,
      },
    ],
    ITEM_ALIAS: [
      {
        ALIAS: '',
        ALIAS_TYPE_ID:this.selectedPriority
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
      COMPONENT_ITEM_ID:"",
      QUANTITY:"",
      UOM: ""
    }
  ]
  };

  newItems = this.formItemsData;

  selectedStoreIds: any[] = [];
  formData = {
    COMPONENT_ITEM_ID: '',
    ITEM_CODE: '',
    DESCRIPTION: '',
    UOM: '',
    QUANTITY: null
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
  sessionData : any;
  ITEM_PROPERTY1 : any;
  ITEM_PROPERTY2 : any;
  ITEM_PROPERTY3 : any;
  ITEM_PROPERTY4 : any;
  ITEM_PROPERTY5 : any;
  isParentItemDropdownOpen: boolean;


  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private countryFlagService: CountryServiceService,
        private cdr: ChangeDetectorRef,
        private router: Router
  ) {


      this.selectedPriority=1
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
    // console.log('ItemsEditFormComponent constructor');
    dataservice.getDropdownData('PARENTITEM').subscribe((data) => {
      this.parentitem = data;
    });
    dataservice.getDropdownData('ITEMTYPE').subscribe((data) => {
      this.itemtype = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
    dataservice.getDropdownData('COUNTRY').subscribe((data) => {
      this.country = data;
      // console.log(this.country, 'COUNTRY');
    });
    dataservice.getDropdownData('STORE').subscribe((data) => {
      this.store = data;
      this.selectedStoreIds = this.itemData.item_stores.map(
        (store) => store.ID
      );
      // console.log('Selected store IDs:', this.selectedStoreIds);
    });
    dataservice.getItemProperty1Data().subscribe((data) => {
      this.itemprop1 = data;
    });
    dataservice.getItemProperty2Data().subscribe((data) => {
      this.itemprop2 = data;
    });
    dataservice.getItemProperty3Data().subscribe((data) => {
      this.itemprop3 = data;
      // console.log(this.itemprop3,"itemprop3")
    });
         dataservice.getItemProperty4Data().subscribe((data) => {
      this.itemprop4 = data;
    });
     dataservice.getItemProperty5Data().subscribe((data) => {
      this.itemprop5 = data;
    });
    
    // dataservice.getDepartmentData().subscribe((data) => {
    //   this.department = data;
    //   console.log(this.department,"DEP IN EDIT")
    // });
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
      console.log(this.department,"DEPARTMENTTTTTTTTTTTT")
    });
    dataservice.getSubCategoryData().subscribe((data) => {
      this.subcatagory = data;
    });
    // dataservice.getBrandData().subscribe((data) => {
    //   this.brand = data;
    // });
    dataservice.getVatclassData().subscribe((data) => {
      this.vat = data;
    });
    dataservice.getSupplierData().subscribe((data) => {
      this.supplier = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    const payload={

    }
   
    dataservice.getItemsData(payload).subscribe((data) => {
      this.items = data;
    });
    dataservice.getDropdownData('COSTINGMETHOD').subscribe((data) => {
      this.costingMethodOptions = data;
      // console.log(this.costingMethodOptions,"COSTINGMETHOD")
    });
    dataservice.getDropdownData('PACKING').subscribe((data) => {
      this.packing = data;
      // console.log(this.packing,"packing")
    });
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
    }); 
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['itemData'] && this.itemData) {
      console.log( JSON.parse(JSON.stringify(this.itemData)), 'IN NGONCHANGES');
      console.log(this.itemData.PARENT_ITEM_ID, 'IMAGE_NAME in ngOnChanges');
      this.formItemsData=this.itemData
      if (this.itemData.IMAGE_NAME) {
        this.imageSource = this.itemData.IMAGE_NAME; // Set the Base64 string to the imageSource
        this.textVisible = false; // Hide "Upload Image" text
        this.imageUploaded = true; // Mark the image as uploaded
      } else {
        this.imageSource = ''; // No image available
        this.textVisible = true; // Show "Upload Image" text
        this.imageUploaded = false; // Mark as no image uploaded
      }
      this.showComponentTab = this.itemData.TYPE_ID === 8; // Show the Component tab if TYPE_ID is 8
      this.showSupplierTab = this.itemData.TYPE_ID !== 8; 
      console.log(this.itemData.UOM,"ITEMCOMPONENTSSSS")
      const data = this.uom;
      console.log(this.uom,"DATAAAAAAAAAAAA")
      this.filteredUOM = this.uom
      console.log(this.filteredUOM,"FILTEREDUOM")
      this.selectedData = this.itemData.UOM_PURCH 
      console.log(this.selectedData,"UOMPURCH")
      if (this.itemData.item_components && this.itemData.item_components.length > 0) {
        this.gridData = this.itemData.item_components.map((component: any) => ({
          ITEM_CODE: component.ITEM_CODE, // Map the item code if needed
          DESCRIPTION: component.DESCRIPTION, // Map description if available
          UOM: component.UOM,
          QUANTITY: component.QUANTITY,
         
        }));
        console.log(this.gridData,"GRIDDATAAAAA")
      } else {
        this.gridData = []; // Reset if no components
      }
      console.log(this.gridData,"GRIDDATA")
    }
    console.log(this.itemData.item_stores,"Stores")
    if (changes['itemData'] && this.itemData) {
      this.formData = { ...this.itemData }; // Bind itemData to formData


      this.edit_Suplier=this.itemData.item_suppliers
      console.log(this.edit_Suplier,'][][][[][[][][][')
      if (this.itemData && this.itemData.item_stores) {
        this.selectedStoreIds = this.itemData.item_stores.map(
          (store) => store.ID
        );
      } else {
      }

  this.Edit_Store= JSON.parse(JSON.stringify(this.itemData)).item_stores

  console.log(this.Edit_Store,'[]][[]][][][][][][=======][[][][]][][][[]')


    }
    this.loadStores();
    this.sesstion_Details()
    
  }
  onPriceChange(event: any) {
    const newPrice = event.value;
    this.itemData.SALE_PRICE = newPrice;
    console.log(this.itemData.SALE_PRICE,'=================event data==========================')
    this.Edit_Store.forEach(s => s.SALE_PRICE = newPrice);

}

  onCostChange(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.COST_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.COST_PRICE = newPrice);
}
  onProfitmarginChange(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  // this.itemData.SALE_PRICE = newPrice;
  // this.Edit_Store.forEach(s => s.SALE_PRICE = newPrice);
}
  onSalesPrice1Change(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.SALE_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.SALE_PRICE1 = newPrice);
}
  onSalesPrice2Change(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.SALE_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.SALE_PRICE2 = newPrice);
}
  onSalesPrice3Change(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.SALE_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.SALE_PRICE3 = newPrice);
}
  onSalesPrice4Change(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.SALE_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.SALE_PRICE4 = newPrice);
}
  onSalesPrice5Change(event: any) {
    const newPrice = event.value;
    console.log(event,'=================event data==========================')
    console.log('New Price:', newPrice);
  this.itemData.SALE_PRICE = newPrice;
  this.Edit_Store.forEach(s => s.SALE_PRICE5 = newPrice);
}
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    if (state?.data) {
      this.itemData = state.data;
      console.log(this.itemData.IMAGE_NAME, 'IMAGE_NAME in Edit Component'); // Verify IMAGE_NAME here
    }
    this.getUOM();
    this.refreshItems();
    this.showItems();
    this.filteredUom();
    this
  }
      sesstion_Details(){
     this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')

    this.ITEM_PROPERTY1=this.sessionData.GeneralSettings.ITEM_PROPERTY1
    console.log(this.ITEM_PROPERTY1,'============ITEM_PROPERTY1==============')

    this.ITEM_PROPERTY2=this.sessionData.GeneralSettings.ITEM_PROPERTY2
    console.log(this.ITEM_PROPERTY2,'============ITEM_PROPERTY2==============')

    this.ITEM_PROPERTY3=this.sessionData.GeneralSettings.ITEM_PROPERTY3
    console.log(this.ITEM_PROPERTY3,'============ITEM_PROPERTY3==============')

    this.ITEM_PROPERTY4=this.sessionData.GeneralSettings.ITEM_PROPERTY4
    console.log(this.ITEM_PROPERTY4,'============ITEM_PROPERTY4==============')

    this.ITEM_PROPERTY5=this.sessionData.GeneralSettings.ITEM_PROPERTY5
    console.log(this.ITEM_PROPERTY5,'============ITEM_PROPERTY5==============')

    this.ENABLE_Matrix_Code=this.sessionData.GeneralSettings.ENABLE_MATRIX_CODE
    console.log(this.ENABLE_Matrix_Code)
}
onRowUpdated(e:any){
  console.log(e)
}


  onParentItemChanged(event: any) {
    console.log(event,"PARENT")
    const selectedParentItem = event.selectedRowsData[0];  // Access the first selected item
    console.log(selectedParentItem,"SELECTEDITEM")
    if(selectedParentItem){
      // this.selectedParentItemId = selectedParentItem.ID;
      this.itemData.PARENT_ITEM_ID = selectedParentItem.ID
      console.log(this.itemData.PARENT_ITEM_ID,"===========----------")
      this.selectedParentItemDescription = selectedParentItem.DESCRIPTION;
      console.log(this.selectedParentItemDescription,"SELECTEDDESCRIPTION")
      this.isParentItemSelected = this.itemData.PARENT_ITEM_ID;
    }
  }
  
  getUOM(){
    this.dataservice.getDropdownData('UOM').subscribe((data) => {
      this.uom = data;
      console.log(this.uom,"UOMMMMMMMMMMMMMM")
      this.filteredUOMs = this.uom.filter(option => option.ID !== this.itemData.UNIT_ID)
      console.log(this.filteredUOMs,"UOMMMMMMMMMMMMMMFILTERED")
      this.filterDropdownOptions();
    });
  }

  filteredUom(){
    this.filteredUOM = this.uom.filter(option => option.ID !== this.itemData.UNIT_ID)
    console.log(this.filteredUOM,"FILTEREDUOM")
  }


  filterDropdownOptions() {
    this.filteredDropdownOptions = this.uom.filter(option => option.ID !== this.selectedUom);
    console.log(this.filteredDropdownOptions,"FILTERED")
  }

  onUOMChange(event:any) {
    this.selectedUom = this.newItems.UNIT_ID
    this.formItemsData.UOM_PURCH = this.selectedUom;
    this.filterDropdownOptions();  // Filter the options when the selection changes
  }


  onTypeIdChange(event: any): void {
    this.showComponentTab = event.value === 8; // Check if TYPE_ID is 8
  }

  
  loadStores() {
    this.dataservice.getDropdownData('STORE').subscribe((data) => {
      this.store = data;
      // console.log(this.store, 'STORE000000');
      this.loadItemStores();
    });
  }

  loadItemStores() {
    // Extract STORE_IDs where IS_SELECTED is true
    this.selectedRowKeys = this.itemData.item_stores
      .filter(store => store.IS_SELECTED) // Filter based on IS_SELECTED
      .map(store => store.STORE_ID); // Map to STORE_ID
  
    // Set initial data in the grid
    this.itemStores = this.itemData.item_stores;
  }
  
  onSelectionChanged(event: any) {
    this.selectedStoreIds = event.selectedRowKeys;
    console.log('Selected Store IDs:', this.selectedStoreIds);
    this.updatePriceLevel(event.selectedRowsData);
  }


  updatePriceLevel(selectedRows: any[]) {
    if (selectedRows.length > 0) {
      // Iterate over each row to update based on the newly selected rows
      this.itemData.item_stores.forEach((store) => {
        if (selectedRows.some((row) => row.STORE_ID === store.STORE_ID)) {
          store.SALE_PRICE = this.itemData.SALE_PRICE;
          store.SALE_PRICE1 = this.itemData.SALE_PRICE1;
          store.SALE_PRICE2 = this.itemData.SALE_PRICE2;
          store.SALE_PRICE3 = this.itemData.SALE_PRICE3;
          store.SALE_PRICE4 = this.itemData.SALE_PRICE4;
          store.SALE_PRICE5 = this.itemData.SALE_PRICE5;
          store.CREATED_DATE = this.itemData.CREATED_DATE;
          store.IS_SELECTED = true; // Ensure that the newly selected rows are checked
        } else {
          store.IS_SELECTED = store.IS_SELECTED; // Retain the previous checked state for rows not selected
        }
      });
    } else {
      // Reset values if no rows are selected
      this.itemData.item_stores.forEach((store) => {
        store.SALE_PRICE = '';
        store.SALE_PRICE1 = '';
        store.SALE_PRICE2 = '';
        store.SALE_PRICE3 = '';
        store.SALE_PRICE4 = '';
        store.SALE_PRICE5 = '';
        store.IS_INACTIVE = '';
        store.IS_NOT_SALE_ITEM = false;
        store.IS_NOT_SALE_RETURN =false;
        store.IS_PRICE_REQUIRED = false;
        store.IS_NOT_DISCOUNTABLE = false;
        store.CREATED_DATE = '';
        store.IS_SELECTED = true; // Ensure that the row is unchecked if not selected
      });
    }
    // console.log('Updated ITEM_STORES:', this.itemData.ITEM_STORES);
  }


  saveData() {
    console.log("SAVEDATACALLED")

    console.log(this.Edit_Store,'EDITTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
   
const select_supplier = this.itemData.item_suppliers;
console.log(select_supplier)

const convertedData: any[] = [];

select_supplier.forEach(item => {
    convertedData.push({
      ID:  0,
    SUPP_ID: item.SUPP_ID?.toString() || "",
        REORDER_NO: item.REORDER_NO || "",
        COST: item.COST || 0,
        IS_PRIMARY: item.IS_PRIMARY || false,
        IS_CONSIGNMENT: item.IS_CONSIGNMENT || true
    });
});
console.log(convertedData,'====[[=====[[===[[==')

const itemAliasDAta=this.itemData.item_alias
const convertedAliasData: any[] = [];


itemAliasDAta.forEach(item => {
    convertedAliasData.push({
 ID: item.ID ||0,
  ALIAS: item.ALIAS,
  IS_DEFAULT: item.IS_DEFAULT,
  ALIAS_TYPE_ID: item.ALIAS_TYPE_ID ||1

    });
});

console.log(convertedAliasData)
    const items = this.itemData; // Adjust if needed based on your form structure
    console.log(items, 'in update function!');
    const payload = {
      ...this.itemData,
      item_stores: this.Edit_Store || this.itemData.item_stores,
      item_suppliers:convertedData,
      item_alias:convertedAliasData,

     
    };
  console.log(payload,"PAYLOAD")
    // Call the service to update the items
    this.dataservice.updateItems(payload.ID, payload).subscribe(
      (response) => {
        console.log('Update successful:', response);
        if (response) {
          notify(
            {
              message: 'Item updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.closeForm();
          this.dataGrid.instance.refresh();
          // this.getItemList();
        } else {
          notify(
            {
              message: 'Your Data Not Updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {
        console.error('Update failed:', error);
        // Handle the error if needed, e.g., show an error message
      }
    );
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
          ''
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
    const payload={

    }
    // Implement this method to refresh the items from the server
    this.dataservice.getItemsData(payload).subscribe(
      (data) => {
        this.items = data; // Assuming 'items' is the data source for your grid
        console.log(this.items, 'after refresh');
      },
      (error) => {
        console.error('Failed to refresh items:', error);
      }
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
    if (this.itemData.SALE_PRICE > 0 && this.itemData.COST > 0) {
      return (this.itemData.PROFIT_MARGIN =
        ((this.itemData.SALE_PRICE - this.itemData.COST) / this.itemData.COST) *
        100);
    } else {
      return 0;
    }
  }


  showItems() {
    this.isLoading = true;
    this.cdr.detectChanges(); 
        const payload={

    }
    this.dataservice.getItemsData(payload).subscribe(
      (response: any) => {
        // Sort items by 'createdAt' in descending order
        this.itemsList = response.data.reverse();
        this.newItemList = this.itemsList.map(item => {
          return {
            ID: item.ID,
            ITEM_CODE: item.ITEM_CODE,
            DESCRIPTION: item.DESCRIPTION,
            UOM : item.UOM
          };
        });
      this.isLoading = false;
        console.log(this.newItemList, 'New Item List');
  
        // console.log(this.itemsList, "ITEMSLIST");
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      (error) => {
        console.error('Error fetching items:', error);
        this.isLoading = false;
      }
    );
  }

  onItemSelected(event: any): void {
    console.log("ITEM SELECTED======", event);
  
    // Get the selected item from the event's selectedRowsData
    const selectedItem = event.selectedRowsData[0];  // Access the first selected item
    console.log(selectedItem,"SELECTEDITEM")

    if (selectedItem) {
      this.selectedItemId = selectedItem.ID;  // Bind the selected ID
      console.log(this.selectedItemId,"SELECTEDITEMIDDDDDDDDDD")
      this.selectedItemCode = selectedItem.ITEM_CODE;  // Optionally capture the ITEM_CODE
      // Optionally, bind them to your form data or use them in your application
      const selectedItemDetails = this.newItemList.find(item => item.ID === this.selectedItemId);
      this.newItemList.forEach(item => {
        item.displayValue = `${item.ITEM_CODE} - ${item.DESCRIPTION}`;
      });
      this.formData.ITEM_CODE = selectedItemDetails.ITEM_CODE;
      this.formData.DESCRIPTION = selectedItemDetails.DESCRIPTION;
      this.formData.UOM = selectedItemDetails.UOM;
    }
  }

  saveItem(): void {
    console.log(this.selectedItemId,"IN SAVEEEEEEEEEE")
    console.log('Form data:', this.formData);
    if (!this.formData.ITEM_CODE || !this.formData.UOM || !this.formData.QUANTITY) {
      console.error('Please fill all fields');
      return;
    }

    // Get the description for the selected item
    const selectedItem = this.newItemList.find(item => item.ID === this.selectedItemId);
    console.log(selectedItem,"SELECTEDITEMMMMMMMMM")
    const newComponent = {
      COMPONENT_ITEM_ID: this.selectedItemId,
      ITEM_CODE: this.formData.ITEM_CODE,
      DESCRIPTION: this.formData.DESCRIPTION,
      UOM: this.formData.UOM,
      QUANTITY: Number(this.formData.QUANTITY)
    };

    // Add the component data to the components array
    this.gridData.push(newComponent);
    console.log('Grid Data:', this.gridData);

    

    if (this.itemData && Array.isArray(this.itemData.item_components)) {
      this.itemData.item_components = [...this.itemData.item_components, newComponent]; // Merging arrays
      console.log('Item Data after merge:', this.itemData);
    }

    console.log(this.itemData,"FORMITEMSDATA")
    // Close the popup after saving
    this.isPopupVisible = false;

    // Reset the form data
    this.formData = {
      COMPONENT_ITEM_ID:'',
      ITEM_CODE: null,
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: null
    };
  }

  editComponent(rowData: any) {
    // Implement the edit logic here, using the rowData to populate the form or open an edit modal
    console.log(rowData); // Example: you can open a modal or navigate to an edit form with this data
  }

  addComponent() {
    console.log("popup opened")
    this.isPopupVisible = true;
    this.cdr.detectChanges()
    console.log(this.isPopupVisible,"POPUP")
  }


  cancelPopup(){
    this.isPopupVisible = false;
    this.formData = {
      COMPONENT_ITEM_ID:'',
      ITEM_CODE: "",
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: ''
    };
    this.selectedItemId = null;
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
    DxNumberBoxModule
  ],
  providers: [],
  exports: [ItemsEditFormComponent],
  declarations: [ItemsEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemsEditFormModule {}