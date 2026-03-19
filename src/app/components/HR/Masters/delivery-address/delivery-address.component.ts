import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.component.html',
  styleUrls: ['./delivery-address.component.scss']
})
export class DeliveryAddressComponent {
       @ViewChild(DxDataGridComponent, { static: true })
       dataGrid: DxDataGridComponent;
        @ViewChild('formValidationGroup') formValidationGroup: DxValidationGroupComponent;
     
        readonly allowedPageSizes: any = [5, 10, 'all'];
       displayMode: any = 'full';
       showPageSizeSelector = true;
       AddDeliveryAddressPopup = false;
       UpdateDeliveryAddressPopup = false;
           isFilterRowVisible: boolean = false;
      isFilterOpened = false;
       editingRowData: any = {}; 
       Datasource: any[];
       showFilterRow: boolean = true;
       currentFilter: string = 'auto';
         canAdd = false;
       canEdit = false;
       canView = false;
       canDelete = false;
       canApprove = false;
       canPrint = false;
     
       
       formsource: any;
       selectedData: any;

         constructor(private fb:FormBuilder,private dataservice : DataService , private router : Router,private ngZone: NgZone, private cdr: ChangeDetectorRef,){
           this.formsource = this.fb.group({
             Address1 : ['',Validators.required],
             Address2 : ['',Validators.required],
             Address3 : ['', Validators.required],
             Location : ['', Validators.required],
             Mobile : ['', Validators.required],
             Phone : ['', Validators.required],
             Inactive :[false]
           })   
           this.get_DeliveryAddress_List()
         }
         

               toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addDeliveryAddress());
    },
    
    elementAttr: { class: 'add-button' },    
  };

     refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

      refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
        this.get_DeliveryAddress_List();
    }
        }

     addDeliveryAddress(){
      this.AddDeliveryAddressPopup = true;
       setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
     }

       editDeliveryAddress(){
    this.UpdateDeliveryAddressPopup= true
  }

    getSerialNumber = (rowIndex: number) => {
  return rowIndex + 1;
};

 statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`

    // Determine background color and display text based on the status
    const color = status === 'Inactive' ? 'red' : 'green';
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
      <span style="
        background-color: ${color};
        color: white;
        padding: 2px 3px;
        border-radius: 5px;
        display: inline-block;
        text-align: center;
        min-width: 60px;"
      >
        ${text}
      </span>`;
  };

 getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

 ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)
  .find(menu => menu.Path === '/delivery-address');

if (packingRights) {
  this.canAdd = packingRights.CanAdd;
  this.canEdit = packingRights.CanEdit;
  this.canDelete = packingRights.CanDelete;
    this.canPrint = packingRights.CanEdit;
  this.canView = packingRights.canView;
   this.canApprove = packingRights.canApprove;
}

console.log('packingRights',packingRights);
console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

  }
      onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data }; // Store the selected row data
  this.UpdateDeliveryAddressPopup=true;
  this.Select_DeliveryAddress(event)
      }

      Select_DeliveryAddress(event:any){
  const ID = event.data.ID

  this.dataservice.Select_DeliveryAddress_Api(ID).subscribe((response:any)=>{
    console.log(response,"select Api");
    this.selectedData = response
    console.log(this.selectedData)
  })
}

       get_DeliveryAddress_List() {
  // this.isLoading = true;
  this.dataservice.get_DeliveryAddress_Api().subscribe((res: any) => {
    console.log(res[0],"delivery address list api");
    if (res) {
      this.Datasource = res.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}

      addData(){
        const validationResult = this.formValidationGroup?.instance?.validate();
    const address1 = this.formsource.get('Address1')?.value;
    const address2 = this.formsource.get('Address2')?.value;
    const address3 = this.formsource.get('Address3')?.value;
    const location = this.formsource.get('Location')?.value;
    const mobile = this.formsource.get('Mobile')?.value;
    const phone = this.formsource.get('Phone')?.value;
    const isinactive = this.formsource.get('Inactive')?.value;
    console.log(address1,address2,address3,location,mobile,phone,isinactive);
    
    const payload ={
      ADDRESS1 : address1,
      ADDRESS2 : address2,
      ADDRESS3 : address3,
      LOCATION : location,
      MOBILE : mobile,
      PHONE : phone,
      IS_INACTIVE : isinactive
      
    }

     if(address1 && address2 && address3 && location && mobile && phone){
          this.dataservice.Insert_DeliveryAddress_Api(payload).subscribe((res:any)=>{
                notify(
              {
                message: 'Data succesfully added',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
               this.AddDeliveryAddressPopup = false
               this.formsource.reset()
              this.get_DeliveryAddress_List()
               this.UpdateDeliveryAddressPopup = false
          })
         }

      }

      editData(){
        const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID
    const address1 = this.editingRowData.ADDRESS1
    const address2 = this.editingRowData.ADDRESS2
    const address3 = this.editingRowData.ADDRESS3
    const location = this.editingRowData.LOCATION
    const mobile = this.editingRowData.MOBILE
    const phone = this.editingRowData.PHONE
    const isinactive = this.editingRowData.IS_INACTIVE
    console.log(address1,address2,address3,location,mobile,phone,isinactive);
    
    if(address1 && address2 && address3 && location && mobile && phone){
          this.dataservice.Update_DeliveryAddress_Api(Id,address1,address2,address3,location,mobile,phone,isinactive).subscribe((res:any)=>{
                notify(
              {
                message: 'Data succesfully updated',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
            
               this.formsource.reset()
               this.get_DeliveryAddress_List()
               this.UpdateDeliveryAddressPopup = false
          })
         }
      }

     delete_Data(event: any) {
        const Id = event.data.ID
      this.dataservice.Delete_DeliveryAddress_Api(Id).subscribe((response:any)=>{
        notify(
              {
                message: 'Data succesfully deleted',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
        console.log(response,"deleted")
      })
      }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule
  ],
  providers: [],
  exports: [],
  declarations: [DeliveryAddressComponent],
})
export class DeliveryAddressModule{}
