import { Component, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxButtonModule, DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
// import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-item-property1-edit',
  templateUrl: './item-property1-edit.component.html',
  styleUrls: ['./item-property1-edit.component.scss']
})
export class ItemProperty1EditComponent {
        @ViewChild('departmentValidationGroup', { static: false })
      validationGroup!: DxValidationGroupComponent;

     @Input() selectedData: any={}
    @Output() formClosed =new EventEmitter<void>()
  formItemProperty1Data = {
    ID:0,
    CODE: '',
    DESCRIPTION: '',
    COMPANY_ID: '1'
  };
  itemproperty1: any=[]

    constructor(private service: DataService) {}
          ngOnChanges(changes: SimpleChanges): void{
                if (changes['selectedData'] && changes['selectedData'].currentValue) {
           const data = changes['selectedData'].currentValue;
       console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
          this.formItemProperty1Data=data
          console.log(this.formItemProperty1Data)
     
              }   
             }
  showItemProperty1(){
     this.service.getItemProperty1Data().subscribe(
      (response)=>{
            this.itemproperty1=response;
            console.log(response);
            // console.log('item label',this.itemlabel);
      }
     )
  }

             UpdateData(){
                        const result = this.validationGroup.instance.validate();
  if (!result.isValid) {
    return;
  }
              const payload={
                ...this.formItemProperty1Data
              }
               this.service.getItemProperty1Data().subscribe(
      (response)=>{
            this.itemproperty1=response;
            console.log(response);
              
              // this.showItemProperty1()
            
  // Exclude the current record (by ID) from duplicate check
  const isCodeDuplicate = this.itemproperty1.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
  );

  const isDescriptionDuplicate = this.itemproperty1.some(
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

    this.service.updateItemProperty1(payload).subscribe((res:any)=>{
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
    DxButtonModule,
    DxValidationGroupModule,

  ],
  declarations: [ItemProperty1EditComponent],
  exports: [ItemProperty1EditComponent],
   
})
export class ItemProperty1EditModule {}
