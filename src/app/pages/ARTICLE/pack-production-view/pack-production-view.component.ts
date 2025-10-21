import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxFormModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTabPanelModule, DxTextBoxModule, DxTreeListModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';

@Component({
  selector: 'app-pack-production-view',
  templateUrl: './pack-production-view.component.html',
  styleUrls: ['./pack-production-view.component.scss']
})
export class PackProductionViewComponent {
   Datasource: any[];
     isFilterRowVisible: boolean = false;
      displayMode: any = 'full';
  showPageSizeSelector = true;
 auto: string = 'auto';
 toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

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
  ],
  providers: [],
  exports: [],
  declarations: [PackProductionViewComponent],
})
export class PackProductionViewModule{}