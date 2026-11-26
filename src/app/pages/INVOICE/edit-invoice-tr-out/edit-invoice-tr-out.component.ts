import { AddJournalVoucharModule } from 'src/app/pages/JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from 'src/app/pages/JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from 'src/app/pages/JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
<<<<<<< HEAD
import { ArticleAddModule } from '../../../features/master-data/pages/article/article-add-form/article-add.component';
import { ArticleEditModule } from '../../../features/master-data/pages/article/article-edit-form/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
=======
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
>>>>>>> a6995a6eb4acaef137acf14d6f302d4e470dfcdf
import { EditInvoiceComponent } from '../edit-invoice/edit-invoice.component';
import { ViewInvoiceModule } from '../view-invoice/view-invoice.component';

@Component({
  selector: 'app-edit-invoice-tr-out',
  templateUrl: './edit-invoice-tr-out.component.html',
  styleUrls: ['./edit-invoice-tr-out.component.scss'],
})
export class EditInvoiceTrOutComponent {}
@NgModule({
  imports: [
    AddJournalVoucharModule, EditJournalVoucherModule, ViewJournalVoucherModule,
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
    ArticleAddModule,
    ArticleEditModule,
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [EditInvoiceTrOutComponent],
  exports: [EditInvoiceTrOutComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditInvoiceTrOutModule {}
