import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormsModule } from '@angular/forms';
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
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';

import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { AddSalaryPaymentModule } from 'src/app/components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';
import { ViewSalaryAdvanceModule } from 'src/app/components/HR/Masters/view-salary-advance/view-salary-advance.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-bank-reconciliation-add',
  templateUrl: './bank-reconciliation-add.component.html',
  styleUrls: ['./bank-reconciliation-add.component.scss'],
})
export class BankReconciliationAddComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid: any;
  BankReconciliationdatasource: any[] = [];
  closingBalance: any;

  company_list: any[] = [];
  selectedCompanyId: any;
  company_id: any;
  HEAD_ID_LIST: any[] = [];
  fin_id: any[] = [];
  ledgerSummaryData: any = [];
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;

  selected_Head_Id: any;
  selected_fin_id: any;
  selectedJournalVoucher: any;
  formatted_from_date: string;
  formatted_To_date: string;
  editLedgerPopup: boolean = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  showFilterRow = true;
  selectedInvoice: any;

  selectedReceipt: any;
  selected_Company_id: any;
  isReadOnlyReceipt: boolean = true;
  isEditReceipt: boolean = false;
  isReadOnlyPayment: boolean = true;

  isEditReadOnly: boolean = true;
  selected_Data: any;
  isEditPopUp: boolean = false;
  loadingInvoice = false;
  popupReady = false;
  Bank: any;
  selectedRows: any[] = [];
  totalDebit = 0;
  totalCredit = 0;
  remainingDebit = 0;
  remainingCredit = 0;
  runningbalance: any;
  totalDr = 0;
  totalCr = 0;

  BankRecData: any = {
    TRANS_ID: '',
    VOUCHER_NO: '',
    TRANS_DATE: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    PARTY_NAME: '',
    DR_AMOUNT: 0,
    CR_AMOUNT: 0,
    RUNNING_BALANCE: 0,
  };
  selectedBankName: any;
  selectedBankId: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.sesstion_Details();
    this.get_Bank_dropdown();

    // initial remaining = totals
    this.remainingDebit = this.totalDebit;
    this.remainingCredit = this.totalCredit;
  }

  ngOnInit() {

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }

    // If you want to format or adjust it, you can do that here
    this.selected_To_date = new Date();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  get_Bank_dropdown() {
    this.dataService
      .Bank_Dropdown(this.selected_Company_id)
      .subscribe((res: any) => {
        this.Bank = res;
      });
  }

  calculateTotals() {
    this.totalDebit = this.BankReconciliationdatasource.reduce(
      (sum, item) => sum + (Number(item.DR_AMOUNT) || 0),
      0,
    );
    this.totalCredit = this.BankReconciliationdatasource.reduce(
      (sum, item) => sum + (Number(item.CR_AMOUNT) || 0),
      0,
    );
    //  this.closingBalance = this.runningbalance -(this.remainingDebit + this.remainingCredit);
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;

    const selectedDebitSum = this.selectedRows.reduce(
      (s: number, r: any) => s + (Number(r.DR_AMOUNT) || 0),
      0,
    );
    const selectedCreditSum = this.selectedRows.reduce(
      (s: number, r: any) => s + (Number(r.CR_AMOUNT) || 0),
      0,
    );

    // remaining = original totals - selected sums
    this.remainingDebit = this.totalDebit - selectedDebitSum;
    this.remainingCredit = this.totalCredit - selectedCreditSum;

    this.closingBalance =
      this.runningbalance - (this.remainingDebit + this.remainingCredit);
  }
  summaryColumnsData = {
    calculateCustomSummary: (options: any) => {
      if (options.summaryProcess === 'finalize') {
        const items = this.BankReconciliationdatasource || [];

        this.totalDr = items.reduce((sum, item) => {
          const val = parseFloat(
            String(item?.DR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        this.totalCr = items.reduce((sum, item) => {
          const val = parseFloat(
            String(item?.CR_AMOUNT || '0')
              .replace(/,/g, '')
              .trim(),
          );
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        this.closingBalance =
          this.runningbalance - (this.remainingDebit + this.remainingCredit);
      }
    },
  };

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onBankChange(e: any) {
    const selectedBank = e.value; // selected 'ID' value (because of valueExpr)
    const selectedBankDetails = e.component.option('selectedItem'); // full object

    // Example: You can store or use the selected bank
    this.selectedBankId = selectedBank;
    this.selectedBankName = selectedBankDetails?.DESCRIPTION;
  }

  Getdata() {
    const payload = {
      HEAD_ID: this.selectedBankId,
      DATE_TO: this.selected_To_date,
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.BankReconciliation_List(payload).subscribe((res: any) => {
      this.BankReconciliationdatasource = res.Data;
      this.runningbalance = res.Data[0].RUNNING_BALANCE;
      this.calculateTotals();

      this.remainingDebit = this.totalDebit;
      this.remainingCredit = this.totalCredit;
      this.closingBalance =
        this.runningbalance - (this.remainingDebit + this.remainingCredit);
    });
  }

  Savedata() {
    // ✅ Check if any rows are selected
    if (!this.selectedRows || this.selectedRows.length === 0) {
      notify(
        {
          message: 'Please select at least one row',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    const payload = {
      RECON_DATE: new Date(),
      ReconciliationList: this.selectedRows.map((row: any) => ({
        TRANS_ID: row.TRANS_ID,
      })),
    };

    this.dataService
      .Insert_BankReconciliation(payload)
      .subscribe((res: any) => {
        if (res.message === 'Bank reconciliation saved successfully.') {
          notify(
            {
              message: 'Inserted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.resetPage();
        }
      });
  }

  resetPage() {
    // Clear selected rows
    this.selectedRows = [];

    // Reset calculated values (if you use them)
    this.totalDebit = 0;
    this.totalCredit = 0;
    this.remainingDebit = 0;
    this.remainingCredit = 0;
    this.runningbalance = 0;
    this.closingBalance = 0;

    // Reset date to current date
    this.selected_To_date = new Date();

    this.selectedBankId = '';
    this.BankReconciliationdatasource = [];

    // ✅ Reset BankRecData object
    this.BankRecData = {
      TRANS_ID: '',
      VOUCHER_NO: '',
      TRANS_DATE: '',
      CHEQUE_NO: '',
      CHEQUE_DATE: '',
      PARTY_NAME: '',
      DR_AMOUNT: 0,
      CR_AMOUNT: 0,
      RUNNING_BALANCE: 0,
    };

    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.clearSelection();
      // If you've just updated the datasource variable, refresh will re-render rows
      this.dataGrid.instance.refresh();
    }

    // If you have a form or filters, reset them here
    // this.myForm.reset(); (if using Reactive Forms)
  }

  formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    AddMiscellaneousPaymentModule,
    AddSalaryPaymentModule,
    ViewSalaryAdvanceModule,
  ],
  providers: [],
  declarations: [BankReconciliationAddComponent],
  exports: [BankReconciliationAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BankReconciliationAddModule {}
