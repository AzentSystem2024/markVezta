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
  itemsList: any[] = []; // dropdown source → item master list
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
    PACK_PRICE: null,
    UNIT_ID: null,
    IS_PURCHASABLE: false,
    IS_EXPORT: false,
    IS_ANY_COMB: false,
    SUPP_ID: 0,
    COMPANY_ID: 0,
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

  //===================dummy datasource of =========================
  constructor(private dataService: DataService) {
     this.sesstion_Details();
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.get_packages_list_api(payload).subscribe((res: any) => {
      console.log('response from get packing list api:', res);

      this.packing_list = res.Data;
    });
   
  }

  ngOnInit() {
    this.getDropdownLists();
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
    }
    this.getItems();
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

  //======================== check box for select ==========================

  onQtyCheckboxChanged(event: any) {}

  getLastOrderNo() {
    console.log('this function is called');
    this.selectedProductionUnitId = this.PackingData.UNIT_ID;

    console.log(this.selectedProductionUnitId);

    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataService.getLastOrderNo(payload).subscribe((response: any) => {
      console.log(response, 'LASTORDERNO Response');
      const last_no = Number(response.LastOrderNo);
      console.log(last_no, 'LASTORDERNO');

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
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.listItemsForArticle(payload).subscribe((response: any) => {
      this.itemsList = response.DataList;
    });
  }

  loadArticle() {
    const payload = {
      artNo: this.PackingData.ART_NO,
      color: this.PackingData.COLOR,
      categoryID: this.PackingData.CATEGORY_ID,
      unitID: this.selectedProductionUnitId,
      COMPANY_ID: this.selected_Company_id,
    };

    const ArtvalidationResult = this.ArtnoValidationGroup?.instance?.validate();

    const ColorvalidationResult =
      this.ColorValidationGroup?.instance?.validate();

    const CatgoryvalidationResult =
      this.CategoryValidationGroup?.instance?.validate();

    const UnitvalidationResult = this.UnitValidationGroup?.instance?.validate();

    if (
      !ArtvalidationResult.isValid ||
      !ColorvalidationResult.isValid ||
      !CatgoryvalidationResult.isValid ||
      !UnitvalidationResult.isValid
    ) {
      return; // ❌ Prevent saving if form is invalid
    }
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
        console.log(args, 'ARGSSSSSSSSSSSSSS');
        // Keep the selected value in the grid
        grid.cellValue(rowIndex, 'ITEM', selectedDescription);

        // Find the matched item ID
        const matchedItem = this.itemsList.find(
          (p: any) => p.DESCRIPTION === selectedDescription
        );
        console.log(matchedItem.ID, 'MATCHEDITEMMMMMMMMMMMMMMMMMMM');
        grid.cellValue(rowIndex, 'ITEM_ID', matchedItem?.ID ?? null);

        console.log(this.selectedItemID, 'ID');
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

  onEditorPreparing(e: any) {
    console.log(e, 'EDITOR PREPARING EVENT');
    const rowData = e.row?.data;
    console.log(rowData, 'ROW DATA IN EDITOR PREPARING');

    const sizeQtyString = `${rowData.Size}x${rowData.QUANTITY}`;
    console.log(sizeQtyString, 'SIZE QUANTITY STRING');

    // this.combination_value.push(sizeQtyString); // Add the size and quantity to the combination_value array
    if (!this.combination_value.includes(sizeQtyString)) {
      this.combination_value.push(sizeQtyString);
    }
    console.log(this.combination_value, 'COMBINATION VALUE ARRAY');
    const validData = this.combination_value.filter(
      (item) => !item.includes('undefined')
    );

    console.log(validData, 'VALID DATA AFTER FILTERING');

    this.combinationString = validData.join(', '); // Join the array into a string
    console.log(this.combinationString, 'COMBINATION STRING');
  }

  totalQuantity: number = 0;

  onQuantityChanged() {
    console.log('Quantity changed', this.articleSizeData);

    // Recalculate total quantity when any quantity is changed
    this.totalQuantity = this.articleSizeData.reduce(
      (sum: number, item: any) => {
        const qty = parseInt(item.QUANTITY, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      },
      0
    );

    console.log(this.totalQuantity);
  }
  //========================on selection change for take grid value=========================
  // onSelectionChanged(e: any) {
  //   console.log(e, "SELECTION CHANGE EVENT");

  //   console.log("Selection changed:", e.selectedRowsData);

  //   this.selectedRows = e.selectedRowsData;

  //     this.combination_value = this.getCombinationString();
  // console.log(this.combination_value);
  // this.totalQuantity = this.selectedRows.reduce((sum, item) => {
  //   return sum + Number(item.QUANTITY); // Convert QUANTITY to number
  // }, 0);
  // console.log("Total Quantity:", this.totalQuantity);
  // }
  // //========================get combination string=========================
  // getCombinationString(): string {
  //   return this.selectedRows
  //     .filter(item => item.QUANTITY && +item.QUANTITY > 0) // optional: filter only non-zero quantities
  //     .map(item => `${item.Size}x${item.QUANTITY}`)
  //     .join(',');
  // }

  onPurchasableChanged(e: any) {
    console.log('Purchasable changed:', e.value);
    // Add any custom logic here if needed
  }

  //===========================Add Functiionality===================

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
  }
  // AddData() {
  //   console.log(this.packing_list, '======================');

  //   const validationResult = this.formValidationGroup?.instance?.validate();

  //   if (!validationResult?.isValid) {
  //     // Optional: Notify or prevent submission
  //     return;
  //   }
  //   const Alias_no = Number(this.PackingData.ALIAS_NO);
  //   const Part_no = Number(this.PackingData.PART_NO);

  //   console.log(this.PackingData);

  //   this.Alias_no = this.PackingData.ALIAS_NO.toString();
  //   this.Part_no = this.PackingData.PART_NO.toString();
  //   this.art_Serial_no = this.PackingData.ART_SERIAL.toString();
  //   const payload = {
  //     ...this.PackingData,
  //     ALIAS_NO: this.Alias_no,
  //     PART_NO: this.Part_no,
  //     ART_SERIAL: this.art_Serial_no,
  //     COMBINATION: this.combinationString,
  //     PAIR_QTY: this.totalQuantity,
  //     COMPANY_ID: this.selected_Company_id,
  //     PackingEntries: this.articleSizeData
  //       // .filter(item => Number(item.QUANTITY) > 0) // only include rows with quantity
  //       .map((item) => ({
  //         ARTICLE_ID: Number(item.ArticleID), // or whichever field holds article id
  //         SIZE: String(item.Size),
  //         QUANTITY: Number(item.QUANTITY),
  //       })),
  //   };
  //   console.log(this.articleSizeData, '========article size data=========');
  //   console.log(payload, '-----payload for packing list-----');

  //   const unitName = this.produCtionUnits.find(
  //     (u) => u.ID === payload.UNIT_ID
  //   )?.DESCRIPTION;
  //   console.log(unitName, '=============');
  //   const CategoryId = this.categoryList.find(
  //     (u) => u.ID === payload.CATEGORY_ID
  //   )?.DESCRIPTION;
  //   console.log(CategoryId, '=============');

  //   const artno = payload.ART_NO;
  //   const color = payload.COLOR;
  //   const categoryID = CategoryId;
  //   const unitID = unitName;
  //   const packname = payload.DESCRIPTION;
  //   const packqty = payload.PAIR_QTY;
  //   console.log(
  //     artno,
  //     color,
  //     categoryID,
  //     unitID,
  //     packname,
  //     packqty,
  //     '====================='
  //   );

  //   //  🔍 Check for duplicate entry based on employee ID
  //   const duplicate = this.packing_list.find(
  //     (item: any) =>
  //       item.PackingName === packname &&
  //       item.ArtNo === artno &&
  //       item.Color === color &&
  //       item.Category === categoryID &&
  //       item.Unit === unitID
  //   );

  //   if (duplicate) {
  //     notify(
  //       {
  //         message: 'This Packing Combination already .',
  //         position: { at: 'top right', my: 'top right' },
  //         displayTime: 500,
  //       },
  //       'error'
  //     );
  //     return;
  //   }
  //   if (packqty <= 1) {
  //     notify(
  //       {
  //         message: 'Please Add Quantity.',
  //         position: { at: 'top right', my: 'top right' },
  //         displayTime: 500,
  //       },
  //       'error'
  //     );
  //     return;
  //   }

  //   this.dataService
  //     .Add_packages_listapi(payload)
  //     .subscribe((response: any) => {
  //       console.log(response, 'PACKING DATA ADDED SUCCESSFULLY');
  //       notify(
  //         {
  //           message: 'Data succesfully added',
  //           position: { at: 'top right', my: 'top right' },
  //           displayTime: 500,
  //         },
  //         'success'
  //       );

  //       this.popupClosed.emit();

  //       setTimeout(() => {
  //         this.formValidationGroup?.instance?.reset();
  //       });
  //       setTimeout(() => {
  //         this.ArtnoValidationGroup?.instance?.reset();
  //       });
  //       setTimeout(() => {
  //         this.ColorValidationGroup?.instance?.reset();
  //       });
  //       setTimeout(() => {
  //         this.CategoryValidationGroup?.instance?.reset();
  //       });
  //       setTimeout(() => {
  //         this.UnitValidationGroup?.instance?.reset();
  //       });

  //       // this.isArticleFieldsDisabled = false;
  //       this.articleSizeData = []; // Clear the article size data after adding
  //       this.combination_value = []; // Clear the combination value array
  //       this.totalQuantity = 0; // Reset total quantity
  //       this.PackingData.IS_PURCHASABLE = false;
  //       this.PackingData.IS_EXPORT = false;
  //       this.PackingData.IS_ANY_COMB = false;
  //       this.PackingData.SUPP_ID = null; // Reset SUPP_ID if needed

  //       // this.PackingData= {
  //       //   ART_NO: '',
  //       //   ORDER_NO: '',
  //       //   CATEGORY_ID: null,
  //       //   COLOR: '',
  //       //   DESCRIPTION:'',
  //       //    ARTICLE_TYPE: null,
  //       //   PAIR_QTY: null,
  //       //   IS_INACTIVE: false,
  //       //   PART_NO: '',
  //       //   ALIAS_NO: '',
  //       //   ART_SERIAL:'',
  //       //   COMBINATION:'2x4',
  //       //   PACK_PRICE: null,
  //       //   UNIT_ID: null,
  //       //   IS_PURCHASABLE: false,
  //       //   IS_EXPORT: false,
  //       //  IS_ANY_COMB: false,

  //       // };
  //     });

  //   this.popupVisible = false;
  // }

  AddData() {
    console.log(this.packing_list, '======================');

    // 🔹 Validate main form
    const validationResult = this.formValidationGroup?.instance?.validate();
    if (!validationResult?.isValid) {
      return;
    }

    // 🔹 Convert number fields to string as required by backend
    const Alias_no = Number(this.PackingData.ALIAS_NO);
    const Part_no = Number(this.PackingData.PART_NO);

    console.log(this.PackingData);

    this.Alias_no = this.PackingData.ALIAS_NO.toString();
    this.Part_no = this.PackingData.PART_NO.toString();

    
  this.art_Serial_no = String(this.PackingData.ART_SERIAL ?? '');
  

    // =====================================================
    // 🔹 BUILD BOM PAYLOAD
    // =====================================================
    const bomPayload = (this.items || [])
      .filter((item: any) => Number(item.QUANTITY) > 0)
      .map((item: any) => ({
        ITEM_ID: Number(item.ITEM_ID),
        QUANTITY: Number(item.QUANTITY),
      }));

  console.log('BOM Payload:', bomPayload);

  // Optional BOM validation
  if (!bomPayload.length) {
    notify(
      {
        message: 'Please add at least one BOM item.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 800,
      },
      'warning'
    );
    return;
  }

  // =====================================================
  // 🔹 BUILD PACKING ENTRIES PAYLOAD
  // =====================================================
  const packingEntriesPayload = this.articleSizeData
    .filter(item => Number(item.QUANTITY) > 0)
    .map((item) => ({
      ARTICLE_ID: Number(item.ArticleID),
      SIZE: String(item.Size),
      QUANTITY: Number(item.QUANTITY),
    }));

  console.log('PackingEntries Payload:', packingEntriesPayload);

  // =====================================================
  // 🔹 FINAL PAYLOAD
  // =====================================================
  const payload = {
    ...this.PackingData,

    COMPANY_ID: this.selected_Company_id,
    ALIAS_NO: this.Alias_no,
    PART_NO: this.Part_no,
    ART_SERIAL: this.art_Serial_no,
    COMBINATION: this.combinationString,
    PAIR_QTY: this.totalQuantity,

    // ✅ ADD BOM
    BOM: bomPayload,

    // ✅ ADD PACKING ENTRIES
    PackingEntries: packingEntriesPayload,
  };

  console.log('FINAL INSERT PAYLOAD:', payload);

// =====================================================
// 🔴 ALIAS NO DUPLICATE CHECK (FINAL & CORRECT)
// =====================================================
const enteredAlias = String(payload.ALIAS_NO).trim();

const aliasDuplicate = this.packing_list[0].some((item: any) => {
  const existingAlias = String(item.ALIAS_NO ?? '').trim();
  console.log('Existing:', existingAlias, 'Entered:', enteredAlias);
  return existingAlias === enteredAlias;
});
console.log('Packing list first item:', this.packing_list[0]);

if (aliasDuplicate) {
  notify(
    {
      message: `Alias No "${enteredAlias}" already exists.`,
      position: { at: 'top right', my: 'top right' },
      displayTime: 1000,
    },
    'error'
  );
  return;
}


  // =====================================================
  // 🔹 DUPLICATE CHECK
  // =====================================================
  const unitName = this.produCtionUnits.find(
    (u) => u.ID === payload.UNIT_ID
  )?.DESCRIPTION;

  const categoryName = this.categoryList.find(
    (u) => u.ID === payload.CATEGORY_ID
  )?.DESCRIPTION;

  const duplicate = this.packing_list.find(
    (item: any) =>
      item.PackingName === payload.DESCRIPTION &&
      item.ArtNo === payload.ART_NO &&
      item.Color === payload.COLOR &&
      item.Category === categoryName &&
      item.Unit === unitName
  );

  if (duplicate) {
    notify(
      {
        message: 'This Packing Combination already exists.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 800,
      },
      'error'
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
      'error'
    );
    return;
  }

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
    // this.isArticleFieldsDisabled = false;
    this.articleSizeData = []; // Clear the article size data after adding
    this.combination_value = []; // Clear the combination value array
    this.totalQuantity = 0;
    this.PackingData.IS_PURCHASABLE = false;
    this.PackingData.IS_EXPORT = false;
    this.PackingData.IS_ANY_COMB = false;
  }

  resetForm() {
    console.log('Reset form called');
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

    this.formValidationGroup?.instance?.reset();
    this.ArtnoValidationGroup?.instance?.reset();
    this.ColorValidationGroup?.instance?.reset();
    this.CategoryValidationGroup?.instance?.reset();
    this.UnitValidationGroup?.instance?.reset();
    this.isArticleFieldsDisabled = false;
    this.articleSizeData = []; // Clear the article size data after adding
    // this.isArticleFieldsDisabled = false;
    //       this.articleSizeData = []; // Clear the article size data after adding
    this.combination_value = []; // Clear the combination value array
    this.totalQuantity = 0;
    this.PackingData.IS_PURCHASABLE = false;
    this.PackingData.IS_EXPORT = false;
    this.PackingData.IS_ANY_COMB = false;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });

    setTimeout(() => {
      this.ColorValidationGroup?.instance?.reset();
    });
  }
  closePopup() {
    this.popupClosed.emit();
    console.log('this cancel close popup');
    this.resetForm();
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });

    setTimeout(() => {
      this.ColorValidationGroup?.instance?.reset();
    });

    //       setTimeout(() => {
    //       this.formValidationGroup?.instance?.reset();
    //     });
    //         setTimeout(() => {
    //       this.ArtnoValidationGroup?.instance?.reset();
    //     });
    //         setTimeout(() => {
    //       this.ColorValidationGroup?.instance?.reset();
    //     });
    //         setTimeout(() => {
    //       this.CategoryValidationGroup?.instance?.reset();
    //     });
    //         setTimeout(() => {
    //       this.UnitValidationGroup?.instance?.reset();
    //     });
    //     this.PackingData= {
    //   ART_NO: '',
    //   ORDER_NO: '',
    //   CATEGORY_ID: null,
    //   COLOR: '',
    //   DESCRIPTION:'',
    //    ARTICLE_TYPE: null,
    //   PAIR_QTY: null,
    //   IS_INACTIVE: false,
    //   PART_NO: '',
    //   ALIAS_NO: '',
    //   ART_SERIAL:'',
    //   COMBINATION:'2x4',
    //   PACK_PRICE: null,
    //   UNIT_ID: null,
    //   IS_PURCHASABLE: false,
    //   IS_EXPORT: false,
    //  IS_ANY_COMB: false,
    //   SUPP_ID: null,

    // };

    //       this.isArticleFieldsDisabled = false;
    //       this.articleSizeData = []; // Clear the article size data after adding
    //       this.combination_value = []; // Clear the combination value array
    //       this.totalQuantity = 0;
    //       this.PackingData.IS_PURCHASABLE=false;
    //       this.PackingData.IS_EXPORT=false;
    //       this.PackingData.IS_ANY_COMB=false;
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
  ],
  providers: [],
  declarations: [PackingAddComponent],
  exports: [PackingAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingAddModule {}
