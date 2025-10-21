import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-transfer-in-view',
  templateUrl: './transfer-in-view.component.html',
  styleUrls: ['./transfer-in-view.component.scss']
})
export class TransferInViewComponent {
   displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  TransferInview: any 
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  addPackingPopupVisible: boolean = false;
  editPackPopupOpened:boolean=false


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
  declarations: [TransferInViewComponent],
  exports: [TransferInViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransferInViewModule {}

