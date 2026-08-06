import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxSortableModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-ar-report-page',
  templateUrl: './ar-report-page.component.html',
  styleUrls: ['./ar-report-page.component.scss'],
  providers: [DataService, DatePipe],
})
export class ARReportPageComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  isFilterRowVisible: boolean = false;

  Ar_Report_DataSource!: DataSource<any>;
  isEmptyDatagrid: boolean = true;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';

  company_list: any = [];
  savedUserData: any;

  formatted_from_date: any;
  formatted_To_date: any;

  selected_Company_id: any;
  selected_fin_id: any;

  selectedYear: any = null;
  years: number[] = [];

  monthDataSource: { name: string; value: any }[] = [];
  selectedmonth: any = '';


  isContentVisible: boolean = false;
  columndata: any;
  summaryColumnsData: any;
  columnsConfig: any;
  ColumnNames: any;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
  ) {
    this.sesstion_Details();

    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }

    // Month datasource
    this.monthDataSource = this.dataservice.getMonths();
    this.selectedYear = 2021;
    this.formatted_from_date = '2021-01-01';
    this.formatted_To_date = '2021-12-31';
  }

  ngOnInit() {
    this.get_Datagrid_DataSource();
  }

  // ================= Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1);
      this.formatted_To_date = today;
    } else {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1);
      this.formatted_To_date = new Date(this.selectedYear, 11, 31);
    }
  }

  // ================= Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1);
      this.formatted_To_date = new Date(this.selectedYear, 11, 31);
    } else {
      this.formatted_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );

      this.formatted_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  //=========Fetch DataSource For The Datagrid Table==========
  async get_Datagrid_DataSource() {
    console.log('Fetching data with payload:', {
      DateFrom: this.formatted_from_date,
      DateTo: this.formatted_To_date,
    });

    const payload = {
      DateFrom: this.formatted_from_date,
      DateTo: this.formatted_To_date,
    };

    this.isContentVisible = false;

    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    }

    try {
      const response: any = await this.dataservice
        .AR_Report_Data_Fetching_Api(payload)
        .toPromise();

      console.log('API Response:', response);

      if (response?.flag === '1') {
        this.isEmptyDatagrid = false;

        const ResponseData = response?.header || {};

        this.columndata = ResponseData?.ReportColumns || [];

        let reportData = ResponseData?.ReportData || [];

        // Convert decimal/int values into number
        reportData = reportData.map((row: any) => {
          this.columndata.forEach((col: any) => {
            const type = col.Type?.toLowerCase();

            if (type === 'decimal' || type === 'int32') {
              row[col.Name] =
                row[col.Name] !== null &&
                row[col.Name] !== undefined &&
                row[col.Name] !== ''
                  ? Number(row[col.Name])
                  : 0;
            }
          });

          return row;
        });

        const userLocale = navigator.language || 'en-US';

        // Summary generation
        this.summaryColumnsData = this.generateSummaryColumns(this.columndata);

        console.log('Summary Columns Data:', this.summaryColumnsData);

        // Dynamic columns
        this.columnsConfig = this.generateColumnsConfig(
          this.columndata,
          userLocale,
        );

        // Bind datasource
        this.Ar_Report_DataSource = reportData;

        this.isContentVisible = true;

        // Refresh grid
        setTimeout(() => {
          this.dataGrid?.instance?.refresh();
        });
      }
    } catch (error) {
      console.error('API ERROR:', error);
    } finally {
      if (this.dataGrid?.instance) {
        this.dataGrid.instance.endCustomLoading();
      }
    }
  }

  generateSummaryColumns(reportColumns: any[]) {
    const decimalColumns = reportColumns.filter(
      (col: any) =>
        col.Type?.toLowerCase() === 'decimal' && col.Summary === true,
    );

    const intColumns = reportColumns.filter(
      (col: any) => col.Type?.toLowerCase() === 'int32' && col.Summary === true,
    );

    return {
      totalItems: [
        ...decimalColumns.map((col: any) =>
          this.createSummaryItem(col, false, 'sum', 'decimal'),
        ),

        ...intColumns.map((col: any) =>
          this.createSummaryItem(col, false, 'sum', 'count'),
        ),
      ],

      groupItems: [
        ...decimalColumns.map((col: any) =>
          this.createSummaryItem(col, true, 'sum', 'decimal'),
        ),

        ...intColumns.map((col: any) =>
          this.createSummaryItem(col, true, 'sum', 'count'),
        ),
      ],
    };
  }

  createSummaryItem(
    col: any,
    isGroupItem = false,
    summaryType = 'sum',
    formatType: any,
  ) {
    return {
      column: col.Name,

      summaryType: summaryType,

      displayFormat: formatType === 'count' ? 'Count : {0}' : 'Total : {0}',

      valueFormat:
        formatType === 'decimal'
          ? {
              type: 'fixedPoint',
              precision: 2,
            }
          : undefined,

      alignByColumn: isGroupItem,

      showInGroupFooter: isGroupItem,
    };
  }

  generateColumnsConfig(reportColumns: any[], userLocale: any) {
    return reportColumns.map((column: any) => {
      let columnFormat: any = null;

      const type = column.Type?.toLowerCase();

      // DATE FORMAT
      if (type === 'datetime') {
        columnFormat = {
          type: 'date',
          precision: 0,
        };
      }

      // DECIMAL FORMAT
      if (type === 'decimal') {
        columnFormat = {
          type: 'fixedPoint',
          precision: 2,
        };
      }

      // PERCENTAGE FORMAT
      if (type === 'percentage') {
        columnFormat = {
          type: 'percent',
          precision: 2,
        };
      }

      return {
        dataField: column.Name,
        caption: column.Title,
        visible: column.Visibility,
        format: columnFormat,
        alignment: type === 'decimal' || type === 'int32' ? 'right' : 'left',
      };
    });
  }

  //====================Find the column location from the datagrid================
  findColumnLocation = (e: any) => {
    const columnName = e.itemData;
    if (columnName != '' && columnName != null) {
      this.dataservice.makeColumnVisible(this.dataGrid, columnName);
    }
  };

  onExporting(event: any) {
    const fileName = 'Ar-Report-data';

    this.dataservice.exportDataGridReport(event, fileName);
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    CommonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTagBoxModule,
    DxSortableModule,
    DxListModule,
    DxDropDownBoxModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ARReportPageComponent],
})
export class ARReportPageModule {}
