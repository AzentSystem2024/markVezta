import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule, DxDataGridComponent } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayrollVerifyComponent } from '../payroll-verify/payroll-verify.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-payroll-view',
  templateUrl: './payroll-view.component.html',
  styleUrls: ['./payroll-view.component.scss']
})
export class PayrollViewComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() payroll: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  salaryHead : any;
  needSummaryUpdate: boolean = false;
  payRollData: any = {
    ID:'',
    EMP_ID:"",
    DAYS:"",
    BASIC_PAY:"",
    NOT_HOURS:"",
    NOT_AMOUNT:"",
    DEDUCTIONS:"",
    GROSS:"",
    ADVANCE:"",
    NET_AMOUNT:"",
    PROVISION_LOS:"",
    PROVISION_EOS:"",
    EMP_ALLOWANCE:"",
    HOT_HOURS:"",
    HOT_AMOUNT:"",
    PAY_DETAILS:[{
    PAY_DETAIL_ID:"",
    HEAD_ID:"",
    GROSS:"",
    DEDUCT:"",
    REMARKS:""
  }],
  REMARKS: ''
  };
  salaryHeadList: any;
  constructor(private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(){
    this.getSalaryHeadList();
  }

   ngOnChanges(changes: SimpleChanges) {
    if (changes['payroll'] && changes['payroll'].currentValue) {
      const incomingPayroll = changes['payroll'].currentValue;
      console.log('Received payroll:', incomingPayroll);
      console.log('NET_AMOUNT:', incomingPayroll.NET_AMOUNT); // Ensure this is available

      // Update the payRollData object with the incoming payroll
      this.payRollData = {
        ...incomingPayroll,
        PAY_DETAILS: incomingPayroll.DATA.map((detail, index) => ({
          ...detail,
          SNO: index + 1,
          GROSS_AMOUNT: parseFloat(detail.GROSS_AMOUNT) || 0,
          DEDUCTION_AMOUNT: parseFloat(detail.DEDUCTION_AMOUNT) || 0,
        })),
      };
      console.log(this.payRollData, 'PAYROLLDATAAAAAAA');
      this.calculateGross();
      console.log(this.payRollData.NET_AMOUNT, 'PAYROLLDATA');
    }
  }

  // getSalaryHeadDropdown() {
  //   this.dataService
  //     .getDropdownData('SALARY_HEAD')
  //     .subscribe((response: any) => {
  //       this.salaryHeadList = response;
  //       console.log(this.salaryHeadList, 'SALARYHEADLIST');
  //     });
  // }

  onRowUpdating(event: any) {
    // Log old and new data
    console.log('Old Data:', event.oldData);
    console.log('New Data:', event.newData);

    // Access the updated GROSS value
    const updatedGross = event.newData.GROSS_AMOUNT;
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS_AMOUNT);
    }, 0);

    console.log(totalGross, 'totalGross');
    // Force a refresh of the data grid to update the summary
    this.dataGrid.instance.refresh(); // This ensures that the total is recalculated
  }

  onContentReady(event: any) {
    event.component.updateDimensions();
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS_AMOUNT);
    }, 0);

    const totalDeduct = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.DEDUCTION_AMOUNT);
    }, 0);
    this.payRollData.GROSS_AMOUNT = totalGross;
    this.payRollData.DEDUCTION_AMOUNT = totalDeduct;
    console.log(totalGross, 'totalGrosssssssssssssssss');
    this.payRollData.DEDUCTIONS = totalDeduct;

    this.payRollData.NET_AMOUNT = totalGross - totalDeduct;
  }

  calculateGross() {
    // Assuming payRollData contains the employee's data
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS_AMOUNT);
    }, 0);

    const totalNetAmount = this.payRollData.PAY_DETAILS.reduce(
      (sum, detail) => {
        return sum + parseFloat(detail.NET_AMOUNT);
      },
      0
    );

    // Now assign the calculated GROSS to the payRollData object
    this.payRollData.GROSS_AMOUNT = totalGross.toFixed(2);

    // Log the calculated values
    console.log(this.payRollData.GROSS_AMOUNT, 'NEW GROSS');
    console.log(totalNetAmount, 'TOTAL NET_AMOUNT');

    // Trigger change detection manually if the grid isn't updating
    this.cdr.detectChanges(); // Inject ChangeDetectorRef in the constructor

    // Refresh grid to reflect the change
    this.dataGrid.instance.refresh();
  }

  customFormat(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }

  onSummaryCalculated(e) {
    if (e.name === 'netAmount') {
      // Calculate NET_AMOUNT dynamically
      const totalGross = e.component
        .getDataSource()
        .items()
        .reduce((sum, item) => {
          return sum + parseFloat(item.GROSS_AMOUNT || 0);
        }, 0);

      const totalDeduct = e.component
        .getDataSource()
        .items()
        .reduce((sum, item) => {
          return sum + parseFloat(item.DEDUCTION_AMOUNT || 0);
        }, 0);

      const netAmount = totalGross - totalDeduct;

      // Assign calculated value to NET_TOTAL summary
      e.totalValue = netAmount;
      e.displayValue = `NET_TOTAL: ${netAmount.toFixed(2)}`;
    }
  }

  onRowInserted(e: any) {
    console.log('Row inserted:', e.data);
    // Add your logic here for handling inserted rows
  }

  onRowRemoved(e: any) {
    console.log('Row removed:', e.data);
    // Add your logic here for handling removed rows
  }

  addNewRow() {
    const hasEmptyRow = this.payRollData.PAY_DETAILS.some(
      (row) =>
        !row.HEAD_NAME && row.GROSS_AMOUNT === 0 && row.DEDUCTION_AMOUNT === 0
    );

    if (hasEmptyRow) return;

    const newRow = {
      HEAD_NAME: '',
      GROSS_AMOUNT: 0,
      DEDUCTION_AMOUNT: 0,
    };

    this.payRollData.PAY_DETAILS = [...this.payRollData.PAY_DETAILS, newRow];
  }

  getSalaryHeadList() {
    this.dataService.get_salary_head_list().subscribe((response: any) => {
      this.salaryHeadList = response.Data;
    });
  }
  
  
  onEditorPreparing(e: any) {
    if (
      e.parentType === 'dataRow' &&
      (e.dataField === 'GROSS_AMOUNT' || e.dataField === 'DEDUCTION_AMOUNT')
    ) {
      const headId = e.row?.data?.HEAD_ID;
      const selectedHead = this.salaryHeadList.find(
        (head: any) => head.ID === headId
      );

      if (selectedHead) {
        const headType = selectedHead.HEAD_TYPE;

        // If HEAD_TYPE is 1: allow only GROSS_AMOUNT
        // If HEAD_TYPE is 2 or 3: allow only DEDUCTION_AMOUNT
        if (headType === 1 && e.dataField === 'DEDUCTION_AMOUNT') {
          e.editorOptions.disabled = true;
        } else if (
          (headType === 2 || headType === 3) &&
          e.dataField === 'GROSS_AMOUNT'
        ) {
          e.editorOptions.disabled = true;
        } else {
          e.editorOptions.disabled = false;
        }
      }
    }
  }


  handleClose() {
    // console.log('CLOSED');

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
  ],
  providers: [],
  declarations: [PayrollViewComponent],
  exports: [PayrollViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollViewModule {}