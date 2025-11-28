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
  };

  articleList: any;
  componentArticles: any;
  selectedComponentArticle: any = null;
  selectedComponentArtNo: string = '';
  selectedSizeRowData: any;
  selectedComponentDescription: any;
  selectedTabIndex = 0;
  items: any[] = []; // grid data → BoM components
  itemsList: any[] = []; // dropdown source → item master list
  data: any;
  selectedItemId: any;
  createPacking: boolean = false;
  zoomActive = false;
  selectedUnitsTooltip: string = '';
  isDragOver: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getArticles();
    if (this.selectedCategoryId) {
      this.getCategory();
    }
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
    }
    this.getDropdownLists();
    this.getItems();
    this.items = [
      { ITEM: null, COLOR: '', CATEGORY_NAME: '', ARTICLE_TYPE_NAME: '' },
    ];
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        // console.log('Base64 Image String:', this.imagePreview);
      };
      reader.readAsDataURL(file);
    }
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
  // onIsComponentChanged(e: any) {
  //   if (e.value) {
  //     console.log(
  //       'Checked: this article will be used as a component for another article'
  //     );
  //   } else {
  //     console.log('Unchecked');
  //   }
  // }

  // getItems() {
  //   this.dataService.getDropdownData('ITEMS').subscribe((response: any) => {
  //     this.itemsList = response;
  //   });
  // }

  getItems() {
    this.dataService.listItemsForArticle().subscribe((response: any) => {
      this.itemsList = response.DataList;
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
            (r) => r?.data === e.row?.data
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
          (p: any) => p.DESCRIPTION === selectedDescription
        );
        this.selectedItemId = matchedItem ? matchedItem.ID : null;
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
            (r: any) => !r.data.ITEM || !r.data.QUANTITY
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
                    grid.getCellElement(newRowIndex, grid.columnOption('ITEM'))
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

  onGridInitialized(e: any) {
    const grid = e.component;
    const store = grid.getDataSource().store();

    // Remove empty row at start if present
    setTimeout(() => {
      const rows = grid.getVisibleRows();
      if (rows.length === 1 && !rows[0].data.ITEM && !rows[0].data.QUANTITY) {
        store.remove(rows[0].key);
        grid.refresh();
      }
    });
  }

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

  addNewRow() {
    const grid = this.itemsGridRef.instance; // reference to your dx-data-grid
    const rows = grid.getVisibleRows();

    // Check if any existing row is incomplete
    const hasIncompleteRow = rows.some(
      (r: any) => !r.data.ITEM || !r.data.QUANTITY
    );

    if (hasIncompleteRow) {
      // Optionally, show a message
      return; // Stop adding new row
    }

    // Add new row at the bottom
    this.items.push({ ITEM: null, DESCRIPTION: '', UOM: '', QUANTITY: null });

    setTimeout(() => {
      const updatedRows = grid.getVisibleRows();
      const newRowIndex = updatedRows.length - 1;
      if (newRowIndex >= 0) {
        grid.editCell(newRowIndex, 'ITEM'); // Focus ITEM of new row
      }
    }, 100);
  }

  getArticles() {
    const payload = {
      DATE_FROM: new Date('1999-12-31T18:00:00.000Z'), // set specific from date
      DATE_TO: new Date(), // keep to date as today
    };

    this.dataService.getArticleList().subscribe((response: any) => {
      console.log(response, 'ARTICLELIST');
      if (response?.Data && Array.isArray(response.Data)) {
        // Store full list (reversed) in articleList
        this.articleList = response.Data.reverse();

        // Store only items with IsComponent === true in componentArticles
        this.componentArticles = this.articleList.filter(
          (article: any) => article.IS_COMPONENT === true
        );
        this.attachGridData = this.componentArticles;
        console.log(this.componentArticles, 'COMPONENTARTICLE');
      }
    });
  }

  getCategory() {
    if (this.selectedCategoryId) {
      this.dataService
        .getCategoryList(this.selectedCategoryId)
        .subscribe((response: any) => {
          console.log(response, 'CATEGORYLIST');
          if (response?.flag === 1 && Array.isArray(response?.Data)) {
            this.articleSizeData = response.Data;
            if (this.selectedProductionUnitId) {
              this.getLastOrderNo();
            }
          } else {
            this.articleSizeData = [];
          }
        });
    }
  }

  getDropdownLists() {
    this.dataService
      .getDropdownDataForAccounts('PRODUCTION_UNITS')
      .subscribe((response: any) => {
        console.log(response, 'PRODUCTION UNIT');
        this.produCtionUnits = response;
      });
    this.dataService
      .getDropdownDataForAccounts('MATERIAL_UNITS')
      .subscribe((response: any) => {
        console.log(response, 'MATERIALUNIT');
        this.materialUnits = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLECATEGORY')
      .subscribe((response: any) => {
        this.categoryList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLETYPE')
      .subscribe((response: any) => {
        this.typeList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLEBRAND')
      .subscribe((response: any) => {
        this.brandList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLECOLOR')
      .subscribe((response: any) => {
        this.colorList = response;
      });
  }

  onColorChanged(event: any) {
    console.log('Selected Color:', event.value);
  }

  // getLastOrderNo() {
  //   this.dataService.getLastOrderNo(this.selectedProductionUnitId).subscribe((response: any) => {
  //     console.log(response, "LASTORDERNO");
  //     this.lastOrderNo = response?.LastOrderNo ?? '';  // adjust based on actual response structure
  //     console.log('Next Order No:', this.lastOrderNo + 1);
  //   });
  // }

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
    this.articleSizeData = this.articleSizeData.map((item: any) => ({
      ...item,
      ORDER_NO: null,
    }));
    // Build tooltip string for ADD form
    this.selectedUnitsTooltip = this.produCtionUnits
      ?.filter((u: any) => e.value.includes(u.ID))
      .map((u: any) => u.DESCRIPTION)
      .join(', ');
    this.getLastOrderNo();
  }

  getLastOrderNo() {
    if (!this.selectedProductionUnitId) return;
    console.log(this.selectedProductionUnitId, 'SELECTEDPRODUCTIONUNITID');
    const ids = this.selectedProductionUnitId.join(',');
    this.dataService.getLastOrderNoForArticle().subscribe((response: any) => {
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

  onAttachRowSelected(event: any) {
    this.selectedAttachRow = event.selectedRowsData[0]; // For single selection
    console.log('Selected row:', this.selectedAttachRow);
  }

  attachComponent() {
    if (this.selectedAttachRow) {
      // Assign the selected article's ID to articleData.ComponentArticleID
      this.articleData.COMPONENT_ARTICLE_ID = this.selectedAttachRow.ID;
      this.selectedComponentDescription =
        this.selectedAttachRow.DESCRIPTION || '';

      // Optionally close popup
      this.isAttachPopupVisible = false;
      this.selectedTabIndex = 0;
      console.log(
        'Assigned ComponentArticleID:',
        this.articleData.COMPONENT_ARTICLE_ID
      );
    }
  }

  onSizeSelectionChanged(e: any) {
    this.selectedSizeRows = e.selectedRowKeys;
    this.selectedSizeRowData = e.selectedRowsData || [];
    console.log('Selected rows:', this.selectedSizeRows);
  }

  enforceArtNoLimit(e: any) {
    const input = e.event?.target;
    if (input && input.value.length > 6) {
      input.value = input.value.slice(0, 6); // Trim visible input
      this.articleData.ART_NO = input.value; // Sync model
    }
  }

  clearComponentArticleId() {
    this.articleData.COMPONENT_ARTICLE_ID = '';
  }

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

    if (!this.selectedSizeRowData || this.selectedSizeRowData.length === 0) {
      notify({
        message: 'Please select at least one size.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }

    if (this.articleList && this.articleList.length > 0) {
      const duplicate = this.articleList.find(
        (article: any) =>
          article.ART_NO?.toLowerCase() ===
          this.articleData.ART_NO?.toLowerCase()
      );

      if (duplicate) {
        notify({
          message: `Article No "${this.articleData.ART_NO}" already exists.`,
          type: 'warning',
          displayTime: 3000,
          position: { at: 'top right', my: 'top right' },
        });
        return;
      }
    }

    const result = confirm(
      'Are you sure you want to save this article?',
      'Confirm Save'
    );

    result.then((dialogResult) => {
      if (dialogResult) {
        // ✅ Proceed only if user confirms
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

        // ✅ Always return yyyy-MM-dd (and never null)
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
            .map((row: any) => row.data)
            .filter((row: any) => row.ITEM && row.QUANTITY > 0)
            .map((row: any) => ({
              // ITEM_CODE: row.ITEM,
              ITEM_CODE: String(this.selectedItemId),
              QUANTITY: row.QUANTITY,
            })) || [];

        console.log('BOM Data:', bomGridData);
        const payload = {
          ...this.articleData,
          CREATED_DATE: formatDate(this.articleData.CREATED_DATE),
          CATEGORY_ID: this.selectedCategoryId,
          ARTICLE_TYPE: this.selectedTypeId,
          BRAND_ID: this.selectedBrandId,
          // UNIT_ID: this.selectedProductionUnitId,
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

        console.log('Saving article with payload:', payload);

        this.dataService.insertArticle(payload).subscribe({
          next: (response: any) => {
            if (response?.flag === 1) {
              notify(
                {
                  message: 'Article Saved Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success'
              );
              // this.popupVisible = false;
              this.popupClosed.emit();
            } else {
              alert('Failed to save article.');
            }
          },
          error: (err) => {
            console.error('Save error:', err);
            alert('An error occurred while saving.');
          },
        });
      }
    });
  }

  resetForm() {
    this.articleData = {
      ART_NO: '',
      DESCRIPTION: 'PU Footwear',
      COLOR: '',
      PRICE: '',
      PACK_QTY: '',
      PART_NO: '',
      ALIAS_NO: '',
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

    this.imagePreview = null;
    this.selectedCategoryId = null;
    this.selectedTypeId = null;
    this.selectedBrandId = null;
    this.selectedProductionUnitId = null;
    this.selectedMaterialUnitId = null;
    this.selectedSizeRows = [];
    this.selectedComponentArtNo = '';
    this.selectedAttachRow = null;
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
export class ArticleAddModule {}
