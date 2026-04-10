import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
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
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-misc-sales-invoice-form',
  templateUrl: './misc-sales-invoice-form.component.html',
  styleUrls: ['./misc-sales-invoice-form.component.scss'],
})
export class MiscSalesInvoiceFormComponent implements OnInit,OnChanges {
  @Output() saveSuccess = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent|undefined;

  invoiceHeader: any = {
    id:0,
    invoiceNo: '',
    date: new Date(),
    referenceNo: '',
    referenceDate: null,
    customerId: null,
    tpaId: null,
    storeId : null,
    encounterType: null,
    patientId: '',
    patientName: '',
    transactionType: null,
  };

  customer: any;
  companyID: any;
  items: any;
  department: any;
  isApproved: boolean = false;
  allSubDepartments: any[] = [];

  invoiceDetails: any[] = [];

  customerList = [
    { id: 1, name: 'Customer A' },
    { id: 2, name: 'Customer B' },
  ];

  tpaList = [
    { id: 1, name: 'TPA 1' },
    { id: 2, name: 'TPA 2' },
  ];

  encounterTypes: any;
  transactionTypes = ['Cash', 'Credit'];
  subDeptMap: any = {};
  branch:any;
  userID:any;
  finID:any;

  isReadOnly: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    console.log(menuResponse,"menuResponse");

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    
    this.getCustomerDropdown();
    this.getEncounterDropDownData();
    this.getItemsDropDownData();
    this.getDepartmentDropdownData();
    this.getBranchDropDownData();

    if (!this.invoiceFormData) {
      this.getDocNo();
    }
  }


  ngOnChanges(changes: SimpleChanges): void {

  if (changes['invoiceFormData'] && this.invoiceFormData) {

    const data = this.invoiceFormData;

    //  HEADER
    this.invoiceHeader = {
      id : data.ID,
      invoiceNo: data.INVOICE_NO,
      date: data.INVOICE_DATE ? new Date(data.INVOICE_DATE) : null,
      referenceNo: data.REF_NO,
      referenceDate: data.REF_DATE ? new Date(data.REF_DATE) : null,
      customerId: data.CUSTOMER_ID,
      tpaId: data.TPA_ID,
      encounterType: data.ENCOUNTER_TYPE,
      patientId: data.PATIENT_ID,
      patientName: data.PATIENT_NAME,
      storeId: data.STORE_ID
    };

    this.isReadOnly = data.TRANS_STATUS === 5;

    this.isApproved = data.IS_APPROVED;

    //  DETAILS
    this.invoiceDetails = (data.DETAILS || []).map((d: any) => ({
      itemCode: d.ITEM_ID,
      itemDescription: d.ITEM_DESCRIPTION,
      clinician: d.CLINICIAN,
      orderingClinician: d.ORDERING_CLINICIAN,
      department: d.DEPARTMENT_ID,
      subDepartment: d.SUB_DEPARTMENT_ID,
      quantity: d.QUANTITY,
      duration: d.DURATION,
      grossAmount: d.GROSS_AMOUNT,
      patientShare: d.PATIENT_SHARE,
      vatCode: d.VAT_CODE,
      vatPercent: d.VAT_PERC,
      vatID: d.VAT_CLASS_ID,
      vatAmount: d.VAT_AMOUNT,
      netAmount: d.NET_AMOUNT
    }));


    setTimeout(() => {

      if (this.isReadOnly) return;

      if (!this.invoiceDetails) {
        this.invoiceDetails = [];
      }

      const hasEmptyRow = this.invoiceDetails.some(r =>
        !r.itemCode &&
        (!r.quantity || r.quantity === 0) &&
        (!r.grossAmount || r.grossAmount === 0)
      );

      let addedNewRow = false;

      //  Add only if no empty row exists
      if (!hasEmptyRow) {
        this.invoiceDetails.push({
          itemCode: null,
          itemDescription: '',
          clinician: '',
          orderingClinician: '',
          department: null,
          subDepartment: null,
          quantity: 0,
          duration: 0,
          grossAmount: 0,
          patientShare: 0,
          vatCode: null,
          vatPercent: 0,
          vatID: null,
          vatAmount: 0,
          netAmount: 0
        });

        addedNewRow = true;
      }

      //  Focus itemCode of last row
      setTimeout(() => {
        const grid = this.itemsGridRef?.instance;

        if (grid) {
          const lastIndex = this.invoiceDetails.length - 1;

          grid.editCell(lastIndex, 'itemCode');
        }
      }, 100);

    }, 0);

    this.subDeptMap = {};
    this.allSubDepartments = []; // 🔥 ADD THIS

    this.invoiceDetails.forEach((row, index) => {

      if (row.department) {

        this.getSubDepartment(row.department, (data) => {

          this.subDeptMap[index] = data;

          // 🔥 ADD THIS (same as onEditorPreparing)
          this.allSubDepartments = [
            ...this.allSubDepartments,
            ...data.filter(d =>
              !this.allSubDepartments.some(x => x.ID === d.ID)
            )
          ];

        });

      }

    });

  }
}

  getCustomerDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'CUSTOMER',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.customer = response;
    });
  }

  getEncounterDropDownData() {
    const name = {
      name: 'ENCOUNTER_TYPE',
    };
    this.dataService.getDropdownData(name).subscribe((res: any) => {
      this.encounterTypes = res;
    });
  }

  getItemsDropDownData() {
    const name = {
      name: 'SERVICE_ITEMS',
    };
    this.dataService.getDropdownData(name).subscribe((res: any) => {
      this.items = res;
    });
  }

  getDepartmentDropdownData() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'DEPT',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.department = response;
    });
  }

  getSubDepartment(deptId: any, callback: (data: any[]) => void) {
    const payload = {
      NAME: 'SUB_DEPT',
      DEPT_ID: deptId,
    };

    this.dataService.getDropdownData(payload).subscribe((res: any) => {
      callback(res);
    });
  }

  getBranchDropDownData() {
    const name = {
      NAME: 'STORE',
      COMPANY_ID: this.companyID,
      
    };
    this.dataService.getDropdownData(name).subscribe((res: any) => {
      this.branch = res;
    });
  }



  getDocNo() {
    const payload = {
      TRANS_TYPE: 105,
      COMPANY_ID: this.companyID,
      SUB_TYPE_ID: 0,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.invoiceHeader.invoiceNo = response.DOC_NO;
    });
  }

  onCellValueChanged(e: any) {

  if (
    ['quantity', 'duration', 'vatPercent', 'patientShare', 'grossAmount'].includes(e.column.dataField)
  ) {
    this.calculateRowWithGrid(e);
  }

  if (e.column.dataField === 'department') {
    const deptId = e.value;
    e.data.subDepartment = null;

    this.getSubDepartment(deptId, (data) => {
      e.data.subDepartmentList = data;
    });
  }
}

//   updateCalculation(e: any) {

//   const row = e.data;

//   const quantity = Number(row.quantity) || 0;
//   const duration = Number(row.duration) || 0;
//   const vatPercent = Number(row.vatPercent) || 0;
//   const patientShare = Number(row.patientShare) || 0;

//   let gross = Number(row.grossAmount) || 0;

//   // 🔥 If quantity/duration present → calculate gross
//   // if (quantity && duration) {
//   //   // gross = quantity * duration;
//   //   row.grossAmount = gross;
//   // }

//   // 🔥 VAT
//   const vatAmount = (gross * vatPercent) / 100;
//   row.vatAmount = vatAmount;

//   // 🔥 NET
//   row.netAmount = gross + vatAmount - patientShare;
// }


  updateCalculation(e: any) {

  const row = e.data;

  const quantity = Number(row.quantity) || 0;
  const duration = Number(row.duration) || 0;
  const vatPercent = Number(row.vatPercent) || 0;
  const patientShare = Number(row.patientShare) || 0;
  const gross = Number(row.grossAmount) || 0;

  //  VAT
  const vatAmount = (gross * vatPercent) / 100;
  row.vatAmount = vatAmount;

  //  NET
  row.netAmount = gross + vatAmount - patientShare;

  // ============================
  //  ADD THIS BLOCK (ROW ADD)
  // ============================

  const rowIndex = e.component.getRowIndexByKey(e.key);

  const isValid =
    row.itemCode &&
    quantity > 0 &&
    gross > 0;

  if (!isValid) return;

  const isLastRow = rowIndex === this.invoiceDetails.length - 1;

  if (!isLastRow) return;

  //  check next row
  const nextRow = this.invoiceDetails[rowIndex + 1];

  const hasNextEmptyRow =
    nextRow &&
    !nextRow.itemCode &&
    (!nextRow.quantity || nextRow.quantity === 0) &&
    (!nextRow.grossAmount || nextRow.grossAmount === 0);

  if (hasNextEmptyRow) return;

  //  ADD ROW
  this.invoiceDetails = [
    ...this.invoiceDetails,
    {
      itemCode: null,
      itemDescription: '',
      clinician: '',
      orderingClinician: '',
      department: null,
      subDepartment: null,
      quantity: 0,
      duration: 0,
      grossAmount: 0,
      patientShare: 0,
      vatCode: null,
      vatPercent: 0,
      vatID: null,
      vatAmount: 0,
      netAmount: 0
    }
  ];

  //  REFRESH + FOCUS
  setTimeout(() => {
    const grid = this.itemsGridRef?.instance;

    if (grid) {
      grid.refresh();

      setTimeout(() => {
        const newIndex = this.invoiceDetails.length - 1;
        grid.editCell(newIndex, 'itemCode');
      }, 100);
    }

  }, 0);
}

  calculateRowWithGrid(e: any) {

  const rowIndex = e.row.rowIndex;

  // 🔥 get latest values from grid
  const quantity = Number(e.component.cellValue(rowIndex, 'quantity')) || 0;
  const duration = Number(e.component.cellValue(rowIndex, 'duration')) || 0;
  const vatPercent = Number(e.component.cellValue(rowIndex, 'vatPercent')) || 0;
  const patientShare = Number(e.component.cellValue(rowIndex, 'patientShare')) || 0;

  let gross = Number(e.component.cellValue(rowIndex, 'grossAmount')) || 0;

  // 🔥 CASE 1: If quantity or duration changed → calculate gross
  if (['quantity', 'duration'].includes(e.column.dataField)) {
    gross = quantity * duration;
    e.component.cellValue(rowIndex, 'grossAmount', gross);
  }

  // 🔥 CASE 2: If user manually entered gross → use it directly
  if (e.column.dataField === 'grossAmount') {
    gross = Number(e.value) || 0;
  }

  // 🔥 VAT calculation
  const vatAmount = (gross * vatPercent) / 100;

  // 🔥 NET calculation
  const net = gross + vatAmount - patientShare;

  e.component.cellValue(rowIndex, 'vatAmount', vatAmount);
  e.component.cellValue(rowIndex, 'netAmount', net);
}

  onEditorPreparing(e: any) {

    if (e.dataField === 'itemCode' && e.parentType === 'dataRow') {

  const original = e.editorOptions.onValueChanged;

  e.editorOptions.onValueChanged = (args: any) => {

    e.setValue(args.value);

    const itemId = args.value;

    const payload = {
      ITEM_ID: itemId
    };

    this.dataService.getItems(payload).subscribe((res: any) => {

      if (res?.data?.length) {

        const item = res.data[0];
        console.log('VAT_CLASS_ID:', item.VAT_CLASS_ID); // 🔥 your value

        const rowIndex = e.row.rowIndex;

        const rowData = this.invoiceDetails[rowIndex];

        rowData.vatID = item.VAT_CLASS_ID; 

        // FIX HERE
        e.component.cellValue(rowIndex, 'itemDescription', item.ITEM_DESCRIPTION);
        e.component.cellValue(rowIndex, 'vatCode', item.VAT_CODE);
        e.component.cellValue(rowIndex, 'vatPercent', item.VAT_PERC);
        e.component.cellValue(rowIndex, 'vatID', item.VAT_CLASS_ID);
        

        //  recalc
        this.calculateRowWithGrid(e);

        // optional refresh
        e.component.repaintRows([rowIndex]);
      }
    });

    if (original) original(args);
  };
}

    if (e.dataField === 'department' && e.parentType === 'dataRow') {
      const original = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);

        const deptId = args.value;
        const rowIndex = e.row.rowIndex;

        e.row.data.subDepartment = null;

        this.getSubDepartment(deptId, (data) => {
          console.log(data, 'API RESULT');

          //  store separately (NOT inside row)
          this.subDeptMap[rowIndex] = data;

          this.allSubDepartments = [
            ...this.allSubDepartments,
            ...data.filter(d => 
              !this.allSubDepartments.some(x => x.ID === d.ID)
            )
          ];

          // reopen editor
          // setTimeout(() => {
          //   e.component.editCell(rowIndex, 'subDepartment');
          // });
        });

        if (original) original(args);
      };
    }

    //SubDepartment editor
    if (e.dataField === 'subDepartment' && e.parentType === 'dataRow') {
      const rowIndex = e.row.rowIndex;

      const data = this.subDeptMap[rowIndex];

      // ❌ block if no data
      if (!data) {
        e.cancel = true;
        return;
      }

      console.log(data, 'binding FINAL');

      e.editorName = 'dxSelectBox';

      e.editorOptions = {
        dataSource: data,
        displayExpr: 'DESCRIPTION',
        valueExpr: 'ID',
        searchEnabled: true,
        value: e.value,

        onValueChanged: (args: any) => {
          e.setValue(args.value); // ✅ binds to grid
        },
      };
    }

  }

  getAllSubDepartments() {
    // flatten all row-wise subdept lists
    return Object.values(this.subDeptMap || {}).flat();
  }


  onSave() {

  // ✅ VALIDATION FIRST
  if (!this.validateForm()) {
    return;
  }

  const payload = {
    ID: this.invoiceHeader.id || 0, 
    USER_ID : this.userID,
    FIN_ID : this.finID,
    INVOICE_NO: this.invoiceHeader.invoiceNo,
    INVOICE_DATE: this.invoiceHeader.date,
    REF_NO: this.invoiceHeader.referenceNo,
    REF_DATE: this.invoiceHeader.referenceDate,
    CUSTOMER_ID: this.invoiceHeader.customerId,
    TPA_ID: this.invoiceHeader.tpaId,
    ENCOUNTER_TYPE: this.invoiceHeader.encounterType,
    PATIENT_ID: this.invoiceHeader.patientId,
    PATIENT_NAME: this.invoiceHeader.patientName,
    COMPANY_ID : this.companyID,
    STORE_ID : this.invoiceHeader.storeId,
    IS_APPROVED : this.isApproved,

    DETAILS: this.invoiceDetails
    .filter((row: any) =>
      row.itemCode &&
      Number(row.quantity) > 0 &&
      Number(row.grossAmount) > 0
    )
    .map((row: any) => ({
      ITEM_ID: row.itemCode,
      CLINICIAN: row.clinician,
      ORDERING_CLINICIAN: row.orderingClinician,
      DEPARTMENT_ID: row.department,
      SUB_DEPARTMENT_ID: row.subDepartment,
      QUANTITY: row.quantity,
      DURATION: row.duration,
      GROSS_AMOUNT: row.grossAmount,
      PATIENT_SHARE: row.patientShare,
      VAT_CODE: row.vatCode,
      VAT_PERC: row.vatPercent,
      VAT_CLASS_ID: row.vatID,
      VAT_AMOUNT: row.vatAmount,
      NET_AMOUNT: row.netAmount
    }))
  };

  console.log(payload, "FINAL PAYLOAD");

  //  API call
  this.dataService.miscSalesInvoiceInsert(payload).subscribe((res:any)=>{

    if (res) {

      // ✅ Notify
      notify({
      message: this.invoiceHeader.id
        ? 'Invoice Updated Successfully'
        : (this.isApproved 
            ? 'Invoice Committed Successfully' 
            : 'Invoice Saved Successfully'),
      position: { at: 'top center', my: 'top center' }
    }, 'success', 2000);

      // ✅ Emit to parent
      this.saveSuccess.emit();

      // ✅ Optional: reset form
      this.onCancel();
    }
    else {
      notify('Save failed', 'error', 2000);
    }

  });
}

onCancel() {

  // 🔥 clear form
  this.invoiceHeader = {
    invoiceNo: '',
    date: new Date(),
    referenceNo: '',
    referenceDate: null,
    customerId: null,
    tpaId: null,
    encounterType: null,
    patientId: '',
    patientName: '',
    transactionType: null
  };

  this.invoiceDetails = [];

}

validateForm(): boolean {

  // 🔹 HEADER VALIDATION
  if (!this.invoiceHeader.date) {
    notify('Invoice Date is required', 'warning', 2000);
    return false;
  }

  if (!this.invoiceHeader.customerId) {
    notify('Customer is required', 'warning', 2000);
    return false;
  }

  if (!this.invoiceHeader.storeId) {
    notify('Branch is required', 'warning', 2000);
    return false;
  }

  if (!this.invoiceHeader.patientName) {
    notify('Patient Name is required', 'warning', 2000);
    return false;
  }

  // 🔹 GRID VALIDATION
  if (!this.invoiceDetails || this.invoiceDetails.length === 0) {
    notify('At least one item is required', 'warning', 2000);
    return false;
  }

  for (let i = 0; i < this.invoiceDetails.length; i++) {

  const row = this.invoiceDetails[i];

  const isEmptyRow =
    !row.itemCode &&
    (!row.quantity || row.quantity === 0) &&
    (!row.grossAmount || row.grossAmount === 0);

  // skip completely empty row
  if (isEmptyRow) {
    continue;
  }

  // validate only filled rows
  if (!row.itemCode) {
    notify(`Row ${i + 1}: Item is required`, 'warning', 2000);
    return false;
  }

  if (!row.quantity || row.quantity <= 0) {
    notify(`Row ${i + 1}: Quantity must be > 0`, 'warning', 2000);
    return false;
  }

  if (!row.grossAmount || row.grossAmount <= 0) {
    notify(`Row ${i + 1}: Gross Amount must be > 0`, 'warning', 2000);
    return false;
  }
}

  return true;
}


addNewManualRow() {

  if (!this.invoiceDetails) {
    this.invoiceDetails = [];
  }

  // ✅ prevent empty row
  if (this.hasEmptyRow()) {
    notify(
      'Please fill the existing empty row before adding a new one.',
      'warning',
      2000
    );
    return;
  }

  // ✅ optional SL_NO (if needed)
  const nextSlNo =
    this.invoiceDetails.length > 0
      ? Math.max(...this.invoiceDetails.map((r: any, i: number) => i + 1))
      : 1;

  const newRow = {
    itemCode: null,
    itemDescription: '',
    clinician: '',
    orderingClinician: '',
    department: null,
    subDepartment: null,
    quantity: 0,
    duration: 0,
    grossAmount: 0,
    patientShare: 0,
    vatCode: null,
    vatPercent: 0,
    vatID: null,
    vatAmount: 0,
    netAmount: 0
  };

  // 🔥 IMPORTANT CHANGE → add at TOP
  this.invoiceDetails = [
  ...this.invoiceDetails,
  newRow
];

  // 🔥 focus FIRST ROW (index 0)
  setTimeout(() => {
    const grid = this.itemsGridRef?.instance;
    const lastIndex = this.invoiceDetails.length - 1;
    grid?.editCell(lastIndex, 'itemCode');
  }, 100);
}

private hasEmptyRow(): boolean {
  return (this.invoiceDetails || []).some((r: any) => {

    const hasItem = !!r.itemCode;

    const hasQuantity = Number(r.quantity) > 0;
    const hasGross = Number(r.grossAmount) > 0;
    const hasNet = Number(r.netAmount) > 0;

    // ✅ block if item selected but values not filled
    return hasItem && (!hasQuantity || !hasGross || !hasNet);
  });
}


calculateVatAmount = (row: any) => {
  const gross = Number(row.grossAmount) || 0;
  const vatPercent = Number(row.vatPercent) || 0;

  return (gross * vatPercent) / 100;
};

calculateNetAmount = (row: any) => {
  const gross = Number(row.grossAmount) || 0;
  const vatPercent = Number(row.vatPercent) || 0;
  const patientShare = Number(row.patientShare) || 0;

  const vat = (gross * vatPercent) / 100;

  return gross + vat - patientShare;
};

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
  declarations: [MiscSalesInvoiceFormComponent],
  exports: [MiscSalesInvoiceFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscSalesInvoiceFormModule {}
