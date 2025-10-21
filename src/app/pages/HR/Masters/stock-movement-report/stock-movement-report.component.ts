import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxTabsModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidatorModule } from 'devextreme-angular';
import { DxiGroupModule, DxiItemModule, DxoFormItemModule, DxoItemModule, DxoLookupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-stock-movement-report',
  templateUrl: './stock-movement-report.component.html',
  styleUrls: ['./stock-movement-report.component.scss']
})
export class StockMovementReportComponent {
     StockMovementDatasource: any[]=[];
   displayMode: any = 'full';
  showPageSizeSelector = true;
 auto: string = 'auto';
    months: any[] = [];
    selectedMonth: string;
    payloadDate: string;
    pdfData: any;
    ItemList:any;

    formatted_To_date: string;
      formatted_from_date: string;
      defaultDate: Date = new Date();
      selected_Company_id: any;
      selected_Company_name: any;
      financialYeaDate: any;
      selected_fin_id: any;
      selectedstoreId: any;
      selected_item_Id:any;

       onExporting(event: any) {
    this.exportService.onExporting(event,'stock-movement-report');
  }

   constructor(
              private dataService: DataService,
              private sanitizer: DomSanitizer,
              private exportService: ExportService
            ) {
              this.sesstion_Details();
              this.get_Item_Dropdown()
            }

             sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_Company_name = sessionData.SELECTED_COMPANY.COMPANY_NAME;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    console.log(sessionYear, '==================session year==========');
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    console.log(
      this.financialYeaDate,
      '=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[['
    );

    this.formatted_from_date = this.financialYeaDate;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );

    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
    console.log(
      this.selectedstoreId,
      '===========selected store id==================='
    );
  }

  onItemIdChange(event:any){
      console.log(event,'=================item id===================');
      this.selected_item_Id=event.value;
      console.log(this.selected_item_Id,'=================selected item id===================');
  }

  get_Item_Dropdown(){
  this.dataService.Item_Dropdown().subscribe((res:any)=>{
  console.log('Item dropdown',res);
  this.ItemList=res
})

} 

          onFromDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_from_date = this.formatDate(rawDate);
      console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
    }

     onToDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_To_date = this.formatDate(rawDate);
      console.log('Formatted Date:', this.formatted_To_date); // example: "2025-04-01"
    }

    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }
        
    getStockMovement(){
      const payload = {
        COMPANY_ID : this.selected_Company_id,
        DATE_FROM: this.formatted_from_date,
        DATE_TO: this.formatted_To_date,
        STORE_ID: this.selectedstoreId,
        ITEM_ID:this.selected_item_Id ||0
      };
      console.log(payload,'================payload===================');
      this.dataService.StockMovement_Api(payload).subscribe((res:any)=>{
        console.log(res,'=================Stock Movement Report===================');
        this.StockMovementDatasource = res.data;
        console.log(this.StockMovementDatasource,'=================Stock Movement Report DataSource===================');
      }
      );
    }

      summaryColumnsData = {
    totalItems: [
      {
        column: 'OPENING_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'OPENING_QTY',
        alignment: 'Right',
      },
      {
        column: 'GRN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'GRN_QTY',
        alignment: 'Right',
      },
      {
        column: 'BALANCE_STOCK',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'BALANCE_STOCK',
        alignment: 'Right',
      },
      {
        column: 'PURCHASE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PURCHASE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFEROUT_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TRANSFEROUT_QTY',
        alignment: 'Right',
      },
      {
        column: 'TRANSFERIN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TRANSFERIN_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DELIVERY_QTY',
        alignment: 'Right',
      },
      {
        column: 'DELIVERY_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DELIVERY_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'SALE_QTY',
        alignment: 'Right',
      },
      {
        column: 'SALE_RETURN_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'SALE_RETURN_QTY',
        alignment: 'Right',
      },
      {
        column: 'ADJUSTED',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ADJUSTED',
        alignment: 'Right',
      },
    ],
    groupItems: [
    {
      column: 'OPENING_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'GRN_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'BALANCE_STOCK',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'PURCHASE_RETURN_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'TRANSFEROUT_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'TRANSFERIN_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'DELIVERY_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'DELIVERY_RETURN_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'SALE_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'SALE_RETURN_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
     {
      column: 'ADJUSTED',
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
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [StockMovementReportComponent],
  exports: [StockMovementReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockMovementReportModule {}