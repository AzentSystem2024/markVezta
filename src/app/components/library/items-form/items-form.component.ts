import {
  AfterViewInit,
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
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-items-form',
  templateUrl: './items-form.component.html',
  styleUrls: ['./items-form.component.scss'],
})
export class ItemsFormComponent implements OnInit, AfterViewInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  @ViewChild(DxFormComponent, { static: false }) form: DxFormComponent;
  @ViewChild('fileUploader', { static: false }) fileUploader!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('supplierGridRef')
  supplierGrid!: DxDataGridComponent;

  //  priorities: string[] = ['Standard code', 'Tally code',];
  //  priorities = [
  //     { id: 1, name: 'Standard code' },
  //     { id: 2, name: 'Tally code' }
  //   ];
  selectedPriority: number = 1;
  selected_vat_id: any;
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
  selected_Company_id: any;
  companyId: any;

  constructor(
    private dataservice: DataService,
    authservice: AuthService,
    private imageService: ImageService,
    private cdr: ChangeDetectorRef,
    private countryFlagService: CountryServiceService,
  ) {
    this.sesstion_Details();
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

    this.sesstion_Details();
    const Dropdown_ItemTaxPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'VAT_CLASS',
    };
    dataservice.Dropdown_ItemTax(Dropdown_ItemTaxPayload).subscribe((data) => {
      this.VatClass = data;
    });
    const parentItemPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'PARENTITEM',
    };
    dataservice.getDropdownData(parentItemPayload).subscribe((data) => {
      this.parentitem = data;
    });
    const itemTypePayload = {
      // COMPANY_ID: this.selected_Company_id,
      NAME: 'ITEMTYPE',
    };
    dataservice.getDropdownData(itemTypePayload).subscribe((data) => {
      this.itemtype = data;
    });

    dataservice.getDropdownData('COUNTRY').subscribe((data) => {
      this.country = data;
    });
    const storePayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'STORE',
    };
    dataservice.getDropdownData(storePayload).subscribe((data) => {
      this.store = data;
    });
    const brandPayload = {
      NAME: 'brand',
    };
    dataservice.getDropdownData(brandPayload).subscribe((data) => {
      this.brand = data;
    });

    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
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

    const department = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getDepartmentData(department).subscribe((data) => {
      this.department = data;
    });
    const subcategory = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getSubCategoryData(subcategory).subscribe((data) => {
      this.subcatagory = data;
    });
    const vatClassPayload = {
      COMPANY_ID: this.selected_Company_id,
    };
    dataservice.getVatclassData(vatClassPayload).subscribe((data) => {
      this.vat = data;
    });
    const payload = { COMPANY_ID: this.selected_Company_id };
    dataservice.getSupplierData(payload).subscribe((data) => {
      this.supplier = data;
    });
    const itemCategoryPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ITEMCATEGORY',
    };
    dataservice.getDropdownData(itemCategoryPayload).subscribe((data) => {
      this.catagory = data;
    });
    const uomPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'UOM',
    };
    dataservice.getDropdownData(uomPayload).subscribe((data) => {
      this.uom = data;
      this.filterDropdownOptions();
    });

    dataservice.getItemsData().subscribe((data) => {
      this.items = data;
    });
    const costingMethodPayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'COSTINGMETHOD',
    };
    dataservice.getDropdownData(costingMethodPayload).subscribe((data) => {
      this.costingMethodOptions = data;
    });
    const packingPayload = {
      NAME: 'PACKING',
    };
    dataservice.getDropdownData(packingPayload).subscribe((data) => {
      this.packing = data;
    });
  }
  ALias_list: any;

  formItemsData: any = {
    ITEM_CODE: '',
    BARCODE: '',
    DESCRIPTION: '',
    ARABIC_DESCRIPTION: '',
    TYPE_ID: null,
    DEPT_ID: 0,
    RESTOCK_LEVEL: 0,
    IS_CONSIGNMENT: false,
    CAT_ID: 0,
    SUBCAT_ID: 0,
    IS_INACTIVE: false,
    BRAND_ID: 0,
    LONG_DESCRIPTION: '',
    SALE_PRICE: 0,
    COST: 0,
    PROFIT_MARGIN: 0,
    MATRIX_CODE: '',
    QTY_STOCK: 0,
    QTY_COMMITTED: 0,
    CREATED_DATE: new Date(),
    LAST_PO_DATE: new Date(),
    LAST_GRN_DATE: new Date(),
    LAST_SALE_DATE: new Date(),
    PARENT_ITEM_ID: 0,
    CHILD_QTY: 0,
    ORIGIN_COUNTRY: 0,
    SHELF_LIFE: 0,
    NOTES: '',
    IS_DIFFERENT_UOM_PURCH: false,
    UOM_PURCH: '',
    UOM_MULTPLE: 0,
    IS_PRICE_REQUIRED: false,
    IS_NOT_DISCOUNTABLE: false,
    IS_NOT_PURCH_ITEM: false,
    IS_NOT_SALE_ITEM: false,
    IS_NOT_SALE_RETURN: false,
    IS_BLOCKED: false,
    IMAGE_NAME: '',
    ITEM_SL: 0,
    SALE_PRICE1: 0,
    SALE_PRICE2: 0,
    SALE_PRICE3: 0,
    SALE_PRICE4: 0,
    SALE_PRICE5: 0,
    PURCH_PRICE: 0,
    BIN_LOCATION: '',
    PURCH_CURRENCY: 0,
    VAT_CLASS_ID: null,
    VAT_NAME: '',
    ITEM_PROPERTY1: 0,
    ITEM_PROPERTY2: 0,
    ITEM_PROPERTY3: 0,
    ITEM_PROPERTY4: 0,
    ITEM_PROPERTY5: 0,
    COSTING_METHOD: null,
    REORDER_POINT: 0,
    UNIT_ID: null,
    PACKING_ID: 0,
    POS_DESCRIPTION: '',
    HSN_CODE: '',
    GST_PERC: 0,
    ITEM_STORES: [
      {
        STORE_ID: '',
        SALE_PRICE: 0,
        SALE_PRICE1: 0,
        SALE_PRICE2: 0,
        SALE_PRICE3: 0,
        SALE_PRICE4: 0,
        SALE_PRICE5: 0,
        STORE_CODE: '',
        STORE_NAME: '',
        COST: 0,
        IS_INACTIVE: false,
        IS_NOT_SALE_ITEM: false,
        IS_NOT_SALE_RETURN: false,
        IS_PRICE_REQUIRED: false,
        IS_NOT_DISCOUNTABLE: false,
        LAST_MODIFIED_DATE: new Date(),
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
        SUPP_ID: 0,
        REORDER_NO: '',
        COST: 0,
        IS_PRIMARY: false,
        IS_CONSIGNMENT: false,
      },
    ],
    ITEM_COMPONENTS: [
      {
        COMPONENT_ITEM_ID: 0,
        QUANTITY: 0,
        UOM: '',
      },
    ],
  };

  newItems = this.formItemsData;
  // getNewItems = () => ({

  //   ...this.newItems,

  //   // ✅ Force UOM_PURCH as string before API call
  //   UOM_PURCH: this.newItems.UOM_PURCH ? String(this.newItems.UOM_PURCH) : '',
  //   ITEM_STORES: this.selectedStoresMap || this.formItemsData.ITEM_STORES,

  //   // COMPANY_ID: this.selected_Company_id,

  //   //  SUPPLIER MAPPING (KEY FIX)
  // ITEM_SUPPLIERS: (this.datasource || [])
  //   .filter(s => s.SUPP_ID) // remove empty rows
  //   .map(s => ({
  //     SUPP_ID: Number(s.SUPP_ID),
  //     REORDER_NO: String(s.REORDER_NO) || '',
  //     COST: Number(s.COST) || 0,
  //     IS_PRIMARY: !!s.IS_PRIMARY,
  //     IS_CONSIGNMENT: !!s.IS_CONSIGNMENT,
  //   })),
  // });

  getNewItems = () => {
    //  FORCE supplier grid to commit edits
    this.supplierGrid?.instance.saveEditData();

    return {
      ...this.newItems,
      COMPANY_ID: this.selected_Company_id,
      UOM_PURCH: this.newItems.UOM_PURCH ? String(this.newItems.UOM_PURCH) : '',

      ITEM_STORES: this.selectedStoresMap || this.formItemsData.ITEM_STORES,

      //  SUPPLIER PAYLOAD (NOW WILL WORK)
      ITEM_SUPPLIERS: (this.datasource || [])
        .filter((s) => s.SUPP_ID)
        .map((s) => ({
          SUPP_ID: Number(s.SUPP_ID),
          REORDER_NO: String(s.REORDER_NO || ''),
          COST: Number(s.COST) || 0,
          IS_PRIMARY: !!s.IS_PRIMARY,
          IS_CONSIGNMENT: !!s.IS_CONSIGNMENT,
        })),
    };
  };

  ngOnInit() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyId = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
    this.showItems();
    this.sesstion_Details();

    // this.loadImageFromLocalStorage();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.addDefaultSupplierRow();
    });
  }

  addDefaultSupplierRow() {
    const grid = this.supplierGrid?.instance;

    if (!grid) return;

    // Add empty row if no data
    if (!this.datasource || this.datasource.length === 0) {
      this.datasource = [
        {
          ID: Date.now(), // ✅ FIX (unique key)
          SUPP_ID: null,
          CURRENCY: '',
          REORDER_NO: null,
          COST: null,
          IS_PRIMARY: false,
          IS_CONSIGNMENT: false,
        },
      ];
    }

    // Refresh grid
    grid.refresh();

    // 🔥 wait for rendering
    setTimeout(() => {
      setTimeout(() => {
        grid.focus(grid.getCellElement(0, 'SUPP_ID'));
        grid.editCell(0, 'SUPP_ID');
      }, 100);
    }, 0);
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

    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  onInitNewRowAlias(e: any) {
    e.data.ALIAS_TYPE_ID = this.selectedPriority;
  }

  filterDropdownOptions() {
    this.filteredDropdownOptions = this.uom.filter(
      (option) => option.ID !== this.selectedUom,
    );
  }
  onSelectPackAdd(event: any) { }

  onUOMChange(event: any) {
    this.selectedUom = this.newItems.UNIT_ID;
    this.formItemsData.UOM_PURCH = String(this.selectedUom);

    this.filterDropdownOptions(); // Filter the options when the selection changes
  }
  onPriorityChange(event: any) { }

  // onParentItemChanged(e: any) {
  //   if (e.selectedRowKeys.length > 0) {
  //     this.newItems.PARENT_ITEM_ID = e.selectedRowKeys[0];
  //     this.isParentItemDropdownOpen = false;  //  close dropdown
  //   }
  // }

  onUploaded(e: any) {
    const file = e.file;
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      this.isDropZoneActive = false;
      this.imageSource = fileReader.result as string;
      this.imageBase64 = fileReader.result as string; // Store the image as Base64
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
        this.newItems.IMAGE_NAME = this.imageBase64;
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
    } else {
      this.store.forEach((row) => {
        row.SALE_PRICE = '';
        row.SALE_PRICE1 = '';
        row.SALE_PRICE2 = '';
        row.SALE_PRICE3 = '';
        row.SALE_PRICE4 = '';
        row.SALE_PRICE5 = '';
        row.COST = '';
        row.IS_INACTIVE = false;
        row.IS_NOT_SALE_ITEM = false;
        row.IS_NOT_SALE_RETURN = false;
        row.IS_PRICE_REQUIRED = false;
        row.IS_NOT_DISCOUNTABLE = false;
      });
    }
  }

  onRowUpdated(e: any) {
    console.log('Row updated:', e.data);
    const storeId = e.data.ID;

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

    // Initialize array if not yet created
    if (!this.selectedStoresMap) {
      this.selectedStoresMap = [];
    }

    const existingIndex = this.selectedStoresMap.findIndex(
      (item: any) => item.STORE_ID === e.data.ID,
    );

    if (existingIndex > -1) {
      // Replace existing with mapped dummy object
      this.selectedStoresMap[existingIndex] = createDummyItemStore(e.data);
    } else {
      // Add new mapped dummy object
      this.selectedStoresMap.push(createDummyItemStore(e.data));
    }
  }

  clearFiles() {
    this.url = '';
  }

  onEditorPreparing(event: any) {
    if (event.parentType == 'dataRow' && event.dataField === 'SUPP_ID') {
      event.editorOptions.onValueChanged = (e: any) => {
        const selectedSupplierId = e.value;
        const selectedSupplier = this.supplier.find(
          (supplier) => supplier.ID === selectedSupplierId,
        );
        if (selectedSupplier) {
          // Update currency value based on selected supplier
          this.currencydata = selectedSupplier.CURRENCY_CODE; // Assuming currency property exists in supplier object
          this.CURRENCY = this.currencydata;
          event.component.cellValue(event.row.rowIndex, 'SUPP_ID', e.value);
          event.component.cellValue(
            event.row.rowIndex,
            'CURRENCY',
            this.CURRENCY,
          );
        } else {
          // Reset currency value if no supplier is selected
          this.currencydata = null;
        }
      };
    }

    if (event.parentType === 'dataRow' && event.dataField === 'COST') {
      event.editorOptions.onValueChanged = (e: any) => {
        const grid = event.component;

        grid.cellValue(event.row.rowIndex, 'COST', e.value);

        if (e.value && Number(e.value) > 0) {
          const rows = grid.getVisibleRows();
          const lastRow = rows[rows.length - 1]?.data;

          // 🚫 prevent duplicate empty row
          if (lastRow && !lastRow.SUPP_ID && !lastRow.COST) {
            return;
          }

          grid.saveEditData();

          setTimeout(() => {
            grid.addRow();

            setTimeout(() => {
              const visibleRows = grid.getVisibleRows();

              // 🔥 new row is ALWAYS first (index 0)
              const newRow = visibleRows[0];

              if (!newRow) return;

              const rowIndex = newRow.rowIndex;
              const rowKey = newRow.key;

              // 🔥 force focus using key
              grid.option('focusedRowKey', rowKey);

              // 🔥 open editor
              grid.editCell(rowIndex, 'SUPP_ID');
            }, 100);
          }, 0);
        }
      };
    }
  }
  onRowClick(e: any) { }

  onRowInserted(event: any) {
    // const newRecordIsPrimary = event.data.IS_PRIMARY === true;

    // // If the inserted record is primary, set other records' IS_PRIMARY to false
    // if (newRecordIsPrimary) {
    //   this.formItemsData.ITEM_SUPPLIERS.forEach((record) => {
    //     record.IS_PRIMARY = false;
    //   });
    // }

    this.formItemsData.ITEM_SUPPLIERS =
      this.formItemsData.ITEM_SUPPLIERS.filter(
        (supplier) => supplier.REORDER_NO.trim() !== '',
        (supplier) => supplier.COST.trim() !== '',
        (supplier) => supplier.IS_PRIMARY.trim() !== '',
        (supplier) => supplier.IS_CONSIGNMENT.trim() !== '',
      );

    this.formItemsData.ITEM_SUPPLIERS.push({
      SUPP_ID: event.data.SUPP_ID ? Number(event.data.SUPP_ID) : 0,
      REORDER_NO: event.data.REORDER_NO.toString(),
      COST: event.data.COST,
      IS_PRIMARY: event.data.IS_PRIMARY || false,
      IS_CONSIGNMENT: event.data.IS_CONSIGNMENT || false,
    });

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

  // }
  onClickSaveSupplier() { }

  onRowUpdatedAlias(event: any) {
    // Find the index of the alias being updated
    const index = this.formItemsData.ITEM_ALIAS.findIndex(
      (alias) => alias.ALIAS === event.oldData.ALIAS,
    );
    if (index !== -1) {
      // Update the alias value
      this.formItemsData.ITEM_ALIAS[index].ALIAS = event.data.ALIAS;
    }
  }

  onParentItemChanged(event: any) {
    const selectedParentItem = event.selectedRowsData[0]; // Access the first selected item
    if (selectedParentItem) {
      // this.selectedParentItemId = selectedParentItem.ID;
      this.newItems.PARENT_ITEM_ID = selectedParentItem.ID;
      this.selectedParentItemDescription = selectedParentItem.DESCRIPTION;
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

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching items:', error);
        this.isLoading = false;
      },
    );
  }

  // onItemSelected(event: any): void {
  // }

  onItemSelected(event: any): void {
    // Get the selected item from the event's selectedRowsData
    const selectedItem = event.selectedRowsData[0]; // Access the first selected item

    if (selectedItem) {
      this.selectedUom = selectedItem.UNIT_ID;
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
    // const selectedUom = this.newItemList.find(item => === this.)
    const newComponent = {
      COMPONENT_ITEM_ID: this.selectedItemId,
      ITEM_CODE: this.formData.ITEM_CODE,
      DESCRIPTION: this.formData.DESCRIPTION,
      UOM: this.formData.UOM,
      QTY_AVAILABLE: this.formData.QUANTITY,
    };

    // Add the component data to the components array
    this.gridData.push(newComponent);

    this.newItems = {
      ...this.formItemsData, // Copy existing form data
      COMPANY_ID: this.companyId,
      ITEM_COMPONENTS: this.gridData.map((item) => ({
        COMPONENT_ITEM_ID: item.COMPONENT_ITEM_ID, // Map ITEM_CODE to COMPONENT_ITEM_ID
        QUANTITY: item.QTY_AVAILABLE, // Map QTY_AVAILABLE to QUANTITY
        UOM: item.UOM, // Map UOM to UOM
      })),
    };
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

  validateChildQty = (e: any): boolean => {
    // If parent NOT selected → no validation needed
    if (!this.newItems.PARENT_ITEM_ID) {
      return true;
    }

    // If parent selected → qty must be > 0
    return Number(e.value) > 0;
  };
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
export class ItemsFormModule { }
