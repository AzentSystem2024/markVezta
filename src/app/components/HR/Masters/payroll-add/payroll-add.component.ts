import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
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
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionAddComponent } from '../pay-revision-add/pay-revision-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { OnChanges, SimpleChanges } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-payroll-add',
  templateUrl: './payroll-add.component.html',
  styleUrls: ['./payroll-add.component.scss'],
})
export class PayrollAddComponent implements OnInit, OnChanges {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() selectedMonth: string;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  timesheetList: any;

  payRollData: {
    COMPANY_ID: string;
    TS_ID: string;
    USER_ID: Number;
  } = {
      COMPANY_ID: '',
      TS_ID: '',
      USER_ID: 0,
    };
  companyID: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  userID: any;

  constructor(
    private dataSerivice: DataService,
    private router: Router,
  ) { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedMonth'] && this.selectedMonth) {
      this.setSessionData();
      this.getTimesheetList();
    }
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.userID = menuResponse.USER_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    // this.payRollData.SAL_MONTH = this.selectedMonth;
    // this.getTimesheetList();
  }

  setSessionData() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.userID = menuResponse.USER_ID;

    console.log(this.companyID, 'COMPANY ID SET');
  }

  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'flag-open'; // White or gray
      case 'Verified':
        return 'flag-verified'; // Orange
      case 'Approved':
        return 'flag-approved'; // Green
      default:
        return '';
    }
  }

  getTimesheetList() {
    if (!this.selectedMonth) {
      console.warn('No month selected.');
      return;
    }
    console.log(this.companyID, '======COMPANYID====');
    const payload = {
      CompanyId: this.companyID,
      Month: new Date(this.selectedMonth)
        .toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(/\s/g, ''),
    };
    this.dataSerivice
      .getTimesheetListForPayroll(payload)
      .subscribe((response: any) => {
        this.timesheetList = response.data;
      });
  }

  generatePayroll() {
    const selectedRows = this.dataGrid.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify(
        {
          message: 'Please select at least one row to generate payroll.',
          position: { at: 'top center', my: 'top center' },
        },
        'error',
      );
      return;
    }

    // const userId = Number(sessionStorage.getItem('USER_ID'));

    let successCount = 0;
    let errorCount = 0;

    selectedRows.forEach((row) => {
      const payload = {
        COMPANY_ID: this.companyID,
        TS_ID: row.ID,
        USER_ID: this.userID,
      };

      this.dataSerivice.generatePayroll(payload).subscribe({
        next: (response: any) => {
          // console.log('API RESPONSE:', response);
          if (response.flag === 1) {
            notify(
              {
                message:
                  'Payroll generated successfully for selected employees.',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.popupClosed.emit();

            // successCount++;
          }
          // else {
          //   errorCount++;
          // }

          // Show message only after last API call
          // if (successCount + errorCount === selectedRows.length) {
          //   if (errorCount === 0) {

          //   }
          //   // else {
          //   //   notify(
          //   //     {
          //   //       message: `Payroll generated for ${successCount} rows. Failed for ${errorCount} rows.`,
          //   //       position: { at: 'top center', my: 'top center' },
          //   //     },
          //   //     'warning',
          //   //   );
          //   // }
          // }
        },
        error: () => {
          errorCount++;
        },
      });
    });
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
  ],
  providers: [],
  declarations: [PayrollAddComponent],
  exports: [PayrollAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollAddModule { }
