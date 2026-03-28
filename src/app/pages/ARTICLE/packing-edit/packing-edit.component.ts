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

  @ViewChild('sizeGrid', { static: false })
  sizeGrid!: DxDataGridComponent;
  @ViewChild('bomGridRef', { static: false }) bomGridRef: any;

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
  pricePopupVisible: boolean = false;
  company_code: any;
  ViewpricePopupVisible: any;
  user_id: any;
  stdPriceEffectFrom: any;
  stdPrice: any;
  priceHistoryList: any[] = [];
  selectedRowKeys: any[] = [];
  selectedItem: any;
  ItempopupVisible: boolean = false;
  selectedItems: any[] = [];
  ItemListDataSource: any[] = [];

  constructor(private dataService: DataService) {
    this.sesstion_Details();
    this.getDropdownLists();

    // const payload = {
    //   COMPANY_ID: this.selected_Company_id,
    // };
    this.dataService.get_packages_list_api().subscribe((res: any) => {
      this.packing_list = res.Data;
    });
  }

  ngOnInit() {
    this.getDropdownLists();
    this.getItems();
  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );

    this.company_code = sessionData.SELECTED_COMPANY.COMPANY_CODE;
    console.log(this.company_code, '============company code==============');
    this.user_id = sessionData.USER_ID;
    console.log(this.user_id, '============user id==================');
  }

  closePopup() {
    this.popupClosed.emit();
  }
  onPurchasableChanged(e: any) {
    // Add any custom logic here if needed
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
      NAME: 'GETITEM',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      console.log(response);
      this.itemsList = response;
    });
  }

  getDropdownLists() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'PRODUCTION_UNITS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.produCtionUnits = response;
    });
    const payload1 = {
      COMPANY_ID: this.selected_Company_id,
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

  onEditorPreparings(e: any) {
    if (e.parentType !== 'dataRow') return;

    const rowData = e.row?.data;

    if (this.isSameArticle(rowData)) {
      console.log('Locked Row:', rowData.DESCRIPTION);

      e.editorOptions.readOnly = true; // Disable editing
    }
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
        let itemCode = null;
        if (selectedDescription) {
          itemCode = selectedDescription.split('-')[0]; // gets "078257588206"
        }
        // Prepare payload and call API
        const payload = { ITEM_CODE: String(selectedDescription) };

        this.dataService.getItemsForArticle(payload).subscribe({
          next: (response: any) => {
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
      ITEM_ID: null
    });
  }

}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['PackingData'] && changes['PackingData'].currentValue) {
      const incomingData = changes['PackingData'].currentValue;
      this.PackingData = {
        ...this.PackingData,
        ...changes['PackingData'].currentValue,
        ...incomingData,
      };
      console.log(this.PackingData, 'UPDATED PACKING DATA');
      this.totalQuantity = this.PackingData.PAIR_QTY;
      console.log(this.totalQuantity);
      this.isArticleFieldsDisabled = true;
      //    if (Array.isArray(incomingData.Units) && incomingData.Units.length) {
      //   // Backend → UI
      //   this.PackingData.UNIT_ID = incomingData.Units.map(
      //     (u: any) => u.UNIT_ID
      //   );
      //   console.log(this.PackingData.UNIT_ID, 'UNIT_ID in ngOnChanges');
      // } else if (incomingData.UNIT_ID) {
      //   // Backward compatibility
      //   this.PackingData.UNIT_ID = [incomingData.UNIT_ID];
      // } else {
      //   this.PackingData.UNIT_ID = [];
      // }

      if (Array.isArray(incomingData.Units) && incomingData.Units.length) {
        this.PackingData.UNIT_ID = incomingData.Units[0].UNIT_ID; //  SINGLE VALUE
      } else if (incomingData.UNIT_ID) {
        this.PackingData.UNIT_ID = incomingData.UNIT_ID;
      } else {
        this.PackingData.UNIT_ID = null;
      }

      console.log('UNIT_ID after bind:', this.PackingData.UNIT_ID);

      if (
        this.PackingData.ART_NO &&
        this.PackingData.COLOR &&
        this.PackingData.CATEGORY_ID &&
        this.PackingData.UNIT_ID
      ) {
        this.articleSizeData = this.PackingData.COMBINATION.split(',')
          .map((item) => {
            const [size, qty] = item.split('x').map(Number);

            const articleEntry = this.PackingData.PackingEntries.find(
              (entry) => Number(entry.SIZE) === size,
            );

            return {
              Size: Number(size), //  ensure number
              Qty: Number(qty),
              ArticleID: articleEntry ? articleEntry.ARTICLE_ID : null,
            };
          })
          //  SORT SIZE ASCENDING (NUMERIC)
          .sort((a, b) => a.Size - b.Size);
      }

      console.log(this.articleSizeData);

      console.log(this.articleSizeData);
      // this.totalQuantity = this.articleSizeData.reduce(
      //   (sum: number, item: any) => {
      //     const qty = parseInt(item.Qty, 10);
      //     return sum + (isNaN(qty) ? 0 : qty);
      //   },
      //   0
      // );
    }

    // ===============================
    // 3️ BIND BOM (MAIN PART)
    // ===============================
    //     if (Array.isArray(this.PackingData.BOM)) {

    //       this.items = this.PackingData.BOM.map((bom: any) => {
    //   const matchedItem = this.itemsList?.find(
    //     (i: any) => i.ID === bom.ITEM_ID
    //   );

    //   return {
    //     BOM_ID: bom.BOM_ID,
    //     ITEM_ID: bom.ITEM_ID,

    //     //  Bind SelectBox value using DESCRIPTION from getItems()
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
      this.items = this.PackingData.BOM.map((bom: any) => {
        // find the matching item from dropdown list
        const matchedItem = this.itemsList?.find(
          (i: any) => i.ID === bom.ITEM_ID,
        );
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
    } else {
      this.items = [];
    }

    this.ensureEmptyRow(); // IMPORTANT
    // this.PackingEntriesData = this.PackingData.PackingEntries;
    this.PackingEntriesData = [];

    setTimeout(() => {
      this.PackingEntriesData = (this.PackingData.PackingEntries || [])
        .filter((r: any) => r && r.SIZE !== undefined)
        .map((row: any) => ({
          ...row,
          QUANTITY: Number(row.QUANTITY || 0),
          rowKey: `${row.ARTICLE_ID}_${row.SIZE}`, //  MUST EXIST
        }));

      //  Force grid refresh
      this.sizeGrid?.instance?.refresh();

      //  Auto-select rows with quantity
      const keysToSelect = this.PackingEntriesData.filter(
        (r: any) => r.QUANTITY > 0,
      ).map((r: any) => r.rowKey);

      this.sizeGrid?.instance?.selectRows(keysToSelect, false);
      this.selectedRowKeys = keysToSelect;

      console.log('Auto-selected:', keysToSelect);
    });

    console.log(
      this.PackingEntriesData,
      '========packing entries data=========',
    );

    this.getDropdownLists();
  }

  private normalizeDateOnly(value: any): string {
    if (!value) return value;

    // If already a string like "2026-02-07" or "2026-02-07T..."
    if (typeof value === 'string') {
      return value.substring(0, 10) + 'T00:00:00';
    }

    // If it's a Date object
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}T00:00:00`;
    }

    return value;
  }

  UpdateData() {
    // const payload = this.PackingData;
    const validationResult = this.formValidationGroup?.instance?.validate();

    const combinationToUse =
      this.combinationString === undefined
        ? this.PackingData.COMBINATION
        : this.combinationString;

    // ===============================
    // 🔹 UNIT HANDLING (FIXED)
    // ===============================
    const selectedUnits: number[] = Array.isArray(this.PackingData.UNIT_ID)
      ? this.PackingData.UNIT_ID
      : this.PackingData.UNIT_ID
        ? [this.PackingData.UNIT_ID]
        : [];

    //  hard validation
    if (!selectedUnits.length) {
      notify(
        {
          message: 'Please select at least one Unit',
          position: { at: 'top right', my: 'top right' },
          displayTime: 800,
        },
        'warning',
      );
      return;
    }

    //  Header UNIT_ID (single)
    const mainUnitId = Number(selectedUnits[0]);

    //  Units array (multi)
    const unitsPayload = selectedUnits.map((id) => ({
      UNIT_ID: Number(id),
    }));

    // ===============================
    //  PRICE VALIDATION
    // ===============================
    const mrp = Number(this.PackingData.PACK_PRICE);
    const stdPrice = Number(this.PackingData.STD_PRICE);

    if (mrp <= stdPrice) {
      notify(
        {
          message: 'MRP must be greater than Standard Price',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1200,
        },
        'error',
      );
      return; //  STOP SAVE
    }

    // ===============================
    // 🔹 STD PRICE (SMART MERGE)
    // ===============================
    const finalStdPrice =
      this.stdPrice !== null && this.stdPrice !== undefined
        ? Number(this.stdPrice)
        : this.PackingData.STD_PRICE;

    const finalStdEffectFrom = this.stdPriceEffectFrom
      ? this.normalizeDateOnly(this.stdPriceEffectFrom)
      : this.normalizeDateOnly(this.PackingData.STD_PRICE_EFFECT_FROM);

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

    const payload = {
      ...this.PackingData,
      COMBINATION: combinationToUse,
      PAIR_QTY: this.totalQuantity,
      STD_PRICE: finalStdPrice,
      STD_PRICE_EFFECT_FROM: finalStdEffectFrom,
      UNIT_ID: mainUnitId, // single main unit
      Units: unitsPayload,
      // ADD BOM HERE
      BOM: bomPayload,
      PackingEntries: this.PackingEntriesData.map((item: any) => ({
        ID: item.ID, // if exists
        ARTICLE_ID: Number(item.ARTICLE_ID),
        SIZE: String(item.SIZE),
        QUANTITY: Number(item.QUANTITY),
      })),
    };
    const unitName = this.produCtionUnits.find(
      (u) => u.ID === payload.UNIT_ID,
    )?.DESCRIPTION;
    const CategoryId = this.categoryList.find(
      (u) => u.ID === payload.CATEGORY_ID,
    )?.DESCRIPTION;

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
      '=====================',
    );

    //   Check for duplicate entry based on employee ID
    const duplicate = this.packing_list.find(
      (item: any) =>
        item.PackingName === packname &&
        item.ArtNo === artno &&
        item.Color === color &&
        item.Category === categoryID &&
        item.Unit === unitID &&
        item.ID !== id, //  ID must be different for true duplication
    );

    if (duplicate) {
      notify(
        {
          message: 'This Packing combination already .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
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
        'error',
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
    //   return; //  Stop if form is invalid
    // }

    this.dataService.Update_packages_listapi(payload).subscribe((res: any) => {
      this.closePopup();
      if (res?.flag === -1) {
        notify(
          {
            message: res.Message || 'A similar record already exists.',
            position: { at: 'top right', my: 'top right' },
            displayTime: 2000,
          },
          'error',
        );
        return; //  stop further execution
      }

      if (res?.flag === 0) {
        notify(
          {
            message: res.Message || 'A similar record already exists.',
            position: { at: 'top right', my: 'top right' },
            displayTime: 2000,
          },
          'error',
        );
        return; //  stop further execution
      }

      notify(
        {
          message: 'Data  Updated succesfully ',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
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
    console.log('Row updated:', this.PackingEntriesData);

    this.totalQuantity = (this.PackingEntriesData || []).reduce(
      (sum: number, item: any) => {
        const qty = Number(item.QUANTITY || 0);
        return sum + qty;
      },
      0,
    );

    console.log('Total Quantity:', this.totalQuantity);
  }

  loadArticle() {
    // this.updateQtyFromCombination(this.PackingData.COMBINATION);

    const payload = {
      artNo: this.PackingData.ART_NO,
      color: this.PackingData.COLOR,
      categoryID: this.PackingData.CATEGORY_ID,
      // unitID: this.PackingData.UNIT_ID,
      // COMPANY_ID: this.selected_Company_id,
    };

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
    //   //  prevent grid from showing
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

    //   return; //  Prevent saving if form is invalid
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
    this.isArticleFieldsDisabled = true;

    this.dataService
      .get_combinbation_list_api(payload)
      .subscribe((response: any) => {
        this.articleSizeData = response;
        this.PackingData.COMBINATION = '';
      });
  }
  // selectedSizeRows: any[] = [];

  onSizeSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
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

    //  Resets values and clears all validation UI
    // this.formValidationGroup?.instance?.resetValues();
    this.isArticleFieldsDisabled = false;
    this.articleSizeData = [];
    this.combination_value = [];
    this.totalQuantity = 0;
  }

  close() {}

  onSelectionChanged(e: any) {
    this.selectedRowKeys = e.selectedRowKeys;
  }

  // onEditorPreparing(e: any) {
  //   if (e.dataField === 'QUANTITY' && e.row?.data) {
  //     e.editorOptions.onValueChanged = (args: any) => {
  //       const newQty = Number(args.value) || 0;

  //       //  1. Update the grid row object
  //       e.row.data.QUANTITY = newQty;

  //       //  2. Ensure main datasource array is updated
  //       const index = this.PackingEntriesData.findIndex(
  //         (i: any) =>
  //           i.ARTICLE_ID === e.row.data.ARTICLE_ID &&
  //           i.SIZE === e.row.data.SIZE
  //       );

  //       if (index !== -1) {
  //         this.PackingEntriesData[index].QUANTITY = newQty;
  //       }

  //       //  3. Recalculate total
  //       this.onQuantityChanged();

  //       console.log(
  //         'Updated PackingEntriesData:',
  //         this.PackingEntriesData.map(
  //           (i: any) => `${i.SIZE}x${i.QUANTITY}`
  //         )
  //       );
  //     this.combinationString = String(this.PackingEntriesData.map(
  //           (i: any) => `${i.SIZE}x${i.QUANTITY}`
  //         ))
  //     };
  //   }
  // }

  onEditorPreparing(e: any) {
    //  Only for Quantity column in data rows
    if (e.parentType !== 'dataRow' || e.dataField !== 'QUANTITY') {
      return;
    }

    const rowKey = e.row.key;
    const isRowSelected = this.selectedRowKeys.includes(rowKey);

    //  Allow editing ONLY if row is selected
    e.editorOptions.readOnly = !isRowSelected;
    // OR if you want it fully disabled:
    // e.editorOptions.disabled = !isRowSelected;

    //  Do not attach onValueChanged if row is not selected
    if (!isRowSelected) {
      return;
    }

    // ===============================
    //  Your existing edit logic
    e.editorOptions.onValueChanged = (args: any) => {
      const newQty = Number(args.value) || 0;

      // 1️ Update grid row
      e.row.data.QUANTITY = newQty;

      // 2️ Update main datasource
      const index = this.PackingEntriesData.findIndex(
        (i: any) =>
          i.ARTICLE_ID === e.row.data.ARTICLE_ID && i.SIZE === e.row.data.SIZE,
      );

      if (index !== -1) {
        this.PackingEntriesData[index].QUANTITY = newQty;
      }

      // 3️ Recalculate total
      this.onQuantityChanged();

      // 4️ Update combination string
      this.combinationString = this.PackingEntriesData.map(
        (i: any) => `${i.SIZE}x${i.QUANTITY}`,
      ).join(', ');

      console.log('Updated PackingEntriesData:', this.combinationString);
    };
  }

  get selectedUnitsHint(): string {
    if (!this.PackingData.UNIT_ID?.length) {
      return 'No unit selected';
    }

    return this.produCtionUnits
      .filter((u) => this.PackingData.UNIT_ID.includes(u.ID))
      .map((u) => u.DESCRIPTION)
      .join(', ');
  }

  updateItemDescription() {
    const companyCode = this.company_code || '';

    const brandName =
      this.brandList?.find((b: any) => b.ID === this.PackingData.BRAND_ID)
        ?.ITEM_DESCRIPTION || '';

    const categoryName =
      this.categoryList?.find((c: any) => c.ID === this.PackingData.CATEGORY_ID)
        ?.ITEM_DESCRIPTION || '';

    const artNo = this.PackingData.ART_NO || '';
    const color = this.PackingData.COLOR || '';
    const packing = this.PackingData.STANDARD_PACKING || '';
    const price = this.PackingData.PACK_PRICE ?? '';

    const parts = [
      'FOOTWEARE',
      companyCode,
      brandName,
      artNo,
      color,
      packing,
      categoryName,
      price,
    ].filter((p) => p !== '' && p !== null && p !== undefined);

    this.PackingData.ITEM_DESCRIPTION = parts.join('-');
  }

  onChangePrice() {
    this.pricePopupVisible = true;
  }
  onViewPriceHistory() {
    const payload = {
      PACKING_ID: Number(this.PackingData.ID), // from packing select response
    };
    this.dataService.View_PackingPrice_Change_Api(payload).subscribe({
      next: (res: any) => {
        console.log(res, 'responseeeeeeeeeee');
        this.priceHistoryList = res.Data;
      },
    });
    this.ViewpricePopupVisible = true;
  }

  savePriceChange() {
    //  Basic safety checks
    if (!this.PackingData?.ID) {
      notify('Packing ID not found', 'error', 800);
      return;
    }

    if (
      !this.PackingData.STD_PRICE ||
      !this.PackingData.STD_PRICE_EFFECT_FROM
    ) {
      notify('Please enter price and effective date', 'warning', 800);
      return;
    }

    //  Build payload exactly as backend expects
    const payload = {
      ID: Number(this.PackingData.ID), // from packing select response
      STD_PRICE: this.PackingData.STD_PRICE, // user input
      STD_PRICE_EFFECT_FROM: this.PackingData.STD_PRICE_EFFECT_FROM, // user input
      CHANGE_USER_ID: Number(this.user_id), // from session
    };

    console.log('Price Change Payload:', payload);

    //  Call API
    this.dataService.Insert_PackingPrice_Change_Api(payload).subscribe({
      next: (res: any) => {
        console.log('Price change saved:', res);

        notify(
          {
            message: 'Price updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 800,
          },
          'success',
        );

        this.pricePopupVisible = false; // close popup
      },
      error: (err) => {
        console.error('Price change error:', err);
        notify('Failed to update price', 'error', 800);
      },
    });
  }

  isSameArticle(rowData: any): boolean {
    const artNo = this.PackingData.ART_NO;
    const color = this.PackingData.COLOR;
    const category = this.PackingData.CATEGORY_NAME;

    const desc = rowData?.DESCRIPTION || '';

    return (
      desc.includes(artNo) && desc.includes(color) && desc.includes(category)
    );
  }

  deleteButtonVisible = (e: any) => {
    return !this.isSameArticle(e.row.data);
  };
  addNewRow() {
    this.dataService.getItemsListForPacking().subscribe((res: any) => {
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

  // saveSelectedItems() {

  //   const popupGrid = this.bomGridRef.instance;   // popup grid

  //   const selectedRows = popupGrid.getSelectedRowsData();

  //   if (!selectedRows.length) {
  //     return;
  //   }

  //   //  Remove empty row if exists
  //   this.items = this.items.filter(
  //     row => row.ITEM || row.DESCRIPTION || row.UOM || row.QUANTITY
  //   );

  //   selectedRows.forEach((item: any) => {

  //     const exists = this.items.some(
  //       x => x.ITEM === item.ITEM_CODE
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
    const popupGrid = this.bomGridRef.instance;
    const selectedRows = popupGrid.getSelectedRowsData();

    // selected item IDs from popup
    const selectedIds = selectedRows.map((item: any) => item.ID);

    // 1️ Remove BOM items that are not selected anymore
    this.items = this.items.filter(
      (row) => !row.ITEM_ID || selectedIds.includes(row.ITEM_ID),
    );

    this.items = this.items.filter(
      (row) => row.ITEM || row.DESCRIPTION || row.UOM || row.QUANTITY,
    );

    // 2️ Add newly selected items
    selectedRows.forEach((item: any) => {
      const exists = this.items.some((x) => x.ITEM_ID === item.ID);

      if (!exists) {
        this.items.push({
          ITEM: item.ITEM_CODE,
          DESCRIPTION: item.DESCRIPTION,
          UOM: item.UOM,
          QUANTITY: null,
          ITEM_ID: item.ID,
        });
      }
    });

    // refresh BOM grid
    this.itemsGridRef.instance.refresh();
    this.ensureEmptyRow(); //  IMPORTANT
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
  declarations: [PackingEditComponent],
  exports: [PackingEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingEditModule {}