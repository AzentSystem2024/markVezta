import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-payroll-verify',
  templateUrl: './payroll-verify.component.html',
  styleUrls: ['./payroll-verify.component.scss'],
})
export class PayrollVerifyComponent {
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
  constructor(private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['payroll'] && changes['payroll'].currentValue) {
      const incomingPayroll = changes['payroll'].currentValue;
      console.log('Received payroll:', incomingPayroll);
      console.log('NET_AMOUNT:', incomingPayroll.NET_AMOUNT); // Ensure this is available
  
      // Update the payRollData object with the incoming payroll
      this.payRollData = {
        ...incomingPayroll,
        PAY_DETAILS: incomingPayroll.PAY_DETAILS.map(detail => ({
          ...detail,
          GROSS: parseFloat(detail.GROSS) || 0,
          DEDUCT: parseFloat(detail.DEDUCT) || 0
        }))
      };
      
  
      this.calculateGross();
      console.log(this.payRollData.NET_AMOUNT, "PAYROLLDATA");
    }
  }

  onRowUpdating(event: any) {
    // Log old and new data
    console.log('Old Data:', event.oldData);
    console.log('New Data:', event.newData);
  
    // Access the updated GROSS value
    const updatedGross = event.newData.GROSS;
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS);
    }, 0);

    console.log(totalGross, "totalGross");
    // Force a refresh of the data grid to update the summary
    this.dataGrid.instance.refresh();  // This ensures that the total is recalculated
  }
  
  onContentReady(event: any){
    event.component.updateDimensions();
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS);
    }, 0);

    const totalDeduct = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.DEDUCT);
    }, 0);
    this.payRollData.GROSS = totalGross
    this.payRollData.DEDUCT = totalDeduct
    console.log(totalGross, "totalGrosssssssssssssssss");
this.payRollData.DEDUCTIONS = totalDeduct
    

    this.payRollData.NET_AMOUNT = totalGross - totalDeduct;
   
  }
  
  
  calculateGross() {
    // Assuming payRollData contains the employee's data
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS);
    }, 0);


  
    const totalNetAmount = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.NET_AMOUNT);
    }, 0);
  
    // Now assign the calculated GROSS to the payRollData object
    this.payRollData.GROSS = totalGross.toFixed(2);
  
    // Log the calculated values
    console.log(this.payRollData.GROSS, "NEW GROSS");
    console.log(totalNetAmount, "TOTAL NET_AMOUNT");
  
    // Trigger change detection manually if the grid isn't updating
    this.cdr.detectChanges();  // Inject ChangeDetectorRef in the constructor
    
    // Refresh grid to reflect the change
    this.dataGrid.instance.refresh();
  }

  customFormat(value: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'decimal', 
      maximumFractionDigits: 2, 
      minimumFractionDigits: 2 
    }).format(value);
  }
  
  onSummaryCalculated(e) {
    if (e.name === 'netAmount') {
      // Calculate NET_AMOUNT dynamically
      const totalGross = e.component.getDataSource().items().reduce((sum, item) => {
        return sum + parseFloat(item.GROSS || 0);
      }, 0);
  
      const totalDeduct = e.component.getDataSource().items().reduce((sum, item) => {
        return sum + parseFloat(item.DEDUCT || 0);
      }, 0);
  
      const netAmount = totalGross - totalDeduct;
  
      // Assign calculated value to NET_TOTAL summary
      e.totalValue = netAmount;
      e.displayValue = `NET_TOTAL: ${netAmount.toFixed(2)}`;
    }
  }
  
  

  verify(){
    
const formatValue = (value) => {
    // Ensure the value is a string before removing commas
    if (typeof value === 'string') {
      return parseFloat(value.replace(/,/g, ''));
    } else if (value != null) {
      // If it's a number, just return it as is
      return value;
    }
    return 0; // In case value is null or undefined
  };
    const payRollData = {
    ID: this.payRollData.ID,
    EMP_ID: this.payRollData.EMP_ID,
    DAYS: this.payRollData.DAYS,
    BASIC_PAY: formatValue(this.payRollData.BASIC_PAY),
    NOT_HOURS: this.payRollData.NOT_HOURS,
    NOT_AMOUNT: formatValue(this.payRollData.NOT_AMOUNT),
    DEDUCTIONS: formatValue(this.payRollData.DEDUCTIONS),
    GROSS: formatValue(this.payRollData.GROSS),
    ADVANCE: formatValue(this.payRollData.ADVANCE),
    NET_AMOUNT: formatValue(this.payRollData.NET_AMOUNT),
    PROVISION_LOS: formatValue(this.payRollData.PROVISION_LOS),
    PROVISION_EOS: formatValue(this.payRollData.PROVISION_EOS),
    EMP_ALLOWANCE: formatValue(this.payRollData.EMP_ALLOWANCE),
    HOT_HOURS: this.payRollData.HOT_HOURS,
    HOT_AMOUNT: formatValue(this.payRollData.HOT_AMOUNT),
    PAY_DETAILS: this.payRollData.PAY_DETAILS,
    REMARKS: this.payRollData.REMARKS
  };
this.dataService.verifyPayroll(payRollData).subscribe((response: any) => {
  if (response.flag == "1") {
    notify(
      {
        message: 'Payroll Verified Successfully',
        position: { at: 'top center', my: 'top center' },
      },
      'success'
    );
    this.popupClosed.emit();
  } else {
    notify(
      {
        message: 'Payroll Not Verified',
        position: { at: 'top right', my: 'top right' },
      },
      'error'
    );
  }
})
  }

  handleClose() {
    // console.log('CLOSED');

    this.popupClosed.emit();
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'DEDUCT' && e.row?.data?.HEAD_TYPE === 1) {
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.readOnly = true;
    }
    else if (e.dataField === 'GROSS' && e.row?.data?.HEAD_TYPE === 2 || e.row?.data?.HEAD_TYPE === 3 ) {
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.readOnly = true;
    }
    else{
      e.cancel=false;
    }
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
  declarations: [PayrollVerifyComponent],
  exports: [PayrollVerifyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollVerifyModule {}
