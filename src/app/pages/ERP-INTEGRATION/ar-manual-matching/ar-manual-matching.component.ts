import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxLoadPanelModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services/data.service';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-ar-manual-matching',
  templateUrl: './ar-manual-matching.component.html',
  styleUrls: ['./ar-manual-matching.component.scss'],
})
export class ARManualMatchingComponent implements AfterViewInit {
  @ViewChild('receiptGrid', {
    static: false,
  })
  receiptGrid!: DxDataGridComponent;
  @ViewChild('invoiceGrid', {
    static: false,
  })
  invoiceGrid!: DxDataGridComponent;
  receiptData: any[] = [];
  invoiceData: any[] = [];
  currentReferenceNo: string | null = null;
  isMatchingLoading: boolean = false;

  selectedReceiptAmountTotal: number = 0;
  selectedReceiptRejectedTotal: number = 0;
  selectedInvoiceAmountTotal: number = 0;
  selectedInvoiceReceivedTotal: number = 0;
  selectedInvoiceRejectedTotal: number = 0;

  receiptColumns = [
    {
      dataField: 'ReceiptNo',
      caption: 'Receipt No',
    },
    {
      dataField: 'Date',
      caption: 'Date',
      dataType: 'date',
    },
    {
      dataField: 'Customer',
      caption: 'Customer',
    },
    {
      dataField: 'ReferenceNo',
      caption: 'Reference No',
    },
    {
      dataField: 'ServiceCode',
      caption: 'Service Code',
    },
    {
      dataField: 'Amount',
      caption: 'Received Amount',
      format: '#,##0.00',
    },
    {
      dataField: 'RejectedAmount',
      caption: 'Rejected Amount',
      format: '#,##0.00',
    },
    {
      dataField: 'RejectedReason',
      caption: 'Rejected Reason',
    },
  ];

  invoiceColumns = [
    {
      dataField: 'InvoiceNo',
      caption: 'Invoice No',
      allowEditing: false,
    },
    {
      dataField: 'Date',
      caption: 'Date',
      dataType: 'date',
      allowEditing: false,
    },
    {
      dataField: 'Customer',
      caption: 'Customer',
      allowEditing: false,
    },
    {
      dataField: 'ServiceCode',
      caption: 'Service Code',
      allowEditing: false,
    },
    {
      dataField: 'Amount',
      caption: 'Due Amount',
      format: '#,##0.00',
      allowEditing: false,
    },
    {
      dataField: 'ReceivedAmount',
      caption: 'Received Amount',
      dataType: 'number',
      format: '#,##0.00',
      allowEditing: true,
      validationRules: [
        {
          type: 'custom',
          message: 'Received + Rejected cannot exceed Invoice Amount',
          validationCallback: (options: any) => {
            if (this.currentEditingColumn !== 'ReceivedAmount') return true;
            const data = options.data || {};
            const amount = Number(data.Amount) || 0;
            const rejected = Number(data.RejectedAmount) || 0;
            const received = Number(options.value) || 0;
            return received + rejected <= amount;
          },
        },
      ],
    },
    {
      dataField: 'RejectedAmount',
      caption: 'Rejected Amount',
      dataType: 'number',
      format: '#,##0.00',
      allowEditing: true,
      validationRules: [
        {
          type: 'custom',
          message: 'Received + Rejected cannot exceed Invoice Amount',
          validationCallback: (options: any) => {
            if (this.currentEditingColumn !== 'RejectedAmount') return true;
            const data = options.data || {};
            const amount = Number(data.Amount) || 0;
            const received = Number(data.ReceivedAmount) || 0;
            const rejected = Number(options.value) || 0;
            return received + rejected <= amount;
          },
        },
      ],
    },
  ];

  isFilterOpened: boolean = false;
  currentFilter: string = 'auto';
  showFilterRow: boolean = false;
  currentEditingColumn: string | null = null;

  // Manual Matching Button Options
  MatchingButtonOptions = {
    text: 'Process',
    icon: '',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Match selected receipts with invoices',
    onClick: () => {
      this.performMatching();
    },
    elementAttr: {
      class: 'add-button',
    },
  };

  // Refresh button options
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh Data',
    stylingMode: 'contained',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.fetchData(),
  };

  // Search button options
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: {
      class: 'toolbar-icon-btn',
    },
    onClick: () => this.toggleFilters(),
  };

  constructor(private dataService: DataService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.fetchData();
    });
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.showFilterRow = !this.showFilterRow;
  }

  fetchData() {
    const payload = {
      CompanyID: this.dataService.selected_Company_id,
    };

    if (this.receiptGrid && this.receiptGrid.instance) {
      this.receiptGrid.instance.clearFilter();
      this.receiptGrid.instance.clearSelection();
      this.receiptGrid.instance.beginCustomLoading('Loading...');
    }

    if (this.invoiceGrid && this.invoiceGrid.instance) {
      this.invoiceGrid.instance.clearFilter();
      this.invoiceGrid.instance.clearSelection();
    }

    this.dataService.getARManualMatchingReceiptList(payload).subscribe({
      next: (res: any) => {
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.endCustomLoading();
        }
        if (res.flag === '1' && res.data) {
          this.receiptData = res.data;
        } else {
          this.receiptData = [];
        }
      },
      error: (err) => {
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.endCustomLoading();
        }
        this.receiptData = [];
      },
    });
    this.invoiceData = [];
    this.currentReferenceNo = null;
  }

  onReceiptSelectionChanged(e: any) {
    this.calculateReceiptTotals();
    const selectedReceipts = e.selectedRowsData;
    if (selectedReceipts.length > 0) {
      const firstRef = selectedReceipts[0].ReferenceNo;
      const hasDifferentRef = selectedReceipts.some(
        (r: any) => r.ReferenceNo !== firstRef,
      );
      if (hasDifferentRef) {
        notify(
          {
            message: 'Can only select rows with the same Reference No.',
            position: 'top right',
          },
          'warning',
          3000,
        );
        e.component.deselectRows(e.currentSelectedRowKeys);
        return;
      }
      if (!firstRef) {
        this.invoiceData = [];
        this.currentReferenceNo = null;
        return;
      }
      if (this.currentReferenceNo === firstRef) {
        return; // No need to call API again for the same reference number
      }
      this.currentReferenceNo = firstRef;
      const payload = {
        ReferenceNo: firstRef,
      };
      if (this.invoiceGrid && this.invoiceGrid.instance) {
        this.invoiceGrid.instance.beginCustomLoading('Loading...');
      }
      this.dataService.getARManualMatchingInvoiceList(payload).subscribe({
        next: (res: any) => {
          if (this.invoiceGrid && this.invoiceGrid.instance) {
            this.invoiceGrid.instance.endCustomLoading();
          }
          if (res.flag === '1' && res.data) {
            this.invoiceData = res.data.map((item: any) => ({
              ...item,
              ReceivedAmount: null,
              RejectedAmount: null,
            }));
          } else {
            this.invoiceData = [];
          }
        },
        error: (err) => {
          if (this.invoiceGrid && this.invoiceGrid.instance) {
            this.invoiceGrid.instance.endCustomLoading();
          }
          this.invoiceData = [];
        },
      });
    } else {
      this.invoiceData = [];
      this.currentReferenceNo = null;
    }
  }

  onInvoiceSelectionChanged(e: any) {
    this.calculateInvoiceTotals();
  }

  onInvoiceEditorPreparing(e: any) {
    const selectedRows = this.invoiceGrid.instance.getSelectedRowsData();
    if (e.parentType === 'dataRow') {
      this.currentEditingColumn = e.dataField;
      
      const isSelected = selectedRows.some((row: any) => row.InvoiceID === e.row.data.InvoiceID);
      if (!isSelected) {
        e.editorOptions.disabled = true;
      }
    }
  }

  onInvoiceSaved(e: any) {
    this.calculateInvoiceTotals();
  }

  calculateReceiptTotals() {
    if (!this.receiptGrid || !this.receiptGrid.instance) return;
    const selectedRows = this.receiptGrid.instance.getSelectedRowsData();
    this.selectedReceiptAmountTotal = selectedRows.reduce(
      (sum: number, r: any) => sum + (Number(r.Amount) || 0),
      0,
    );
    this.selectedReceiptRejectedTotal = selectedRows.reduce(
      (sum: number, r: any) => sum + (Number(r.RejectedAmount) || 0),
      0,
    );
  }

  calculateInvoiceTotals() {
    if (!this.invoiceGrid || !this.invoiceGrid.instance) return;
    const selectedRows = this.invoiceGrid.instance.getSelectedRowsData();
    this.selectedInvoiceAmountTotal = selectedRows.reduce(
      (sum: number, r: any) => sum + (Number(r.Amount) || 0),
      0,
    );
    this.selectedInvoiceReceivedTotal = selectedRows.reduce(
      (sum: number, r: any) => sum + (Number(r.ReceivedAmount) || 0),
      0,
    );
    this.selectedInvoiceRejectedTotal = selectedRows.reduce(
      (sum: number, r: any) => sum + (Number(r.RejectedAmount) || 0),
      0,
    );
  }

  performMatching() {
    const selectedReceipts = this.receiptGrid.instance.getSelectedRowsData();
    const selectedInvoices = this.invoiceGrid.instance.getSelectedRowsData();
    if (selectedReceipts.length === 0 || selectedInvoices.length === 0) {
      notify(
        {
          message:
            'Please select at least one receipt and one invoice to match.',
          position: 'top right',
        },
        'warning',
        3000,
      );
      return;
    }

    const totalReceiptAmount = selectedReceipts.reduce(
      (sum: number, r: any) => sum + (Number(r.Amount) || 0),
      0,
    );
    const totalReceiptRejected = selectedReceipts.reduce(
      (sum: number, r: any) => sum + (Number(r.RejectedAmount) || 0),
      0,
    );
    const totalInvoiceReceived = selectedInvoices.reduce(
      (sum: number, i: any) => sum + (Number(i.ReceivedAmount) || 0),
      0,
    );
    const totalInvoiceRejected = selectedInvoices.reduce(
      (sum: number, i: any) => sum + (Number(i.RejectedAmount) || 0),
      0,
    );

    if (
      totalReceiptAmount !== totalInvoiceReceived ||
      totalReceiptRejected !== totalInvoiceRejected
    ) {
      notify(
        {
          message:
            'Receipt Received and Rejected totals must match Invoice Received and Rejected totals.',
          position: 'top right',
        },
        'warning',
        4000,
      );
      return;
    }
    const payload = {
      ReceiptDetailID: selectedReceipts
        .map((r: any) => r.ReceiptDetailID)
        .filter((id: any) => id)
        .join(','),
      data: selectedInvoices
        .filter((i: any) => i.InvoiceID)
        .map((i: any) => ({
          InvoiceID: i.InvoiceID,
          RejectedAmount: Number(i.RejectedAmount) || 0,
          ReceivedAmount: Number(i.ReceivedAmount) || 0,
        })),
    };

    this.isMatchingLoading = true;
    this.dataService.processARManualMatching(payload).subscribe({
      next: (res: any) => {
        this.isMatchingLoading = false;

        if (res.flag === '1') {
          notify(
            {
              message: res.message || 'Matching successful',
              position: 'top right',
            },
            'success',
            3000,
          );
        } else if (res.message) {
          notify(
            { message: res.message, position: 'top right' },
            'warning',
            3000,
          );
        } else {
          notify(
            { message: 'Matching successful', position: 'top right' },
            'success',
            3000,
          );
        }

        // Refresh first grid
        this.fetchData();

        // Clear selections
        if (this.receiptGrid && this.receiptGrid.instance) {
          this.receiptGrid.instance.clearSelection();
        }
        if (this.invoiceGrid && this.invoiceGrid.instance) {
          this.invoiceGrid.instance.clearSelection();
        }

        // Empty second grid
        this.invoiceData = [];
        this.currentReferenceNo = null;
        this.selectedInvoiceAmountTotal = 0;
        this.selectedInvoiceReceivedTotal = 0;
        this.selectedInvoiceRejectedTotal = 0;
      },
      error: (err) => {
        this.isMatchingLoading = false;
        notify(
          { message: 'Error during matching', position: 'top right' },
          'error',
          3000,
        );
      },
    });
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
    DxDateBoxModule,
  ],
  providers: [],
  declarations: [ARManualMatchingComponent],
  exports: [ARManualMatchingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARManualMatchingModule {}
