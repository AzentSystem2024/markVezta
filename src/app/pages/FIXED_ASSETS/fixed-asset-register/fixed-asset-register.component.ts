import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
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
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-fixed-asset-register',
  templateUrl: './fixed-asset-register.component.html',
  styleUrls: ['./fixed-asset-register.component.scss']
})
export class FixedAssetRegisterComponent {

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'ASSET_NAME', caption: 'Asset Name' },
    { dataField: 'STORE_CODE', caption: 'Store Code' },
    { dataField: 'LOCATION', caption: 'Location' },
    { dataField: 'TRANS_DATE', caption: 'Trans Date' },
    { dataField: 'PURCH_VALUE', caption: 'Purch Value' },
    { dataField: 'USEFUL_LIFE', caption: 'Useful Life' },
    { dataField: 'NET_DEPRECIATION', caption: 'Net Depreciation' },
    {
      dataField: 'CURRENT_ASSETVALUE',
      caption: 'Current Asset Value',
    },
  ];


  openColumnChooser(): void {
    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible:
        this.dataGrid.instance.columnOption(
          column.dataField,
          'visible'
        ) !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    this.tempColumns.forEach((column) => {
      this.dataGrid.instance.columnOption(
        column.dataField,
        'visible',
        column.visible
      );
    });

    this.isColumnChooserVisible = false;
  }

  cancelColumnChooser(): void {
    this.tempColumns = [];
    this.isColumnChooserVisible = false;
  }

  resetColumnSelection(): void {
    this.tempColumns = this.tempColumns.map((column) => ({
      ...column,
      visible: true,
    }));
  }

  FixedAssetRegister: any[] = [];
  isFilterRowVisible: boolean = false;
  isViewInvoice: boolean = false;
  BalanceSheetReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  selected_Company_id: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: any;
  HeadId: any;
  selected_fin_id: any;
  customer_list: any[] = [];
  select_department_id: any;
  selectedInvoice: any;
  // customer_details: {};
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  customer_details: any = {
    CUSTOMER_ID: 0,
    SALE_ID: 0,
    DATE_FROM: '',
    DATE_TO: '',
    COMPANY_ID: 0,
  };
  Department: any;
  DepartmentWithAll: any[] = [];
  isSummaryVisible = true;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();
  }
  ngOnInit() {
    // initialize with today's date
    // this.onToDateChange({ value: this.defaultDate });
    //   this.onFromDateChange({ value: this.financialYeaDate });
    //get datasource======== function call==========
    this.updateSummaryColumnsData();
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    setTimeout(() => {
      this.Fixed_Asset_register();
    }, 0);

    this.sesstion_Details();
    this.Department_dropdown();
  }


  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.Fixed_Asset_register();
    }
  }

  applyButtonOptions = {
    width: 100,
    hint: 'Apply Filters',
    text: 'Apply',
    type: 'default',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.Fixed_Asset_register(),
  };

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  columnChooserButtonOptions = {
    icon: 'columnchooser',
    hint: 'Choose Columns',
    stylingMode: 'outlined',
    onClick: () => this.openColumnChooser(),
  };

  summaryButtonOptions = {
    icon: 'chevrondown',
    hint: 'Hide Summary',
    stylingMode: 'outlined',
    onClick: () => this.toggleSummary(),
  };

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;
    this.updateSummaryColumnsData();
    // Your existing summary show/hide logic goes here

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  onExporting(event: any) {
    const fileName = 'FixedAssetRegister';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
  }



  Department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;

      this.DepartmentWithAll = [
        {
          ID: null,
          DESCRIPTION: '(All)'
        },
        ...this.Department
      ];
      this.select_department_id = null;
    });
  }

  Fixed_Asset_register() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DEPARTMENT_ID: String(this.select_department_id || 0),
    };

    this.dataservice.FixedAssetRegister_List(payload).subscribe((res: any) => {
      this.FixedAssetRegister = res.FixedAssetDetails;
    });
  }


  handleClose() {
    this.isViewInvoice = false;
  }

  summaryColumnsData: any = {
    totalItems: [],
    groupItems: [],
  };

  updateSummaryColumnsData(): void {
    const moneyFormat = {
      type: 'fixedPoint',
      precision: 2,
      useGrouping: true,
    };

    this.summaryColumnsData = {
      totalItems: this.isSummaryVisible
        ? [
          {
            column: 'NET_DEPRECIATION',
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: moneyFormat,
            showInColumn: 'NET_DEPRECIATION',
            alignment: 'right',
          },
          {
            column: 'CURRENT_ASSETVALUE',
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: moneyFormat,
            showInColumn: 'CURRENT_ASSETVALUE',
            alignment: 'right',
          },
        ]
        : [],

      groupItems: this.isSummaryVisible
        ? [
          {
            column: 'NET_DEPRECIATION',
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: moneyFormat,
            alignByColumn: true,
          },
          {
            column: 'CURRENT_ASSETVALUE',
            summaryType: 'sum',
            displayFormat: '{0}',
            valueFormat: moneyFormat,
            alignByColumn: true,
          },
        ]
        : [],
    };
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

    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [FixedAssetRegisterComponent],
  exports: [FixedAssetRegisterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FixedAssetRegisterModule { }