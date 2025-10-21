import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxTextBoxModule,
  DxFormModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormTextboxModule, FormPhotoUploaderModule } from 'src/app/components';
import { getSizeQualifier } from 'src/app/services/screen.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import { DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';

interface dropdownData {
  ID: number;
  DESCRIPTION: string;
}

@Component({
  selector: 'contact-new-form',
  templateUrl: './denial-new-form.component.html',
  providers: [DataService],
})
export class DenialNewFormComponent {
  newDenialData = {
    iD: '',
    CODE: '',
    DESCRIPTION: '',
    TYPE_ID: '',
    CATEGORY_ID: '',
    CATEGORY_NAME: '',
    TYPE_NAME: '',
  };

  newDenial = this.newDenialData;
  Denial_Type_DropDownData: dropdownData[];
  Denial_Category_DropDownData: dropdownData[];
  getSizeQualifier = getSizeQualifier;

  constructor(private fb: FormBuilder, private service: DataService) {
    this.getDenial_Type_DropDown();
    this.getDenial_Category_DropDown()
  }

  // ngOnInit(): void {
  //   this.getDenial_Type_DropDown();
  // }

  getNewDenialData = () => ({ ...this.newDenial });

  //=============Get Denial Type Drop dwn Data==============================
  getDenial_Type_DropDown() {
    let dropdownType = 'DENIALTYPE';
    this.service
      .get_Denial_Dropdown_Data(dropdownType)
      .subscribe((data: any) => {
        this.Denial_Type_DropDownData = data;
        // console.log('drop down dataaaaaaaaa', this.Denial_Type_DropDownData);
      });
  }

  //=============Get Denial Type Drop dwn Data==============================
  getDenial_Category_DropDown() {
    const dropdowncategory = 'DENIALCATEGORY';
    this.service
      .get_Denial_Dropdown_Data(dropdowncategory)
      .subscribe((data: any) => {
        this.Denial_Category_DropDownData = data;
        // console.log(
        //   'drop down category dataaaaaaaaa',
        //   this.Denial_Category_DropDownData
        // );
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
  ],
  declarations: [DenialNewFormComponent],
  exports: [DenialNewFormComponent],
})
export class DenialNewFormModule {}
