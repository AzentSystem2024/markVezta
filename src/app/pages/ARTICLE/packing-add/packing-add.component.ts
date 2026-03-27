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
  DxValidationGroupComponent,
  DxValidationGroupModule,
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
import { it } from 'node:test';

@Component({
  selector: 'app-packing-add',
  templateUrl: './packing-add.component.html',
  styleUrls: ['./packing-add.component.scss'],
})
export class PackingAddComponent {
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

  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('bomGridRef', { static: false }) bomGridRef: any;
  popupVisible = false;
  articleData: any;
  colorList: any;
  categoryList: any;
  typeList: any;
  brandList: any;
  produCtionUnits: any;
  materialUnits: any;
  articleSizeData: any[] = [];
  selectedProductionUnitId: any;
  isArticleFieldsDisabled: boolean = false;
  duplicateFields: any[] = [];
  selectedTabIndex = 0;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  isFilterRowVisible: boolean = false;
  items: any[] = []; // grid data → BoM components
  itemsList: any[] = [];
  company_code: any; // dropdown source → item master list
  selectedRowKeys: any[] = [];
  PackingData: any = {
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
    COMBINATION: '',
    STANDARD_PACKING: '',
    PACK_PRICE: null,
    UNIT_ID: null,
    IS_PURCHASABLE: false,
    IS_EXPORT: false,
    IS_ANY_COMB: false,
    SUPP_ID: 0,
    COMPANY_ID: 0,
    STD_PRICE: 0,
    ITEM_DESCRIPTION: '',
    STD_PRICE_EFFECT_FROM: new Date(),
    PackingEntries: [
      {
        ARTICLE_ID: 0,
        QUANTITY: 0,
        SIZE: '',
      },
    ],
  };
  Alias_no: number;
  Part_no: number;
  art_Serial_no: any;
  selectedRows: any;
  combination_value: any[] = [];
  packing_list: any;
  combinationString: string;
  selected_Company_id: any;
  selected_fin_id: any;
  selectedItemID: any;
  selectedItem: any;
  ItempopupVisible: boolean = false;
  selectedItems: any[] = [];
  ItemListDataSource: any[] = [];

  //===================dummy datasource of =========================
  constructor(private dataService: DataService) {
    this.sesstion_Details();
    // const payload = {
    //   COMPANY_ID: this.selected_Company_id,
    // };
  }

  ngOnInit() {
    this.getDropdownLists();
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
    }
    this.getAliasNo();
    this.getPartNo();
    this.getItems();
    this.getPackingList();
    this.PackingData.ART_SERIAL = 1;

    this.items = [
      {
        ITEM: null,
        DESCRIPTION: '',
        UOM: '',
        QUANTITY: null,
      },
    ];
  }
  getPackingList() {
    this.dataService.get_packages_list_api().subscribe((res: any) => {
      this.packing_list = res.Data;
    });
  }

  getAliasNo() {
    this.dataService.getPackingLastAliasNo().subscribe((response: any) => {
      this.PackingData.ALIAS_NO = response.GetAliasNo;
    });
  }

  getPartNo() {
    this.dataService.getPackingLastPartNo().subscribe((response: any) => {
      this.PackingData.PART_NO = response.GetPartNo;
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

  //======================== check box for select ==========================

  onQtyCheckboxChanged(event: any) {}

  getLastOrderNo() {
    this.selectedProductionUnitId = this.PackingData.UNIT_ID;

    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataService.getLastOrderNo(payload).subscribe((response: any) => {
      const last_no = Number(response.LastOrderNo);

      const dgt = last_no + 1;
      this.PackingData.ORDER_NO = dgt.toString(); // Ensure it is 6 digits long
    });
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
      this.itemsList = response;
    });
  }

  loadArticle() {
    const payload = {
      artNo: this.PackingData.ART_NO,
      color: this.PackingData.COLOR,
      categoryID: this.PackingData.CATEGORY_ID,
      // unitID: this.selectedProductionUnitId,
      // COMPANY_ID: this.selected_Company_id,
    };

    const ArtvalidationResult = this.ArtnoValidationGroup?.instance?.validate();

    const ColorvalidationResult =
      this.ColorValidationGroup?.instance?.validate();

    const CatgoryvalidationResult =
      this.CategoryValidationGroup?.instance?.validate();

    // const UnitvalidationResult = this.UnitValidationGroup?.instance?.validate();

    if (
      !ArtvalidationResult.isValid ||
      !ColorvalidationResult.isValid ||
      !CatgoryvalidationResult.isValid
      // !UnitvalidationResult.isValid
    ) {
      return; //  Prevent saving if form is invalid
    }
    if (
      !payload.artNo ||
      !payload.color ||
      !payload.categoryID
      // !payload.unitID
    ) {
      notify(
        {
          message: 'Please fill all required fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      return;
    }
    this.isArticleFieldsDisabled = true;

    this.dataService
      .get_combinbation_list_api(payload)
      .subscribe((response: any) => {
        const convertedData = response;

        this.articleSizeData = convertedData.map((item) => ({
          ...item,
          Size: parseInt(item.Size, 10), // convert Size from string to number
        }));
      });
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

  onSelectionChanged(e: any) {
    this.selectedRowKeys = e.selectedRowKeys;
  }

  // onEditorPreparing(e: any) {

  //   console.log(e, 'EDITOR PREPARING EVENT');
  //   const rowData = e.row?.data;
  //   console.log(rowData, 'ROW DATA IN EDITOR PREPARING');

  //   const sizeQtyString = `${rowData.Size}x${rowData.QUANTITY}`;
  //   console.log(sizeQtyString, 'SIZE QUANTITY STRING');

  //   // this.combination_value.push(sizeQtyString); // Add the size and quantity to the combination_value array
  //   if (!this.combination_value.includes(sizeQtyString)) {
  //     this.combination_value.push(sizeQtyString);
  //   }
  //   console.log(this.combination_value, 'COMBINATION VALUE ARRAY');
  //   const validData = this.combination_value.filter(
  //     (item) => !item.includes('undefined'),
  //   );

  //   console.log(validData, 'VALID DATA AFTER FILTERING');

  //   this.combinationString = validData.join(', '); // Join the array into a string
  //   console.log(this.combinationString, 'COMBINATION STRING');
  // }

  onEditorPreparing(e: any) {
    //  Run only for data rows & Quantity column
    if (e.parentType !== 'dataRow' || e.dataField !== 'QUANTITY') {
      return;
    }

    const rowData = e.row?.data;
    if (!rowData) {
      return;
    }

    // ===============================
    //  Allow edit only if row is selected
    const isRowSelected = this.selectedRowKeys.includes(e.row.key);
    e.editorOptions.readOnly = !isRowSelected;
    // OR use disabled instead:
    // e.editorOptions.disabled = !isRowSelected;

    // ===============================
    //  Your existing logic (safe now)
    const sizeQtyString = `${rowData.Size}x${rowData.QUANTITY}`;

    if (!this.combination_value.includes(sizeQtyString)) {
      this.combination_value.push(sizeQtyString);
    }

    const validData = this.combination_value.filter(
      (item) => !item.includes('undefined'),
    );

    this.combinationString = validData.join(', ');
  }

  totalQuantity: number = 0;

  onQuantityChanged() {
    // Recalculate total quantity when any quantity is changed
    this.totalQuantity = this.articleSizeData.reduce(
      (sum: number, item: any) => {
        const qty = parseInt(item.QUANTITY, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      },
      0,
    );
  }

  onPurchasableChanged(e: any) {
    // Add any custom logic here if needed
  }

  //===========================Add Functiionality===================

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.company_code = sessionData.SELECTED_COMPANY.COMPANY_CODE;
  }

  AddData() {
    //  Validate main form
    const validationResult = this.formValidationGroup?.instance?.validate();
    if (!validationResult?.isValid) {
      return;
    }

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

    //  Convert number fields to string as required by backend
    const Alias_no = Number(this.PackingData.ALIAS_NO);
    const Part_no = Number(this.PackingData.PART_NO);

    this.Alias_no = this.PackingData.ALIAS_NO.toString();
    this.Part_no = this.PackingData.PART_NO.toString();

    this.art_Serial_no = String(this.PackingData.ART_SERIAL ?? '');

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

    // =====================================================
    //  BUILD BOM PAYLOAD
    // =====================================================
    const bomPayload = (this.items || [])
      .filter((item: any) => Number(item.QUANTITY) > 0)
      .map((item: any) => ({
        ITEM_ID: Number(item.ITEM_ID),
        QUANTITY: Number(item.QUANTITY),
      }));

    const packingEntriesPayload = (this.articleSizeData || []).map((item) => ({
      ARTICLE_ID: Number(item.ArticleID),
      SIZE: String(item.Size),
      QUANTITY: Number(item.QUANTITY) || 0, //  force 0 if empty
    }));

    // =====================================================
    //  FINAL PAYLOAD
    // =====================================================
    const payload = {
      ...this.PackingData,

      // COMPANY_ID: this.selected_Company_id,
      ALIAS_NO: this.Alias_no,
      PART_NO: this.Part_no,
      ART_SERIAL: this.art_Serial_no,
      COMBINATION: this.combinationString,
      PAIR_QTY: this.totalQuantity,
      UNIT_ID: mainUnitId,
      //  ADD BOM
      BOM: bomPayload,

      //  ADD PACKING ENTRIES
      PackingEntries: packingEntriesPayload,
      Units: unitsPayload,
    };

    // =====================================================
    //  ALIAS NO DUPLICATE CHECK (FIXED)
    // =====================================================
    const enteredAlias = String(payload.ALIAS_NO ?? '').trim();

    const aliasDuplicate = (this.packing_list || []).some((item: any) => {
      const existingAlias = String(item.AliasNo ?? '').trim();
      return existingAlias === enteredAlias;
    });

    if (aliasDuplicate) {
      notify(
        {
          message: `Alias No "${enteredAlias}" already exists.`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 1200,
        },
        'error',
      );
      return;
    }

    // =====================================================
    //  DUPLICATE CHECK
    // =====================================================
    const unitName = this.produCtionUnits.find(
      (u) => u.ID === payload.UNIT_ID,
    )?.DESCRIPTION;

    const categoryName = this.categoryList.find(
      (u) => u.ID === payload.CATEGORY_ID,
    )?.DESCRIPTION;

    const duplicate = this.packing_list.find(
      (item: any) =>
        item.PackingName === payload.DESCRIPTION &&
        item.ArtNo === payload.ART_NO &&
        item.Color === payload.COLOR &&
        item.Category === categoryName &&
        item.Unit === unitName,
    );

    if (duplicate) {
      notify(
        {
          message: 'This Packing Combination already exists.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 800,
        },
        'error',
      );
      return;
    }

    if (this.totalQuantity <= 1) {
      notify(
        {
          message: 'Please add quantity.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 800,
        },
        'error',
      );
      return;
    }
    if (!Array.isArray(this.packing_list)) {
      notify(
        { message: 'Packing list not loaded yet', displayTime: 800 },
        'warning',
      );
      return;
    }

    // =====================================================
    //  API CALL
    // =====================================================
    this.dataService.Add_packages_listapi(payload).subscribe(
      (res: any) => {
        //  BUSINESS ERROR (duplicate etc.)
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

        //  SUCCESS
        notify(
          {
            message: 'Data successfully added',
            position: { at: 'top right', my: 'top right' },
            displayTime: 800,
          },
          'success',
        );

        this.getPackingList();
        this.popupClosed.emit();
        this.popupVisible = false;

        // optional resets if needed
      },
      (error) => {
        console.error('HTTP error:', error);

        notify(
          {
            message: 'Server error. Please try again later.',
            position: { at: 'top right', my: 'top right' },
            displayTime: 2000,
          },
          'error',
        );
      },
    );
  }

  clearForm() {
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
    setTimeout(() => {
      this.ArtnoValidationGroup?.instance?.reset();
    });
    setTimeout(() => {
      this.ColorValidationGroup?.instance?.reset();
    });
    setTimeout(() => {
      this.CategoryValidationGroup?.instance?.reset();
    });
    setTimeout(() => {
      this.UnitValidationGroup?.instance?.reset();
    });
    this.PackingData = {
      ART_NO: '',
      ORDER_NO: '',
      ALIAS_NO: '',
      CATEGORY_ID: null,
      COLOR: '',
      DESCRIPTION: '',
      ARTICLE_TYPE: null,
      PAIR_QTY: null,
      IS_INACTIVE: false,
      PART_NO: '',
      // ALIAS_NO: '',
      ART_SERIAL: '',
      COMBINATION: '2x4',
      PACK_PRICE: null,
      UNIT_ID: null,
      IS_PURCHASABLE: false,
      IS_EXPORT: false,
      IS_ANY_COMB: false,
      SUPP_ID: null,
    };
    this.isArticleFieldsDisabled = false;
    this.articleSizeData = []; // Clear the article size data after adding
    this.combination_value = []; // Clear the combination value array
    this.totalQuantity = 0;
    this.PackingData.IS_PURCHASABLE = false;
    this.PackingData.IS_EXPORT = false;
    this.PackingData.IS_ANY_COMB = false;
  }

  // resetForm() {
  //    const preservedAliasNo = this.PackingData.ALIAS_NO;
  //   this.PackingData = {
  //     ART_NO: '',
  //     ORDER_NO: '',
  //     CATEGORY_ID: null,
  //     COLOR: '',
  //     DESCRIPTION: '',
  //     ARTICLE_TYPE: null,
  //     PAIR_QTY: null,
  //     IS_INACTIVE: false,
  //     PART_NO: '',
  //     ALIAS_NO: preservedAliasNo,
  //     ART_SERIAL: '',
  //     COMBINATION: '2x4',
  //     PACK_PRICE: null,
  //     UNIT_ID: null,
  //     IS_PURCHASABLE: false,
  //     IS_EXPORT: false,
  //     IS_ANY_COMB: false,
  //     SUPP_ID: null,
  //     STD_PRICE_EFFECT_FROM: new Date()
  //   };

  //   this.formValidationGroup?.instance?.reset();
  //   this.ArtnoValidationGroup?.instance?.reset();
  //   this.ColorValidationGroup?.instance?.reset();
  //   this.CategoryValidationGroup?.instance?.reset();
  //   this.UnitValidationGroup?.instance?.reset();
  //   this.isArticleFieldsDisabled = false;
  //   this.articleSizeData = []; // Clear the article size data after adding
  //   // this.isArticleFieldsDisabled = false;
  //   //       this.articleSizeData = []; // Clear the article size data after adding
  //   this.combination_value = []; // Clear the combination value array
  //   this.totalQuantity = 0;
  //   this.PackingData.IS_PURCHASABLE = false;
  //   this.PackingData.IS_EXPORT = false;
  //   this.PackingData.IS_ANY_COMB = false;
  //   setTimeout(() => {
  //     this.formValidationGroup?.instance?.reset();
  //   });

  //   setTimeout(() => {
  //     this.ColorValidationGroup?.instance?.reset();
  //   });
  // }

  resetForm() {
    // FIRST reset validation
    this.formValidationGroup?.instance?.reset();
    this.ArtnoValidationGroup?.instance?.reset();
    this.ColorValidationGroup?.instance?.reset();
    this.CategoryValidationGroup?.instance?.reset();
    this.UnitValidationGroup?.instance?.reset();

    // THEN mutate model
    this.PackingData.ART_NO = '';
    this.PackingData.ORDER_NO = '';
    this.PackingData.CATEGORY_ID = null;
    this.PackingData.COLOR = '';
    this.PackingData.DESCRIPTION = '';
    this.PackingData.ARTICLE_TYPE = null;
    this.PackingData.PAIR_QTY = null;
    this.PackingData.IS_INACTIVE = false;
    this.PackingData.PART_NO = '';
    this.PackingData.ART_SERIAL = '1';
    this.PackingData.COMBINATION = '2x4';
    this.PackingData.PACK_PRICE = null;
    this.PackingData.UNIT_ID = null;

    this.PackingData.IS_PURCHASABLE = false;
    this.PackingData.IS_EXPORT = false;
    this.PackingData.IS_ANY_COMB = false;
    this.PackingData.SUPP_ID = null;

    //  NOW assign defaults (AFTER validation reset)
    this.PackingData.STD_PRICE_EFFECT_FROM = new Date();

    setTimeout(() => {
      this.PackingData.STD_PRICE = 0;
    });

    this.items = [
      {
        ITEM: null,
        DESCRIPTION: '',
        UOM: '',
        QUANTITY: null,
      },
    ];
    this.isArticleFieldsDisabled = false;
    this.articleSizeData = [];
    this.combination_value = [];
    this.totalQuantity = 0;

    // async alias LAST
    this.getAliasNo();
    this.getPartNo();
  }

  closePopup() {
    this.popupClosed.emit();
    this.resetForm();
  }
  // closePopup() {
  //   const aliasNo = this.PackingData.ALIAS_NO;
  //   this.popupClosed.emit();
  //   this.resetForm();
  //   this.PackingData.ALIAS_NO = aliasNo;                 // keep alias
  // this.PackingData.STD_PRICE_EFFECT_FROM = new Date();
  //   // restore preserved field
  //   setTimeout(() => {
  //     this.formValidationGroup?.instance?.reset();
  //   });

  //   setTimeout(() => {
  //     this.ColorValidationGroup?.instance?.reset();
  //   });

  //   //       setTimeout(() => {
  //   //       this.formValidationGroup?.instance?.reset();
  //   //     });
  //   //         setTimeout(() => {
  //   //       this.ArtnoValidationGroup?.instance?.reset();
  //   //     });
  //   //         setTimeout(() => {
  //   //       this.ColorValidationGroup?.instance?.reset();
  //   //     });
  //   //         setTimeout(() => {
  //   //       this.CategoryValidationGroup?.instance?.reset();
  //   //     });
  //   //         setTimeout(() => {
  //   //       this.UnitValidationGroup?.instance?.reset();
  //   //     });
  //   //     this.PackingData= {
  //   //   ART_NO: '',
  //   //   ORDER_NO: '',
  //   //   CATEGORY_ID: null,
  //   //   COLOR: '',
  //   //   DESCRIPTION:'',
  //   //    ARTICLE_TYPE: null,
  //   //   PAIR_QTY: null,
  //   //   IS_INACTIVE: false,
  //   //   PART_NO: '',
  //   //   ALIAS_NO: '',
  //   //   ART_SERIAL:'',
  //   //   COMBINATION:'2x4',
  //   //   PACK_PRICE: null,
  //   //   UNIT_ID: null,
  //   //   IS_PURCHASABLE: false,
  //   //   IS_EXPORT: false,
  //   //  IS_ANY_COMB: false,
  //   //   SUPP_ID: null,

  //   // };

  //   //       this.isArticleFieldsDisabled = false;
  //   //       this.articleSizeData = []; // Clear the article size data after adding
  //   //       this.combination_value = []; // Clear the combination value array
  //   //       this.totalQuantity = 0;
  //   //       this.PackingData.IS_PURCHASABLE=false;
  //   //       this.PackingData.IS_EXPORT=false;
  //   //       this.PackingData.IS_ANY_COMB=false;
  // }

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

  saveSelectedItems() {
    const popupGrid = this.bomGridRef.instance; // popup grid

    const selectedRows = popupGrid.getSelectedRowsData();

    if (!selectedRows.length) {
      return;
    }

    //  Remove empty row if exists
    this.items = this.items.filter(
      (row) => row.ITEM || row.DESCRIPTION || row.UOM || row.QUANTITY,
    );

    selectedRows.forEach((item: any) => {
      const exists = this.items.some((x) => x.ITEM === item.ITEM_CODE);

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
    DxValidationGroupModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [PackingAddComponent],
  exports: [PackingAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingAddModule {}