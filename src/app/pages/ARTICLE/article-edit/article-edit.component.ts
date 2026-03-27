import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddComponent } from '../article-add/article-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { ColumnExpressionCollectionHelper } from '@devexpress/analytics-core/queryBuilder-internal';
import { selected } from '@devexpress/analytics-core/queryBuilder-metadata';

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss'],
})
export class ArticleEditComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('componentGridRef', { static: false }) componentGridRef: any;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() articleData: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
   @ViewChild('bomGridRef', { static: false }) bomGridRef: any;
  popupVisible = false;
  imagePreview: string | ArrayBuffer | null = null;
  produCtionUnits: any;
  materialUnits: any;
  categoryList: any;
  typeList: any;
  brandList: any;
  colorList: any;
  isAttachPopupVisible = false;
  selectedAttachRow: any;
  selectedSizeRows: any[] = [];
  attachGridData: any;
  selectedCategoryId: any;
  articleSizeData: any;
  // defaultDescription: string = 'PU Footware';
  selectedMaterialUnitId: any;
  selectedProductionUnitId: any;
  selectedBrandId: any;
  selectedTypeId: any;
  lastOrderNo: any;
  selectedAttachRowKey: number | null = null;
  selectedComponentArtNo: string = '';
  articleList: any;
  componentArticles: any;
  savedSizes: any[] = [];
  selectedSizeValues: string[] = [];
  sizeGridSelectedKeys: any;
  selectedAttachRowKeys: number[];
  ComponentpopupVisible :boolean = false;
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  auto: string = 'auto';
  selectedTabIndex = 0; // default tab = 0 (first tab)
  items: any[] = []; // grid data → BoM components
  itemsList: any[] = []; // dropdown source → item master list
  data: any;
  zoomActive = false;
  isDragOver: boolean = false;
  selectedItemId: any;
  selectedUnitsTooltip: string = '';
  selected_Company_id: any;
  ItemCode: any;
  isSaving = false;
  ItempopupVisible: boolean = false;
  selectedItem: any;
  selectedItems: any[] = [];
  ItemListDataSource:any[] = [];
  selectedComponentDescription: any;
  selectedComponentArticles:any[]=[]
  selectedBomRowKeys: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
    }
    this.sesstion_Details();
    this.getArticles();
    this.getItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['articleData'] && changes['articleData'].currentValue) {
      const incomingData = changes['articleData'].currentValue;
      if (!this.selected_Company_id) {
        this.sesstion_Details();
      }
      console.log('Incoming articleData:', incomingData);

      if (incomingData.Components && Array.isArray(incomingData.Components)) {

  this.selectedComponentArticles = incomingData.Components.map((c: any) => ({
    ID: c.COMPONENT_ARTICLE_ID,
    ART_NO: c.COMPONENT_ART_NO,
    DESCRIPTION: c.COMPONENT_NAME,
    CATEGORY_NAME: c.CATEGORY,
    ARTICLE_TYPE_NAME: c.ARTICLE_TYPE,
    COLOR: this.articleData.COLOR   // optional fallback
  }));

  // bind to grid
  this.attachGridData = [...this.selectedComponentArticles];

  // description display
  this.selectedComponentDescription = this.selectedComponentArticles
    .map((c: any) => c.DESCRIPTION)
    .join(', ');

  //  VERY IMPORTANT (pre-select rows in popup)
  this.selectedAttachRowKeys = this.selectedComponentArticles.map(
    (c: any) => c.ID
  );

  console.log('Mapped Components:', this.selectedComponentArticles);
}

      this.getDropdownLists().then(() => {
        this.articleData = {
          ...this.articleData,
          ...incomingData,
        };
        // CASE 1: When backend sends string: "1,2,3"
        if (
          this.articleData.UNIT_ID &&
          typeof this.articleData.UNIT_ID === 'string'
        ) {
          this.articleData.UNIT_ID = this.articleData.UNIT_ID.split(',').map(
            (x: string) => Number(x.trim()),
          );
        }

        // CASE 2: When backend sends array of objects
        if (incomingData.Units && Array.isArray(incomingData.Units)) {
          this.articleData.UNIT_ID = incomingData.Units.map(
            (u: any) => u.UNIT_ID,
          );
        }

        this.selectedProductionUnitId = this.articleData.UNIT_ID;
        // Set basic fields
        this.lastOrderNo = this.articleData.LAST_ORDER_NO || '';
        this.imagePreview = this.articleData.IMAGE_NAME;
        // this.selectedAttachRowKey =
        //   this.articleData.COMPONENT_ARTICLE_ID || null;
        // this.selectedAttachRowKeys = this.selectedAttachRowKey
        //   ? [this.selectedAttachRowKey]
        //   : [];
        if (this.articleData.COMPONENT_ARTICLE_ID && this.articleList?.length) {
          const selectedComponent = this.articleList.find(
            (item: any) => item.ID === this.articleData.COMPONENT_ARTICLE_ID,
          );
          this.selectedComponentArtNo = selectedComponent?.ART_NO || '';
        }

        if (this.articleData.CATEGORY_ID) {
          this.selectedCategoryId = this.articleData.CATEGORY_ID;
          this.getCategory();
        }

        // Handle Sizes only after articleSizeData is ready
        this.setSelectedSizes();
       if (this.articleData.BOM && Array.isArray(this.articleData.BOM)) {

  this.items = this.articleData.BOM.map((bom: any) => {
    const matchedItem = this.itemsList?.find(
      (i: any) => i.ID === bom.ITEM_ID,
    );

    return {
      ITEM: matchedItem?.ITEM_CODE || bom.ITEM_CODE,
      DESCRIPTION: bom.DESCRIPTION,
      UOM: bom.UOM,
      QUANTITY: bom.QUANTITY,
      ARTICLE_ID: bom.ARTICLE_ID,
      BOM_ID: bom.BOM_ID,
      ITEM_ID: bom.ITEM_ID,
      ITEM_CODE: matchedItem?.ITEM_CODE || bom.ITEM_CODE,
    };
  });

} else {
  this.items = [];
}

//  ALWAYS add empty row at end
this.ensureEmptyRow();
      });
    }
  }

  ensureEmptyRow() {

  const hasEmptyRow = this.items.some(
    (r) => !r.ITEM && !r.DESCRIPTION && !r.UOM && !r.QUANTITY
  );

  if (!hasEmptyRow) {
    this.items.push({
      ITEM: null,
      DESCRIPTION: '',
      UOM: '',
      QUANTITY: null,
    });
  }

}
  setSelectedSizes() {
    console.log('====================================================');
    if (this.articleData.SIZES && Array.isArray(this.articleData.SIZES)) {
      console.log('articleData.SIZES:', this.articleData.SIZES);

      this.savedSizes = this.articleData.SIZES;

      const sizeStrings: string[] = this.savedSizes.map((s: any) =>
        s.SizeValue.toString(),
      );

      const selectedKeys = this.articleSizeData
        ?.filter((row: any) => sizeStrings.includes(row.SizeValue?.toString()))
        .map((row: any) => row.SizeValue);

      console.log('Mapped selectedKeys:', selectedKeys);

      this.sizeGridSelectedKeys = selectedKeys;
      this.selectedSizeRows = selectedKeys;
    } else {
      console.warn('SIZES not found or not an array');
    }
  }

  // getItems() {
  //   // const payload = {
  //   //   COMPANY_ID: this.selected_Company_id,
  //   // };
  //   this.dataService.listItemsForArticle().subscribe((response: any) => {
  //     this.itemsList = response.DataList;
  //     console.log(this.itemsList);
  //     this.ItemCode = this.itemsList[0].DESCRIPTION;
  //     console.log(this.ItemCode);
  //   });
  // }

    getItems() {
    const payload = {
      NAME: "GETITEM"
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      console.log(response)
      this.itemsList = response;
    });
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
        console.log('Selected Item Description:', selectedDescription);

        const grid = e.component;
        const rowIndex = e.row.rowIndex;

        // keep the selected value in grid
        grid.cellValue(rowIndex, 'ITEM', selectedDescription);
        const matchedItem = this.itemsList.find(
          (p: any) => p.DESCRIPTION === selectedDescription,
        );
        if (matchedItem) {
          grid.cellValue(rowIndex, 'ITEM_ID', matchedItem.ID);
          grid.cellValue(rowIndex, 'ITEM', matchedItem.DESCRIPTION);
          grid.cellValue(rowIndex, 'DESCRIPTION', matchedItem.DESCRIPTION);
          grid.cellValue(rowIndex, 'UOM', matchedItem.UOM);
        }

        this.selectedItemId = matchedItem ? matchedItem.ID : null;
        console.log(this.selectedItemId, 'SELECTEDITEMID');
        let itemCode = null;
        if (selectedDescription) {
          itemCode = selectedDescription.split('-')[0]; // gets "078257588206"
        }
        // Prepare payload and call API
        const payload = { ITEM_CODE: String(itemCode) };

        this.dataService.getItemsForArticle(payload).subscribe({
          next: (response: any) => {
            console.log('API Response:', response);

            if (response?.flag === 1 && response?.Data) {
              const data = response.Data;

              // Update the same row with API data
              grid.cellValue(rowIndex, 'DESCRIPTION', data.DESCRIPTION);
              grid.cellValue(rowIndex, 'UOM', data.UOM);
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
  }

  getArticles() {
    this.dataService.getArticleList().subscribe((response: any) => {
      if (response?.Data && Array.isArray(response.Data)) {
        // this.attachGridData = response.Data.filter(
        //   (a: any) => a.IS_COMPONENT === true,
        // );

        // // EDIT MODE SELECTION
        // if (this.articleData?.COMPONENT_ARTICLE_ID) {
        //   this.selectedAttachRowKeys = [this.articleData.COMPONENT_ARTICLE_ID];

        //   this.selectedAttachRow = this.attachGridData.find(
        //     (row: any) => row.ID === this.articleData.COMPONENT_ARTICLE_ID,
        //   );
        // }
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
      // this.attachGridData = [...this.selectedComponentArticles];
//       setTimeout(() => {
//   this.componentGridRef?.instance?.selectRows(
//     this.selectedAttachRowKeys,
//     true
//   );
// }, 300);

      console.log(this.componentArticles, 'FILTERED COMPONENTS');
    }

  });
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

  // UPDATE MAIN ARRAY (THIS WAS MISSING )
  this.selectedComponentArticles = selectedRows.map((c: any) => ({
    ID: c.ID,
    ART_NO: c.ART_NO,
    DESCRIPTION: c.DESCRIPTION,
    CATEGORY_NAME: c.CATEGORY_NAME,
    ARTICLE_TYPE_NAME: c.ARTICLE_TYPE_NAME,
    COLOR: c.COLOR
  }));

  //  Update description
  this.selectedComponentDescription = this.selectedComponentArticles
    .map((c: any) => c.DESCRIPTION)
    .join(', ');

  //  Show in UI grid
  this.attachGridData = [...this.selectedComponentArticles];

  //  Maintain selected keys
  this.selectedAttachRowKeys = this.selectedComponentArticles.map(
    (c: any) => c.ID
  );

  this.ComponentpopupVisible = false;

  console.log('Updated Components:', this.selectedComponentArticles);
}

closecomponent(){
  this.ComponentpopupVisible=false
  this.attachGridData = [...this.selectedComponentArticles];
}

  clearComponentArticleId() {
    this.articleData.COMPONENT_ARTICLE_ID = '';
  }

  // onImageSelected(event: Event) {
  //   const file = (event.target as HTMLInputElement).files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imagePreview = reader.result;
  //       this.articleData.IMAGE_NAME = this.imagePreview;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

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

  getCategory() {
    const categoryId = this.articleData?.CATEGORY_ID;
    if (!categoryId) return;

    this.dataService.getCategoryList(categoryId).subscribe((response: any) => {
      if (response?.flag === 1 && Array.isArray(response?.Data)) {
        const apiSizes = response.Data;
        let orderNoCounter = parseInt(
          this.articleData?.LAST_ORDER_NO || this.lastOrderNo || '0',
        );

        this.articleSizeData = apiSizes.map((apiSize) => {
          const sizeValue = apiSize.SIZE?.toString();
          const match = this.savedSizes?.find(
            (saved) => saved.SizeValue?.toString() === sizeValue,
          );

          return {
            SizeValue: parseInt(sizeValue), // ✅ Proper field name
            OrderNo: match?.OrderNo || (++orderNoCounter).toString(),
          };
        });

        this.selectedSizeRows = this.savedSizes.map((s) =>
          s.SizeValue?.toString(),
        );
        this.sizeGridSelectedKeys = [...this.selectedSizeRows];

        this.articleData.SIZES = this.articleSizeData.filter((item) =>
          this.selectedSizeRows.includes(item.SizeValue),
        );
      } else {
        // fallback: no category sizes returned
        this.articleSizeData = [...this.savedSizes];
        this.selectedSizeRows = this.savedSizes.map((s) => s.SizeValue);
        this.sizeGridSelectedKeys = [...this.selectedSizeRows];
        this.articleData.SIZES = [...this.savedSizes];
      }
    });
  }

  getLastOrderNo() {
    if (!this.selectedProductionUnitId) return;
    const payload = {
      COMPANY_ID: 0,
    };
    this.dataService
      .getLastOrderNoForArticle(payload)
      .subscribe((response: any) => {
        console.log(response, 'LASTORDERNO');
        this.lastOrderNo = response?.LastOrderNo ?? '';
      });
  }

  onUnitChanged(e: any) {
    this.articleData.UNIT_ID = e.value;
    this.selectedProductionUnitId = e.value;
    // Build tooltip from selected unit descriptions
    this.selectedUnitsTooltip = this.produCtionUnits
      ?.filter((u: any) => e.value.includes(u.ID))
      .map((u: any) => u.DESCRIPTION)
      .join(', ');
    this.getLastOrderNo();
  }

  getDropdownLists(): Promise<void> {
    return new Promise((resolve) => {
      let completedCalls = 0;
      const totalCalls = 6;

      const checkIfDone = () => {
        completedCalls++;
        if (completedCalls === totalCalls) {
          resolve();
        }
      };

      const payload = {
        COMPANY_ID: 0,
        NAME: 'PRODUCTION_UNITS',
      };
      this.dataService.getDropdownData(payload).subscribe((res) => {
        this.produCtionUnits = res;
        checkIfDone();
      });
      const payload1 = {
        COMPANY_ID: 0,
        NAME: 'MATERIAL_UNITS',
      };
      this.dataService.getDropdownData(payload1).subscribe((res) => {
        this.materialUnits = res;
        checkIfDone();
      });
      const payload2 = {
        NAME: 'ARTICLECATEGORY',
      };
      this.dataService.getDropdownData(payload2).subscribe((res) => {
        this.categoryList = res;
        checkIfDone();
      });
      const payload3 = {
        NAME: 'ARTICLETYPE',
      };
      this.dataService.getDropdownData(payload3).subscribe((res) => {
        this.typeList = res;
        checkIfDone();
      });
      const payload4 = {
        NAME: 'ARTICLEBRAND',
      };
      this.dataService.getDropdownData(payload4).subscribe((res) => {
        this.brandList = res;
        checkIfDone();
      });
      const payload5 = {
        NAME: 'ARTICLECOLOR',
      };
      this.dataService.getDropdownData(payload5).subscribe((res) => {
        this.colorList = res;
        checkIfDone();
      });
    });
  }

  onColorChanged(event: any) {
    console.log('Selected Color:', event.value);
  }

  openAttachPopup() {
    this.getArticles();
    this.isAttachPopupVisible = true;
  }


 onAttachRowSelected(event: any) {

  const selectedRows = event.selectedRowsData || [];

  //  keep ALL selected rows
  this.selectedComponentArticles = selectedRows.map((row: any) => ({
    ID: row.ID,
    ART_NO: row.ART_NO,
    DESCRIPTION: row.DESCRIPTION,
    CATEGORY_NAME: row.CATEGORY_NAME,
    ARTICLE_TYPE_NAME: row.ARTICLE_TYPE_NAME,
    COLOR: row.COLOR
  }));

  // update keys properly
  this.selectedAttachRowKeys = selectedRows.map((row: any) => row.ID);

  // optional (if you still need single reference)
  this.selectedAttachRow = selectedRows[selectedRows.length - 1] || null;
}


  attachComponent() {
    if (this.selectedAttachRow) {
      // Assign the selected article's ID to articleData.ComponentArticleID
      this.articleData.COMPONENT_ARTICLE_ID = this.selectedAttachRow.ID;
      this.articleData.ComponentArticleName =
        this.selectedAttachRow.DESCRIPTION || '';
      this.selectedAttachRowKeys = [this.selectedAttachRow.ID];
      // Optionally close popup
      this.isAttachPopupVisible = false;
      // this.selectedTabIndex = 0;
      console.log(
        'Assigned ComponentArticleID:',
        this.articleData.COMPONENT_ARTICLE_ID,
      );
    }
  }
  onSizeSelectionChanged(e: any) {
    this.selectedSizeRows = e.selectedRowKeys;
    this.articleData.SIZES = this.articleSizeData
      .filter((row) => this.selectedSizeRows.includes(row.SIZES))
      .map((row) => ({
        SIZES: row.SizeValue,
        OrderNo: row.OrderNo,
      }));

    console.log('Selected rows:', this.selectedSizeRows);
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  updateArticle() {
    if (!this.articleData) {
      console.warn('No article data to update');
      return;
    }

    //  SIZE VALIDATION — ADD THIS
    if (!this.selectedSizeRows || this.selectedSizeRows.length === 0) {
      notify({
        message: 'Please select at least one size before saving.',
        type: 'error',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return; // STOP API CALL
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


         const rows = this.itemsGridRef?.instance
          ?.getVisibleRows()
          .map((r: any) => r.data) || [];
        
        // Check if any selected item has empty quantity
        const invalidQty = rows.some(
          (row: any) => row.ITEM_ID && (!row.QUANTITY || row.QUANTITY <= 0)
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


    // Step 1: Collect selected sizes
    const selectedSizes =
      this.articleSizeData
        ?.filter((row) => this.selectedSizeRows.includes(row.SizeValue))
        .map((row) => ({
          SizeValue: row.SizeValue,
          OrderNo: row.OrderNo?.toString() || '0',
        })) || [];
    const bomGridData = this.itemsGridRef.instance
      .getVisibleRows()
      .map((r) => r.data)
      .filter((r) => r.ITEM_ID && r.QUANTITY > 0)
      .map((r) => ({
        ITEM_CODE: String(r.ITEM_ID),
        QUANTITY: r.QUANTITY,
      }));

    console.log('BOM Data:', bomGridData);

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

    // Step 2: Prepare the full payload
    const payload = {
      ID: this.articleData.ID || 0,
      ART_NO: this.articleData.ART_NO || '',
      LAST_ORDER_NO: this.lastOrderNo || '',
      DESCRIPTION: this.articleData.DESCRIPTION || '',
      COLOR: this.articleData.COLOR || '',
      SIZES: selectedSizes,
      PRICE: this.articleData.PRICE || 0,
      PACK_QTY: this.articleData.PACK_QTY || 0,
      PART_NO: this.articleData.PART_NO || '',
      ALIAS_NO: this.articleData.ALIAS_NO || '',
      // UNIT_ID: this.articleData.UNIT_ID || 0,
      Units: Array.isArray(this.selectedProductionUnitId)
        ? this.selectedProductionUnitId.map((id: any) => ({ UNIT_ID: id }))
        : [{ UNIT_ID: this.selectedProductionUnitId }],
      ARTICLE_TYPE: this.articleData.ARTICLE_TYPE || 0,
      ARTICLE_TYPE_NAME: this.articleData.ARTICLE_TYPE_NAME || '',
      CATEGORY_ID: this.articleData.CATEGORY_ID || 0,
      CATEGORY_NAME: this.articleData.CATEGORY_NAME || '',
      BRAND_ID: this.articleData.BRAND_ID || 0,
      BRAND_NAME: this.articleData.BRAND_NAME || '',
      NEXT_SERIAL: this.articleData.NEXT_SERIAL || 0,
      IMAGE_NAME: this.articleData.IMAGE_NAME || '',
      NEW_ARRIVAL_DAYS: this.articleData.NEW_ARRIVAL_DAYS || 0,
      IS_STOPPED: this.articleData.IS_STOPPED ?? false,
      SUPPLIER_ID: this.articleData.SUPPLIER_ID || 0,
      SupplierName: this.articleData.SupplierName || '',
      IS_COMPONENT: this.articleData.IS_COMPONENT ?? false,
      // COMPONENT_ARTICLE_ID: this.articleData.COMPONENT_ARTICLE_ID || 0,
      // COMPONENT_ARTICLE_ID: this.articleData.IS_COMPONENT
      //   ? 0
      //   : this.articleData.COMPONENT_ARTICLE_ID || 0,
       Components: this.selectedComponentArticles.map((item: any) => ({
  COMPONENT_ARTICLE_ID: item.ID,
})),
      ComponentArticleNo: this.articleData.ComponentArticleNo || '',
      ComponentArticleName: this.articleData.ComponentArticleName || '',
      CreatedDate: this.articleData.CreatedDate || new Date().toISOString(),
      BOM: bomGridData,
      // COMPANY_ID: this.selected_Company_id,
      GST_PERC: this.articleData.GST_PERC,
      HSN_CODE: this.articleData.HSN_CODE,
      STANDARD_PACKING: this.articleData.STANDARD_PACKING,
    };

    console.log('Sending update payload:', payload);
    this.isSaving = true;
    // Step 3: Send update request
    this.dataService.updateArticle(payload).subscribe(
      (response: any) => {
        this.isSaving = false;
        if (response?.flag === 1) {
          notify(
            {
              message: 'Article Updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.popupVisible = false;
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
      (error) => {
        this.isSaving = false; //  STOP loading
        console.error('Update error:', error);

        notify({
          message: 'Error while updating article.',
          type: 'error',
          displayTime: 4000,
          position: { at: 'top right', my: 'top right' },
        });
      },
    );
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

 
  onSupplierChanged(e: any) {
    const selected = this.materialUnits.find((s: any) => s.ID === e.value);
    this.articleData.SupplierName = selected ? selected.DESCRIPTION : '';
    console.log(
      'Selected Supplier ID:',
      e.value,
      'Name:',
      this.articleData.SupplierName,
    );
  }

  closePopup() {
    this.popupClosed.emit();
  }

  onArtNoChanged(e: any) {
  let value = e.value || '';

  // Enforce max length
  if (value.length > 6) {
    value = value.slice(0, 6);
    e.component.option('value', value);
  }

  this.articleData.ART_NO = value;

  // 🔥 Update description AFTER value is set
  this.updateItemDescription();
}

    updateItemDescription() {
  const artNo = this.articleData.ART_NO || '';
  const color = this.articleData.COLOR || '';
  const packing = this.articleData.STANDARD_PACKING || '';
  const price = this.articleData.PRICE ?? '';

  const categoryName =
    this.categoryList?.find(c => c.ID === this.selectedCategoryId)
      ?.DESCRIPTION || '';

  // Build exact format
  const parts = [
    'SF',
    artNo,
    color,
    packing,
    categoryName,
    price
  ].filter(p => p !== '' && p !== null && p !== undefined);

  this.articleData.DESCRIPTION = parts.join('-');
}

// addNewRow() {

//   this.dataService.getItemsListForArticle().subscribe((res: any) => {
//       console.log(res);
//       console.log(
//         'PrePaymentListDataSource=============================:',
//         res.DataList,
//       );
//       this.ItemListDataSource = res.DataList;
//       this.ItempopupVisible = true; // Open popup
//     });
//   setTimeout(() => {

//     const grid = this.itemsGridRef?.instance;
//     if (!grid) return;

//     const rows = grid.getVisibleRows();

//     const hasIncompleteRow = rows.some(
//       (r: any) => !r.data?.ITEM || !r.data?.QUANTITY
//     );

//     if (hasIncompleteRow) {
//       return;
//     }

//     this.items.push({
//       ITEM: null,
//       DESCRIPTION: '',
//       UOM: '',
//       QUANTITY: null
//     });

//     setTimeout(() => {
//       const updatedRows = grid.getVisibleRows();
//       const newRowIndex = updatedRows.length - 1;

//       if (newRowIndex >= 0) {
//         grid.editCell(newRowIndex, 'ITEM');
//       }
//     }, 100);

//   }, 200);
// }


addNewRow() {

  const grid = this.itemsGridRef?.instance;

  if (grid) {
    grid.saveEditData(); // 🔥 important
  }

  // ✅ Extract selected BOM items
  this.selectedBomRowKeys = this.items
    .filter((row) => row.ITEM_ID)
    .map((row) => row.ITEM_ID);

  console.log('Preselected BOM IDs:', this.selectedBomRowKeys);

  // Open popup
  this.dataService.getItemsListForArticle().subscribe((res: any) => {
    this.ItemListDataSource = res.DataList;
    this.ItempopupVisible = true;

    //  Apply selection after popup renders
    setTimeout(() => {
      this.bomGridRef?.instance?.selectRows(
        this.selectedBomRowKeys,
        true
      );
    }, 200);
  });
}

onItemSelect(e: any) {

  const selectedItem = e.data;

  console.log("Selected Item:", selectedItem);

  // Example: store selected item
  this.selectedItem = selectedItem;

  // Close popup after selection
  this.ItempopupVisible = false;
}



// saveSelectedItems() {

//   const popupGrid = this.bomGridRef.instance;
//   const selectedRows = popupGrid.getSelectedRowsData();

//   // selected item IDs from popup
//   const selectedIds = selectedRows.map((item:any) => item.ID);

//   // 1️ Remove BOM items that are not selected anymore
//   this.items = this.items.filter(
//     row => !row.ITEM_ID || selectedIds.includes(row.ITEM_ID)
//   );

//     this.items = this.items.filter(
//     row => row.ITEM || row.DESCRIPTION || row.UOM || row.QUANTITY
//   );

//   // 2️ Add newly selected items
//   selectedRows.forEach((item:any) => {

//     const exists = this.items.some(
//       x => x.ITEM_ID === item.ID
//     );

//     if (!exists) {
//       this.items.push({
//         ITEM: item.ITEM_CODE,
//         DESCRIPTION: item.DESCRIPTION,
//         UOM: item.UOM,
//         QUANTITY: null,
//         ITEM_ID: item.ID
//       });
//     }

//   });

//   // refresh BOM grid
//   this.itemsGridRef.instance.refresh();

//   this.ItempopupVisible = false;
// }

saveSelectedItems() {

  const grid = this.itemsGridRef?.instance;
  const popupGrid = this.bomGridRef.instance;

  //  commit editing
  if (grid) {
    grid.saveEditData();
  }

  const selectedRows = popupGrid.getSelectedRowsData();
  const selectedIds = selectedRows.map((item: any) => item.ID);

  //  always take latest grid data
  let currentRows =
    grid.getVisibleRows().map((r: any) => r.data) || [];

  //  STEP 1: remove all empty rows first
const isEmptyRow = (r: any) =>
  !r.ITEM && !r.DESCRIPTION && !r.UOM && !r.QUANTITY;

currentRows = currentRows.filter(r => !isEmptyRow(r));

  // 🔹 Add new selected items
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
        _fromPopup: true //  mark source
      });
    }

  });

  currentRows.push({
  ITEM: null,
  DESCRIPTION: '',
  UOM: '',
  QUANTITY: null,
});

  //  assign back
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
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [ArticleEditComponent],
  exports: [ArticleEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleEditModule {}