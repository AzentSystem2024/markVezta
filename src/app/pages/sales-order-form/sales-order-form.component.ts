import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewChild,
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
  DxDataGridComponent,
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
import { QuotationFormComponent } from '../quotation-form/quotation-form.component';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { PatternRule, RequiredRule } from 'devextreme/ui/validation_rules';
import DevExpress from 'devextreme';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-sales-order-form',
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.scss'],
})
export class SalesOrderFormComponent {
  @ViewChild('cutsizeGrid', { static: false })
  cutsizeGrid!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
  isApproved: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  customer: any;
  salesOrderFormData: any = {
    COMPANY_ID: 1,
    FIN_ID: 1,
    STORE_ID: 1,
    SO_DATE: new Date(),
    CUST_ID: 0,
    USER_ID: 67,
    REMARKS: '',
    DELIVERY_ADDRESS: 0,
    WAREHOUSE: 2,
    TOTAL_QTY: 0,
    Details: [
      {
        PACKING_ID: 0,
        BRAND_ID: 0,
        ARTICLE_TYPE: 0,
        CATEGORY_ID: 0,
        ART_NO: 0,
        COLOR_ID: 0,
        CONTENT: '',
        QUANTITY: 0,
      },
    ],
  };
  artNoCache: { [categoryId: string]: any[] } = {};
  private suppressCutsizePopup = false;
  quotationList: any;
  sessionData: any;
  matrixCode: any;
  userID: any;
  finID: any;
  companyID: any;
  storeFromSession: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  items: any;
  popupVisible: boolean = false;
  selectedTab = 0;
  quotationPopupOpened: boolean;

  soNo: any;
  articleDescriptionList: any;
  isDescriptionLoading: boolean;
  catList: any;
  selectedCategory: any;
  selectedDescription: any;
  catColorList: any;
  selectedColor: any;
  catSizeList: any;
  isCutsizePopupVisible: boolean;
  // cutsizeValues: { size: number; value: any }[] = [];
  cutsizeValues: any[] = [];

  cutsizeInputs: {};
  totalErrorMessage: string;
  itemsList: any;
  typeList: any;
  artNoList: any;
  selectedType: any;
  dealerList: any;
  deliveryAddress: any;
  selectedArtNo: any;
  colorList: any;
  packingList: any;
  selectedPacking: any;
  showTotals = false;
  showSaveButton = false;
  totalRequiredQty: any;
  totalQty = 0;
  isTotalQtyValid: boolean;
  validationMessage: string;
  warehouse: any;
  cutsizePairs: string[] = [];
  contentValue: string;
  cutsizeRowIndex: any;
  cutsizeRowKey: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.updateTotalQty();
    this.getListOfItemsInColumn();
    if (
      !this.salesOrderFormData.Details ||
      this.salesOrderFormData.Details.length === 0
    ) {
      this.salesOrderFormData.Details = [];
    }
    this.getDealerDropdown();
    this.getSalesOrderNo();
    // this.getWarehouseDropdown();
    // always fetch fresh number when popup opens

    this.isEditDataAvailable();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );

    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/quotation');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
  }

  isEditDataAvailable() {
    if (this.isEditing && this.EditingResponseData) {
      console.log(
        '🟡 Editing mode enabled. Populating data:',
        this.EditingResponseData
      );

      const response = this.EditingResponseData;

      // ✅ Map backend fields → grid fields
      const mappedDetails = Array.isArray(response.Details)
        ? response.Details.map((item: any) => ({
            ITEM: item.BRAND_ID || 0,
            TYPE: item.ARTICLE_TYPE || 0,
            CATEGORY: item.CATEGORY_ID || 0,
            ARTNO: item.ART_NO || 0,
            COLOR: item.COLOR_ID || 0,
            PACKING: item.PACKING_ID || 0,
            CONTENT: item.CONTENT || '',
            QTY: item.QUANTITY || 0,
            ...item,
          }))
        : [];

      this.salesOrderFormData = {
        ...this.salesOrderFormData,
        ...response,
        SO_DATE: response.SO_DATE ? new Date(response.SO_DATE) : new Date(),
        SO_NO: response.SO_NO,
        Details: mappedDetails,
      };

      console.log('Final mapped SalesOrderFormData:', this.salesOrderFormData);

      //  Bind details to the grid
      setTimeout(() => {
        if (this.itemsGridRef && this.itemsGridRef.instance) {
          this.itemsGridRef.instance.option('dataSource', [...mappedDetails]);
          this.itemsGridRef.instance.refresh();
        }
      }, 300);

      // Populate dropdown chains for first row of Details
      const firstRow = mappedDetails[0];
      if (firstRow) {
        const brandId = firstRow.ITEM;
        const typeId = firstRow.TYPE;
        const categoryId = firstRow.CATEGORY;
        const artNoId = firstRow.ARTNO;
        const colorId = firstRow.COLOR;

        console.log('🔄 Populating dropdowns for edit mode:', firstRow);

        // Load TYPE list
        this.dataService
          .getTypeList({ BRAND_ID: String(brandId) })
          .subscribe((typeRes: any) => {
            this.typeList = typeRes.Data || [];

            // Load CATEGORY list
            this.dataService
              .getCatList({
                BRAND_ID: String(brandId),
                ARTICLE_TYPE: String(typeId),
              })
              .subscribe((catRes: any) => {
                this.catList = catRes.Data || [];

                // Load ARTNO list
                this.dataService
                  .getArtNoList({
                    BRAND_ID: String(brandId),
                    ARTICLE_TYPE: String(typeId),
                    CATEGORY_ID: String(categoryId),
                  })
                  .subscribe((artRes: any) => {
                    this.artNoList = artRes.Data || [];

                    // Load COLOR list
                    this.dataService
                      .getCatColorList({
                        BRAND_ID: String(brandId),
                        ARTICLE_TYPE: String(typeId),
                        CATEGORY_ID: String(categoryId),
                        ARTNO_ID: String(artNoId),
                      })
                      .subscribe((colorRes: any) => {
                        this.colorList = colorRes.Data || [];

                        // Load PACKING list
                        this.dataService
                          .getPackings({
                            BRAND_ID: String(brandId),
                            ARTICLE_TYPE: String(typeId),
                            CATEGORY_ID: String(categoryId),
                            ARTNO_ID: String(artNoId),
                            COLOR: String(colorId),
                          })
                          .subscribe((packRes: any) => {
                            this.packingList = packRes.Data || [];
                            console.log(
                              'All dropdown lists preloaded for edit mode.'
                            );
                            this.cdr.detectChanges();
                          });
                      });
                  });
              });
          });
      }

      // Populate dependent dropdowns (Dealer, Address)
      if (this.salesOrderFormData.CUST_ID) {
        this.onDealerChanged({ value: this.salesOrderFormData.CUST_ID });
      }
      if (this.salesOrderFormData.DELIVERY_ADDRESS) {
        this.onDeliveryAddressChanged({
          value: this.salesOrderFormData.DELIVERY_ADDRESS,
        });
      }

      this.cdr.detectChanges();
    } else {
      console.log('Add mode — no edit data found.');
    }
  }

  private reindexDetails() {
    this.salesOrderFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }

  //Get first column's dropdown list

  getListOfItemsInColumn() {
    this.dataService.getItemsColumnList().subscribe((response: any) => {
      this.itemsList = response.Data;
    });
  }

  onItemValueChanged(e: any) {
    this.selectedDescription = e.value;
    console.log(this.selectedDescription, 'selecteddescription');
    this.selectedType = null;
    this.selectedCategory = null;
    this.selectedArtNo = null;
    this.selectedColor = null;

    const payload = {
      BRAND_ID: String(this.selectedDescription),
    };
    this.isDescriptionLoading = true;

    this.dataService.getTypeList(payload).subscribe({
      next: (response: any) => {
        this.typeList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onTypeValueChanged(e: any) {
    this.selectedType = e.value;
    console.log(e, 'selecteddescriptionnnnnnnnnnn');
    // this.selectedCategory = null;
    // this.selectedArtNo = null;
    // this.selectedColor = null;

    const payload = {
      BRAND_ID: String(this.selectedDescription),
      ARTICLE_TYPE: String(this.selectedType),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatList(payload).subscribe({
      next: (response: any) => {
        this.catList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onCategoryValueChanged(e: any, event?: any) {
    const grid = event?.component;
    const rowKey = event?.row?.key;
    this.selectedCategory = e.value;
    console.log(this.selectedCategory, 'selectedCategoryyyyyyyyyyyyyyy');
    if (grid && rowKey != null) {
      grid.cellValue(rowKey, 'ARTNO', null);
      grid.cellValue(rowKey, 'COLOR', null);
      grid.cellValue(rowKey, 'PACKING', null);
      grid.cellValue(rowKey, 'PAIR_QTY', null);
      grid.refresh(true);
    }

    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
    };
    this.isDescriptionLoading = true;

    this.dataService.getArtNoList(payload).subscribe({
      next: (response: any) => {
        this.artNoList = response.Data || [];
        this.isDescriptionLoading = false;
        if (grid && rowKey != null) {
          grid.repaint(); // ensures new lookup values are rendered
        }
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onArtNoValueChanged(e: any, event?: any) {
    const grid = event?.component;
    const rowKey = event?.row?.key;
    this.selectedArtNo = e.value;
    console.log(this.selectedArtNo, 'selecteddescription');
    // this.selectedColor = null;
    if (grid && rowKey != null) {
      // Clear dependent cells (COLOR, PACKING, PAIR_QTY)
      grid.cellValue(rowKey, 'COLOR', null);
      grid.cellValue(rowKey, 'PACKING', null);
      grid.cellValue(rowKey, 'PAIR_QTY', null);

      // Force the row update to refresh editors
      grid.refresh(true);
    }

    this.colorList = [];
    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
      ARTNO_ID: String(this.selectedArtNo),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatColorList(payload).subscribe({
      next: (response: any) => {
        this.colorList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onColorValueChanged(e: any, event?: any) {
    const grid = event?.component; // Reference to dx-data-grid
    const rowKey = event?.row?.key;
    this.selectedColor = e.value;
    console.log(this.selectedColor, 'selecteddescription');
    if (grid && rowKey != null) {
      grid.cellValue(rowKey, 'PACKING', null); // clear packing cell
      grid.cellValue(rowKey, 'PAIR_QTY', null); // optional: clear dependent quantity
    }

    this.packingList = [];
    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
      ARTNO_ID: String(this.selectedArtNo),
      COLOR: String(this.selectedColor),
    };
    this.isDescriptionLoading = true;

    this.dataService.getPackings(payload).subscribe({
      next: (response: any) => {
        this.packingList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onPackingValueChanged(e: any, event: any) {
    this.selectedPacking = e.value;
    const packingID = {
      PACKING_ID: this.selectedPacking,
    };
    // Get the selected PACKING description text
    const selectedPackingText = this.packingList.find(
      (p) => p.ARTICLE_ID === e.value
    )?.DESCRIPTION;

    console.log('Selected Packing:', selectedPackingText);

    this.dataService.getPairQty(packingID).subscribe((response: any) => {
      this.totalRequiredQty = response.Data[0].PAIR_QTY;
      console.log(' Total Required Qty:', this.totalRequiredQty);
    });
    const rowIndex = event.row?.rowIndex;
    const rowKey = event.row?.key;

    this.cutsizeRowIndex = rowIndex;
    this.cutsizeRowKey = rowKey;
    if (
      selectedPackingText &&
      selectedPackingText.toUpperCase().includes('CUTSIZE')
    ) {
      // Initialize your cutsize grid values before showing popup
      this.prepareCutsizeValues(selectedPackingText);

      // Show popup
      this.showCutsizePopup();
    } else {
      this.isCutsizePopupVisible = false;
    }

    // this.isDescriptionLoading = true;

    // Example API call if needed
    // this.dataService.getSomething(payload).subscribe(...);
  }

  onEditorPreparing(e: any) {
    const autoHeightFields = [
      'ITEM',
      'TYPE',
      'CATEGORY',
      'COLOR',
      'ARTNO',
      'PACKING',
    ];

    if (autoHeightFields.includes(e.dataField) && e.parentType === 'dataRow') {
      e.editorOptions.dropDownOptions = {
        onContentReady: (args: any) => {
          const popupContent =
            args.component?.contentElement?.() || args.component?.content();
          if (!popupContent) return;

          const listElement = popupContent.querySelector('.dx-list');
          if (!listElement) return;

          // Calculate list height
          const totalHeight = listElement.scrollHeight;
          const maxHeight = 180; // ✅ your preferred max height

          // Apply dynamic height but limit it
          const finalHeight = Math.min(totalHeight, maxHeight);

          // Apply styles
          popupContent.style.height = `${finalHeight}px`;
          popupContent.style.overflowY =
            totalHeight > maxHeight ? 'auto' : 'visible';
        },
      };
    }
    if (e.dataField === 'CONTENT' && e.parentType === 'dataRow') {
      e.editorOptions.readOnly = true; // prevent typing

      e.editorOptions.onFocusIn = () => {
        // Open only if packing contains "CUTSIZE"
        const selectedPackingText = e.row.data?.PACKING_NAME || ''; // adjust key if needed
        if (
          !selectedPackingText ||
          !selectedPackingText.toUpperCase().includes('CUTSIZE')
        ) {
          //  Skip popup if not cutsize
          return;
        }

        //  Otherwise open
        this.cutsizeRowIndex = e.row.rowIndex;
        this.isCutsizePopupVisible = true;
        console.log(
          'Cutsize popup opened for row index:',
          this.cutsizeRowIndex
        );
      };
    }
    if (
      e.dataField === 'ITEM' ||
      e.dataField === 'TYPE' ||
      e.dataField === 'CATEGORY' ||
      e.dataField === 'ARTNO' ||
      e.dataField === 'COLOR' ||
      e.dataField === 'PACKING' ||
      e.dataField === 'CONTENT' ||
      e.dataField === 'QTY'
    ) {
      e.editorOptions = e.editorOptions || {};

      // Consistent input height and layout
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons for number editors
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

    const rowKey = e.row?.key;
    const grid = e.component;

    // Only process data rows
    if (e.parentType !== 'dataRow') return;

    // Default editor height
    // e.editorOptions.height = 30;
    // e.editorOptions.elementAttr = { style: 'height: 30px;' };

    // QTY column logic - auto add new empty row
    if (e.dataField === 'QTY') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setCellValue(e.row.data, args.value);

        if (args.value && args.value > 0) {
          const grid = e.component;

          setTimeout(() => {
            const hasEmptyRow = grid
              .getVisibleRows()
              .some((row: any) => !row.data.ITEM);

            if (!hasEmptyRow) {
              const dataSource = grid.getDataSource();
              const store = dataSource.store();

              //Add new empty row without clearing data
              store.push([{ type: 'insert', data: {} }]);

              //Just refresh grid, don't reload
              grid.refresh().then(() => {
                const rows = grid.getVisibleRows();
                if (rows.length > 0) {
                  const lastRowIndex = rows.length - 1;
                  grid.editCell(lastRowIndex, 'ITEM'); // focus new row
                }
              });
            }
          }, 100);
        }
      };
    }

    // ITEM dropdown
    if (e.dataField === 'ITEM') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'ITEM', args.value);
        this.onItemValueChanged(args);
      };
    }

    // TYPE dropdown
    if (e.dataField === 'TYPE') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.typeList || this.typeList || [];
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'TYPE', args.value);
        this.onTypeValueChanged(args);
      };
    }

    // CATEGORY dropdown
    if (e.dataField === 'CATEGORY') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.catList || this.catList || [];
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'CATEGORY', args.value);
        this.onCategoryValueChanged(args);
      };
    }

    // ARTNO dropdown
    if (e.dataField === 'ARTNO') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.artNoList || this.artNoList || [];
      e.editorOptions.valueExpr = 'ARTICLE_ID'; // 👈 added
      e.editorOptions.displayExpr = 'DESCRIPTION'; // 👈 added
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'ARTNO', args.value);
        this.onArtNoValueChanged(args);
      };
    }

    // COLOR dropdown
    if (e.dataField === 'COLOR') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'COLOR', args.value);
        this.onColorValueChanged(args);
      };
    }

    // PACKING dropdown
    if (e.dataField === 'PACKING') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(rowKey, 'PACKING', args.value);
        this.onPackingValueChanged(args, e);
      };
    }

    // SIZE dropdown — capture row index for Cutsize logic
    if (e.dataField === 'SIZE') {
      // e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.value = e.row.data[e.dataField];
      e.editorOptions.onValueChanged = (args: any) => {
        // 🔹 Store the row index globally for later update
        this.cutsizeRowIndex = e.row.rowIndex;
        console.log('Captured cutsize row index:', this.cutsizeRowIndex);

        // Continue normal processing
        e.setValue(args.value);
        grid.cellValue(rowKey, 'SIZE', args.value);

        // Call your Cutsize popup logic
        this.onSizeValueChanged(args);
      };
    }
  }
  itemCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.ITEM || '';
  };
  typeCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.TYPE || '';
  };
  categoryCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.CATEGORY || '';
  };

  artNoCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.ARTNO || '';
  };
  colorCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.COLOR || '';
  };
  packingCellTemplate = (container: any, options: any) => {
    // Show the value from the data row
    container.textContent = options.data.PACKING || '';
  };

  prepareCutsizeValues(packingText: string) {
    // Try to extract range like "10X15"
    const match = packingText.match(/(\d+)\s*[Xx]\s*(\d+)/);

    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);

      this.cutsizeValues = Array.from({ length: end - start + 1 }, (_, i) => ({
        size: start + i,
        value: null,
      }));
    } else {
      // Default structure if no range found
      this.cutsizeValues = [
        { size: 1, value: null },
        { size: 2, value: null },
        { size: 3, value: null },
      ];
    }
  }

  onSizeValueChanged(e: any) {
    const selectedValue = e.value;

    if (selectedValue && selectedValue.toUpperCase().includes('CUTSIZE')) {
      const match = selectedValue.match(/(\d+)\s*[Xx]\s*(\d+)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);

        this.cutsizeValues = Array.from(
          { length: end - start + 1 },
          (_, i) => ({
            size: start + i,
            quantity: null,
          })
        );
      }

      this.showCutsizePopup();
    }
  }

  onCutsizePopupHiding(e: any) {
    console.log(this.selectedPacking, 'SELECTEDPACKINGGGGGGGGGGGGGGGG');
    if (this.totalQty === 0) {
      this.totalErrorMessage = 'Total Qty cannot be 0.';
    } else {
      this.totalErrorMessage = ''; // Clear any previous error
    }
  }

  showCutsizePopup() {
    console.log('Popup triggered');
    this.isCutsizePopupVisible = true;
    this.cdr.detectChanges(); // force UI update if using OnPush
  }

  validateTotalQty = () => {
    // Trigger validation every time grid updates
    if (this.totalQty !== this.totalRequiredQty) {
      if (this.totalQty < this.totalRequiredQty) {
        this.validationMessage = 'Total Qty is less than Total Required Qty.';
      } else {
        this.validationMessage =
          'Total Qty is greater than Total Required Qty.';
      }
      return false;
    }
    this.validationMessage = '';
    return true;
  };

  onCustSizeEditorPreparing(e: any) {
    if (e.dataField === 'quantity' && e.parentType === 'dataRow') {
      e.editorOptions.onKeyPress = (args: any) => {
        if (!/[0-9]/.test(args.event.key)) {
          args.event.preventDefault();
        }
      };
    }

    if (e.dataField === 'quantity') {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

    // Validation logic refinement — other logic untouched
    if (e.dataField === 'quantity' && e.parentType === 'dataRow') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);

        const grid = e.component;
        const allData = grid.getVisibleRows().map((row: any) => row.data);

        const total = allData.reduce(
          (sum: number, row: any) => sum + (Number(row.quantity) || 0),
          0
        );

        this.totalQty = total;

        //  Updated validation logic
        if (this.totalQty !== this.totalRequiredQty) {
          this.isTotalQtyValid = false;
          if (this.totalQty < this.totalRequiredQty) {
            this.validationMessage =
              ' Total Qty is less than Total Required Qty.';
          } else {
            this.validationMessage =
              ' Total Qty is greater than Total Required Qty.';
          }
        } else {
          this.isTotalQtyValid = true;
          this.validationMessage = '';
        }

        //  Force UI refresh so the validation message updates immediately
        this.cdr.detectChanges();

        console.log('Total Quantity:', this.totalQty);
      };
    }
  }

  onCellValueChanged(e: any) {
    if (e.column.dataField === 'quantity') {
      // Update the actual array value manually
      const rowIndex = e.row.rowIndex;
      this.cutsizeValues[rowIndex].quantity = e.value;

      // Now recalculate total
      this.updateTotalQty();
    }
  }

  updateTotalQty() {
    this.totalQty = this.cutsizeValues.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );

    console.log('Total Quantity:', this.totalQty);
  }

  saveCutsizeDetails() {
    // Validate total quantity
    if (this.totalQty !== this.totalRequiredQty) {
      this.totalErrorMessage = '⚠️ Total Qty must match Total Required Qty.';
      console.warn(this.totalErrorMessage);
      return;
    }

    // Filter and build new content string cleanly
    const pairs = this.cutsizeValues
      .filter((r: any) => r.size && r.quantity != null && r.quantity !== '')
      .map((r: any) => `${r.size}*${r.quantity}`);

    const newContent = pairs.join(', ');
    console.log('🧾 New cutsize content:', newContent);

    // 3️⃣ Update the grid row cleanly
    if (this.cutsizeRowIndex !== null && this.cutsizeRowIndex >= 0) {
      const grid = this.itemsGridRef.instance;
      const visibleRows = grid.getVisibleRows();
      const rowData = visibleRows[this.cutsizeRowIndex]?.data;

      if (rowData) {
        //  Step 1: Reset previous content completely
        rowData.CONTENT = '';

        // 🆕 Step 2: Apply only new clean string
        rowData.CONTENT = newContent;

        //  Step 3: Push the updated object back to the grid store
        const rowKey = grid.keyOf(rowData); // ✅ get the correct row key
        grid
          .getDataSource()
          .store()
          .push([{ type: 'update', key: rowKey, data: rowData }]);

        //  Step 4: Refresh visible grid to reflect changes
        grid.refresh();

        console.log(
          `CONTENT updated at row ${this.cutsizeRowIndex}:`,
          rowData.CONTENT
        );
      } else {
        console.warn('Row data not found for Cutsize update.');
      }
    } else {
      console.warn('No valid Cutsize row index found.');
    }

    // Close popup
    this.isCutsizePopupVisible = false;
  }

  // saveCutsizeDetails() {
  //   // ✅ 1. Validate quantities
  //   if (this.totalQty !== this.totalRequiredQty) {
  //     this.totalErrorMessage = '⚠️ Total Qty must match Total Required Qty.';
  //     console.warn(this.totalErrorMessage);
  //     return;
  //   }

  //   // ✅ 2. Build the pair string like "6*10, 7*5, 8*5, 9*5"
  //   const pairs = this.cutsizeValues
  //     .filter((r: any) => r.size && r.quantity != null)
  //     .map((r: any) => `${r.size}*${r.quantity}`);

  //   const contentValue = pairs.join(', ');
  //   console.log('✅ Content to insert:', contentValue);

  //   // ✅ 3. Update CONTENT column of the current grid row
  //   if (this.cutsizeRowIndex !== null && this.cutsizeRowIndex >= 0) {
  //     this.itemsGridRef.instance.cellValue(
  //       this.cutsizeRowIndex,
  //       'CONTENT',
  //       contentValue
  //     );

  //     // Optional: also update quantity or any other related field
  //     // this.itemsGridRef.instance.cellValue(this.cutsizeRowIndex, 'QUANTITY', this.totalQty);

  //     // this.itemsGridRef.instance.refresh();
  //     console.log(
  //       `🟢 CONTENT updated in row ${this.cutsizeRowIndex}:`,
  //       contentValue
  //     );
  //   } else {
  //     console.warn('⚠️ No valid row index stored for Cutsize update.');
  //   }

  //   // ✅ 4. Close popup
  //   this.isCutsizePopupVisible = false;
  // }

  addNewRow() {
    this.dataGrid.instance.addRow();
  }
  addQuotation() {
    this.quotationPopupOpened = true;
    setTimeout(() => {
      if (this.quotationGrid) {
        this.quotationGrid.instance.clearSelection();
      }
    });
  }

  // getWarehouseDropdown() {
  //   this.dataService.getDropdownData('WAREHOUSE').subscribe((response: any) => {
  //     this.warehouse = response;
  //   });
  // }

  getDealerDropdown() {
    this.dataService.getDropdownData('DEALER').subscribe((response: any) => {
      this.dealerList = response;
    });
  }

  onDealerChanged(e: any) {
    const selectedDealerId = e.value; // this gives the selected dealer's ID
    console.log('Selected Dealer ID:', selectedDealerId);

    if (selectedDealerId) {
      this.getDeliveryAddressDropdown(selectedDealerId);
      this.getWarehouseList(selectedDealerId);
    }
  }
  getWarehouseList(dealerId: number) {
    const payload = {
      CUST_ID: dealerId,
    };
    this.dataService.getWarehouse(payload).subscribe((response: any) => {
      this.warehouse = response.Data;
      if (this.warehouse.length > 0) {
        this.salesOrderFormData.WAREHOUSE = this.warehouse[0].ID;
      } else {
        // Clear if no data found
        this.salesOrderFormData.WAREHOUSE = null;
      }
    });
  }
  getDeliveryAddressDropdown(dealerId: number) {
    const payload = {
      CUST_ID: dealerId,
    };

    this.dataService.getDealerDropdown(payload).subscribe((response: any) => {
      this.deliveryAddress = response || [];

      if (this.deliveryAddress.length > 0) {
        // Automatically bind first delivery address
        const firstAddress = this.deliveryAddress[0];
        this.salesOrderFormData.DELIVERY_ADDRESS = firstAddress.Id;

        // Optional: If you want to auto-fill address text as well
        this.salesOrderFormData.ADDRESS = firstAddress.DELIVERYADDRESS;

        // Optionally trigger any change logic if needed
        this.onDeliveryAddressChanged({ value: firstAddress.Id });
      } else {
        // No addresses found — clear the field
        this.salesOrderFormData.DELIVERY_ADDRESS = null;
        this.salesOrderFormData.ADDRESS = '';
      }
    });
  }

  onDeliveryAddressChanged(e: any) {
    const selectedId = e.value;
    const selectedAddress = this.deliveryAddress.find(
      (item: any) => item.Id === selectedId
    );

    if (selectedAddress) {
      this.salesOrderFormData.ADDRESS = selectedAddress.ADDRESS;
    } else {
      this.salesOrderFormData.ADDRESS = '';
    }
  }
  onAddRow() {
    const newRow = {
      PACKING_ID: 0,
      BRAND_ID: 0,
      ARTICLE_TYPE: 0,
      CATEGORY_ID: 0,
      ART_NO: 0,
      COLOR_ID: 0,
      CONTENT: '',
      QUANTITY: 0,
    };

    // Push the new row to the end of the array
    this.salesOrderFormData.Details.push(newRow);

    // Refresh grid display (replace `#dataGrid` with your ViewChild name)
    this.dataGrid.instance.refresh();
  }

  calculateSerialNumber = (rowData: any) => {
    const index = this.salesOrderFormData.Details.indexOf(rowData);
    return index + 1;
  };

  getSalesOrderNo() {
    this.dataService.getVoucherNoForSalesOrder().subscribe(
      (response: any) => {
        if (response?.Flag === 1 && response?.Data?.length) {
          this.salesOrderFormData.SO_NO = response.Data[0].VOCHERNO;
          console.log(this.salesOrderFormData.SO_NO, 'SONO');
        } else {
          console.error('No data returned for voucher number');
        }
      },
      (err) => {
        console.error('API error:', err);
      }
    );
  }

  calculateTotalQuantity(): number {
    return this.salesOrderFormData.Details.reduce(
      (sum: number, item: any) => sum + (Number(item.QTY) || 0),
      0
    );
  }

  cancel() {
    this.popupClosed.emit();
  }

  saveSalesOrder() {
    // --- Basic validation ---
    if (!this.salesOrderFormData.CUST_ID) {
      notify('Please select a Dealer before saving.', 'warning', 2000);
      return;
    }

    if (
      !this.salesOrderFormData.Details ||
      this.salesOrderFormData.Details.length === 0
    ) {
      notify('Please add at least one item to the order.', 'warning', 2000);
      return;
    }

    // --- Filter valid rows ---
    const validDetails = this.salesOrderFormData.Details.filter((d: any) => {
      return (
        d.ITEM ||
        d.TYPE ||
        d.CATEGORY ||
        d.ARTNO ||
        d.COLOR ||
        (d.QTY && Number(d.QTY) > 0)
      );
    });

    if (validDetails.length === 0) {
      notify(
        'Please add at least one valid item before saving.',
        'warning',
        2000
      );
      return;
    }

    // --- Total Qty ---
    const totalQty = validDetails.reduce(
      (sum: number, d: any) => sum + (Number(d.QTY) || 0),
      0
    );

    // --- Format date (yyyy-MM-dd) ---
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    // --- Build payload ---
    const payload: any = {
      COMPANY_ID: this.salesOrderFormData.COMPANY_ID,
      FIN_ID: this.salesOrderFormData.FIN_ID,
      STORE_ID: this.salesOrderFormData.STORE_ID,
      SO_DATE: formatDate(this.salesOrderFormData.SO_DATE),
      CUST_ID: this.salesOrderFormData.CUST_ID,
      USER_ID: this.salesOrderFormData.USER_ID,
      REMARKS: this.salesOrderFormData.REMARKS,
      DELIVERY_ADDRESS: this.salesOrderFormData.DELIVERY_ADDRESS,
      WAREHOUSE: this.salesOrderFormData.WAREHOUSE,
      TOTAL_QTY: totalQty,
      Details: validDetails.map((d: any) => ({
        PACKING_ID: d.PACKING || 0,
        BRAND_ID: d.ITEM || 0,
        ARTICLE_TYPE: d.TYPE || 0,
        CATEGORY_ID: d.CATEGORY || 0,
        ART_NO: d.ARTNO || 0,
        COLOR_ID: d.COLOR || 0,
        QUANTITY: d.QTY || 0,
        CONTENT: d.CONTENT || '',
      })),
    };

    // --- Add ID for update ---
    if (this.salesOrderFormData.ID) {
      payload.ID = this.salesOrderFormData.ID;
    }

    console.log('🟢 Final payload before saving/updating:', payload);

    // --- Determine which API to call ---
    let apiCall;
    let message = '';

    if (this.isApproved) {
      // ✅ Confirm approval before calling API
      const result = confirm(
        'Are you sure you want to approve this Sales Order?',
        'Confirm Approval'
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          // User confirmed → call approve API
          apiCall = this.dataService.approveSalesOrder(payload);
          message = 'Sales Order approved successfully!';
          this.callApi(apiCall, message);
        } else {
          notify('Approval cancelled.', 'info', 1500);
        }
      });

      return; // stop further execution
    }

    if (this.salesOrderFormData.ID) {
      apiCall = this.dataService.updateSalesOrder(payload);
      message = 'Sales Order updated successfully!';
    } else {
      apiCall = this.dataService.saveSalesOrder(payload);
      message = 'Sales Order saved successfully!';
    }

    this.callApi(apiCall, message);
  }

  // --- Reusable helper for all API calls ---
  private callApi(apiCall: any, successMessage: string) {
    apiCall.subscribe({
      next: (response: any) => {
        if (response.Flag === '1' || response.Flag === 1) {
          notify(successMessage, 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify(response.Message || 'Operation failed.', 'error', 2000);
        }
      },
      error: (err) => {
        console.error('❌ API failed:', err);
        notify('Error performing operation. Please try again.', 'error', 2000);
      },
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
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxTabPanelModule,
    DxTabsModule,
  ],
  providers: [],
  declarations: [SalesOrderFormComponent],
  exports: [SalesOrderFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesOrderFormModule {}
