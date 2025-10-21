import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { ItemProperty3EditModule } from 'src/app/components/library/item-property3-edit/item-property3-edit.component';
import { ItemProperty3FormComponent, ItemProperty3FormModule } from 'src/app/components/library/item-property3-form/item-property3-form.component';
import { AuthService, DataService } from 'src/app/services';

@Component({
  selector: 'app-item-property3',
  templateUrl: './item-property3.component.html',
  styleUrls: ['./item-property3.component.scss']
})
export class ItemProperty3Component {
  @ViewChild(ItemProperty3FormComponent) ItemProperty3FormComponent: ItemProperty3FormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  itemproperty3:any;
  isItemProperty3PopupOpened=false;
  itemlabel:any;
  isFilterRowVisible: boolean = false;
    sessionData : any;
  ITEM_PROPERTY1 : any;
  ITEM_PROPERTY2 : any;
  ITEM_PROPERTY3 : any;
  ITEM_PROPERTY4 : any;
  ITEM_PROPERTY5 : any;
  isEditItemProperty3PopupOpened:boolean=false
  selected_data: any;
  constructor(private dataservice:DataService,authservice:AuthService,private ngZone: NgZone,private cdr: ChangeDetectorRef){
    this.itemlabel=authservice.getsettingsData().ITEM_PROPERTY3;

    this.sesstion_Details()
  }
  
      sesstion_Details(){
     this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')

    this.ITEM_PROPERTY1=this.sessionData.GeneralSettings.ITEM_PROPERTY1
    console.log(this.ITEM_PROPERTY1,'============ITEM_PROPERTY1==============')

    this.ITEM_PROPERTY2=this.sessionData.GeneralSettings.ITEM_PROPERTY2
    console.log(this.ITEM_PROPERTY2,'============ITEM_PROPERTY2==============')

    this.ITEM_PROPERTY3=this.sessionData.GeneralSettings.ITEM_PROPERTY3
    console.log(this.ITEM_PROPERTY3,'============ITEM_PROPERTY3==============')

    this.ITEM_PROPERTY4=this.sessionData.GeneralSettings.ITEM_PROPERTY4
    console.log(this.ITEM_PROPERTY4,'============ITEM_PROPERTY4==============')

    this.ITEM_PROPERTY5=this.sessionData.GeneralSettings.ITEM_PROPERTY5
    console.log(this.ITEM_PROPERTY5,'============ITEM_PROPERTY5==============')


}
OnEditingStartItem(e:any){
    e.cancel=true
    this.isEditItemProperty3PopupOpened=true
    const id=e.data.ID
    this.dataservice.select_item_property3(id).subscribe((res:any)=>{
      this.selected_data=res
    })
  

}
handleClose(){
  this.isItemProperty3PopupOpened=false
  this.isEditItemProperty3PopupOpened=false
  this.listItemProperty3()
}
  ngOnInit(){
    this.listItemProperty3()
  }

  addItemProperty3(){
    this.isItemProperty3PopupOpened=true;
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
      this.ngZone.run(() => this.addItemProperty3());
    },
    
    elementAttr: { class: 'add-button' },    
  };

  listItemProperty3(){
    this.dataservice.getItemProperty3Data().subscribe(
     (response)=>{
           this.itemproperty3=response;
     }
    )
 }
 onClickSaveItemProperty3(){
  const { CODE, DESCRIPTION, COMPANY_ID } =this.ItemProperty3FormComponent.getNewItemProperty3Data();
   const isCodeDuplicate = this.itemproperty3.some(
        // (item: any) => item.CODE === commonDetails.code
          (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
      );
  
      const isDescriptionDuplicate = this.itemproperty3.some(
        // (item: any) => item.DESCRIPTION === commonDetails.category
              (item: any) =>
      item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase()
      );
  
      
  
      if (isCodeDuplicate && isDescriptionDuplicate) {
        notify(
          {
            message: 'Both Code and category already exist',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error'
        );
        return;
      } else if (isCodeDuplicate) {
        notify(
          {
            message: 'This Code already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error'
        );
        return;
      } else if (isDescriptionDuplicate) {
        notify(
          {
            message: 'This Description already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error'
        );
        return;
      }
  this.dataservice.insertItemProperty3Data(CODE,DESCRIPTION,COMPANY_ID).subscribe(
    (response)=>{
      if(response){
        this.listItemProperty3();
           notify(
          {
            message: 'Insert operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.isItemProperty3PopupOpened=false
      }
    }
  )
 }
 onRowRemoving(event) {
  const selectedRow = event.data;
  const { ID, CODE, DESCRIPTION, COMPANY_ID } = selectedRow;
  
  this.dataservice.removeItemProperty3(ID, CODE, DESCRIPTION, COMPANY_ID).subscribe(() => {
    try {
      // Your delete logic here
      notify(
        {
          message: 'Delete operation successful',
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );
      this.dataGrid.instance.refresh();
      this.listItemProperty3();
    } catch (error) {
      notify(
        {
          message: 'Delete operation failed',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
    }
  });
}
  refresh(){
      this.dataGrid.instance.refresh();
      this.listItemProperty3();

  }

}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,DxPopupModule,CommonModule,ItemProperty3FormModule,ItemProperty3EditModule
  ],
  providers: [],
  exports: [],
  declarations: [ItemProperty3Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemProperty3Module{}