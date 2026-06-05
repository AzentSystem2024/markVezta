import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
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
@Component({
  selector: 'app-ledger-statement-dimension',
  templateUrl: './ledger-statement-dimension.component.html',
  styleUrls: ['./ledger-statement-dimension.component.scss']
})
export class LedgerStatementDimensionComponent {

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
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [LedgerStatementDimensionComponent],
})
export class LedgerStatementDimensionModule { }
