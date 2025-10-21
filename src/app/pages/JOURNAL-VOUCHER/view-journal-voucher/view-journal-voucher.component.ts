import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule, DxBoxModule, DxDataGridComponent } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { EditJournalVoucherComponent } from '../edit-journal-voucher/edit-journal-voucher.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog'
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-view-journal-voucher',
  templateUrl: './view-journal-voucher.component.html',
  styleUrls: ['./view-journal-voucher.component.scss']
})
export class ViewJournalVoucherComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() journalVoucherFormData: any = {
  TRANS_ID: 0,
  TRANS_DATE: new Date(),
  VOUCHER_NO: '',
  PARTY_NAME: '',
  REFERENCE_NO: '',
  TRANS_TYPE: 4,
  NARRATION: '',
  USER_ID: 1,
  DETAILS: []
};
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  ledgerList: any;
  ledgerCodeEditorOptions: any = {};
ledgerNameEditorOptions: any = {};
isReadOnly = false;
  Company_list: any=[];

  constructor(private dataService: DataService){
    this.Deparment_Drop_down()
  }

  ngOnInit(){
    this.getLedgerCodeDropdown();
    this.Deparment_Drop_down()
  }

    Deparment_Drop_down(){
    this.dataService.Department_Dropdown().subscribe((res:any)=>{
      console.log(res,'========================department data=========================')

      this.Company_list=res
    })
  }
 ngOnChanges(changes: SimpleChanges) {
    if (
      changes['journalVoucherFormData'] &&
      changes['journalVoucherFormData'].currentValue
    ) {
      const incomingData = changes['journalVoucherFormData'].currentValue;
      const transformedDetails = (incomingData.DETAILS || []).map(
        (item: any) => {
          const matchedLedger = this.ledgerList.find(
            (l: any) =>
              l.HEAD_CODE === item.LEDGER_CODE ||
              l.HEAD_NAME === item.LEDGER_NAME
          );

          return {
            billNo: item.BILL_NO ?? '',
            ledgerCode: matchedLedger?.HEAD_CODE ?? item.LEDGER_CODE ?? '',
            ledgerName: matchedLedger?.HEAD_NAME ?? item.LEDGER_NAME ?? '',
            particulars: item.PARTICULARS ?? '',
            debitAmount: item.DEBIT_AMOUNT ?? '',
            creditAmount: item.CREDIT_AMOUNT ?? '',
          };
        }
      );

      const userDataString = localStorage.getItem('userData');
      let defaultCompanyId = '';
      let defaultUserId = '';
      let defaultFinId = '';

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        defaultCompanyId = userData?.SELECTED_COMPANY?.COMPANY_ID || '';
        defaultUserId = userData?.USER_ID || '';
        defaultFinId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || '';
      }

      this.journalVoucherFormData = {
        COMPANY_ID: incomingData.COMPANY_ID ?? defaultCompanyId,
        FIN_ID: incomingData.FIN_ID ?? defaultFinId,
        USER_ID: incomingData.USER_ID ?? defaultUserId,
        ...incomingData,
        DETAILS: transformedDetails,
      };

      this.isReadOnly = !!this.journalVoucherFormData.IS_APPROVED;
      if (this.dataGrid?.instance) {
        this.dataGrid.instance.refresh();
      }
    }
  }
// ngOnChanges(changes: SimpleChanges) {
//   if (changes['journalVoucherFormData'] && changes['journalVoucherFormData'].currentValue) {
//     const incomingData = changes['journalVoucherFormData'].currentValue;
// const transformedDetails = (incomingData.DETAILS || []).map((item: any) => {
//   const matchedLedger = this.ledgerList.find(
//     (l: any) =>
//       l.HEAD_CODE === item.LEDGER_CODE || l.HEAD_NAME === item.LEDGER_NAME
//   );

//   return {
//     billNo: item.BILL_NO ?? '',
//     HEAD_CODE: matchedLedger?.HEAD_CODE ?? '',  // match column name
//     HEAD_NAME: matchedLedger?.HEAD_NAME ?? '',  // match column name
//     particulars: item.PARTICULARS ?? '',
//     debitAmount: item.DEBIT_AMOUNT ?? '',
//     creditAmount: item.CREDIT_AMOUNT ?? ''
//   };
// });


//     this.journalVoucherFormData = {
//       ...this.journalVoucherFormData, // default values
//       ...incomingData,
//       DETAILS: transformedDetails
//     };
// this.isReadOnly = !!this.journalVoucherFormData.IS_APPROVED; 
//     if (this.dataGrid?.instance) {
//       this.dataGrid.instance.refresh();
//     }
//   }
// }


formatDateToDDMMYYYY(date: any): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

getLedgerCodeDropdown() {
  this.dataService.getAccountHeadList().subscribe((response: any) => {
    this.ledgerList = response.Data;

    // Only transform if form data already loaded
    if (this.journalVoucherFormData?.DETAILS?.length) {
      this.journalVoucherFormData.DETAILS = this.journalVoucherFormData.DETAILS.map((item: any) => {
        const matchedLedger = this.ledgerList.find(
          (l: any) => l.HEAD_CODE === item.LEDGER_CODE
        );

        return {
          billNo: item.BILL_NO ?? '',
          ledgerCode: item.LEDGER_CODE ?? '',
          ledgerName: item.LEDGER_NAME?.trim() !== ''
            ? item.LEDGER_NAME
            : matchedLedger?.HEAD_NAME ?? '',
          particulars: item.PARTICULARS ?? '',
          debitAmount: item.DEBIT_AMOUNT ?? '',
          creditAmount: item.CREDIT_AMOUNT ?? ''
        };
      });
    }
  });
}





cancel(){
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
    DxBoxModule,
  ],
  providers: [],
  declarations: [ViewJournalVoucherComponent],
  exports: [ViewJournalVoucherComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewJournalVoucherModule {}