import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { Observable, tap } from 'rxjs';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-view-promotion-wizard',
  templateUrl: './view-promotion-wizard.component.html',
  styleUrls: ['./view-promotion-wizard.component.scss']
})
export class ViewPromotionWizardComponent {

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @Input() selectedData: any = {};
  @Output() popupClosed = new EventEmitter<void>();


  worksheetData: any;
  AllowCommitWithSave: any;
  userId: any;
  store: any;
  itemsList: any;
  selectedStoreId: any;
  itemStoresList: any = [];
  itemIds: any = [];
  filteredItems: any;
  selectedRowKeys: any = [];
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  minDate: Date = new Date(); // Today's date
  fromDate: any = new Date(); // Default value for 'from' date
  toDate: any = new Date();
  toTime: any = new Date();
  fromTime: any = new Date();
  department: any;
  catagory: any;
  brand: any;
  storeIds: any;
  isPopupVisible: boolean = false;
  isVisible: boolean = false;
  daysOfWeek = [
    { text: 'Monday', value: 0 },
    { text: 'Tuesday', value: 1 },
    { text: 'Wednesday', value: 2 },
    { text: 'Thursday', value: 3 },
    { text: 'Friday', value: 4 },
    { text: 'Saturday', value: 5 },
    { text: 'Sunday', value: 6 },
  ];
  selectedDays: number[] = [];
  roundingOptions = [
    { text: 'Do not round the result', value: 'none' },
    { text: 'Round to the nearest value', value: 'nearest' },
    { text: 'Round down', value: 'down' },
    { text: 'Round up', value: 'up' },
  ];
  operationOptions = [
    { label: 'Add (+)', value: '+' },
    { label: 'Subtract (-)', value: '-' },
    { label: 'Multiply (*)', value: '*' },
    { label: 'Divide (/)', value: '/' },
    { label: '%+', value: '%+' },
    { label: '%-', value: '%-' },
  ];
  operationInputValue: string = '';
  operationResult: any[] = [];

  priceLevels = [
    { value: 1, text: 'Price Level 1' },
    { value: 2, text: 'Price Level 2' },
    { value: 3, text: 'Price Level 3' },
  ];
  selectedPriceLevel: any;
  operationValue: string = '';
  selectedSchema: any;
  schemaLevelPromotion: any;
  roundingValue: any;
  onSaleStatus: boolean = false;
  selectedOperation: string = '';
  promotionName: any;
  firstDropdownValue: any;
  selectedMode: 'price' | 'schema' = 'price';
  readOnly: boolean = false
  approveValue: boolean = true
  price_level: any
  isSaving: boolean = false
  firstDropdownOptions = [
    { label: 'Cost', value: 'cost' },
    { label: 'Price', value: 'salePrice' },
    { label: 'Set Promotion Price To', value: 'defaultPrice' },
  ];
  promotionSchema: any;
  tagTemplate = (data: any) => {
    return `
        <div style="margin-right: 2px; display: inline-block; white-space: nowrap;">
          ${data.text}
        </div>
      `;
  };
  documentNo: string = '12345';
  salePrice: any; // Store the final result after operation and rounding
  selectedRowIndex: any;
  selectedItem: any;
  selectedPrice: number = 0;
  selectedCost: any[] = [];
  selectedSalePrice: any[] = [];
  valueToUse: number[] = [];
  selectedRow: any = [];
  areDatesSelected = false;
  worksheetPromotionSchema: any = [];
  selectedId: any;
  selectedPromotionSchemaId: any;
  updatedItems: { [key: number]: any } = {};
  selectedSchemaId: any; // To store the selected ID
  selectedSchemaName: any;
  disableRightColumn = false;
  combinedData: any[] = [];
  promotionLevel: any;
  showDropdown: any;
  selectedPromotionLevel: any;
  selectedOption: string = 'onSaleStatus';
  defaultTextValue: any;
  selectedPromotionName: any;
  rowIds: any;
  selectedIds: any;
  heading: string = 'Items on Promotion';
  filteredItemStoresList: any;
  originalGridHeight = '540px';
  popupForItemsToGet: any;
  selectedItems: any;
  selectedRowNew: any;
  selectedRowForNewList: any;
  combinedItem: any;
  selectedSchemaType: any;
  isGet: any;
  isBuy: any;
  showError: any;
  TimeFromArray: string[] = [];
  TimeToArray: string[] = [];
  isTimeRangeEnabled: boolean = false;
  timeRange: any;
  isHappyHoursEnabled: any;
  happyHoursPopup: boolean = false;
  IdInList: any;
  worksheetpromotionSchema: any;
  timeFrom: any;
  timeTo: any;
  filteredItemsWithIsGetTrue: any;
  remainingItemStoresList: any;
  filteredItemStoresListRemaining: any;
  isLoading: boolean = false;
  isGridVisible: boolean = false;
  showGrid: boolean = false;
  selectedRowsData: any;
  selectedRowKeysNew: any;
  selectedRowsOfPopup: any;
  isRowsSelected: boolean = false;
  narration: any;
  wsNo: any;
  wsDate: any;
  selected_Company_id: any;
  selectedTabIndex: any = 0
  wsId: any;
  selected_Data_id: any;
  is_promotion_level: boolean = false
  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }
  ngOnInit() {
    this.sesstion_Details()
    // this.listItemsByMultipleStoreIds()
    this.schemaOptions()

  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.is_promotion_level = sessionData.GeneralSettings.ENABLE_PROMOTION_LEVEL

    this.loadStores()

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;

      console.log('Changes in EditPromotionComponent:', data);

      this.selected_Data_id = data.ID;

      const schemaList = data?.worksheet_promotion_schema || [];

      // ✅ 1. GRID SELECTION KEYS
      this.selectedRowKeys = schemaList.map((item: any) => item.ITEM_ID);

      // ✅ 2. ONLY SELECTED ITEMS IN GRID (IMPORTANT FIX)
      this.itemStoresList = schemaList.map((item: any) => ({
        ID: item.ITEM_ID,
        BARCODE: item.BARCODE,
        ITEM_DESCRIPTION: item.ITEM_DESCRIPTION,
        CAT_NAME: item.CAT_NAME,
        DEPT_NAME: item.DEPT_NAME,
        COST: item.COST,
        SALE_PRICE: item.SALE_PRICE,

        PROMOTION_PRICE: item.PROMOTION_PRICE || 0,
        PROMOTION_NAME: item.PROMOTION_NAME || '',
        PROMOTION_SCHEMA_ID: item.PROMOTION_SCHEMA_ID || null
      }));

      // ✅ 3. TOOLBAR DATA
      const first = schemaList[0];

      if (first) {
        this.narration = first.NARRATION || '';

        this.fromDate = first.DATE_FROM ? new Date(first.DATE_FROM) : null;
        this.toDate = first.DATE_TO ? new Date(first.DATE_TO) : null;

        this.timeFrom = first.TIME_FROM
          ? this.formatTime(first.TIME_FROM)
          : null;

        this.timeTo = first.TIME_TO
          ? this.formatTime(first.TIME_TO)
          : null;

        this.isHappyHoursEnabled = first.IS_HAPPY_HOUR || false;

        this.selectedDays = first.PROMOTION_WEEKDAYS
          ? first.PROMOTION_WEEKDAYS.split(',').map(Number)
          : [];

        this.price_level = first.PROMOTION_LEVEL;
      }

      // ✅ 4. STORE SELECTION
      this.selectedStoreId = (data?.worksheet_item_store || [])
        .map((s: any) => s.STORE_ID);

      // ✅ 5. HEADER DATA
      this.wsNo = data.WS_NO;
      this.wsDate = data.WS_DATE
        ? new Date(data.WS_DATE).toISOString().split('T')[0]
        : '';
    }

    console.log('Selected Data in EditPromotionComponent:', this.selectedData);
  }
  formatTime(date: any): string {
    if (!date) return '';

    // convert if string
    if (typeof date === 'string') {
      date = new Date(date);
    }

    // still invalid check
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }
  convertToTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }
  // listItemsByMultipleStoreIds(): void {
  //   this.isLoading = true;

  //   this.dataservice.getItemListByStoreId().subscribe(
  //     (response: any) => {

  //       this.itemStoresList = response.PriceWizardData || [];

  //       console.log('Fetched Item Stores List:', this.itemStoresList);

  //       //    MATCH & SELECT
  //       if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {

  //         // ensure type match (number)
  //         this.selectedRowKeys = this.selectedRowKeys.map((id: any) => Number(id));

  //         // filter only matching IDs (optional but clean)
  //         const validIds = this.itemStoresList
  //           .map((item: any) => Number(item.ID));

  //         this.selectedRowKeys = this.selectedRowKeys.filter((id: any) =>
  //           validIds.includes(id)
  //         );
  //       }

  //       this.isLoading = false;

  //       console.log('Grid Data:', this.itemStoresList);
  //       console.log('Selected Keys:', this.selectedRowKeys);
  //     },
  //     (error) => {
  //       this.isLoading = false;
  //       console.error('Error fetching item list:', error);
  //     }
  //   );
  // }
  schemaOptions() {
    const payload = {
      NAME: "PROMOTIONSCHEMA_TYPE"
    }
    this.dataservice
      .getDropdownData(payload)
      .subscribe((data) => {
        this.promotionSchema = data;
        // console.log(data, 'schemadropdown');
      });
  }
  loadStores() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getStoresData(payload).subscribe((response) => {
      // Filter out the central store
      this.store = response.filter(
        (store: any) => store.STORE_NAME !== 'CENTRAL STORE',
      );
      console.log(this.store, 'Filtered Stores');
    });
  }
  onSelectionChanged(e: any) {
    this.selectedRowKeys = e.selectedRowKeys;
    // console.log(this.selectedRowKeys, 'SELECTED');
    this.selectedRow = e.selectedRowsData; // Gets the first selected row
    // console.log(this.selectedRow, 'SELECTEDROW');
    this.selectedId = [];
    this.selectedCost = [];
    this.selectedSalePrice = [];
    this.selectedRow.forEach((row: any) => {
      this.selectedId.push(row.ID);
      this.selectedCost.push(row.COST);
      this.selectedSalePrice.push(row.SALE_PRICE);
    });
    this.selectedRowKeys = e.selectedRowKeys;

    this.itemStoresList = this.itemStoresList.map((item: any) => ({
      ...item,
      Selected: this.selectedRowKeys.includes(item.ITEM_ID)
    }));
  }
  get storeHint(): string {
    return this.store
      ?.filter((x: any) => this.selectedStoreId?.includes(x.ID))
      .map((x: any) => x.STORE_NAME)
      .join(', ') || '';
  }
  get daysHint(): string {
    return this.daysOfWeek
      ?.filter(day => this.selectedDays?.includes(day.value))
      .map(day => day.text)
      .join(', ') || '';
  }
}

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxTabsModule,
    DxSwitchModule,
    DxTabPanelModule,

  ],
  providers: [],
  declarations: [ViewPromotionWizardComponent],
  exports: [ViewPromotionWizardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class ViewPromotionWizardModule { }
