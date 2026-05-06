import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
import { AccountsListComponent } from '../../ACCOUNTS/Chart of Account/accounts-list.component';
import { AddAccountModule } from '../../ACCOUNTS/add-account/add-account.component';
import { EditAccountModule } from '../../ACCOUNTS/edit-account/edit-account.component';
import { DataService } from 'src/app/services';
import {
  ArticleAddComponent,
  ArticleAddModule,
} from '../../ARTICLE/article-add/article-add.component';
import notify from 'devextreme/ui/notify';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
})
export class ArticleListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(ArticleAddComponent) articleAddComponent!: ArticleAddComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  editArticlePopupOpened: boolean = false;

  addArticlePopupOpened: boolean;
  articleList: any;
  selectedArticle: any;
  componentArticles: any;
  articleData: {
    ART_NO: string;
    ORDER_NO: string;
    DESCRIPTION: string;
    COLOR: string;
    SIZE: string;
    PRICE: string;
    PACK_QTY: string;
    PART_NO: string;
    ALIAS_NO: string;
    UNIT_ID: string;
    ARTICLE_TYPE: string;
    CATEGORY_ID: string;
    BRAND_ID: string;
    NEXT_SERIAL: string;
    NEW_ARRIVAL_DAYS: number;
    IS_STOPPED: boolean;
    IMAGE_NAME: string;
    ComponentArticleID: number;
    IS_COMPONENT: boolean;
    SUPPLIER_ID: number;
  };
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addArticle());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify"
              data-icon="formkit:add"
              data-width="20"
              data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `;
    },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  filteredInvoiceList: any;

  selected_Company_id: any;
  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/article');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.sesstion_Details();
    this.getArticles();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getArticles() {
    this.articleList = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          // const payload = {
          //   COMPANY_ID: this.selected_Company_id,
          // }; // Add any necessary payload data here
          this.dataService.getArticleList().subscribe({
            next: (response: any) => {
              if (response?.flag === 1 && Array.isArray(response.Data)) {
                //  Sort articles by ID (latest first)
                const sortedData = response.Data;
                // .sort(
                //   (a: any, b: any) => b.ID - a.ID,
                // );

                // Add serial number (sno)
                const formattedData = sortedData.map(
                  (item: any, index: number) => ({
                    ...item,
                    sno: index + 1,
                  }),
                );

                resolve(formattedData); // Return formatted data
              } else {
                resolve([]); // Handle empty or invalid response
                console.warn(
                  'No article data found or invalid response format.',
                );
              }
            },
            error: (err) => {
              console.error('Error loading article list:', err);
              reject('Failed to load data');
            },
          });
        }),
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    // const toolbarItems = e.toolbarOptions.items;
    // // Avoid adding the button more than once
    // const alreadyAdded = toolbarItems.some(
    //   (item: any) => item.name === 'toggleFilterButton',
    // );
    // if (!alreadyAdded) {
    //   toolbarItems.splice(toolbarItems.length - 1, 0, {
    //     widget: 'dxButton',
    //     name: 'toggleFilterButton', // custom name to avoid duplicates
    //     location: 'after',
    //     options: {
    //       icon: 'search',
    //       hint: 'Search Column',
    //       onClick: () => this.toggleFilters(),
    //     },
    //   });
    // }
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 5 ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
  ];

  private parseDateString(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date string:', dateStr);
      return new Date('Invalid'); // or new Date(0) if you want a fallback
    }

    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  get customStartDateFormatted(): string {
    return this.customStartDate
      ? this.formatAsDDMMYYYY(new Date(this.customStartDate))
      : '';
  }

  get customEndDateFormatted(): string {
    return this.customEndDate
      ? this.formatAsDDMMYYYY(new Date(this.customEndDate))
      : '';
  }

  onEditArticle(event: any) {
    event.cancel = true;

    const articleId = event.data.ID;

    const payload = {
      UNIT_ID: event.data.UNIT_ID,
      Art_no: event.data.ART_NO,
      Color: event.data.COLOR,
      CATEGORY_ID: event.data.CATEGORY_ID,
      PRICE: event.data.PRICE,
      ID: articleId,
    };

    this.dataService.selectArticle(articleId).subscribe((response: any) => {
      this.selectedArticle = response.Data;
      this.editArticlePopupOpened = true;
    });
  }

  onDeleteArticle(event: any) {
    const articleArtNo = event.data.ART_NO;
    const color = event.data.COLOR;
    const categoryId = event.data.CATEGORY_ID;
    const price = event.data.PRICE;

    const payload = {
      ART_NO: articleArtNo,
      COLOR: color,
      CATEGORY_ID: categoryId,
      PRICE: price,
    };

    event.cancel = true;
    // Call your delete API
    this.dataService.deleteArticle(payload).subscribe(
      (response: any) => {
        if (response?.flag === 1) {
          notify(
            {
              message: 'Article Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getArticles();
          // this.dataGrid.instance.refresh();
        } else if (response?.flag === 0) {
          // Article already used in Packing
          notify(
            {
              message: response.Message || 'Article already used in Packing',
              position: { at: 'top center', my: 'top center' },
            },
            'error',
          );
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }

  addArticle() {
    this.addArticlePopupOpened = true;
  }

  handleClose() {
    this.addArticlePopupOpened = false; // closes the popup
    this.editArticlePopupOpened = false;
    this.getArticles();
    if (this.articleAddComponent) {
      this.articleAddComponent.resetForm();
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
    ArticleAddModule,
    ArticleEditModule,
  ],
  providers: [],
  declarations: [ArticleListComponent],
  exports: [ArticleListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleListModule { }
