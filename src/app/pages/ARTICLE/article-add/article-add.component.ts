import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
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
  DxBoxModule,
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
  DxoPageSizeModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { AddAccountComponent } from '../../ACCOUNTS/add-account/add-account.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-article-add',
  templateUrl: './article-add.component.html',
  styleUrls: ['./article-add.component.scss'],
})
export class ArticleAddComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('bomGridRef', { static: false }) bomGridRef: any;
  @ViewChild('componentGridRef', { static: false }) componentGridRef: any;

  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  popupVisible = false;
  imagePreview: string | ArrayBuffer | null = null;
  categoryList: any;
  colorList: any;
  supplierList: any;
  unitList: any;
  articleSizeData: any;
  materialUnits: any[] = [];
  selectedComponentArticles: any[] = [];
  selectedMaterialUnitId: any;
  selectedProductionUnitId: any;
  produCtionUnits: any;
  typeOptions: any;
  selectedTypeId: any;
  selectedCategoryId: any;
  selectedBrandId: any;
  selectedColorId: any;
  typeList: any;
  brandList: any;
  isAttachPopupVisible = false;
  attachGridData: any;
  selectedAttachRow: any;
  defaultDescription: string = 'PU Footware';
  selectedSizeRows: any[] = [];
  lastOrderNo: any;
  // items: any;
  articleData: any = {
    ART_NO: '',
    DESCRIPTION: '',
    COLOR: '',
    PRICE: '',
    PACK_QTY: '',
    PART_NO: '',
    ALIAS_NO: '',
    NEXT_SERIAL: '',
    UNIT_ID: '',
    ARTICLE_TYPE: '',
    CATEGORY_ID: '',
    BRAND_ID: '',
    NEW_ARRIVAL_DAYS: 0,
    IS_STOPPED: false,
    IMAGE_NAME: '',
    COMPONENT_ARTICLE_ID: 0,
    IS_COMPONENT: false,
    SUPPLIER_ID: 0,
    CREATED_DATE: new Date(),
    STANDARD_PACKING: '',
    GST_PERC: 0,
    HSN_CODE: '',
    CREATE_PACKING: false,
  };

  articleList: any;
  componentArticles: any;
  selectedComponentArticle: any = null;
  selectedComponentArtNo: string = '';
  selectedSizeRowData: any;
  selectedComponentDescription: any;
  selectedTabIndex = 0;
  items: any[] = []; // grid data → BoM components
  ItemListDataSource: any[] = [];
  itemsList: any[] = []; // dropdown source → item master list
  data: any;
  selectedItemId: any;
  createPacking: boolean = false;
  zoomActive = false;
  selectedUnitsTooltip: string = '';
  isDragOver: boolean = false;
  selectedItemID: any;
  selected_Company_id: any;
  selectedAttachRowKeys: number[] = [];
  isSaving = false;
  ItempopupVisible: boolean = false;
  selectedItem: any;
  selectedItems: any[] = [];
  ComponentpopupVisible: boolean = false;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.sesstion_Details();
    this.getArticles();
    this.getLastOrderNoOnAdd();
    if (this.selectedCategoryId) {
      this.getCategory();
    }
    // if (this.selectedProductionUnitId) {
    this.getLastOrderNo();
    // }
    this.getAliasNo();
    this.getPartNo();
    this.getDropdownLists();
    this.getItems();
    this.articleData.NEXT_SERIAL = 1;
    // this.items = [
    //   { ITEM: null, COLOR: '', CATEGORY_NAME: '', ARTICLE_TYPE_NAME: '' },
    // ];
    this.items = [
      {
        ITEM: null,
        DESCRIPTION: '',
        UOM: '',
        QUANTITY: null,
      },
    ];
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getPartNo() {
    this.dataService.getArticleLastPartNo().subscribe((response: any) => {
      this.articleData.PART_NO = response.GetPartNo;
    });
  }

  openZoom() {
    this.zoomActive = true;
  }
  deleteImage() {
    this.imagePreview = null;
  }
  closeZoom() {
    this.zoomActive = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      // Call your existing method
      this.onImageSelected({ target: { files: [file] } } as any);
    }
  }

  handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
  onCreatePackingChanged(e: any) {
    this.articleData.CREATE_PACKING = e.value;

    // When "Create packing" is checked, set IS_COMPONENT to false
    if (e.value) {
      this.articleData.IS_COMPONENT = false;
    }
  }

  onIsComponentChanged(e: any) {
    this.articleData.IS_COMPONENT = e.value;

    // If user marks it as component, remove create packing
    if (e.value) {
      this.articleData.CREATE_PACKING = false;
    }
  }

  getItems() {
    const payload = {
      NAME: 'GETITEM',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.itemsList = response;
    });
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ITEM' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'UOM' ||
      e.dataField === 'QUANTITY'
    ) {
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
    const grid = e.component;
    const row = e.row?.data;
    const rowIndex = e.row?.rowIndex;
    const field = e.dataField;
    if (e.dataField === 'ITEM' && e.editorName === 'dxSelectBox') {
      e.editorOptions.onValueChanged = (args: any) => {
        const selectedDescription = args.value;
        const grid = e.component;
        const rowIndex = e.row.rowIndex;
        // Keep the selected value in the grid
        grid.cellValue(rowIndex, 'ITEM', selectedDescription);

        // Find the matched item ID
        const matchedItem = this.itemsList.find(
          (p: any) => p.DESCRIPTION === selectedDescription,
        );
        grid.cellValue(rowIndex, 'ITEM_ID', matchedItem?.ID ?? null);

        // Save ID separately
        grid.cellValue(rowIndex, 'ITEM_ID', matchedItem?.ID ?? null);

        let itemCode = null;
        if (selectedDescription) {
          itemCode = selectedDescription.split('-')[0]; // gets "078257588206"
        }
        // Call API to get DESCRIPTION/UOM
        const payload = { ITEM_CODE: String(itemCode) };
        this.dataService.getItemsForArticle(payload).subscribe({
          next: (response: any) => {
            if (response?.flag === 1 && response?.Data) {
              const data = response.Data;

              // Fill DESCRIPTION and UOM
              grid.cellValue(rowIndex, 'DESCRIPTION', data.DESCRIPTION);
              grid.cellValue(rowIndex, 'UOM', data.UOM);
              grid.cellValue(rowIndex, 'ITEM_ID', data.ID);

              // Move focus automatically to QUANTITY
              setTimeout(() => {
                grid.editCell(rowIndex, 'QUANTITY');
              }, 50); // slight delay for grid rendering
            }
          },
          error: (err) => console.error('API Error:', err),
        });
      };
    }

    /** ---------------------- Auto-height Dropdowns ---------------------- */
    const dropdownFields = ['ITEM', 'DESCRIPTION', 'UOM', 'QUANTITY'];
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
    // Handle QUANTITY input
    if (field === 'QUANTITY') {
      e.editorOptions.onValueChanged = (args: any) => {
        const grid = e.component;
        const rowIndex = e.row?.rowIndex;
        const rowData = e.row?.data;

        // Update current QUANTITY
        e.setCellValue(rowData, args.value);

        // Only proceed if ITEM and QUANTITY are filled
        if (rowData?.ITEM && args.value > 0) {
          const rows = grid.getVisibleRows();
          const hasIncompleteRow = rows.some(
            (r: any) => !r.data.ITEM || !r.data.QUANTITY,
          );

          if (!hasIncompleteRow) {
            // Add a new row at the bottom
            this.items.push({
              ITEM: null,
              DESCRIPTION: '',
              UOM: '',
              QUANTITY: null,
            });

            // Use setTimeout to wait for grid to render the new row
            setTimeout(() => {
              const updatedRows = grid.getVisibleRows();
              const newRowIndex = updatedRows.length - 1; // last row

              // Make sure row exists
              if (newRowIndex >= 0) {
                // Start editing ITEM cell of new row
                grid.editCell(newRowIndex, 'ITEM').then(() => {
                  grid.focus(
                    grid.getCellElement(newRowIndex, grid.columnOption('ITEM')),
                  );
                });
              }
            }, 100); // 100ms is usually enough
          } else {
            // If next row exists, just move focus to its ITEM
            const nextRowIndex = rowIndex + 1;
            if (nextRowIndex < rows.length) {
              setTimeout(() => {
                grid.editCell(nextRowIndex, 'ITEM');
              }, 50);
            }
          }
        }
      };
    }
  }

  // onGridInitialized(e: any) {
  //   const grid = e.component;
  //   const store = grid.getDataSource().store();

  //   // Remove empty row at start if present
  //   setTimeout(() => {
  //     const rows = grid.getVisibleRows();
  //     if (rows.length === 1 && !rows[0].data.ITEM && !rows[0].data.QUANTITY) {
  //       store.remove(rows[0].key);
  //       grid.refresh();
  //     }
  //   });
  // }

  onInitNewRow(e: any) {
    const grid = e.component;
    const rows = grid.getVisibleRows();

    // Get the last row
    const lastRow = rows[rows.length - 1];

    // Check if last row exists and required fields are empty
    if (lastRow && (!lastRow.data.ITEM || !lastRow.data.QUANTITY)) {
      e.cancel = true; // Prevent adding new row
    }
  }

  getArticles() {
    // const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataService.getArticleList().subscribe((response: any) => {
      if (response?.Data && Array.isArray(response.Data)) {
        // Store full list (reversed) in articleList
        // this.articleList = response.Data.reverse();
        // // Store only items with IsComponent === true in componentArticles
        // this.componentArticles = this.articleList.filter(
        //   (article: any) => article.IS_COMPONENT === true,
        // );
        // this.attachGridData = this.componentArticles;
        // console.log(this.componentArticles, 'COMPONENTARTICLE');
      }
    });
  }

  addComponent() {
    this.ComponentpopupVisible = true;

    this.dataService.getArticleList().subscribe((response: any) => {
      if (response?.Data && Array.isArray(response.Data)) {
        this.articleList = response.Data.reverse();

        const selectedColor = this.articleData.COLOR;
        const selectedCategoryId = this.selectedCategoryId;

        // filter components
        this.componentArticles = this.articleList.filter((article: any) => {
          const isComponent = article.IS_COMPONENT === true;

          const colorMatch = !selectedColor || article.COLOR === selectedColor;

          const categoryMatch =
            !selectedCategoryId || article.CATEGORY_ID === selectedCategoryId;

          return isComponent && colorMatch && categoryMatch;
        });

        // this.attachGridData = this.componentArticles;

        console.log(this.componentArticles, 'FILTERED COMPONENTS');
      }
    });
  }

  closecomponent() {
    this.ComponentpopupVisible = false;
    this.attachGridData = [...this.selectedComponentArticles];
  }

  saveSelectedComponent() {
    const grid = this.componentGridRef.instance;
    const selectedRows = grid.getSelectedRowsData();

    if (!selectedRows.length) {
      notify({
        message: 'Please select at least one component.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    //  STORE FULL LIST
    this.selectedComponentArticles = selectedRows;

    // optional (keep if needed)
    this.articleData.COMPONENT_ARTICLE_ID = selectedRows[0].ID;

    this.selectedComponentDescription = selectedRows
      .map((c: any) => c.DESCRIPTION)
      .join(', ');

    // this.attachGridData = [...selectedRows];
    this.attachGridData = [...this.selectedComponentArticles];
    this.selectedAttachRowKeys = this.selectedComponentArticles.map(
      (c: any) => c.ID,
    );
    this.ComponentpopupVisible = false;

    console.log('Selected Components:', this.selectedComponentArticles);
  }



  getCategory() {
    if (this.selectedCategoryId) {
      this.dataService
        .getCategoryList(this.selectedCategoryId)
        .subscribe((response: any) => {
          if (response?.flag === 1 && Array.isArray(response?.Data)) {
            this.articleSizeData = response.Data;
            // if (this.selectedProductionUnitId) {
            this.getLastOrderNo();
            // }
          } else {
            this.articleSizeData = [];
          }
        });
    }
  }

  getDropdownLists() {
    const payload = {
      COMPANY_ID: 0,
      NAME: 'PRODUCTION_UNITS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.produCtionUnits = response;
    });
    const payload1 = {
      COMPANY_ID: 0,
      NAME: 'MATERIAL_UNITS',
    };
    this.dataService.getDropdownData(payload1).subscribe((response: any) => {
      this.materialUnits = response;
    });
    const payload2 = {
      NAME: 'ARTICLECATEGORY',
    };
    this.dataService.getDropdownData(payload2).subscribe((response: any) => {
      this.categoryList = response;
    });
    const payload3 = {
      NAME: 'ARTICLETYPE',
    };
    this.dataService.getDropdownData(payload3).subscribe((response: any) => {
      this.typeList = response;
    });
    const payload4 = {
      NAME: 'ARTICLEBRAND',
    };
    this.dataService.getDropdownData(payload4).subscribe((response: any) => {
      this.brandList = response;
    });
    const payload5 = {
      NAME: 'ARTICLECOLOR',
    };
    this.dataService.getDropdownData(payload5).subscribe((response: any) => {
      this.colorList = response;
    });
  }
  onColorChanged(event: any) { }
  assignOrderNumbersToSizes() {
    const last = Number(this.lastOrderNo ?? 0);
    let nextOrderNo = last + 1;
    if (Array.isArray(this.articleSizeData)) {
      this.articleSizeData = this.articleSizeData.map((item: any) => ({
        ...item,
        ORDER_NO: nextOrderNo++,
      }));
    }
  }
  onProductionUnitChanged(e: any) {
    this.selectedSizeRowData = []; // clear selected sizes
    // this.articleSizeData = this.articleSizeData.map((item: any) => ({
    //   ...item,
    //   ORDER_NO: null,
    // }));
    // Build tooltip string for ADD form
    this.selectedUnitsTooltip = this.produCtionUnits
      ?.filter((u: any) => e.value.includes(u.ID))
      .map((u: any) => u.DESCRIPTION)
      .join(', ');
    // this.getLastOrderNo();
  }
  getLastOrderNo() {
    // if (!this.selectedProductionUnitId) return;
    // const ids = this.selectedProductionUnitId.join(',');
    const payload = { COMPANY_ID: 0 };
    this.dataService
      .getLastOrderNoForArticle(payload)
      .subscribe((response: any) => {
        const last = Number(response?.LastOrderNo ?? 0);
        this.lastOrderNo = last;
        let nextOrderNo = last + 1;

        if (Array.isArray(this.articleSizeData)) {
          // Sort by SIZE ascending
          this.articleSizeData = this.articleSizeData
            .sort((a, b) => a.SIZE - b.SIZE)
            .map((item: any) => ({
              ...item,
              ORDER_NO: nextOrderNo++,
            }));
        }
      });
  }

  getLastOrderNoOnAdd() {
    const payload = { COMPANY_ID: 0 };

    this.dataService
      .getLastOrderNoForArticle(payload)
      .subscribe((response: any) => {
        const last = Number(response?.LastOrderNo ?? 0);
        this.lastOrderNo = last;

        let nextOrderNo = last + 1;

        if (Array.isArray(this.articleSizeData)) {
          // Sort by SIZE ascending
          this.articleSizeData = this.articleSizeData
            .sort((a, b) => a.SIZE - b.SIZE)
            .map((item: any) => ({
              ...item,
              ORDER_NO: nextOrderNo++,
            }));
        }
      });
  }

  openAttachPopup() {
    this.getArticles();
    this.isAttachPopupVisible = true;
  }
  getAliasNo() {
    this.dataService.getLastAliasNo().subscribe((response: any) => {
      this.articleData.ALIAS_NO = response.GetAliasNo;
    });
  }
  // onAttachRowSelected(event: any) {
  //   this.selectedAttachRow = event.selectedRowsData[0]; // For single selection
  // }
  onAttachRowSelected(event: any) {
    const selectedKeys = event.selectedRowKeys || [];
    const selectedRows = event.selectedRowsData || [];
    //  Nothing selected
    if (selectedKeys.length === 0) {
      this.selectedAttachRow = null;
      this.selectedAttachRowKeys = [];
      return;
    }
    //  Keep ONLY the last selected row
    const lastKey = selectedKeys[selectedKeys.length - 1];
    const lastRow = selectedRows.find((r: any) => r.ID === lastKey);
    if (!lastRow) return;
    // THIS LINE CLEARS PREVIOUS SELECTIONS
    this.selectedAttachRowKeys = [lastKey];
    // prevent re-saving the same row again
    if (this.selectedAttachRow?.ID === lastRow.ID) {
      return;
    }
    this.selectedAttachRow = lastRow;
    // Auto save on select (existing behavior)
    this.attachComponent();
  }
  // onAttachRowSelected(event: any) {
  //   const selectedRow = event.selectedRowsData[0];
  //   if (!selectedRow) {
  //     return;
  //   }
  //   // prevent re-saving the same row again
  //   if (this.selectedAttachRow?.ID === selectedRow.ID) {
  //     return;
  //   }
  //   this.selectedAttachRow = selectedRow;
  //   //  AUTO SAVE ON SELECT
  //   this.attachComponent();
  // }
  attachComponent() {
    if (this.selectedAttachRow) {
      this.articleData.COMPONENT_ARTICLE_ID = this.selectedAttachRow.ID;
      this.selectedComponentDescription =
        this.selectedAttachRow.DESCRIPTION || '';

      // Close popup / switch tab if required
      this.isAttachPopupVisible = false;
      // this.selectedTabIndex = 0;
    }
  }

  // attachComponent() {
  //   if (this.selectedAttachRow) {
  //     // Assign the selected article's ID to articleData.ComponentArticleID
  //     this.articleData.COMPONENT_ARTICLE_ID = this.selectedAttachRow.ID;
  //     this.selectedComponentDescription =
  //       this.selectedAttachRow.DESCRIPTION || '';

  //     // Optionally close popup
  //     this.isAttachPopupVisible = false;
  //     // this.selectedTabIndex = 0;

  //   }
  // }

  onSizeSelectionChanged(e: any) {
    this.selectedSizeRows = e.selectedRowKeys;
    this.selectedSizeRowData = e.selectedRowsData || [];
  }

  enforceArtNoLimit(e: any) {
    const input = e.event?.target;
    if (input && input.value.length > 6) {
      input.value = input.value.slice(0, 6); // Trim visible input
      this.articleData.ART_NO = input.value; // Sync model
    }
  }

  onArtNoChanged(e: any) {
    let value = e.value || '';

    // Enforce max length
    if (value.length > 6) {
      value = value.slice(0, 6);
      e.component.option('value', value);
    }

    this.articleData.ART_NO = value;

    //  Update description AFTER value is set
    this.updateItemDescription();
  }

  clearComponentArticleId() {
    this.articleData.COMPONENT_ARTICLE_ID = '';
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  // private getSelectedSizes(): number[] {
  //   return (this.selectedSizeRowData || [])
  //     .map((s: any) => Number(s.SIZE))
  //     .filter((s) => !isNaN(s));
  // }

  // private isDuplicateArticle(): boolean {
  //   if (!Array.isArray(this.articleList) || !this.articleList.length) {
  //     return false;
  //   }

  //   const artNo = String(this.articleData.ART_NO).trim().toLowerCase();
  //   const color = String(this.articleData.COLOR).trim().toLowerCase();
  //   const price = Number(this.articleData.PRICE ?? 0);
  //   const companyId = Number(this.selected_Company_id);

  //   // 🔹 Category name from dropdown
  //   const selectedCategory = this.categoryList?.find(
  //     (c: any) => c.ID === this.selectedCategoryId
  //   );
  //   const categoryName = String(selectedCategory?.DESCRIPTION ?? '')
  //     .trim()
  //     .toLowerCase();

  //   // 🔹 Selected sizes from UI
  //   const selectedSizes = this.getSelectedSizes();

  //   return this.articleList.some((article: any) => {
  //     const baseMatch =
  //       String(article.ART_NO ?? '')
  //         .trim()
  //         .toLowerCase() === artNo &&
  //       String(article.COLOR ?? '')
  //         .trim()
  //         .toLowerCase() === color &&
  //       String(article.CATEGORY_NAME ?? '')
  //         .trim()
  //         .toLowerCase() === categoryName &&
  //       Number(article.PRICE ?? 0) === price &&
  //       Number(article.COMPANY_ID) === companyId;

  //     if (!baseMatch) return false;

  //     //  CORRECT SIZE EXTRACTION
  //     const savedSizes: number[] = Array.isArray(article.SIZES)
  //       ? article.SIZES.map((s: any) => Number(s.SizeValue)).filter(
  //           (s) => !isNaN(s)
  //         )
  //       : [];

  //     const hasSizeConflict = selectedSizes.some((s) => savedSizes.includes(s));

  //     if (hasSizeConflict) {
  //       console.warn(' DUPLICATE SIZE FOUND', {
  //         articleArtNo: article.ART_NO,
  //         savedSizes,
  //         selectedSizes,
  //       });
  //     }

  //     return hasSizeConflict;
  //   });
  // }

  saveArticle() {
    // Validate mandatory fields
    if (!this.articleData.ART_NO) {
      notify({
        message: 'Please enter the Article Number.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (!this.articleData.COLOR) {
      notify({
        message: 'Please select the Color.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }
    if (!this.articleData.PRICE) {
      notify({
        message: 'Please select the Price.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (!this.selectedCategoryId) {
      notify({
        message: 'Please select a Category.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (!this.selectedTypeId) {
      notify({
        message: 'Please select a Type.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    // if (!this.articleData.BRAND_ID) {
    //   notify({
    //     message: 'Please select a Brand.',
    //     type: 'warning',
    //     displayTime: 3000,
    //     position: { at: 'top right', my: 'top right' },
    //   });
    //   return;
    // }

    if (!this.articleData.PACK_QTY) {
      notify({
        message: 'Please select the Packing Qty.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }
    //  SUPPLIER VALIDATION
    if (!this.selectedMaterialUnitId) {
      notify({
        message: 'Please select a Supplier.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (
      !this.selectedProductionUnitId ||
      (Array.isArray(this.selectedProductionUnitId) &&
        this.selectedProductionUnitId.length === 0)
    ) {
      notify({
        message: 'Please select Production Unit.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (!this.selectedSizeRowData || this.selectedSizeRowData.length === 0) {
      notify({
        message: 'Please select at least one size.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    const rows =
      this.itemsGridRef?.instance?.getVisibleRows().map((r: any) => r.data) ||
      [];

    // Check if any selected item has empty quantity
    const invalidQty = rows.some(
      (row: any) => row.ITEM_ID && (!row.QUANTITY || row.QUANTITY <= 0),
    );

    if (invalidQty) {
      notify({
        message: 'Please enter quantity for all selected BOM items.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    const bomGridData =
      this.itemsGridRef?.instance
        .getVisibleRows()
        .map((r) => r.data)
        .filter((row) => row.ITEM_ID && row.QUANTITY > 0)
        .map((row) => ({
          ITEM_CODE: String(row.ITEM_ID),
          QUANTITY: row.QUANTITY,
        })) || [];

    //  BOM Validation
    if (!bomGridData.length) {
      notify({
        message: 'Please enter BOM.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (!this.articleData.HSN_CODE) {
      notify({
        message: 'Please enter the HSN Code.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }
    if (this.articleList && this.articleList.length > 0) {
      const duplicate = this.articleList.find(
        (article: any) =>
          article.ALIAS_NO?.toLowerCase() ===
          this.articleData.ALIAS_NO?.toLowerCase(),
      );

      if (duplicate) {
        notify({
          message: `ItemCode "${this.articleData.ALIAS_NO}" already exists.`,
          type: 'warning',
          displayTime: 3000,
          position: { at: 'top right', my: 'top right' },
        });
        return;
      }
    }

    const result = confirm(
      'Are you sure you want to save this article?',
      'Confirm Save',
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        // Proceed only if user confirms
        const parseDateString = (dateStr: string): Date | null => {
          if (!dateStr) return null;

          // Handle ISO or yyyy-MM-dd
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) return parsed;

          // Handle dd-MM-yyyy
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const [day, month, year] = parts.map((p) => parseInt(p, 10));
            return new Date(year, month - 1, day);
          }
          return null;
        };

        // Always return yyyy-MM-dd (and never null)
        const formatDate = (date: Date | string | null | undefined): string => {
          let d: Date | null = null;

          if (!date) {
            d = new Date(); // fallback to today
          } else if (date instanceof Date) {
            d = date;
          } else {
            d = parseDateString(date);
          }

          if (!d || isNaN(d.getTime())) d = new Date();

          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        };
        //  Get BOM grid data
        const bomGridData =
          this.itemsGridRef?.instance
            .getVisibleRows()
            .map((r) => r.data)
            .filter((row) => row.ITEM_ID && row.QUANTITY > 0)
            .map((row) => ({
              ITEM_CODE: String(row.ITEM_ID),
              QUANTITY: row.QUANTITY,
            })) || [];

        const payload = {
          ...this.articleData,
          CREATED_DATE: formatDate(this.articleData.CREATED_DATE),
          CATEGORY_ID: this.selectedCategoryId,
          ARTICLE_TYPE: this.selectedTypeId,
          BRAND_ID: this.selectedBrandId || 0,
          // COMPANY_ID: this.selected_Company_id,
          // UNIT_ID: this.selectedProductionUnitId,
          // COMPONENT_ARTICLE_ID: this.articleData.IS_COMPONENT
          //   ? 0
          //   : this.articleData.COMPONENT_ARTICLE_ID,
          Components: this.selectedComponentArticles.map((item: any) => ({
            COMPONENT_ARTICLE_ID: item.ID,
          })),
          Units: Array.isArray(this.selectedProductionUnitId)
            ? this.selectedProductionUnitId.map((id: any) => ({ UNIT_ID: id }))
            : [{ UNIT_ID: this.selectedProductionUnitId }],
          SUPPLIER_ID: this.selectedMaterialUnitId,
          DESCRIPTION: this.articleData.DESCRIPTION,
          IMAGE_NAME: this.imagePreview ? this.imagePreview.toString() : null,
          Sizes: this.selectedSizeRowData.map((row) => ({
            SizeValue: row.SIZE,
            OrderNo: String(row.ORDER_NO),
          })),
          BOM: bomGridData,
        };

        this.isSaving = true;
        this.dataService.insertArticle(payload).subscribe({
          next: (response: any) => {
            this.isSaving = false;
            if (response?.flag === 1) {
              notify(
                {
                  message: 'Article Saved Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success',
              );
              // this.popupVisible = false;
              this.resetForm();
              this.popupClosed.emit();
            } else {
              // Backend returned validation failure (flag = 0)
              notify({
                message:
                  response?.Message ||
                  response?.message ||
                  'Failed to save article.',
                type: 'error',
                displayTime: 4000,
                position: { at: 'top right', my: 'top right' },
              });
            }
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Save error:', err);

            const backendMessage =
              err?.error?.Message ||
              err?.error?.message ||
              'An error occurred while saving.';

            notify({
              message: backendMessage,
              type: 'error',
              displayTime: 4000,
              position: { at: 'top right', my: 'top right' },
            });
          },
        });
      }
    });
  }

  resetForm() {
    this.articleData = {
      ART_NO: '',
      DESCRIPTION: '',
      COLOR: '',
      PRICE: '',
      PACK_QTY: '',
      PART_NO: '',
      ALIAS_NO: this.getAliasNo(),
      UNIT_ID: '',
      ARTICLE_TYPE: '',
      CATEGORY_ID: '',
      BRAND_ID: '',
      NEW_ARRIVAL_DAYS: 0,
      IS_STOPPED: false,
      IMAGE_NAME: '',
      COMPONENT_ARTICLE_ID: 0,
      IS_COMPONENT: false,
      SUPPLIER_ID: 0,
    };
    this.attachGridData = [];
    this.imagePreview = null;
    this.selectedCategoryId = null;
    this.selectedTypeId = null;
    this.selectedBrandId = null;
    this.selectedProductionUnitId = null;
    this.selectedMaterialUnitId = null;
    this.selectedSizeRows = [];
    this.selectedComponentArtNo = '';
    this.selectedAttachRow = null;
    this.selectedAttachRowKeys = [];
    this.articleData.NEXT_SERIAL = 1;
    //RESET BOM DATA
    // this.items = []; // clears grid datasource
    this.items = [
      {
        ITEM: null,
        DESCRIPTION: '',
        UOM: '',
        QUANTITY: null,
      },
    ];

    this.selectedSizeRowData = []; // clears size-based BOM input

    this.getAliasNo();
    this.getPartNo();
    // if (this.itemsGridRef?.instance) {
    //   this.itemsGridRef.instance.option('dataSource', []);
    // }
  }

  handleClose() {
    this.popupVisible = false;
    this.popupClosed.emit(); // notify parent if needed
  }

  closePopup() {
    this.popupClosed.emit();
  }

  updateItemDescription() {
    const artNo = this.articleData.ART_NO || '';
    const color = this.articleData.COLOR || '';
    const packing = this.articleData.STANDARD_PACKING || '';
    const price = this.articleData.PRICE ?? '';

    const categoryName =
      this.categoryList?.find((c) => c.ID === this.selectedCategoryId)
        ?.DESCRIPTION || '';

    // Build exact format
    const parts = ['SF', artNo, color, packing, categoryName, price].filter(
      (p) => p !== '' && p !== null && p !== undefined,
    );

    this.articleData.DESCRIPTION = parts.join('-');
  }

  addNewRow() {
    this.dataService.getItemsListForArticle().subscribe((res: any) => {
      console.log(res);
      console.log(
        'PrePaymentListDataSource=============================:',
        res.DataList,
      );
      this.ItemListDataSource = res.DataList;
      this.ItempopupVisible = true; // Open popup
    });
    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      if (!grid) return;

      const rows = grid.getVisibleRows();

      const hasIncompleteRow = rows.some(
        (r: any) => !r.data?.ITEM || !r.data?.QUANTITY,
      );

      if (hasIncompleteRow) {
        return;
      }

      this.items.push({
        ITEM: null,
        DESCRIPTION: '',
        UOM: '',
        QUANTITY: null,
      });

      setTimeout(() => {
        const updatedRows = grid.getVisibleRows();
        const newRowIndex = updatedRows.length - 1;

        if (newRowIndex >= 0) {
          grid.editCell(newRowIndex, 'ITEM');
        }
      }, 100);
    }, 200);
  }

  onItemSelect(e: any) {
    const selectedItem = e.data;

    console.log('Selected Item:', selectedItem);

    // Example: store selected item
    this.selectedItem = selectedItem;

    // Close popup after selection
    this.ItempopupVisible = false;
  }

  onBomRowRemoved(e: any) {
    const deletedItemId = e.data?.ITEM_ID;

    if (!deletedItemId || !this.bomGridRef?.instance) return;

    const popupGrid = this.bomGridRef.instance;

    // current selected keys in popup
    let selectedKeys = popupGrid.getSelectedRowKeys();

    // remove only the deleted item
    selectedKeys = selectedKeys.filter((key: any) => key !== deletedItemId);

    // update popup selection
    popupGrid.selectRows(selectedKeys, false);
  }



  // saveSelectedItems() {
  //   const popupGrid = this.bomGridRef.instance;
  //   const selectedRows = popupGrid.getSelectedRowsData();

  //   // selected item IDs from popup
  //   const selectedIds = selectedRows.map((item: any) => item.ID);

  //  // 🔹 Keep ALL manually entered rows (even without ITEM_ID)
  // const manualRows = this.items.filter((row) => !row.ITEM_ID);

  // // 🔹 Keep only selected existing rows
  // const existingRows = this.items.filter(
  //   (row) => row.ITEM_ID && selectedIds.includes(row.ITEM_ID)
  // );

  // // 🔹 Merge both
  // this.items = [...manualRows, ...existingRows];

  //   // 2️ Add newly selected items
  //   selectedRows.forEach((item: any) => {
  //     const exists = this.items.some((x) => x.ITEM_ID === item.ID);

  //     if (!exists) {
  //       this.items.push({
  //         ITEM: item.ITEM_CODE,
  //         DESCRIPTION: item.DESCRIPTION,
  //         UOM: item.UOM,
  //         QUANTITY: null,
  //         ITEM_ID: item.ID,
  //       });
  //     }
  //   });

  //    // 🔹 Ensure at least one empty row exists
  // const hasEmptyRow = this.items.some(
  //   (r) => !r.ITEM && !r.DESCRIPTION && !r.UOM && !r.QUANTITY
  // );

  // if (!hasEmptyRow) {
  //   this.items.push({
  //     ITEM: null,
  //     DESCRIPTION: '',
  //     UOM: '',
  //     QUANTITY: null,
  //   });
  // }

  //   // refresh BOM grid
  //   this.itemsGridRef.instance.refresh();

  //   this.ItempopupVisible = false;
  // }

  saveSelectedItems() {

    const grid = this.itemsGridRef?.instance;
    const popupGrid = this.bomGridRef.instance;

    //  VERY IMPORTANT: commit editing row
    if (grid) {
      grid.saveEditData();
    }

    const selectedRows = popupGrid.getSelectedRowsData();

    //  Always get latest grid data
    let currentRows =
      grid.getVisibleRows().map((r: any) => r.data) || [];

    //  STEP 1: Remove ONLY empty rows
    const isEmptyRow = (r: any) =>
      !r.ITEM && !r.DESCRIPTION && !r.UOM && !r.QUANTITY;

    currentRows = currentRows.filter(r => !isEmptyRow(r));

    //  STEP 2: ADD new items (NO removal logic at all)
    selectedRows.forEach((item: any) => {

      const exists = currentRows.some(
        (x) => x.ITEM_ID === item.ID
      );

      if (!exists) {
        currentRows.push({
          ITEM: item.ITEM_CODE,
          DESCRIPTION: item.DESCRIPTION,
          UOM: item.UOM,
          QUANTITY: null,
          ITEM_ID: item.ID,
        });
      }

    });

    //  STEP 3: Always add ONE empty row at end
    currentRows.push({
      ITEM: null,
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: null,
    });

    //  update grid
    this.items = [...currentRows];

    this.ItempopupVisible = false;
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
    DxBoxModule,
    DxoPageSizeModule,
    DxTabPanelModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [ArticleAddComponent],
  exports: [ArticleAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleAddModule { }
