import { Component,EventEmitter,Input,NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxSelectBoxModule, DxValidationGroupComponent, DxValidationGroupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property2-edit',
  templateUrl: './item-property2-edit.component.html',
  styleUrls: ['./item-property2-edit.component.scss']
})
export class ItemProperty2EditComponent {
      @ViewChild('departmentValidationGroup', { static: false })
    validationGroup!: DxValidationGroupComponent;
     @Input() selectedData: any={}
    @Output() formClosed =new EventEmitter<void>()
  formItemProperty2Data = {
    ID:0,
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  itemproperty2: any=[]

    constructor(private service: DataService) {}
          ngOnChanges(changes: SimpleChanges): void{
                if (changes['selectedData'] && changes['selectedData'].currentValue) {
           const data = changes['selectedData'].currentValue;
       console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
          this.formItemProperty2Data=data
          console.log(this.formItemProperty2Data)
     
              }   
             }
  showItemProperty2(){
              
     this.service.getItemProperty2Data().subscribe(
      (response)=>{
            this.itemproperty2=response;
            console.log(response);
      }
     )
  }
             UpdateData(){
              const result = this.validationGroup.instance.validate();
  if (!result.isValid) {
    return;
  }
              const payload={
                ...this.formItemProperty2Data
              }
              
              this.showItemProperty2()
  // Exclude the current record (by ID) from duplicate check
  const isCodeDuplicate = this.itemproperty2.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
  );

  const isDescriptionDuplicate = this.itemproperty2.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.DESCRIPTION?.toLowerCase().trim() === payload.DESCRIPTION?.toLowerCase().trim()
  );

  if (isCodeDuplicate && isDescriptionDuplicate) {
    notify(
      {
        message: "Both Code and Description already exist",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  } else if (isCodeDuplicate) {
    notify(
      {
        message: "This Code already exists",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  } else if (isDescriptionDuplicate) {
    notify(
      {
        message: "This Description already exists",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  }

              this.service.updateItemProperty2(payload).subscribe((res:any)=>{
                  console.log(res)
                  this.formClosed.emit()
                    notify(
      {
        message: "Data updated successfully",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "success"
    );

              })
             }

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
    DxButtonModule,
    DxValidationGroupModule
  ],
  declarations: [ItemProperty2EditComponent],
  exports: [ItemProperty2EditComponent],
   
})
export class ItemProperty2EditModule {}
