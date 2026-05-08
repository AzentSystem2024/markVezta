import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
  Input,
  NgModule,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
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
import { Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-item-store-property',
  templateUrl: './edit-item-store-property.component.html',
  styleUrls: ['./edit-item-store-property.component.scss'],
})
export class EditItemStorePropertyComponent implements OnInit, OnChanges {
  @Input() selectedData: any = {};
  @Input() status: any = {};


  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('dataGrid') dataGrid!: any;

  // Grid data
  items: any;
  itemsList: any;
  isListVisible: boolean = false;
  isPopupVisible: boolean = false;
  store: any[] = [];
  selectedStoreId: any = null;
  department: any;
  catagory: any;
  brand: any;
  filteredStores: any;
  showHeaderFilter = true;
  selectedProperties: any[] = [];
  gridWidth: string = '100%';
  showNewGrid: boolean = false;

  // Column visibility flags
  showIsNotSaleItem: boolean = false;
  showIsNotSaleReturn: boolean = false;
  showIsNotDiscountable: boolean = false;
  showIsPriceRequired: boolean = false;
  showIsInactive: boolean = false;

  columns: Array<{
    dataField: string;
    caption: string;
    width: number;
    visible: boolean;
  }> = [];
  editedItems: any[] = [];
  userId: any;
  selectedRowId: any;
  selectedItemId: number | null = null;
  storeId: any;
  selectedRowIds: number[] = [];
  oldValues: { [key: string]: { [field: string]: any } } = {};
  NotDiscounteoldValue: any;
  NotSaleoldValue: any;
  NotSaleReturnoldValue: any;
  NotPriceoldValue: any;
  inactiveoldValue: any;
  worksheetData: any;
  selectedRowKeys: number[] = [];
  matchingWorksheetItem: any;
  matchingStore: any;
  matchingItem: any;
  itemIndex: any;
  itemListForWorksheet: any;
  filteredRowCount: any;
  selectedRowCount: any;
  itemStoresList: any[] = [];
  savedWorksheet: any;
  selectedItems: any[] = [];
  isSaved: boolean = false;
  AllowCommitWithSave: any;
  isVerified: boolean = false;
  selected_Company_id: any;
  private previousDataKey: string = '';
  selectedGridData: any;
  updatedRows: any[] = [];
  selectedId: any;
  selectedworksheetdata: any;
  approveValue: boolean = false;
  ApproveStatus: boolean = false;
  readOnly: boolean = false;
  selectedNarration: any;
  statusValue: any = 0;
  allowVerify: boolean = false;
  VerifiedData: boolean = false;
  isView: boolean = false;
  selectedStoreIds: any[] = [];
  storeProperties = [
    { name: 'Inactive', value: "IS_INACTIVE" },
    { name: 'Not Discountable', value: "IS_NOT_DISCOUNTABLE" },
    { name: 'Not Sale Item', value: "IS_NOT_SALE_ITEM" },
    { name: 'Not Sale Return', value: "IS_NOT_SALE_RETURN" },
    { name: 'Price Required', value: "IS_PRICE_REQUIRED" },
  ];
  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.sesstion_Details();
  }

  ngOnInit() {
    this.loadStore();
    this.listStoreItemProperty()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData']?.currentValue) {
      const newData = changes['selectedData'].currentValue;
      console.log(this.status, '=================status from log===============');
      if (this.status == 'viewScreen') {
        this.isView = true
      } else {
        this.isView = false
      }

      this.selectedData = newData;

      this.selectedId = newData.ID;
      this.selectedNarration = newData.NARRATION;
      const staus = newData.Status
      if (staus === '5') {
        this.isView = true
      } else {
        this.isView = false
      }


      this.selectedStoreIds = (newData.worksheet_item_store || []).map(
        (x: any) => x.STORE_ID
      );

      this.statusValue = newData.Status;
      this.allowVerify = this.statusValue === '1';
      this.VerifiedData = this.statusValue === '2';
      this.readOnly = this.statusValue === '5';

      // ✅ reload and merge
      this.listStoreItemProperty();
    }
  }
  get selectedStoreHint(): string {
    if (!this.selectedStoreIds?.length) return 'No store selected';

    return this.store
      .filter((s: any) => this.selectedStoreIds.includes(s.ID))
      .map((s: any) => s.STORE_NAME)
      .join(', ');
  }



  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
    this.userId = sessionData.USER_ID;
  }

  loadStore() {
    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataservice.getStoresData(payload).subscribe((response: any) => {
      this.store = response;
    });
  }
  onDropdownValueChanged(e: any) {
    const ids = Array.isArray(e?.value) ? e.value : [];
    this.selectedStoreIds = ids;

    if (ids.length > 0) {
      const firstStore = this.store.find((s: any) => s.ID === ids[0]);

    } else {
    }
  }



  extractStoreProperties() {







  }

  onPropertiesChange(event: any) {
    this.selectedProperties = event.value;
    this.updateColumnVisibility();
  }

  updateColumnVisibility() {
    this.showIsNotSaleItem = this.selectedProperties?.includes('Not Sale Item');
    this.showIsNotSaleReturn =
      this.selectedProperties?.includes('Not Sale Return');
    this.showIsNotDiscountable =
      this.selectedProperties?.includes('Not Discountable');
    this.showIsPriceRequired =
      this.selectedProperties?.includes('Price Required');
    this.showIsInactive = this.selectedProperties?.includes('Inactive');

    this.cdr.detectChanges(); // 🔥 important
  }
  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;

    const original = e.editorOptions.onValueChanged;
    e.editorOptions.onValueChanged = (args: any) => {
      if (original) original(args);
      e.setValue(args.value); // important for batch mode

      const row = e.row.data;
      const i = this.itemStoresList.findIndex((x: any) => x.ITEM_ID === row.ITEM_ID);
      if (i > -1) this.itemStoresList[i][e.dataField] = args.value;
    };
  }

  onSelectionChanged(e: any) {
    const currentKeys = e.selectedRowKeys;

    // Add new selections
    currentKeys.forEach((key: number) => {
      if (!this.selectedRowKeys.includes(key)) {
        this.selectedRowKeys.push(key);
      }
    });

    // Remove unselected (only from current page)
    const currentPageItems = e.component.getVisibleRows().map((r: any) => r.data.ITEM_ID);

    this.selectedRowKeys = this.selectedRowKeys.filter((key: number) => {
      if (currentPageItems.includes(key)) {
        return currentKeys.includes(key);
      }
      return true; // keep other page selections
    });

    console.log('Global selected keys:', this.selectedRowKeys);
  }

  async onSaveButtonClick() {
    await this.dataGrid.instance.saveEditData();

    const allRows = this.itemStoresList;
    console.log(allRows)

    const selectedRows = allRows.filter((x: any) =>
      this.selectedRowKeys.includes(x.ITEM_ID) || x.Selected
    );
    console.log('Selected rows for save:', selectedRows);

    if (!selectedRows.length) {
      notify('Please select at least one row', 'error', 2000);
      return;
    }

    const worksheet_item_property = selectedRows.map((x: any) => ({
      ID: Number(x.ID ?? 0),
      ITEM_ID: Number(x.ITEM_ID ?? 0),
      IS_PRICE_REQUIRED: !!x.IS_PRICE_REQUIRED,
      IS_PRICE_REQUIRED_NEW: !!x.IS_PRICE_REQUIRED_NEW,
      IS_NOT_DISCOUNTABLE: !!x.IS_NOT_DISCOUNTABLE,
      IS_NOT_DISCOUNTABLE_NEW: !!x.IS_NOT_DISCOUNTABLE_NEW,
      IS_NOT_SALE_ITEM: !!x.IS_NOT_SALE_ITEM,
      IS_NOT_SALE_ITEM_NEW: !!x.IS_NOT_SALE_ITEM_NEW,
      IS_NOT_SALE_RETURN: !!x.IS_NOT_SALE_RETURN,
      IS_NOT_SALE_RETURN_NEW: !!x.IS_NOT_SALE_RETURN_NEW || false,
      IS_INACTIVE: !!x.IS_INACTIVE,
      IS_INACTIVE_NEW: !!x.IS_INACTIVE_NEW,
      BARCODE: x.BARCODE ?? '',
      DESCRIPTION: x.DESCRIPTION ?? '',
      DEPT_NAME: x.DEPT_NAME ?? '',
      CAT_NAME: x.CAT_NAME ?? '',
      BRAND_NAME: x.BRAND_NAME ?? '',
      Selected: true,
      STORE_ID: Number(x.STORE_ID ?? 0),
      STORE_NAME: x.STORE_NAME ?? '',
    }));

    const payload = {
      ID: Number(this.selectedId ?? 0),
      WS_NO: '',
      WS_DATE: new Date().toISOString(),
      STORE_ID: String(this.selectedStoreId ?? 0),
      USER_ID: Number(this.userId ?? 0),
      COMPANY_ID: Number(this.selected_Company_id ?? 0),
      NARRATION: this.selectedNarration ?? '',
      Status: String(this.statusValue ?? '0'),
      worksheet_item_property,
      worksheet_item_store: (this.selectedStoreIds || []).map((storeId: number) => ({
        ID: 0,
        WS_ID: 0,
        STORE_ID: Number(storeId),
      })),
    };

    if (this.status == 'ApprovalScreen') {
      confirm('It will approve and commit. Are you sure you want to commit?', 'Confirm Commit')
        .then((result: any) => {
          if (!result) return;
          this.dataservice.approveworksheetItemProperty(payload).subscribe(
            () => {
              this.popupClosed.emit();
              notify('Worksheet item property approved and committed successfully', 'success', 2000);
            },
            (error) => {
              notify('Failed to approve worksheet item property.', 'error', 2000);
              console.error(error);
            },
          );
        });
    }
    else if (this.status == 'VerificationScreen') {
      this.dataservice.verifyItemStoreProperties(payload).subscribe(
        () => {
          this.isSaved = true;
          notify('Data verified successfully', 'success', 2000);
          this.popupClosed.emit();
        },
        (error: any) => {
          console.error('Save error:', error);
          notify('Error saving data', 'error', 2000);
        },
      );
    }

    else {
      this.dataservice.updateworksheetItemProperty(payload).subscribe(
        () => {
          this.isSaved = true;
          notify('Data saved successfully', 'success', 2000);
          this.popupClosed.emit();
        },
        (error: any) => {
          console.error('Save error:', error);
          notify('Error saving data', 'error', 2000);
        },
      );
    }
  }




  onApprove() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      USER_ID: sessionStorage.getItem('UserId'),
      STORE_ID: this.selectedStoreId,
      worksheet_item_property: this.itemStoresList.map((item: any) => ({
        ITEM_ID: item.ITEM_ID,
        IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED,
        IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED_NEW,
        IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE,
        IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE_NEW,
        IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM,
        IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM_NEW,
        IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN,
        IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN_NEW,
        IS_INACTIVE: item.IS_INACTIVE,
        IS_INACTIVE_NEW: item.IS_INACTIVE_NEW,
      })),
    };

    this.dataservice.approveworksheetItemProperty(payload).subscribe(
      (response: any) => {
        if (response) {
          notify('Data approved successfully', 'success', 2000);
          this.popupClosed.emit();
        }
      },
      (error: any) => {
        console.error('Approve error:', error);
        notify('Error approving data', 'error', 2000);
      },
    );
  }

  onCancel() {
    this.popupClosed.emit();
  }

  handleClose() {
    this.popupClosed.emit();
  }

  // listStoreItemProperty() {
  //   this.dataservice.getStoreItemPropertyList().subscribe((response: any) => {

  //     this.itemStoresList = (response.data || []).map((item: any) => ({
  //       ...item,

  //       // ✅ ADD NEW FIELDS (IMPORTANT)
  //       IS_NOT_SALE_ITEM_NEW: item.IS_NOT_SALE_ITEM ?? false,
  //       IS_NOT_SALE_RETURN_NEW: item.IS_NOT_SALE_RETURN ?? false,
  //       IS_NOT_DISCOUNTABLE_NEW: item.IS_NOT_DISCOUNTABLE ?? false,
  //       IS_PRICE_REQUIRED_NEW: item.IS_PRICE_REQUIRED ?? false,
  //       IS_INACTIVE_NEW: item.IS_INACTIVE ?? false,

  //       // ✅ Ensure Selected exists
  //       Selected: item.Selected ?? false
  //     }));

  //     // ✅ Sync selection
  //     this.selectedRowKeys = this.itemStoresList
  //       .filter((x: any) => x.Selected)
  //       .map((x: any) => x.ITEM_ID);
  //   });
  // }

  listStoreItemProperty() {
    this.dataservice.getStoreItemPropertyList().subscribe((response: any) => {

      const apiData = response.data || [];

      // 👉 selected worksheet data
      const selectedItems = this.selectedData?.worksheet_item_property || [];

      this.itemStoresList = apiData.map((item: any) => {

        // find matching selected item
        const matched = selectedItems.find(
          (x: any) => x.ITEM_ID === item.ITEM_ID
        );

        return {
          ...item,

          // ✅ CURRENT values from API
          IS_NOT_SALE_ITEM: item.IS_NOT_SALE_ITEM ?? false,
          IS_NOT_SALE_RETURN: item.IS_NOT_SALE_RETURN ?? false,
          IS_NOT_DISCOUNTABLE: item.IS_NOT_DISCOUNTABLE ?? false,
          IS_PRICE_REQUIRED: item.IS_PRICE_REQUIRED ?? false,
          IS_INACTIVE: item.IS_INACTIVE ?? false,

          // ✅ NEW values from selectedData (if exists)
          IS_NOT_SALE_ITEM_NEW: matched?.IS_NOT_SALE_ITEM_NEW ?? item.IS_NOT_SALE_ITEM ?? false,
          IS_NOT_SALE_RETURN_NEW: matched?.IS_NOT_SALE_RETURN_NEW ?? item.IS_NOT_SALE_RETURN ?? false,
          IS_NOT_DISCOUNTABLE_NEW: matched?.IS_NOT_DISCOUNTABLE_NEW ?? item.IS_NOT_DISCOUNTABLE ?? false,
          IS_PRICE_REQUIRED_NEW: matched?.IS_PRICE_REQUIRED_NEW ?? item.IS_PRICE_REQUIRED ?? false,
          IS_INACTIVE_NEW: matched?.IS_INACTIVE_NEW ?? item.IS_INACTIVE ?? false,

          // ✅ selection
          Selected: matched?.Selected ?? false
        };
      });

      // ✅ bind selection to grid
      this.selectedRowKeys = this.itemStoresList
        .filter((x: any) => x.Selected)
        .map((x: any) => x.ITEM_ID);

      // ✅ refresh grid
      setTimeout(() => {
        this.dataGrid?.instance?.option('dataSource', this.itemStoresList);
        this.dataGrid?.instance?.option('selectedRowKeys', this.selectedRowKeys);
        this.cdr.detectChanges();
      }, 0);
    });
  }

  getButtonText(): string {
    if (this.status == 'ApprovalScreen') {
      return 'Approve';
    } else if (this.status == 'VerificationScreen') {
      return 'Verify';
    }
    else {
      return 'Update';
    }

    return '';
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
    DxToolbarModule,
    DxiItemModule,
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
  declarations: [EditItemStorePropertyComponent],
  exports: [EditItemStorePropertyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditItemStorePropertyModule { }
