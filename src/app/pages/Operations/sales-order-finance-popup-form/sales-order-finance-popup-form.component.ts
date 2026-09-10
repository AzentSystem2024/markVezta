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
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
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
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { PatternRule, RequiredRule } from 'devextreme/ui/validation_rules';
import DevExpress from 'devextreme';
import { confirm } from 'devextreme/ui/dialog';
import { forkJoin } from 'rxjs';
import { Console } from 'console';

@Component({
  selector: 'app-sales-order-finance-popup-form',
  templateUrl: './sales-order-finance-popup-form.component.html',
  styleUrls: ['./sales-order-finance-popup-form.component.scss'],
})
export class SalesOrderFinancePopupFormComponent {
  @ViewChild('cutsizeGrid', { static: false })
  cutsizeGrid!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
  @ViewChild('supplierItemsGrid') supplierItemsGrid: DxDataGridComponent;
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
  DealerItems: any[] = [];
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
    REF_NO: '',
    Details: [
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
  items: any;
  popupVisible: boolean = false;
  selectedTab = 0;
  quotationPopupOpened: boolean;
  showAddItemPopup = false;

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
  cutsizeValues: any[] = [];
  selectedItems = [];
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
  supplierItems: any;
  apiVatPerc: number;
  popupGridLoading = false;
  isItemAlreadySelected = (item: any): boolean => {
    return this.salesOrderFormData.Details?.some(
      (d: any) => d.ITEM_ID === item.ITEM_ID,
    );
  };
  showTemplatePopup: boolean = false;
  isPreviewPopupVisible: boolean = false;
  templateList: any[] = [];
  selectedTemplate: string | null = null;
  isLoadingPdf: boolean = false;
  pdfBlobUrl: string | null = null;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  currentPdfBlob: Blob | null = null;

  isEmailPopupVisible: boolean = false;
  emailReceivers: string[] = [];
  selectedEmails: string[] = [];
  emailSubject: string = '';
  emailBody: string = '';
  isSendingEmail: boolean = false;
  emailSettingsData: any = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
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
      .find((menu: any) => menu.Path === '/sales-order-finance');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
    } else {
    }
    this.updateTotalQty();
    this.getListOfItemsInColumn();
    this.getDealerDropdown();
    if (!this.isEditing) {
      this.getSalesOrderNo();
    }

    this.isEditDataAvailable();
  }

  onSelectionChanged(event: any) {
    const filtered = event.selectedRowsData.filter(
      (item: any) => !this.isItemAlreadySelected(item),
    );

    if (filtered.length !== event.selectedRowsData.length) {
      notify(
        'Some items are already added and cannot be selected.',
        'warning',
        2000,
      );
    }

    this.selectedItems = filtered;
  }

  isEditDataAvailable() {
    if (this.isEditing && this.EditingResponseData) {
      console.log(
        'Editing mode enabled. Populating data:',
        this.EditingResponseData,
      );

      const response = this.EditingResponseData;

      const mappedDetails = Array.isArray(response.Details)
        ? response.Details.map((item: any) => ({
            ITEM_CODE: item.ITEM_CODE || 0,
            DESCRIPTION: item.ITEM_DESCRIPTION || 0,
            UOM: item.UOM || 0,
            TAX_PERCENT: item.TAX_PERCENT || 0,
            STOCK_QTY: item.QUANTITY || 0,
            PRICE: item.PRICE || 0,
            AMOUNT: item.AMOUNT || '',
            TAX_AMOUNT: item.TAX_AMOUNT || 0,
            TOTAL_AMOUNT: item.TOTAL_AMOUNT || 0,
            CUST_ID: response.CUST_ID,
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

      setTimeout(() => {
        if (this.itemsGridRef && this.itemsGridRef.instance) {
          this.salesOrderFormData.Details = mappedDetails;
          this.itemsGridRef.instance.refresh();
        }
      }, 300);

      const firstRow = mappedDetails[0];
      if (firstRow) {
        const brandId = firstRow.ITEM;
        const typeId = firstRow.TYPE;
        const categoryId = firstRow.CATEGORY;
        const artNoId = firstRow.ARTNO;
        const colorId = firstRow.COLOR;

        console.log(' Populating dropdowns for edit mode:', firstRow);

        this.dataService
          .getTypeList({ BRAND_ID: String(brandId) })
          .subscribe((typeRes: any) => {
            this.typeList = typeRes.Data || [];

            this.dataService
              .getCatList({
                BRAND_ID: String(brandId),
                ARTICLE_TYPE: String(typeId),
              })
              .subscribe((catRes: any) => {
                this.catList = catRes.Data || [];

                this.dataService
                  .getArtNoList({
                    BRAND_ID: String(brandId),
                    ARTICLE_TYPE: String(typeId),
                    CATEGORY_ID: String(categoryId),
                  })
                  .subscribe((artRes: any) => {
                    this.artNoList = artRes.Data || [];

                    this.dataService
                      .getCatColorList({
                        BRAND_ID: String(brandId),
                        ARTICLE_TYPE: String(typeId),
                        CATEGORY_ID: String(categoryId),
                        ARTNO_ID: String(artNoId),
                      })
                      .subscribe((colorRes: any) => {
                        this.colorList = colorRes.Data || [];

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
        if (e.dataField === 'ITEM') {
          e.editorOptions.onKeyDown = (event: any) => {
            if (event.event.key === 'Enter') {
              const grid = e.component;
              const rowIndex = e.row.rowIndex;
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
  onPopupCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'select') {
      const isSelected = this.isItemAlreadySelected(e.data);

      if (isSelected) {
        e.cellElement.style.pointerEvents = 'none';
        e.cellElement.style.opacity = '0.5';
      }
    }
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
    const rowData = event?.row?.data;

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
        if (rowData) rowData.artNoList = artNoList;
        this.artNoList = artNoList;

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
    const grid = event?.component;
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
      this.prepareCutsizeValues(this.selectedPacking);

      this.showCutsizePopup();
    } else {
      this.isCutsizePopupVisible = false;
      const grid = event.component;
      grid.cellValue(rowIndex, 'CONTENT', this.combination);
    }


  }

  calculateGrossAmount = (rowData: any) => {
    const qty = Number(rowData.STOCK_QTY) || 0;
    const price = Number(rowData.PRICE) || 0;
    return qty * price;
  };

  calculateAmount = (rowData: any) => {
    const gross = Number(this.calculateGrossAmount(rowData)) || 0;

    const discountPercent = Number(rowData.DISC_PERCENT);

    if (discountPercent > 0) {
      const discountValue = (gross * discountPercent) / 100;
      return gross - discountValue;
    }
    return gross;
  };
  calculateVatAmount = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const vatPercent = Number(rowData.TAX_PERCENT) || 0;

    return (amount * vatPercent) / 100;
  };
  calculateTotal = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const taxAmount = this.calculateVatAmount(rowData);
    return amount + taxAmount;
  };

  onEditorPreparing(e: any) {
    if (e.dataField === 'DISC_PERCENT') {
      e.editorOptions = e.editorOptions || {};

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

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }

  itemCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.ITEM || '';
  };

  typeCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.TYPE || '';
  };

  categoryCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.CATEGORY || '';
  };

  artNoCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.ARTNO || '';
  };

  colorCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.COLOR || '';
  };

  packingCellTemplate = (container: any, options: any) => {
    container.textContent = options.data.PACKING || '';
  };

  prepareCutsizeValues(packingText: string) {
    const match = packingText.match(/(\d+)\s*[Xx]\s*(\d+)/);

    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);

      this.cutsizeValues = Array.from({ length: end - start + 1 }, (_, i) => ({
        size: start + i,
        value: null,
      }));
    } else {
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
      this.totalErrorMessage = '';
    }
  }

  showCutsizePopup() {
    this.totalErrorMessage = '';
    console.log('Popup triggered');
    this.isCutsizePopupVisible = true;
    this.cdr.detectChanges();
  }

  validateTotalQty = () => {
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

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

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

        this.cdr.detectChanges();

        console.log('Total Quantity:', this.totalQty);
      };
    }
  }

  onCellValueChanged(e: any) {
    if (e.column.dataField === 'quantity') {
      const rowIndex = e.row.rowIndex;
      this.cutsizeValues[rowIndex].quantity = e.value;

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
    if (this.totalQty !== this.totalRequiredQty) {
      this.totalErrorMessage = ' Total Qty must match Total Required Qty.';
      console.warn(this.totalErrorMessage);
      return;
    }

    const pairs = this.cutsizeValues
      .filter((r: any) => r.size && r.quantity != null && r.quantity !== '')
      .map((r: any) => `${r.size}*${r.quantity}`);

    const newContent = pairs.join(', ');
    console.log(' New cutsize content:', newContent);

    if (this.cutsizeRowIndex !== null && this.cutsizeRowIndex >= 0) {
      const grid = this.itemsGridRef.instance;
      const visibleRows = grid.getVisibleRows();
      const rowData = visibleRows[this.cutsizeRowIndex]?.data;

      if (rowData) {
        rowData.CONTENT = '';

        rowData.CONTENT = newContent;

        const rowKey = grid.keyOf(rowData);
        grid
          .getDataSource()
          .store()
          .push([{ type: 'update', key: rowKey, data: rowData }]);

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
    const selectedDealerId = e.value;
    this.dealerID = selectedDealerId;
    console.log('Selected Dealer ID:', selectedDealerId);

    if (selectedDealerId) {
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
        const firstAddress = this.deliveryAddress[0];
        this.salesOrderFormData.DELIVERY_ADDRESS = firstAddress.Id;

        this.salesOrderFormData.ADDRESS = firstAddress.DELIVERYADDRESS;

        this.onDeliveryAddressChanged({ value: firstAddress.Id });
      } else {
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

  applyGstModeToItems() {}

  onAddItemClick() {
    if (!this.salesOrderFormData?.CUST_ID) {
      notify('Please select a Customer before adding items.', 'warning', 2500);
      return;
    }

    this.showAddItemPopup = true;

    console.log(this.salesOrderFormData.CUST_ID, 'selected customer id');

    this.getCustomerByid();
  }

  getCustomerByid() {
    const payload = {
      CUST_ID: this.salesOrderFormData.CUST_ID,
      COMPANY_ID: this.companyID,
    };

    this.dataService.getCustomerItemsData(payload).subscribe((res) => {
      this.supplierItems = res.Data;
      const supplier = res[0];

      this.apiVatPerc = Number(this.supplierItems.TAX_PERCENT) || 0;

      this.salesOrderFormData.QTN_ID = this.supplierItems.QTN_ID;
      this.salesOrderFormData.SALESMAN_ID = this.supplierItems.SALESMAN_ID;

      this.applyGstModeToItems();

      setTimeout(() => {
        this.itemsGridRef?.instance?.refresh();
      }, 0);

      console.log(this.supplierItems, 'supplier items');
    });
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


  PrintSalesOrder() {
    this.getTemplateList();
    this.showTemplatePopup = true;
  }

  getTemplateList() {
    this.http.get<any[]>(environment.apiUrl + 'Reports').subscribe({
      next: (data) => {
        this.templateList = data.filter((t: any) => t.categoryId === 11);
        if (this.templateList.length > 0) {
          this.selectedTemplate = this.templateList[0].name;
        } else {
          this.selectedTemplate = null;
        }
      },
      error: (err) => console.error('Error fetching templates:', err)
    });
  }

  previewSelectedTemplate(): void {
    if (!this.selectedTemplate) return;
    this.showTemplatePopup = false;
    this.isPreviewPopupVisible = true;
    this.isLoadingPdf = true;
    
    const soId = this.salesOrderFormData?.ID || 0;
    
    if (!soId || soId === 0) {
      alert("Please save the document before generating a preview.");
      this.isPreviewPopupVisible = false;
      this.isLoadingPdf = false;
      return;
    }
    
    const url = `${environment.apiUrl}Reports/${encodeURIComponent(this.selectedTemplate)}/export?salesOrderId=${soId}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        this.currentPdfBlob = blob;
        const objectUrl = URL.createObjectURL(blob);
        this.pdfBlobUrl = objectUrl;
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.isLoadingPdf = false;
      },
      error: (err) => {
        console.error('Error fetching PDF:', err);
        this.isLoadingPdf = false;
      }
    });
  }

  printPdf(): void {
    if (!this.pdfBlobUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = this.pdfBlobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
  }

  sendPdf(): void {
    this.isEmailPopupVisible = true;
    this.emailReceivers = [];
    this.selectedEmails = [];
    this.emailSubject = '';
    this.emailBody = '';
    this.emailSettingsData = null;
    
    // Sales Order Email Type ID is 11
    this.dataService.selectEmailSettings(11).subscribe((res: any) => {
      if (res && res.Data) {
        this.emailSettingsData = res.Data;
        this.emailSubject = res.Data.EMAIL_SUBJECT || '';
        this.emailBody = res.Data.EMAIL_CONTENT || '';
        if (res.Data.RECEIVER_ID) {
          const emails = res.Data.RECEIVER_ID.split(/[,\s]+/).filter((e: string) => e.trim().length > 0);
          this.emailReceivers = emails;
        }
      }
    });
  }

  sendEmailConfirm(): void {
    if (this.selectedEmails.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }
    if (!this.currentPdfBlob) {
      alert("No PDF generated to attach.");
      return;
    }

    this.isSendingEmail = true;
    
    const toEmail = this.selectedEmails[0];
    const bccEmails = this.selectedEmails.slice(1).join(',');
    
    const formData = new FormData();
    formData.append('To', toEmail);
    formData.append('Bcc', bccEmails);
    formData.append('Subject', this.emailSubject);
    formData.append('Body', this.emailBody);
    formData.append('EmailType', '11'); 
    
    const fileName = `${this.selectedTemplate || 'SalesOrder'}.pdf`;
    formData.append('Attachment', this.currentPdfBlob, fileName);
    
    this.dataService.sendEmailWithAttachment(formData).subscribe((res: any) => {
      this.isSendingEmail = false;
      if (res && res.flag === 1) {
        alert("Email sent successfully!");
        this.isEmailPopupVisible = false;
      } else {
        alert("Failed to send email: " + (res?.Message || "Unknown error"));
      }
    }, (error) => {
      this.isSendingEmail = false;
      console.error("Email send error", error);
      alert("Error sending email.");
    });
  }

  closePdfPreview(): void {
    this.isPreviewPopupVisible = false;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
      this.currentPdfBlob = null;
    }
    this.pdfPreviewUrl = null;
  }

  cancel() {
    this.popupClosed.emit();
  }

  updateSummaryTotals(grid: any) {
    this.totalQty = grid.getTotalSummaryValue('STOCK_QTY') || 0;

    this.salesOrderFormData.NET_AMOUNT =
      grid.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
  }

  onGridChanged(e: any) {
    this.updateSummaryTotals(e.component);
  }

  onGridReady(e: any) {
    setTimeout(() => {
      this.updateSummaryTotals(e.component);
    }, 0);
  }

  saveSalesOrder() {
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

    const validDetails = this.salesOrderFormData.Details.filter((d: any) => {
      return d.ITEM || d.PRICE || d.UOM || d.TAX_PERCENT;
    });

    if (validDetails.length === 0) {
      notify(
        'Please add at least one valid item before saving.',
        'warning',
        2000,
      );
      return;
    }

    const totalQty = validDetails.reduce(
      (sum: number, d: any) => sum + (Number(d.STOCK_QTY) || 0),
      0,
    );

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };
    const netAmount =
      this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
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
      QTN_ID: this.salesOrderFormData.QTN_ID,
      SALESMAN_ID: this.salesOrderFormData.SALESMAN_ID,
      NET_AMOUNT: netAmount,
      REF_NO: this.salesOrderFormData.REF_NO,
      Details: validDetails.map((row: any, index: number) => {
        const grossAmount = this.calculateGrossAmount(row);
        const amount = this.calculateAmount(row);
        const taxAmount = this.calculateVatAmount(row);
        const totalAmount = this.calculateTotal(row);
        return {
          SL_NO: index + 1,
          ITEM_ID: row.ITEM_ID,
          DESCRIPTION: row.DESCRIPTION || '',
          UOM: row.UOM || '',
          QUANTITY: row.STOCK_QTY || row.QUANTITY || 0,
          PRICE: row.PRICE || 0,
          DISC_PERCENT: row.DISC_PERCENT ?? 0,
          AMOUNT: amount,
          TAX_PERCENT: row.TAX_PERCENT || 0,
          TAX_AMOUNT: taxAmount,
          TOTAL_AMOUNT: totalAmount,
          CUST_ID: this.salesOrderFormData.CUST_ID,
        };
      }),
    };

    if (this.salesOrderFormData.ID) {
      payload.ID = this.salesOrderFormData.ID;
    }

    console.log('Final payload before saving/updating:', payload);

    let apiCall;
    let message = '';

    if (this.isEditing && this.salesOrderFormData.IS_APPROVED) {
      const result = confirm(
        'Are you sure you want to approve this Sales Order?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;
          apiCall = this.dataService.approveSalesOrder(payload);
          message = 'Sales Order approved successfully!';
          this.callApi(apiCall, message);
        } else {
          notify('Approval cancelled.', 'info', 1500);
        }
      });

      return;
    }

    if (this.isVerifyMode) {
      const result = confirm(
        'Are you sure you want to verify this Sales Order?',
        'Confirm Verify',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;

          this.callApi(
            this.dataService.verifySalesOrder(payload),
            'Sales Order verified successfully!',
          );
        } else {
          notify('Verification cancelled.', 'info', 1500);
        }
      });

      return;
    }

    if (this.isApproveMode) {
      const result = confirm(
        'Are you sure you want to approve this Sales Order?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;

          this.callApi(
            this.dataService.approveSalesOrder(payload),
            'Sales Order approved successfully!',
          );
        } else {
          notify('Approval cancelled.', 'info', 1500);
        }
      });

      return;
    }

    if (this.salesOrderFormData.ID) {
      console.log('SALESORDEREDIT');
      console.log(payload, 'PAYLOAD');
      this.isSaving = true;
      this.callApi(
        this.dataService.updateSalesOrder(payload),
        'Sales Order updated successfully!',
      );
      return;
    }

    if (this.salesOrderFormData.IS_APPROVED) {
      const result = confirm(
        'Are you sure you want to save and approve this Sales Order?',
        'Confirm Save & Approve',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
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
      this.callApi(
        this.dataService.saveSalesOrder(payload),
        'Sales Order saved successfully!',
      );
    }
  }

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
      error: (err: any) => {
        this.isSaving = false;
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

  onPopupClosing() {
    this.supplierItemsGrid?.instance?.clearSelection();
  }

  onCancelNewData() {
    this.salesOrderFormData = {};
    this.supplierItemsGrid?.instance?.clearSelection();
    this.showAddItemPopup = false;
  }

  saveSelectedData() {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      notify('Please select at least one item.', 'warning', 2000);
      return;
    }

    const mappedItems = this.selectedItems.map((item: any) => ({
      ITEM_ID: item.ITEM_ID,
      ITEM_CODE: item.ITEM_CODE,
      DESCRIPTION: item.DESCRIPTION,
      UOM: item.UOM,
      STOCK_QTY: item.QUANTITY || 0,
      PRICE: item.PRICE || 0,
      DISC_PERCENT: 0,
      TAX_PERCENT: item.TAX_PERCENT || 0,
      REMARKS: '',
      QTN_NO: item.QTN_NO,
    }));

    if (!this.salesOrderFormData.Details) {
      this.salesOrderFormData.Details = [];
    }

    this.salesOrderFormData.Details = [
      ...this.salesOrderFormData.Details,
      ...mappedItems,
    ];

    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 0);

    this.showAddItemPopup = false;

    notify('Items added successfully.', 'success', 2000);
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
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [SalesOrderFinancePopupFormComponent],
  exports: [SalesOrderFinancePopupFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesOrderFinancePopupFormModule {}
