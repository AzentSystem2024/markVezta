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
import { FormTextboxModule } from '../../../components';
import { AddCreditNoteModule } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { AddDebitModule } from '../../DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from '../../DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { AddInvoiceModule } from '../../INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from '../../INVOICE/edit-invoice/edit-invoice.component';
import {
  InvoiceTrOutAddComponent,
  InvoiceTrOutAddModule,
} from '../../INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { InvoiceTrOutComponent } from '../invoice-tr-out/invoice-tr-out.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../../../services';
import { Router } from '@angular/router';
import {
  ProductionJvAddComponent,
  ProductionJvAddModule,
} from '../../../production-jv-add/production-jv-add.component';
import { ProductionJvViewModule } from '../../../production-jv-view/production-jv-view.component';
import {
  BoxproductionJvAddComponent,
  BoxproductionJvAddModule,
} from '../../../boxproduction-jv-add/boxproduction-jv-add.component';
import notify from 'devextreme/ui/notify';
import { CustomDatePopupModule } from '../../../custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-production-jv-list',
  templateUrl: './production-jv-list.component.html',
  styleUrls: ['./production-jv-list.component.scss'],
})
export class ProductionJvListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(ProductionJvAddComponent)
  productionForm!: ProductionJvAddComponent;
  @ViewChild(BoxproductionJvAddComponent)
  boxProductionForm!: BoxproductionJvAddComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  isViewBoxProduction: boolean = false;
  isBoxAddPopupVisible: boolean = false;
  isEditBoxPopupVisible: boolean = false;
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
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
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
  // selectedDateRange: string = 'today';
  selectedDateRange: any = 'today';

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
  selectedProduction: any;
  isEditPopupVisible: boolean = false;
  productionTypes = [
    { id: 'ARTICLE', name: 'Article Production' },
    { id: 'BOX', name: 'Box Production' },
  ];

  selectedProductionType = 'ARTICLE';
  isViewProduction: boolean;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) { }

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

  // getProductionList() {
  //   const { fromDate, toDate } = this.getDateRange();

  //   const payload: any = {
  //     COMPANY_ID: this.selected_Company_id,
  //     DATE_FROM: fromDate, // 👈 backend filter
  //     DATE_TO: toDate, // 👈 backend filter
  //   };

  //   const api$ =
  //     this.selectedProductionType === 'BOX'
  //       ? this.dataService.getBoxProductionJVList(payload)
  //       : this.dataService.getProductionJVList(payload);

  //   api$.subscribe((response: any) => {
  //     this.productionList = (response.Data || [])
  //       .map((item: any) => {
  //         let saleDate = item.PROD_DATE;
  //         let dateValue: Date;

  //         if (/^\d{2}-\d{2}-\d{4}$/.test(saleDate)) {
  //           const [day, month, year] = saleDate.split('-').map(Number);
  //           dateValue = new Date(year, month - 1, day);
  //         } else {
  //           dateValue = new Date(saleDate);
  //         }

  //         const match = item.DOC_NO?.match(/\d+$/);
  //         const docNoNumber = match ? Number(match[0]) : 0;

  //         return {
  //           ...item,
  //           PROD_DATE: dateValue,
  //           _docNoNumber: docNoNumber,
  //         };
  //       })
  //       .sort((a: any, b: any) => b._docNoNumber - a._docNoNumber);

  //     this.filteredproductionList = this.productionList; // ✅ backend already filtered
  //   });
  // }

  getProductionList() {
    const grid = this.dataGrid?.instance;

    // 🔵 START LOADING
    grid?.beginCustomLoading('Loading...');

    const { fromDate, toDate } = this.getDateRange();

    const payload: any = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: fromDate,
      DATE_TO: toDate,
    };

    const api$ =
      this.selectedProductionType === 'BOX'
        ? this.dataService.getBoxProductionJVList(payload)
        : this.dataService.getProductionJVList(payload);

    api$.subscribe({
      next: (response: any) => {
        this.productionList = (response.Data || [])
          .map((item: any) => {
            let dateValue: Date;

            if (/^\d{2}-\d{2}-\d{4}$/.test(item.PROD_DATE)) {
              const [d, m, y] = item.PROD_DATE.split('-').map(Number);
              dateValue = new Date(y, m - 1, d);
            } else {
              dateValue = new Date(item.PROD_DATE);
            }

            const match = item.DOC_NO?.match(/\d+$/);
            const docNoNumber = match ? Number(match[0]) : 0;

            return {
              ...item,
              PROD_DATE: dateValue,
              _docNoNumber: docNoNumber,
            };
          })
          .sort((a: any, b: any) => b._docNoNumber - a._docNoNumber);

        this.filteredproductionList = this.productionList;
      },
      error: () => {
        // optional: handle error
      },
      complete: () => {
        // STOP LOADING
        grid?.endCustomLoading();
      },
    });
  }

  onDateDropdownFocus() {
    if (this.selectedDateRange === 'custom') {
      this.showCustomDatePopup = true;
    }
  }

  dateDisplayExpr = (item: any) => item?.label ?? '';

  // refreshGrid() {
  //   if (this.dataGrid?.instance) {
  //     this.dataGrid.instance.refresh(); // Or reload data from API if needed
  //     this.getProductionList();
  //   }
  // }

  refreshGrid() {
    this.getProductionList(); // only API call
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

  onDateRangeChanged(value: string) {
    this.selectedDateRange = value;

    if (value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label when switching away
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    this.getProductionList();
  }

  // onDateRangeChanged(value: string) {
  //   this.selectedDateRange = value;

  //   if (value === 'custom') {
  //     //  DO NOT reset dates here
  //     this.showCustomDatePopup = true;
  //     return;
  //   }

  //   // other ranges
  //   this.customStartDate = null;
  //   this.customEndDate = null;
  //   this.getProductionList();
  // }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(
      this.customStartDate instanceof Date
        ? this.customStartDate
        : new Date(this.customStartDate),
    );

    const toLabel = this.formatAsDDMMYYYY(
      this.customEndDate instanceof Date
        ? this.customEndDate
        : new Date(this.customEndDate),
    );

    // 🔑 THIS IS THE MISSING PIECE
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getProductionList();
  }

  // applyCustomDateFilter() {
  //   if (!this.customStartDate || !this.customEndDate) return;

  //   if (this.customStartDate > this.customEndDate) {
  //     alert('From date cannot be greater than To date');
  //     return;
  //   }

  //   // keep value as custom
  //   this.selectedDateRange = 'custom';

  //   this.showCustomDatePopup = false;
  //   this.getProductionList();
  // }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  private getDateRange(): { fromDate: string | null; toDate: string | null } {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'all':
        return { fromDate: null, toDate: null };

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return {
      fromDate: fromDate ? this.formatDate(fromDate) : null,
      toDate: toDate ? this.formatDate(toDate) : null,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // backend friendly
  }

  // applyDateFilter() {
  //   if (!this.selectedDateRange || !this.productionList) {
  //     this.filteredproductionList = this.productionList;
  //     return;
  //   }
  //   if (this.selectedDateRange === 'all') {
  //     this.filteredproductionList = this.productionList; // show full list
  //     return;
  //   }

  //   const today = new Date();
  //   let startDate: Date;
  //   const endDate = new Date(); // today

  //   switch (this.selectedDateRange) {
  //     case 'today':
  //       startDate = new Date();
  //       startDate.setHours(0, 0, 0, 0);
  //       break;
  //     case 'last7':
  //       startDate = new Date();
  //       startDate.setDate(today.getDate() - 6);
  //       startDate.setHours(0, 0, 0, 0);
  //       break;
  //     case 'last15':
  //       startDate = new Date();
  //       startDate.setDate(today.getDate() - 14);
  //       startDate.setHours(0, 0, 0, 0);
  //       break;
  //     case 'last30':
  //       startDate = new Date();
  //       startDate.setDate(today.getDate() - 29);
  //       startDate.setHours(0, 0, 0, 0);
  //       break;
  //     default:
  //       this.filteredproductionList = this.productionList;
  //       return;
  //   }

  //   this.filteredproductionList = this.productionList.filter((item: any) => {
  //     const invoiceDate = item.PROD_DATE;
  //     return invoiceDate >= startDate && invoiceDate <= endDate;
  //   });
  // }

  // applyCustomDateFilter() {
  //   if (!(this.customStartDate && this.customEndDate)) return;

  //   const start = new Date(this.customStartDate);
  //   start.setHours(0, 0, 0, 0);

  //   const end = new Date(this.customEndDate);
  //   end.setHours(23, 59, 59, 999);

  //   this.filteredproductionList = this.productionList.filter((item: any) => {
  //     const invoiceDate = item.PROD_DATE;
  //     return invoiceDate >= start && invoiceDate <= end;
  //   });

  //   const fromLabel = this.formatAsDDMMYYYY(start);
  //   const toLabel = this.formatAsDDMMYYYY(end);

  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom'
  //       ? { ...option, label: `${fromLabel} to ${toLabel}` }
  //       : option,
  //   );

  //   this.showCustomDatePopup = false;
  // }

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
        innerList.off('itemClick'); // prevent duplicate bindings

        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;

          if (clickedValue === 'custom') {
            this.showCustomDatePopup = true;
            e.component.close();
          }
        });
      }
    }, 0);
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo.data, 'statussssssssss');
    const status = cellInfo.data.STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === '5' ? '#5cac6fff' : 'rgb(236, 75, 75)';
    icon.title = status === '5' ? 'Approved' : 'Open';

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
      if (e.data.STATUS === '5') {
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

  //    const isArticle = this.selectedProductionType === 'ARTICLE';

  //   const api$ =
  //     this.selectedProductionType === 'ARTICLE'
  //       ? this.dataService.selectProduction(productionId)
  //       : this.dataService.selectBoxProduction(productionId);

  //   api$.subscribe((response: any) => {
  //     this.selectedProduction = response;
  //     // this.isReadOnlyInvoice = status === 5;
  //     this.isEditPopupVisible = false;

  //     if (isArticle) {
  //       this.isEditPopupVisible = true;
  //     } else {
  //       this.isViewBoxProduction = true;
  //     }
  //     // this.isViewBoxProduction = false;
  //   });
  // }

  onEditProduction(event: any) {
    event.cancel = true;

    const productionId = event.data.TRANS_ID;
    const status = event.data.STATUS;

    const isArticle = this.selectedProductionType === 'ARTICLE';
    const isBox = this.selectedProductionType === 'BOX';

    const api$ = isArticle
      ? this.dataService.selectProduction(productionId)
      : this.dataService.selectBoxProduction(productionId);

    api$.subscribe((response: any) => {
      this.selectedProduction = response;
      this.isReadOnlyInvoice = status === '5';

      // reset both views first
      this.isEditPopupVisible = false;
      this.isViewProduction = false;
      this.isViewBoxProduction = false;
      if (status === '5') {
        //  VIEW MODE
        this.isViewProduction = true;
      } else {
        //  EDIT MODE
        if (isArticle && status !== '5') {
          this.isEditPopupVisible = true;
        } else if (isBox && status !== '5') {
          this.isEditBoxPopupVisible = true;
        } else {
          this.isViewBoxProduction = true;
        }
      }
    });
  }

  //   onCellPrepared(e: any) {
  //   if (e.rowType === 'data' && e.column.command === 'edit') {
  //     const status = e.data.TRANS_STATUS;

  //     // 🚫 Hide Edit & Delete when status = 1
  //     if (status === 1) {
  //       const editButton = e.cellElement.querySelector('.dx-link-edit');
  //       const deleteButton = e.cellElement.querySelector('.dx-link-delete');

  //       if (editButton) {
  //         editButton.style.display = 'none';
  //       }
  //       if (deleteButton) {
  //         deleteButton.style.display = 'none';
  //       }
  //     }
  //   }
  // }

  // onEditProduction(event: any) {
  //   event.cancel = true;
  //   const productionId = event.data.PRODUCTION_ID;
  //   const status = event.data.TRANS_STATUS;
  //   this.dataService
  //     .selectProduction(productionId)
  //     .subscribe((response: any) => {
  //       this.selectedProduction = response;
  //       console.log(this.selectedProduction, 'SELECTEDTROUT');
  //       this.isEditInvoice = true;
  //       this.isReadOnlyInvoice = status === 5;
  //     });
  // }

  handleClose() {
    this.isViewProduction = false;
    this.isAddPopupVisible = false;
    this.isBoxAddPopupVisible = false;
    this.isEditPopupVisible = false;
    this.isEditBoxPopupVisible = false;
    this.isViewBoxProduction = false;
    this.isEditInvoice = false;

    //Reload list INSIDE Angular zone
    this.ngZone.run(() => {
      this.getProductionList(); // API call
      this.cdr.detectChanges(); // force UI refresh
    });
  }

  onPopupHiding() {
    console.log('Popup closed');

    if (this.selectedProductionType === 'BOX') {
      this.boxProductionForm?.resetForm();
    } else {
      this.productionForm?.resetForm();
    }

    this.isAddPopupVisible = false;
    this.isBoxAddPopupVisible = false;
  }

  addProduction() {
    if (this.selectedProductionType === 'BOX') {
      this.isBoxAddPopupVisible = true;
      this.isAddPopupVisible = false;
    } else {
      this.isAddPopupVisible = true;
      this.isBoxAddPopupVisible = false;
    }
  }

  onProductionTypeChanged(e: any) {
    this.selectedProductionType = e.value; // ARTICLE / BOX
    this.getProductionList(); // reload list
  }

  get productionHeaderTitle(): string {
    return this.selectedProductionType === 'ARTICLE'
      ? 'Article Production'
      : 'Box Production';
  }

  delete_Data(event: any) {
    console.log(event, 'to delete id');

    const Id = event?.data?.PRODUCTION_ID;
    if (!Id) {
      notify('Invalid production id', 'error', 2000);
      return;
    }

    const api$ =
      this.selectedProductionType === 'BOX'
        ? this.dataService.Delete_Box_Production_Api(Id)
        : this.dataService.Delete_Article_Production_Api(Id);

    api$.subscribe({
      next: () => {
        notify(
          {
            message: 'Data successfully deleted',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1500,
          },
          'success',
        );

        // 🔄 Refresh list after delete
        this.getProductionList();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        notify('Failed to delete data', 'error', 3000);
      },
    });
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
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
    CustomDatePopupModule,
  ],
  providers: [],
  declarations: [ProductionJvListComponent],
  exports: [ProductionJvListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductionJvListModule { }
