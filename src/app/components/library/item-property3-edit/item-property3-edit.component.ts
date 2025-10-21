import { Component,EventEmitter,Input,NgModule, Output, SimpleChanges } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxSelectBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property3-edit',
  templateUrl: './item-property3-edit.component.html',
  styleUrls: ['./item-property3-edit.component.scss']
})
export class ItemProperty3EditComponent {
       @Input() selectedData: any={}
      @Output() formClosed =new EventEmitter<void>()
    formItemProperty3Data = {
      ID:0,
      CODE: '',
      DESCRIPTION: '',
      COMPANY_ID: '1'
    };
    itemproperty3: any=[]
  
      constructor(private service: DataService) {}
            ngOnChanges(changes: SimpleChanges): void{
                  if (changes['selectedData'] && changes['selectedData'].currentValue) {
             const data = changes['selectedData'].currentValue;
         console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
            this.formItemProperty3Data=data
            console.log(this.formItemProperty3Data)
       
                }   
               }
    showItemProperty3(){
       this.service.getItemProperty3Data().subscribe(
        (response)=>{
              this.itemproperty3=response;
              console.log(response);
        }
       )
    }

               UpdateData(){
                const payload={
                  ...this.formItemProperty3Data
                }
                
                this.showItemProperty3()
    // Exclude the current record (by ID) from duplicate check
    const isCodeDuplicate = this.itemproperty3.some(
      (item: any) =>
        item.ID !== payload.ID &&
        item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
    );
  
    const isDescriptionDuplicate = this.itemproperty3.some(
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
  
                this.service.updateItemProperty3(payload).subscribe((res:any)=>{
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
    DxButtonModule
  ],
  declarations: [ItemProperty3EditComponent],
  exports: [ItemProperty3EditComponent],
   
})
export class ItemProperty3EditModule {}
