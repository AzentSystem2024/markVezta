import { Component,EventEmitter,Input,NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxSelectBoxModule, DxValidationGroupComponent } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property4-edit',
  templateUrl: './item-property4-edit.component.html',
  styleUrls: ['./item-property4-edit.component.scss']
})
export class ItemProperty4EditComponent {

        @ViewChild('departmentValidationGroup', { static: false })
      validationGroup!: DxValidationGroupComponent;

     @Input() selectedData: any={}
    @Output() formClosed =new EventEmitter<void>()
  formItemProperty4Data = {
    ID:0,
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  itemproperty4: any=[]
  // itemproperty4: any;

    constructor(private service: DataService) {}
          ngOnChanges(changes: SimpleChanges): void{
                if (changes['selectedData'] && changes['selectedData'].currentValue) {
           const data = changes['selectedData'].currentValue;
       console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
          this.formItemProperty4Data=data
          console.log(this.formItemProperty4Data)
     
              }   
             }
  showItemProperty1(){
     this.service.getItemProperty4Data().subscribe(
      (response)=>{
            this.itemproperty4=response;
            console.log(response);
        
      }
     )
  }

             UpdateData(){
  //                       const result = this.validationGroup.instance.validate();
  // if (!result.isValid) {
  //   return;
  // }
              const payload={
                ...this.formItemProperty4Data
              }
               this.service.getItemProperty4Data().subscribe(
      (response)=>{
            this.itemproperty4=response;
            console.log(response);
              
              // this.showItemProperty1()
            
  // Exclude the current record (by ID) from duplicate check
  const isCodeDuplicate = this.itemproperty4.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
  );

  const isDescriptionDuplicate = this.itemproperty4.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.DESCRIPTION?.toLowerCase().trim() === payload.DESCRIPTION?.toLowerCase().trim()
  );

  console.log(isCodeDuplicate,isDescriptionDuplicate)
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

    this.service.updateItemProperty4(payload).subscribe((res:any)=>{
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
     )
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
    DxButtonModule
  ],
  declarations: [ItemProperty4EditComponent],
  exports: [ItemProperty4EditComponent],
   
})
export class ItemProperty4EditModule {}
