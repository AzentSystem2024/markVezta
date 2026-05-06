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
import { forkJoin } from 'rxjs';

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
    COMPANY_ID: 0,
    FIN_ID: 0,
    STORE_ID: 0,
    SO_DATE: new Date(),
    CUST_ID: 0,
    SUBDEALER_ID: 0,
    USER_ID: 67,
    REMARKS: '',
    DELIVERY_ADDRESS: 0,
    WAREHOUSE: 2,
    TOTAL_QTY: 0,
    IS_APPROVED: false,
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
  selectedPackingID: any;
  subDealerList: any;
  combination: any;
  dealerID: any;
  selectedSubdealerId: any;
  isSaving = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    console.log(menuResponse, 'COMPANYIDDDDDDDDDDDDDDDDD');
    const menuGroups = menuResponse.MenuGroups || [];
    this.salesOrderFormData.STORE_ID = menuResponse.Configuration[0].STORE_ID;
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/sales-order');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.updateTotalQty();
    this.getListOfItemsInColumn();
    if (
      !this.salesOrderFormData.Details ||
      this.salesOrderFormData.Details.length === 0
    ) {
      this.salesOrderFormData.Details = [];
    }
    this.getDealerDropdown();
    if (!this.isEditing) {
      this.getSalesOrderNo();
    }
    // this.getWarehouseDropdown();
    // always fetch fresh number when popup opens

    this.isEditDataAvailable();
  }

  isEditDataAvailable() {
    if (this.isEditing && this.EditingResponseData) {
      console.log(
        'Editing mode enabled. Populating data:',
        this.EditingResponseData,
      );

      const response = this.EditingResponseData;

      // Map backend fields → grid fields
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
          this.salesOrderFormData.Details = mappedDetails;
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

        console.log(' Populating dropdowns for edit mode:', firstRow);

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
                              'All dropdown lists preloaded for edit mode.',
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

  onItemValueChanged(e: any, row: any) {
    this.selectedDescription = e.value;
    console.log(this.selectedDescription, 'selecteddescription');
    this.selectedType = null;
    this.selectedCategory = null;
    this.selectedArtNo = null;
    this.selectedColor = null;
    const grid = this.itemsGridRef?.instance;
    const rowIndex = row.rowIndex;
    grid.cellValue(rowIndex, 'TYPE', null);
    grid.cellValue(rowIndex, 'CATEGORY', null);
    grid.cellValue(rowIndex, 'ARTNO', null);
    grid.cellValue(rowIndex, 'COLOR', null);
    grid.cellValue(rowIndex, 'PACKING', null);
    grid.cellValue(rowIndex, 'CONTENT', '');

    const payload = {
      BRAND_ID: String(this.selectedDescription),
    };
    this.isDescriptionLoading = true;

    this.dataService.getTypeList(payload).subscribe({
      next: (response: any) => {
        this.typeList = response.Data || [];
        this.isDescriptionLoading = false;
        // Move focus to the next cell ("TYPE") after loading completes
        // setTimeout(() => {
        //   grid.editCell(rowIndex, 'TYPE');
        // }, 100);
        if (e.dataField === 'ITEM') {
          e.editorOptions.onKeyDown = (event: any) => {
            if (event.event.key === 'Enter') {
              const grid = e.component;
              const rowIndex = e.row.rowIndex;
              // Move focus to the "ledgerCode" column in the same row
              setTimeout(() => {
                grid.focus(grid.getCellElement(rowIndex, 'TYPE'));
              });
            }
          };
        }
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onTypeValueChanged(e: any, row: any) {
    this.selectedType = e.value;
    const brandId = row.data.ITEM;

    this.selectedCategory = null;
    this.selectedArtNo = null;
    this.selectedColor = null;
    console.log(e, 'selecteddescriptionnnnnnnnnnn');

    const grid = this.itemsGridRef?.instance;
    const rowIndex = row.rowIndex;

    grid.cellValue(rowIndex, 'CATEGORY', null);
    grid.cellValue(rowIndex, 'ARTNO', null);
    grid.cellValue(rowIndex, 'COLOR', null);
    grid.cellValue(rowIndex, 'PACKING', null);
    grid.cellValue(rowIndex, 'CONTENT', '');

    const payload = {
      BRAND_ID: String(brandId),
      ARTICLE_TYPE: String(this.selectedType),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatList(payload).subscribe({
      next: (response: any) => {
        this.catList = response.Data || [];
        this.isDescriptionLoading = false;
        setTimeout(() => {
          grid.editCell(rowIndex, 'CATEGORY');
        }, 100);
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onCategoryValueChanged(e: any, event?: any) {
    const grid = event?.component;
    const gridRow = this.itemsGridRef?.instance;
    const rowIndex = event.rowIndex;
    const rowKey = event?.row?.key;
    const rowData = event?.row?.data; // 🔹 get current row object

    this.selectedCategory = e.value;
    console.log(this.selectedCategory, 'selectedCategoryyyyyyyyyyyyyyy');

    gridRow.cellValue(rowIndex, 'ARTNO', null);
    gridRow.cellValue(rowIndex, 'COLOR', null);
    gridRow.cellValue(rowIndex, 'PACKING', null);
    gridRow.cellValue(rowIndex, 'CONTENT', '');

    const typeID = event.data.TYPE;
    const catID = event.data.CATEGORY;
    const itemID = event.data.ITEM;

    const payload = {
      ARTICLE_TYPE: String(typeID),
      CATEGORY_ID: String(catID),
      BRAND_ID: String(itemID),
    };

    this.isDescriptionLoading = true;

    this.dataService.getArtNoList(payload).subscribe({
      next: (response: any) => {
        const artNoList = response.Data || [];
        this.isDescriptionLoading = false;
        setTimeout(() => {
          grid.editCell(rowIndex, 'ARTNO');
        }, 100);
        // 🔹 Assign at both row level & component level
        if (rowData) rowData.artNoList = artNoList;
        this.artNoList = artNoList;

        // 🔹 Force refresh so new lookup values appear
        if (grid && rowKey != null) {
          grid.repaint();
        }
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onArtNoValueChanged(e: any, event?: any) {
    const grid = event?.component;
    const gridRow = this.itemsGridRef?.instance;
    const rowIndex = event.rowIndex;
    const rowKey = event?.row?.key;
    this.selectedArtNo = e.value;
    console.log(this.selectedArtNo, 'selecteddescription');
    // this.selectedColor = null;
    gridRow.cellValue(rowIndex, 'COLOR', null);
    gridRow.cellValue(rowIndex, 'PACKING', null);
    gridRow.cellValue(rowIndex, 'CONTENT', '');

    const typeID = event.data.TYPE;
    const catID = event.data.CATEGORY;
    const itemID = event.data.ITEM;
    const artNo = event.data.ARTNO;

    this.colorList = [];
    const payload = {
      ARTICLE_TYPE: String(typeID),
      CATEGORY_ID: String(catID),
      BRAND_ID: String(itemID),
      ARTNO_ID: String(artNo),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatColorList(payload).subscribe({
      next: (response: any) => {
        this.colorList = response.Data || [];
        this.isDescriptionLoading = false;
        setTimeout(() => {
          grid.editCell(rowIndex, 'COLOR');
        }, 100);
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onColorValueChanged(e: any, event?: any) {
    const grid = event?.component; // Reference to dx-data-grid
    const rowKey = event?.row?.key;
    const gridRow = this.itemsGridRef?.instance;
    const rowIndex = event.rowIndex;
    this.selectedColor = e.value;
    console.log(this.selectedColor, 'selecteddescription');
    gridRow.cellValue(rowIndex, 'PACKING', null);
    gridRow.cellValue(rowIndex, 'CONTENT', '');

    const typeID = event.data.TYPE;
    const catID = event.data.CATEGORY;
    const itemID = event.data.ITEM;
    const artNo = event.data.ARTNO;
    const color = event.data.COLOR;

    this.packingList = [];
    const payload = {
      ARTICLE_TYPE: String(typeID),
      CATEGORY_ID: String(catID),
      BRAND_ID: String(itemID),
      ARTNO_ID: String(artNo),
      COLOR: String(color),
    };
    this.isDescriptionLoading = true;

    this.dataService.getPackings(payload).subscribe({
      next: (response: any) => {
        this.packingList = response.Data || [];
        this.isDescriptionLoading = false;
        setTimeout(() => {
          grid.editCell(rowIndex, 'PACKING');
        }, 100);
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onPackingValueChanged(e: any, event: any) {
    this.selectedPacking = e.value;
    console.log(e, 'PACKINGVALUECHANGEDDDDDDDDDDDDDDDDD');
    const packingID = {
      PACKING_ID: this.selectedPacking,
    };

    this.selectedPackingID = this.packingList.find(
      (p) => p.DESCRIPTION === e.value,
    )?.ARTICLE_ID;
    const selectedPackingId = {
      PACKING_ID: this.selectedPackingID,
    };
    // Get the selected PACKING description text
    const selectedPackingText = this.packingList.find(
      (p) => p.ARTICLE_ID === e.value,
    )?.DESCRIPTION;

    console.log('Selected Packing:', selectedPackingText);

    this.dataService
      .getPairQty(selectedPackingId)
      .subscribe((response: any) => {
        this.totalRequiredQty = response.Data[0].PAIR_QTY;
        console.log(' Total Required Qty:', this.totalRequiredQty);
        const data = response.Data[0];
        this.combination = data.COMBINATION;
        console.log(this.combination, 'COMBINATION');
        const grid = event.component;
        grid.cellValue(rowIndex, 'CONTENT', this.combination);
      });

    const rowIndex = event.row?.rowIndex;
    const rowKey = event.row?.key;

    this.cutsizeRowIndex = rowIndex;
    this.cutsizeRowKey = rowKey;
    if (
      this.selectedPacking &&
      this.selectedPacking.toUpperCase().includes('CUTSIZE')
    ) {
      // Initialize your cutsize grid values before showing popup
      this.prepareCutsizeValues(this.selectedPacking);

      // Show popup
      this.showCutsizePopup();
    } else {
      this.isCutsizePopupVisible = false;
      const grid = event.component; // dx-data-grid instance
      grid.cellValue(rowIndex, 'CONTENT', this.combination);
    }

    // this.isDescriptionLoading = true;

    // Example API call if needed
    // this.dataService.getSomething(payload).subscribe(...);
  }

  onEditorPreparing(e: any) {
    const grid = e.component;
    const row = e.row?.data;
    const rowIndex = e.row?.rowIndex;
    const field = e.dataField;

    if (e.parentType !== 'dataRow') return;

    /** ---------------------- Common Style & Height ---------------------- */
    const uniformFields = [
      'ITEM',
      'TYPE',
      'CATEGORY',
      'ARTNO',
      'COLOR',
      'PACKING',
      'CONTENT',
      'QTY',
    ];
    if (uniformFields.includes(field)) {
      e.editorOptions = {
        ...e.editorOptions,
        elementAttr: {
          style:
            'height: 100%; display: flex; align-items: center; padding: 0;',
        },
        inputAttr: {
          style: 'height: 100%; padding: 0 4px; box-sizing: border-box;',
        },
      };

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

    /** ---------------------- Auto-height Dropdowns ---------------------- */
    const dropdownFields = [
      'ITEM',
      'TYPE',
      'CATEGORY',
      'COLOR',
      'ARTNO',
      'PACKING',
    ];
    if (dropdownFields.includes(field)) {
      e.editorOptions.dropDownOptions = {
        onContentReady: (args: any) => {
          const content =
            args.component?.contentElement?.() || args.component?.content();
          const list = content?.querySelector('.dx-list');
          if (!list) return;
          const h = Math.min(list.scrollHeight, 180);
          content.style.height = `${h}px`;
          content.style.overflowY =
            list.scrollHeight > 180 ? 'auto' : 'visible';
        },
      };
    }

    /** ---------------------- QTY Logic ---------------------- */
    if (field === 'QTY') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setCellValue(e.row.data, args.value);

        if (args.value > 0) {
          setTimeout(() => {
            const rows = grid.getVisibleRows();
            const hasEmpty = rows.some((r: any) => !r.data.ITEM);
            if (!hasEmpty) {
              const store = grid.getDataSource().store();
              store.push([{ type: 'insert', data: {} }]);
              grid.refresh().then(() => {
                grid.editCell(rows.length, 'ITEM');
              });
            }
          }, 100);
        }
      };
    }

    /** ---------------------- Dropdown Change Logic ---------------------- */
    const fieldHandlers = {
      ITEM: (args: any) => this.onItemValueChanged(args, e.row),
      TYPE: (args: any) => this.onTypeValueChanged(args, e.row),
      CATEGORY: (args: any) => this.onCategoryValueChanged(args, e),
      ARTNO: (args: any) => this.onArtNoValueChanged(args, e.row),
      COLOR: (args: any) => this.onColorValueChanged(args, e.row),
      PACKING: (args: any) => this.onPackingValueChanged(args, e),
    };

    if (fieldHandlers[field]) {
      e.editorOptions.value = row?.[field];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        grid.cellValue(e.row.key, field, args.value);
        fieldHandlers[field](args);
      };
    }

    /** ---------------------- Lazy Dropdown Fetch ---------------------- */
    const fetchMap: Record<string, any> = {
      ARTNO: this.dataService.getArtNoList.bind(this.dataService),
      COLOR: this.dataService.getCatColorList.bind(this.dataService),
      PACKING: this.dataService.getPackings.bind(this.dataService),
    };

    if (fetchMap[field]) {
      e.editorOptions.dataSource = row?.[`${field.toLowerCase()}List`] || [];

      e.editorOptions.onOpened = (args: any) => {
        const editor = args.component;
        editor.option('dataSource', []); // Clear stale data

        const payload = {
          BRAND_ID: String(row.ITEM),
          ARTICLE_TYPE: String(row.TYPE),
          CATEGORY_ID: String(row.CATEGORY),
          ARTNO_ID: String(row.ARTNO),
          COLOR: String(row.COLOR),
        };

        fetchMap[field](payload).subscribe({
          next: (res: any) => {
            const list = res.Data || [];
            row[`${field.toLowerCase()}List`] = list;
            editor.option('dataSource', list);
          },
          error: (err: any) =>
            console.error(`Error loading ${field} list:`, err),
        });
      };
    }

    /** ---------------------- CONTENT Focus-in Popup ---------------------- */
    if (field === 'CONTENT') {
      e.editorOptions.readOnly = true;

      e.editorOptions.onFocusIn = () => {
        const packing = e.row.data?.PACKING || '';

        // only if PACKING has 'CUTSIZE'
        if (packing?.toUpperCase().includes('CUTSIZE')) {
          this.cutsizeRowIndex = e.row.rowIndex;
          this.cutsizeRowKey = e.row.key;

          console.log(this.packingList);
          console.log(packing);

          this.selectedPackingID = this.packingList.find(
            (p) => p.DESCRIPTION === packing,
          )?.ARTICLE_ID;
          const selectedPackingId = {
            PACKING_ID: this.selectedPackingID,
          };

          this.dataService
            .getPairQty(selectedPackingId)
            .subscribe((response: any) => {
              this.totalRequiredQty = response.Data[0].PAIR_QTY;
              console.log(' Total Required Qty:', this.totalRequiredQty);
            });

          // prepare the popup data again — same logic as in onPackingValueChanged
          this.prepareCutsizeValues(packing);

          // show popup
          this.isCutsizePopupVisible = true;
        }
      };
    }

    /** ---------------------- SIZE Logic ---------------------- */
    if (field === 'SIZE') {
      e.editorOptions.onValueChanged = (args: any) => {
        this.cutsizeRowIndex = rowIndex;
        e.setValue(args.value);
        grid.cellValue(e.row.key, 'SIZE', args.value);
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
          }),
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
    this.totalErrorMessage = '';
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
          0,
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
      0,
    );

    console.log('Total Quantity:', this.totalQty);
  }

  saveCutsizeDetails() {
    // Validate total quantity
    if (this.totalQty !== this.totalRequiredQty) {
      this.totalErrorMessage = ' Total Qty must match Total Required Qty.';
      console.warn(this.totalErrorMessage);
      return;
    }

    // Filter and build new content string cleanly
    const pairs = this.cutsizeValues
      .filter((r: any) => r.size && r.quantity != null && r.quantity !== '')
      .map((r: any) => `${r.size}*${r.quantity}`);

    const newContent = pairs.join(', ');
    console.log(' New cutsize content:', newContent);

    // Update the grid row cleanly
    if (this.cutsizeRowIndex !== null && this.cutsizeRowIndex >= 0) {
      const grid = this.itemsGridRef.instance;
      const visibleRows = grid.getVisibleRows();
      const rowData = visibleRows[this.cutsizeRowIndex]?.data;

      if (rowData) {
        //  Step 1: Reset previous content completely
        rowData.CONTENT = '';

        // Step 2: Apply only new clean string
        rowData.CONTENT = newContent;

        //  Step 3: Push the updated object back to the grid store
        const rowKey = grid.keyOf(rowData); //  get the correct row key
        grid
          .getDataSource()
          .store()
          .push([{ type: 'update', key: rowKey, data: rowData }]);

        //  Step 4: Refresh visible grid to reflect changes
        grid.refresh();

        console.log(
          `CONTENT updated at row ${this.cutsizeRowIndex}:`,
          rowData.CONTENT,
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
    const payload = {
      NAME: 'DEALER',
      COMPANY_ID: this.companyID,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.dealerList = response;
    });
  }

  onDealerChanged(e: any) {
    const selectedDealerId = e.value; // this gives the selected dealer's ID
    this.dealerID = selectedDealerId;
    console.log('Selected Dealer ID:', selectedDealerId);

    if (selectedDealerId) {
      // this.getDeliveryAddressDropdown(selectedDealerId);
      this.getSubDealer(selectedDealerId);
      this.getWarehouseList(selectedDealerId);
    }
  }

  getSubDealer(dealerId: number) {
    const payload = {
      DEALER_ID: dealerId,
    };
    this.dataService.getSubdealer(payload).subscribe((response: any) => {
      this.subDealerList = response;
      if (this.subDealerList.length == 0) {
        this.getDeliveryAddressDropdown(dealerId);
      }
      console.log(response, 'SUBDEALERRRRRRRRRRRRRRRRR');
    });
  }

  onSuDealerValueChanged(event: any) {
    this.selectedSubdealerId = event.value;
    this.getDeliveryAddressDropdown(this.selectedSubdealerId);
  }
  getWarehouseList(dealerId: number) {
    const payload = {
      CUST_ID: dealerId,
      COMPANY_ID: this.companyID,
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
      COMPANY_ID: this.companyID,
    };

    this.dataService.getDealerDropdown(payload).subscribe((response: any) => {
      this.deliveryAddress = response || [];
      console.log(this.deliveryAddress, '===============delivery address');
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
      (item: any) => item.Id === selectedId,
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
      },
    );
  }

  calculateTotalQuantity(): number {
    return this.salesOrderFormData.Details.reduce(
      (sum: number, item: any) => sum + (Number(item.QTY) || 0),
      0,
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
        2000,
      );
      return;
    }

    // --- Total Qty ---
    const totalQty = validDetails.reduce(
      (sum: number, d: any) => sum + (Number(d.QTY) || 0),
      0,
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
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.salesOrderFormData.STORE_ID,
      SO_DATE: formatDate(this.salesOrderFormData.SO_DATE),
      CUST_ID: this.salesOrderFormData.CUST_ID,
      SUBDEALER_ID: this.salesOrderFormData.SUBDEALER_ID,
      USER_ID: this.salesOrderFormData.USER_ID,
      REMARKS: this.salesOrderFormData.REMARKS,
      DELIVERY_ADDRESS: this.salesOrderFormData.DELIVERY_ADDRESS,
      WAREHOUSE: this.salesOrderFormData.WAREHOUSE,
      IS_APPROVED: this.salesOrderFormData.IS_APPROVED,
      TOTAL_QTY: totalQty,
      Details: validDetails.map((d: any) => ({
        PACKING_ID: d.PACKING || '',
        BRAND_ID: d.ITEM || '',
        ARTICLE_TYPE: d.TYPE || '',
        CATEGORY_ID: d.CATEGORY || '',
        ART_NO: d.ARTNO || '',
        COLOR_ID: d.COLOR || '',
        QUANTITY: d.QTY || 0,
        CONTENT: d.CONTENT || '',
      })),
    };

    // --- Add ID for update ---
    if (this.salesOrderFormData.ID) {
      payload.ID = this.salesOrderFormData.ID;
    }

    console.log('Final payload before saving/updating:', payload);

    // --- Determine which API to call ---
    let apiCall;
    let message = '';

    if (this.isEditing && this.salesOrderFormData.IS_APPROVED) {
      // Confirm approval before calling API
      const result = confirm(
        'Are you sure you want to approve this Sales Order?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;
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
      console.log('SALESORDEREDIT');
      console.log(payload, 'PAYLOAD');
      this.isSaving = true;
      // apiCall = this.dataService.updateSalesOrder(payload);
      // message = 'Sales Order updated successfully!';
      this.callApi(
        this.dataService.updateSalesOrder(payload),
        'Sales Order updated successfully!',
      );
      return;
    }

    if (this.salesOrderFormData.IS_APPROVED) {
      // Show confirmation before insert
      const result = confirm(
        'Are you sure you want to save and approve this Sales Order?',
        'Confirm Save & Approve',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          //  Run API inside Angular zone
          this.ngZone.run(() => {
            this.isSaving = true;
            this.callApi(
              this.dataService.saveSalesOrder(payload),
              'Sales Order saved & approved successfully!',
            );
          });
        } else {
          notify('Save cancelled.', 'info', 1500);
        }
      });
    } else {
      this.isSaving = true;
      // Normal save (no confirmation)
      this.callApi(
        this.dataService.saveSalesOrder(payload),
        'Sales Order saved successfully!',
      );
    }
    // else {
    //   apiCall = this.dataService.saveSalesOrder(payload);
    //   message = 'Sales Order saved successfully!';
    // }

    // this.callApi(apiCall, message);
  }

  // --- Reusable helper for all API calls ---
  private callApi(apiCall: any, successMessage: string) {
    apiCall.subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (response.Flag === '1' || response.Flag === 1) {
          notify(successMessage, 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify(response.Message || 'Operation failed.', 'error', 2000);
        }
      },
      error: (err) => {
        this.isSaving = false; // ✅ STOP loading
        console.error('API failed:', err);

        notify(
          err?.status === 0
            ? 'Network error. Please check your internet connection.'
            : 'Error performing operation. Please try again.',
          'error',
          2000,
        );
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
export class SalesOrderFormModule { }
