import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule, DxDataGridComponent, DxValidationGroupComponent, DxTextBoxComponent, DxSelectBoxComponent, DxNumberBoxComponent, DxButtonComponent } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { EditCreditNoteComponent } from '../edit-credit-note/edit-credit-note.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-view-credit-note',
  templateUrl: './view-credit-note.component.html',
  styleUrls: ['./view-credit-note.component.scss']
})
export class ViewCreditNoteComponent {
  @Output() popupClosed = new EventEmitter<void>();
@Input() creditFormData: any;
  // @ViewChild(DxDataGridComponent, { static: true })
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent; 

  popupVisible = false;
 readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  creditNoteList: any;
  ledgerList: any;
  customersList: any;
  dropdownOpened: boolean = false;
customerType: 'Unit' | 'Dealer' = 'Unit'; 
  distributorList: any;
  selectedDistributorId: any;
  companyList: any;
  selectedCompanyId: any;
  invoiceNo: string = '';
narration: string = '';
transDate: Date | string | number | null = null;
dueAmount: number = 0;
itemsGridData: any[] = [];
noteDetails: any[] = [];
newRowAdded :boolean = false
  newRowIndex: any;
  sessionData: any;
  selected_vat_id: any;

  constructor(private dataService: DataService){}

  ngOnInit(){
console.log(this.creditFormData,"NGONINIT")
this.getCompanyListDropdown();
this.getLedgerCodeDropdown()
this.sessionData_tax()
  }


ngOnChanges(changes: SimpleChanges): void {
  if (changes['creditFormData'] && this.creditFormData?.length) {
    const data = this.creditFormData[0];
this.transDate = new Date(data.TRANS_DATE);
console.log(this.creditFormData[0],"DATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    this.getLedgerCodeDropdown().then(() => {
      this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
        const match = this.ledgerList.find((l: any) => l.HeadID === item.HEAD_ID);
        return {
          ...item,
          ledgerCode: match?.HeadCode || '',
          ledgerName: match?.HeadName || '',
          particulars: item.REMARKS || '',
          Amount: item.AMOUNT || '',
gstAmount: item.GST_AMOUNT || ''
        };
      });
    });
this.selectedDistributorId = this.creditFormData[0].DISTRIBUTOR_ID;
    //   console.log(this.selectedDistributorId,"===========================================")
    // if (data.UNIT_ID && data.DISTRIBUTOR_ID === 0) {
    //   this.customerType = 'Unit';
    //   this.getCompanyListDropdown(data.UNIT_ID, undefined);
    // } else if (data.DISTRIBUTOR_ID && data.UNIT_ID === 0) {
    //   this.customerType = 'Dealer';
    //   this.getCompanyListDropdown(undefined, data.DISTRIBUTOR_ID);
    // }
  }
}


      sessionData_tax(){
        // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'" 
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
  }



  getCompanyListDropdown(selectedDistributorId?: number): void {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;

      // ✅ Use ChangeDetectorRef to ensure UI update
      // this.cdr.detectChanges();

      if (selectedDistributorId) {
        const match = this.distributorList.find(
          (d: any) => d.ID === selectedDistributorId
        );

        // ✅ Match must exist to bind to select box
        if (match) {
          this.selectedDistributorId = match.ID;

          // ✅ Optionally focus select box if needed
          // setTimeout(() => {
          //   this.distributorRef?.instance?.focus?.();
          // }, 0);
        } else {
          this.selectedDistributorId = null;
        }
      }
    });
  }




    formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }




handleCustomerType(response: any): void {
  const data = response?.Data?.[0];
  if (!data) return;

  if (data.UNIT_ID && data.UNIT_ID !== 0) {
    this.customerType = 'Unit';
    this.selectedCompanyId = data.UNIT_ID;
    this.selectedDistributorId = null; // Clear distributor
  } else if (data.DISTRIBUTOR_ID && data.DISTRIBUTOR_ID !== 0) {
    this.customerType = 'Dealer';
    this.selectedDistributorId = data.DISTRIBUTOR_ID;
    this.selectedCompanyId = null; // Clear unit
  }
}

handleCustomerData(response: any): void {
  const data = response?.Data?.[0];
  if (!data) return;

  // UNIT case
  if (data.UNIT_ID && data.DISTRIBUTOR_ID === 0) {
    this.customerType = 'Unit';
    this.selectedCompanyId = data.UNIT_ID;
    this.selectedDistributorId = null;
  }
  // DISTRIBUTOR case
  else if (data.DISTRIBUTOR_ID && data.UNIT_ID === 0) {
    this.customerType = 'Dealer';
    this.selectedDistributorId = data.DISTRIBUTOR_ID;
    this.selectedCompanyId = null;
  }
}







onDueAmountKeyDown(event: any): void {
  if (event.event?.key === 'Enter') {
    setTimeout(() => {
      // Focus grid's first editable cell — SL_NO (first row, first col)
      this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
    }, 0);
  }
}



getLedgerCodeDropdown(): Promise<void> {
  return new Promise((resolve) => {
    this.dataService.getAccountHeadList().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log('Ledger List Loaded:', this.ledgerList);
      resolve();
    });
  });
}





onCompanySelected(event: any): void {
  const grid = this.itemsGridRef?.instance;
const selectedId = event.value;
  this.creditFormData.UNIT_ID = selectedId
  if (grid) {
    const editRowIndex = grid.getVisibleRows().findIndex((row: any) => row.isEditing);
    if (editRowIndex !== -1) {
      grid.saveEditData(); // Save new row before changing company
    }
  }

  this.selectedCompanyId = event.value;
}


onDistributorSelected(event: any): void {
  const grid = this.itemsGridRef?.instance;
const selectedId = event.value;
  this.creditFormData.DISTRIBUTOR_ID = selectedId
  if (grid) {
    const editRowIndex = grid.getVisibleRows().findIndex((row: any) => row.isEditing);
    if (editRowIndex !== -1) {
      grid.saveEditData(); // Save new row before changing distributor
    }
  }

  this.selectedDistributorId = event.value;
  console.log(this.selectedDistributorId,"SELECTEDDISTRIBUTORIDDDDDDDDD")
}

onNarrationKeyDown(event: any){}


onInitNewRow(e: any): void {
  this.newRowIndex = e.component.getRowIndexByKey(e.key);
}
// onCompanySelected(event: any){}

get netAmount(): number {
  const details = this.creditFormData?.NOTE_DETAIL || [];
  let totalAmount = 0;
  let totalGST = 0;

  details.forEach((item: any) => {
    totalAmount += parseFloat(item.Amount || 0);
    totalGST += parseFloat(item.gstAmount || 0);
  });

  return totalAmount + totalGST;
}

onApprovedChanged(e: any) {
  console.log('Checkbox value changed:', e.value);
  this.creditFormData.IS_APPROVED = e.value;
}






resetCreditNoteForm(){
    this.creditFormData = {
    TRANS_TYPE:37,
    COMPANY_ID:1,
    STORE_ID: 1,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    PARTY_ID: 1,
    PARTY_NAME: '',
    NARRATION: '',
    INVOICE_ID:0,
    INVOICE_NO: '',
    NOTE_DETAIL: [{
      SL_NO: '',
      HEAD_ID: '',
      AMOUNT: '',
      GST_AMOUNT: '',
      REMARKS:''
    }]
  }
}

cancel(){
      this.popupClosed.emit()
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [ViewCreditNoteComponent],
  exports: [ViewCreditNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewCreditNoteModule {}