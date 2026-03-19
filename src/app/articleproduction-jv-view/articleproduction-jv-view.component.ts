import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
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
import { InvoiceTrOutAddModule } from '../pages/INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { ViewInvoiceModule } from '../pages/INVOICE/view-invoice/view-invoice.component';
import { DataService } from '../services';

@Component({
  selector: 'app-articleproduction-jv-view',
  templateUrl: './articleproduction-jv-view.component.html',
  styleUrls: ['./articleproduction-jv-view.component.scss'],
})
export class ArticleproductionJvViewComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isPopupVisible: boolean = false;
  items: any[] = [];
  // itemsForInventory: any[] = [];
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;
  sessionData: any;
  selected_vat_id: any;
  selectedCompany: any;
  companyState: any;
  GST: any;
  productionFormData: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.isEditDataAvailable();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;

    this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
    this.GST = this.sessionData.GeneralSettings.GST_PERC;
    this.productionFormData.FIN_ID = this.sessionData.FINANCIAL_YEARS.FIN_ID;
    this.productionFormData.COMPANY_ID =
      this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) {
      return;
    }

    // Header is OBJECT
    const header = this.EditingResponseData.Header;
    const articles = this.EditingResponseData.ProducedArticles;
    const rowMaterials = this.EditingResponseData.RawMaterials;
    this.productionFormData = {
      //HEADER DATA
      PRODUCTION_ID: header.PRODUCTION_ID,
      PROD_NO: header.PROD_NO,
      PROD_DATE: new Date(header.PROD_DATE),
      PRODUCT_ID: header.PRODUCT_ID,
      PRODUCED_QTY: header.PRODUCED_QTY,
      TOTAL_COST: header.TOTAL_COST,
      UNIT_COST: header.UNIT_COST,
      ADDL_COST: header.ADDL_COST,
      ADDL_DESCRIPTION: header.ADDL_DESCRIPTION,
      VOUCHER_NO: header.VOUCHER_NO,
      //Footer DATA(RAW MATERIALS)
      ADDL_ADDL_DESCRIPTION: header.ADDL_DESCRIPTION,
      REF_NO: header.REF_NO,
      DESCRIPTION: header.DESCRIPTION,
      COST_PRODUCTION: header.COST_PRODUCTION,
    };

    // Bind grid data
    this.items = this.EditingResponseData.RawMaterials || [];
  }

  onRowRemoved(event: any) {}

  onEditorPreparing(event: any) {}

  Cancel() {
    this.popupClosed.emit();
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
  declarations: [ArticleproductionJvViewComponent],
  exports: [ArticleproductionJvViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArticleproductionJvViewModule {}
