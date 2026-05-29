import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-pdc-edit-form',
  templateUrl: './pdc-edit-form.component.html',
  styleUrls: ['./pdc-edit-form.component.scss'],
})
export class PdcEditFormComponent {
  @Output() formClosed = new EventEmitter<void>();
  @Input() selectedPDC: any;
  @Input() isEditReadOnly: boolean = false;
  @Input() PDCid: any;
   @Input() canApprove :boolean = false;
   @Input() isVerifyMode: boolean = false;
   @Input() isApproveMode: boolean = false;
  // @Input() popupMode: string = 'new';
   @Input() VerifyPDCPopupOpened:boolean = false;
  isPdfPopupVisible: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;
  @Input() popupMode: string = '';

  Supplier: any;
  selectedBeneficiaryTypeID: any;
  selected_Company_id: any;
  priorities_value: any;
  isEnabled = true;
  Bank: any;
  Customer: any;
  priorities = [
    { id: 1, name: 'Issued' },
    { id: 2, name: 'Received' },
  ];
  selectedType = this.priorities.find((p) => p.id === 1);
  BeneficiaryType = [
    { id: 1, name: 'Supplier', disabled: false },
    { id: 2, name: 'Customer', disabled: false },
    { id: 3, name: 'Others', disabled: false },
  ];
  selectedBeneficiaryType: any;

  PDCFormData: any = {
    ID: '',
    BANK_HEAD_ID: '',
    CUST_ID: '',
    SUPP_ID: '',
    BENEFICIARY_NAME: '',
    BENEFICIARY_TYPE: '',
    ENTRY_DATE: '',
    ENTRY_NO: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    AMOUNT: '',
    REMARKS: '',
    IS_PAYMENT: '',
    ENTRY_STATUS: '',
    AC_TRANS_ID: '',
  };
  entryStatus: any;

 get actionButtonText(): string {
  if (this.isVerifyMode) {
    return 'Verify';
  }

  if (this.isApproveMode) {
    return 'Approve';
  }

  return 'Update';
}

    ngOnChanges(changes: SimpleChanges): void {
      console.log(this.isVerifyMode,":geyueuryuirirg")
    if (changes['selectedPDC'] && changes['selectedPDC'].currentValue) {
      const data = changes['selectedPDC'].currentValue;
      console.log(data,'==========data')
      this.entryStatus = data.ENTRY_STATUS
      console.log(this.entryStatus)
      this.PDCFormData = {
        ID: data.ID,
        BANK_HEAD_ID: data.BANK_HEAD_ID,
        CUST_ID: data.CUST_ID === 0 ? null : data.CUST_ID,
        SUPP_ID: data.SUPP_ID === 0 ? null : data.SUPP_ID,
        BENEFICIARY_NAME: data.BENEFICIARY_NAME || '',
        BENEFICIARY_TYPE: data.BENEFICIARY_TYPE,
        ENTRY_DATE: this.parseDate(data.ENTRY_DATE),
        ENTRY_NO: data.ENTRY_NO,
        CHEQUE_NO: data.CHEQUE_NO,
        CHEQUE_DATE: this.parseDate(data.CHEQUE_DATE),
        AMOUNT: data.AMOUNT,
        REMARKS: data.REMARKS,
        IS_PAYMENT: data.IS_PAYMENT
          ? this.priorities.find((p) => p.name === 'Issued')
          : this.priorities.find((p) => p.name === 'Received'),
        ENTRY_STATUS: data.ENTRY_STATUS,
        AC_TRANS_ID: data.AC_TRANS_ID,
      };
console.log(this.isApproveMode,":-------------fhytyu")
      this.selectedType = this.PDCFormData.IS_PAYMENT;
      this.selectedBeneficiaryType = this.BeneficiaryType.find(
        (b) => b.id === data.BENEFICIARY_TYPE,
      );
      this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;

      // ✅ Map numeric type to object for radio group
      // this.selectedBeneficiaryType = this.BeneficiaryType.find(
      //   (p) => p.id === data.BENEFICIARY_TYPE
      // );
      if (data.BENEFICIARY_TYPE) {
        this.selectedBeneficiaryType = this.BeneficiaryType.find(
          (b) => b.id === data.BENEFICIARY_TYPE,
        );
        this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType?.id;
      }

      this.get_Supplier_dropdown();
    }

    // if (!this.selectedPDC) {
    //   // Initialize default values for Add mode
    //   this.selectedType = this.priorities[0];
    //   this.selectedBeneficiaryType = this.BeneficiaryType[0];
    //   this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;

    // }

    if (!this.selectedPDC) {
      setTimeout(() => {
        this.selectedType = this.priorities[0];
        this.selectedBeneficiaryType = this.BeneficiaryType[0];
        this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
        this.onPriorityChanged({ value: this.selectedType });
        this.onBeneficiaryTypeChanged({
          value: this.selectedBeneficiaryTypeID,
        });
      });
    }
  }

  onBeneficiaryTypeChanged(e: any) {
    //  this.selectedBeneficiaryType = e.value

    const selectedId = e.value;
    this.selectedBeneficiaryTypeID = selectedId;
    this.selectedBeneficiaryType = this.BeneficiaryType.find(
      (b) => b.id === selectedId,
    );
  }

  onPriorityChanged(e: any) {
    this.selectedType = e.value;
    this.PDCFormData.IS_PAYMENT = e.value; // Keep synced

    const priorityId = e.value?.id || 1;

    if (priorityId === 1) {
      // Issued → Disable Customer, auto-select Supplier
      this.BeneficiaryType = this.BeneficiaryType.map((item) => ({
        ...item,
        disabled: item.id === 2,
      }));

      this.selectedBeneficiaryType = this.BeneficiaryType.find(
        (b) => b.id === 1,
      );
      this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
    } else {
      // Received → Disable Supplier, auto-select Customer
      this.BeneficiaryType = this.BeneficiaryType.map((item) => ({
        ...item,
        disabled: item.id === 1,
      }));

      this.selectedBeneficiaryType = this.BeneficiaryType.find(
        (b) => b.id === 2,
      );
      this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
    }
  }
  isBeneficiaryTypeDisabled = (data: any) => data.disabled;

  constructor(
    private dataservice: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.get_Supplier_dropdown();
     this.sesstion_Details();
    this.get_Bank_dropdown();
    this.get_Customer_dropdown();
   
  }

  onSupplierChanged(event: any) {
  this.PDCFormData.SUPP_ID = event.value;

  const supplier = this.Supplier?.find(
    (item: any) => item.ID === event.value
  );

  this.PDCFormData.BENEFICIARY_NAME = supplier?.DESCRIPTION || '';
}

  onCustomerChanged(event: any) {
  this.PDCFormData.CUST_ID = event.value;

  const customer = this.Customer?.find(
    (item: any) => item.ID === event.value
  );

  this.PDCFormData.BENEFICIARY_NAME = customer?.DESCRIPTION || '';
}

  cancel() {
    this.formClosed.emit();
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; //  No timezone involved
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  savePDC() {
    console.log(this.entryStatus,'=====entryvstatus')
    if (
      !this.PDCFormData.BANK_HEAD_ID ||
      !this.PDCFormData.CHEQUE_NO ||
      !this.PDCFormData.ENTRY_DATE ||
      !this.PDCFormData.CHEQUE_DATE ||
      !this.PDCFormData.AMOUNT ||
      !this.PDCFormData.REMARKS ||
      !this.selectedBeneficiaryTypeID ||
      !this.PDCFormData.BENEFICIARY_NAME ||
      (
    this.selectedBeneficiaryTypeID === 3 &&
    !this.PDCFormData.BENEFICIARY_NAME
  )
    ) {
      notify('Please fill all the fields before saving.', 'error', 3000);
      return; //  Stop function if fields are missing
    }
    const payload = {
      ID: this.PDCFormData.ID ? +this.PDCFormData.ID : 0,
      COMPANY_ID: this.selected_Company_id || 0,
      BANK_HEAD_ID: this.PDCFormData.BANK_HEAD_ID || 0,
      CUST_ID: this.PDCFormData.CUST_ID || 0,
      SUPP_ID: this.PDCFormData.SUPP_ID || 0,
      // BENEFICIARY_NAME: this.PDCFormData.BENEFICIARY_NAME || '',
      BENEFICIARY_NAME:
  this.selectedBeneficiaryTypeID === 1
    ? this.Supplier?.find((x: any) => x.ID === this.PDCFormData.SUPP_ID)?.DESCRIPTION || ''
    : this.selectedBeneficiaryTypeID === 2
    ? this.Customer?.find((x: any) => x.ID === this.PDCFormData.CUST_ID)?.DESCRIPTION || ''
    : this.PDCFormData.BENEFICIARY_NAME || '',
      BENEFICIARY_TYPE: this.selectedBeneficiaryTypeID || 0,

      ENTRY_DATE: this.formatDate(this.PDCFormData.ENTRY_DATE),
      CHEQUE_NO: this.PDCFormData.CHEQUE_NO || '',
      CHEQUE_DATE: this.formatDate(this.PDCFormData.CHEQUE_DATE),
      AMOUNT: +this.PDCFormData.AMOUNT || 0,
      REMARKS: this.PDCFormData.REMARKS || '',
      IS_PAYMENT: this.PDCFormData.IS_PAYMENT?.name === 'Issued', // true if Issued
      // ENTRY_STATUS: this.PDCFormData.ENTRY_STATUS ? 5 : 1,
    ENTRY_STATUS: this.isVerifyMode
  ? 2
  : this.isApproveMode
    ? 5
    : 1,
      AC_TRANS_ID: this.PDCFormData.AC_TRANS_ID || 0,
      
    };

  if (this.isVerifyMode) {
  confirm(
    'Are you sure you want to verify this PDC?',
    'Confirm Verification'
  ).then((result) => {
    if (result) {
      this.dataservice.Update_PDC(payload).subscribe((res: any) => {
        if (res.Message === 'Success') {
          notify('PDC verified successfully', 'success', 2000);
          this.formClosed.emit();
        }
      });
    }
  });

  return;
}

if (this.isApproveMode) {
  confirm(
    'Are you sure you want to approve this PDC?',
    'Confirm Approval'
  ).then((result) => {
    if (result) {
      this.dataservice.Update_PDC(payload).subscribe((res: any) => {
        if (res.Message === 'Success') {
          notify('PDC approved successfully', 'success', 2000);
          this.formClosed.emit();
        }
      });
    }
  });

  return;
}
    this.dataservice.Update_PDC(payload).subscribe((res: any) => {
      if (res.Message === 'Success') {
        notify(
          {
            message: 'Updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
        this.formClosed.emit();
      }
    });
  }

  get_Supplier_dropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'SUPPLIER',
    };
    this.dataservice.Supplier_Dropdown(payload).subscribe((res: any) => {
      this.Supplier = res;
    });
  }

  get_Bank_dropdown() {
    this.dataservice
      .Bank_Dropdown(this.selected_Company_id)
      .subscribe((res: any) => {
        this.Bank = res;
      });
  }

  get_Customer_dropdown() {
    const payload = {
      NAME: 'CUSTOMER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Customer_Dropdown(payload).subscribe((res: any) => {
      this.Customer = res;
    });
  }

  ngOnInit(): void {
    
    if (!this.selectedPDC) {
      // Initialize default values for Add mode
      this.selectedType = this.priorities[0];
      this.selectedBeneficiaryType = this.BeneficiaryType[0];
      this.selectedBeneficiaryTypeID = this.selectedBeneficiaryType.id;
    }

    this.get_Supplier_dropdown();
    this.get_Bank_dropdown();
  }



  parseDate(dateStr: string): Date {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  }

  viewPdf(): void {
    this.isPdfPopupVisible = true;

    this.dataservice.Select_PDC(this.PDCid).subscribe((res: any) => {
      if (res) {
        this.pdfSrc = this.get_pdf(res);
      }
    });
  }

  get_pdf(data: any): SafeResourceUrl {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 12;
    let y = 12;

    // ===========================
    //  RETURN PDF
    // ===========================
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
    DxDataGridModule,
    DxoItemModule,
    DxoFormItemModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [PdcEditFormComponent],
  exports: [PdcEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PdcEditFormModule {}
