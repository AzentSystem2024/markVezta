import { Component,NgModule,OnInit } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule, DxValidationGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.scss']
})
export class StateFormComponent implements OnInit {
  CountryDropdownData:any;
  formStateData = {
    STATE_NAME: '',
    COUNTRY_ID: ''
  };
  constructor(private service:DataService){}
  newState=this.formStateData;

  getNewStateData = () => ({ ...this.newState });


  getCountryDropDown() {

    this.service
      .getCountryData()
      .subscribe((data: any) => {
        this.CountryDropdownData = data;
        console.log('dropdown',this.CountryDropdownData);
      });
  }
  ngOnInit(): void {
    this.getCountryDropDown();
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
    DxValidatorModule,
  ],
  declarations: [StateFormComponent],
  exports: [StateFormComponent],
})
export class StateFormModule {}
