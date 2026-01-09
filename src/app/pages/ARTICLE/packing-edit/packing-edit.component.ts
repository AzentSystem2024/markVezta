// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
  Input,
  NgModule,
  Output,
  ViewChild,
  EventEmitter,
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
  DxValidationGroupComponent,
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
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-packing-edit',
  templateUrl: './packing-edit.component.html',
  styleUrls: ['./packing-edit.component.scss'],
})
export class PackingEditComponent {
  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup: DxValidationGroupComponent;
  @ViewChild('ArtnoValidationGroup')
  ArtnoValidationGroup: DxValidationGroupComponent;

  @ViewChild('ColorValidationGroup')
  ColorValidationGroup: DxValidationGroupComponent;

  @ViewChild('CategoryValidationGroup')
  CategoryValidationGroup: DxValidationGroupComponent;

  @ViewChild('UnitValidationGroup')
  UnitValidationGroup: DxValidationGroupComponent;
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  selectedTabIndex = 0;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  isFilterRowVisible: boolean = false;
  items: any[] = []; // grid data → BoM components
  itemsList: any[] = [];
  articleData: any;
  colorList: any;
  categoryList: any;
  typeList: any;
  brandList: any;
  produCtionUnits: any;
  materialUnits: any;
  articleSizeData: any;
  shouldShowGrid: boolean = false;
  @Input() PackingData: any = {};
  @Output() popupClosed = new EventEmitter<void>();
  totalQuantity: any;
  selectedRows: any;
  isArticleFieldsDisabled: boolean = false;
  selectedProductionUnitId: any;
  packing_list: any;
  selectedSizeRows: any[] = [];
  combinationString: string;
  combination_value: any[] = [];
  PackingEntriesData: any;
  selected_Company_id: any;
  selectedItemId: any;

  constructor(private dataService: DataService) {
    this.sesstion_Details();
    this.getDropdownLists();

    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.get_packages_list_api(payload).subscribe((res: any) => {
      console.log('response from get packing list api:', res);

      this.packing_list = res.Data;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
  }

  closePopup() {
    this.popupClosed.emit();
  }
  onPurchasableChanged(e: any) {
    console.log('Purchasable changed:', e.value);
    // Add any custom logic here if needed
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
  getItems() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.listItemsForArticle(payload).subscribe((response: any) => {
      this.itemsList = response.DataList;
    });
  }

  getDropdownLists() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'PRODUCTION_UNITS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      console.log(response, 'PRODUCTION UNIT');
      this.produCtionUnits = response;
    });
    const payload1 = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'MATERIAL_UNITS',
    };
    this.dataService.getDropdownData(payload1).subscribe((response: any) => {
      console.log(response, 'MATERIALUNIT');
      this.materialUnits = response;
    });
    const payload2 = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ARTICLECATEGORY',
    };
    this.dataService.getDropdownData(payload2).subscribe((response: any) => {
      this.categoryList = response;
    });
    const payload3 = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ARTICLETYPE',
    };
    this.dataService.getDropdownData(payload3).subscribe((response: any) => {
      this.typeList = response;
    });
    const payload4 = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ARTICLEBRAND',
    };
    this.dataService.getDropdownData(payload4).subscribe((response: any) => {
      this.brandList = response;
    });
    const payload5 = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'ARTICLECOLOR',
    };
    this.dataService.getDropdownData(payload5).subscribe((response: any) => {
      this.colorList = response;
    });
  }

  ngOnInit() {
    this.getItems();
  }

  onEditorPreparings(e: any) {
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
        console.log('Selected Item Description:', selectedDescription);

        const grid = e.component;
        const rowIndex = e.row.rowIndex;

        // keep the selected value in grid
        grid.cellValue(rowIndex, 'ITEM', selectedDescription);
        const matchedItem = this.itemsList.find(
          (p: any) => p.DESCRIPTION === selectedDescription
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
        const payload = { ITEM_CODE: String(selectedDescription) };

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['PackingData'] && changes['PackingData'].currentValue) {
      console.log('Received PackingData:', changes['PackingData'].currentValue);
      this.PackingData = {
        ...this.PackingData,
        ...changes['PackingData'].currentValue,
      };
      console.log(this.PackingData, 'UPDATED PACKING DATA');
      if (
        this.PackingData.ART_NO &&
        this.PackingData.COLOR &&
        this.PackingData.CATEGORY_ID &&
        this.PackingData.UNIT_ID
      ) {
        this.articleSizeData = this.PackingData.COMBINATION.split(',').map(
          (item) => {
            const [size, qty] = item.split('x').map(Number);
            const articleEntry = this.PackingData.PackingEntries.find(
              (entry) => entry.SIZE == size
            );
            return {
              Size: size,
              Qty: qty,
              ArticleID: articleEntry ? articleEntry.ARTICLE_ID : null,
            };
          }
        );
      }
      console.log(this.articleSizeData);
      this.totalQuantity = this.articleSizeData.reduce(
        (sum: number, item: any) => {
          const qty = parseInt(item.Qty, 10);
          return sum + (isNaN(qty) ? 0 : qty);
        },
        0
      );
    }

    // ===============================
    // 3️⃣ 🔥 BIND BOM (MAIN PART)
    // ===============================
    //     if (Array.isArray(this.PackingData.BOM)) {

    //       this.items = this.PackingData.BOM.map((bom: any) => {
    //   const matchedItem = this.itemsList?.find(
    //     (i: any) => i.ID === bom.ITEM_ID
    //   );
    // console.log(this.items)

    //   return {
    //     BOM_ID: bom.BOM_ID,
    //     ITEM_ID: bom.ITEM_ID,

    //     // ✅ Bind SelectBox value using DESCRIPTION from getItems()
    //     ITEM: matchedItem ? matchedItem.DESCRIPTION : bom.DESCRIPTION,

    //     DESCRIPTION: matchedItem ? matchedItem.DESCRIPTION : bom.DESCRIPTION,
    //     UOM: bom.UOM,
    //     QUANTITY: Number(bom.QUANTITY),
    //   };
    // });

    //     } else {
    //       this.items = [];
    //     }

    // this.getItems();

    if (this.PackingData.BOM && Array.isArray(this.PackingData.BOM)) {
      console.log(this.PackingData, 'BOMMMMMMMMMMM');
      console.log(this.itemsList, 'ITEMS LIST----');
      this.items = this.PackingData.BOM.map((bom: any) => {
        // find the matching item from dropdown list
        const matchedItem = this.itemsList?.find(
          (i: any) => i.ID === bom.ITEM_ID
        );
        console.log(matchedItem, 'MATCHEDITEMSINEDIT');
        return {
          ITEM: bom.ITEM_CODE,
          // ITEM:bom.ITEM_CODE,
          DESCRIPTION: bom.DESCRIPTION,
          UOM: bom.UOM,
          QUANTITY: bom.QUANTITY,
          ARTICLE_ID: bom.ARTICLE_ID,
          BOM_ID: bom.BOM_ID,
          ITEM_ID: bom.ITEM_ID,
          ITEM_CODE: matchedItem?.ITEM_CODE || bom.ITEM_CODE,
        };
      });

      console.log('Mapped BOM items:', this.items);
    } else {
      this.items = [];
    }

    console.log(this.PackingData, 'MAINGROUPID');
    this.PackingEntriesData = this.PackingData.PackingEntries;
    console.log(
      this.PackingEntriesData,
      '========packing entries data========='
    );
  }

  UpdateData() {
    // const payload = this.PackingData;
    const validationResult = this.formValidationGroup?.instance?.validate();

    console.log(this.combinationString, 'COMBINATION STRING');
    const combinationToUse =
      this.combinationString === undefined
        ? this.PackingData.COMBINATION
        : this.combinationString;

    // ===============================
    // 🔹 BUILD BOM PAYLOAD
    // ===============================
    const bomPayload = (this.items || [])
      .filter((item: any) => Number(item.QUANTITY) > 0)
      .map((item: any) => ({
        BOM_ID: item.BOM_ID || null,
        ITEM_ID: Number(item.ITEM_ID),
        QUANTITY: Number(item.QUANTITY),
      }));

    console.log(combinationToUse, 'COMBINATION TO USE');
    const payload = {
      ...this.PackingData,
      COMBINATION: combinationToUse,
      PAIR_QTY: this.totalQuantity,
      // ✅ ADD BOM HERE
      BOM: bomPayload,
      PackingEntries: this.articleSizeData
        // .filter(item => Number(item.QUANTITY) > 0) // only include rows with quantity
        .map((item) => ({
          ARTICLE_ID: Number(item.ArticleID), // or whichever field holds article id
          SIZE: String(item.Size),
          QUANTITY: Number(item.Qty),
        })),
    };
    console.log(this.articleSizeData, '========article size data=========');
    const unitName = this.produCtionUnits.find(
      (u) => u.ID === payload.UNIT_ID
    )?.DESCRIPTION;
    console.log(unitName, '=============');
    const CategoryId = this.categoryList.find(
      (u) => u.ID === payload.CATEGORY_ID
    )?.DESCRIPTION;
    console.log(CategoryId, '=============');

    const artno = payload.ART_NO;
    const color = payload.COLOR;
    const categoryID = CategoryId;
    const unitID = unitName;
    const packname = payload.DESCRIPTION;
    const packqty = payload.PAIR_QTY;
    const id = payload.ID;
    console.log(
      artno,
      color,
      categoryID,
      unitID,
      packname,
      '====================='
    );

    //  🔍 Check for duplicate entry based on employee ID
    const duplicate = this.packing_list.find(
      (item: any) =>
        item.PackingName === packname &&
        item.ArtNo === artno &&
        item.Color === color &&
        item.Category === categoryID &&
        item.Unit === unitID &&
        item.ID !== id // ✅ ID must be different for true duplication
    );

    console.log(duplicate, 'DUPLICATE CHECK');
    if (duplicate) {
      notify(
        {
          message: 'This Packing combination already .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }

    if (packqty <= 1) {
      notify(
        {
          message: 'Please Add Quantity.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }

    //     if (!validationResult?.isValid) {
    //   // Optional: Notify or prevent submission
    //   return;
    // }
    // if (!validationResult?.isValid) {
    //   notify(
    //     {
    //       message: 'Please fill all required fields correctly.',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   return; // ⛔ Stop if form is invalid
    // }

    this.dataService.Update_packages_listapi(payload).subscribe((res: any) => {
      console.log('response from update packing api:', res);
      this.closePopup();
      notify(
        {
          message: 'Data  Updated succesfully ',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
    });
  }

  // updateQtyFromCombination(combination: string) {
  //   console.log('Updating quantity from combination:', combination);

  //   const sizeQtyMap = combination.split(',').reduce((map, entry) => {
  //     const [size, qty] = entry.split('x');
  //     map[size.trim()] = +qty.trim();
  //     return map;
  //   }, {} as { [key: string]: number });

  //   console.log('Size Quantity Map:', sizeQtyMap);

  //   console.log(' 2Updated articleSizeData:', this.articleSizeData);
  //   this.articleSizeData = Object.entries(sizeQtyMap).map(([size, qty]) => ({
  //     Size: size,
  //     Qty: qty,
  //   }));
  //   console.log(' 3Updated articleSizeData:', this.articleSizeData);
  // }

  onQuantityChanged() {
    console.log('Quantity changed', this.articleSizeData);
    const comb_Data = this.articleSizeData
      .map((item) => `${item.Size}x${item.Qty}`)
      .join(',');
    // Recalculate total quantity when any quantity is changed
    this.totalQuantity = this.articleSizeData.reduce(
      (sum: number, item: any) => {
        const qty = parseInt(item.Qty, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      },
      0
    );

    console.log(this.totalQuantity);
  }

  loadArticle() {
    console.log('button clicked');
    // this.updateQtyFromCombination(this.PackingData.COMBINATION);

    console.log('Loading article data with PackingData:', this.PackingData);

    const payload = {
      artNo: this.PackingData.ART_NO,
      color: this.PackingData.COLOR,
      categoryID: this.PackingData.CATEGORY_ID,
      unitID: this.PackingData.UNIT_ID,
      COMPANY_ID: this.selected_Company_id,
    };

    console.log('Payload for article data:', payload);

    // const isValid =
    //   payload.artNo && payload.color && payload.categoryID && payload.unitID;

    // if (!isValid) {
    //   notify(
    //     {
    //       message: 'Please fill all required fields',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   // 👈 prevent grid from showing
    //   this.shouldShowGrid = false;
    //   return;
    // }
    // const ArtvalidationResult = this.ArtnoValidationGroup?.instance?.validate();

    // const ColorvalidationResult =
    //   this.ColorValidationGroup?.instance?.validate();

    // const CatgoryvalidationResult =
    //   this.CategoryValidationGroup?.instance?.validate();

    // const UnitvalidationResult = this.UnitValidationGroup?.instance?.validate();

    //  if (!ArtvalidationResult.isValid || !ColorvalidationResult.isValid || !CatgoryvalidationResult.isValid || !UnitvalidationResult.isValid) {

    //   return; // ❌ Prevent saving if form is invalid
    // }
    // if(!payload.artNo || !payload.color || !payload.categoryID || !payload.unitID) {
    //   notify(
    //     {
    //       message: 'Please fill all required fields',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 500,
    //     },
    //     'error'
    //   );
    //   return;
    // }
    // this.isArticleFieldsDisabled = true;

    console.log(payload, 'PAYLOAD FOR COLLECTION LIST');
    this.dataService
      .get_combinbation_list_api(payload)
      .subscribe((response: any) => {
        console.log(response, 'COMBINATION LIST RESPONSE');
        this.articleSizeData = response;
        console.log(this.articleSizeData);
        this.PackingData.COMBINATION = '';
      });
  }
  // selectedSizeRows: any[] = [];

  onSizeSelectionChanged(e: any) {
    this.selectedSizeRows = e.selectedRowKeys;
    console.log('Selected Rows:', this.selectedSizeRows);
  }

  clearForm() {
    this.PackingData = {
      ART_NO: '',
      ORDER_NO: '',
      CATEGORY_ID: null,
      COLOR: '',
      DESCRIPTION: '',
      ARTICLE_TYPE: null,
      PAIR_QTY: null,
      IS_INACTIVE: false,
      PART_NO: '',
      ALIAS_NO: '',
      ART_SERIAL: '',
      COMBINATION: '2x4',
      PACK_PRICE: null,
      UNIT_ID: null,
      IS_PURCHASABLE: false,
      IS_EXPORT: false,
      IS_ANY_COMB: false,
      SUPP_ID: null,
    };

    // ✅ Resets values and clears all validation UI
    // this.formValidationGroup?.instance?.resetValues();

    this.articleSizeData = [];
    this.combination_value = [];
    this.totalQuantity = 0;
  }

  close() {}

  // onEditorPreparing(e: any) {
  // console.log(e, "EDITOR PREPARING EVENT");
  //   const rowData = e.row?.data;

  // console.log(rowData, "ROW DATA IN EDITOR PREPARING");

  // const sizeQtyString = `${rowData.Size}x${rowData.Qty}`;
  // console.log(sizeQtyString, "SIZE QUANTITY STRING");

  // this.combination_value.push(sizeQtyString); // Add the size and quantity to the combination_value array
  // if (!this.combination_value.includes(sizeQtyString)) {
  //   this.combination_value.push(sizeQtyString);
  // }
  // console.log(this.combination_value, "COMBINATION VALUE ARRAY");

  // const validData = this.combination_value.filter(item => !item.includes('undefined'));

  // console.log(validData, "VALID DATA AFTER FILTERING");

  // const combvalue= this.PackingData.COMBINATION
  // console.log(combvalue, "COMBINATION VALUE FROM PACKING DATA");
  // const combinationString = validData.join(', ');
  // // Join the array into a string
  // console.log(this.combinationString, "COMBINATION STRING");

  // console.log(' changed Data', this.articleSizeData);

  // //=======take combination of all sizes and quantities==========
  // const firstcombinationString = this.articleSizeData
  //   .filter(item => item.Qty !== undefined && item.Qty !== null && item.Qty > 0)
  //   .map(item => `${item.Size}x${item.Qty}`)
  //   .join(', ');

  // this.combinationString = firstcombinationString;

  // console.log("Combination String:", this.combinationString);

  // }

  onEditorPreparing(e: any) {
    console.log(e, 'EDITOR PREPARING EVENT');
    if (e.dataField === 'Qty' && e.row?.data) {
      const rowData = e.row.data;
      const articleId = rowData.ArticleId || e.row.key?.ArticleId;

      if (!articleId) {
        console.warn('ArticleId undefined during editor preparing', rowData);
        return;
      }

      const sizeQtyString = `${rowData.Size}x${rowData.Qty}`;
      console.log(sizeQtyString, 'SIZE QUANTITY STRING');

      if (!this.combination_value.includes(sizeQtyString)) {
        this.combination_value.push(sizeQtyString);
      }

      const validData = this.combination_value.filter(
        (item) => !item.includes('undefined')
      );
      this.combinationString = validData.join(', ');
      console.log('Combination String:', this.combinationString);
    }
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
  ],
  providers: [],
  declarations: [PackingEditComponent],
  exports: [PackingEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingEditModule {}
