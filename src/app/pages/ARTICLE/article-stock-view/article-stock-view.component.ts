import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-article-stock-view',
  templateUrl: './article-stock-view.component.html',
  styleUrls: ['./article-stock-view.component.scss']
})
export class ArticleStockViewComponent {

    Datasource: any[];
    displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
articleStockList: any[] = [];
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  addPackingPopupVisible: boolean = false;
  editPackPopupOpened:boolean=false
   formsource: any;

   constructor(private fb:FormBuilder,private dataservice : DataService ){
           this.formsource = this.fb.group({
             
             
           })
           this.get_ArticleStock_List()
         }

     get_ArticleStock_List(){
     const payload ={
        USER_ID : 0
       }
      this.dataservice.get_ArticleStock_Api(payload).subscribe((res: any) => {
        this.articleStockList = res.Data;
    console.log(this.articleStockList,"response")
  });
     }  
     
     
     summaryColumnsData = {
    totalItems: [
      {
        column: 'QTY_AVAILABLE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QTY_AVAILABLE',
        alignment: 'Right',
      },
      {
        column: 'QTY_MULTIBOX',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QTY_MULTIBOX',
        alignment: 'right',
      },
      {
        column: 'QTY_TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'QTY_TOTAL',
        alignment: 'right',
      },
    ],
    groupItems: [
    {
      column: 'QTY_AVAILABLE',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'QTY_MULTIBOX',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'QTY_TOTAL',
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
   
    DxDataGridModule,
   
  ],
  providers: [],
  declarations: [ArticleStockViewComponent],
  exports: [ArticleStockViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleStockViewModule {}
