import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidatorModule } from 'devextreme-angular';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-vat-class-edit',
  templateUrl: './vat-class-edit.component.html',
  styleUrls: ['./vat-class-edit.component.scss']
})
export class VatClassEditComponent {
          @ViewChild('departmentValidationGroup', { static: false })
        validationGroup!: DxValidationGroupComponent;
  
       @Input() selectedData: any={}
      @Output() formClosed =new EventEmitter<void>()
  formVatclassData = {
    ID:0,
    CODE: '',
    VAT_NAME: '',
    VAT_PERC: ''
  };
  newVatclass=this.formVatclassData;
  constructor(private dataservice:DataService
    ){}
  getNewVatclassData = () => ({ ...this.newVatclass });
  ngOnChanges(changes: SimpleChanges): void{
                if (changes['selectedData'] && changes['selectedData'].currentValue) {
           const data = changes['selectedData'].currentValue;
       console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
          this.formVatclassData=data
          console.log(this.formVatclassData)
     
              }   
             }
  keyPressCode(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
  
    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if ((charCode >= 65 && charCode <= 90) || // A-Z
        (charCode >= 97 && charCode <= 122) || // a-z
        (charCode >= 48 && charCode <= 57)) { // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressVatname(event: any) {
    console.log('key pressed');
    var charCode = (event.which) ? event.which : event.keyCode;
    var inputValue = event.target.value;

  // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
    event.preventDefault();
    return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) || (charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  UpdateData(){
      const { ID,CODE,VAT_NAME,VAT_PERC } =this.formVatclassData
    this.dataservice.updateVatclass(ID,CODE,VAT_NAME,VAT_PERC).subscribe(response=>{
      console.log(response)
    })
  }

    // this.updateVatclass()

  
  closePopup(){
    this.formClosed.emit()
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
    DxButtonModule
  ],
  declarations: [VatClassEditComponent],
  exports: [VatClassEditComponent],
})
export class VatClassEditModule {}
