import { Component, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { AsyncRule } from 'devextreme-angular/common';
import { DxValidationGroupModule } from 'devextreme-angular/ui/validation-group';
import Validator from 'devextreme/ui/validator';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-country-form',
  templateUrl: './country-form.component.html',
  styleUrls: ['./country-form.component.scss'],
})
export class CountryFormComponent {
  country: any;
  isEditing:boolean
  formCountryData = {
    CODE: '',
    COUNTRY_NAME: '',
 
  COMPANY_ID:0

  };
  userID: any;
  companyID: any;
  finID: any;

  constructor(dataservice: DataService) {
    dataservice.getCountryData().subscribe((response) => {
      this.country = response;
    });
  }

    session_Data(){
        const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
  }

  newCountry = this.formCountryData;

  getNewCountryData = () => ({ ...this.newCountry ,
    COMPANY_ID:this.companyID
  });

  keyPressNumbers(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  keyPressCountry(event: any) {
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
  checkCountryCode(e) {
    return new Promise((resolve, reject) => {
      const codeExists = this.country.some(
        (country) => country.CODE === e.value
      );
      if (codeExists) {
        resolve(false); // Validation failed
      } else {
        resolve(true); // Validation passed
      }
    });
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
    DxValidationGroupModule,
    
  ],
  declarations: [CountryFormComponent],
  exports: [CountryFormComponent],
})
export class CountryFormModule {}
