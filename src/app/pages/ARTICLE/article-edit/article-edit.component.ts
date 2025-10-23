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

@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss'],
})
export class ArticleEditComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() articleData: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
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
  defaultDescription: string = 'PU Footware';
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

  constructor(private dataService: DataService) {}

  ngOnInit() {
    if (this.selectedProductionUnitId) {
      this.getLastOrderNo();
    }
    this.getArticles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['articleData'] && changes['articleData'].currentValue) {
      const incomingData = changes['articleData'].currentValue;

      console.log('Incoming articleData:', incomingData);

      this.getDropdownLists().then(() => {
        this.articleData = {
          ...this.articleData,
          ...incomingData,
        };

        // Set basic fields
        this.lastOrderNo = this.articleData.LAST_ORDER_NO || '';
        this.imagePreview = this.articleData.IMAGE_NAME;
        this.selectedAttachRowKey =
          this.articleData.COMPONENT_ARTICLE_ID || null;
        this.selectedAttachRowKeys = this.selectedAttachRowKey
          ? [this.selectedAttachRowKey]
          : [];
        if (this.articleData.COMPONENT_ARTICLE_ID && this.articleList?.length) {
          const selectedComponent = this.articleList.find(
            (item: any) => item.ID === this.articleData.COMPONENT_ARTICLE_ID
          );
          this.selectedComponentArtNo = selectedComponent?.ART_NO || '';
        }

        if (this.articleData.CATEGORY_ID) {
          this.selectedCategoryId = this.articleData.CATEGORY_ID;
          this.getCategory();
        }

        // Handle Sizes only after articleSizeData is ready
        this.setSelectedSizes();
      });
    }
  }

  setSelectedSizes() {
    console.log('====================================================');
    if (this.articleData.SIZES && Array.isArray(this.articleData.SIZES)) {
      console.log('articleData.SIZES:', this.articleData.SIZES);

      this.savedSizes = this.articleData.SIZES;

      const sizeStrings: string[] = this.savedSizes.map((s: any) =>
        s.SizeValue.toString()
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

  getArticles() {
    const payload = {
      DATE_FROM: new Date(),
      DATE_TO: new Date(),
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
        console.log(this.attachGridData, 'COMPONENTARTICLE');
      }
    });
  }
  clearComponentArticleId() {
    this.articleData.COMPONENT_ARTICLE_ID = '';
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.articleData.IMAGE_NAME = this.imagePreview;
      };
      reader.readAsDataURL(file);
    }
  }

  getCategory() {
    const categoryId = this.articleData?.CATEGORY_ID;
    if (!categoryId) return;

    this.dataService.getCategoryList(categoryId).subscribe((response: any) => {
      if (response?.flag === 1 && Array.isArray(response?.Data)) {
        const apiSizes = response.Data;
        let orderNoCounter = parseInt(
          this.articleData?.LAST_ORDER_NO || this.lastOrderNo || '0'
        );

        this.articleSizeData = apiSizes.map((apiSize) => {
          const sizeValue = apiSize.SIZE?.toString();
          const match = this.savedSizes?.find(
            (saved) => saved.SizeValue?.toString() === sizeValue
          );

          return {
            SizeValue: parseInt(sizeValue), // ✅ Proper field name
            OrderNo: match?.OrderNo || (++orderNoCounter).toString(),
          };
        });

        this.selectedSizeRows = this.savedSizes.map((s) =>
          s.SizeValue?.toString()
        );
        this.sizeGridSelectedKeys = [...this.selectedSizeRows];

        this.articleData.SIZES = this.articleSizeData.filter((item) =>
          this.selectedSizeRows.includes(item.SizeValue)
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

    this.dataService
      .getLastOrderNo(this.selectedProductionUnitId)
      .subscribe((response: any) => {
        console.log(response, 'LASTORDERNO');
        this.lastOrderNo = response?.LastOrderNo ?? '';
      });
  }

  onUnitChanged(e: any) {
    this.articleData.UNIT_ID = e.value;
    this.selectedProductionUnitId = e.value;
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

      this.dataService
        .getDropdownDataForAccounts('PRODUCTION_UNITS')
        .subscribe((res) => {
          this.produCtionUnits = res;
          checkIfDone();
        });
      this.dataService
        .getDropdownDataForAccounts('MATERIAL_UNITS')
        .subscribe((res) => {
          this.materialUnits = res;
          checkIfDone();
        });
      this.dataService
        .getDropdownDataForAccounts('ARTICLECATEGORY')
        .subscribe((res) => {
          this.categoryList = res;
          checkIfDone();
        });
      this.dataService
        .getDropdownDataForAccounts('ARTICLETYPE')
        .subscribe((res) => {
          this.typeList = res;
          checkIfDone();
        });
      this.dataService
        .getDropdownDataForAccounts('ARTICLEBRAND')
        .subscribe((res) => {
          this.brandList = res;
          checkIfDone();
        });
      this.dataService
        .getDropdownDataForAccounts('ARTICLECOLOR')
        .subscribe((res) => {
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
    this.selectedAttachRow = event.selectedRowsData[0]; // For single selection
    console.log('Selected row:', this.selectedAttachRow);
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
      this.selectedTabIndex = 0;
      console.log(
        'Assigned ComponentArticleID:',
        this.articleData.COMPONENT_ARTICLE_ID
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

  updateArticle() {
    if (!this.articleData) {
      console.warn('No article data to update');
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

    // Step 2: Prepare the full payload
    const payload = {
      // ID: this.articleData.ID || 0,
      ART_NO: this.articleData.ART_NO || '',
      LAST_ORDER_NO: this.lastOrderNo || '',
      DESCRIPTION: this.articleData.DESCRIPTION || '',
      COLOR: this.articleData.COLOR || '',
      SIZES: selectedSizes,
      PRICE: this.articleData.PRICE || 0,
      PACK_QTY: this.articleData.PACK_QTY || 0,
      PART_NO: this.articleData.PART_NO || '',
      ALIAS_NO: this.articleData.ALIAS_NO || '',
      UNIT_ID: this.articleData.UNIT_ID || 0,
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
      COMPONENT_ARTICLE_ID: this.articleData.COMPONENT_ARTICLE_ID || 0,
      ComponentArticleNo: this.articleData.ComponentArticleNo || '',
      ComponentArticleName: this.articleData.ComponentArticleName || '',
      CreatedDate: this.articleData.CreatedDate || new Date().toISOString(),
    };

    console.log('Sending update payload:', payload);

    // Step 3: Send update request
    this.dataService.updateArticle(payload).subscribe(
      (response: any) => {
        if (response?.flag === 1) {
          notify(
            {
              message: 'Article Updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.popupVisible = false;
          this.popupClosed.emit();
        } else {
          console.warn('Update failed:', response?.Message);
        }
      },
      (error) => {
        console.error('Update error:', error);
      }
    );
  }

  onSupplierChanged(e: any) {
    const selected = this.materialUnits.find((s: any) => s.ID === e.value);
    this.articleData.SupplierName = selected ? selected.DESCRIPTION : '';
    console.log(
      'Selected Supplier ID:',
      e.value,
      'Name:',
      this.articleData.SupplierName
    );
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
  ],
  providers: [],
  declarations: [ArticleEditComponent],
  exports: [ArticleEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleEditModule {}
