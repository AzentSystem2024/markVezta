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
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { PayrollAddComponent } from '../payroll-add/payroll-add.component';
import { Console } from 'console';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-payroll-edit',
  templateUrl: './payroll-edit.component.html',
  styleUrls: ['./payroll-edit.component.scss'],
})
export class PayrollEditComponent {
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() payroll: any;
  @Input() readOnly: boolean = false;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  salaryHead: any;
  needSummaryUpdate: boolean = false;

  payRollData: any;

  salaryHeadList: any;
  selected_Company_id: any;
  incomingPayroll: any;
  incomingPayrollData: any;
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // this.getSalaryHeadDropdown();
    this.sesstion_Details();
    this.getSalaryHeadList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['payroll'] && changes['payroll'].currentValue) {
      this.incomingPayrollData = changes['payroll'].currentValue;
      console.log(this.incomingPayrollData, 'INCOMINGPAYROLLDATA');
      // Update the payRollData object with the incoming payroll
      this.payRollData = {
        ...this.incomingPayrollData,
        PAY_DETAILS: this.incomingPayrollData.DATA.filter((detail: any) => {
          const gross = parseFloat(detail.GROSS_AMOUNT) || 0;
          const deduct = parseFloat(detail.DEDUCTION_AMOUNT) || 0;

          return gross !== 0 || deduct !== 0; // ✅ keep only meaningful rows
        }).map((detail: any, index: number) => ({
          ...detail,
          SNO: index + 1,
          GROSS_AMOUNT: parseFloat(detail.GROSS_AMOUNT) || 0,
          DEDUCTION_AMOUNT: parseFloat(detail.DEDUCTION_AMOUNT) || 0,
        })),
      };
      // this.calculateGross();
    }
  }

  // getSalaryHeadDropdown() {
  //   this.dataService
  //     .getDropdownData('SALARY_HEAD')
  //     .subscribe((response: any) => {
  //       this.salaryHeadList = response;
  //     });
  // }

  onRowUpdating(event: any) {
    // Log old and new data

    // Access the updated GROSS value
    const updatedGross = event.newData.GROSS_AMOUNT;
    const totalGross = this.payRollData.PAY_DETAILS.reduce((sum, detail) => {
      return sum + parseFloat(detail.GROSS_AMOUNT);
    }, 0);

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
      0,
    );

    // Now assign the calculated GROSS to the payRollData object
    this.payRollData.GROSS_AMOUNT = totalGross.toFixed(2);

    // Log the calculated values

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
    // Add your logic here for handling inserted rows
  }

  onRowRemoved(e: any) {
    // Add your logic here for handling removed rows
  }

  addNewRow() {
    const hasEmptyRow = this.payRollData.PAY_DETAILS.some(
      (row) =>
        !row.HEAD_NAME && row.GROSS_AMOUNT === 0 && row.DEDUCTION_AMOUNT === 0,
    );

    if (hasEmptyRow) return;

    const newRow = {
      SNO: this.payRollData.PAY_DETAILS.length + 1,
      HEAD_NAME: '',
      GROSS_AMOUNT: 0,
      DEDUCTION_AMOUNT: 0,
    };

    this.payRollData.PAY_DETAILS = [...this.payRollData.PAY_DETAILS, newRow];
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getHeadName = (rowData: any) => {
    const match = this.salaryHeadList?.find(
      (h: any) => h.ID === rowData.HEAD_ID,
    );

    return match ? match.HEAD_NAME : rowData.HEAD_NAME;
  };

  getSalaryHeadList() {
    if (!this.selected_Company_id) return;

    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataService
      .get_salary_head_list(payload)
      .subscribe((response: any) => {
        this.salaryHeadList = response.Data;

        if (this.incomingPayrollData) {
          this.payRollData = {
            ...this.incomingPayrollData,
            PAY_DETAILS: this.incomingPayrollData.DATA.filter((detail: any) => {
              const gross = parseFloat(detail.GROSS_AMOUNT) || 0;
              const deduct = parseFloat(detail.DEDUCTION_AMOUNT) || 0;

              return gross !== 0 || deduct !== 0; // ✅ keep only meaningful rows
            }).map((detail: any, index: number) => ({
              ...detail,
              SNO: index + 1,
              GROSS_AMOUNT: parseFloat(detail.GROSS_AMOUNT) || 0,
              DEDUCTION_AMOUNT: parseFloat(detail.DEDUCTION_AMOUNT) || 0,
            })),
          };

          //  ADD THIS
          setTimeout(() => {
            this.dataGrid.instance.refresh();
          });

          this.calculateGross();
        }
      });
  }
  update() {
    const details = this.payRollData?.PAY_DETAILS || [];

    if (details.length === 0) {
      notify(
        {
          message: 'Please enter at least one payroll row before updating.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
      );
      return;
    }
    // Check if all relevant amount fields are empty or zero
    const hasValidAmount = details.some((detail: any) => {
      const head = this.salaryHeadList.find(
        (h: any) => h.ID === detail.HEAD_ID,
      );
      if (!head) return false;

      const rawAmount =
        head.HEAD_TYPE === 1
          ? detail.GROSS_AMOUNT
          : head.HEAD_TYPE === 2 || head.HEAD_TYPE === 3
            ? detail.DEDUCTION_AMOUNT
            : 0;

      const amount =
        typeof rawAmount === 'string'
          ? parseFloat(rawAmount.replace(/,/g, ''))
          : rawAmount;

      return amount && amount !== 0;
    });

    if (!hasValidAmount) {
      notify(
        {
          message:
            'Please enter a valid amount in at least one row before updating.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
      );
      return;
    }
    const formatValue = (value) => {
      if (typeof value === 'string') {
        return parseFloat(value.replace(/,/g, ''));
      } else if (value != null) {
        return value;
      }
      return 0;
    };

    const payload = {
      PAYDETAIL_ID: this.payRollData.PAYDETAIL_ID,
      NET_AMOUNT: this.payRollData.NET_AMOUNT,
      SALARY: this.payRollData.PAY_DETAILS.map((detail: any) => {
        const head = this.salaryHeadList.find(
          (h: any) => h.ID === detail.HEAD_ID,
        );
        let amount = 0;

        if (head) {
          if (head.HEAD_TYPE === 1) {
            amount = formatValue(detail.GROSS_AMOUNT);
          } else if (head.HEAD_TYPE === 2 || head.HEAD_TYPE === 3) {
            amount = formatValue(detail.DEDUCTION_AMOUNT);
          }
        }

        return {
          HEAD_ID: detail.HEAD_ID,
          AMOUNT: amount,
        };
      }),
    };

    this.dataService.updatePayroll(payload).subscribe((response: any) => {
      if (response.flag == '1') {
        notify(
          {
            message: 'Payroll Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.popupClosed.emit();
      } else {
        notify(
          {
            message: 'Payroll Not Updated',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  handleClose() {
    this.popupClosed.emit();
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'HEAD_ID' ||
      e.dataField === 'GROSS_AMOUNT' ||
      e.dataField === 'DEDUCTION_AMOUNT' ||
      e.dataField === 'Amount' ||
      e.dataField === 'GST_PERC' ||
      e.dataField === 'gstAmount'
    ) {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
    if (
      e.parentType === 'dataRow' &&
      (e.dataField === 'GROSS_AMOUNT' || e.dataField === 'DEDUCTION_AMOUNT')
    ) {
      const headId = e.row?.data?.HEAD_ID;
      const selectedHead = this.salaryHeadList.find(
        (head: any) => head.ID === headId,
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
  ],
  providers: [],
  declarations: [PayrollEditComponent],
  exports: [PayrollEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollEditModule {}
