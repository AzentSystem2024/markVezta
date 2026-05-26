import {
  ChangeDetectorRef,
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
import { FormTextboxModule } from '../components';
import { AddCreditNoteModule } from '../pages/CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../pages/CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { AddDebitModule } from '../pages/DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from '../pages/DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from '../pages/DEBIT/view-debit/view-debit.component';
import { AddInvoiceModule } from '../pages/INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from '../pages/INVOICE/edit-invoice/edit-invoice.component';
import {
  InvoiceTrOutAddComponent,
  InvoiceTrOutAddModule,
} from '../pages/INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { InvoiceTrOutComponent } from '../pages/OPERATIONS/invoice-tr-out/invoice-tr-out.component';
import { ViewInvoiceModule } from '../pages/INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../services';
import { Router } from '@angular/router';
import {
  ProductionJvAddComponent,
  ProductionJvAddModule,
} from '../production-jv-add/production-jv-add.component';
import { ProductionJvViewModule } from '../production-jv-view/production-jv-view.component';
import { BoxproductionJvAddModule } from '../boxproduction-jv-add/boxproduction-jv-add.component';
import { ArticleproductionJvViewModule } from '../articleproduction-jv-view/articleproduction-jv-view.component';
import { BoxproductionJvViewModule } from '../boxproduction-jv-view/boxproduction-jv-view.component';

@Component({
  selector: 'app-articleproduction-jv-list',
  templateUrl: './articleproduction-jv-list.component.html',
  styleUrls: ['./articleproduction-jv-list.component.scss'],
})
export class ArticleproductionJvListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(ProductionJvAddComponent)
  productionForm!: ProductionJvAddComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  isEditPopupVisible: boolean = false;
  auto: string = 'auto';
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addProduction());
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
  productionList: any;
  isAddInvoice: boolean = false;
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup = false;
  filteredproductionList: any;
  // productionList: any;
  isEditInvoice: boolean = false;
  selectedInvoice: any;
  isViewInvoice: boolean;

  sessionData: any;
  selected_Company_id: any;
  selected_fin_id: any;
  financialYeaDate: any;
  formatted_from_date: any;
  selected_vat_id: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isReadOnlyInvoice: boolean;
  isAddPopupVisible: boolean = false;
  isBoxPopupVisible: boolean = false;
  selectedProduction: any;
  productionTypes = [
    { id: 'ARTICLE', name: 'Article Production' },
    { id: 'BOX', name: 'Box Production' },
  ];

  selectedProductionType = 'ARTICLE';
  isViewProduction: boolean;
  isViewBoxProduction: boolean;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/invoice');
    this.sesstion_Details();
    this.getProductionList();
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
  }

  onEditingStart(event: any) {
    event.cancel = true;
    const invoiceId = event.data.TRANS_ID;
    const status = event.data.STATUS;
    this.dataService.selectProduction(invoiceId).subscribe((response: any) => {
      this.selectedInvoice = response;
      this.isEditPopupVisible = true;
      this.isReadOnlyInvoice = status === 5;
    });
  }

  getProductionList() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };

    // ✅ Choose API based on production type
    const api$ =
      this.selectedProductionType === 'ARTICLE'
        ? this.dataService.getArticleProductionJVList(payload)
        : this.dataService.getBoxProductionJVList(payload);

    api$.subscribe((response: any) => {
      this.productionList = response.Data.map((item: any) => {
        // ---- Date normalization ----
        let saleDate = item.PROD_DATE;
        let dateValue: Date;

        if (/^\d{2}-\d{2}-\d{4}$/.test(saleDate)) {
          const [day, month, year] = saleDate.split('-').map(Number);
          dateValue = new Date(year, month - 1, day);
        } else {
          dateValue = new Date(saleDate);
        }

        // ---- Extract numeric part of DOC_NO ----
        const match = item.DOC_NO?.match(/\d+$/);
        const docNoNumber = match ? Number(match[0]) : 0;

        return {
          ...item,
          PROD_DATE: dateValue,
          _docNoNumber: docNoNumber,
        };
      })
        // ✅ Latest first
        .sort((a: any, b: any) => b._docNoNumber - a._docNoNumber);

      this.applyDateFilter();
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.getProductionList();
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
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton',
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'search',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.customStartDate = null;
      this.customEndDate = null;
      this.showCustomDatePopup = true;
    } else {
      // Reset the custom label
      const customOpt = this.dateRanges.find((dr) => dr.value === 'custom');
      if (customOpt) {
        customOpt.label = 'Custom';
      }
      this.applyDateFilter();
    }
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  applyDateFilter() {
    if (!this.selectedDateRange || !this.productionList) {
      this.filteredproductionList = this.productionList;
      return;
    }
    if (this.selectedDateRange === 'all') {
      this.filteredproductionList = this.productionList; // show full list
      return;
    }

    const today = new Date();
    let startDate: Date;
    const endDate = new Date(); // today

    switch (this.selectedDateRange) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7':
        startDate = new Date();
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last15':
        startDate = new Date();
        startDate.setDate(today.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last30':
        startDate = new Date();
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        this.filteredproductionList = this.productionList;
        return;
    }

    this.filteredproductionList = this.productionList.filter((item: any) => {
      const invoiceDate = item.PROD_DATE;
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    this.filteredproductionList = this.productionList.filter((item: any) => {
      const invoiceDate = item.PROD_DATE;
      return invoiceDate >= start && invoiceDate <= end;
    });

    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} to ${toLabel}` }
        : option,
    );

    this.showCustomDatePopup = false;
  }

  private parseDateString(dateStr: string): Date {
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

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

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

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.STATUS;

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

  onCellPrepared(e: any) {
    if (e.rowType === 'data' && e.column.command === 'edit') {
      if (e.data.STATUS === 5) {
        const deleteButton = e.cellElement.querySelector('.dx-link-delete');
        if (deleteButton) {
          deleteButton.style.display = 'none';
        }
      }
    }
  }

  // onEditProduction(event: any) {
  //   event.cancel = true;

  //   const productionId = event.data.PRODUCTION_ID;
  //   const status = event.data.TRANS_STATUS;

  //   const api$ =
  //     this.selectedProductionType === 'ARTICLE'
  //       ? this.dataService.selectArticleProduction(productionId)
  //       : this.dataService.selectBoxProduction(productionId);

  //   api$.subscribe((response: any) => {
  //     this.selectedProduction = response;
  //     this.isReadOnlyInvoice = status === 5;
  //     this.isViewProduction = true;

  //   });
  // }

  onEditProduction(event: any) {
    event.cancel = true;

    const productionId = event.data.PRODUCTION_ID;
    const status = event.data.TRANS_STATUS;

    const isArticle = this.selectedProductionType === 'ARTICLE';

    const api$ = isArticle
      ? this.dataService.selectProduction(productionId)
      : this.dataService.selectBoxProduction(productionId);

    api$.subscribe((response: any) => {
      this.selectedProduction = response;
      // this.isReadOnlyInvoice = status === 5;

      // reset both views first
      this.isEditPopupVisible = false;
      this.isViewBoxProduction = false;

      // open correct view
      if (isArticle) {
        this.isEditPopupVisible = true;
      } else {
        this.isViewBoxProduction = true;
      }
    });
  }

  // onEditProduction(event: any) {
  //   event.cancel = true;
  //   const productionId = event.data.PRODUCTION_ID;
  //   const status = event.data.TRANS_STATUS;
  //   this.dataService
  //     .selectProduction(productionId)
  //     .subscribe((response: any) => {
  //       this.selectedProduction = response;
  //       this.isEditInvoice = true;
  //       this.isReadOnlyInvoice = status === 5;
  //     });
  // }

  handleClose() {
    this.isBoxPopupVisible = false;
    this.isViewProduction = false;
    this.isViewBoxProduction = false;
    this.isAddPopupVisible = false;
    this.isEditPopupVisible = false;
    this.isEditInvoice = false;

    //Reload list INSIDE Angular zone
    this.ngZone.run(() => {
      this.getProductionList(); // API call
      this.cdr.detectChanges(); // force UI refresh
    });
  }

  onPopupHiding() {
    if (this.productionForm) {
      this.productionForm.resetForm(); //  RESET CHILD FORM
    }

    this.isAddPopupVisible = false;
    this.isBoxPopupVisible = false;
  }

  addProduction() {
    this.isAddPopupVisible = false;
    this.isBoxPopupVisible = false;

    if (this.selectedProductionType === 'ARTICLE') {
      this.isAddPopupVisible = true;
    } else if (this.selectedProductionType === 'BOX') {
      this.isBoxPopupVisible = true;
    }
    // this.isAddPopupVisible = true;
  }

  onProductionTypeChanged(e: any) {
    if (e.value === 'ARTICLE') {
      // Load article production list
    } else if (e.value === 'BOX') {
      // Load box production list
    }

    this.getProductionList();
  }

  get productionHeaderTitle(): string {
    return this.selectedProductionType === 'ARTICLE'
      ? 'Article Production'
      : 'Box Production';
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
    AddCreditNoteModule,
    EditCreditNoteModule,
    ViewCreditNoteModule,
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    AddInvoiceModule,
    EditInvoiceModule,
    ViewInvoiceModule,
    InvoiceTrOutAddModule,
    ProductionJvAddModule,
    ProductionJvViewModule,
    BoxproductionJvAddModule,
    ArticleproductionJvViewModule,
    BoxproductionJvViewModule,
  ],
  providers: [],
  declarations: [ArticleproductionJvListComponent],
  exports: [ArticleproductionJvListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleproductionJvListModule {}
