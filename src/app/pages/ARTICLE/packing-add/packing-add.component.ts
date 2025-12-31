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

  //===================dummy datasource of =========================
  constructor(private dataService: DataService) {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.get_packages_list_api(payload).subscribe((res: any) => {
      console.log('response from get packing list api:', res);

      this.packing_list = res.Data;
    });
    this.sesstion_Details();
  }

  ngOnInit() {
    this.getDropdownLists();
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
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
  AddData() {
    console.log(this.packing_list, '======================');

    const validationResult = this.formValidationGroup?.instance?.validate();

    if (!validationResult?.isValid) {
      // Optional: Notify or prevent submission
      return;
    }
    const Alias_no = Number(this.PackingData.ALIAS_NO);
    const Part_no = Number(this.PackingData.PART_NO);

    console.log(this.PackingData);

    this.Alias_no = this.PackingData.ALIAS_NO.toString();
    this.Part_no = this.PackingData.PART_NO.toString();
    this.art_Serial_no = this.PackingData.ART_SERIAL.toString();
    const payload = {
      ...this.PackingData,
      ALIAS_NO: this.Alias_no,
      PART_NO: this.Part_no,
      ART_SERIAL: this.art_Serial_no,
      COMBINATION: this.combinationString,
      PAIR_QTY: this.totalQuantity,
      COMPANY_ID: this.selected_Company_id,
      PackingEntries: this.articleSizeData
        // .filter(item => Number(item.QUANTITY) > 0) // only include rows with quantity
        .map((item) => ({
          ARTICLE_ID: Number(item.ArticleID), // or whichever field holds article id
          SIZE: String(item.Size),
          QUANTITY: Number(item.QUANTITY),
        })),
    };
    console.log(this.articleSizeData, '========article size data=========');
    console.log(payload, '-----payload for packing list-----');

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
    console.log(
      artno,
      color,
      categoryID,
      unitID,
      packname,
      packqty,
      '====================='
    );

    //  🔍 Check for duplicate entry based on employee ID
    const duplicate = this.packing_list.find(
      (item: any) =>
        item.PackingName === packname &&
        item.ArtNo === artno &&
        item.Color === color &&
        item.Category === categoryID &&
        item.Unit === unitID
    );

    if (duplicate) {
      notify(
        {
          message: 'This Packing Combination already .',
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

    this.dataService
      .Add_packages_listapi(payload)
      .subscribe((response: any) => {
        console.log(response, 'PACKING DATA ADDED SUCCESSFULLY');
        notify(
          {
            message: 'Data succesfully added',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );

        this.popupClosed.emit();

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

        // this.isArticleFieldsDisabled = false;
        this.articleSizeData = []; // Clear the article size data after adding
        this.combination_value = []; // Clear the combination value array
        this.totalQuantity = 0; // Reset total quantity
        this.PackingData.IS_PURCHASABLE = false;
        this.PackingData.IS_EXPORT = false;
        this.PackingData.IS_ANY_COMB = false;
        this.PackingData.SUPP_ID = null; // Reset SUPP_ID if needed

        // this.PackingData= {
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

        // };
      });

    this.popupVisible = false;
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
