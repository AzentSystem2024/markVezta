import { Component, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxNumberBoxModule, DxSelectBoxModule } from 'devextreme-angular';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-calss-finance-form',
  templateUrl: './vat-calss-finance-form.component.html',
  styleUrls: ['./vat-calss-finance-form.component.scss'],
})
export class VatCalssFinanceFormComponent {
  vatClass:any;
  companyID:any;
  formVatclassData:any = {
    CODE: '',
    VAT_NAME: '',
    VAT_PERC: '',
    IGST_INPUT_HEAD_ID: '',
    IGST_OUTPUT_HEAD_ID: '',
    // COMPANY_ID: 0,
  };

  newVatclass = this.formVatclassData;
  ledgerList: any[] = [];

  constructor(private dataservice: DataService) {
    this.getLedgerCodeDropdown();
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.showVatclass();
  }

  getLedgerCodeDropdown() {
    this.dataservice.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
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

  getNewVatclassData = () => ({ ...this.newVatclass });

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

  validateVatClassCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.vatClass?.length) return true;


    return !this.vatClass.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value;
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
    DxNumberBoxModule
  ],
  declarations: [VatCalssFinanceFormComponent],
  exports: [VatCalssFinanceFormComponent],
})
export class VatCalssFinanceFormModule {}
