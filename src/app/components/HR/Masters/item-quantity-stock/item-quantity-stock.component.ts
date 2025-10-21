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
  selector: 'app-item-quantity-stock',
  templateUrl: './item-quantity-stock.component.html',
  styleUrls: ['./item-quantity-stock.component.scss']
})
export class ItemQuantityStockComponent {


  ItemQuantityDatasource: any[]=[];
   displayMode: any = 'full';
  showPageSizeSelector = true;
 auto: string = 'auto';
    months: any[] = [];
    selectedMonth: string;
    payloadDate: string;
    pdfData: any;

    formatted_To_date: string;
      formatted_from_date: string;
      defaultDate: Date = new Date();
      selected_Company_id: any;
      selected_Company_name: any;
      financialYeaDate: any;
      selected_fin_id: any;
      selectedstoreId: any;
        
        pdfSrc: SafeResourceUrl | null = null;

          onExporting(event: any) {
    this.exportService.onExporting(event,'item-quantity-report');
  }
    
         ngOnInit() {
        const currentYear = new Date().getFullYear();
      

      }

          constructor(
            private dataService: DataService,
            private sanitizer: DomSanitizer,
            private exportService: ExportService
          ) {
            this.sesstion_Details();
            this.getItemQuantity()
          }

         
    onFromDateChange(event: any) {
      const rawDate: Date = new Date(event.value);
      this.formatted_from_date = this.formatDate(rawDate);
      console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
    }

    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    }

  getItemQuantity(){
           const payload ={
        // ASONDATE: this.formatted_from_date,
        STORE_ID: this.selectedstoreId,
           }
           console.log(payload,'================payload===================');
           this.dataService.getItemQuantityStock(payload).subscribe((res:any)=>{
            console.log(res,'=================Item Quantity Stock===================');
            this.ItemQuantityDatasource = res.ItemQuantityDetails;
            console.log(this.ItemQuantityDatasource,'=================Item Quantity Stock DataSource===================');
           })
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

   summaryColumnsData = {
    totalItems: [
      {
        column: 'QUANTITY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QUANTITY_AVAILABLE',
        alignment: 'Right',
      },
    ],
    groupItems: [
    {
      column: 'QUANTITY_AVAILABLE',
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
  declarations: [ItemQuantityStockComponent],
  exports: [ItemQuantityStockComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemQuantityStockModule {}