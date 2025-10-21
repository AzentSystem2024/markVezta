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

  articleData: any = {
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
    CREATED_DATE: new Date(),
  };

  articleList: any;
  componentArticles: any;
  selectedComponentArticle: any = null;
  selectedComponentArtNo: string = '';
  selectedSizeRowData: any;
  selectedComponentDescription: any;
  selectedTabIndex = 0;

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

  onIsComponentChanged(e: any) {
    if (e.value) {
      console.log(
        'Checked: this article will be used as a component for another article'
      );
    } else {
      console.log('Unchecked');
    }
  }

  getArticles() {
    const payload = {
      DATE_FROM: new Date('1999-12-31T18:00:00.000Z'), // set specific from date
      DATE_TO: new Date(), // keep to date as today
    };

    this.dataService.getArticleList(payload).subscribe((response: any) => {
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
  onProductionUnitChanged() {
    this.selectedSizeRowData = []; // clear selected sizes
    this.articleSizeData = this.articleSizeData.map((item: any) => ({
      ...item,
      ORDER_NO: null,
    }));
    this.getLastOrderNo();
  }

  getLastOrderNo() {
    if (!this.selectedProductionUnitId) return;
    console.log(this.selectedProductionUnitId, 'SELECTEDPRODUCTIONUNITID');
    this.dataService
      .getLastOrderNo(this.selectedProductionUnitId)
      .subscribe((response: any) => {
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
    if (!this.imagePreview) {
      notify({
        message: 'Please upload an image.',
        type: 'warning',
        displayTime: 3000,
        position: { at: 'top right', my: 'top right' },
      });
      return;
    }
    // Validate size selection
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
        const payload = {
          ...this.articleData,
          CREATED_DATE: formatDate(this.articleData.CREATED_DATE),
          CATEGORY_ID: this.selectedCategoryId,
          ARTICLE_TYPE: this.selectedTypeId,
          BRAND_ID: this.selectedBrandId,
          UNIT_ID: this.selectedProductionUnitId,
          SUPPLIER_ID: this.selectedMaterialUnitId,
          IMAGE_NAME: this.imagePreview ? this.imagePreview.toString() : null,
          Sizes: this.selectedSizeRowData.map((row) => ({
            SizeValue: row.SIZE,
            OrderNo: String(row.ORDER_NO),
          })),
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
  ],
  providers: [],
  declarations: [ArticleAddComponent],
  exports: [ArticleAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleAddModule {}
