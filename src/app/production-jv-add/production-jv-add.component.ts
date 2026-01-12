import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from '../components';
import { AddCreditNoteModule } from '../pages/CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../pages/CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { AddDebitModule } from '../pages/DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from '../pages/DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from '../pages/DEBIT/view-debit/view-debit.component';
import { AddInvoiceModule } from '../pages/INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from '../pages/INVOICE/edit-invoice/edit-invoice.component';
import {
  InvoiceTrOutAddComponent,
  InvoiceTrOutAddModule,
} from '../pages/INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { InvoiceTrOutComponent } from '../pages/INVOICE/invoice-tr-out/invoice-tr-out.component';
import { ViewInvoiceModule } from '../pages/INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-production-jv-add',
  templateUrl: './production-jv-add.component.html',
  styleUrls: ['./production-jv-add.component.scss']
})
export class ProductionJvAddComponent {

  onRowRemoved(e: any) {
  }

  onEditorPreparing(e: any) {

  }

  Cancel() {
    
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
    FormTextboxModule,
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
    AddCreditNoteModule,
    EditCreditNoteModule,
    ViewCreditNoteModule,
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    AddInvoiceModule,
    EditInvoiceModule,
    ViewInvoiceModule,
    InvoiceTrOutAddModule,
  ],
  providers: [],
  declarations: [ProductionJvAddComponent],
  exports: [ProductionJvAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductionJvAddModule {}