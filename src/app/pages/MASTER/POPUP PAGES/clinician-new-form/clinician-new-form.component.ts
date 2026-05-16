import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
  DxRadioGroupModule,
  DxValidatorComponent,
} from 'devextreme-angular';
import { FormTextboxModule, FormPhotoUploaderModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-clinician-new-form',
  templateUrl: './clinician-new-form.component.html',
  styleUrls: ['./clinician-new-form.component.scss'],
})
export class ClinicianNewFormComponent {
  @ViewChild('clinicianLicenseValidator')
  clinicianLicenseValidator!: DxValidatorComponent;
  @ViewChild('clinicianNameValidator')
  clinicianNameValidator!: DxValidatorComponent;

  @ViewChild('specialityValidator')
  specialityValidator!: DxValidatorComponent;

  @ViewChild('majorValidator')
  majorValidator!: DxValidatorComponent;

  newClinicianData = {
    iD: '',
    ClinicianLicense: '',
    ClinicianName: '',
    ClinicianShortName: '',
    SpecialityID: '',
    MajorID: '',
    ProfessionID: '',
    CategoryID: '',
    Gender: '',
    DepartmentID: '',
  };

  newClinician: any = this.newClinicianData;

  specialityDatasource: any;
  clinicianMajorDatasource: any;
  clinicianProfessionDatasource: any;
  clinicianCategoryDatasource: any;
  genderDatasource: any;
  departmentDatasource: any;
  cliniciansList: any;
  COMPANY_ID: any;

  constructor(private srvce: DataService) {
     
    this.get_DropDown_Data();
    this.getCliniciansData();
  }

  getnewClinicianData = () => {
    const licenseResult = this.clinicianLicenseValidator?.instance?.validate();
    const nameResult = this.clinicianNameValidator?.instance?.validate();

    if (licenseResult?.isValid && nameResult?.isValid) {
      return { ...this.newClinician };
    } else {
      return null;
    }
  };

  reset_newClinicianFormData() {
    this.newClinician.ClinicianLicense = '';
    this.newClinician.ClinicianName = '';
    this.newClinician.ClinicianShortName = '';
    this.newClinician.SpecialityID = '';
    ((this.newClinician.MajorID = ''), (this.newClinician.ProfessionID = ''));
    this.newClinician.CategoryID = '';
    this.newClinician.Gender = '';
  }

  get_DropDown_Data() {

    const savedUserData = sessionStorage.getItem('savedUserData');
    if (savedUserData) {
      const SELECTED_COMPANY = JSON.parse(savedUserData);
      const companyid = SELECTED_COMPANY.SELECTED_COMPANY;
       this.COMPANY_ID = companyid.COMPANY_ID;
    }

    this.srvce.Get_GropDown('SPECIALITY').subscribe((response: any) => {
      this.specialityDatasource = response;
    });

    this.srvce.Get_GropDown('CLINICIANMAJOR').subscribe((response: any) => {
      this.clinicianMajorDatasource = response;
    });

    this.srvce
      .Get_GropDown('CLINICIANPROFESSION')
      .subscribe((response: any) => {
        this.clinicianProfessionDatasource = response;
      });

    this.srvce.Get_GropDown('CLINICIANCATEGORY').subscribe((response: any) => {
      this.clinicianCategoryDatasource = response;
    });

    this.srvce.Get_GropDown('GENDER').subscribe((response: any) => {
      this.genderDatasource = response;
    });

    const dept_payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.COMPANY_ID || 1,
    };
    this.srvce.getDropdownData(dept_payload).subscribe((data) => {
      this.departmentDatasource = data;
    });
  }

  checkClinicianLicenseExists = (e: any): boolean => {
    const clinicianLicense = e.value;
    const exists = this.cliniciansList.some(
      (clinician: any) => clinician.ClinicianLicense === clinicianLicense,
    );
    // If it exists, mark as invalid and set the error message
    if (exists) {
      e.isValid = false; // Mark as invalid
      e.message = 'Clinician License already exists'; // Set the error message
    } else {
      e.isValid = true; // Mark as valid
    }

    return e.isValid;
  };

  onFacilityLicenseInput(event: Event): void {
    const target = event.target as HTMLInputElement;

    // Remove spaces from the current value and sanitize it
    const sanitizedValue = target.value.replace(/\s/g, '').toUpperCase();

    // Check if the first character is an alphabet
    if (sanitizedValue.length > 0) {
      // Update the target value and the LoginName property
      target.value = sanitizedValue;
      this.newClinician.ClinicianLicense = sanitizedValue; // Update the login name value

      // Validate the login name directly
      this.checkClinicianLicenseExists({ value: sanitizedValue });
    } else {
      // If the first character is not an alphabet, reset the input
      target.value = ''; // Optionally clear the input
      this.newClinician.ClinicianLicense = ''; // Reset the login name value
    }
  }

  getCliniciansData() {
    this.srvce.get_Clinian_Table_Data().subscribe((res: any) => {
      this.cliniciansList = res.data||[];
      console.log('datasource', this.cliniciansList);
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
    DxRadioGroupModule,
    DxTextBoxModule,
  ],
  declarations: [ClinicianNewFormComponent],
  exports: [ClinicianNewFormComponent],
})
export class ClinicianNewFormModule {}
