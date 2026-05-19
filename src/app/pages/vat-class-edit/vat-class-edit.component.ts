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
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-class-edit',
  templateUrl: './vat-class-edit.component.html',
  styleUrls: ['./vat-class-edit.component.scss'],
})
export class VatClassEditComponent {
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  @Input() selectedData: any = {};
  @Output() formClosed = new EventEmitter<void>();
  formVatclassData: any = {
    ID: 0,
    CODE: '',
    VAT_NAME: '',

    VAT_PERC: null,

    CGST_PERC: null,
    CGST_INPUT_HEAD_ID: null,
    CGST_OUTPUT_HEAD_ID: null,

    SGST_PERC: null,
    SGST_INPUT_HEAD_ID: null,
    SGST_OUTPUT_HEAD_ID: null,

    IGST_PERC: null,
    IGST_INPUT_HEAD_ID: null,
    IGST_OUTPUT_HEAD_ID: null,
  };
  newVatclass = this.formVatclassData;
  selected_Company_id: any;
  ledgerList: any;
  companyState: any;
  companyStateID: any;
  HSNCODE: any;
  GST: any;
  constructor(private dataservice: DataService) {
    this.sessionDetails();
  }
  getNewVatclassData = () => ({ ...this.newVatclass });

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      console.log(userData.Configuration, 'CONFIGURATIONNNNNNNNNNN');
      const selectedCompany = userData?.SELECTED_COMPANY;
      console.log(userData, selectedCompany, 'USERDATAAAAAAAAAAAAAAAAA');
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      console.log(this.companyStateID, 'COMPANYSTATE');
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      this.formVatclassData.COMPANY_ID = selectedCompany.COMPANY_ID;
    }
    this.getLedgerCodeDropdown();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedData'] && changes['selectedData'].currentValue) {
      const data = changes['selectedData'].currentValue;
      console.log(data, 'dataaaaaaaaaaaaaaaaaaaaaaaaaa');
      this.formVatclassData = data;
      if (data.CGST_PERC && data.SGST_PERC) {
        this.formVatclassData.GST_PERC = data.CGST_PERC + data.SGST_PERC;
      }
      console.log(this.formVatclassData);
    }
  }

  getLedgerCodeDropdown() {
    this.dataservice.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  onGstChange(e: any) {
    const gst = e.value || 0;

    this.formVatclassData.CGST_PERC = gst / 2;
    this.formVatclassData.SGST_PERC = gst / 2;
    this.formVatclassData.IGST_PERC = gst;
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
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData')||'{}');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }
  UpdateData() {
    this.dataservice
      .updateVatclass(this.formVatclassData)
      .subscribe((response) => {
        console.log('Update Response:', response);
        this.formClosed.emit();
      });
  }

  // this.updateVatclass()

  closePopup() {
    this.formClosed.emit();
  }
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
    DxNumberBoxModule,
  ],
  declarations: [VatClassEditComponent],
  exports: [VatClassEditComponent],
})
export class VatClassEditModule {}
