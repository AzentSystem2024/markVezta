import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-class-form',
  templateUrl: './vat-class-form.component.html',
  styleUrls: ['./vat-class-form.component.scss'],
})
export class VatClassFormComponent {
  @ViewChild('vatValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  formVatclassData: any = {
    COMPANY_ID: null,
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
  ledgerList: any;
  newVatclass = this.formVatclassData;
  getNewVatclassData = () => ({ ...this.newVatclass });
  router: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  companyState: any;
  companyStateID: any;
  HSNCODE: any;
  GST: any;
  selectedCompanyId: any;
  companyList: any[] | undefined;
  creditFormData: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      this.formVatclassData.COMPANY_ID = selectedCompany.COMPANY_ID;
    }
    this.getLedgerCodeDropdown();
  }
  formatAsDDMMYYYY(arg0: Date): any {
    throw new Error('Method not implemented.');
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  onGstChange(e: any) {
    const gst = e.value;

    if (gst) {
      // CGST + SGST split
      this.newVatclass.CGST_PERC = gst / 2;
      this.newVatclass.SGST_PERC = gst / 2;

      // IGST full
      this.newVatclass.IGST_PERC = gst;
    } else {
      this.newVatclass.CGST_PERC = null;
      this.newVatclass.SGST_PERC = null;
      this.newVatclass.IGST_PERC = null;
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

  resetForm() {
    this.newVatclass = {
      COMPANY_ID: this.formVatclassData.COMPANY_ID,
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

    if (this.validationGroup) {
      this.validationGroup.instance.reset();
    }
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
    DxNumberBoxModule,
    DxValidationGroupModule,
  ],
  declarations: [VatClassFormComponent],
  exports: [VatClassFormComponent],
})
export class VatClassFormModule {}
