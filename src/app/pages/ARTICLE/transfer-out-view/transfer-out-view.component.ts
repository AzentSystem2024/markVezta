import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxFormModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTabPanelModule, DxTextBoxModule, DxTreeListModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-transfer-out-view',
  templateUrl: './transfer-out-view.component.html',
  styleUrls: ['./transfer-out-view.component.scss']
})
export class TransferOutViewComponent {
      displayMode: any = 'full';
  showPageSizeSelector = true;
        isFilterRowVisible: boolean;
        TransferOutList: any[] = [];
 auto: string = 'auto';
 toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };
  formsource: any;


   constructor(private fb:FormBuilder,private dataservice : DataService ){
             this.formsource = this.fb.group({
               
               
             })
             this.get_TransferOut_List()
           }


  get_TransferOut_List(){
    //  const payload ={
    //     USER_ID : 0
    //    }
      this.dataservice.get_TransferOut_Api().subscribe((res: any) => {
        this.TransferOutList = res.Data;
    console.log(this.TransferOutList,"response")
  });
     }


formatDate = (date: Date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};


       summaryColumnsData = {
    totalItems: [
      {
        column: 'TRANSFER_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TRANSFER_QTY',
        alignment: 'Right',
      },
      {
        column: 'PAIR_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'PAIR_QTY',
        alignment: 'right',
      },
      {
        column: 'TOTAL_PAIR_QTY',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TOTAL_PAIR_QTY',
        alignment: 'right',
      },
    ],
    groupItems: [
    {
      column: 'TRANSFER_QTY',
      summaryType: 'sum',
      displayFormat: '{0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'PAIR_QTY',
      summaryType: 'sum',
      displayFormat: ' {0}',
      valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
      alignByColumn: true,
    },
    {
      column: 'TOTAL_PAIR_QTY',
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
  declarations: [TransferOutViewComponent],
})
export class TransferOutViewModule{}