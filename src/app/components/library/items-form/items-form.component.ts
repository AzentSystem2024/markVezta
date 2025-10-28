import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  Input,
  NgModule,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  enableProdMode,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDropDownBoxModule,
  DxFileUploaderComponent,
  DxFormComponent,
  DxNumberBoxModule,
  DxPopupModule,
  DxTabPanelModule,
  DxTabsModule,
} from 'devextreme-angular';
import { DxoItemModule } from 'devextreme-angular/ui/nested';
import { DxoFormItemModule } from 'devextreme-angular/ui/nested';
import { DxoLookupModule } from 'devextreme-angular/ui/nested';
import { ChangeDetectorRef } from '@angular/core';
import { DxValidatorModule } from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxDataGridModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxRadioGroupModule } from 'devextreme-angular';
import { AuthService, DataService } from 'src/app/services';
import { DxFileUploaderModule, DxProgressBarModule } from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular';
import { AnyARecord, DESTRUCTION } from 'dns';
import { Row } from 'jspdf-autotable';
import { EventEmitter } from '@angular/core';
import { CountryServiceService } from 'src/app/services/country-service.service';
import { ImageService } from 'src/app/services/image.service';
import { Console } from 'console';
@Component({
  selector: 'app-items-form',
  templateUrl: './items-form.component.html',
  styleUrls: ['./items-form.component.scss'],
})
export class ItemsFormComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form: DxFormComponent;
  @ViewChild('fileUploader', { static: false }) fileUploader!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  //  priorities: string[] = ['Standard code', 'Tally code',];
  //  priorities = [
  //     { id: 1, name: 'Standard code' },
  //     { id: 2, name: 'Tally code' }
  //   ];
  selectedPriority: number = 1;
  isLoading: boolean = false;
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

  components: any[] = [];
  selectedItemId: any = null;
  gridColumns: any[] = [];
  isDropZoneActive = false;
  imageSource = '';
  textVisible = true;
  progressVisible = false;
  progressValue = 0;
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  imageUploaded: boolean = false;
  selectedFile: File = null;
  imageBase64: any = '';
  isPopupVisible: boolean = false;

  formData = {
    COMPONENT_ITEM_ID: '',
    ITEM_CODE: '',
    DESCRIPTION: '',
    UOM: '',
    QUANTITY: null,
  };

  ITEM_ALIAS: any[] = [{ ALIAS: '', ALIAS_TYPE_ID: this.selectedPriority }];
  url: any;
  items: any[] = [];
  store: any[] = [];
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
  public costingMethodOptions: any[] = [];
  packing: any[] = [];
  country1: any;
  imageFile: any;
  base64Image: string | ArrayBuffer | null = null;
  IS_ACTIVE: boolean = false;
  dropdownOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];
  filteredDropdownOptions = [];
  selectedUom: any;
  itemsList: any;
  selectedItem: any;
  newItemList: any;
  selectedItemCode: any;
  selectedId: any;
  gridData: any[] = [];
  selectedParentItemId: any;
  selectedParentItemDescription: any;
  VatClass: any;

  ITEM_SUPPLIERS = [
    {
      SUPP_ID: '',
      REORDER_NO: '',
      COST: 0,
      IS_PRIMARY: false,
      IS_CONSIGNMENT: false,
    },
  ];

  sessionData: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  ENABLE_Matrix_Code: boolean;
  isParentItemDropdownOpen: boolean;
  selectedStoresMap: any;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private imageService: ImageService,
    private cdr: ChangeDetectorRef,
    private countryFlagService: CountryServiceService
  ) {
    this.selectedPriority = 1;
    // this.onDropZoneEnter = this.onDropZoneEnter.bind(this);
    // this.onDropZoneLeave = this.onDropZoneLeave.bind(this);
    this.onUploaded = this.onUploaded.bind(this);
    // this.onProgress = this.onProgress.bind(this);
    // this.onUploadStarted = this.onUploadStarted.bind(this);

    this.itemlabel1 = authservice.getsettingsData().ITEM_PROPERTY1;
    this.itemlabel2 = authservice.getsettingsData().ITEM_PROPERTY2;
    this.itemlabel3 = authservice.getsettingsData().ITEM_PROPERTY3;
    this.itemlabel4 = authservice.getsettingsData().ITEM_PROPERTY4;
    this.itemlabel5 = authservice.getsettingsData().ITEM_PROPERTY5;

    dataservice.Dropdown_ItemTax('VAT_CLASS').subscribe((data) => {
      console.log(data);
      this.VatClass = data;
      console.log(this.VatClass, 'VAT_CLASS=======');
    });

    dataservice.getDropdownData('PARENTITEM').subscribe((data) => {
      this.parentitem = data;
      console.log(this.parentitem, 'PARENTITEM');
    });
    dataservice.getDropdownData('ITEMTYPE').subscribe((data) => {
      this.itemtype = data;
      console.log(this.itemtype, 'ITEMTYPE');
    });
    dataservice.getDropdownData('COUNTRY').subscribe((data) => {
      this.country = data;
      console.log(this.country, 'COUNTRY=======');
    });
    dataservice.getDropdownData('STORE').subscribe((data) => {
      this.store = data;
    });
    dataservice.getDropdownData('brand').subscribe((data) => {
      this.brand = data;
      console.log(this.brand, '=====================brand--------------------');
    });
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
      console.log(this.countries, 'COUNTRY;;;;;;;;;;');
    });
    dataservice.getItemProperty1Data().subscribe((data) => {
      this.itemprop1 = data;
    });
    dataservice.getItemProperty2Data().subscribe((data) => {
      this.itemprop2 = data;
    });
    dataservice.getItemProperty3Data().subscribe((data) => {
      this.itemprop3 = data;
    });
    dataservice.getItemProperty4Data().subscribe((data) => {
      this.itemprop4 = data;
    });
    dataservice.getItemProperty5Data().subscribe((data) => {
      this.itemprop5 = data;
    });

    dataservice.getDepartmentData().subscribe((data) => {
      this.department = data;
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
    dataservice.getDropdownData('UOM').subscribe((data) => {
      this.uom = data;
      console.log(this.uom, 'UOMMMMMMMM');
      this.filterDropdownOptions();
    });
    const payload = {};
    dataservice.getItemsData().subscribe((data) => {
      this.items = data;
    });
    dataservice.getDropdownData('COSTINGMETHOD').subscribe((data) => {
      this.costingMethodOptions = data;
    });
    dataservice.getDropdownData('PACKING').subscribe((data) => {
      this.packing = data;
      // console.log(this.packing,"packing")
    });
  }
  ALias_list: any;


  formItemsData : any = {
    
      ITEM_CODE: '',
      BARCODE: '',
      DESCRIPTION: "",
      ARABIC_DESCRIPTION: "",
      TYPE_ID: 0,
      DEPT_ID: 0,
      RESTOCK_LEVEL: 0,
      IS_CONSIGNMENT: false,
      CAT_ID: 0,
      SUBCAT_ID: 0,
      IS_INACTIVE: false,
      BRAND_ID: 0,
      LONG_DESCRIPTION: "",
      SALE_PRICE: 0,
      COST: 0,
      PROFIT_MARGIN: 0,
      MATRIX_CODE:'',
      QTY_STOCK: 0,
      QTY_COMMITTED: 0,
      CREATED_DATE:new Date(),
      LAST_PO_DATE: new Date(),
      LAST_GRN_DATE: new Date(),
      LAST_SALE_DATE: new Date(),
      PARENT_ITEM_ID: 0,
      CHILD_QTY: 0,
      ORIGIN_COUNTRY: 0,
      SHELF_LIFE: 0,
      NOTES: "",
      IS_DIFFERENT_UOM_PURCH: false,
      UOM_PURCH: '',
      UOM_MULTPLE:0,
      IS_PRICE_REQUIRED: false,
      IS_NOT_DISCOUNTABLE: false,
      IS_NOT_PURCH_ITEM: false,
      IS_NOT_SALE_ITEM: false,
      IS_NOT_SALE_RETURN: false,
      IS_BLOCKED: false,
      IMAGE_NAME: "",
      ITEM_SL: 0,
      SALE_PRICE1:0,
      SALE_PRICE2: 0,
      SALE_PRICE3: 0,
      SALE_PRICE4: 0,
      SALE_PRICE5: 0,
      PURCH_PRICE: 0,
      BIN_LOCATION: "",
      PURCH_CURRENCY: 0,
      VAT_CLASS_ID: 0,
      VAT_NAME: "",
      ITEM_PROPERTY1: 0,
      ITEM_PROPERTY2: 0,
      ITEM_PROPERTY3: 0,
      ITEM_PROPERTY4: 0,
      ITEM_PROPERTY5: 0,
      COSTING_METHOD: 0,
      REORDER_POINT: 0,
      UNIT_ID:0,
      PACKING_ID:0,
      POS_DESCRIPTION:"",
      ITEM_STORES: [
        {
          STORE_ID: '',
          SALE_PRICE: 0,
          SALE_PRICE1: 0,
          SALE_PRICE2: 0,
          SALE_PRICE3: 0,
          SALE_PRICE4: 0,
          SALE_PRICE5: 0,
          STORE_CODE: "",
          STORE_NAME:'',
          COST:0,
          IS_INACTIVE: false,
          IS_NOT_SALE_ITEM: false,
          IS_NOT_SALE_RETURN:false,
          IS_PRICE_REQUIRED: false,
          IS_NOT_DISCOUNTABLE: false,
          LAST_MODIFIED_DATE: new Date(),
          QTY_AVAILABLE:'',
          IS_SELECTED: false,
        }
      ],
      ITEM_ALIAS: [
        {
          ALIAS: "",
          ALIAS_TYPE_ID:this.selectedPriority
        }
      ],
      ITEM_SUPPLIERS: [
        {
          SUPP_ID: 0,
          REORDER_NO: "",
          COST: 0,
          IS_PRIMARY: false,
          IS_CONSIGNMENT: false
        }
      ],
      ITEM_COMPONENTS: [
        {
          COMPONENT_ITEM_ID: 0,
          QUANTITY: 0,
          UOM: ''
        }
      ]

    }

  newItems = this.formItemsData;
  getNewItems = () => ({
    ...this.newItems,
    ITEM_STORES: this.selectedStoresMap || this.formItemsData.ITEM_STORES,
  });

  ngOnInit() {
    this.showItems();
    this.sesstion_Details();
    // this.loadImageFromLocalStorage();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;
    console.log(
      this.ITEM_PROPERTY1,
      '============ITEM_PROPERTY1=============='
    );

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;
    console.log(
      this.ITEM_PROPERTY2,
      '============ITEM_PROPERTY2=============='
    );

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;
    console.log(
      this.ITEM_PROPERTY3,
      '============ITEM_PROPERTY3=============='
    );

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;
    console.log(
      this.ITEM_PROPERTY4,
      '============ITEM_PROPERTY4=============='
    );

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
    console.log(
      this.ITEM_PROPERTY5,
      '============ITEM_PROPERTY5=============='
    );
    this.ENABLE_Matrix_Code =
      this.sessionData.GeneralSettings.ENABLE_MATRIX_CODE;
    console.log(this.ENABLE_Matrix_Code);
  }

  onInitNewRowAlias(e: any) {
    e.data.ALIAS_TYPE_ID = this.selectedPriority;
  }

  filterDropdownOptions() {
    this.filteredDropdownOptions = this.uom.filter(
      (option) => option.ID !== this.selectedUom
    );
    console.log(this.filteredDropdownOptions, 'FILTERED');
  }
  onSelectPackAdd(event: any) {}

  onUOMChange(event: any) {
    this.selectedUom = this.newItems.UNIT_ID;
    this.formItemsData.UOM_PURCH = this.selectedUom;
    console.log(
      '===============UOM_PURCH==========',
      this.formItemsData.UOM_PURCH
    );
    this.filterDropdownOptions(); // Filter the options when the selection changes
  }
  onPriorityChange(event: any) {
    console.log(event);
  }

  // onParentItemChanged(e: any) {
  //   if (e.selectedRowKeys.length > 0) {
  //     this.newItems.PARENT_ITEM_ID = e.selectedRowKeys[0];
  //     this.isParentItemDropdownOpen = false;  // ✅ close dropdown
  //   }
  // }

  onUploaded(e: any) {
    const file = e.file;
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      this.isDropZoneActive = false;
      this.imageSource = fileReader.result as string;
      this.imageBase64 = fileReader.result as string; // Store the image as Base64
      console.log(this.imageBase64, 'IMAGE');
      this.imageUploaded = true;

      // Save the image to IndexedDB
      await this.imageService.saveImage(file.name, this.imageBase64);
    };
    fileReader.readAsDataURL(file);
    this.textVisible = false;
    this.progressVisible = false;
    this.progressValue = 0;
  }
  // onProgress(e: any) {
  //   this.progressValue = (e.bytesLoaded / e.bytesTotal) * 100;
  // }
  // onUploadStarted(event: any) {
  //   this.imageSource = '';
  //   this.progressVisible = true;
  // }

  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  onFileInputChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        this.imageSource = fileReader.result as string;
        this.imageBase64 = this.imageSource;
        console.log(this.imageBase64, 'IMAGEEEEEEE');
        this.newItems.IMAGE_NAME = this.imageBase64;
        console.log(this.newItems.IMAGE_NAME, 'IMAGENAMEEEEEEEEEEE');
        this.textVisible = false;
        this.isDropZoneActive = false;
        this.imageUploaded = true;

        // Save the image to IndexedDB
        await this.imageService.saveImage(file.name, this.imageBase64);
      };
      fileReader.readAsDataURL(file);
    }
  }

  openModal(event: Event) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage') as HTMLImageElement;
    const captionText = document.getElementById('caption') as HTMLDivElement;

    if (modal && modalImg && captionText) {
      modal.style.display = 'block';
      modalImg.src = this.imageSource;
      captionText.innerHTML = 'Image Caption';
      event.stopPropagation(); // Prevent event bubbling
    }
  }

  closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  onFileChanged(e) {
    let reader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      let file = e.target.files[0];
      this.formItemsData.IMAGE_NAME = file.name;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.url = reader.result;
      };
    }
  }

  // Clear the image
  clearImage() {
    this.imageSource = '';
    this.imageBase64 = '';
    this.selectedFile = null;
    this.imageUploaded = false;
    this.textVisible = true;

    // Optionally delete the image from IndexedDB
    if (this.selectedFile) {
      this.imageService.deleteImage(this.selectedFile.name);
    }
  }

  // Save the image in localStorage (if needed)
  saveImageToLocalStorage() {
    if (this.imageBase64) {
      console.log('Saving image to localStorage:', this.imageBase64); // Log the Base64 string
      localStorage.setItem('uploadedImage', this.imageBase64);
    }
  }

  loadImageFromLocalStorage() {
    const savedImage = localStorage.getItem('uploadedImage');
    if (savedImage) {
      this.imageSource = savedImage;
      this.imageBase64 = savedImage;
      this.imageUploaded = true;
    }
  }

  onValueChangedConsignmnent(e) {
    // console.log(e);
    if (e.value) {
      this.consignment = e.value;
      this.showSupplier = this.consignment;
    }
  }

  // clearImage() {}

  calculateProfitMargin(): any {
    if (this.formItemsData.SALE_PRICE > 0 && this.formItemsData.COST > 0) {
      return (this.formItemsData.PROFIT_MARGIN =
        ((this.formItemsData.SALE_PRICE - this.formItemsData.COST) /
          this.formItemsData.COST) *
        100);
    } else {
      return 0;
    }
  }

  updatePriceLevel(selectedRows: any[]) {
    if (selectedRows.length > 0) {
      console.log(
        selectedRows,
        '=============selected row==========================='
      );
      selectedRows.forEach((row) => {
        row.SALE_PRICE = this.formItemsData.SALE_PRICE;
        row.SALE_PRICE1 = this.formItemsData.SALE_PRICE1;
        row.SALE_PRICE2 = this.formItemsData.SALE_PRICE2;
        row.SALE_PRICE3 = this.formItemsData.SALE_PRICE3;
        row.SALE_PRICE4 = this.formItemsData.SALE_PRICE4;
        row.SALE_PRICE5 = this.formItemsData.SALE_PRICE5;
        row.IS_INACTIVE = this.formItemsData.IS_INACTIVE;
        row.IS_NOT_SALE_ITEM = this.formItemsData.IS_NOT_SALE_ITEM;
        row.IS_NOT_SALE_RETURN = this.formItemsData.IS_NOT_SALE_RETURN;
        row.IS_PRICE_REQUIRED = this.formItemsData.IS_PRICE_REQUIRED;
        row.IS_NOT_DISCOUNTABLE = this.formItemsData.IS_NOT_SALE_RETURN;
        row.COST = this.formItemsData.COST;

        console.log('pricelevel', selectedRows);
        this.formItemsData.ITEM_STORES.forEach((store, index) => {
          this.formItemsData.ITEM_STORES[index].STORE_ID = row.ID;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE = row.SALE_PRICE;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE1 = row.SALE_PRICE1;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE2 = row.SALE_PRICE2;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE3 = row.SALE_PRICE3;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE4 = row.SALE_PRICE4;
          this.formItemsData.ITEM_STORES[index].SALE_PRICE5 = row.SALE_PRICE5;
          this.formItemsData.ITEM_STORES[index].IS_INACTIVE = row.IS_INACTIVE;
          this.formItemsData.ITEM_STORES[index].IS_NOT_SALE_ITEM =
            row.IS_NOT_SALE_ITEM;
          this.formItemsData.ITEM_STORES[index].IS_NOT_SALE_RETURN =
            row.IS_NOT_SALE_RETURN;
          this.formItemsData.ITEM_STORES[index].IS_PRICE_REQUIRED =
            row.IS_PRICE_REQUIRED;
          this.formItemsData.ITEM_STORES[index].IS_NOT_DISCOUNTABLE =
            row.IS_NOT_DISCOUNTABLE;
          this.formItemsData.ITEM_STORES[index].COST = row.COST;
        });
      });
      console.log('Updated ITEM_STORES:', this.formItemsData.ITEM_STORES);
    } else {
      this.store.forEach((row) => {
        row.SALE_PRICE = '';
        row.SALE_PRICE1 = '';
        row.SALE_PRICE2 = '';
        row.SALE_PRICE3 = '';
        row.SALE_PRICE4 = '';
        row.SALE_PRICE5 = '';
        row.COST = '';
        row.IS_INACTIVE = '';
        row.IS_NOT_SALE_ITEM = '';
        row.IS_NOT_SALE_RETURN = '';
        row.IS_PRICE_REQUIRED = '';
        row.IS_NOT_DISCOUNTABLE = '';
      });
    }
  }
  onRowUpdated(e: any) {
    console.log('Row updated:', e.data); // The row where checkbox was changed
    // console.log("Changed column:", e.column.dataField, "New value:", e.value);
    const storeId = e.data.ID;
    console.log(
      storeId,
      '[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]][[][][][]'
    );
    const createDummyItemStore = (storeData: any) => {
      return {
        STORE_ID: storeData.ID || 0,
        SALE_PRICE: storeData.SALE_PRICE || 0,
        SALE_PRICE1: storeData.SALE_PRICE1 || 0,
        SALE_PRICE2: storeData.SALE_PRICE2 || 0,
        SALE_PRICE3: storeData.SALE_PRICE3 || 0,
        SALE_PRICE4: storeData.SALE_PRICE4 || 0,
        SALE_PRICE5: storeData.SALE_PRICE5 || 0,
        STORE_CODE: storeData.STORE_CODE || '',
        STORE_NAME: storeData.DESCRIPTION || storeData.STORE_NAME || '',
        COST: storeData.COST || 0,
        IS_INACTIVE: storeData.IS_INACTIVE || false,
        IS_NOT_SALE_ITEM: storeData.IS_NOT_SALE_ITEM || false,
        IS_NOT_SALE_RETURN: storeData.IS_NOT_SALE_RETURN || false,
        IS_PRICE_REQUIRED: storeData.IS_PRICE_REQUIRED || false,
        IS_NOT_DISCOUNTABLE: storeData.IS_NOT_DISCOUNTABLE || false,
        LAST_MODIFIED_DATE: new Date().toISOString(),
        QTY_AVAILABLE: storeData.QTY_AVAILABLE || '',
        IS_SELECTED: true,
      };
    };

    // ✅ Initialize array if not yet created
    if (!this.selectedStoresMap) {
      this.selectedStoresMap = [];
    }

    const existingIndex = this.selectedStoresMap.findIndex(
      (item: any) => item.STORE_ID === e.data.ID
    );

    if (existingIndex > -1) {
      // Replace existing with mapped dummy object
      this.selectedStoresMap[existingIndex] = createDummyItemStore(e.data);
    } else {
      // Add new mapped dummy object
      this.selectedStoresMap.push(createDummyItemStore(e.data));
    }

    console.log('Updated Array:', this.selectedStoresMap);
  }

  clearFiles() {
    this.url = '';
  }

  onEditorPreparing(event: any) {
    if (event.parentType == 'dataRow' && event.dataField === 'SUPP_ID') {
      event.editorOptions.onValueChanged = (e: any) => {
        // console.log('hellow', e);
        const selectedSupplierId = e.value;
        const selectedSupplier = this.supplier.find(
          (supplier) => supplier.ID === selectedSupplierId
        );
        if (selectedSupplier) {
          // Update currency value based on selected supplier
          this.currencydata = selectedSupplier.CURRENCY_CODE; // Assuming currency property exists in supplier object
          // console.log('code', this.currencydata);
          this.CURRENCY = this.currencydata;
          // console.log(this.currencydata,"=====")
          event.component.cellValue(event.row.rowIndex, 'SUPP_ID', e.value);
          event.component.cellValue(
            event.row.rowIndex,
            'CURRENCY',
            this.CURRENCY
          );

          console.log(
            event,
            '===================event========================='
          );
          console.log(
            event.component.cellValue(
              event.row.rowIndex,
              'CURRENCY',
              this.CURRENCY
            )
          );
        } else {
          // Reset currency value if no supplier is selected
          this.currencydata = null;
        }
        // console.log('CURRENCY:', this.CURRENCY);
      };
    }
  }
  onRowClick(e: any) {
    console.log('Full row data:', e.data);

    // Example: access each column
    console.log('SUPP_ID:', e.data.SUPP_ID);
    console.log('CURRENCY:', e.data.CURRENCY);
    console.log('REORDER_NO:', e.data.REORDER_NO);
    console.log('COST:', e.data.COST);
    console.log('IS_PRIMARY:', e.data.IS_PRIMARY);
    console.log('IS_CONSIGNMENT:', e.data.IS_CONSIGNMENT);
  }

  onRowInserted(event: any) {
    console.log(
      event,
      '===========================test==========================='
    );
    // const newRecordIsPrimary = event.data.IS_PRIMARY === true;

    // // If the inserted record is primary, set other records' IS_PRIMARY to false
    // if (newRecordIsPrimary) {
    //   // console.log(event);
    //   this.formItemsData.ITEM_SUPPLIERS.forEach((record) => {
    //     record.IS_PRIMARY = false;
    //   });
    // }

    this.formItemsData.ITEM_SUPPLIERS =
      this.formItemsData.ITEM_SUPPLIERS.filter(
        (supplier) => supplier.REORDER_NO.trim() !== '',
        (supplier) => supplier.COST.trim() !== '',
        (supplier) => supplier.IS_PRIMARY.trim() !== '',
        (supplier) => supplier.IS_CONSIGNMENT.trim() !== ''
      );

    this.formItemsData.ITEM_SUPPLIERS.push({
      SUPP_ID: event.data.SUPP_ID.toString(),
      REORDER_NO: event.data.REORDER_NO.toString(),
      COST: event.data.COST,
      IS_PRIMARY: event.data.IS_PRIMARY || false,
      IS_CONSIGNMENT: event.data.IS_CONSIGNMENT || false,
    });

    // console.log('inserted supplier data', this.formItemsData.ITEM_SUPPLIERS);

    // After updating IS_PRIMARY property, trigger change detection
    this.cdr.detectChanges();
  }

  // onRowInsertedAlias(event: any) {
  //   // Remove any existing empty objects from ITEM_ALIAS array
  //   this.formItemsData.ITEM_ALIAS = this.formItemsData.ITEM_ALIAS.filter(
  //     (alias) => alias.ALIAS.trim() !== ''
  //   );

  // Push the new object into ITEM_ALIAS array with ALIAS value
  // this.formItemsData.ITEM_ALIAS.push({ ALIAS: event.data.ALIAS, ALIAS_TYPE_ID: this.selectedPriority   });

  // console.log('inserted Alias data', this.formItemsData.ITEM_ALIAS);
  // }
  onClickSaveSupplier() {
    // console.log('currency');
  }

  onRowUpdatedAlias(event: any) {
    // Find the index of the alias being updated
    const index = this.formItemsData.ITEM_ALIAS.findIndex(
      (alias) => alias.ALIAS === event.oldData.ALIAS
    );
    if (index !== -1) {
      // Update the alias value
      this.formItemsData.ITEM_ALIAS[index].ALIAS = event.data.ALIAS;
      // console.log('updated Alias data', this.formItemsData.ITEM_ALIAS);
    }
  }

  onParentItemChanged(event: any) {
    console.log(event, 'PARENT');
    const selectedParentItem = event.selectedRowsData[0]; // Access the first selected item
    console.log(selectedParentItem, 'SELECTEDITEM');
    if (selectedParentItem) {
      // this.selectedParentItemId = selectedParentItem.ID;
      this.newItems.PARENT_ITEM_ID = selectedParentItem.ID;
      console.log(this.selectedParentItemId, '===========----------');
      this.selectedParentItemDescription = selectedParentItem.DESCRIPTION;
      console.log(this.selectedParentItemDescription, 'SELECTEDDESCRIPTION');
      this.isParentItemSelected = !!this.newItems.PARENT_ITEM_ID;
    }
    this.isParentItemDropdownOpen = false;
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
        // console.log(this.newItemList, 'New Item List');

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

  // onItemSelected(event: any): void {
  //   console.log("Item selected:", event);
  // }

  onItemSelected(event: any): void {
    console.log('ITEM SELECTED======', event);

    // Get the selected item from the event's selectedRowsData
    const selectedItem = event.selectedRowsData[0]; // Access the first selected item
    console.log(selectedItem, 'SELECTEDITEM');

    if (selectedItem) {
      this.selectedUom = selectedItem.UNIT_ID;
      console.log(this.selectedUom, 'SELECTEDUOM');
      this.selectedItemId = selectedItem.ID; // Bind the selected ID
      console.log(this.selectedItemId, '================');
      this.selectedItemCode = selectedItem.ITEM_CODE; // Optionally capture the ITEM_CODE
      // Optionally, bind them to your form data or use them in your application
      const selectedItemDetails = this.newItemList.find(
        (item) => item.ID === this.selectedItemId
      );
      this.newItemList.forEach((item) => {
        item.displayValue = `${item.ITEM_CODE} - ${item.DESCRIPTION}`;
      });
      this.formData.ITEM_CODE = selectedItemDetails.ITEM_CODE;
      this.formData.DESCRIPTION = selectedItemDetails.DESCRIPTION;
      this.formData.UOM = selectedItemDetails.UOM;
      console.log(this.formData.UOM, 'SELECTEDITEMDETAILSSSS');
    }
  }

  saveItem(): void {
    console.log(this.selectedItemId, 'IN SAVEEEEEEEEEE');
    console.log('Form data:', this.formData);
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
      (item) => item.ID === this.selectedItemId
    );
    // const selectedUom = this.newItemList.find(item => === this.)
    console.log(selectedItem, 'SELECTEDITEMMMMMMMMM');
    const newComponent = {
      COMPONENT_ITEM_ID: this.selectedItemId,
      ITEM_CODE: this.formData.ITEM_CODE,
      DESCRIPTION: this.formData.DESCRIPTION,
      UOM: this.formData.UOM,
      QTY_AVAILABLE: this.formData.QUANTITY,
    };

    // Add the component data to the components array
    this.gridData.push(newComponent);
    console.log('Grid Data:', this.gridData);

    this.newItems = {
      ...this.formItemsData, // Copy existing form data
      ITEM_COMPONENTS: this.gridData.map((item) => ({
        COMPONENT_ITEM_ID: item.COMPONENT_ITEM_ID, // Map ITEM_CODE to COMPONENT_ITEM_ID
        QUANTITY: item.QTY_AVAILABLE, // Map QTY_AVAILABLE to QUANTITY
        UOM: item.UOM, // Map UOM to UOM
      })),
    };
    console.log(this.newItems, 'FORMITEMSDATA');
    // Close the popup after saving
    this.isPopupVisible = false;

    // Reset the form data
    this.formData = {
      COMPONENT_ITEM_ID: '',
      ITEM_CODE: '',
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: '',
    };
    this.selectedItemId = null;
  }

  addComponent() {
    console.log('popup opened');
    this.isPopupVisible = true;
    this.cdr.detectChanges();
    console.log(this.isPopupVisible, 'POPUP');
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
    DxNumberBoxModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxTabPanelModule,
    DxTabsModule,
  ],
  providers: [],
  declarations: [ItemsFormComponent],
  exports: [ItemsFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemsFormModule {}
