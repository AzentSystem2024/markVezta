import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxFormModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-calss-finance-edit',
  templateUrl: './vat-calss-finance-edit.component.html',
  styleUrls: ['./vat-calss-finance-edit.component.scss'],
})
export class VatCalssFinanceEditComponent {
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  @Input() selectedData: any = {};
  @Output() formClosed = new EventEmitter<void>();
  @Input() vatClassList: any[] = [];

  formVatclassData:any = {
    ID: 0,
    CODE: '',
    VAT_NAME: '',
    VAT_PERC: '',
    IGST_INPUT_HEAD_ID: '',
    IGST_OUTPUT_HEAD_ID: '',
  };

  selected_Company_id: any;
  ledgerList: any[] = [];

  vatClass:any;
  companyID:any;

  newVatclass = this.formVatclassData;

  constructor(private dataservice: DataService) {
    this.sessionDetails();
  }

  getNewVatclassData = () => ({ ...this.newVatclass });

  isLedgerLoaded = false;

  ngOnInit(): void {
    this.sessionDetails();
    this.getLedgerCodeDropdown();

    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.showVatclass();
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      this.selectedData = changes['selectedData'].currentValue;
      this.tryBindData();
    }
  }

  showVatclass() {
    const payload = {
      COMPANY_ID: this.companyID,
    };

    this.dataservice.getVatclassData(payload).subscribe(res=>{
      this.vatClass = res;
      console.log(this.vatClass,"this.vatClass")
    })

  }

  // Load dropdown
  getLedgerCodeDropdown() {
    this.dataservice.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
      this.isLedgerLoaded = true;
      this.tryBindData();
    });
  }

  tryBindData() {
    if (this.isLedgerLoaded && this.selectedData) {
      this.formVatclassData = {
        ...this.selectedData,
        IGST_INPUT_HEAD_ID: Number(this.selectedData.IGST_INPUT_HEAD_ID),
        IGST_OUTPUT_HEAD_ID: Number(this.selectedData.IGST_OUTPUT_HEAD_ID),
      };

      //IMPORTANT FIX
      this.newVatclass = this.formVatclassData;
    }
  }

  keyPressCode(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 48 && charCode <= 57)
    ) {
      // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  keyPressVatname(event: any) {
    console.log('key pressed');
    var charCode = event.which ? event.which : event.keyCode;
    var inputValue = event.target.value;

    // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
      event.preventDefault();
      return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  sessionDetails() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // this.selected_Company_id = 0;
  }

  // UpdateData() {
  //   const {
  //     ID,
  //     CODE,
  //     VAT_NAME,
  //     VAT_PERC,
  //     IGST_INPUT_HEAD_ID,
  //     IGST_OUTPUT_HEAD_ID,
  //   } = this.formVatclassData;
  //   this.dataservice
  //     .updateVatclass_Finance(
  //       ID,
  //       CODE,
  //       VAT_NAME,
  //       VAT_PERC,
  //       IGST_INPUT_HEAD_ID,
  //       IGST_OUTPUT_HEAD_ID,
  //       this.selected_Company_id,
  //     )
  //     .subscribe((response) => {
  //       console.log(response);
  //       this.formClosed.emit();
  //     });
  // }

  UpdateData() {
  const {
    ID,
    CODE,
    VAT_NAME,
    VAT_PERC,
    IGST_INPUT_HEAD_ID,
    IGST_OUTPUT_HEAD_ID,
  } = this.formVatclassData;

  const duplicateCode = this.vatClassList.some(
    (item: any) =>
      item.ID !== ID &&
      item.CODE?.trim().toLowerCase() === CODE?.trim().toLowerCase()
  );

  if (duplicateCode) {
    notify(
      {
        message: 'Code already exists',
        position: { at: 'top right', my: 'top right' },
      },
      'warning'
    );
    return;
  }

  const duplicateVatName = this.vatClassList.some(
    (item: any) =>
      item.ID !== ID &&
      item.VAT_NAME?.trim().toLowerCase() === VAT_NAME?.trim().toLowerCase()
  );

  if (duplicateVatName) {
    notify(
      {
        message: 'VAT Name already exists',
        position: { at: 'top right', my: 'top right' },
      },
      'warning'
    );
    return;
  }

  this.dataservice
    .updateVatclass_Finance(
      ID,
      CODE,
      VAT_NAME,
      VAT_PERC,
      IGST_INPUT_HEAD_ID,
      IGST_OUTPUT_HEAD_ID,
      this.selected_Company_id
    )
    .subscribe((response) => {
      notify(
        {
          message: 'Data updated successfully',
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );

      this.formClosed.emit();
    });
}

  closePopup() {
    this.formClosed.emit();
  }

  validateVatClassCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.vatClass?.length) return true;

    const currentId = this.formVatclassData?.ID; //  current editing ID

    return !this.vatClass.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value && item.ID !== currentId; //  ignore same record
    });
};
}
@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxNumberBoxModule
  ],
  declarations: [VatCalssFinanceEditComponent],
  exports: [VatCalssFinanceEditComponent],
})
export class VatCalssFinanceEditModule {}
