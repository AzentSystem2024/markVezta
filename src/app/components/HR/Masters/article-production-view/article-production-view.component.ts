import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxTreeListModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-article-production-view',
  templateUrl: './article-production-view.component.html',
  styleUrls: ['./article-production-view.component.scss'],
})
export class ArticleProductionViewComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  ArticleProductionDataSource: DataSource;
  articleProductionArray: any[] = [];
  articleProductionCount = 0;
  isFilterRowVisible: boolean;
  displayMode: any = 'full';
  showPageSizeSelector = true;
  auto: string = 'auto';
  selectedDateRange: any = 'today';
  CompanyDetails: any;
  customStartDate: any = null;
  customEndDate: any = null;
  startDate: Date;
  EndDate: Date;
  showCustomDatePopup: boolean = false;
  company_id: any;
  listofArticlesView: any;
  dateRanges = [
    {
      label: 'Today',
      value: 'today',
    },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    {
      label: 'Custom',
      value: 'custom',
    },
  ];

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, //  global style
    onClick: () => this.toggleFilterRow(),
  };
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };
  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Credit_Note';
    this.dataservice.exportDataGrid(event, fileName);
  }
  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {
    this.FilteringDetails();
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_DataSource();
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
  private parseDateString(dateStr: string): Date {
    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  onDateRangeChanged(e: any) {
    const today = new Date();
    this.selectedDateRange = e.value;
    if (this.selectedDateRange === 'today') {
      this.startDate = new Date();
      this.EndDate = this.startDate;
    } else if (this.selectedDateRange === 'last7') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 6);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last15') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 14);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last30') {
      this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }
    //  else if (this.selectedDateRange === 'custom') {
    //   const lastMonth = today.getMonth() - 1;
    //   this.startDate = new Date(today.getFullYear(), lastMonth, 1);
    //   this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);

    // }
    else {
      this.showCustomDatePopup = true;
      this.startDate = this.customStartDate;
      this.EndDate = this.customEndDate;
    }
  }

  applyDateFilter() {
    if (!this.selectedDateRange || !this.listofArticlesView) {
      this.ArticleProductionDataSource = this.listofArticlesView;
      return;
    }

    this.startDate;

    const endDate = new Date(); // today

    switch (this.selectedDateRange) {
      case 'today':
        this.startDate = new Date();
        this.EndDate = this.startDate;
        break;
      // case 'last7':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 6);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      // case 'last15':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 14);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      // case 'last30':
      //   startDate = new Date();
      //   startDate.setDate(today.getDate() - 29);
      //   startDate.setHours(0, 0, 0, 0);
      //   break;
      default:
        this.ArticleProductionDataSource = this.listofArticlesView;
        return;
    }

    // this.ArticleProductionDatasource = this.listofArticlesView.filter((item: any) => {
    //   const invoiceDate = this.parseDateString(item.SALE_DATE);
    //   return invoiceDate >= startDate && invoiceDate <= endDate;
    // });
  }

  // Helper method to format dates consistently
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // applyCustomDateFilter() {
  //   if (!(this.customStartDate && this.customEndDate)) return;

  //   const start = new Date(this.customStartDate);
  //   start.setHours(0, 0, 0, 0);

  //   const end = new Date(this.customEndDate);
  //   end.setHours(23, 59, 59, 999);

  //   this.ArticleProductionDatasource = this.listofArticlesView.filter((item: any) => {
  //     const invoiceDate = this.parseDateString(item.SALE_DATE);
  //     return invoiceDate >= start && invoiceDate <= end;
  //   });

  //   const fromLabel = this.formatAsDDMMYYYY(start);
  //   const toLabel = this.formatAsDDMMYYYY(end);

  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom'
  //       ? { ...option, label: `${fromLabel} to ${toLabel}` }
  //       : option
  //   );

  //   this.showCustomDatePopup = false;
  // }

  //    applyCustomDateFilter() {
  //     if (!this.customStartDate || !this.customEndDate) {
  //       alert('Please select both From and To dates.');
  //       return;
  //     }

  //     const start = new Date(this.customStartDate);
  //     start.setHours(0, 0, 0, 0);

  //     const end = new Date(this.customEndDate);
  //     end.setHours(23, 59, 59, 999);

  //     if (start > end) {
  //       alert('From Date cannot be after To Date.');
  //       return;
  //     }

  //     this.startDate = start;
  //     this.EndDate = end;

  //     this.selectedDateRange = {
  //       label: `${this.formatDate(this.startDate)} - ${this.formatDate(
  //         this.EndDate
  //       )}`,
  //       value: 'custom',
  //     };

  //     setTimeout(() => {
  //   this.showCustomDatePopup = false;
  // }, 100);

  //     this.cdr.detectChanges(); // optional
  //   }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) {
      alert('Please select both From and To dates.');
      return;
    }

    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      alert('From Date cannot be after To Date.');
      return;
    }

    this.startDate = start;
    this.EndDate = end;

    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);

    //  Update label of custom option in dateRanges
    this.dateRanges = this.dateRanges.map((range) => {
      if (range.value === 'custom') {
        return {
          ...range,
          label: `${fromLabel} to ${toLabel}`,
        };
      }
      return range;
    });

    //  Set selectedDateRange to 'custom' to reflect it in the select box
    this.selectedDateRange = 'custom';

    this.showCustomDatePopup = false;
  }

  // FilteringDetails(){
  //   // const CompanyDetails=sessionStorage.getItem('savedUserData');
  // const LoginDetails = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');

  //   this.CompanyDetails = LoginDetails.Companies;
  // }

  FilteringDetails() {
    const LoginDetails = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.CompanyDetails = LoginDetails.Companies;

    if (this.CompanyDetails && this.CompanyDetails.length > 0) {
      // Set all COMPANY_IDs as selected by default
      this.company_id = this.CompanyDetails.map((comp: any) => comp.COMPANY_ID);
    }
  }

  get_DataSource() {
    const from = new Date(this.startDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.EndDate);
    to.setHours(23, 59, 59, 999);

    const payload = {
      COMPANY_ID: this.company_id.join(','),
      DATE_FROM: from.toISOString(),
      DATE_TO: to.toISOString(),
    };

    this.ArticleProductionDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.get_ArticleProduction_view(payload).subscribe({
            next: (res: any) => {
              const list = res?.data || [];

              //  cache for logic / counts
              this.articleProductionArray = list;
              this.articleProductionCount = list.length;

              resolve(list);
            },
            error: () => {
              this.articleProductionArray = [];
              this.articleProductionCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  summaryColumnsData = {
    totalItems: [
      {
        column: 'QUANTITY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QUANTITY',
        alignment: 'Right',
      },
    ],
    groupItems: [
      {
        column: 'QUANTITY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxTreeListModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxTagBoxModule,
    DxDateBoxModule,
    CustomDatePopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ArticleProductionViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleProductionViewModule {}
